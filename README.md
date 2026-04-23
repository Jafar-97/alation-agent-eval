# alation-agent-eval

An LLM evaluation framework for Alation Agent Builder, benchmarking structured data query agents across accuracy, hallucination rate, governance compliance, and semantic correctness.

Built after reading Deepesh Chourey (SVP Engineering, Alation) publicly state:

> "Evaluations are not just a feature, they are a differentiator between a demo that looks promising and an enterprise-ready system that customers can trust."
> — [Alation Agent Builder Launch, October 2025](https://www.globenewswire.com/news-release/2025/10/01/3159556/0/en/Alation-Announces-Agent-Builder-To-Deliver-Enterprise-Grade-AI-Agents-for-Structured-Data.html)

---

## The Problem

When Alation acquired Numbers Station AI in May 2025, the core problem named by leadership was clear: AI agents that work in demos still fail in production when they hit real enterprise structured data. Three specific failure modes:

1. **Prototype-to-production gap** — no systematic gating between demo accuracy and production reliability
2. **Structured data hallucinations** — LLMs generate plausible but wrong answers when metadata context is incomplete
3. **Governance blindspots** — no continuous verification that agent outputs respect catalog access policies

This project addresses all three.

---

## What It Does

`alation-agent-eval` is an evaluation suite that:

- Runs a benchmark suite of 12+ structured enterprise queries across 5 domains (financial, operational, governance, ML features, compliance)
- Scores each agent response across 5 metrics using LLM-as-judge evaluation
- Gates production deployment at the 90% accuracy threshold Deepesh cited
- Generates a full regression report with category breakdown

---

## Evaluation Metrics

| Metric | What It Measures |
|---|---|
| `answer_accuracy` | Semantic correctness vs ground truth answers |
| `hallucination_rate` | Whether agent fabricated values not grounded in catalog metadata |
| `governance_compliance` | Whether response respects Alation catalog access policies |
| `semantic_correctness` | Whether reasoning reflects correct query structure |
| `context_faithfulness` | Whether answer is grounded in catalog metadata, not generic LLM knowledge |

Pass threshold: **90% average across all metrics**

---

## Stack

- **Backend:** FastAPI, Python 3.11, Pydantic v2, Uvicorn
- **Frontend:** React 18, Recharts, Axios
- **Eval:** LLM-as-judge scoring with semantic equivalence checks
- **Integration:** Alation REST API, MCP Protocol

---

## Running Locally

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`. Backend on `http://localhost:8000`.

---

## Project Structure

```
alation-agent-eval/
  backend/
    main.py              FastAPI entry point
    evaluator.py         5-metric scoring engine
    benchmarks.py        Structured query benchmark suite
    models.py            Pydantic data models
    routers/
      eval_router.py     POST /api/eval/run, /api/eval/run-batch
      benchmarks_router.py  GET /api/benchmarks
    requirements.txt
  frontend/
    src/
      App.jsx
      components/
        Hero.jsx
        ProblemSection.jsx
        LiveEval.jsx       Interactive single benchmark runner
        BatchResults.jsx   Full suite with charts
        Nav.jsx
        Footer.jsx
    package.json
```

---

## API

```
POST /api/eval/run          Run evaluation on a single benchmark
GET  /api/eval/run-batch    Run full benchmark suite
GET  /api/benchmarks        List all benchmarks
GET  /api/benchmarks/{id}   Get single benchmark
```

---

Built by Jafar Mohammad
