import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SAMPLE_BENCHMARKS = [
  { id: 'fin_001', label: 'Q3 Revenue by Product Line' },
  { id: 'ops_001', label: 'P1 Ticket Resolution Time' },
  { id: 'gov_001', label: 'PII Dataset Access Audit' },
  { id: 'ml_001', label: 'Churn Model Feature Sources' },
  { id: 'comp_001', label: 'GDPR Lineage Report' },
];

const METRIC_COLORS = {
  answer_accuracy: 'var(--green)',
  hallucination_rate: 'var(--green)',
  governance_compliance: 'var(--blue)',
  semantic_correctness: 'var(--yellow)',
  context_faithfulness: 'var(--orange)',
};

function ScoreBar({ metric, score, label, reasoning, passed, animate }) {
  const [width, setWidth] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const color = METRIC_COLORS[metric] || 'var(--orange)';

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setWidth(score * 100);
        let current = 0;
        const target = Math.round(score * 100);
        const step = target / 40;
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          setDisplayed(Math.round(current));
          if (current >= target) clearInterval(interval);
        }, 30);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [animate, score]);

  return (
    <div style={{
      padding: '12px 14px', background: '#0D0F1A', borderRadius: 8,
      border: `1px solid ${passed ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.2)'}`,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#131625'}
      onMouseLeave={e => e.currentTarget.style.background = '#0D0F1A'}
      title={reasoning}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>
          {metric}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 500, color, minWidth: 38, textAlign: 'right' }}>
          {displayed}%
        </div>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', color: passed ? 'var(--green)' : 'var(--red)', flexShrink: 0,
        }}>
          {passed ? '✓' : '✗'}
        </div>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, background: color,
          width: `${width}%`, transition: 'width 1.3s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

export default function LiveEval() {
  const [selectedId, setSelectedId] = useState('fin_001');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);

  const runEval = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnimate(false);
    try {
      const res = await axios.post('/api/eval/run', { benchmark_id: selectedId });
      setResult(res.data);
      setTimeout(() => setAnimate(true), 50);
    } catch (err) {
      setError('Backend not running. Start the FastAPI server on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const overallPct = result ? Math.round(result.overall_score * 100) : null;

  return (
    <section id="live-eval" ref={sectionRef} style={{
      padding: '120px 0', background: 'var(--slate-mid)',
      borderTop: '1px solid var(--slate-border)', borderBottom: '1px solid var(--slate-border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64, alignItems: 'start' }}>

          {/* Left info */}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              Live Demo
              <span style={{ width: 48, height: 1, background: 'var(--orange)', opacity: 0.5, display: 'inline-block' }} />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Pick a benchmark.<br />Run it live.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
              Each benchmark is a structured enterprise query paired with ground truth answers and Alation catalog metadata context.
              The evaluator scores the simulated agent output across 5 dimensions.
            </p>

            {/* Benchmark selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, letterSpacing: '0.05em' }}>
                SELECT BENCHMARK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SAMPLE_BENCHMARKS.map(b => (
                  <button key={b.id} onClick={() => { setSelectedId(b.id); setResult(null); setError(null); }} style={{
                    padding: '10px 16px', borderRadius: 8, border: '1px solid',
                    borderColor: selectedId === b.id ? 'var(--orange)' : 'var(--slate-border)',
                    background: selectedId === b.id ? 'rgba(255,107,0,0.07)' : 'transparent',
                    color: selectedId === b.id ? 'var(--white)' : 'var(--text-muted)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{b.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'var(--text-dim)' }}>{b.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={runEval} disabled={loading} style={{
              width: '100%', padding: '14px 0', borderRadius: 8,
              background: loading ? 'rgba(255,107,0,0.5)' : 'var(--orange)',
              color: 'white', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Running eval...
                </>
              ) : 'Run Evaluation'}
            </button>
          </div>

          {/* Right: results panel */}
          <div>
            <div style={{
              background: '#0D0F1A', border: '1px solid var(--slate-border)',
              borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}>
              <div style={{
                background: '#151828', padding: '12px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--slate-border)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57', '#FFBD2E', '#28CA42'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  eval_results / {selectedId}
                </div>
                <div style={{ width: 60 }} />
              </div>

              <div style={{ padding: 24, minHeight: 380 }}>
                {!result && !loading && !error && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                    <div style={{ fontSize: '2rem' }}>⚡</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                      Select a benchmark and run evaluation
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--red)',
                  }}>
                    {error}
                  </div>
                )}

                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(255,107,0,0.2)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Running LLM-as-judge scoring...
                    </div>
                  </div>
                )}

                {result && (
                  <div>
                    {/* Query */}
                    <div style={{ background: '#171A2B', border: '1px solid rgba(255,107,0,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--orange)', marginBottom: 6, letterSpacing: '0.05em' }}>QUERY</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{result.query}</div>
                    </div>

                    {/* Score bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {result.scores.map((s, i) => (
                        <ScoreBar key={s.metric} {...s} animate={animate} />
                      ))}
                    </div>

                    {/* Verdict */}
                    <div style={{
                      padding: '14px 16px', borderRadius: 8,
                      background: result.passed ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
                      border: `1px solid ${result.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: result.passed ? 'var(--green)' : 'var(--red)',
                        animation: 'pulse 2s infinite', flexShrink: 0,
                      }} />
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: result.passed ? 'var(--green)' : 'var(--red)' }}>
                        {result.passed ? 'PASSED' : 'FAILED'} &nbsp;|&nbsp; avg: {overallPct}% &nbsp;|&nbsp; {result.passed ? 'above' : 'below'} 90% threshold
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
      `}</style>
    </section>
  );
}
