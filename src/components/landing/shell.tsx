"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./header";
import Hero from "./hero";
import ProductCarousel from "./product-carousel";
import Carta from "./carta";
import StatsBlocks from "./stats-blocks";
import RegionsStrip from "./regions-strip";
import FinalCta from "./final-cta";
import Footer from "./footer";

export default function LandingShell() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const initReveal = useCallback(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => initReveal(), 100);
    return () => clearTimeout(t);
  }, [loading, initReveal]);

  // Re-run observer when DOM changes (for dynamic content)
  useEffect(() => {
    if (loading) return;
    const mut = new MutationObserver(() => initReveal());
    mut.observe(document.body, { childList: true, subtree: true });
    return () => mut.disconnect();
  }, [loading, initReveal]);

  return (
    <>
      <div id="loader" className={loading ? "" : "hidden"}>
        <span>Just Pizza</span>
        <div className="loader-bar" />
      </div>
      <Header />
      <main>
        <Hero />
        <ProductCarousel />
        <Carta />
        <StatsBlocks />
        <RegionsStrip />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
