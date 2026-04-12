import "./globals.css";
import { ErrorContextProvider, UserProvider } from "@repo/hooks";
import { PingProvider } from "./PingProvider";
import { ThemeProvider } from "./ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>
          @import
          url("https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Handlee&family=Krona+One&display=swap");
        </style>
      </head>
      <body className={`overflow-hidden`}>
        <UserProvider>
          <ErrorContextProvider>
            <PingProvider />
            <ThemeProvider>{children}</ThemeProvider>
          </ErrorContextProvider>
        </UserProvider>
      </body>
    </html>
  );
}
