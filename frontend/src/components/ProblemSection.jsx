import React, { useEffect, useRef, useState } from 'react';

function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function QuoteCard({ quote, name, title, initials, sourceText, sourceUrl, delay }) {
  const [ref, visible] = useVisible();
  return (
    <div ref={ref} style={{
      background: 'var(--slate-mid)', border: '1px solid var(--slate-border)',
      borderLeft: '4px solid var(--orange)', borderRadius: 12,
      padding: '32px 36px', marginBottom: 20, position: 'relative',
      transition: 'all 0.25s',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
      transitionDelay: delay || '0s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem', color: 'var(--orange)', opacity: 0.2, lineHeight: 1, position: 'absolute', top: 16, left: 32 }}>"</div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.75, marginBottom: 20, paddingTop: 8 }}
        dangerouslySetInnerHTML={{ __html: quote }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--orange), #FF3D00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{title}</div>
        </div>
      </div>
      <a href={sourceUrl} target="_blank" rel="noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
        color: 'var(--orange)', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        {sourceText}
      </a>
    </div>
  );
}

function ProblemCard({ icon, title, body, delay }) {
  const [ref, visible] = useVisible();
  return (
    <div ref={ref} style={{
      background: 'var(--slate-mid)', border: '1px solid var(--slate-border)',
      borderRadius: 12, padding: 28, transition: 'all 0.25s',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
      transitionDelay: delay || '0s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--slate-border)'; }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: 14 }}>{icon}</div>
      <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 10, color: 'var(--white)' }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
    </div>
  );
}

export default function ProblemSection() {
  const [titleRef, titleVisible] = useVisible();

  return (
    <section id="problem" style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          The Problem
          <span style={{ width: 48, height: 1, background: 'var(--orange)', opacity: 0.5, display: 'inline-block' }} />
        </div>

        <div ref={titleRef} style={{ opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Alation identified the gap.<br />This project closes it.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.8, marginBottom: 48 }}>
            When Alation acquired Numbers Station AI in May 2025, the SVP of Engineering put it plainly. Building agents was not the hard part. Knowing when they were actually production-ready was.
          </p>
        </div>

        <QuoteCard
          quote='When we were evaluating Numbers Station as an acquisition target, we saw that their customers were reaching <strong style="color:var(--orange);font-style:normal">90% accuracy with evaluation frameworks</strong>, and that was the key to moving from prototype to production. <strong style="color:var(--orange);font-style:normal">Evaluations are not just a feature, they are a differentiator between a demo that looks promising and an enterprise-ready system that customers can trust.</strong>'
          name="Deepesh Chourey"
          title="SVP Engineering, Alation"
          initials="DC"
          sourceText="Source: Alation Agent Builder Launch, October 2025"
          sourceUrl="https://www.globenewswire.com/news-release/2025/10/01/3159556/0/en/Alation-Announces-Agent-Builder-To-Deliver-Enterprise-Grade-AI-Agents-for-Structured-Data.html"
          delay="0.1s"
        />

        <QuoteCard
          quote='You can ask an LLM the same question three times and get three different answers. <strong style="color:var(--orange);font-style:normal">You would never want that when asking about costs for your last quarter.</strong> Beyond that, models interpret structured data poorly and get confused if the data is sufficiently complex or lacks sufficient context.'
          name="Satyen Sangani"
          title="Co-Founder and CEO, Alation"
          initials="SS"
          sourceText="Source: Alation acquires Numbers Station, May 2025"
          sourceUrl="https://www.alation.com/blog/alation-acquires-numbers-station-ai/"
          delay="0.2s"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 48 }}>
          <ProblemCard
            icon="⚡"
            title="Prototype-to-Production Gap"
            body="Agents that pass informal testing still fail in production when query semantics shift, governance policies apply, or data context changes. No systematic gating exists between the two stages."
            delay="0s"
          />
          <ProblemCard
            icon="🔍"
            title="Structured Data Hallucinations"
            body="LLMs generate plausible-sounding SQL and answers that are factually wrong when enterprise metadata context is incomplete. One bad financial query costs more than the entire agent delivered."
            delay="0.1s"
          />
          <ProblemCard
            icon="🛡️"
            title="Governance Blindspots"
            body="Agents built on Alation's platform inherit access controls, but there is no framework to continuously verify that agent outputs stay compliant as data policies evolve across a catalog."
            delay="0.2s"
          />
        </div>
      </div>
    </section>
  );
}
