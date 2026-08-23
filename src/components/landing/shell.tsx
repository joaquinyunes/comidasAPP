"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import Marquee from "./marquee";
import FeaturedProducts from "./featured-products";
import Ingredients from "./ingredients";
import Story from "./story";
import GalaxySlider from "./galaxy-slider";
import Gallery from "./gallery";
import Specials from "./specials";
import Testimonials from "./testimonials";
import FAQ from "./faq";
import WhereToFind from "./where-to-find";
import FinalCTA from "./cta";
import FloatingShapes from "./floating-shapes";
import Footer from "./footer";

export default function LandingShell() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [collapsing, setCollapsing] = useState(false);

  const handleStart = useCallback(() => {
    setCollapsing(true);
    setTimeout(() => setPreloaderDone(true), 900);
  }, []);

  // Auto-cierre del preloader (accesibilidad + si no hay interacción).
  useEffect(() => {
    const t = setTimeout(handleStart, 2200);
    return () => clearTimeout(t);
  }, [handleStart]);

  const initReveal = useCallback(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".reveal-up:not(.is-visible), .reveal-scale:not(.is-visible)"
    );
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;
    const t = setTimeout(() => initReveal(), 100);
    const mut = new MutationObserver(() => initReveal());
    mut.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      mut.disconnect();
    };
  }, [preloaderDone, initReveal]);

  return (
    <>
      {!preloaderDone && (
        <div id="preloader" className={collapsing ? "collapsing" : ""}>
          <div className="preloader-logo">COZIZINA</div>
          <div className="preloader-sub">Comida al estilo cósmico</div>
          <button className="preloader-start" onClick={handleStart}>
            Entrar
          </button>
        </div>
      )}

      <FloatingShapes />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <FeaturedProducts />
        <Ingredients />
        <Story />
        <GalaxySlider />
        <Gallery />
        <Specials />
        <Testimonials />
        <FAQ />
        <WhereToFind />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
