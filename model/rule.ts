type RuleSelector = ["rule", string];

type Role = "admin" | "user" | "guest";

interface Rule {
  permission?: "admin" | "user" | "guest";
  auth?: boolean;
}

interface CRUDRule {
  create_rule?: Rule;
  read_rule?: Rule;
  update_rule?: Rule;
  delete_rule?: Rule;
}

export type { CRUDRule, Role, Rule, RuleSelector };
