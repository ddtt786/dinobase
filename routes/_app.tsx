import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>dinobase_fresh</title>
        <link rel="stylesheet" href="/bulma.css"></link>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
