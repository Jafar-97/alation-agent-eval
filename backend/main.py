from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import eval_router, benchmarks_router

app = FastAPI(
    title="alation-agent-eval",
    description="LLM evaluation framework for Alation Agent Builder",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(eval_router.router, prefix="/api/eval", tags=["Evaluation"])
app.include_router(benchmarks_router.router, prefix="/api/benchmarks", tags=["Benchmarks"])


@app.get("/")
def root():
    return {"status": "ok", "project": "alation-agent-eval"}


@app.get("/health")
def health():
    return {"status": "healthy"}
