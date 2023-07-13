import { Request, Response } from "express";
import { JwtAuthRequest } from "../auth/jwt";

export type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

export interface AppRequest<Params, Body> extends Request<Params, any, Body> {}

export interface Empty {}

export interface WithUser {
  username: string;
  name: string;
  password: string;
}

export interface IHandlerUser {
  register: HandlerFunc<AppRequest<Empty, WithUser>>;
  login: HandlerFunc<AppRequest<Empty, WithUser>>;
  logout: HandlerFunc<JwtAuthRequest<Empty, Empty>>;
}

export interface WithContentId {
  id: string;
}

export interface WithContent {
  videoUrl: string;
  comment: string;
  rating: number;
}

export interface WithContentUpdate {
  comment: string;
  rating: number;
}

export interface IHandlerContent {
  createContent: HandlerFunc<JwtAuthRequest<Empty, WithContent>>;
  getContents: HandlerFunc<JwtAuthRequest<Empty, WithContent>>;
  getContent: HandlerFunc<JwtAuthRequest<WithContentId, WithContent>>;
  deleteContent: HandlerFunc<JwtAuthRequest<WithContentId, WithContent>>;
  updateContent: HandlerFunc<JwtAuthRequest<WithContentId, WithContentUpdate>>;
}
