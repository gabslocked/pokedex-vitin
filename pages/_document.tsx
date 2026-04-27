import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23e53e3e' stroke='%23222' stroke-width='4'/%3E%3Crect x='2' y='46' width='96' height='8' fill='%23222'/%3E%3Ccircle cx='50' cy='50' r='14' fill='%23fff' stroke='%23222' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='7' fill='%23fff' stroke='%23222' stroke-width='3'/%3E%3Cpath d='M4 50 Q50 2 96 50' fill='%23e53e3e'/%3E%3Cpath d='M4 50 Q50 98 96 50' fill='%23f5f5f5'/%3E%3C/svg%3E"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
