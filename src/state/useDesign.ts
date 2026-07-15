import { create } from "zustand";
import type { Atmosphere, Collection } from "@/config/project";

type DesignState = {
  water: string;
  stone: string;
  fabric: string;
  atmosphere: Atmosphere;
  collection: Collection;
  panel: boolean;
  intro: boolean;
  set: (patch: Partial<DesignState>) => void;
  reset: () => void;
};

const defaults = {
  water: "#58aeb3",
  stone: "#c8c2b7",
  fabric: "#c4b4a4",
  atmosphere: "morning" as Atmosphere,
  collection: "contemporary" as Collection,
};

export const useDesign = create<DesignState>((set) => ({
  ...defaults,
  panel: false,
  intro: true,
  set: (patch) => set(patch),
  reset: () => set(defaults),
}));
