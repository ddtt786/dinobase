import { Column } from "@/model/column.ts";

export default function ColumnOptions(
  props: { note: string; name: string; column: Column },
) {
  const change = (event: Event) => {
    const changeValue = (
      n: string,
      v: string[] | string | number | boolean | null,
    ) => {
      {
        const target = event.target as HTMLInputElement;
        target.disabled = true;
        fetch(`/api/note/${props.note}`, {
          method: "PATCH",
          body: JSON.stringify({
            columns: {
              [props.name]: {
                type: props.column.type,
                [n]: v,
              },
            },
          }),
        }).then((d) => {
          target.disabled = false;
          if (!d.ok) {
            target.value = (props.column as any)[n]?.toString() ?? "";
          }
        });
      }
    };
    switch ((event.target as HTMLElement).id) {
      case "relation":
        {
          const target = event.target as HTMLInputElement;
          target.disabled = true;
          changeValue("relation", target?.value.split(","));
        }
        break;
      case "min":
        {
          const target = event.target as HTMLInputElement;
          changeValue("min", target.value ? Number(target.value) : null);
        }
        break;
      case "max":
        {
          const target = event.target as HTMLInputElement;
          changeValue("max", target.value ? Number(target.value) : null);
        }
        break;
      case "unique":
        {
          const target = event.target as HTMLSelectElement;
          changeValue("unique", target.value == "true" ? true : false);
        }
        break;
      case "lock":
        {
          const target = event.target as HTMLSelectElement;
          changeValue("lock", target.value == "true" ? true : false);
        }
        break;
      case "optional":
        {
          const target = event.target as HTMLSelectElement;
          changeValue("optional", target.value == "true" ? true : false);
        }
        break;
    }
  };
  return (
    <>
      <div class="field-body is-grouped">
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              유형
            </a>
          </p>
          <p class="control">
            <div class="select">
              <select>
                <option>{props.column.type}</option>
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
              value={props.column.relation?.toString()}
              disabled={props.column.type == "file"}
              onChange={change}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              {props.column.type == "number" ||
                  props.column.type == "timestamp" ||
                  props.column.type == "boolean"
                ? "최소"
                : "최소 길이"}
            </a>
          </p>
          <p class="control">
            <input
              id="min"
              class="input"
              type="number"
              placeholder="min"
              value={props.column.min}
              onChange={change}
            />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              {props.column.type == "number" ||
                  props.column.type == "timestamp" ||
                  props.column.type == "boolean"
                ? "최대"
                : "최대 길이"}
            </a>
          </p>
          <p class="control">
            <input
              id="max"
              class="input"
              type="number"
              placeholder="max"
              value={props.column.max}
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
            <div class="select" onChange={change}>
              <select id="unique">
                <option value="true" selected={props.column.unique}>
                  true
                </option>
                <option value="false" selected={!props.column.unique}>
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
                <option value="true" selected={props.column.lock}>true</option>
                <option value="false" selected={!props.column.lock}>
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
                <option value="true" selected={props.column.optional}>
                  true
                </option>
                <option value="false" selected={!props.column.optional}>
                  false
                </option>
              </select>
            </div>
          </p>
        </div>
      </div>
    </>
  );
}
