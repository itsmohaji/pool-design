export const geometry = {
  units: "metres",
  verified: {
    deckArea: 138.5,
    poolBase: 14.68,
  },
  assumptions: {
    poolDepth: 1.45,
    poolPoints: [
      [-7.34, -5.2],
      [7.34, -5.2],
      [7.34, 6.8],
      [6.15, 8.15],
    ] as [number, number][],
    copingWidth: 0.34,
    terraceWidth: 19.5,
    terraceDepth: 18.5,
    seatingCeilingHeight: 3.25,
  },
} as const;

export const palettes = {
  stone: ["#d6c3a4", "#c8c2b7", "#a8a29a", "#77736d"],
  fabric: ["#8b7867", "#b5aa9c", "#ded7cb", "#5d625d"],
  water: ["#58aeb3", "#2b8790", "#78b8a8", "#345c72"],
};

export type Atmosphere = "morning" | "golden" | "night";
export type Collection = "contemporary" | "mediterranean" | "minimal";
