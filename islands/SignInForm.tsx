import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";

export default function SignInForm() {
  const username = useSignal("");
  const password = useSignal("");
  const submit = async (event: Event) => {
    event.preventDefault();
    fetch("/api/signin", {
      method: "POST",
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    }).then(async (d) => {
      if (d.ok) {
        localStorage.userUUID = await d.text();
        location.pathname = "/note";
      }
    }).catch((e) => {
      console.log(e);
      alert("아이디 혹은 비밀번호가 잘못되었습니다.");
    });
  };

  return (
    <div class="m-3" style={{ width: "500px" }}>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">아이디</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input
                class="input"
                type="text"
                placeholder="username"
                value={username.value}
                onChange={(e) => {
                  username.value = (e.target as HTMLInputElement).value;
                }}
              />
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">비밀번호</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input
                class="input"
                type="password"
                placeholder="password"
                value={password.value}
                onChange={(e) => {
                  password.value = (e.target as HTMLInputElement).value;
                }}
              />
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label">
        </div>
        <div class="field">
          <div class="control">
            <button
              class="button is-link"
              onClick={submit}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
