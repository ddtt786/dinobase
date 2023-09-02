import { compare } from "https://deno.land/x/bcrypt@v0.4.1/src/main.ts";
import { validateSheet } from "../lib/validation.ts";
import { Account } from "../model/account.ts";
import { Role } from "../model/rule.ts";
import { createSheet, getSheet, search } from "./sheet.ts";
import { hash } from "bcrypt";
import { ValidateError } from "../errors/validate.ts";

interface CreateAccount {
  username: string;
  password: string;
  profile_image?: string;
  role: Role;
}

async function createAccount(
  account: CreateAccount,
  role?: Role
): Promise<string> {
  await validateSheet(
    {
      note: "account",
      action: "create",
      role: role ? account.role : "user",
    },
    {
      username: account.username,
      password: await hash(account.password),
      profile_image: account.profile_image,
      role: role ? role : "user",
    }
  );
  return await createSheet("account", {
    username: account.username,
    password: await hash(account.password),
    profile_image: account.profile_image,
    role: role ? role : "user",
  });
}

async function auth(username: string, password: string): Promise<boolean> {
  const { data } = await search("account", "username", {
    value: username,
  });
  /** @ts-ignore */
  const account: Account = await getSheet("account", data[0]);
  return await compare(password, account.password);
}

async function authSignIn(
  username: string,
  password: string
): Promise<[Account, string]> {
  const { data } = await search("account", "username", {
    value: username,
  });
  /** @ts-ignore */
  const account: Account = await getSheet("account", data[0]);
  if (await compare(password, account.password)) {
    return [account, data[0]];
  } else {
    throw new ValidateError({ code: "forbidden" });
  }
}

async function IsAdmin(uuid: string): Promise<boolean> {
  /** @ts-ignore */
  const account: Account = await getSheet("account", uuid);

  return account.role == "admin";
}

export type { CreateAccount };
export { createAccount, auth, authSignIn, IsAdmin };
