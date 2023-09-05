import { validateSheet } from "@/lib/validation.ts";
import { createSheet } from "@/db/sheet.ts";
import { parse } from "path";

async function uploadFile(
  filename: string,
  owner: string,
  data: Uint8Array | ReadableStream<Uint8Array>,
): Promise<string> {
  const uuid = crypto.randomUUID();
  const { name, ext } = parse(filename);
  const path = `./storage/${uuid}${ext}`;
  await Deno.writeFile(path, data);
  await validateSheet(
    {
      action: "create",
      note: "storage",
      role: "admin",
    },
    {
      name,
      ext,
      path: uuid,
      owner,
    },
  );
  return await createSheet("storage", {
    name,
    ext,
    path: uuid,
    owner,
  });
}

export { uploadFile };
