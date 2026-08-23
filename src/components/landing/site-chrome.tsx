"use client";

import type { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import FloatingShapes from "./floating-shapes";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}

export default function SiteChrome({ eyebrow, title, intro, children }: Props) {
  return (
    <>
      <FloatingShapes />
      <Navbar />
      <main className="subpage">
        <header className="subpage-hero">
          {eyebrow ? <span className="subpage-eyebrow">{eyebrow}</span> : null}
          <h1 className="font-display subpage-title">{title}</h1>
          {intro ? <p className="subpage-intro">{intro}</p> : null}
        </header>
        <div className="subpage-body">{children}</div>
      </main>
      <Footer />
    </>
  );
}
