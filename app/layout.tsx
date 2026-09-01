import type { Metadata } from "next";
import { SiteChrome } from "./components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Coletivo Rise — Uma geração que se levanta",
    template: "%s | Coletivo Rise",
  },
  description:
    "Jovens com propósito, fé e movimento. Conheça o Coletivo Rise, participe dos encontros e vista essa geração.",
  icons: {
    icon: "/assets/logo-rise.jpg",
    shortcut: "/assets/logo-rise.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
