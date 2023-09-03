import { html, css, LitElement } from "lit";
import { query } from "lit/decorators/query.js";

export class InitPage extends LitElement {
  static styles = css``;

  static properties = {
    name: { type: String },
  };

  constructor() {
    super();

    this.name = "Somebody";
  }

  render() {
    return html`
      <form>
        <input type="text" />
        <input type="password" />
        <input type="submit" />
      </form>
    `;
  }
}
