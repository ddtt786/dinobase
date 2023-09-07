import NoteBlock from "@/islands/NoteBlock.tsx";
import { Note as _Note } from "@/model/note.ts";
import { getNoteList } from "@/db/note.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getSheet } from "@/db/sheet.ts";
import { Session } from "fresh_session";
import CreateNoteButton from "@/islands/CreateNoteButton.tsx";

export const handler: Handlers<{ list: _Note[] }> = {
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
        const list = await getNoteList();
        return ctx.render({ list });
      }
    } catch (_) {
      return ctx.renderNotFound();
    }
  },
};

export default function NoteListPage(
  props: PageProps<{ list: _Note[] }>,
) {
  return (
    <div class="block m-3">
      {props.data.list.map(({ title }) => {
        return <NoteBlock name={title}></NoteBlock>;
      })}
      <CreateNoteButton />
    </div>
  );
}
