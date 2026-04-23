import React from 'react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--slate-border)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Built by{' '}
          <a href="https://github.com/jafar-97" target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
            Jafar Mohammad
          </a>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            ['GitHub', 'https://github.com/jafar-97/alation-agent-eval'],
            ['Alation Blog', 'https://www.alation.com/blog/refounding-alation-data-catalogs-ai-agents/'],
            ['Agent Builder Announcement', 'https://www.globenewswire.com/news-release/2025/10/01/3159556/0/en/Alation-Announces-Agent-Builder-To-Deliver-Enterprise-Grade-AI-Agents-for-Structured-Data.html'],
          ].map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" style={{
              fontSize: '0.78rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
