import { AppProps } from "$fresh/server.ts";
import NavEnd from "@/islands/NavEnd.tsx";

export default function Layout({ Component }: AppProps) {
  return (
    <div>
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item title" href="/">
            DINOBASE
          </a>
        </div>
        <div class="navbar-end">
          <NavEnd />
        </div>
      </nav>
      <div class="m-3">
        <Component />
      </div>
    </div>
  );
}
