import { Handlers } from "$fresh/server.ts";
import { ColumnNotFoundError } from "@/errors/note.ts";
import { getSheet } from "@/db/sheet.ts";
import { StorageFile } from "@/model/storage.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { path, ext } = await getSheet(
        "storage",
        ctx.params.name,
      ) as unknown as StorageFile;
      return new Response(await Deno.readFile(`./storage/${path}${ext}`));
    } catch (error) {
      if (ColumnNotFoundError) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
      console.log(error);
      return new Response(null, {
        status: 500,
      });
    }
  },
};
