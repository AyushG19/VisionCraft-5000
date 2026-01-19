import "./globals.css";
import { UserProvider } from "@repo/hooks";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>
          @import
          url("https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Handlee&family=Krona+One&display=swap");
        </style>
      </head>
      <body className={`overflow-hidden`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
