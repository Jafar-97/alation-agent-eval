import React, { useEffect, useState } from 'react';

const TYPEWRITER_PHRASES = [
  'answer_accuracy.......... 94%',
  'hallucination_rate....... 96%',
  'governance_compliance.... 100%',
  'semantic_correctness..... 88%',
  'context_faithfulness..... 91%',
  '',
  'VERDICT: PASSED | avg 93.8% | production ready',
];

const STATS = [
  ['5', 'Eval Metrics'],
  ['12+', 'Benchmarks'],
  ['90%', 'Pass Threshold'],
  ['Real-time', 'Regression Gate'],
];

const DOT_COLORS = ['#FF5F57', '#FFBD2E', '#28CA42'];

export default function Hero() {
  const [lines, setLines] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    let lineIndex = 0;
    const addLine = () => {
      if (lineIndex < TYPEWRITER_PHRASES.length) {
        const phrase = String(TYPEWRITER_PHRASES[lineIndex] || '');
        setLines(prev => [...prev, phrase]);
        lineIndex++;
        setTimeout(addLine, 420);
      }
    };
    const timer = setTimeout(addLine, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -200, right: -300, width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -200, width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
              color: 'var(--orange)', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: 24,
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
              transition: 'all 0.6s ease 0.1s',
            }}>
              <span style={{ width: 28, height: 1, background: 'var(--orange)', display: 'inline-block' }} />
              Open-source &nbsp;|&nbsp; Built for Alation Agent Builder
            </div>

            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
              lineHeight: 1.07, letterSpacing: '-0.02em', marginBottom: 24,
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.25s',
            }}>
              Evals are the<br />
              difference between<br />
              a demo and{' '}
              <span style={{ color: 'var(--orange)' }}>production</span>
            </h1>

            <p style={{
              fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: 480,
              marginBottom: 40, fontWeight: 300, lineHeight: 1.8,
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.4s',
            }}>
              An LLM evaluation suite for Alation's Agent Builder, benchmarking structured data agents
              across accuracy, hallucination rate, governance compliance, and semantic correctness.
            </p>

            <div style={{
              display: 'flex', gap: 14, flexWrap: 'wrap',
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.55s',
            }}>
              <button
                onClick={() => {
                  const el = document.getElementById('live-eval');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--orange)', color: 'white', padding: '14px 28px',
                  borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  fontSize: '0.95rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FF8A30'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.transform = 'none'; }}
              >
                Run Live Eval
              </button>
              <a
                href="https://github.com/jafar-97/alation-agent-eval"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: 'var(--text-main)', padding: '14px 28px',
                  borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text-main)'; }}
              >
                View on GitHub
              </a>
            </div>

            <div style={{
              display: 'flex', gap: 32, marginTop: 48, paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.07)',
              opacity: visible ? 1 : 0, transition: 'all 0.7s ease 0.7s',
            }}>
              {STATS.map(function(item) {
                var num = item[0];
                var label = item[1];
                return (
                  <div key={label}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--orange)', lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Terminal */}
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s ease 0.5s',
          }}>
            <div style={{
              background: '#0D0F1A', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                background: '#151828', padding: '12px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {DOT_COLORS.map(function(c) {
                    return <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />;
                  })}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#555A72' }}>
                  alation-agent-eval / run_eval.py
                </div>
                <div style={{ width: 60 }} />
              </div>

              <div style={{ padding: 24, minHeight: 280 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', marginBottom: 12, color: '#555A72' }}>
                  $ python run_eval.py --benchmark fin_001
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#555A72', marginBottom: 16 }}>
                  Running evaluation suite against Alation Agent Builder...
                </div>
                {lines.map(function(line, i) {
                  var safeLine = typeof line === 'string' ? line : '';
                  var color = '#8A8FA8';
                  if (safeLine.indexOf('VERDICT') !== -1) color = '#22C55E';
                  else if (safeLine.indexOf('100%') !== -1) color = '#3B82F6';
                  else if (safeLine.indexOf('9') !== -1) color = '#22C55E';
                  else if (safeLine === '') color = 'transparent';
                  return (
                    <div key={i} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.78rem',
                      color: color,
                      lineHeight: 1.8,
                      fontWeight: safeLine.indexOf('VERDICT') !== -1 ? 600 : 400,
                    }}>
                      {safeLine || '\u00A0'}
                    </div>
                  );
                })}
                {lines.length > 0 && lines.length < TYPEWRITER_PHRASES.length && (
                  <span style={{
                    display: 'inline-block', width: 8, height: 14,
                    background: 'var(--orange)', animation: 'blink 1s infinite',
                    marginLeft: 2, verticalAlign: 'middle',
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </section>
  );
}