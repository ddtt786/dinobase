import { Router } from "oak";
import { Init } from "./init.ts";
import { Logout, SignIn, SignUp } from "./account.ts";
import {
  ChangeNoteData,
  CreateNote,
  DeleteNote,
  GetNoteInfo,
  GetNoteList,
} from "./note.ts";
import {
  ChangeSheetData,
  CreateSheet,
  DeleteSheet,
  GetSheetData,
  Search,
} from "./sheet.ts";

const api = new Router();

api.post("/init", Init);
api.post("/signup", SignUp);
api.post("/signin", SignIn);
api.post("/logout", Logout);

api.post("/createnote", CreateNote);
api.get("/notelist", GetNoteList);
api.get("/note/:name", GetNoteInfo);
api.patch("/note/:name", ChangeNoteData);
api.delete("/note/:name", DeleteNote);
api.post("/createsheet/:name", CreateSheet);
api.get("/sheet/:note/:uuid", GetSheetData);
api.patch("/sheet/:note/:uuid", ChangeSheetData);
api.delete("/sheet/:note/:uuid", DeleteSheet);
api.get("/search/:note/:column", Search);

export default api;
