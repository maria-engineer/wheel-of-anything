export const MAX_RATING = 10;

export interface Point {
  x: number;
  y: number;
}

export const polarPoint = (cx: number, cy: number, r: number, angleDeg: number): Point => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/** SVG path for an annular sector (a wedge filled between r0 and r1, spanning a0..a1 degrees). */
export const wedgePath = (
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number
): string => {
  const largeArc = a1 - a0 > 180 ? 1 : 0;
  const p1 = polarPoint(cx, cy, r0, a0);
  const p2 = polarPoint(cx, cy, r1, a0);
  const p3 = polarPoint(cx, cy, r1, a1);
  const p4 = polarPoint(cx, cy, r0, a1);
  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${r0} ${r0} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
    "Z",
  ].join(" ");
};

export const sliceAngles = (index: number, count: number): { start: number; end: number } => {
  const span = 360 / count;
  return { start: index * span, end: (index + 1) * span };
};

export const ratingToRadius = (rating: number, hubRadius: number, outerRadius: number): number =>
  hubRadius + (Math.max(0, Math.min(MAX_RATING, rating)) / MAX_RATING) * (outerRadius - hubRadius);

/** Given a pointer position relative to the wheel center, returns the wedge index and the rating implied by the radius. */
export const pointToSliceAndRating = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  count: number,
  hubRadius: number,
  outerRadius: number
): { index: number; rating: number } => {
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (angleDeg < 0) angleDeg += 360;
  const span = 360 / count;
  const index = Math.min(count - 1, Math.floor(angleDeg / span));
  const rating = Math.round(
    ((Math.max(hubRadius, Math.min(outerRadius, distance)) - hubRadius) / (outerRadius - hubRadius)) * MAX_RATING
  );
  return { index, rating };
};
