from fastapi import APIRouter, HTTPException
from models import BenchmarkListResponse, Benchmark
from benchmarks import get_all_benchmarks, get_benchmark_by_id, get_benchmarks_by_category, CATEGORIES

router = APIRouter()


@router.get("/", response_model=BenchmarkListResponse)
def list_benchmarks(category: str = None):
    if category:
        benchmarks = get_benchmarks_by_category(category)
    else:
        benchmarks = get_all_benchmarks()
    return BenchmarkListResponse(
        total=len(benchmarks),
        categories=CATEGORIES,
        benchmarks=benchmarks,
    )


@router.get("/{benchmark_id}", response_model=Benchmark)
def get_benchmark(benchmark_id: str):
    b = get_benchmark_by_id(benchmark_id)
    if not b:
        raise HTTPException(status_code=404, detail=f"Benchmark {benchmark_id} not found")
    return b
