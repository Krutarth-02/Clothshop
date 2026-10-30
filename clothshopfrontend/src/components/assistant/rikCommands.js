import { productOptions } from "../product/productOptions";

export function normalizeSpeech(value) {
  return String(value || "").toLowerCase().replace(/[०-९]/g, (digit) => "०१२३४५६७८९".indexOf(digit))
    .replace(/ह[ेै]य?\s*रिक|हे\s*रिक/g, "hey rik")
    .replace(/ब्लैक|काला|काली/g, " black ").replace(/ब्लू|नीला|नीली/g, " blue ").replace(/व्हाइट|सफेद/g, " white ")
    .replace(/रेड|लाल/g, " red ").replace(/ग्रीन|हरा|हरी/g, " green ")
    .replace(/टी[ -]?शर्ट/g, " t-shirt ").replace(/शर्ट/g, " shirt ").replace(/जींस/g, " jeans ")
    .replace(/विशलिस्ट/g, " wishlist ").replace(/कार्ट/g, " cart ").replace(/प्रोफाइल/g, " profile ")
    .replace(/प्रीव्यू/g, " preview ").replace(/सिंगल|डिटेल/g, " detail ").replace(/प्रोडक्ट/g, " product ")
    .replace(/खोलो|खोल|ओपन/g, " open ").replace(/दिखाओ|दिखा|सर्च/g, " search ")
    .replace(/से/g, " se ").replace(/के बीच|बीच/g, " between ").replace(/अंदर|नीचे|कम/g, " under ")
    .replace(/रुपये|रुपए|रुपया|₹|\b(?:rupees?|rs)\b\.?/g, " ")
    .replace(/पांच सौ/g, "500").replace(/एक हजार|एक हज़ार/g, "1000")
    .replace(/\bt[ -]?shirts?\b/g, "t-shirt")
    .replace(/(\d),(?=\d{3}\b)/g, "$1").replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ").trim();
}

export function parseRikCommand(transcript) {
  const text = normalizeSpeech(transcript);
  const wake = text.match(/^hey\s+(?:rik|rick|ric)\b\s*/);
  if (!wake) return { type: "ignored" };
  const command = text.slice(wake[0].length).trim();
  if (!command) return { type: "help" };
  if (/\b(stop listening|mic off|voice off|band karo)\b/.test(command)) return { type: "stop" };
  if (/\b(close|band)\b/.test(command) && /\bpreview\b/.test(command)) return { type: "closePreview" };
  if (/\b(dark|light)\s*(mode|theme)\b/.test(command)) return { type: "theme", mode: command.includes("dark") ? "dark" : "light" };
  if (/\b(wishlist)\b/.test(command) && /\b(add|save|jodo|daalo)\b/.test(command)) return { type: "save", target: command, current: /\b(this|current|is|iska|iski)\b/.test(command) };
  for (const [pattern, to] of [[/\b(wishlist)\b/, "/wishlist"], [/\b(cart|bag)\b/, "/cart"], [/\b(profile|account)\b/, "/profile"], [/\bhome\b/, "/"], [/\b(size guide)\b/, "/size-guide"]]) {
    if (pattern.test(command) && /\b(open|kholo|dikhao|show|go|le chalo)\b/.test(command)) return { type: "navigate", to };
  }
  const preview = /\bpreview\b/.test(command);
  const detail = /\b(detail|details|single|page)\b/.test(command);
  if (preview || detail || /\b(open|kholo)\b/.test(command)) {
    const ordinal = command.match(/\b(first|second|third|fourth|fifth|pehla|pehle|dusra|doosra|teesra|1|2|3|4|5)(?:st|nd|rd|th)?\b/);
    const positions = { first: 1, pehla: 1, pehle: 1, second: 2, dusra: 2, doosra: 2, third: 3, teesra: 3, fourth: 4, fifth: 5 };
    return { type: preview ? "preview" : "detail", target: command, position: ordinal ? Number(positions[ordinal[1]] || ordinal[1]) : null, current: /\b(this|current|is|iska|iski)\b/.test(command) };
  }
  if (/\b(search|find|show|dikhao|dhundo|chahiye|filter|under|below|between|above|size|shirt|shirts|t-shirt|jeans|hoodie|dress)\b/.test(command)) {
    const filters = {};
    let rest = command;
    const range = rest.match(/(?:between\s+)?(\d+)\s*(?:and|to|se|aur|-)\s*(\d+)(?:\s*(?:ke|ki|between|beech))*\b/);
    const max = rest.match(/(?:under|below|less than|up to)\s*(\d+)|(\d+)\s*(?:ke\s*)?(?:under|below|andar|tak)/);
    const min = rest.match(/(?:above|over|more than)\s*(\d+)|(\d+)\s*(?:se\s*)?(?:above|zyada)/);
    if (range) { filters.minPrice = String(Math.min(+range[1], +range[2])); filters.maxPrice = String(Math.max(+range[1], +range[2])); rest = rest.replace(range[0], " "); }
    else {
      if (max) { filters.maxPrice = max[1] || max[2]; rest = rest.replace(max[0], " "); }
      if (min) { filters.minPrice = min[1] || min[2]; rest = rest.replace(min[0], " "); }
    }
    const size = rest.match(/\bsize\s+(extra small|extra large|double extra large|small|medium|large|xxxl|xxl|xl|xs|s|m|l|\d+)\b/);
    if (size) { filters.size = ({ "extra small": "XS", "extra large": "XL", "double extra large": "XXL", small: "S", medium: "M", large: "L" })[size[1]] || size[1].toUpperCase(); rest = rest.replace(size[0], " "); }
    if (/\bin stock\b/.test(rest)) { filters.inStock = "true"; rest = rest.replace(/\bin stock\b/g, " "); }
    rest = cleanTarget(rest).replace(/\b(in|mein|mai|me|ke|ki|ka|se|hai|hain|mujhe|muje|m|please|products?|clothes|clothing|all|sab|saare|dikha|do|karo|kar|hue|wale|wali|within|between|beech)\b/g, " ").replace(/\s+/g, " ").trim();
    if (rest) filters.q = rest;
    return { type: "search", filters };
  }
  return { type: "unknown" };
}

function cleanTarget(value) {
  return normalizeSpeech(value).replace(/\b(preview|details?|single|page|product|open|kholo|search|show|find|dikhao|dhundo|filter|add|save|wishlist|mein|mai|me|ka|ki|ke|ko|karo|kar|do|please|the|to|in|a)\b/g, " ").replace(/\s+/g, " ").trim();
}

export function filterRikProducts(products, filters) {
  const words = (filters.q || "").split(/\s+/).filter(Boolean).map((word) => word.replace(/shirts$/, "shirt"));
  return products.filter((item) => {
    const text = normalizeSpeech([item.name, item.category, item.description, ...productOptions(item.color), ...productOptions(item.size)].join(" ")).replace(/shirts\b/g, "shirt");
    return words.every((word) => text.includes(word)) &&
      (!filters.size || productOptions(item.size).some((size) => size.toLowerCase() === filters.size.toLowerCase())) &&
      (filters.minPrice === undefined || (Number.isFinite(item.price) && item.price >= Number(filters.minPrice))) &&
      (filters.maxPrice === undefined || (Number.isFinite(item.price) && item.price <= Number(filters.maxPrice))) &&
      (!filters.inStock || item.stock > 0);
  });
}

export function resolveRikProduct(command, products, results, currentId) {
  if (command.position) return results[command.position - 1] ? [results[command.position - 1]] : [];
  if (command.current) return products.filter((product) => product._id === currentId);
  const target = cleanTarget(command.target);
  if (!target) return products.filter((product) => product._id === currentId);
  const exact = products.filter((product) => normalizeSpeech(product.name) === target);
  return exact.length ? exact : filterRikProducts(products, { q: target });
}
