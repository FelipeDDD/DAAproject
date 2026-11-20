// GREEN and plus extracted from PixelFX fx/holy/_lib.js (MIT).
// The plus sign's lit and shaded bevel is adapted from Sprite Fusion's open-source heal
// (https://www.spritefusion.com/pixel-art-vfx/heal), MIT License, Copyright (c) 2026 Hugo Duprez.
import { WHITE } from "../../core/index.js";

export const GREEN = ["#0e2a24", "#14472f", "#1d6e3a", "#2f9a45", "#5cc654", "#a0e46c", "#dcffb4", "#ffffff"];

export function plus(p, x, y, L, th, R, a = 1, glint = false) {
  const n = R.length, X = Math.round(x), Y = Math.round(y), w = th > 1 ? 1 : 0;
  const ins = (i, j) => (Math.abs(i) <= w && Math.abs(j) <= L) || (Math.abs(j) <= w && Math.abs(i) <= L);
  for (let j = -L - 1; j <= L + 1; j++)
    for (let i = -L - 1; i <= L + 1; i++) {
      if (!ins(i, j)) {
        if (w && (ins(i - 1, j) || ins(i + 1, j) || ins(i, j - 1) || ins(i, j + 1))) p.dot(X + i, Y + j, R[Math.max(0, n - 6)], a * 0.9);
        continue;
      }
      let c;
      if (!w) c = i === 0 && j === 0 ? WHITE : Math.abs(i) + Math.abs(j) >= L ? R[n - 3] : R[n - 2];
      else if (i === 0 && j === 0) c = WHITE;
      else if (i === 0 || j === 0) c = Math.abs(i) + Math.abs(j) < L ? R[n - 2] : R[n - 3];
      else c = i < 0 || j < 0 ? R[n - 3] : R[n - 5];
      if (glint && ((i === 0 && j === -L) || (i === -L && j === 0))) c = WHITE;
      p.dot(X + i, Y + j, c, a);
    }
}
