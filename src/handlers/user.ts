import { IRepositoryBlacklist, IRepositoryUser } from "../repositories";
import { Response } from "express";
import { compareHash, hashPassword } from "../auth/bcrypt";

import { JwtAuthRequest, Payload, newJwt } from "../auth/jwt";
import { AppRequest, Empty, IHandlerUser, WithUser } from ".";

//----------------------------------------------
// type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

// interface AppRequest<Params, Body> extends Request<Params, any, Body> {}

// interface Empty {}

// interface WithUser {
//   username: string;
//   name: string;
//   password: string;
// }

// interface IHandlerUser {
//   register: HandlerFunc<AppRequest<Empty, WithUser>>;
//   login: HandlerFunc<AppRequest<Empty, WithUser>>;
// }

//----------------------------------------------

export function newHandlerUser(
  repo: IRepositoryUser,
  repoBlacklist: IRepositoryBlacklist
): IHandlerUser {
  return new HandlerUser(repo, repoBlacklist);
}

class HandlerUser implements IHandlerUser {
  private repo: IRepositoryUser;
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist) {
    this.repo = repo;
    this.repoBlacklist = repoBlacklist;
  }

  async register(
    req: AppRequest<Empty, WithUser>,
    res: Response
  ): Promise<Response> {
    const { username, name, password } = req.body;
    if (!username || !name || !password) {
      return res
        .status(400)
        .json({ error: "missing username or name or  password" })
        .end();
    }

    return this.repo
      .createUser({ username, name, password: hashPassword(password) })
      .then((user) =>
        res
          .status(201)
          .json({ ...user, password: undefined })
          .end()
      )
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `failed to create user ${username}` })
          .end();
      });
  }

  async login(
    req: AppRequest<Empty, WithUser>,
    res: Response
  ): Promise<Response> {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(500)
        .json({ error: "missing username or password" })
        .end();
    }

    return this.repo
      .getUser(username)
      .then((user) => {
        if (!compareHash(password, user.password)) {
          return res
            .status(401)
            .json({ error: "invalid username or password", statusCode:401 })
            .end();
        }

        const payload: Payload = { id: user.id, username: user.username };
        const token = newJwt(payload);
        //console.log(token);

        return res
          .status(201)
          .json({
            status: "logged in",
            user: { ...user, password: undefined },
            id: user.id,
            accessToken: token,
          })
          .end();
      })
      .catch((err) => {
        console.error(`failed to get user: ${err}`);
        return res.status(500).end();
      });
  }

  async logout(
    req: JwtAuthRequest<Empty, Empty>,
    res: Response
  ): Promise<Response> {
    return await this.repoBlacklist
      .addToBlacklist(req.token)
      .then(() =>
        res.status(201).json({ status: `logged out`, token: req.token }).end()
      )
      .catch((err) => {
        console.error(err);
        return res
          .status(500)
          .json({ error: `couldn't log out with token ${req.token}` })
          .end();
      });
  }
}
