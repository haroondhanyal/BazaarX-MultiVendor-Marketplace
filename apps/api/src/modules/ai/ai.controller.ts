import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { catalog } from "../catalog/catalog.controller";

export interface AiProvider { complete(task: string, input: Record<string, unknown>): Promise<Record<string, unknown>> }
// Deterministic local provider keeps this phase usable without a vendor key.
export class MockAiProvider implements AiProvider {
  async complete(task: string, input: Record<string, unknown>) { return { task, input, provider: "local-mock" }; }
}
const provider: AiProvider = new MockAiProvider();
class QueryDto { @IsString() @MinLength(2) @MaxLength(500) query!: string; }
class ListingDto { @IsString() @MinLength(3) title!: string; @IsString() category!: string; @IsOptional() @IsString() @MaxLength(2000) specifications?: string; }
class QualityDto { @IsString() title!: string; @IsString() category!: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsArray() images?: string[]; @IsOptional() @IsString() specifications?: string; }

function budgetFrom(text: string) { const found = text.toLowerCase().match(/(?:under|below|less than|budget(?: of)?|upto|up to)\s*(?:pkr\s*)?([\d,]+\s*(?:k|thousand)?)/); if (!found) return undefined; const compact = found[1].replaceAll(",", "").toLowerCase(); const amount = Number(compact.replace(/[^\d.]/g, "")); return /k|thousand/.test(compact) ? amount * 1000 : amount; }
function selectProducts(query: string) {
  const ignored = ["under", "below", "with", "strong", "good", "for", "pkr", "less", "than", "budget"];
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !ignored.includes(term));
  const budget = budgetFrom(query);
  return catalog.map((product) => {
    const searchable = `${product.name} ${product.category} ${product.brand} ${product.description} ${Object.values(product.specifications).join(" ")}`.toLowerCase();
    return { product, score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0) };
  }).filter(({ product, score }) => score > 0 && (!budget || product.price <= budget)).sort((a, b) => b.score - a.score || b.product.rating - a.product.rating).map(({ product }) => product);
}

@Controller("ai")
export class AiController {
  @Post("assistant") async assistant(@Body() body: QueryDto) { const products = selectProducts(body.query); const budget = budgetFrom(body.query); const category = products[0]?.category; return { provider: "local-mock", answer: products.length ? `I found ${products.length} matching option${products.length === 1 ? "" : "s"}${category ? ` in ${category}` : ""}${budget ? ` under PKR ${budget.toLocaleString("en-PK")}` : ""}.` : "I could not find an exact match. Try a broader category or a higher budget.", criteria: { budget, category, preferences: body.query }, products }; }
  @Get("search") search(@Query("q") query = "") { return { query, mode: "hybrid-mock", data: selectProducts(query), total: selectProducts(query).length }; }
  @Post("listing/generate") async generate(@Body() body: ListingDto) { const title = body.title.trim(); const specifications = body.specifications?.split(/[\n,;]+/).map((part) => part.trim()).filter(Boolean) ?? []; await provider.complete("listing-copy", body as unknown as Record<string, unknown>); return { provider: "local-mock", seoTitle: `${title} | BazaarX ${body.category}`, shortDescription: `${title} for everyday use. Explore trusted quality and convenient delivery from BazaarX sellers.`, description: `${title} is a considered choice in ${body.category}. ${specifications.length ? `Features include ${specifications.join(", ")}.` : "Add verified product specifications to help shoppers make an informed choice."} Shop confidently with BazaarX.`, bullets: (specifications.length ? specifications : ["Clear product details", "Convenient delivery", "Marketplace buyer support"]).slice(0, 6), keywords: [...new Set([title, body.category, ...specifications])].slice(0, 10) }; }
  @Post("listing/quality") quality(@Body() body: QualityDto) { const checks = [{ key: "title", label: "Specific product title", pass: body.title.trim().length >= 15 }, { key: "category", label: "Relevant category", pass: Boolean(body.category.trim()) }, { key: "description", label: "Useful description", pass: (body.description?.trim().length ?? 0) >= 60 }, { key: "images", label: "At least three product images", pass: (body.images?.length ?? 0) >= 3 }, { key: "specifications", label: "Product specifications", pass: (body.specifications?.trim().length ?? 0) >= 10 }]; return { score: Math.round(checks.filter((check) => check.pass).length / checks.length * 100), checks, suggestions: checks.filter((check) => !check.pass).map((check) => `Add ${check.label.toLowerCase()}.`) }; }
  @Get("reviews/summary") reviewSummary(@Query("productId") productId = "") { const product = catalog.find((item) => item.id === productId || item.slug === productId); if (!product) return { productId, count: 0, sentiment: "not enough data", positives: [], complaints: [], summary: "No verified review data is available yet." }; return { productId: product.id, count: product.reviews, sentiment: product.rating >= 4.5 ? "mostly positive" : "mixed", positives: ["Product quality", "Value for the price", "Delivery experience"], complaints: ["Some shoppers want more colour options"], summary: `Shoppers rate ${product.name} ${product.rating} out of 5 across ${product.reviews.toLocaleString("en-PK")} reviews. Feedback is mostly positive; some shoppers request more colour options.` }; }
  @Get("recommendations") recommendations(@Query("productId") productId?: string) { const current = catalog.find((item) => item.id === productId || item.slug === productId); const data = catalog.filter((item) => item.id !== current?.id).sort((a, b) => Number(b.category === current?.category) - Number(a.category === current?.category) || Math.abs(a.price - (current?.price ?? 0)) - Math.abs(b.price - (current?.price ?? 0))).slice(0, 4); return { data, strategy: current ? "category, price, and rating" : "trending and rating" }; }
}
