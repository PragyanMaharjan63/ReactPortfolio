"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Download, LoaderCircle, LogOut, Plus, RefreshCw, Save, Search, Star, Trash2 } from "lucide-react";
import type { Project } from "@/data/projects";
import type { ProjectRecord } from "@/lib/storage";
import { projectSchema } from "@/lib/project-validation";

const blank: Project = { slug: "", title: "", category: "Frontend", year: String(new Date().getFullYear()), summary: "", description: "", featured: false, domain: "web", technologies: [], role: "Sole developer.", links: {} };
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const toDraft = (project: Project) => ({
  project: structuredClone(project), technologies: project.technologies.join("\n"),
  challenges: (project.challenges ?? []).join("\n"), missingInfo: (project.missingInfo ?? []).join("\n"),
  gallery: JSON.stringify(project.gallery ?? [], null, 2), videos: JSON.stringify(project.videos ?? [], null, 2), metadata: JSON.stringify(project.metadata ?? [], null, 2),
});

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function Dashboard({ initialRecords, storage }: { initialRecords: ProjectRecord[]; storage: string }) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialRecords[0]?.project.slug ?? null);
  const [draft, setDraft] = useState(() => toDraft(initialRecords[0]?.project ?? blank));
  const [tab, setTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = records.find((record) => record.project.slug === selectedSlug);
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(selected?.project ?? blank));
  const project = draft.project;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((previous) => ({ ...previous, project: { ...previous.project, [key]: value } }));
    setMessage("");
  }
  function canLeave() { return !dirty || window.confirm("Discard your unsaved changes?"); }
  function select(record?: ProjectRecord) {
    if (!canLeave()) return;
    setSelectedSlug(record?.project.slug ?? null); setDraft(toDraft(record?.project ?? blank)); setTab("Overview"); setError(""); setMessage("");
  }
  async function request(path: string, method = "GET", body?: unknown) {
    const response = await fetch(path, { method, cache: "no-store", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const result = await response.json();
    if (response.status === 401) { router.replace("/dashboard/login"); router.refresh(); }
    if (!response.ok) throw new Error(result.error ?? "Could not complete this request.");
    return result as { records: ProjectRecord[] };
  }
  async function save() {
    setError(""); setMessage("");
    try {
      const result = projectSchema.safeParse({ ...project, technologies: lines(draft.technologies), challenges: lines(draft.challenges), missingInfo: lines(draft.missingInfo), gallery: JSON.parse(draft.gallery || "[]"), videos: JSON.parse(draft.videos || "[]"), metadata: JSON.parse(draft.metadata || "[]") });
      if (!result.success) { setError(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")); return; }
      setBusy(true);
      const response = selected
        ? await request(`/api/admin/projects/${selected.project.slug}`, "PUT", { project: result.data, revision: selected.revision })
        : await request("/api/admin/projects", "POST", result.data);
      setRecords(response.records); setSelectedSlug(result.data.slug);
      setDraft(toDraft(response.records.find((record) => record.project.slug === result.data.slug)!.project));
      setMessage("Saved. Your portfolio is up to date.");
    } catch (error) { setError(error instanceof SyntaxError ? "Check the JSON in Gallery, Videos, and Specifications." : error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  async function refresh() {
    if (!canLeave()) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await request("/api/admin/projects");
      setRecords(response.records);
      const record = response.records.find((record) => record.project.slug === selectedSlug) ?? response.records[0];
      setSelectedSlug(record?.project.slug ?? null); setDraft(toDraft(record?.project ?? blank));
    } catch (error) { setError(error instanceof Error ? error.message : "Could not reload."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!selected || !window.confirm(`Delete “${selected.project.title}” from your portfolio? Export a backup first if you want to keep it.`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await request(`/api/admin/projects/${selected.project.slug}`, "DELETE", { revision: selected.revision });
      setRecords(response.records); setSelectedSlug(response.records[0]?.project.slug ?? null); setDraft(toDraft(response.records[0]?.project ?? blank)); setMessage("Project deleted.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not delete."); }
    finally { setBusy(false); }
  }
  async function move(slug: string, direction: number) {
    const index = records.findIndex((record) => record.project.slug === slug);
    if (index + direction < 0 || index + direction >= records.length) return;
    const reordered = [...records];
    [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
    setBusy(true); setError("");
    try { setRecords((await request("/api/admin/projects/order", "POST", { slugs: reordered.map((record) => record.project.slug) })).records); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not reorder."); }
    finally { setBusy(false); }
  }

  return (
    <div className="shell admin-shell">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="label flex items-center gap-3 text-accent"><span className="status-dot" /> The control room</p><h1 className="mt-4 text-h2">Your work, in your hands.</h1><p className="mt-3 text-sm text-secondary">Edit the details. Keep the good stuff current.</p></div>
        <div className="flex flex-wrap gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View website <ArrowUpRight className="size-4" aria-hidden="true" /></a>
          <button type="button" disabled={busy} className="btn btn-ghost" onClick={async () => {
            if (!canLeave()) return;
            setBusy(true); setError("");
            try { await request("/api/admin/logout", "POST"); router.replace("/dashboard/login"); router.refresh(); }
            catch (error) { setError(error instanceof Error ? error.message : "Could not sign out."); setBusy(false); }
          }}><LogOut className="size-4" aria-hidden="true" /> Sign out</button>
        </div>
      </div>

      <div className="admin-stats">
        <div><span className="label">Projects</span><strong>{records.length.toString().padStart(2, "0")}</strong></div>
        <div><span className="label">Featured</span><strong>{records.filter((record) => record.project.featured).length.toString().padStart(2, "0")}</strong></div>
        <div><span className="label">Database</span><strong className="text-accent">SQLite<span className="ml-3 text-xs font-normal text-muted">{storage === "turso" ? "Turso · connected" : "Local · connected"}</span></strong></div>
      </div>

      <div className="admin-workspace">
        <aside className="admin-sidebar panel">
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium">Your projects</h2><button type="button" className="admin-icon" title="Reload projects" aria-label="Reload projects" disabled={busy} onClick={refresh}><RefreshCw className="size-4" /></button></div>
          <label className="admin-search"><Search className="size-4" aria-hidden="true" /><input aria-label="Search projects" placeholder="Find a project…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <button className="btn btn-secondary w-full" type="button" disabled={busy} onClick={() => select()}><Plus className="size-4" aria-hidden="true" /> New project</button>
          <ul className="mt-5 space-y-2">
            {records.filter((record) => `${record.project.title} ${record.project.slug}`.toLowerCase().includes(query.toLowerCase())).map((record, index) => (
              <li key={record.project.slug} className={`admin-project ${record.project.slug === selectedSlug ? "is-selected" : ""}`}>
                <button className="admin-project-select" type="button" disabled={busy} onClick={() => select(record)} aria-pressed={record.project.slug === selectedSlug}>
                  <span className="flex items-center gap-2"><span className="truncate">{record.project.title}</span>{record.project.featured && <Star className="size-3 shrink-0 text-accent" aria-label="Featured" />}</span>
                  <span className="mt-1 block text-[0.625rem] text-muted">{record.project.domain} / {record.project.year}</span>
                </button>
                <div className="admin-order"><button type="button" disabled={busy || index === 0 || Boolean(query)} aria-label={`Move ${record.project.title} up`} onClick={() => move(record.project.slug, -1)}><ArrowUp className="size-3" /></button><button type="button" disabled={busy || index === records.length - 1 || Boolean(query)} aria-label={`Move ${record.project.title} down`} onClick={() => move(record.project.slug, 1)}><ArrowDown className="size-3" /></button></div>
              </li>
            ))}
          </ul>
          {!records.length && <p className="mt-6 text-sm text-muted">Your first project starts here.</p>}
          <a href="/api/admin/export" className="mt-6 flex min-h-11 items-center gap-2 border-t border-line pt-5 text-xs text-secondary hover:text-accent"><Download className="size-4" aria-hidden="true" /> Export projects as JSON</a>
        </aside>

        <section className="panel min-w-0 overflow-hidden" aria-labelledby="editor-heading">
          <div className="admin-editor-header"><div><p className="label">{selected ? "Edit project" : "A fresh start"}</p><h2 id="editor-heading" className="mt-2 text-h3">{selected?.project.title ?? "New project"}</h2></div><span className={`admin-save-status ${dirty ? "text-accent" : "text-muted"}`}>{busy ? "Working…" : dirty ? "Unsaved changes" : "Up to date"}</span></div>
          <div className="admin-tabs" role="tablist" aria-label="Project fields">{["Overview", "Media & 3D", "Details"].map((label) => <button key={label} id={`tab-${label.replaceAll(" ", "-")}`} type="button" role="tab" aria-selected={tab === label} aria-controls="project-fields" onClick={() => setTab(label)}>{label}</button>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <fieldset disabled={busy} className="admin-fields" id="project-fields" role="tabpanel" aria-labelledby={`tab-${tab.replaceAll(" ", "-")}`}>
              {tab === "Overview" && <>
                <div className="admin-two-col"><Field label="Title"><input value={project.title} onChange={(event) => update("title", event.target.value)} required maxLength={120} /></Field><Field label="URL slug" hint={selected ? "Permanent URL. Create a new project to use a different slug." : "Lowercase letters, numbers and hyphens. Example: my-new-project"}><input value={project.slug} onChange={(event) => update("slug", event.target.value)} required readOnly={Boolean(selected)} maxLength={80} /></Field></div>
                <Field label="Summary" hint="One short sentence for project listings."><textarea rows={2} value={project.summary} onChange={(event) => update("summary", event.target.value)} required maxLength={500} /></Field>
                <Field label="Description"><textarea rows={5} value={project.description} onChange={(event) => update("description", event.target.value)} required maxLength={10000} /></Field>
                <div className="admin-two-col"><Field label="Domain"><select value={project.domain} onChange={(event) => update("domain", event.target.value as Project["domain"])}><option value="web">Web</option><option value="robotics">Robotics</option></select></Field><Field label="Category"><select value={project.category} onChange={(event) => update("category", event.target.value as Project["category"])}>{["Frontend", "Full-stack", "Companion robotics", "Quadruped robotics"].map((value) => <option key={value}>{value}</option>)}</select></Field></div>
                <div className="admin-two-col"><Field label="Year"><input value={project.year} onChange={(event) => update("year", event.target.value)} inputMode="numeric" maxLength={4} required /></Field><Field label="Status"><input value={project.status ?? ""} onChange={(event) => update("status", event.target.value)} maxLength={200} /></Field></div>
                <Field label="Your role"><input value={project.role} onChange={(event) => update("role", event.target.value)} required maxLength={500} /></Field>
                <label className="admin-checkbox"><input type="checkbox" checked={project.featured} onChange={(event) => update("featured", event.target.checked)} /><span>Feature on the homepage<small>Show this project in Selected Work.</small></span><Star className="ml-auto size-4 text-accent" aria-hidden="true" /></label>
                <Field label="Technologies" hint="One technology per line."><textarea rows={4} value={draft.technologies} onChange={(event) => setDraft({ ...draft, technologies: event.target.value })} /></Field>
              </>}
              {tab === "Media & 3D" && <>
                <Field label="Cover image" hint="Use an existing /media/ path or a public HTTPS image URL. This dashboard edits references; it does not upload files."><input value={project.image ?? ""} onChange={(event) => update("image", event.target.value)} placeholder="/media/my-project/cover.webp" /></Field>
                <Field label="Image description"><input value={project.imageAlt ?? ""} onChange={(event) => update("imageAlt", event.target.value)} maxLength={500} /></Field>
                <div className="admin-two-col"><Field label="3D model URL" hint="Keep the existing robot URLs to preserve their simulations."><input value={project.model ?? ""} onChange={(event) => update("model", event.target.value)} placeholder="/models/robot.glb" /></Field><Field label="Model type"><select value={project.modelType ?? ""} onChange={(event) => update("modelType", event.target.value as Project["modelType"] || undefined)}><option value="">None</option>{["original", "cad-export", "visual-reconstruction", "placeholder"].map((value) => <option key={value}>{value}</option>)}</select></Field></div>
                <Field label="Gallery (JSON)" hint={'A list of { "src": "/media/photo.webp", "alt": "Description" } objects.'}><textarea className="font-mono text-xs" rows={8} value={draft.gallery} onChange={(event) => setDraft({ ...draft, gallery: event.target.value })} spellCheck={false} /></Field>
                <Field label="Videos (JSON)" hint={'A list of { "src": "/media/demo.mp4", "poster": "/media/photo.webp", "label": "Demo" } objects.'}><textarea className="font-mono text-xs" rows={8} value={draft.videos} onChange={(event) => setDraft({ ...draft, videos: event.target.value })} spellCheck={false} /></Field>
              </>}
              {tab === "Details" && <>
                {([['live', 'Live website'], ['github', 'GitHub repository'], ['documentation', 'Documentation']] as const).map(([key, label]) => <Field key={key} label={label}><input type="url" value={project.links[key] ?? ""} onChange={(event) => update("links", { ...project.links, [key]: event.target.value })} placeholder="https://" /></Field>)}
                <Field label="Challenges" hint="One point per line."><textarea rows={5} value={draft.challenges} onChange={(event) => setDraft({ ...draft, challenges: event.target.value })} /></Field>
                <Field label="Specifications (JSON)" hint={'A list of { "label": "Controller", "value": "ESP32" } objects.'}><textarea className="font-mono text-xs" rows={8} value={draft.metadata} onChange={(event) => setDraft({ ...draft, metadata: event.target.value })} spellCheck={false} /></Field>
                <Field label="Undocumented details" hint="One point per line. These appear on the project page."><textarea rows={4} value={draft.missingInfo} onChange={(event) => setDraft({ ...draft, missingInfo: event.target.value })} /></Field>
              </>}
            </fieldset>
            <div className="admin-editor-footer">
              {error && <p className="admin-error w-full whitespace-pre-line" role="alert">{error}</p>}
              {message && <p className="flex w-full items-center gap-2 text-sm text-accent" role="status"><Check className="size-4 shrink-0" aria-hidden="true" />{message}</p>}
              {selected && <button type="button" className="btn btn-ghost text-red-300" disabled={busy} onClick={remove}><Trash2 className="size-4" aria-hidden="true" /> Delete project</button>}
              <div className="ml-auto flex flex-wrap gap-3">{selected && <a className="btn btn-secondary" href={`/projects/${selected.project.slug}`} target="_blank" rel="noopener noreferrer">View project <ArrowUpRight className="size-4" aria-hidden="true" /></a>}<button type="submit" className="btn btn-primary" disabled={busy || (Boolean(selected) && !dirty)}>{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />} Save project</button></div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
