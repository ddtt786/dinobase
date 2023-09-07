import { useSignal } from "@preact/signals";

export default function DeleteNote(props: { note: string }) {
  const confirm = useSignal(false);
  const del = () => {
    if (!confirm.value) return;
    fetch(`/api/note/${props.note}`, {
      method: "DELETE",
    }).then((d) => {
      if (d.ok) {
        alert("삭제되었습니다.");
        location.pathname = "/note";
      } else {
        alert("알 수 없는 오류로 노트를 삭제할 수 없습니다.");
      }
    });
  };
  return (
    <>
      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input
              type="checkbox"
              onClick={(e) => {
                confirm.value = (e.target as HTMLInputElement).checked;
              }}
            />{" "}
            이 작업을 돌이킬 수 없음을 이해합니다.
          </label>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button
            class="button is-danger is-outlined"
            onClick={del}
            disabled={!confirm.value}
          >
            삭제
          </button>
        </div>
      </div>
    </>
  );
}
