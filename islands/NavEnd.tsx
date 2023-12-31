import { useSignal } from "@preact/signals";

export default function NavEnd() {
  const uuid = window.localStorage.getItem("userUUID");
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    window.localStorage.removeItem("userUUID");
    location.pathname = "/signin";
  };
  return (
    <>
      {uuid
        ? (
          <a class="navbar-item" onClick={logout}>
            로그아웃
          </a>
        )
        : null}
    </>
  );
}
