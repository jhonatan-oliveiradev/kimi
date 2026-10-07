export const FILM = {
  frames: 200,
  fps: 10,
  mp4: "/media/film.mp4",
  webm: "/media/film.webm",
  poster: "/media/poster.jpg",
  // scroll length of the cinematic sequence, in viewport heights
  scrollVh: 640,
};

export interface Chapter {
  index: number; // 1-based
  id: string;
  label: string;
  jp: string;
  // progress range inside the film scroll [0..1]
  from: number;
  to: number;
  lines: string[];
  note: string;
  align: "left" | "right" | "center";
  dark: boolean; // film is dark in this chapter -> pale text
  focus: number; // horizontal focal point 0..1 for cover-crop on narrow screens
}

export const CHAPTERS: Chapter[] = [
  {
    index: 1,
    id: "introduction",
    label: "Introduction",
    jp: "序",
    from: 0.0,
    to: 0.167,
    lines: [],
    note: "A film you can touch.",
    align: "left",
    dark: false,
    focus: 0.42,
  },
  {
    index: 2,
    id: "current",
    label: "Current",
    jp: "流",
    from: 0.167,
    to: 0.333,
    lines: ["The koi carries", "the river with it."],
    note: "Water remembers every movement.",
    align: "right",
    dark: false,
    focus: 0.5,
  },
  {
    index: 3,
    id: "flight",
    label: "Flight",
    jp: "飛",
    from: 0.333,
    to: 0.5,
    lines: ["Weight is", "a decision."],
    note: "Negative space is not empty.",
    align: "center",
    dark: false,
    focus: 0.5,
  },
  {
    index: 4,
    id: "bloom",
    label: "Bloom",
    jp: "咲",
    from: 0.5,
    to: 0.667,
    lines: ["She gathers what", "the season forgot."],
    note: "An herbarium of passing hours.",
    align: "left",
    dark: false,
    focus: 0.42,
  },
  {
    index: 5,
    id: "forest",
    label: "Forest",
    jp: "森",
    from: 0.667,
    to: 0.833,
    lines: ["Night is only", "a deeper garden."],
    note: "Petals turn toward the dark.",
    align: "right",
    dark: true,
    focus: 0.5,
  },
  {
    index: 6,
    id: "convergence",
    label: "Convergence",
    jp: "収",
    from: 0.833,
    to: 1.0,
    lines: ["Everything", "returns to form."],
    note: "200 frames. One continuous breath.",
    align: "center",
    dark: false,
    focus: 0.5,
  },
];

export const PALETTE = {
  paper: "#FDFCFF",
  pale: "#F2ECFA",
  lavender: "#D8C7EC",
  lilac: "#B99AD8",
  violet: "#8B63B5",
  deep: "#5B367E",
  ink: "#281A35",
};
