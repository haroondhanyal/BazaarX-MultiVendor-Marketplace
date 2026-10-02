import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Prisma, PrismaClient } from "@prisma/client";

const maps = new Set<PersistentMap<string, unknown>>();

// A small single-process store keeps the demo API data across restarts.
export class PersistentMap<K extends string, V> extends Map<K, V> {
  private readonly file: string;
  private readonly name: string;
  private database?: PrismaClient;
  private pendingWrite: Promise<unknown> = Promise.resolve();

  constructor(name: string, seed: Iterable<readonly [K, V]> = []) {
    const entries = [...seed];
    const folder = process.env.MARKETPLACE_STATE_DIR ?? resolve(process.cwd(), "var/state");
    mkdirSync(folder, { recursive: true });
    const file = resolve(folder, `${name}.json`);
    if (existsSync(file)) {
      try {
        const saved = JSON.parse(readFileSync(file, "utf8")) as Array<[K, V]>;
        entries.splice(0, entries.length, ...saved);
      } catch {
        // If a local state file is damaged, start again from the seed data.
      }
    }
    super(entries);
    this.file = file;
    this.name = name;
    maps.add(this as PersistentMap<string, unknown>);
  }

  override set(key: K, value: V) {
    super.set(key, value);
    if (this.file) this.save();
    this.saveToDatabase(key, value);
    return this;
  }

  override delete(key: K) {
    const changed = super.delete(key);
    if (changed && this.file) this.save();
    if (changed) this.deleteFromDatabase(key);
    return changed;
  }

  override clear() {
    super.clear();
    if (this.file) this.save();
    this.deleteAllFromDatabase();
  }

  async restore(client: PrismaClient) {
    this.database = client;
    const saved = await client.apiState.findMany({ where: { key: { startsWith: `${this.name}:` } } });
    const savedKeys = new Set<string>();
    for (const item of saved) {
      const key = item.key.slice(this.name.length + 1) as K;
      super.set(key, item.value as V);
      savedKeys.add(key);
    }
    for (const [key, value] of this.entries()) {
      if (!savedKeys.has(key)) await this.saveToDatabase(key, value);
    }
    await this.pendingWrite;
    this.save();
  }

  flush() {
    return this.pendingWrite;
  }

  private saveToDatabase(key: K, value: V) {
    if (!this.database) return Promise.resolve();
    const id = `${this.name}:${key}`;
    this.pendingWrite = this.pendingWrite.then(() => this.database!.apiState.upsert({
      where: { key: id },
      create: { key: id, value: value as Prisma.InputJsonValue },
      update: { value: value as Prisma.InputJsonValue },
    })).catch((error: unknown) => console.error("Could not save marketplace state:", error));
    return this.pendingWrite;
  }

  private deleteFromDatabase(key: K) {
    if (!this.database) return;
    const id = `${this.name}:${key}`;
    this.pendingWrite = this.pendingWrite.then(() => this.database!.apiState.deleteMany({ where: { key: id } })).catch((error: unknown) => console.error("Could not delete marketplace state:", error));
  }

  private deleteAllFromDatabase() {
    if (!this.database) return;
    this.pendingWrite = this.pendingWrite.then(() => this.database!.apiState.deleteMany({ where: { key: { startsWith: `${this.name}:` } } })).catch((error: unknown) => console.error("Could not clear marketplace state:", error));
  }

  private save() {
    const temp = `${this.file}.tmp`;
    writeFileSync(temp, JSON.stringify([...this.entries()]), "utf8");
    renameSync(temp, this.file);
  }
}

export async function restorePersistentMaps(client: PrismaClient) {
  for (const map of maps) await map.restore(client);
}

export async function flushPersistentMaps() {
  await Promise.all([...maps].map((map) => map.flush()));
}
