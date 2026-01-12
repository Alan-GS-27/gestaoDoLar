"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AceitarConvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const client = getSupabaseClient();
        const { data } = await client.auth.getSession();
        setHasSession(!!data.session);
      } catch {
        setHasSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas nao conferem.");
      return;
    }

    setIsLoading(true);

    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      setIsLoading(false);
      return;
    }

    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setMessage("Nao foi possivel definir a senha.");
      setIsLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirect");
    router.replace(redirectTo || "/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.18),_transparent_60%)] px-4 py-10 sm:px-6 sm:py-12">
      <main className="mx-auto w-full max-w-xl space-y-8 sm:space-y-10">
        <header className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 text-center shadow-[0_24px_60px_rgba(28,26,22,0.12)] sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
            Gestao do Lar
          </p>
          <h1 className="mt-2 font-display text-2xl text-[#1c1a16] sm:text-3xl">
            Aceite seu convite
          </h1>
          <p className="mt-2 text-sm text-[#6c6055]">
            Defina sua senha para entrar no lar com seguranca.
          </p>
        </header>

        <section className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)] sm:p-8">
          {!hasSession ? (
            <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
              Abra o link do convite no seu email para continuar.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-[#6c6055]">
                Nova senha
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Minimo de 6 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-[#6c6055]">
                Confirmar senha
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Digite novamente"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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
                {isLoading ? "Salvando..." : "Confirmar senha"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
