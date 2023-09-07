import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <h1 class="title is-1 has-text-danger">404!</h1>
    </>
  );
}
