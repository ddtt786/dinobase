import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    return new Response(await Deno.readFile(`./storage/${ctx.params.name}`));
  },
};
