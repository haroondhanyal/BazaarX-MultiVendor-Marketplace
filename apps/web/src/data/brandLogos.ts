// Brand marks use public logos where available and a generated icon otherwise.
export const brandLogos: Record<string, string> = {
  Adidas: "https://cdn.simpleicons.org/adidas/111111",
  Bata: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Bata.svg",
  Servis: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Servis_logo.png",
  "Hush Puppies": "https://cencomalls.pe/sites/default/files/styles/convert_webp/public/logos-marca/HUSH%2520PUPPIES.png.webp?itok=zYG48rF1",
  Sveston: "https://en-pk.svestonwatches.com/cdn/shop/files/Sveston-Logo_White.png?v=1748515188&width=1135",
  Casio: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Casio_logo.svg",
  Seiko: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Seiko_logo.svg",
  Fossil: "https://www.fossil.com/content/dam/FossilPartners/fossildotcom/logo/logo_header.svg",
};

// Simple Icons marks for brands that publish an icon in the open icon set.
const simpleIconSlugs: Record<string, string> = {
  Nike: "nike", Puma: "puma", Reebok: "reebok", "Levi's": "levis", Zara: "zara", "H&M": "hm",
  Uniqlo: "uniqlo", Mango: "mango", "New Balance": "newbalance", ASICS: "asics", Skechers: "skechers",
  "Under Armour": "underarmour", Samsung: "samsung", Apple: "apple", Xiaomi: "xiaomi", OPPO: "oppo",
  vivo: "vivo", Tecno: "tecno", Infinix: "infinix", realme: "realme", OnePlus: "oneplus", Huawei: "huawei",
  Sony: "sony", JBL: "jbl", Anker: "anker", Belkin: "belkin", Logitech: "logitech", Kingston: "kingstontechnology",
  SanDisk: "sandisk", "TP-Link": "tplink", Dell: "dell", HP: "hp", Lenovo: "lenovo", ASUS: "asus", Acer: "acer",
  Haier: "haier", Philips: "philips", Panasonic: "panasonic", Kenwood: "kenwood", TCL: "tcl", Gree: "gree",
  IKEA: "ikea", Tefal: "tefal", KitchenAid: "kitchenaid", Garnier: "garnier", Nivea: "nivea", Maybelline: "maybelline",
  "The Ordinary": "theordinary", "L'Oréal Paris": "loreal", Adidas: "adidas", Casio: "casio", Fossil: "fossil",
  Seiko: "seiko", "Hush Puppies": "hushpuppies", "Saeed Ghani": "saeedghani", Dawlance: "dawlance", PEL: "pel",
};

export function getBrandLogo(brand: string) {
  if (brandLogos[brand]) return brandLogos[brand];
  const slug = simpleIconSlugs[brand];
  return slug ? `https://cdn.simpleicons.org/${slug}/111111` : getBrandFallbackLogo(brand);
}

export function getBrandFallbackLogo(brand: string) {
  const words = brand.trim().split(/\s+/).filter(Boolean);
  const initials = (words.length > 1
    ? words.map((word) => word.match(/[\p{L}\p{N}]/u)?.[0] ?? "").join("")
    : [...(brand.match(/[\p{L}\p{N}]+/gu)?.join("") ?? "")].slice(0, 2).join("")
  ).slice(0, 2).toUpperCase() || "BX";
  const colors = ["#243b53", "#6847a5", "#176b68", "#9b4d26", "#315c9b"];
  const color = colors[[...brand].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72"><rect width="120" height="72" rx="14" fill="${color}"/><text x="60" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const brandLogoSources: Record<string, string> = {
  Adidas: "Simple Icons",
  Bata: "Wikimedia Commons",
  Casio: "Wikimedia Commons",
  Seiko: "Wikimedia Commons",
  Fossil: "Fossil",
  Outfitters: "Outfitters wordmark",
  Servis: "Wikimedia Commons",
  "Hush Puppies": "Cenco Mall",
  Sveston: "Sveston",
};
