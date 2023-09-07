import { useSignal } from "@preact/signals";
import { Column, Columns } from "@/model/column.ts";
import CreateColumnOptions from "@/islands/CreateColumnOptions.tsx";

export interface ColumnInfo extends Column {
  name: string;
}

export default function CreateColumnList(
  props: { update: (u: ColumnInfo[]) => void },
) {
  const columnList = useSignal<ColumnInfo[]>([]);

  const change = (i: number, column: ColumnInfo | number) => {
    if (typeof column == "number") {
      columnList.value = columnList.value.filter((_, _i) => {
        return _i != i;
      });
    } else {
      columnList.value = columnList.value.map((v, _i) => {
        if (_i == i) {
          return column;
        } else {
          return v;
        }
      });
    }
    /**columnList가 분명 정상적으로 업데이트 됨에도 불구하고 preact가 특정 값을 다시 렌더하지 않아 오류가 발생함.*/
    props.update(columnList.value);
    console.log(columnList.value);
  };
  const add = () => {
    columnList.value = columnList.value.concat([{
      name: "column",
      type: "string",
    }]);
  };

  return (
    <>
      <div class="field">
        {columnList.value.map((column, i) => (
          <CreateColumnOptions
            index={i}
            column={column}
            changeList={change}
          />
        ))}
      </div>
      <div class="field">
        <div class="mt-5">
          <button class="button" onClick={add}>추가</button>
        </div>
      </div>
    </>
  );
}
