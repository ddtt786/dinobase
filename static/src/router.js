import { Router } from "router";

export const router = new Router();
const app = document.querySelector("#app");

router
  .add("/", () => {
    router.navigate("/note");
  })
  .add("/note", () => {
    changeComponent(app, "note-page");
  });

/**
 *
 * @param {HTMLDivElement} target
 * @param {string} component
 */
function changeComponent(target, component) {
  target.innerHTML = "";
  target.append(document.createElement(component));
}
