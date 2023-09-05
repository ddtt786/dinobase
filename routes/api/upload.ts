import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { uploadFile } from "@/db/storage.ts";
import { ValidateError } from "@/errors/validate.ts";

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const { session } = ctx.state;
    const form = await _req.formData();

    const file = form.get("file") as File;
    const uuid: string = session.get("user_uuid");

    if (!file) {
      return new Response("", {
        status: 400,
      });
    }

    try {
      const result = await file.stream().getReader().read();
      if (!result.value) {
        return new Response("", {
          status: 400,
        });
      }
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
      return new Response("", {
        status: 500,
      });
    }
  },
};
