import { AppProps } from "$fresh/server.ts";
import NavEnd from "@/islands/NavEnd.tsx";

export default function Layout({ Component }: AppProps) {
  return (
    <div>
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item">
            <h1 class="title">DINOBASE</h1>
          </a>
        </div>
        <div class="navbar-end">
          <NavEnd></NavEnd>
        </div>
      </nav>
      <Component />
    </div>
  );
}
