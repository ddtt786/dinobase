import { Router } from "oak";
import { Init } from "./init.ts";
import { SignIn, SignUp } from "./account.ts";

const api = new Router();

api.post("/init", Init);
api.post("/signup", SignUp);
api.post("/signin", SignIn);

export default api;
