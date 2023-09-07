interface NoteProps {
  name: string;
}

export default function NoteBlock(props: NoteProps) {
  return (
    <div
      class="box mb-2"
      style={{ cursor: "pointer" }}
      onClick={() => {
        location.pathname = `/note/${props.name}`;
      }}
    >
      <a class="title is-4" href={`/note/${props.name}`}>{props.name}</a>
    </div>
  );
}
