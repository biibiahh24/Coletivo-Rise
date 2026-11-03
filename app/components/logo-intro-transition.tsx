"use client";

import { useEffect, useState } from "react";

const collective = "COLETIVO";
const rise = "RISE";

function FallingWord({ word, offset, className }: { word: string; offset: number; className: string }) {
  return (
    <span className={`logo-intro__word ${className}`} aria-hidden="true">
      {word.split("").map((letter, index) => (
        <span className="logo-intro__letter" style={{ animationDelay: `${0.35 + (offset + index) * 0.07}s` }} key={`${letter}-${index}`}>
          {letter}
        </span>
      ))}
    </span>
  );
}

export function LogoIntroTransition() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="logo-intro">
      <div className="logo-intro__lockup" aria-label="Coletivo Rise">
        <img className="logo-intro__mark" src="/assets/logo-rise-transparent.png" alt="" />
        <div className="logo-intro__type">
          <FallingWord word={collective} offset={0} className="logo-intro__collective" />
          <FallingWord word={rise} offset={collective.length} className="logo-intro__rise" />
        </div>
      </div>
      <button className="logo-intro__skip" type="button" onClick={() => setVisible(false)}>
        Pular animação
      </button>
    </div>
  );
}
