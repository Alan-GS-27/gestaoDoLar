"use client";

const households = [
  {
    name: "Casa Horizonte",
    members: 4,
    city: "Sao Paulo",
    plan: "Mensal",
    status: "Ativo",
  },
  {
    name: "Lar dos Ventos",
    members: 3,
    city: "Campinas",
    plan: "Anual",
    status: "Ativo",
  },
  {
    name: "Casa Aurora",
    members: 5,
    city: "Sorocaba",
    plan: "Mensal",
    status: "Pendencia",
  },
];

export default function SuperAdminHouseholdsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
            Super Admin
          </p>
          <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
            Lares
          </h1>
          <p className="text-sm text-[#6c6055]">
            Gerencie lares cadastrados e acompanhe o status de cada grupo.
          </p>
        </header>

        <section className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-[#1c1a16]">
                Lista de lares
              </h2>
              <p className="text-sm text-[#6c6055]">
                Acesse rapidamente detalhes, membros e planos.
              </p>
            </div>
            <button className="rounded-full bg-[#c86b4a] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition hover:bg-[#b85a3b]">
              Criar novo lar
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {households.map((household) => (
              <div
                key={household.name}
                className="flex flex-col gap-3 rounded-2xl border border-[#f0ded2] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1c1a16]">
                    {household.name}
                  </p>
                  <p className="text-xs text-[#6c6055]">
                    {household.city} · Plano {household.plan}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6c6055]">
                  <span className="rounded-full border border-[#f0ded2] px-3 py-1 font-semibold">
                    {household.members} membros
                  </span>
                  <span className="rounded-full bg-[#fde6de] px-3 py-1 font-semibold text-[#8c3b1c]">
                    {household.status}
                  </span>
                  <button className="rounded-full border border-[#c86b4a] px-3 py-1 font-semibold text-[#8c3b1c]">
                    Abrir detalhes
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
