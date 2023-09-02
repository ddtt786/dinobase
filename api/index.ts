import { Router } from "oak";
import { Init } from "./init.ts";
import { SignIn, SignUp } from "./account.ts";
import { CreateNote, GetNoteInfo } from "./note.ts";

const api = new Router();

api.post("/init", Init);
api.post("/signup", SignUp);
api.post("/signin", SignIn);
api.post("/createnote", CreateNote);
api.get("/note/:name", GetNoteInfo);

export default api;
