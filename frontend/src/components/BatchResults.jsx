import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const CAT_COLORS = {
  financial: '#FF6B00',
  operational: '#3B82F6',
  governance: '#22C55E',
  ml_features: '#F59E0B',
  compliance: '#8B5CF6',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1E2133', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill || p.color || 'var(--orange)' }}>
          {p.name}: {typeof p.value === 'number' ? (p.value > 1 ? p.value : `${Math.round(p.value * 100)}%`) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function BatchResults() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ran, setRan] = useState(false);

  const runBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/eval/run-batch');
      setResult(res.data);
      setRan(true);
    } catch {
      setError('Backend not running. Start the FastAPI server on port 8000 to see batch results.');
    } finally {
      setLoading(false);
    }
  };

  const catData = result
    ? Object.entries(result.category_breakdown).map(([cat, data]) => ({
        name: cat.replace('_', ' '),
        pass_rate: Math.round(data.pass_rate * 100),
        avg_score: Math.round(data.avg_score * 100),
        color: CAT_COLORS[cat] || 'var(--orange)',
      }))
    : [];

  const radarData = result
    ? result.results.slice(0, 1).flatMap(r =>
        r.scores.map(s => ({
          metric: s.label.replace('Detection', '').replace('Compliance', '').trim(),
          score: Math.round(s.score * 100),
        }))
      )
    : [];

  return (
    <section id="batch" style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          Batch Evaluation
          <span style={{ width: 48, height: 1, background: 'var(--orange)', opacity: 0.5, display: 'inline-block' }} />
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.02em', marginBottom: 16 }}>
          Run the full benchmark suite
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 560, lineHeight: 1.8, marginBottom: 40 }}>
          Run all benchmarks across every category and get a production readiness verdict with a breakdown by domain.
        </p>

        <button onClick={runBatch} disabled={loading} style={{
          padding: '14px 32px', borderRadius: 8,
          background: loading ? 'rgba(255,107,0,0.5)' : 'var(--orange)',
          color: 'white', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
          fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 48, display: 'inline-flex', alignItems: 'center', gap: 10,
          transition: 'all 0.2s',
        }}>
          {loading && <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
          {loading ? 'Running full suite...' : 'Run Full Benchmark Suite'}
        </button>

        {error && (
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--red)', marginBottom: 32 }}>
            {error}
          </div>
        )}

        {result && (
          <div>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
              {[
                { label: 'Total Benchmarks', value: result.total, color: 'var(--text-main)' },
                { label: 'Passed', value: result.passed, color: 'var(--green)' },
                { label: 'Overall Score', value: `${Math.round(result.overall_score * 100)}%`, color: 'var(--orange)' },
                { label: 'Production Ready', value: result.production_ready ? 'YES' : 'NO', color: result.production_ready ? 'var(--green)' : 'var(--red)' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--slate-mid)', border: '1px solid var(--slate-border)',
                  borderRadius: 12, padding: '24px 28px',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--slate-border)'; }}
                >
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: item.color, lineHeight: 1, marginBottom: 6 }}>{item.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
              {/* Bar chart: pass rate by category */}
              <div style={{ background: 'var(--slate-mid)', border: '1px solid var(--slate-border)', borderRadius: 12, padding: 28 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: 20, color: 'var(--white)' }}>Pass Rate by Category</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="pass_rate" name="Pass Rate" radius={[4, 4, 0, 0]}>
                      {catData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar chart: first result scores */}
              <div style={{ background: 'var(--slate-mid)', border: '1px solid var(--slate-border)', borderRadius: 12, padding: 28 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: 20, color: 'var(--white)' }}>Metric Breakdown</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: 'var(--text-muted)' }} />
                    <Radar name="Score" dataKey="score" stroke="var(--orange)" fill="var(--orange)" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Results table */}
            <div style={{ background: 'var(--slate-mid)', border: '1px solid var(--slate-border)', borderRadius: 12, marginTop: 24, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--white)' }}>All Results</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{result.total} benchmarks</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--slate-border)' }}>
                      {['ID', 'Category', 'Difficulty', 'Score', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 400, letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map(r => (
                      <tr key={r.benchmark_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--orange)' }}>{r.benchmark_id}</td>
                        <td style={{ padding: '12px 20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[r.category] || 'var(--orange)', marginRight: 8 }} />
                          {r.category.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{r.difficulty}</td>
                        <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: r.overall_score >= 0.9 ? 'var(--green)' : r.overall_score >= 0.75 ? 'var(--yellow)' : 'var(--red)' }}>
                          {Math.round(r.overall_score * 100)}%
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.05em',
                            background: r.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: r.passed ? 'var(--green)' : 'var(--red)',
                            border: `1px solid ${r.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
