import { Handlers } from "$fresh/server.ts";
import { Session } from "fresh_session";
import { getSheet } from "@/db/sheet.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { session } = ctx.state;
    try {
      if (
        (await getSheet("account", (session as Session).get("user_uuid")))
          .role !=
          "admin"
      ) {
        return ctx.renderNotFound();
      } else {
        return ctx.render();
      }
    } catch (_) {
      return ctx.renderNotFound();
    }
  },
};

export default function CreateNotePage() {
  return (
    <>
    </>
  );
}
