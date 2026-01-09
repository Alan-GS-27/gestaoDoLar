"use client";

const stats = [
  { label: "Lares ativos", value: "128" },
  { label: "Usuarios", value: "512" },
  { label: "Convites pendentes", value: "19" },
];

const households = [
  {
    id: "8f2d...c1a9",
    name: "Casa Horizonte",
    members: 4,
    created: "12/03/2024",
    status: "Ativo",
    plan: "Mensal",
    city: "Sao Paulo",
  },
  {
    id: "1c5a...b890",
    name: "Lar dos Ventos",
    members: 3,
    created: "27/02/2024",
    status: "Ativo",
    plan: "Anual",
    city: "Campinas",
  },
  {
    id: "4a2b...0d3c",
    name: "Casa Aurora",
    members: 5,
    created: "08/01/2024",
    status: "Pendencia",
    plan: "Mensal",
    city: "Sorocaba",
  },
  {
    id: "9e11...7aa0",
    name: "Residencia Lago",
    members: 2,
    created: "19/12/2023",
    status: "Suspenso",
    plan: "Mensal",
    city: "Santos",
  },
];

const selectedHousehold = {
  name: "Casa Horizonte",
  id: "8f2d9d4e-9f8b-41b2-a7b3-1c2a2d7cc1a9",
  members: [
    { name: "Alan Silva", role: "Responsavel", status: "Ativo" },
    { name: "Lara Silva", role: "Membro", status: "Ativo" },
    { name: "Caio Silva", role: "Membro", status: "Ativo" },
    { name: "Lia Silva", role: "Membro", status: "Pendente" },
  ],
  lastActivity: "Atualizado ha 2 horas",
};

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.18),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Super Admin
            </h1>
            <p className="text-sm text-[#6c6055]">
              Controle global dos lares, usuarios e operacoes do sistema.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#f0ded2] bg-white px-4 py-2 text-sm text-[#6c6055]">
              Acesso global ativo
            </span>
            <button className="rounded-full bg-[#c86b4a] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition hover:bg-[#b85a3b]">
              Criar novo lar
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                {item.label}
              </p>
              <p className="mt-3 font-display text-3xl text-[#1c1a16]">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-[#6c6055]">
                Ultimas 24 horas
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-xl text-[#1c1a16]">
                    Lares cadastrados
                  </h2>
                  <p className="text-sm text-[#6c6055]">
                    Acesse qualquer lar para suporte ou ajustes rapidos.
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <input
                    className="w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-2 text-sm text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d] sm:max-w-xs"
                    placeholder="Buscar por lar ou email"
                  />
                  <div className="flex gap-2">
                    {["Todos", "Ativos", "Pendentes"].map((filter) => (
                      <button
                        key={filter}
                        className="rounded-full border border-[#f0ded2] px-3 py-1 text-xs font-semibold text-[#6c6055] transition hover:border-[#c86b4a] hover:text-[#8c3b1c]"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {households.map((household) => (
                  <div
                    key={household.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#f0ded2] bg-white px-4 py-4 transition hover:border-[#c86b4a] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {household.name}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        {household.city} · Plano {household.plan}
                      </p>
                      <p className="text-xs text-[#a09286]">
                        Criado em {household.created}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6c6055]">
                      <span className="rounded-full bg-[#fde6de] px-3 py-1 font-semibold text-[#8c3b1c]">
                        {household.status}
                      </span>
                      <span className="rounded-full border border-[#f0ded2] px-3 py-1 font-semibold">
                        {household.members} membros
                      </span>
                      <button className="rounded-full border border-[#c86b4a] px-3 py-1 font-semibold text-[#8c3b1c]">
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h3 className="font-display text-lg text-[#1c1a16]">
                Acoes rapidas
              </h3>
              <p className="text-sm text-[#6c6055]">
                Intervencoes comuns para suporte imediato.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Resetar senha do usuario",
                  "Reenviar convite",
                  "Suspender lar",
                  "Registrar novo lar",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm font-semibold text-[#8c3b1c] transition hover:border-[#c86b4a]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#1c1a16]">
                  Detalhes do lar
                </h2>
                <span className="rounded-full bg-[#fde6de] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                  Ativo
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[#6c6055]">
                <p>
                  <span className="font-semibold text-[#1c1a16]">Lar:</span>{" "}
                  {selectedHousehold.name}
                </p>
                <p>
                  <span className="font-semibold text-[#1c1a16]">ID:</span>{" "}
                  {selectedHousehold.id}
                </p>
                <p>{selectedHousehold.lastActivity}</p>
              </div>

              <div className="mt-5 space-y-3">
                {selectedHousehold.members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {member.name}
                      </p>
                      <p className="text-xs text-[#6c6055]">{member.role}</p>
                    </div>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  "Abrir detalhes",
                  "Editar lar",
                  "Suspender",
                  "Excluir",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-[#c86b4a] px-4 py-2 text-xs font-semibold text-[#8c3b1c]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Criar novo lar
              </h2>
              <p className="text-sm text-[#6c6055]">
                Preencha as informacoes iniciais para abrir um novo grupo.
              </p>
              <form className="mt-4 space-y-3">
                <label className="block text-sm text-[#6c6055]">
                  Nome do lar
                  <input
                    className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                    placeholder="Ex: Casa do Lago"
                  />
                </label>
                <label className="block text-sm text-[#6c6055]">
                  Email do primeiro membro
                  <input
                    className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                    placeholder="exemplo@email.com"
                  />
                </label>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-[#c86b4a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition hover:bg-[#b85a3b]"
                >
                  Criar lar
                </button>
              </form>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
