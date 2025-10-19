export type AuthedUser = {
  tgId: bigint;
  username: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}