import { Note as _Note } from "@/model/note.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getSheet, search } from "@/db/sheet.ts";
import { Session } from "fresh_session";
import { getColumns, getNoteInfo, getNoteRule } from "@/db/note.ts";
import { Columns } from "@/model/column.ts";
import { CRUDRule, Rule } from "@/model/rule.ts";
import ColumnList from "@/islands/ColumnList.tsx";
import RuleList from "@/islands/RuleList.tsx";
import { InfoCache } from "https://deno.land/x/esbuild_deno_loader@0.8.1/src/deno.ts";
import DeleteNote from "@/islands/DeleteNote.tsx";

export const handler: Handlers<
  { info: _Note; columns: Columns; rules?: CRUDRule }
> = {
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
        const info = await getNoteInfo(ctx.params.note);
        const columns = await getColumns(ctx.params.note);
        const rules = await getNoteRule(ctx.params.note);
        return ctx.render({ info, columns, rules });
      }
    } catch (_) {
      return ctx.renderNotFound();
    }
  },
};

export default function NoteInfoPage(
  props: PageProps<{ info: _Note; columns: Columns; rules?: CRUDRule }>,
) {
  return (
    <>
      <div class="block">
        <h1 class="title is-1">{props.data.info.title}</h1>
      </div>
      <div class="block">
        <h2 class="title is-3">columns</h2>
        <ColumnList note={props.data.info.title} columns={props.data.columns} />
      </div>
      <div class="block">
        <h2 class="title is-3">rules</h2>
        <RuleList note={props.data.info.title} rules={props.data.rules} />
      </div>
      <div class="block pt-5">
        <h2 class="title is-3">Delete note</h2>
        <DeleteNote note={props.data.info.title} />
      </div>
    </>
  );
}
