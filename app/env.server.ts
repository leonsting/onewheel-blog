import invariant from "tiny-invariant";

export function getEnv() {
  invariant(process.env.ADMIN_EMAIL, "ADMIN_EMAIL should be defined");
  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  };
}

export type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
