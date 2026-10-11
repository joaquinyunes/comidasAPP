import type { CSSProperties } from "react";

// Style que admite custom properties (--algo) sin castear en cada uso.
export type EstiloVars = CSSProperties & { [k: `--${string}`]: string | number };
