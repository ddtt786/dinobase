import CreateColumnList, { ColumnInfo } from "@/islands/CreateColumnList.tsx";
import { useSignal } from "@preact/signals";
import { Columns } from "@/model/column.ts";

export default function CreateNoteForm() {
  const columns = useSignal<ColumnInfo[]>([]);
  const title = useSignal("");
  const update = (u: ColumnInfo[]) => {
    columns.value = u;
    console.log(u);
  };

  const createNote = () => {
    const c: Columns = {};
    columns.value.forEach((v) => {
      const key = v.name;
      /**@ts-ignore */
      delete v.name;
      c[key] = v;
    });
    fetch(`/api/note/`, {
      method: "POST",
      body: JSON.stringify({
        name: title.value,
        columns: c,
      }),
    }).then((d) => {
      if (d.ok) {
        location.pathname = "/note";
      } else {
        alert("잘못된 요청입니다. 노트를 다시 확인하세요.");
      }
    });
  };

  return (
    <>
      <div class="block">
        <h1 class="title is-1">Note creation</h1>
      </div>
      <div class="block">
        <input
          class="input"
          placeholder="name"
          onChange={(e) => title.value = (e.target as HTMLInputElement).value}
        >
        </input>
      </div>
      <div class="block">
        <h1 class="title is-3">columns</h1>
        <CreateColumnList update={update} />
      </div>
      <div class="block">
        <div class="button" onClick={createNote}>
          노트 생성
        </div>
      </div>
    </>
  );
}
