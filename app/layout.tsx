import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #020617 0%, #020617 40%, #000 100%)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


