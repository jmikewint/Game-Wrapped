export type StatCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  accent: "volt" | "coral" | "ice";
};

export type FeaturedGame = {
  id: string;
  name: string;
  hours: number;
  genre: string;
  rank: number;
};
