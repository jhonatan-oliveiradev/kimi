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
    label: "Essence",
    jp: "香",
    from: 0.0,
    to: 0.167,
    lines: [],
    note: "A botanical fragrance shaped by nature, memory and skin.",
    align: "left",
    dark: false,
    focus: 0.42,
  },
  {
    index: 2,
    id: "current",
    label: "Water",
    jp: "水",
    from: 0.167,
    to: 0.333,
    lines: ["Clarity begins", "with water."],
    note: "Mineral notes, morning air and a trace of something familiar.",
    align: "right",
    dark: false,
    focus: 0.5,
  },
  {
    index: 3,
    id: "flight",
    label: "Air",
    jp: "風",
    from: 0.333,
    to: 0.5,
    lines: ["Weightless,", "yet unforgettable."],
    note: "A luminous accord unfolds slowly against the skin.",
    align: "center",
    dark: false,
    focus: 0.5,
  },
  {
    index: 4,
    id: "bloom",
    label: "Bloom",
    jp: "花",
    from: 0.5,
    to: 0.667,
    lines: ["Botanicals in", "full expression."],
    note: "Petals, stems and soft florals compose the heart.",
    align: "left",
    dark: false,
    focus: 0.42,
  },
  {
    index: 5,
    id: "forest",
    label: "Depth",
    jp: "深",
    from: 0.667,
    to: 0.833,
    lines: ["When light fades,", "character remains."],
    note: "Violet, woods and resin settle into something intimate.",
    align: "right",
    dark: true,
    focus: 0.5,
  },
  {
    index: 6,
    id: "convergence",
    label: "Signature",
    jp: "印",
    from: 0.833,
    to: 1.0,
    lines: ["Made to", "remain."],
    note: "A quiet signature that becomes part of you.",
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
