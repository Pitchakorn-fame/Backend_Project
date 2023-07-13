import { PrismaClient } from "@prisma/client";
import { IContent, ICreateContent } from "../entities";
import { IRepositoryContent } from ".";

export function newRepositoryContent(db: PrismaClient): IRepositoryContent {
  return new RepositoryContent(db);
}

class RepositoryContent implements IRepositoryContent {
  db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async createContent(content: ICreateContent): Promise<IContent> {
    return this.db.content.create({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
            password: false,
          },
        },
      },
      data: {
        ...content,
        userId: undefined,
        postedBy: {
          connect: {
            id: content.userId,
          },
        },
      },
    });
  }

  async getContents(): Promise<IContent[]> {
    return await this.db.content.findMany({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
            password: false,
          },
        },
      },
    });
  }

  async getContent(id: number): Promise<IContent | null> {
    return await this.db.content
      .findUnique({
        where: { id },
        include: {
          postedBy: {
            select: {
              id: true,
              username: true,
              name: true,
              registeredAt: true,
              password: false,
            },
          },
        },
      })
      .then((content) => {
        if (!content) {
          return Promise.reject(`content ${id} not found`);
        }
        return Promise.resolve(content);
      })
      .catch((err) => Promise.reject(`failed to get content ${id}: ${err}`));
  }

  async deleteContent(id: number): Promise<void> {
    return await this.db.content
      .delete({
        where: { id },
      })
      .then((_) => Promise.resolve())
      .catch((err) => Promise.reject(`failed to delete content ${id}: ${err}`));
  }

  async updateContent(
    id: number,
    comment: string,
    rating: number
  ): Promise<IContent> {
    return await this.db.content.update({
      where: { id },
      data: {
        comment,
        rating,
      },
    });
  }
}
