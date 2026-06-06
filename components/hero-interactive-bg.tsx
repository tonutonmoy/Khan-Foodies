'use client';

/** Red hanging orbs — hero background (CSS swing only, no mouse) */
export function HeroInteractiveBg() {
  return (
    <div className="kf-hero-orbs" aria-hidden>
      <div className="kf-hero-orb-wrap kf-hang kf-hang--slow">
        <div className="kf-hero-orb kf-hero-orb--1" />
      </div>
      <div className="kf-hero-orb-wrap kf-hang kf-hang--mid">
        <div className="kf-hero-orb kf-hero-orb--2" />
      </div>
      <div className="kf-hero-orb-wrap kf-hang kf-hang--fast">
        <div className="kf-hero-orb kf-hero-orb--3" />
      </div>
      <div className="kf-hero-grid" />
    </div>
  );
}
