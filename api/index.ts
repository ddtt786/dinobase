import { Router } from "oak";
import { Init } from "./init.ts";
import { SignIn, SignUp } from "./account.ts";
import {
  ChangeNoteData,
  CreateNote,
  GetNoteInfo,
  GetNoteList,
} from "./note.ts";
import { ChangeSheetData, CreateSheet, GetSheetData } from "./sheet.ts";

const api = new Router();

api.post("/init", Init);
api.post("/signup", SignUp);
api.post("/signin", SignIn);

api.post("/createnote", CreateNote);
api.get("/notelist", GetNoteList);
api.get("/note/:name", GetNoteInfo);
api.post("/createsheet/:name", CreateSheet);
api.patch("/note/:name", ChangeNoteData);
api.get("/sheet/:note/:uuid", GetSheetData);
api.patch("/sheet/:note/:uuid", ChangeSheetData);

export default api;
