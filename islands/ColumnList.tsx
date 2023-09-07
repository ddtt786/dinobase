import { Columns } from "@/model/column.ts";
import ColumnOptions from "@/islands/ColumnOptions.tsx";

export default function ColumnList(props: { note: string; columns: Columns }) {
  return (
    <>
      {Object.entries(props.columns).map(([key, value]) => (
        <div class="field">
          <label class="label">{key}</label>
          <ColumnOptions note={props.note} name={key} column={value} />
        </div>
      ))}
    </>
  );
}
