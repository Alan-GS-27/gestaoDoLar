"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ApprovalItem = {
  id: string;
  type: string;
  title: string;
  author: string;
  details: string;
  approvals: number;
  total: number;
  payload: Record<string, unknown> | null;
};

type ActivityItem = {
  id: string;
  title: string;
  time: string;
};

const formatProposalTitle = (
  tipo: string | null | undefined,
  payload: Record<string, unknown> | null,
) => {
  const title =
    (payload?.titulo as string | undefined) ??
    (payload?.title as string | undefined) ??
    "";
  if (tipo === "criacao") {
    return title ? `Nova tarefa: ${title}` : "Nova tarefa";
  }
  if (tipo === "edicao") {
    return title ? `Editar tarefa: ${title}` : "Editar tarefa";
  }
  if (tipo === "exclusao") {
    return title ? `Excluir tarefa: ${title}` : "Excluir tarefa";
  }
  return title || "Proposta pendente";
};

const formatProposalType = (tipo: string | null | undefined) => {
  if (tipo === "criacao") return "Criacao";
  if (tipo === "edicao") return "Edicao";
  if (tipo === "exclusao") return "Exclusao";
  return "Proposta";
};

const formatDetails = (
  payload: Record<string, unknown> | null,
  tipo: string | null | undefined,
) => {
  const recurrence = payload?.recorrencia as string | undefined;
  const days = payload?.dias_semana as number[] | undefined;
  const responsavel = payload?.responsavel as string | undefined;

  if (tipo === "exclusao") {
    const motivo = payload?.motivo as string | undefined;
    return motivo ? `Motivo: ${motivo}` : "Exclusao de tarefa.";
  }

  const pieces: string[] = [];
  if (recurrence) {
    pieces.push(recurrence);
  }
  if (days?.length) {
    pieces.push(`Dias: ${days.join(", ")}`);
  }
  if (responsavel) {
    pieces.push(`Responsavel: ${responsavel}`);
  }
  return pieces.length ? pieces.join(" · ") : "Detalhes disponiveis no payload.";
};

const formatTime = (raw: string | null | undefined) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AprovacoesPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setMessage(null);

      let client;
      try {
        client = getSupabaseClient();
      } catch {
        if (isMounted) {
          setMessage("Supabase nao configurado.");
          setIsLoading(false);
        }
        return;
      }

      const { data: authData, error: authError } =
        await client.auth.getUser();
      const currentUser = authData?.user;

      if (authError || !currentUser) {
        if (isMounted) {
          setMessage("E necessario estar logado para ver aprovacoes.");
          setIsLoading(false);
        }
        return;
      }

      setUserId(currentUser.id);

      const { data: membership } = await client
        .from("household_members")
        .select("household_id")
        .eq("user_id", currentUser.id)
        .eq("ativo", true)
        .maybeSingle();

      const householdId = membership?.household_id ?? null;
      if (!householdId) {
        if (isMounted) {
          setMessage("Voce ainda nao esta vinculado a um lar.");
          setIsLoading(false);
        }
        return;
      }

      const { data: proposals } = await client
        .from("task_proposals")
        .select("id,tipo,payload,criado_por,status,criado_em")
        .eq("household_id", householdId)
        .eq("status", "pendente");

      const proposalIds = (proposals ?? []).map((proposal) => proposal.id);

      const { data: approvalsData } = proposalIds.length
        ? await client
            .from("task_approvals")
            .select("proposal_id,user_id")
            .in("proposal_id", proposalIds)
        : { data: [] };

      const userApprovedIds = new Set(
        (approvalsData ?? [])
          .filter((approval) => approval.user_id === currentUser.id)
          .map((approval) => approval.proposal_id),
      );

      const approvalCountMap = new Map<string, number>();
      (approvalsData ?? []).forEach((approval) => {
        approvalCountMap.set(
          approval.proposal_id,
          (approvalCountMap.get(approval.proposal_id) ?? 0) + 1,
        );
      });

      const { count: membersTotal } = await client
        .from("household_members")
        .select("id", { count: "exact", head: true })
        .eq("household_id", householdId)
        .eq("ativo", true);

      const authorIds = Array.from(
        new Set((proposals ?? []).map((proposal) => proposal.criado_por)),
      );
      const { data: authors } = authorIds.length
        ? await client
            .from("profiles")
            .select("id,nome")
            .in("id", authorIds)
        : { data: [] };

      const authorMap = new Map(
        (authors ?? []).map((author) => [author.id, author.nome]),
      );

      const pendingApprovals: ApprovalItem[] = (proposals ?? [])
        .filter((proposal) => !userApprovedIds.has(proposal.id))
        .map((proposal) => ({
          id: proposal.id,
          type: formatProposalType(proposal.tipo),
          title: formatProposalTitle(proposal.tipo, proposal.payload),
          author: authorMap.get(proposal.criado_por) ?? "Membro do lar",
          details: formatDetails(proposal.payload, proposal.tipo),
          approvals: approvalCountMap.get(proposal.id) ?? 0,
          total: membersTotal ?? 0,
          payload: (proposal.payload as Record<string, unknown> | null) ?? null,
        }));

      const { data: recentProposals } = await client
        .from("task_proposals")
        .select("id,tipo,payload,status,criado_em")
        .eq("household_id", householdId)
        .in("status", ["aprovada", "rejeitada"])
        .order("criado_em", { ascending: false })
        .limit(4);

      const { data: recentExecutions } = await client
        .from("task_executions")
        .select("id,concluido_em,task:tasks(titulo,household_id)")
        .eq("task.household_id", householdId)
        .order("concluido_em", { ascending: false })
        .limit(4);

      const activityItems: ActivityItem[] = [
        ...(recentProposals ?? []).map((item) => ({
          id: item.id,
          title:
            item.status === "aprovada"
              ? `${formatProposalTitle(item.tipo, item.payload)} aprovada`
              : `${formatProposalTitle(item.tipo, item.payload)} rejeitada`,
          time: formatTime(item.criado_em),
        })),
        ...(recentExecutions ?? []).map((item) => ({
          id: item.id,
          title: `Tarefa '${item.task?.titulo ?? "Tarefa"}' concluida`,
          time: formatTime(item.concluido_em),
        })),
      ];

      if (isMounted) {
        setApprovals(pendingApprovals);
        setActivity(activityItems.slice(0, 6));
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = useMemo(() => approvals.length, [approvals.length]);

  const handleApprove = async (proposalId: string) => {
    if (!userId) return;
    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      return;
    }

    setIsUpdating(proposalId);
    setMessage(null);

    const { error } = await client.from("task_approvals").insert({
      proposal_id: proposalId,
      user_id: userId,
      aprovado: true,
    });

    if (error) {
      setMessage("Nao foi possivel aprovar agora.");
      setIsUpdating(null);
      return;
    }

    setApprovals((current) =>
      current.filter((approval) => approval.id !== proposalId),
    );
    setIsUpdating(null);
  };

  const handleRequestAdjustment = async (proposalId: string) => {
    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      return;
    }

    setIsUpdating(proposalId);
    setMessage(null);

    const { error } = await client
      .from("task_proposals")
      .update({ status: "rejeitada" })
      .eq("id", proposalId);

    if (error) {
      setMessage("Nao foi possivel pedir ajuste agora.");
      setIsUpdating(null);
      return;
    }

    setApprovals((current) =>
      current.filter((approval) => approval.id !== proposalId),
    );
    setIsUpdating(null);
  };

  const openDetails = (item: ApprovalItem) => {
    setSelectedApproval(item);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedApproval(null);
    setIsDetailsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Aprovacoes
            </h1>
            <p className="text-sm text-[#6c6055]">
              Mudancas que exigem consenso coletivo.
            </p>
          </div>
          <div className="rounded-full border border-[#ead6c9] bg-white px-5 py-2 text-sm font-semibold text-[#6c6055]">
            {pendingCount} pendencias
          </div>
        </header>

        {message ? (
          <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {isLoading ? (
              <article className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 text-sm text-[#6c6055] shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
                Carregando aprovacoes...
              </article>
            ) : approvals.length === 0 ? (
              <article className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 text-sm text-[#6c6055] shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
                Nenhuma pendencia no momento.
              </article>
            ) : (
              approvals.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                        {item.type}
                      </span>
                      <h2 className="mt-3 font-display text-xl text-[#1c1a16]">
                        {item.title}
                      </h2>
                      <p className="text-sm text-[#6c6055]">
                        Proposto por {item.author}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-sm text-[#6c6055]">
                      {item.approvals}/{item.total} aprovados
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[#6c6055]">{item.details}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-full border border-[#c86b4a] px-4 py-2 text-sm font-semibold text-[#8c3b1c] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handleApprove(item.id)}
                      disabled={isUpdating === item.id}
                    >
                      {isUpdating === item.id ? "Aprovando..." : "Aprovar"}
                    </button>
                    <button
                      className="rounded-full border border-[#f0ded2] px-4 py-2 text-sm font-semibold text-[#6c6055] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handleRequestAdjustment(item.id)}
                      disabled={isUpdating === item.id}
                    >
                      {isUpdating === item.id
                        ? "Atualizando..."
                        : "Pedir ajuste"}
                    </button>
                    <button
                      className="rounded-full bg-[#c86b4a] px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => openDetails(item)}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Como funciona
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-[#6c6055]">
                <li>1. Alguem propoe uma mudanca.</li>
                <li>2. Cada membro aprova individualmente.</li>
                <li>3. Com 100% de aprovacao, a mudanca e aplicada.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Atividade recente
              </h2>
              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando atividade...
                  </div>
                ) : activity.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Sem atividade recente.
                  </div>
                ) : (
                  activity.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">{item.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>

        {isDetailsOpen && selectedApproval ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center sm:px-6 sm:py-8">
            <div className="w-full max-w-2xl rounded-3xl border border-[#e6d3c5] bg-white p-6 shadow-[0_24px_60px_rgba(28,26,22,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                    Detalhes da proposta
                  </p>
                  <h3 className="font-display text-xl text-[#1c1a16]">
                    {selectedApproval.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-full border border-[#ead6c9] px-3 py-1 text-xs font-semibold text-[#6c6055]"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                <p className="font-semibold text-[#1c1a16]">Tipo</p>
                <p>{selectedApproval.type}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                <p className="font-semibold text-[#1c1a16]">Resumo</p>
                <p>{selectedApproval.details}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#f0ded2] bg-[#fffaf6] px-4 py-3 text-xs text-[#6c6055]">
                <p className="font-semibold text-[#1c1a16]">Payload</p>
                <pre className="mt-2 whitespace-pre-wrap">
                  {JSON.stringify(selectedApproval.payload ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
