import { init } from "../../db/index.ts";

class DenoBase {
  constructor(url) {
    this.url = url;
  }

  fetch(url, d) {
    return fetch(`${this.url}/api/${url}`, d);
  }

  async init(username, password) {
    return (
      await this.fetch("init", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      })
    ).body;
  }

  async signin(username, password) {
    await this.fetch("signin", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  async signup(username, password) {
    await this.fetch("signup", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }
}

function denobase(url) {
  return new DenoBase(url);
}

export { denobase };
