from fastapi import APIRouter, HTTPException
from models import EvalRequest, EvalResult, BatchEvalResult
from evaluator import run_single_eval, run_batch_eval
from benchmarks import get_benchmark_by_id

router = APIRouter()


@router.post("/run", response_model=EvalResult)
def run_evaluation(request: EvalRequest):
    """Run evaluation on a single benchmark by ID or custom query."""
    if request.benchmark_id:
        benchmark = get_benchmark_by_id(request.benchmark_id)
        if not benchmark:
            raise HTTPException(status_code=404, detail=f"Benchmark {request.benchmark_id} not found")
        return run_single_eval(benchmark, request.agent_response)

    if request.query and request.ground_truth and request.metadata_context:
        from models import Benchmark
        benchmark = Benchmark(
            id="custom_001",
            category="custom",
            query=request.query,
            ground_truth=request.ground_truth,
            metadata_context=request.metadata_context,
            expected_sql="",
            difficulty="medium",
        )
        return run_single_eval(benchmark, request.agent_response)

    raise HTTPException(status_code=400, detail="Provide benchmark_id or query+ground_truth+metadata_context")


@router.post("/run-batch", response_model=BatchEvalResult)
def run_batch(category: str = None):
    """Run evaluation across full benchmark suite or a specific category."""
    return run_batch_eval(category)


@router.get("/run-batch", response_model=BatchEvalResult)
def run_batch_get(category: str = None):
    """GET version for easy browser testing."""
    return run_batch_eval(category)
