import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BUCKET = "task-photos";
const RETENTION_DAYS = 5;
const LIST_LIMIT = 1000;

type ListedItem = {
  name: string;
  id: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
};

const isFolder = (item: ListedItem) =>
  item.id === null && item.metadata === null;

const joinPath = (prefix: string, name: string) =>
  prefix ? `${prefix}/${name}` : name;

async function listAllFiles(
  storage: ReturnType<typeof createClient>["storage"],
  prefix = "",
): Promise<{ path: string; created_at: string | null }[]> {
  const files: { path: string; created_at: string | null }[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await storage.from(BUCKET).list(prefix, {
      limit: LIST_LIMIT,
      offset,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data as ListedItem[]) {
      if (isFolder(item)) {
        const nested = await listAllFiles(storage, joinPath(prefix, item.name));
        files.push(...nested);
      } else {
        files.push({
          path: joinPath(prefix, item.name),
          created_at: item.created_at,
        });
      }
    }

    if (data.length < LIST_LIMIT) {
      break;
    }

    offset += LIST_LIMIT;
  }

  return files;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

serve(async () => {
  const url = Deno.env.get("PROJECT_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase env vars." }),
      { status: 500 },
    );
  }

  const supabase = createClient(url, serviceRoleKey);
  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );

  const allFiles = await listAllFiles(supabase.storage);
  const expiredFiles = allFiles.filter((file) =>
    file.created_at ? new Date(file.created_at) < cutoff : false,
  );

  let removedCount = 0;
  for (const batch of chunk(expiredFiles, 100)) {
    const { error } = await supabase.storage.from(BUCKET).remove(
      batch.map((file) => file.path),
    );

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    removedCount += batch.length;
  }

  const { error: deleteError, count } = await supabase
    .from("task_execution_photos")
    .delete({ count: "exact" })
    .lt("criado_em", cutoff.toISOString());

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({
      removed_files: removedCount,
      removed_rows: count ?? 0,
      cutoff: cutoff.toISOString(),
    }),
    { status: 200 },
  );
});
