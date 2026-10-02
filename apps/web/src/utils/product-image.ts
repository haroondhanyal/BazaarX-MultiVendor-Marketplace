const colorFilters: Record<string, string> = {
  black: "grayscale(1) brightness(.55) contrast(1.15)", graphite: "grayscale(1) brightness(.68) contrast(1.15)",
  silver: "grayscale(1) brightness(1.18) contrast(.9)", white: "grayscale(1) brightness(1.45) contrast(.8)",
  cream: "sepia(.32) saturate(.72) brightness(1.12)", red: "sepia(.75) saturate(2.1) hue-rotate(315deg)",
  blue: "sepia(.45) saturate(1.75) hue-rotate(175deg)", navy: "sepia(.48) saturate(1.45) hue-rotate(175deg) brightness(.78)",
  green: "sepia(.55) saturate(1.65) hue-rotate(65deg)", pink: "sepia(.38) saturate(1.5) hue-rotate(285deg)",
  "rose gold": "sepia(.58) saturate(1.2) hue-rotate(320deg)", gold: "sepia(.78) saturate(1.2) hue-rotate(350deg)",
  beige: "sepia(.35) saturate(.65) brightness(1.08)",
};

export function getProductColorFilter(color?: string) {
  if (!color) return "none";
  const value = color.toLowerCase();
  const aliases: Record<string, string> = { pearl: "white", sage: "green", "rose gold": "rose gold" };
  const normalized = aliases[value] ?? Object.keys(colorFilters).find((key) => value.includes(key)) ?? value;
  return colorFilters[normalized] ?? "none";
}

export function getProductColorHex(color: string) {
  const value = color.toLowerCase();
  if (value.includes("black") || value.includes("graphite")) return "#303846";
  if (value.includes("silver")) return "#b9bec6";
  if (value.includes("white") || value.includes("pearl")) return "#f6f7f8";
  if (value.includes("cream") || value.includes("beige")) return "#e9d9bb";
  if (value.includes("red")) return "#d33b35";
  if (value.includes("blue") || value.includes("navy")) return "#3973bb";
  if (value.includes("green") || value.includes("sage")) return "#478460";
  if (value.includes("pink") || value.includes("rose")) return "#d69a9e";
  if (value.includes("gold")) return "#c59b45";
  return "#737d8b";
}
