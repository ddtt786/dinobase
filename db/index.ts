import { VariableSelector } from "../model/index.ts";
import { CreateAccount, createAccount } from "./account.ts";
import { kv } from "./kv.ts";
import { createNote } from "./note.ts";
import { createSheet } from "./sheet.ts";

async function getVariable(name: string) {
  return (await kv.get(<VariableSelector>["variable", name])).value;
}

async function setVariable(name: string, value: Deno.KvKeyPart) {
  await kv.set(<VariableSelector>["variable", name], value);
}

async function init(account: CreateAccount): Promise<string | undefined> {
  if (await getVariable("init")) return;
  await setVariable("init", true);

  await createNote("account", {
    username: { type: "string", unique: true },
    password: { type: "string" },
    profile_image: { type: "file", optional: true },
    role: { type: "string" },
    created_at: { type: "timestamp" },
  });

  await createNote("storage", {
    name: { type: "string", unique: true },
    ext: { type: "string" },
    path: { type: "string" },
    owner: { type: "string", relation: ["account"] },
    created_at: { type: "timestamp" },
  });

  return await createAccount(account, "admin");
}

export { init };
