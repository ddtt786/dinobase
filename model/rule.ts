type RuleSelector = ["rule", string];

type Role = "admin" | "user" | "guest";

interface Rule {
  permission?: "admin" | "user" | "guest";
  auth?: boolean;
}

interface CURDRule {
  create_rule?: Rule;
  update_rule?: Rule;
  read_rule?: Rule;
  delete_rule?: Rule;
}

export type { RuleSelector, Role, Rule, CURDRule };
