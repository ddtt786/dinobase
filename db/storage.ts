import { createSheet, deleteSheet, getSheet } from "@/db/sheet.ts";
import { parse } from "path";
import { StorageFile } from "@/model/storage.ts";

async function uploadFile(
  filename: string,
  owner: string,
  data: Uint8Array | ReadableStream<Uint8Array>,
): Promise<string> {
  const uuid = crypto.randomUUID();
  const { name, ext } = parse(filename);
  const path = `./storage/${uuid}${ext}`;
  const fileUUID = await createSheet("storage", {
    name,
    ext,
    path: uuid,
    owner,
  });
  await Deno.writeFile(path, data);
  return fileUUID;
}

async function removeFile(uuid: string) {
  const { path, ext } = await getSheet(
    "storage",
    uuid,
  ) as unknown as StorageFile;
  await deleteSheet("storage", uuid);
  await Deno.remove(`./storage/${path}${ext}`);
}

export { removeFile, uploadFile };
