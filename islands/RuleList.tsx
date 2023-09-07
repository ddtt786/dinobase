import { CRUDRule } from "@/model/rule.ts";
import RuleOptions from "@/islands/RuleOptions.tsx";

export default function RuleList(props: { note: string; rules?: CRUDRule }) {
  return (
    <>
      <div class="field">
        <label class="label">생성 규칙</label>
        <RuleOptions
          note={props.note}
          name="create_rule"
          rule={props.rules?.create_rule}
        />
      </div>
      <div class="field">
        <label class="label">읽기 규칙</label>
        <RuleOptions
          note={props.note}
          name="read_rule"
          rule={props.rules?.read_rule}
        />
      </div>
      <div class="field">
        <label class="label">수정 규칙</label>
        <RuleOptions
          note={props.note}
          name="update_rule"
          rule={props.rules?.update_rule}
        />
      </div>
      <div class="field">
        <label class="label">삭제 규칙</label>
        <RuleOptions
          note={props.note}
          name="delete_rule"
          rule={props.rules?.delete_rule}
        />
      </div>
    </>
  );
}
