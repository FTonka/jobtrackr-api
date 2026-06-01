import {
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Filter,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ApiError, api } from "./api";
import type {
  AuthResponse,
  JobApplication,
  JobApplicationPayload,
  JobStatus,
  Note
} from "./types";

const authStorageKey = "jobtrackr.auth";

const statusLabels: Record<JobStatus, string> = {
  Applied: "Basvuruldu",
  InReview: "Incelemede",
  Interview: "Mulakat",
  TechnicalTest: "Teknik test",
  Offer: "Teklif",
  Rejected: "Reddedildi",
  Withdrawn: "Geri cekildi"
};

const statusOptions = Object.keys(statusLabels) as JobStatus[];

const initialForm: JobApplicationPayload = {
  companyName: "",
  position: "",
  jobUrl: "",
  location: "",
  salaryMin: null,
  salaryMax: null,
  interviewDate: ""
};

function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(authStorageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(authStorageKey);
    return null;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatCurrency(min?: number | null, max?: number | null) {
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  });

  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
  if (min) return `${formatter.format(min)}+`;
  if (max) return formatter.format(max);
  return "-";
}

function normalizeForm(form: JobApplicationPayload): JobApplicationPayload {
  return {
    companyName: form.companyName.trim(),
    position: form.position.trim(),
    jobUrl: form.jobUrl?.trim() || null,
    location: form.location?.trim() || null,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
    salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    interviewDate: form.interviewDate || null
  };
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(getStoredAuth);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<JobApplicationPayload>(initialForm);
  const [noteDraft, setNoteDraft] = useState({ content: "", noteType: "General" });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteEditDraft, setNoteEditDraft] = useState({ content: "", noteType: "General" });

  const selectedApplication = applications.find((item) => item.id === selectedId) ?? null;

  const filteredApplications = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return applications
      .filter((item) => statusFilter === "All" || item.status === statusFilter)
      .filter((item) => {
        if (!needle) return true;
        return [item.companyName, item.position, item.location, item.status]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle));
      })
      .sort(
        (a, b) =>
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
  }, [applications, query, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      active: applications.filter(
        (item) => !["Rejected", "Withdrawn"].includes(item.status)
      ).length,
      interviews: applications.filter((item) =>
        ["Interview", "TechnicalTest"].includes(item.status)
      ).length,
      offers: applications.filter((item) => item.status === "Offer").length
    };
  }, [applications]);

  async function loadApplications(token = auth?.token) {
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const items = await api.getApplications(token);
      setApplications(items);
      setSelectedId((current) => current ?? items[0]?.id ?? null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadNotes(jobApplicationId: string) {
    if (!auth) return;

    try {
      const items = await api.getNotes(auth.token, jobApplicationId);
      setNotes(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      handleError(err);
    }
  }

  function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      setError("Oturum suresi doldu. Tekrar giris yapin.");
      return;
    }

    setError(err instanceof Error ? err.message : "Beklenmeyen bir hata olustu.");
  }

  function saveAuth(nextAuth: AuthResponse) {
    localStorage.setItem(authStorageKey, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  function logout() {
    localStorage.removeItem(authStorageKey);
    setAuth(null);
    setApplications([]);
    setSelectedId(null);
    setNotes([]);
  }

  function startCreate() {
    setEditingId(null);
    setForm(initialForm);
  }

  function startEdit(item: JobApplication) {
    setEditingId(item.id);
    setForm({
      companyName: item.companyName,
      position: item.position,
      jobUrl: item.jobUrl ?? "",
      location: item.location ?? "",
      salaryMin: item.salaryMin ?? null,
      salaryMax: item.salaryMax ?? null,
      interviewDate: toDateInput(item.interviewDate)
    });
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) return;

    const payload = normalizeForm(form);
    if (!payload.companyName || !payload.position) {
      setError("Sirket ve pozisyon alanlari zorunludur.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const saved = editingId
        ? await api.updateApplication(auth.token, editingId, payload)
        : await api.createApplication(auth.token, payload);

      setApplications((current) =>
        editingId
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      );
      setSelectedId(saved.id);
      startCreate();
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: JobStatus) {
    if (!auth) return;

    try {
      setError("");
      const updated = await api.updateApplication(auth.token, id, { status });
      setApplications((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteApplication(id: string) {
    if (!auth) return;

    try {
      setError("");
      await api.deleteApplication(auth.token, id);
      setApplications((current) => current.filter((item) => item.id !== id));
      setSelectedId((current) => (current === id ? null : current));
      setNotes([]);
    } catch (err) {
      handleError(err);
    }
  }

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth || !selectedApplication || !noteDraft.content.trim()) return;

    try {
      setError("");
      const created = await api.createNote(auth.token, selectedApplication.id, {
        content: noteDraft.content.trim(),
        noteType: noteDraft.noteType
      });
      setNotes((current) => [created, ...current]);
      setNoteDraft({ content: "", noteType: "General" });
    } catch (err) {
      handleError(err);
    }
  }

  async function submitNoteEdit(note: Note) {
    if (!auth || !selectedApplication || !noteEditDraft.content.trim()) return;

    try {
      setError("");
      const updated = await api.updateNote(auth.token, selectedApplication.id, note.id, {
        content: noteEditDraft.content.trim(),
        noteType: noteEditDraft.noteType
      });
      setNotes((current) =>
        current.map((item) => (item.id === note.id ? updated : item))
      );
      setEditingNoteId(null);
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteNote(noteId: string) {
    if (!auth || !selectedApplication) return;

    try {
      setError("");
      await api.deleteNote(auth.token, selectedApplication.id, noteId);
      setNotes((current) => current.filter((item) => item.id !== noteId));
    } catch (err) {
      handleError(err);
    }
  }

  useEffect(() => {
    if (auth) {
      void loadApplications(auth.token);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (selectedApplication) {
      void loadNotes(selectedApplication.id);
    } else {
      setNotes([]);
    }
  }, [selectedApplication?.id]);

  if (!auth) {
    return <AuthView onAuth={saveAuth} error={error} onError={setError} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <BriefcaseBusiness size={20} />
          </span>
          <div>
            <h1>JobTrackr</h1>
            <p>{auth.fullName}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => loadApplications()} title="Yenile">
            <RefreshCw size={18} />
          </button>
          <button className="ghost-button" type="button" onClick={logout}>
            <LogOut size={17} />
            Cikis
          </button>
        </div>
      </header>

      {error && (
        <div className="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} title="Kapat">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard label="Toplam" value={stats.total} icon={<BriefcaseBusiness size={19} />} />
        <StatCard label="Aktif" value={stats.active} icon={<Check size={19} />} />
        <StatCard label="Surecte" value={stats.interviews} icon={<CalendarClock size={19} />} />
        <StatCard label="Teklif" value={stats.offers} icon={<CircleDollarSign size={19} />} />
      </section>

      <section className="workspace">
        <aside className="list-pane">
          <div className="toolbar">
            <label className="search-field">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ara"
              />
            </label>
            <label className="select-field">
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as JobStatus | "All")}
              >
                <option value="All">Tum durumlar</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="application-list">
            {loading ? (
              <div className="empty-state">Yukleniyor</div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">Kayit bulunamadi</div>
            ) : (
              filteredApplications.map((item) => (
                <button
                  key={item.id}
                  className={`application-row ${selectedId === item.id ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className={`status-dot status-${item.status}`} />
                  <span className="row-main">
                    <strong>{item.companyName}</strong>
                    <span>{item.position}</span>
                  </span>
                  <span className="row-meta">{statusLabels[item.status]}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="detail-pane">
          <form className="application-form" onSubmit={submitApplication}>
            <div className="section-heading">
              <h2>{editingId ? "Basvuruyu duzenle" : "Yeni basvuru"}</h2>
              {editingId && (
                <button type="button" className="icon-button" onClick={startCreate} title="Vazgec">
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="form-grid">
              <Field label="Sirket">
                <input
                  required
                  value={form.companyName}
                  onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                />
              </Field>
              <Field label="Pozisyon">
                <input
                  required
                  value={form.position}
                  onChange={(event) => setForm({ ...form, position: event.target.value })}
                />
              </Field>
              <Field label="Lokasyon">
                <input
                  value={form.location ?? ""}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </Field>
              <Field label="Is ilani URL">
                <input
                  type="url"
                  value={form.jobUrl ?? ""}
                  onChange={(event) => setForm({ ...form, jobUrl: event.target.value })}
                />
              </Field>
              <Field label="Min maas">
                <input
                  type="number"
                  min="0"
                  value={form.salaryMin ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      salaryMin: event.target.value ? Number(event.target.value) : null
                    })
                  }
                />
              </Field>
              <Field label="Max maas">
                <input
                  type="number"
                  min="0"
                  value={form.salaryMax ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      salaryMax: event.target.value ? Number(event.target.value) : null
                    })
                  }
                />
              </Field>
              <Field label="Mulakat tarihi">
                <input
                  type="date"
                  value={form.interviewDate ?? ""}
                  onChange={(event) => setForm({ ...form, interviewDate: event.target.value })}
                />
              </Field>
            </div>

            <button className="primary-button" type="submit" disabled={saving}>
              <Plus size={17} />
              {saving ? "Kaydediliyor" : editingId ? "Guncelle" : "Ekle"}
            </button>
          </form>

          {selectedApplication ? (
            <ApplicationDetail
              application={selectedApplication}
              notes={notes}
              noteDraft={noteDraft}
              noteEditDraft={noteEditDraft}
              editingNoteId={editingNoteId}
              onEditApplication={startEdit}
              onDeleteApplication={deleteApplication}
              onStatusChange={changeStatus}
              onNoteDraftChange={setNoteDraft}
              onNoteSubmit={submitNote}
              onNoteEditStart={(note) => {
                setEditingNoteId(note.id);
                setNoteEditDraft({ content: note.content, noteType: note.noteType });
              }}
              onNoteEditCancel={() => setEditingNoteId(null)}
              onNoteEditDraftChange={setNoteEditDraft}
              onNoteEditSubmit={submitNoteEdit}
              onNoteDelete={deleteNote}
            />
          ) : (
            <div className="detail-empty">
              <FileText size={30} />
              <span>Secili basvuru yok</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function AuthView({
  onAuth,
  error,
  onError
}: {
  onAuth: (auth: AuthResponse) => void;
  error: string;
  onError: (message: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      onError("");
      const result =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);
      onAuth(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Giris tamamlanamadi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">
            <BriefcaseBusiness size={22} />
          </span>
          <h1>JobTrackr</h1>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            Giris
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            Kayit
          </button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <Field label="Ad soyad">
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>
          <Field label="Sifre">
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </Field>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Bekleyin" : mode === "login" ? "Giris yap" : "Hesap olustur"}
          </button>
        </form>
      </section>
    </main>
  );
}

function ApplicationDetail({
  application,
  notes,
  noteDraft,
  noteEditDraft,
  editingNoteId,
  onEditApplication,
  onDeleteApplication,
  onStatusChange,
  onNoteDraftChange,
  onNoteSubmit,
  onNoteEditStart,
  onNoteEditCancel,
  onNoteEditDraftChange,
  onNoteEditSubmit,
  onNoteDelete
}: {
  application: JobApplication;
  notes: Note[];
  noteDraft: { content: string; noteType: string };
  noteEditDraft: { content: string; noteType: string };
  editingNoteId: string | null;
  onEditApplication: (application: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onNoteDraftChange: (draft: { content: string; noteType: string }) => void;
  onNoteSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNoteEditStart: (note: Note) => void;
  onNoteEditCancel: () => void;
  onNoteEditDraftChange: (draft: { content: string; noteType: string }) => void;
  onNoteEditSubmit: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
}) {
  return (
    <article className="selected-detail">
      <div className="detail-header">
        <div>
          <span className={`status-pill status-${application.status}`}>
            {statusLabels[application.status]}
          </span>
          <h2>{application.companyName}</h2>
          <p>{application.position}</p>
        </div>
        <div className="detail-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => onEditApplication(application)}
            title="Duzenle"
          >
            <Pencil size={17} />
          </button>
          <button
            className="icon-button danger"
            type="button"
            onClick={() => onDeleteApplication(application.id)}
            title="Sil"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <InfoItem icon={<MapPin size={17} />} label="Lokasyon" value={application.location ?? "-"} />
        <InfoItem icon={<CalendarClock size={17} />} label="Basvuru" value={formatDate(application.appliedDate)} />
        <InfoItem icon={<CalendarClock size={17} />} label="Mulakat" value={formatDate(application.interviewDate)} />
        <InfoItem icon={<CircleDollarSign size={17} />} label="Maas" value={formatCurrency(application.salaryMin, application.salaryMax)} />
      </div>

      <div className="status-strip">
        {statusOptions.map((status) => (
          <button
            key={status}
            type="button"
            className={application.status === status ? "is-active" : ""}
            onClick={() => onStatusChange(application.id, status)}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {application.jobUrl && (
        <a className="job-link" href={application.jobUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          Ilani ac
        </a>
      )}

      <section className="notes-section">
        <div className="section-heading">
          <h2>Notlar</h2>
          <span>{notes.length}</span>
        </div>

        <form className="note-form" onSubmit={onNoteSubmit}>
          <select
            value={noteDraft.noteType}
            onChange={(event) =>
              onNoteDraftChange({ ...noteDraft, noteType: event.target.value })
            }
          >
            <option value="General">Genel</option>
            <option value="Interview">Mulakat</option>
            <option value="FollowUp">Takip</option>
            <option value="Offer">Teklif</option>
          </select>
          <textarea
            value={noteDraft.content}
            onChange={(event) =>
              onNoteDraftChange({ ...noteDraft, content: event.target.value })
            }
            placeholder="Not"
            rows={3}
          />
          <button className="primary-button" type="submit">
            <Plus size={17} />
            Not ekle
          </button>
        </form>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">Not yok</div>
          ) : (
            notes.map((note) => (
              <div className="note-card" key={note.id}>
                {editingNoteId === note.id ? (
                  <>
                    <div className="note-edit-grid">
                      <select
                        value={noteEditDraft.noteType}
                        onChange={(event) =>
                          onNoteEditDraftChange({
                            ...noteEditDraft,
                            noteType: event.target.value
                          })
                        }
                      >
                        <option value="General">Genel</option>
                        <option value="Interview">Mulakat</option>
                        <option value="FollowUp">Takip</option>
                        <option value="Offer">Teklif</option>
                      </select>
                      <textarea
                        value={noteEditDraft.content}
                        onChange={(event) =>
                          onNoteEditDraftChange({
                            ...noteEditDraft,
                            content: event.target.value
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="inline-actions">
                      <button type="button" className="primary-button compact" onClick={() => onNoteEditSubmit(note)}>
                        <Check size={16} />
                        Kaydet
                      </button>
                      <button type="button" className="ghost-button compact" onClick={onNoteEditCancel}>
                        <X size={16} />
                        Vazgec
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="note-head">
                      <span>{note.noteType}</span>
                      <time>{formatDateTime(note.updatedAt ?? note.createdAt)}</time>
                    </div>
                    <p>{note.content}</p>
                    <div className="inline-actions">
                      <button type="button" className="icon-button" onClick={() => onNoteEditStart(note)} title="Duzenle">
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="icon-button danger" onClick={() => onNoteDelete(note.id)} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="info-item">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
