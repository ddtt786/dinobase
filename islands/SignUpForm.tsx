import { useSignal } from "@preact/signals";

export default function SignUpForm() {
  const username = useSignal("");
  const password = useSignal("");
  const submit = async () => {
    await fetch("/api/init", {
      method: "POST",
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    }).then(async (d) => {
      if (d.ok) {
        localStorage.userUUID = await d.text();
        location.pathname = "/signin";
      } else {
        alert("이미 init 되었습니다.");
        location.pathname = "/signin";
      }
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
              관리자 가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
