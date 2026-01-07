"use client";

const preferences = [
  {
    title: "Tema",
    description: "Escolha a aparencia da interface.",
    action: "Claro",
  },
  {
    title: "Notificacoes",
    description: "Alertas para tarefas e aprovacoes.",
    action: "Ativado",
  },
  {
    title: "Privacidade",
    description: "Visibilidade das informacoes pessoais.",
    action: "Somente grupo",
  },
];

const security = [
  {
    title: "Email",
    value: "alan@exemplo.com",
  },
  {
    title: "Senha",
    value: "********",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Configuracoes
            </h1>
            <p className="text-sm text-[#6c6055]">
              Ajuste seu perfil e preferencias pessoais.
            </p>
          </div>
          <button className="rounded-full border border-[#ead6c9] bg-white px-5 py-2 text-sm font-semibold text-[#6c6055] transition hover:border-[#c86b4a] hover:text-[#8c3b1c]">
            Salvar alteracoes
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Perfil
              </h2>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 rounded-full bg-[#f1c0a5] text-center text-xl font-semibold leading-[5rem] text-[#8c3b1c]">
                  AL
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                      Nome
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-sm text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                      defaultValue="Alan Silva"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                      Foto de perfil
                    </label>
                    <button className="mt-2 w-full rounded-2xl border border-dashed border-[#c86b4a] px-4 py-3 text-sm font-semibold text-[#8c3b1c]">
                      Enviar nova foto
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Preferencias
              </h2>
              <div className="mt-4 space-y-4">
                {preferences.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#1c1a16]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#6c6055]">
                          {item.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#fde6de] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                        {item.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Seguranca
              </h2>
              <div className="mt-4 space-y-4">
                {security.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">{item.value}</p>
                    </div>
                    <button className="rounded-full border border-[#c86b4a] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Familia e permissoes
              </h2>
              <p className="mt-2 text-sm text-[#6c6055]">
                Todos aprovam mudancas criticas. Sem administrador.
              </p>
              <div className="mt-4 space-y-3">
                {["Alan", "Lara", "Caio"].map((member) => (
                  <div
                    key={member}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-[#1c1a16]">
                      {member}
                    </span>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
