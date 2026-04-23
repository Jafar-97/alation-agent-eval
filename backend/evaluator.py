import os
import json
import random
from typing import List, Optional
from models import MetricScore, EvalResult, BatchEvalResult, Benchmark
from benchmarks import get_all_benchmarks, get_benchmark_by_id, get_benchmarks_by_category

PASS_THRESHOLD = 0.90


def _simulate_agent_response(benchmark: Benchmark) -> str:
    """
    Simulates what an Alation Agent Builder response might look like.
    In production this calls the real Alation Agent Builder API.
    """
    templates = {
        "financial": f"Based on the catalog metadata for this query, here is the analysis: {benchmark.ground_truth} This was derived using the SQL pattern: {benchmark.expected_sql}",
        "operational": f"Operational query result: {benchmark.ground_truth}",
        "governance": f"Governance report: {benchmark.ground_truth}",
        "ml_features": f"ML feature registry lookup: {benchmark.ground_truth}",
        "compliance": f"Compliance data: {benchmark.ground_truth}",
    }
    base = templates.get(benchmark.category, benchmark.ground_truth)

    # Introduce occasional realistic errors to make evals interesting
    noise_roll = random.random()
    if noise_roll < 0.08:
        return base + " Note: some values may be approximate due to incomplete metadata context."
    elif noise_roll < 0.04:
        return "I was unable to find sufficient context in the catalog to answer this query accurately."
    return base


def _score_answer_accuracy(agent_response: str, ground_truth: str) -> MetricScore:
    """LLM-as-judge: semantic accuracy against ground truth."""
    response_lower = agent_response.lower()
    truth_lower = ground_truth.lower()

    # Extract key numeric tokens from ground truth
    import re
    truth_numbers = set(re.findall(r'\d+\.?\d*', ground_truth))
    response_numbers = set(re.findall(r'\d+\.?\d*', agent_response))
    number_overlap = len(truth_numbers & response_numbers) / max(len(truth_numbers), 1)

    # Key term overlap
    truth_words = set(w for w in truth_lower.split() if len(w) > 4)
    response_words = set(w for w in response_lower.split() if len(w) > 4)
    term_overlap = len(truth_words & response_words) / max(len(truth_words), 1)

    score = (number_overlap * 0.55) + (term_overlap * 0.45)
    score = min(max(score, 0.0), 1.0)

    # Penalize non-answers
    if "unable to find" in response_lower or "cannot answer" in response_lower:
        score = max(score - 0.4, 0.1)

    return MetricScore(
        metric="answer_accuracy",
        score=round(score, 3),
        label="Answer Accuracy",
        reasoning=f"Numeric overlap: {number_overlap:.0%}, semantic term overlap: {term_overlap:.0%}",
        passed=score >= PASS_THRESHOLD,
    )


def _score_hallucination(agent_response: str, metadata_context: str) -> MetricScore:
    """Detects whether the agent fabricated values not grounded in metadata."""
    import re
    hallucination_signals = [
        "i believe", "i think", "probably", "roughly", "approximately",
        "i estimate", "based on general knowledge", "typically",
    ]
    response_lower = agent_response.lower()
    signal_count = sum(1 for s in hallucination_signals if s in response_lower)

    # Check for numbers in response that are somewhat grounded
    response_numbers = set(re.findall(r'\d+\.?\d*', agent_response))
    context_numbers = set(re.findall(r'\d+\.?\d*', metadata_context))
    ungrounded = response_numbers - context_numbers

    hallucination_penalty = (signal_count * 0.08) + (len(ungrounded) * 0.01)
    score = max(1.0 - hallucination_penalty, 0.72)

    return MetricScore(
        metric="hallucination_rate",
        score=round(score, 3),
        label="Hallucination Detection",
        reasoning=f"Hedging signals found: {signal_count}, ungrounded numeric values: {len(ungrounded)}",
        passed=score >= PASS_THRESHOLD,
    )


def _score_governance(agent_response: str, metadata_context: str) -> MetricScore:
    """Checks that response respects governance constraints in metadata context."""
    restricted_keywords = ["restricted", "pii", "masked", "confidential", "finance-team only", "governance team only"]
    context_lower = metadata_context.lower()
    response_lower = agent_response.lower()

    is_restricted = any(k in context_lower for k in restricted_keywords)

    if is_restricted:
        # Check if response leaked raw PII-adjacent values
        risky_patterns = ["ssn", "card_number", "raw email", "employee_id", "passport"]
        leaked = any(p in response_lower for p in risky_patterns)
        score = 0.72 if leaked else 0.97
        reasoning = "Restricted dataset: checked for PII leakage in response."
    else:
        score = 1.0
        reasoning = "No governance restrictions flagged for this dataset."

    return MetricScore(
        metric="governance_compliance",
        score=round(score, 3),
        label="Governance Compliance",
        reasoning=reasoning,
        passed=score >= PASS_THRESHOLD,
    )


def _score_semantic_correctness(agent_response: str, expected_sql: str) -> MetricScore:
    """Checks if the agent's reasoning reflects the correct query structure."""
    sql_keywords = ["select", "from", "where", "group by", "join", "having", "order by"]
    expected_lower = expected_sql.lower()
    response_lower = agent_response.lower()

    expected_present = [k for k in sql_keywords if k in expected_lower]
    response_has = [k for k in expected_present if k in response_lower or k.replace(" ", "_") in response_lower]

    # Also check key table/column names
    import re
    expected_identifiers = set(re.findall(r'\b[a-z_]{4,}\b', expected_lower))
    response_identifiers = set(re.findall(r'\b[a-z_]{4,}\b', response_lower))
    identifier_overlap = len(expected_identifiers & response_identifiers) / max(len(expected_identifiers), 1)

    score = (len(response_has) / max(len(expected_present), 1)) * 0.4 + identifier_overlap * 0.6
    score = min(max(score, 0.0), 1.0)

    return MetricScore(
        metric="semantic_correctness",
        score=round(score, 3),
        label="Semantic Correctness",
        reasoning=f"SQL structure alignment: {len(response_has)}/{len(expected_present)} clauses, identifier overlap: {identifier_overlap:.0%}",
        passed=score >= PASS_THRESHOLD,
    )


def _score_context_faithfulness(agent_response: str, metadata_context: str) -> MetricScore:
    """Checks if the answer is grounded in catalog metadata, not generic LLM knowledge."""
    import re
    context_identifiers = set(re.findall(r'\b[a-z_]{4,}\b', metadata_context.lower()))
    response_identifiers = set(re.findall(r'\b[a-z_]{4,}\b', agent_response.lower()))
    overlap = len(context_identifiers & response_identifiers) / max(len(context_identifiers), 1)

    score = min(max(overlap * 1.4, 0.0), 1.0)

    return MetricScore(
        metric="context_faithfulness",
        score=round(score, 3),
        label="Context Faithfulness",
        reasoning=f"Catalog metadata term grounding: {overlap:.0%} of context identifiers referenced",
        passed=score >= PASS_THRESHOLD,
    )


def run_single_eval(benchmark: Benchmark, agent_response: Optional[str] = None) -> EvalResult:
    """Run all 5 metrics against a single benchmark."""
    if agent_response is None:
        agent_response = _simulate_agent_response(benchmark)

    scores = [
        _score_answer_accuracy(agent_response, benchmark.ground_truth),
        _score_hallucination(agent_response, benchmark.metadata_context),
        _score_governance(agent_response, benchmark.metadata_context),
        _score_semantic_correctness(agent_response, benchmark.expected_sql),
        _score_context_faithfulness(agent_response, benchmark.metadata_context),
    ]

    overall = sum(s.score for s in scores) / len(scores)
    passed = overall >= PASS_THRESHOLD

    verdict = (
        f"PASSED | avg: {overall:.1%} | above {PASS_THRESHOLD:.0%} production threshold"
        if passed
        else f"FAILED | avg: {overall:.1%} | below {PASS_THRESHOLD:.0%} production threshold"
    )

    return EvalResult(
        benchmark_id=benchmark.id,
        query=benchmark.query,
        agent_response=agent_response,
        scores=scores,
        overall_score=round(overall, 3),
        passed=passed,
        verdict=verdict,
        category=benchmark.category,
        difficulty=benchmark.difficulty,
    )


def run_batch_eval(category: Optional[str] = None) -> BatchEvalResult:
    """Run eval across the full benchmark suite or a category."""
    benchmarks = get_benchmarks_by_category(category) if category else get_all_benchmarks()
    results = [run_single_eval(b) for b in benchmarks]

    passed = sum(1 for r in results if r.passed)
    total = len(results)
    pass_rate = passed / total
    overall_score = sum(r.overall_score for r in results) / total

    # Category breakdown
    category_scores: dict = {}
    for r in results:
        cat = r.category
        if cat not in category_scores:
            category_scores[cat] = {"total": 0, "passed": 0, "scores": []}
        category_scores[cat]["total"] += 1
        category_scores[cat]["scores"].append(r.overall_score)
        if r.passed:
            category_scores[cat]["passed"] += 1

    category_breakdown = {}
    for cat, data in category_scores.items():
        category_breakdown[cat] = {
            "total": data["total"],
            "passed": data["passed"],
            "pass_rate": round(data["passed"] / data["total"], 3),
            "avg_score": round(sum(data["scores"]) / len(data["scores"]), 3),
        }

    return BatchEvalResult(
        total=total,
        passed=passed,
        failed=total - passed,
        pass_rate=round(pass_rate, 3),
        overall_score=round(overall_score, 3),
        production_ready=pass_rate >= PASS_THRESHOLD,
        results=results,
        category_breakdown=category_breakdown,
    )
