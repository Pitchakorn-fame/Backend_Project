import { Response } from "express";
import {
  Empty,
  IHandlerContent,
  WithContent,
  WithContentId,
  WithContentUpdate,
} from ".";
import { JwtAuthRequest } from "../auth/jwt";
import { IRepositoryContent } from "../repositories";
import { ICreateContentDto } from "../entities";
import { getVideoDetails } from "../domain/services/oembed";

export function newHandlerContent(
  repoContent: IRepositoryContent
): IHandlerContent {
  return new HandlerContent(repoContent);
}

class HandlerContent implements IHandlerContent {
  private repo: IRepositoryContent;

  constructor(repo: IRepositoryContent) {
    this.repo = repo;
  }

  async createContent(
    req: JwtAuthRequest<WithContentId, WithContent>,
    res: Response
  ): Promise<Response> {
    const createContent: ICreateContentDto = req.body;

    if (!createContent.videoUrl) {
      return res
        .status(400)
        .json({ error: "missing videoUrl in json body" })
        .end();
    }

    if (!createContent.comment) {
      return res
        .status(400)
        .json({ error: "missing comment in json body" })
        .end();
    }

    if (!createContent.rating) {
      return res
        .status(400)
        .json({ error: "missing rating in json body" })
        .end();
    }

    const details = await getVideoDetails(createContent.videoUrl);
    const userId = req.payload.id;

    return this.repo
      .createContent({ ...details, ...createContent, userId })
      .then((content) => res.status(201).json(content).end())
      .catch((err) => {
        console.error(`failed to create content: ${err}`);
        return res
          .status(500)
          .json({ error: `failed to create content` })
          .end();
      });
  }

  async getContents(req: Empty, res: Response): Promise<Response> {
    return this.repo
      .getContents()
      .then((contents) => res.status(201).json(contents).end())
      .catch((err) => {
        console.error(`failed to get contents: ${err}`);
        return res.status(500).json({ error: `failed to get contents` }).end();
      });
  }

  async getContent(
    req: JwtAuthRequest<WithContentId, WithContent>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${id} is not a number` })
        .end();
    }

    return this.repo
      .getContent(id)
      .then((content) => {
        if (!content) {
          return res
            .status(404)
            .json({ error: `no such content: ${id}` })
            .end();
        }

        return res.status(200).json(content).end();
      })
      .catch((err) => {
        const errMsg = `failed to get content ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg });
      });
  }

  async deleteContent(
    req: JwtAuthRequest<WithContentId, WithContent>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${id} is not a number` })
        .end();
    }

    return this.repo
      .deleteContent(id)
      .then((deleted) => res.status(200).json(deleted).end())
      .catch((err) => {
        console.error(`failed to delete content ${id}: ${err}`);
        return res
          .status(500)
          .json({ error: `failed to delete content ${id}` });
      });
  }

  async updateContent(
    req: JwtAuthRequest<WithContentId, WithContentUpdate>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` });
    }
    const { comment, rating } = req.body;

    if (!comment || !rating) {
      return res
        .status(400)
        .json({ error: "missing comment or rating in json body" })
        .end();
    }

    return this.repo
      .updateContent(id, comment, rating)
      .then((updated) => res.status(201).json(updated).end())
      .catch((err) => {
        const errMsg = `failed to update content ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg }).end();
      });
  }
}
