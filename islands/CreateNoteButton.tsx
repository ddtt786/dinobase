export default function CreateNoteButton() {
  return (
    <button
      class="button mt-2"
      onClick={() => location.pathname = "/note/create"}
    >
      추가
    </button>
  );
}
