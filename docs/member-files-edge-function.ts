// member-files Edge Function（更新版・2026-07-16）
//
// 変更点:
//  - list / download は「メンバー合言葉 または 管理合言葉」で通す
//    （/ops はログイン済みの管理合言葉を使うため、メンバー合言葉を持たない）
//  - MEMBER_PASS の値は据え置き（ローテーションしない方針）
//
// デプロイ: Supabase の member-files 関数をこの内容で更新する。
// ★ MEMBER_PASS は docs/security-fixes-2026-07-16.sql の ag_is_member と必ず同じ値にすること。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MEMBER_PASS = "agmember2026"; // ★ SQL の ag_is_member と一致させる（今回は据え置き）
const ADMIN_PASS = "awakenglow2026";
const BUCKET = "member-files";

// 読み取り（閲覧・DL）は メンバー or 管理 の合言葉で許可
function canRead(body: any): boolean {
  return body?.member_pass === MEMBER_PASS || body?.member_pass === ADMIN_PASS;
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const action = body?.action;

  // ── member files ─────────────────────────────────────

  if (action === "list") {
    if (!canRead(body)) return json({ error: "unauthorized" }, 401);
    const { data, error } = await sb
      .from("awa_member_files")
      .select("id, created_at, category, title, file_name, file_path, mime, meeting_date, body, parent_id")
      .order("meeting_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    const rows = data ?? [];
    await Promise.all(
      rows.map(async (r: any) => {
        if (r.file_path) {
          const { data: s } = await sb.storage
            .from(BUCKET)
            .createSignedUrl(r.file_path, 3600);
          r.signed_url = s?.signedUrl ?? null;
        }
      }),
    );
    return json({ files: rows });
  }

  if (action === "create_text") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const cat = ["minutes", "doc", "photo", "other"].includes(body.category)
      ? body.category
      : "minutes";
    const title = String(body.title || "").slice(0, 200);
    const text = String(body.body || "").slice(0, 20000);
    if (!title.trim() || !text.trim()) return json({ error: "invalid" }, 400);
    const { error } = await sb.from("awa_member_files").insert({
      category: cat,
      title,
      file_path: "",
      file_name: "",
      mime: "text/plain",
      body: text,
      meeting_date: body.meeting_date || null,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "update_text") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const id = String(body.id || "").trim();
    if (!id) return json({ error: "invalid" }, 400);
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const t = String(body.title || "").slice(0, 200);
      if (!t.trim()) return json({ error: "invalid" }, 400);
      patch.title = t;
    }
    if (body.body !== undefined) patch.body = String(body.body || "").slice(0, 20000);
    if (
      body.category !== undefined &&
      ["minutes", "doc", "photo", "other"].includes(body.category)
    ) {
      patch.category = body.category;
    }
    if (body.meeting_date !== undefined) patch.meeting_date = body.meeting_date || null;
    if (Object.keys(patch).length === 0) return json({ error: "invalid" }, 400);
    const { error } = await sb.from("awa_member_files").update(patch).eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "create_upload") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const cat = ["minutes", "doc", "photo", "other"].includes(body.category)
      ? body.category
      : "other";
    const parentId =
      typeof body.parent_id === "string" && body.parent_id.trim()
        ? body.parent_id.trim()
        : null;
    const safe = String(body.file_name || "file")
      .replace(/[^\w.\-]/g, "_")
      .slice(0, 80);
    const id = crypto.randomUUID();
    const path = `${cat}/${id}_${safe}`;
    const up = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (up.error) return json({ error: up.error.message }, 500);
    const ins = await sb.from("awa_member_files").insert({
      id,
      category: cat,
      title: String(body.title || "").slice(0, 200) || safe,
      file_path: path,
      file_name: safe,
      mime: String(body.mime || "").slice(0, 120),
      meeting_date: body.meeting_date || null,
      parent_id: parentId,
    });
    if (ins.error) return json({ error: ins.error.message }, 500);
    return json({ id, path: up.data.path, token: up.data.token, signedUrl: up.data.signedUrl });
  }

  if (action === "download") {
    if (!canRead(body)) return json({ error: "unauthorized" }, 401);
    const { data: row, error } = await sb
      .from("awa_member_files")
      .select("file_path, file_name")
      .eq("id", body.id)
      .single();
    if (error || !row) return json({ error: "not_found" }, 404);
    if (!row.file_path) return json({ error: "no_file" }, 400);
    const { data, error: e2 } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(row.file_path, 120, { download: row.file_name });
    if (e2) return json({ error: e2.message }, 500);
    return json({ url: data.signedUrl, file_name: row.file_name });
  }

  if (action === "delete") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const id = String(body.id || "").trim();
    const { data: own } = await sb
      .from("awa_member_files")
      .select("file_path")
      .eq("id", id)
      .single();
    const { data: kids } = await sb
      .from("awa_member_files")
      .select("file_path")
      .eq("parent_id", id);
    const paths: string[] = [];
    if (own?.file_path) paths.push(own.file_path);
    for (const k of kids ?? []) if (k.file_path) paths.push(k.file_path);
    if (paths.length) await sb.storage.from(BUCKET).remove(paths);
    await sb.from("awa_member_files").delete().eq("id", id);
    return json({ ok: true });
  }

  // ── ledger receipts ────────────────────────────────

  if (action === "ledger_receipt_upload") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const entryId = String(body.entry_id || "").trim();
    if (!entryId) return json({ error: "invalid" }, 400);
    const safe = String(body.file_name || "receipt")
      .replace(/[^\w.\-]/g, "_")
      .slice(0, 80);
    const storagePath = `ledger/${entryId}/${safe}`;
    const up = await sb.storage.from(BUCKET).createSignedUploadUrl(storagePath);
    if (up.error) return json({ error: up.error.message }, 500);
    return json({ signedUrl: up.data.signedUrl, storage_path: storagePath, file_name: safe });
  }

  if (action === "ledger_receipt_download") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const entryId = String(body.entry_id || "").trim();
    const { data: row, error } = await sb
      .from("awa_ledger")
      .select("receipt_path, receipt_name")
      .eq("id", entryId)
      .single();
    if (error || !row?.receipt_path) return json({ error: "not_found" }, 404);
    const { data, error: e2 } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(row.receipt_path, 300, { download: row.receipt_name || "receipt" });
    if (e2) return json({ error: e2.message }, 500);
    return json({ url: data.signedUrl, file_name: row.receipt_name });
  }

  if (action === "ledger_receipt_delete") {
    if (body.admin_pass !== ADMIN_PASS) return json({ error: "unauthorized" }, 401);
    const entryId = String(body.entry_id || "").trim();
    const { data: row } = await sb
      .from("awa_ledger")
      .select("receipt_path")
      .eq("id", entryId)
      .single();
    if (row?.receipt_path) {
      await sb.storage.from(BUCKET).remove([row.receipt_path]);
    }
    await sb.from("awa_ledger")
      .update({ receipt_path: null, receipt_name: null })
      .eq("id", entryId);
    return json({ ok: true });
  }

  return json({ error: "unknown_action" }, 400);
});
