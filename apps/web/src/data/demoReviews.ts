import type { Product } from "@bazaarx/types";

// These sample reviews are for the local marketplace demo only.
const reviewerNames = [
  { name: "Ahmed Raza", gender: "male", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Ayesha Khan", gender: "female", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Usman Ali", gender: "male", avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
  { name: "Hira Malik", gender: "female", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Bilal Ahmed", gender: "male", avatar: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Sana Iqbal", gender: "female", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
];

const comments = [
  "Product bilkul description jaisa hai, packing bhi achi thi. Delivery time par mil gaya.",
  "Quality achi hai aur price ke hisaab se value for money. Main satisfied hoon.",
  "Use kar ke acha experience raha. Seller ne order jaldi dispatch kar diya.",
  "Colour aur finishing dono bohat achay hain. Ghar walon ko bhi pasand aya.",
  "Mujhe product pasand aya, details sahi di hui thin aur parcel safely pohancha.",
  "Overall acha experience. Item theek condition mein mila, shukriya BazaarX!",
];

export function getDemoReviews(product: Product) {
  return reviewerNames.map((reviewer, index) => ({
    ...reviewer,
    id: `${product.id}-demo-review-${index + 1}`,
    rating: index === 4 ? 4 : 5,
    date: `${index + 2} din pehle`,
    comment: comments[(index + (product.name.length % comments.length)) % comments.length],
    image: index % 2 === 0 ? product.image : undefined,
    video: index === 3 ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" : undefined,
  }));
}
