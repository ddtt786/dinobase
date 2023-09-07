import { useSignal } from "@preact/signals";
import { Columns, ColumnType } from "@/model/column.ts";
import { ColumnInfo } from "@/islands/CreateColumnList.tsx";

export default function CreateColumnOptions(
  props: {
    index: number;
    column: ColumnInfo;
    changeList: (i: number, c: ColumnInfo | number) => void;
  },
) {
  const name = useSignal(props.column.name);
  const columnType = useSignal(props.column.type);
  const relation = useSignal<[string, string?] | undefined>(
    props.column.relation,
  );
  const unique = useSignal(props.column.unique);
  const min = useSignal<number | undefined>(props.column.min);
  const max = useSignal<number | undefined>(props.column.max);
  const lock = useSignal(props.column.lock);
  const optional = useSignal(props.column.optional);

  const change = (e: Event) => {
    switch ((e.target as HTMLElement).id) {
      case "columnname":
        {
          const target = e.target as HTMLInputElement;
          name.value = target.value;
        }
        break;
      case "type":
        {
          const target = e.target as HTMLSelectElement;
          /**@ts-ignore */
          columnType.value = target.value;
        }
        break;
      case "relation":
        {
          const target = e.target as HTMLInputElement;
          /**@ts-ignore */
          relation.value = target.value.split(",");
        }
        break;
      case "unique":
        {
          const target = e.target as HTMLSelectElement;
          unique.value = target.value == "true";
        }
        break;
      case "min":
        {
          const target = e.target as HTMLInputElement;
          min.value = target.value ? Number(target.value) : undefined;
        }
        break;
      case "max":
        {
          const target = e.target as HTMLInputElement;
          max.value = target.value ? Number(target.value) : undefined;
        }
        break;
      case "lock":
        {
          const target = e.target as HTMLSelectElement;
          lock.value = target.value == "true";
        }
        break;
      case "optional":
        {
          const target = e.target as HTMLSelectElement;
          optional.value = target.value == "true";
        }
        break;
    }
    props.changeList(props.index, {
      name: name.value,
      type: columnType.value as ColumnType,
      relation: relation.value,
      unique: unique.value,
      min: min.value,
      max: max.value,
      optional: optional.value,
      lock: lock.value,
    });
  };
  return (
    <>
      <div class="field-body is-grouped box">
        <div class="field">
          <p class="control">
            <input
              id="columnname"
              class="input"
              type="text"
              placeholder="name"
              onChange={change}
              value={props.column.name}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              유형
            </a>
          </p>
          <p class="control">
            <div class="select">
              <select id="type" onChange={change}>
                <option value="string" selected>string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="file">file</option>
                <option value="timestamp">timestamp</option>
                <option value="auth">auth</option>
              </select>
            </div>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              관계
            </a>
          </p>
          <p class="control">
            <input
              id="relation"
              class="input"
              type="text"
              placeholder="relation"
              onChange={change}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
            </a>
          </p>
          <p class="control">
            <input
              id="min"
              class="input"
              type="number"
              placeholder="min"
              onChange={change}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
            </a>
          </p>
          <p class="control">
            <input
              id="max"
              class="input"
              type="number"
              placeholder="max"
              onChange={change}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              고유함
            </a>
          </p>
          <p class="control">
            <div class="select">
              <select id="unique" onChange={change}>
                <option value="true">
                  true
                </option>
                <option value="false" selected>
                  false
                </option>
              </select>
            </div>
          </p>
        </div>

        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              수정 불가
            </a>
          </p>
          <p class="control">
            <div class="select">
              <select id="lock" onChange={change}>
                <option value="true">true</option>
                <option value="false" selected>
                  false
                </option>
              </select>
            </div>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              선택적
            </a>
          </p>
          <p class="control">
            <div class="select">
              <select id="optional" onChange={change}>
                <option value="true">
                  true
                </option>
                <option value="false" selected>
                  false
                </option>
              </select>
            </div>
          </p>
        </div>
        <p
          class="control"
          onClick={() => {
            props.changeList(props.index, 0);
          }}
        >
          <button class="button is-danger is-outlined">삭제</button>
        </p>
      </div>
    </>
  );
}
