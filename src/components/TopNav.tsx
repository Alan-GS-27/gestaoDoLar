"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/aprovacoes", label: "Aprovacoes" },
  { href: "/calendario", label: "Calendario" },
  { href: "/configuracoes", label: "Configuracoes" },
];

export default function TopNav() {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ead6c9] bg-[#f6f1ea]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="font-display text-base text-[#1c1a16] sm:text-lg">
          Gestao do Lar
        </div>
        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm md:w-auto">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 transition ${
                  isActive
                    ? "bg-[#c86b4a] text-white"
                    : "text-[#6c6055] hover:text-[#8c3b1c]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
