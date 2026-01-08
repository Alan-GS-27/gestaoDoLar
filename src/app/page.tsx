"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);
    setIsLoading(true);
    supabase.auth
      .signInWithPassword({
        email: username.trim(),
        password,
      })
      .then(({ error }) => {
        if (error) {
          setMessage("Usuario ou senha incorretos.");
          return;
        }

        router.push("/dashboard");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.18),_transparent_55%)]">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#f9d7c7] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#f1c0a5] blur-3xl" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:justify-between lg:gap-12">
        <section className="w-full max-w-xl space-y-7 sm:space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-3xl leading-tight text-[#1c1a16] sm:text-5xl">
              A casa em ordem com responsabilidade coletiva.
            </h1>
            <p className="text-base text-[#6c6055] sm:text-lg">
              Combine tarefas, acompanhe a semana e aprove tudo em grupo. Este
              login e simulado por enquanto.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(140,59,28,0.15)]">
            <div className="flex items-center gap-3 text-sm text-[#6c6055]">
              <span className="h-2 w-2 rounded-full bg-[#c86b4a]" />
              Tarefas diarias com recorrencia inteligente.
            </div>
            <div className="flex items-center gap-3 text-sm text-[#6c6055]">
              <span className="h-2 w-2 rounded-full bg-[#c86b4a]" />
              Aprovar mudancas antes de editar ou excluir.
            </div>
            <div className="flex items-center gap-3 text-sm text-[#6c6055]">
              <span className="h-2 w-2 rounded-full bg-[#c86b4a]" />
              Visao semanal para manter o ritmo.
            </div>
          </div>
        </section>

        <section className="mt-10 w-full max-w-md lg:mt-0">
          <div className="rounded-3xl border border-[#e6d3c5] bg-white/80 p-8 shadow-[0_24px_60px_rgba(28,26,22,0.2)] backdrop-blur">
            <div className="mb-6">
              <h2 className="font-display text-2xl text-[#1c1a16]">
                Entrar
              </h2>
              <p className="text-sm text-[#6c6055]">
                Use seu email e senha cadastrados.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-[#6c6055]">
                Email
                <input
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Digite seu email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>

              <label className="block text-sm text-[#6c6055]">
                Senha
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                className="w-full rounded-2xl bg-[#c86b4a] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition hover:bg-[#b85a3b] disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs uppercase text-[#a09286]">
              <span className="h-px flex-1 bg-[#e6d3c5]" />
              ou
              <span className="h-px flex-1 bg-[#e6d3c5]" />
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-sm font-semibold text-[#1c1a16] transition hover:border-[#c86b4a] hover:text-[#8c3b1c]"
              disabled
            >
              Entrar com Google (em breve)
            </button>

            <p className="mt-5 text-xs text-[#a09286]">
              Sem banco por enquanto. Apenas UI e validacao local.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
