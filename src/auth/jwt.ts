import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IRepositoryBlacklist } from "../repositories";

export interface Payload {
  id: string;
  username: string;
}

const secret = process.env.JWT_SECRET || "content-secrets";

export function newJwt(data: Payload): string {
  return jwt.sign(data, secret, {
    algorithm: "HS512",
    /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
    expiresIn: "12h",
    issuer: "content-api",
    subject: "user-login",
    audience: "user",
  });
}

export interface JwtAuthRequest<Params, Body>
  extends Request<Params, any, Body> {
  token: string;
  payload: Payload;
}

export function newMiddlewareHandler(repoBlacklist) {
  return new MiddlewareHandler(repoBlacklist);
}

class MiddlewareHandler {
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repo: IRepositoryBlacklist) {
    this.repoBlacklist = repo;
  }

  async jwtMiddleware(
    req: JwtAuthRequest<any, any>,
    res: Response,
    next: NextFunction
  ) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    try {
      if (!token) {
        return res.status(401).json({ error: "missing JWT token" }).end();
      }

      const isBlacklisted = await this.repoBlacklist.isBlacklist(token);

      if (isBlacklisted) {
        return res.status(401).json({ status: `already logged out` }).end();
      }

      const decoded = jwt.verify(token, secret);
      const id = decoded["id"];
      const username = decoded["username"];

      if (!id) {
        return res.status(401).json({ error: "missing payload `id`" }).end();
      }

      if (!username) {
        return res
          .status(401)
          .json({ error: "missing payload `username`" })
          .end();
      }

      req.token = token;
      req.payload = {
        id,
        username,
      };

      return next();
    } catch (err) {
      console.error(`Auth failed for token ${token}: ${err}`);
      return res.status(400).json({ error: "authentication failed" }).end();
    }
  }
}
