"use client";

import { useState, useEffect } from "react";
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
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // IntersectionObserver for .reveal elements
  useEffect(() => {
    const runReveal = () => {
      const els = document.querySelectorAll(".reveal:not(.is-visible)");
      if (!els.length) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
      );

      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    };

    // Run after loader hides
    const t = setTimeout(() => runReveal(), 1500);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <>
      <div id="loader" className={loading ? "" : "hidden"}>
        <span>Cargando...</span>
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
