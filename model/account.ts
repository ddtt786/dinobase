import { Role } from "./rule.ts";

interface Account {
  username: string;
  password: string;
  profile_image: string;
  role: Role;
  created_at: number;
}

export type { Account };
