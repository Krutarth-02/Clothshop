export function productOptions(value) {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = [value];
    }
  }
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim()),
    ),
  ];
}

const shades = {
  white: "#f5f3ed",
  black: "#242424",
  grey: "#929292",
  gray: "#929292",
  charcoal: "#414449",
  navy: "#23344f",
  blue: "#4479ac",
  skyblue: "#94c8e5",
  lightblue: "#a0c3df",
  midblue: "#557caa",
  indigo: "#354c7e",
  sage: "#9da88c",
  olive: "#737b4b",
  green: "#5e8664",
  khaki: "#b7a276",
  beige: "#d5c3a4",
  cream: "#eee6d2",
  ivory: "#f2ecdb",
  sand: "#caba9d",
  camel: "#b38a5b",
  tan: "#b98b65",
  brown: "#79553b",
  pink: "#dda9ba",
  dustyrose: "#b78391",
  lilac: "#b8a0cf",
  purple: "#8a64a1",
  lavender: "#bca8d7",
  red: "#b74f49",
  maroon: "#743b45",
  burgundy: "#733d4b",
  terracotta: "#bb7258",
  orange: "#d0904b",
  yellow: "#e2c05c",
  gold: "#c5a35b",
  silver: "#b6bcc0",
  teal: "#438382",
  mint: "#b4d0bb",
  peach: "#e7b79a",
};

export function productColor(value) {
  const name = String(value || "").trim();
  if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(name)) return name;
  return (
    shades[
      name
        .toLowerCase()
        .replace(/floral|patterned|striped/g, "")
        .replace(/[\s_-]/g, "")
    ] || null
  );
}
