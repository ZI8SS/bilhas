import type { Metadata } from "next";
import { Topbar } from "@/components/Topbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bilhas",
  description: "Live score português com comentário humorístico ao vivo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>
        <div className="app-shell">
          <Topbar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
