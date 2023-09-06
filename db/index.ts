import { VariableSelector } from "@/model/index.ts";
import { CreateAccount, createAccount } from "@/db/account.ts";
import { kv } from "@/db/kv.ts";
import { createNote } from "@/db/note.ts";

async function getVariable(name: string) {
  return (await kv.get(["variable", name] as VariableSelector)).value;
}

async function setVariable(name: string, value: Deno.KvKeyPart) {
  await kv.set(["variable", name] as VariableSelector, value);
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
  }, {
    create_rule: {
      permission: "admin",
    },
    read_rule: {
      permission: "admin",
    },
    update_rule: {
      permission: "admin",
    },
    delete_rule: {
      permission: "admin",
    },
  });

  await createNote("storage", {
    name: { type: "string" },
    ext: { type: "string" },
    path: { type: "string" },
    owner: { type: "string", relation: ["account"], optional: true },
    created_at: { type: "timestamp" },
  }, {
    create_rule: {
      permission: "guest",
    },
    read_rule: {
      auth: false,
      permission: "guest",
    },
    update_rule: {
      permission: "admin",
    },
    delete_rule: {
      permission: "admin",
    },
  });

  return await createAccount(account, "admin");
}

export { getVariable, init };
