import { html, css, LitElement } from "lit";

export class NotePage extends LitElement {
  static styles = css``;

  static properties = {
    name: { type: String },
  };

  constructor() {
    super();

    this.name = "Somebody";
  }

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
