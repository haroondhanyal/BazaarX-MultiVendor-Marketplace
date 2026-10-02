import { PersistentMap } from "./persistent-map";

const stocks = new PersistentMap<string, number>("inventory-stock");

export function savedStock(productId: string) {
  return stocks.get(productId);
}

export function saveStock(productId: string, stock: number) {
  stocks.set(productId, stock);
}
