from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Category(str, Enum):
    financial = "financial"
    operational = "operational"
    governance = "governance"
    ml_features = "ml_features"
    compliance = "compliance"


class Benchmark(BaseModel):
    id: str
    category: str
    query: str
    ground_truth: str
    metadata_context: str
    expected_sql: str
    difficulty: str


class EvalRequest(BaseModel):
    benchmark_id: Optional[str] = None
    query: Optional[str] = None
    ground_truth: Optional[str] = None
    metadata_context: Optional[str] = None
    agent_response: Optional[str] = None
    run_all: bool = False
    category: Optional[str] = None


class MetricScore(BaseModel):
    metric: str
    score: float
    label: str
    reasoning: str
    passed: bool


class EvalResult(BaseModel):
    benchmark_id: str
    query: str
    agent_response: str
    scores: List[MetricScore]
    overall_score: float
    passed: bool
    verdict: str
    category: str
    difficulty: str


class BatchEvalResult(BaseModel):
    total: int
    passed: int
    failed: int
    pass_rate: float
    overall_score: float
    production_ready: bool
    results: List[EvalResult]
    category_breakdown: Dict[str, Any]


class BenchmarkListResponse(BaseModel):
    total: int
    categories: List[str]
    benchmarks: List[Benchmark]
