import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { uploadFile } from "@/db/storage.ts";
import { ValidateError } from "@/errors/validate.ts";
import { Role } from "@/model/rule.ts";
import { validateSheet } from "@/lib/validation.ts";
import { parse } from "$std/path/win32.ts";

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const { session } = ctx.state;
    const form = await _req.formData();
    const file = form.get("file") as File;

    const uuid: string = session.get("user_uuid");
    const role: Role = session.get("role") ?? "guest";

    if (!file) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const result = await file.stream().getReader().read();
      if (!result.value) {
        return new Response(null, {
          status: 400,
        });
      }
      const { name, ext } = parse(file.name);
      await validateSheet(
        {
          action: "create",
          note: "storage",
          role,
        },
        {
          name,
          ext,
          path: crypto.randomUUID(),
          owner: uuid,
        },
      );
      const fileUUID = await uploadFile(file.name, uuid, result.value);
      return new Response(fileUUID, {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ValidateError) {
        if (error.data.code == "forbidden") {
          return new Response(JSON.stringify(error.data), {
            status: 403,
          });
        }
        return new Response(JSON.stringify(error.data), {
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
