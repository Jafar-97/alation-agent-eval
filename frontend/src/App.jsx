import React, { useState } from 'react';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import LiveEval from './components/LiveEval';
import BatchResults from './components/BatchResults';
import Nav from './components/Nav';
import Footer from './components/Footer';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)' }}>
      <Nav activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'home' && (
        <>
          <Hero setActivePage={setActivePage} />
          <ProblemSection />
          <LiveEval />
          <BatchResults />
        </>
      )}
      <Footer />
    </div>
  );
}
