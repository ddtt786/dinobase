import { Rule } from "@/model/rule.ts";

export default function RuleOptions(
  props: { note: string; name: string; rule?: Rule },
) {
  const change = (event: Event) => {
    const changeValue = (
      n: string,
      v: string | boolean,
    ) => {
      {
        const target = event.target as HTMLInputElement;
        target.disabled = true;
        fetch(`/api/note/${props.note}`, {
          method: "PATCH",
          body: JSON.stringify({
            columns: {},
            rule: {
              [props.name]: {
                [n]: v,
              },
            },
          }),
        }).then((d) => {
          target.disabled = false;
          if (!d.ok) {
            target.value = (props.rule as any)[n]?.toString() ?? "true";
          }
        });
      }
    };
    switch ((event.target as HTMLElement).id) {
      case "permission":
        {
          const target = event.target as HTMLSelectElement;
          target.disabled = true;
          changeValue("permission", target.value);
        }
        break;
      case "auth":
        {
          const target = event.target as HTMLSelectElement;
          target.disabled = true;
          changeValue("auth", target.value == "true" ? true : false);
        }
        break;
    }
  };
  return (
    <div class="field-body is-grouped">
      <div class="field has-addons is-flex-grow-0">
        <p class="control">
          <a class="button is-static">
            필요 권한
          </a>
        </p>
        <p class="control">
          <div class="select">
            <select id="permission" onChange={change}>
              <option
                value="admin"
                selected={props.rule?.permission == "admin"}
              >
                관리자
              </option>
              <option value="user" selected={props.rule?.permission == "user"}>
                계정 있음
              </option>
              <option
                value="guest"
                selected={!props.rule?.permission ||
                  props.rule?.permission == "guest"}
              >
                아무나
              </option>
            </select>
          </div>
        </p>
      </div>
      <div class="field has-addons">
        <p class="control">
          <a class="button is-static">
            auth 활성화
          </a>
        </p>
        <p class="control">
          <div class="select">
            <select id="auth" onChange={change}>
              <option
                value="true"
                selected={props.rule?.auth === undefined || props.rule?.auth}
              >
                true
              </option>
              <option value="false" selected={props.rule?.auth === false}>
                false
              </option>
            </select>
          </div>
        </p>
      </div>
    </div>
  );
}
