import { VariableSelector } from "../model/index.ts";
import { kv } from "./kv.ts";
import { createNote } from "./note.ts";

async function getVariable(name: string) {
  return (await kv.get(<VariableSelector>["variable", name])).value;
}

async function init() {
  if (!(await getVariable("init"))) return;

  createNote("account", "god", {
    username: { type: "string", unique: true },
    password: { type: "string" },
    profile_image: { type: "file" },
    role: { type: "string" },
    created_at: { type: "timestamp" },
  });
}

export { init };
