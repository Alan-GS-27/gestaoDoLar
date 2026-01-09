"use client";

const users = [
  {
    name: "Alan Silva",
    email: "alan@exemplo.com",
    household: "Casa Horizonte",
    status: "Ativo",
  },
  {
    name: "Lara Silva",
    email: "lara@exemplo.com",
    household: "Lar dos Ventos",
    status: "Ativo",
  },
  {
    name: "Caio Silva",
    email: "caio@exemplo.com",
    household: "Casa Aurora",
    status: "Pendente",
  },
];

export default function SuperAdminUsersPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
            Super Admin
          </p>
          <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
            Usuarios
          </h1>
          <p className="text-sm text-[#6c6055]">
            Gerencie usuarios e acompanhe vinculos com lares.
          </p>
        </header>

        <section className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-[#1c1a16]">
                Lista de usuarios
              </h2>
              <p className="text-sm text-[#6c6055]">
                Pesquise por email e ajuste dados rapidamente.
              </p>
            </div>
            <input
              className="w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-2 text-sm text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d] sm:max-w-xs"
              placeholder="Buscar por email"
            />
          </div>

          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div
                key={user.email}
                className="flex flex-col gap-3 rounded-2xl border border-[#f0ded2] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1c1a16]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#6c6055]">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6c6055]">
                  <span className="rounded-full border border-[#f0ded2] px-3 py-1 font-semibold">
                    {user.household}
                  </span>
                  <span className="rounded-full bg-[#fde6de] px-3 py-1 font-semibold text-[#8c3b1c]">
                    {user.status}
                  </span>
                  <button className="rounded-full border border-[#c86b4a] px-3 py-1 font-semibold text-[#8c3b1c]">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
