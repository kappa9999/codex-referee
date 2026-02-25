import Database from "better-sqlite3";

export interface StoreConfig {
  dbPath: string;
}

export function openStore(config: StoreConfig): Database.Database {
  return new Database(config.dbPath);
}
