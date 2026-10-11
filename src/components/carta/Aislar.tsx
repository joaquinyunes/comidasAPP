"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  respaldo?: ReactNode;
}

// Límite de fallos para las capas decorativas (estrellas, órbita): si una
// revienta, la carta sigue en pie sin ella.
export default class Aislar extends Component<Props, { fallo: boolean }> {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error: unknown) {
    try {
      console.error("[carta] una capa decorativa falló y se ocultó:", error);
    } catch {
      // nada más que hacer
    }
  }

  render() {
    return this.state.fallo ? (this.props.respaldo ?? null) : this.props.children;
  }
}
