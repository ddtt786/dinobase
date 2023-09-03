import { NotePage } from "../pages/note.js";
import { router } from "./router.js";

customElements.define("note-page", NotePage);

router.check();
