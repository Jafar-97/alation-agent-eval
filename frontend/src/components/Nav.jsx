import React, { useEffect, useState } from 'react';

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 48px',
    background: 'rgba(26,29,46,0.88)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--slate-border)',
    transition: 'all 0.3s',
  },
  logo: {
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem',
    letterSpacing: '0.04em', color: 'var(--white)', textDecoration: 'none',
    cursor: 'pointer',
  },
  links: {
    display: 'flex', gap: 32, listStyle: 'none', alignItems: 'center',
  },
  link: {
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500,
    color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.03em',
    cursor: 'pointer', transition: 'color 0.2s', background: 'none', border: 'none',
  },
  cta: {
    background: 'var(--orange)', color: 'white', padding: '8px 20px',
    borderRadius: 6, fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer',
    border: 'none', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
    transition: 'background 0.2s',
  },
};

export default function Nav({ activePage, setActivePage }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{ ...styles.nav, boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none' }}>
      <span style={styles.logo} onClick={() => setActivePage('home')}>
        alation<span style={{ color: 'var(--orange)' }}>-agent-eval</span>
      </span>
      <ul style={styles.links}>
        <li>
          <button style={styles.link} onClick={() => scrollTo('problem')}>
            The Problem
          </button>
        </li>
        <li>
          <button style={styles.link} onClick={() => scrollTo('live-eval')}>
            Live Eval
          </button>
        </li>
        <li>
          <button style={styles.link} onClick={() => scrollTo('batch')}>
            Batch Results
          </button>
        </li>
        <li>
          <a
            href="https://github.com/jafar-97/alation-agent-eval"
            target="_blank"
            rel="noreferrer"
            style={styles.cta}
          >
            GitHub
          </a>
        </li>
      </ul>
    </nav>
  );
}
