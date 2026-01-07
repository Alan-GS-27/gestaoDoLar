import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Gestao do Lar",
  description: "Gestao de tarefas domesticas com responsabilidade coletiva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
