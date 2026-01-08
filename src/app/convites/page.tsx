"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type InviteResult = {
  ok: boolean;
  user_id?: string;
  error?: string;
};

export default function ConvitesPage() {
  const [email, setEmail] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    const { data, error } = await supabase.functions.invoke<InviteResult>(
      "invite-user",
      {
        body: {
          email,
          household_id: householdId,
          redirect_to: window.location.origin,
        },
      },
    );

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (data?.ok) {
      setMessage("Convite enviado com sucesso.");
      setEmail("");
    } else {
      setMessage(data?.error ?? "Nao foi possivel enviar o convite.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-5xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
            Gestao do Lar
          </p>
          <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
            Convites
          </h1>
          <p className="text-sm text-[#6c6055]">
            Convide pessoas para entrar na familia pelo email.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
            <h2 className="font-display text-xl text-[#1c1a16]">
              Enviar convite
            </h2>
            <p className="mt-2 text-sm text-[#6c6055]">
              E necessario estar logado para enviar convites.
            </p>

            {!sessionReady ? (
              <div className="mt-4 rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
                Faca login para liberar o envio de convites.
              </div>
            ) : (
              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm text-[#6c6055]">
                  Email da pessoa
                  <input
                    className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label className="block text-sm text-[#6c6055]">
                  ID da casa
                  <input
                    className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                    placeholder="Cole o household_id"
                    value={householdId}
                    onChange={(event) => setHouseholdId(event.target.value)}
                    required
                  />
                </label>

                {message ? (
                  <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-[#c86b4a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition hover:bg-[#b85a3b] disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
                >
                  {isLoading ? "Enviando..." : "Enviar convite"}
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Como funciona
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-[#6c6055]">
                <li>1. Convite enviado pelo email.</li>
                <li>2. Pessoa cria senha pelo link.</li>
                <li>3. Entra como membro pendente.</li>
                <li>4. Depois ativamos o membro.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Proxima etapa
              </h2>
              <p className="mt-2 text-sm text-[#6c6055]">
                Vamos automatizar a ativacao assim que a pessoa criar a senha.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
