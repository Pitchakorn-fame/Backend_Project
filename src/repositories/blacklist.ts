import { RedisClientType } from "redis";
import { IRepositoryBlacklist } from ".";

export function newRepositoryBlacklist(
  db: RedisClientType<any, any, any>
): IRepositoryBlacklist {
  return new RepositoryBlacklist(db);
}

const keyBlacklist = "content-blacklist";

class RepositoryBlacklist implements IRepositoryBlacklist {
  private db: RedisClientType<any, any, any>;

  constructor(db: RedisClientType<any, any, any>) {
    this.db = db;
  }

  async addToBlacklist(token: string): Promise<void> {
    await this.db.sAdd(keyBlacklist, token);
  }

  async isBlacklist(token: string): Promise<boolean> {
    return this.db.sIsMember(keyBlacklist, token);
  }
}
