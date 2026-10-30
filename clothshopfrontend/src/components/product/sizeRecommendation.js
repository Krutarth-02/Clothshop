import { productOptions } from "./productOptions";

const sampleChest = { XS: 86, S: 92, M: 98, L: 104, XL: 110, XXL: 116, "2XL": 116, XXXL: 122, "3XL": 122 };
export const fitEase = { slim: 4, regular: 8, relaxed: 12 };

export function getSizeChart(product) {
  const sizes = productOptions(product.size);
  const actual = Array.isArray(product.sizeChart) ? product.sizeChart : [];
  const rows = sizes.flatMap((size) => {
    const row = actual.find((entry) => entry?.size?.trim().toLowerCase() === size.toLowerCase());
    return Number.isFinite(row?.chestCm) && row.chestCm > 0 ? [{ size, chestCm: row.chestCm }] : [];
  });
  if (rows.length) return { rows: rows.sort((a, b) => a.chestCm - b.chestCm), sample: false };
  // A chest estimate is inappropriate for bottoms, footwear and accessories.
  const isTop = /\b(t[ -]?shirts?|shirts?|tops?|hoodies?|sweatshirts?|jackets?|sweaters?|blouses?|kurtas?)\b/i.test(`${product.name || ""} ${product.category || ""}`);
  return { rows: isTop ? sizes.flatMap((size) => sampleChest[size.toUpperCase()] ? [{ size, chestCm: sampleChest[size.toUpperCase()] }] : []).sort((a, b) => a.chestCm - b.chestCm) : [], sample: true };
}

export function suggestSize(rows, chest, unit, fit) {
  if (!Number.isFinite(chest) || chest <= 0 || !Object.hasOwn(fitEase, fit)) return null;
  const bodyCm = unit === "in" ? chest * 2.54 : chest;
  const ease = fitEase[fit];
  const target = bodyCm + ease;
  const match = [...rows].sort((a, b) => a.chestCm - b.chestCm).find((row) => row.chestCm >= target);
  return { bodyCm, ease, target, match: match || null };
}
