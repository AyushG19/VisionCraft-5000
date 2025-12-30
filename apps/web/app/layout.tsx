import "./globals.css";
import { Providers } from "./provider";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
