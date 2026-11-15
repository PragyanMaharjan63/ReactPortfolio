"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { HERO_WORD, type EducationEntry, type Language, type Profile } from "@/data/profile";
import type { ProfileRecord } from "@/lib/storage";
import { profileSchema } from "@/lib/profile-validation";

type ExperienceDraft = { role: string; organisation: string; url: string; start: string; end: string; ongoing: boolean; highlights: string };
type SkillDraft = { name: string; items: string };
type Draft = { heroWord: string; headline: string; bio: string; experience: ExperienceDraft[]; skills: SkillDraft[]; languages: Language[]; education: EducationEntry[] };

const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

const toDraft = (profile: Profile): Draft => ({
  heroWord: profile.heroWord ?? HERO_WORD,
  headline: profile.headline,
  bio: profile.bio,
  experience: profile.experience.map((entry) => ({
    role: entry.role, organisation: entry.organisation, url: entry.url ?? "", start: entry.start,
    end: entry.end ?? "", ongoing: !entry.end, highlights: entry.highlights.join("\n"),
  })),
  skills: profile.skills.map((group) => ({ name: group.name, items: group.items.join("\n") })),
  languages: profile.languages.map((language) => ({ name: language.name, code: language.code ?? "" })),
  education: profile.education.map((entry) => ({ school: entry.school, field: entry.field ?? "", start: entry.start, end: entry.end ?? "" })),
});

const fromDraft = (draft: Draft): Profile => ({
  heroWord: draft.heroWord,
  headline: draft.headline,
  bio: draft.bio,
  experience: draft.experience.map((entry) => ({
    role: entry.role, organisation: entry.organisation, start: entry.start,
    // Always saved, even when empty: "" means "no link", so defaults never refill it.
    url: entry.url.trim(),
    ...(!entry.ongoing && entry.end ? { end: entry.end } : {}),
    highlights: lines(entry.highlights),
  })),
  skills: draft.skills.map((group) => ({ name: group.name, items: lines(group.items) })),
  languages: draft.languages.map((language) => ({ name: language.name, ...(language.code?.trim() ? { code: language.code.trim() } : {}) })),
  education: draft.education.map((entry) => ({ school: entry.school, start: entry.start, ...(entry.field?.trim() ? { field: entry.field.trim() } : {}), ...(entry.end ? { end: entry.end } : {}) })),
});

const thisMonth = () => new Date().toISOString().slice(0, 7);

function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <label className={`admin-field ${className ?? ""}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

/** Up / down / remove for one item in a list. */
function ItemControls({ index, count, name, onMove, onRemove }: { index: number; count: number; name: string; onMove: (from: number, to: number) => void; onRemove: (index: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" className="admin-icon" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}><ArrowUp className="size-3.5" /></button>
      <button type="button" className="admin-icon" aria-label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}><ArrowDown className="size-3.5" /></button>
      <button type="button" className="admin-icon hover:!text-red-300" aria-label={`Remove ${name}`} onClick={() => onRemove(index)}><Trash2 className="size-3.5" /></button>
    </div>
  );
}

function Group({ title, hint, onAdd, addLabel, children }: { title: string; hint?: string; onAdd?: () => void; addLabel?: string; children: ReactNode }) {
  return (
    <section className="admin-group">
      <div className="admin-group-head">
        <div><h3>{title}</h3>{hint && <p>{hint}</p>}</div>
        {onAdd && <button type="button" className="btn btn-secondary btn-sm" onClick={onAdd}><Plus className="size-3.5" aria-hidden="true" /> {addLabel}</button>}
      </div>
      {children}
    </section>
  );
}

export function ProfileEditor({ initialRecord }: { initialRecord: ProfileRecord }) {
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [draft, setDraft] = useState(() => toDraft(initialRecord.profile));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(record.profile));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Immutable edit of one list in the draft. */
  function edit<K extends "experience" | "skills" | "languages" | "education">(key: K, change: (list: Draft[K]) => Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: change(previous[key]) }));
    setMessage("");
  }
  function patch<K extends "experience" | "skills" | "languages" | "education">(key: K, index: number, value: Partial<Draft[K][number]>) {
    edit(key, (list) => list.map((item, i) => (i === index ? { ...item, ...value } : item)) as Draft[K]);
  }
  const move = (key: "experience" | "skills" | "languages" | "education") => (from: number, to: number) =>
    edit(key, (list) => { const next = [...list] as typeof list; const [item] = next.splice(from, 1); next.splice(to, 0, item as never); return next; });
  const remove = (key: "experience" | "skills" | "languages" | "education") => (index: number) =>
    edit(key, (list) => list.filter((_, i) => i !== index) as typeof list);

  async function save() {
    setError(""); setMessage("");
    const result = profileSchema.safeParse(fromDraft(draft));
    if (!result.success) { setError(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/profile", { method: "PUT", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: result.data, revision: record.revision }) });
      const body = await response.json();
      if (response.status === 401) { router.replace("/dashboard/login"); router.refresh(); }
      if (!response.ok) throw new Error(body.error ?? "Could not save your profile.");
      setRecord(body.record); setDraft(toDraft(body.record.profile));
      setMessage("Saved. Your profile is live.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save your profile."); }
    finally { setBusy(false); }
  }

  return (
    <form className="panel min-w-0 overflow-hidden" aria-labelledby="profile-heading" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <div className="admin-editor-header">
        <div><p className="label">About you</p><h2 id="profile-heading" className="mt-2 text-h3">Profile</h2></div>
        <span className={`admin-save-status ${dirty ? "text-accent" : "text-muted"}`}>{busy ? "Working…" : dirty ? "Unsaved changes" : "Up to date"}</span>
      </div>

      <fieldset disabled={busy} className="admin-fields">
        <Group title="Landing page" hint="The giant word behind the robot on the home page.">
          <Field label="Hero word" hint="Up to 16 characters. Shown in capitals and sized to fit the screen.">
            <input value={draft.heroWord} maxLength={16} required onChange={(event) => { setDraft({ ...draft, heroWord: event.target.value }); setMessage(""); }} placeholder={HERO_WORD} />
          </Field>
          <div className="admin-hero-preview" aria-hidden="true"><span>{draft.heroWord || HERO_WORD}</span></div>
        </Group>

        <Group title="Introduction" hint="Shown at the top of the About page.">
          <Field label="Headline" hint="Your title, set large. Example: Software Engineer"><input value={draft.headline} maxLength={160} required onChange={(event) => { setDraft({ ...draft, headline: event.target.value }); setMessage(""); }} /></Field>
          <Field label="Bio" hint="Leave a blank line between paragraphs. The first paragraph is shown larger."><textarea rows={9} value={draft.bio} maxLength={6000} onChange={(event) => { setDraft({ ...draft, bio: event.target.value }); setMessage(""); }} /></Field>
        </Group>

        <Group title="Experience" hint="The first ongoing role is featured as “Currently”. Every role is drawn on the timeline." addLabel="Add role"
          onAdd={() => edit("experience", (list) => [{ role: "", organisation: "", url: "", start: thisMonth(), end: "", ongoing: true, highlights: "" }, ...list])}>
          {draft.experience.map((entry, i) => (
            <div key={i} className="admin-card">
              <div className="admin-card-head">
                <span className="label">{entry.organisation || "New role"}{entry.ongoing && <span className="ml-2 text-accent">· Ongoing</span>}</span>
                <ItemControls index={i} count={draft.experience.length} name={entry.organisation || "role"} onMove={move("experience")} onRemove={remove("experience")} />
              </div>
              <div className="admin-two-col">
                <Field label="Role"><input value={entry.role} maxLength={160} required onChange={(event) => patch("experience", i, { role: event.target.value })} placeholder="Co-Founder & CTO" /></Field>
                <Field label="Organisation"><input value={entry.organisation} maxLength={160} required onChange={(event) => patch("experience", i, { organisation: event.target.value })} placeholder="Avernek Technologies" /></Field>
              </div>
              <Field label="Website" hint="Optional. Makes the organisation name a link."><input type="url" value={entry.url} onChange={(event) => patch("experience", i, { url: event.target.value })} placeholder="https://" /></Field>
              <div className="admin-two-col">
                <Field label="Started"><input type="month" value={entry.start} required onChange={(event) => patch("experience", i, { start: event.target.value })} /></Field>
                <Field label="Ended"><input type="month" value={entry.ongoing ? "" : entry.end} disabled={entry.ongoing} onChange={(event) => patch("experience", i, { end: event.target.value })} /></Field>
              </div>
              <label className="admin-checkbox"><input type="checkbox" checked={entry.ongoing} onChange={(event) => patch("experience", i, { ongoing: event.target.checked, end: event.target.checked ? "" : entry.end || thisMonth() })} /><span>I currently work here<small>Shown as “Present”, with a live marker on the timeline.</small></span></label>
              <Field label="Highlights" hint="One point per line. Shown on the About page."><textarea rows={5} value={entry.highlights} onChange={(event) => patch("experience", i, { highlights: event.target.value })} /></Field>
            </div>
          ))}
          {!draft.experience.length && <p className="text-sm text-muted">No roles yet.</p>}
        </Group>

        <Group title="Skills" hint="Each group becomes a numbered column." addLabel="Add group"
          onAdd={() => edit("skills", (list) => [...list, { name: "", items: "" }])}>
          <div className="admin-grid-2">
            {draft.skills.map((group, i) => (
              <div key={i} className="admin-card">
                <div className="admin-card-head">
                  <span className="label">Group {i + 1}</span>
                  <ItemControls index={i} count={draft.skills.length} name={group.name || "group"} onMove={move("skills")} onRemove={remove("skills")} />
                </div>
                <Field label="Name"><input value={group.name} maxLength={80} required onChange={(event) => patch("skills", i, { name: event.target.value })} placeholder="DevOps & Infrastructure" /></Field>
                <Field label="Skills" hint="One per line."><textarea rows={6} value={group.items} onChange={(event) => patch("skills", i, { items: event.target.value })} /></Field>
              </div>
            ))}
          </div>
        </Group>

        <Group title="Languages" hint="Each language becomes a tile. The short code is the big lettering; leave it empty to use the first two letters." addLabel="Add language"
          onAdd={() => edit("languages", (list) => [...list, { name: "", code: "" }])}>
          <div className="admin-rows">
            {draft.languages.map((language, i) => (
              <div key={i} className="admin-row">
                <span className="admin-tile-preview" aria-hidden="true">{language.code || language.name.slice(0, 2) || "··"}</span>
                <Field label="Language" className="flex-1"><input value={language.name} maxLength={60} required onChange={(event) => patch("languages", i, { name: event.target.value })} placeholder="TypeScript" /></Field>
                <Field label="Code" className="w-24"><input value={language.code ?? ""} maxLength={3} onChange={(event) => patch("languages", i, { code: event.target.value })} placeholder="Ts" /></Field>
                <ItemControls index={i} count={draft.languages.length} name={language.name || "language"} onMove={move("languages")} onRemove={remove("languages")} />
              </div>
            ))}
          </div>
        </Group>

        <Group title="Education" addLabel="Add school"
          onAdd={() => edit("education", (list) => [...list, { school: "", field: "", start: String(new Date().getFullYear()), end: "" }])}>
          {draft.education.map((entry, i) => (
            <div key={i} className="admin-card">
              <div className="admin-card-head">
                <span className="label">{entry.school || "New school"}</span>
                <ItemControls index={i} count={draft.education.length} name={entry.school || "school"} onMove={move("education")} onRemove={remove("education")} />
              </div>
              <div className="admin-two-col">
                <Field label="School"><input value={entry.school} maxLength={160} required onChange={(event) => patch("education", i, { school: event.target.value })} /></Field>
                <Field label="Field of study" hint="Optional."><input value={entry.field ?? ""} maxLength={160} onChange={(event) => patch("education", i, { field: event.target.value })} /></Field>
              </div>
              <div className="admin-two-col">
                <Field label="From (year)"><input value={entry.start} inputMode="numeric" maxLength={4} required onChange={(event) => patch("education", i, { start: event.target.value })} /></Field>
                <Field label="To (year)" hint="Leave empty if you are still studying."><input value={entry.end ?? ""} inputMode="numeric" maxLength={4} onChange={(event) => patch("education", i, { end: event.target.value })} /></Field>
              </div>
            </div>
          ))}
        </Group>
      </fieldset>

      <div className="admin-editor-footer">
        {error && <p className="admin-error w-full whitespace-pre-line" role="alert">{error}</p>}
        {message && <p className="flex w-full items-center gap-2 text-sm text-accent" role="status"><Check className="size-4 shrink-0" aria-hidden="true" />{message}</p>}
        {dirty && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => { setDraft(toDraft(record.profile)); setError(""); }}>Discard changes</button>}
        <div className="ml-auto flex flex-wrap gap-3">
          <a className="btn btn-secondary" href="/about" target="_blank" rel="noopener noreferrer">View About page <ArrowUpRight className="size-4" aria-hidden="true" /></a>
          <button type="submit" className="btn btn-primary" disabled={busy || !dirty}>{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />} Save profile</button>
        </div>
      </div>
    </form>
  );
}
