export type PlanPoint = readonly [number, number];

/**
 * Plan-derived geometry in metres. Critical dimensions live here so the
 * traced outline can be corrected without rebuilding the scene components.
 */
export const geometry = {
  plan: {
    documentedPoolLength: 14.68,
    documentedAreaM2: 138.5,
    source: "LIJBAILAT VILLA_POOL DIMS AND AREA(1).pdf",
  },
  pool: {
    outer: [[-7.35, -5.25], [7.35, -5.25], [7.35, 6.65], [6.12, 8.05]] as const satisfies readonly PlanPoint[],
    inner: [[-6.72, -4.62], [6.72, -4.62], [6.72, 6.38], [5.86, 7.38]] as const satisfies readonly PlanPoint[],
    waterLevel: 0.035,
    depth: 1.25,
    copingWidth: 0.62,
  },
  site: { width: 21.5, depth: 23, centreZ: 1.6 },
  lounge: { position: [1.3, 0, 9.15] as const, width: 7.4, depth: 3.1, height: 3.3 },
  facade: { position: [9.35, 0, 0.3] as const, height: 4.1, length: 18.6 },
} as const;
