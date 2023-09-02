import { validateSheet } from "../lib/validation.ts";
import { StorageFile } from "../model/storage.ts";
import { createSheet } from "./sheet.ts";
import { basename, extname } from "path";

async function uploadFile(
  name: string,
  owner: string,
  data: Uint8Array | ReadableStream<Uint8Array>
): Promise<string> {
  const uuid = crypto.randomUUID();
  const path = `./storage/${uuid}${extname(name)}`;
  await Deno.writeFile(path, data);
  await validateSheet(
    {
      action: "create",
      note: "storage",
      role: "admin",
    },
    {
      name: basename(name),
      ext: extname(name),
      path: uuid,
      owner,
    }
  );
  return await createSheet("storage", {
    name: basename(name),
    ext: extname(name),
    path: uuid,
    owner,
  });
}

export { uploadFile };
