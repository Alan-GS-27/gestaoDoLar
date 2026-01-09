"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/super-admin", label: "Visao geral" },
  { href: "/super-admin/lares", label: "Lares" },
  { href: "/super-admin/usuarios", label: "Usuarios" },
  { href: "/super-admin/relatorios", label: "Relatorios" },
];

export default function SuperAdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#ead6c9] bg-[#f6f1ea]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="font-display text-base text-[#1c1a16] sm:text-lg">
          Gestao do Lar · Super Admin
        </div>
        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm md:w-auto">
          {adminLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/super-admin" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
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
