// ============================================================
// AiSuggestionsTab.tsx
// Adicione este componente ao projeto e importe em Conteudo.tsx
// ============================================================
// Uso em Conteudo.tsx:
//   1. Importe: import { AiSuggestionsTab } from "@/components/AiSuggestionsTab";
//   2. Adicione botão na toolbar:
//      <Button variant={viewMode === "suggestions" ? "default" : "outline"} ...
//        onClick={() => setViewMode("suggestions")}>
//        <Sparkles className="h-3 w-3 mr-1" /> Sugestões IA
//        {pendingCount > 0 && <span className="ml-1 bg-primary text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
//      </Button>
//   3. No <AnimatePresence> adicione o case "suggestions"
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, X, Upload, Clock, Instagram, Linkedin,
  Target, ChevronDown, ChevronUp, Lightbulb, Hash, MessageSquare,
  Calendar, Brain
} from "lucide-react";

// ---- Types ----
type Platform = "Instagram" | "TikTok" | "Google Ads" | "LinkedIn";
type SuggestionStatus = "pending" | "accepted" | "rejected";

interface AiSuggestion {
  id: number;
  created_at: string;
  title: string;
  description: string;
  platform: Platform;
  type: string;
  hashtags: string[];
  hook: string | null;
  cta: string | null;
  ideal_time: string | null;
  reasoning: string | null;
  status: SuggestionStatus;
  reject_reason: string | null;
  generation_run_id: string | null;
}

// ---- Platform helpers (reutilize os do Conteudo.tsx se preferir) ----
const platformColors: Record<Platform, string> = {
  Instagram: "from-pink-500 to-purple-600",
  TikTok: "from-cyan-400 to-pink-500",
  "Google Ads": "from-blue-500 to-green-500",
  LinkedIn: "from-blue-600 to-blue-800",
};
const platformIcons: Record<Platform, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  TikTok: <span className="text-sm font-bold">TK</span>,
  "Google Ads": <Target className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
};

// ---- Hook ----
export function useAiSuggestions() {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async (statusFilter?: SuggestionStatus) => {
    setLoading(true);
    let query = supabase
      .from("ai_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter) query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (!error) setSuggestions((data as AiSuggestion[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  // Aceitar sugestão → cria content_post e atualiza sugestão
  const acceptSuggestion = async (suggestion: AiSuggestion, scheduledDate: string) => {
    // 1. Cria o post no content_posts
    const { data: newPost, error: postError } = await supabase
      .from("content_posts")
      .insert({
        platform: suggestion.platform,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        status: "Ideia",
        scheduled_date: scheduledDate,
        hashtags: suggestion.hashtags,
        responsavel: "Junior Pinheiro",
        ai_generated: true,
        ai_suggestion_id: suggestion.id,
      })
      .select()
      .single();

    if (postError) { console.error(postError); return false; }

    // 2. Atualiza a sugestão como aceita
    const { error: suggError } = await supabase
      .from("ai_suggestions")
      .update({
        status: "accepted",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "Junior Pinheiro",
        content_post_id: newPost.id,
      })
      .eq("id", suggestion.id);

    if (suggError) console.error(suggError);
    else await fetchSuggestions();
    return !suggError;
  };

  // Rejeitar sugestão — armazena o motivo para aprendizado da IA
  const rejectSuggestion = async (id: number, reason: string) => {
    const { error } = await supabase
      .from("ai_suggestions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "Junior Pinheiro",
        reject_reason: reason || "Sem motivo especificado",
      })
      .eq("id", id);

    if (!error) await fetchSuggestions();
    return !error;
  };

  // Upload de vídeo — confirma que o conteúdo foi gravado
  const uploadVideo = async (
    file: File,
    contentPostId: number,
    suggestionId?: number,
  ) => {
    const ext = file.name.split(".").pop();
    const path = `videos/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/post-${contentPostId}-${Date.now()}.${ext}`;

    // 1. Upload para o Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("content-videos")
      .upload(path, file, { upsert: false });

    if (storageError) { console.error(storageError); return false; }

    // 2. Registra na tabela video_uploads
    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .insert({
        content_post_id: contentPostId,
        ai_suggestion_id: suggestionId ?? null,
        storage_path: path,
        file_name: file.name,
        file_size_bytes: file.size,
        uploaded_by: "Junior Pinheiro",
      })
      .select()
      .single();

    if (uploadError) { console.error(uploadError); return false; }

    // 3. Marca o post como gravado
    await supabase
      .from("content_posts")
      .update({ video_uploaded: true, video_upload_id: upload.id })
      .eq("id", contentPostId);

    return true;
  };

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  return { suggestions, loading, fetchSuggestions, acceptSuggestion, rejectSuggestion, uploadVideo, pendingCount };
}

// ---- Componente Principal ----
export function AiSuggestionsTab() {
  const { suggestions, loading, acceptSuggestion, rejectSuggestion, pendingCount } = useAiSuggestions();
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal de rejeição
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  // Modal de aceitar (escolher data)
  const [acceptModal, setAcceptModal] = useState<{ open: boolean; suggestion: AiSuggestion | null }>({ open: false, suggestion: null });
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = suggestions.filter(
    (s) => statusFilter === "all" || s.status === statusFilter
  );

  const handleAccept = async () => {
    if (!acceptModal.suggestion) return;
    setActionLoading(true);
    await acceptSuggestion(acceptModal.suggestion, scheduledDate);
    setActionLoading(false);
    setAcceptModal({ open: false, suggestion: null });
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setActionLoading(true);
    await rejectSuggestion(rejectModal.id, rejectReason);
    setActionLoading(false);
    setRejectModal({ open: false, id: null });
    setRejectReason("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header + filtros de status */}
      <div className="flex items-center gap-3 flex-wrap glass-subtle rounded-2xl p-3">
        <div className="flex items-center gap-2 flex-1">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-display font-medium text-foreground">
            Sugestões geradas pela IA
          </span>
          {pendingCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-display">
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {(["pending", "accepted", "rejected", "all"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className="text-xs rounded-xl h-8"
              onClick={() => setStatusFilter(s)}
            >
              {s === "pending" ? "Pendentes" : s === "accepted" ? "Aceitos" : s === "rejected" ? "Rejeitados" : "Todos"}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 glass-subtle rounded-2xl">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary opacity-30" />
          <p className="font-display text-sm text-muted-foreground">
            {statusFilter === "pending"
              ? "Nenhuma sugestão pendente. O n8n irá gerar novas na próxima segunda-feira."
              : "Nenhuma sugestão neste filtro."}
          </p>
        </div>
      )}

      {/* Lista de sugestões */}
      <AnimatePresence>
        {filtered.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: idx * 0.04 }}
            className="glass glass-shimmer rounded-2xl overflow-hidden"
          >
            {/* Cabeçalho do card */}
            <div
              className="p-4 flex items-start gap-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[s.platform]} flex items-center justify-center text-white shrink-0`}
              >
                {platformIcons[s.platform]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm truncate">{s.title}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-display uppercase tracking-wider shrink-0 ${
                      s.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : s.status === "accepted"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {s.status === "pending" ? "Pendente" : s.status === "accepted" ? "Aceito" : "Rejeitado"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="text-primary font-display">{s.platform}</span>
                  <span>{s.type}</span>
                  {s.ideal_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {s.ideal_time}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Ações rápidas (apenas para pendentes) */}
              {s.status === "pending" && (
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="h-8 text-xs rounded-xl bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setAcceptModal({ open: true, suggestion: s })}
                  >
                    <Check className="h-3 w-3 mr-1" /> Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setRejectModal({ open: true, id: s.id })}
                  >
                    <X className="h-3 w-3 mr-1" /> Rejeitar
                  </Button>
                </div>
              )}

              <div className="shrink-0 text-muted-foreground">
                {expandedId === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {/* Detalhes expandidos */}
            <AnimatePresence>
              {expandedId === s.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {s.hook && (
                        <div className="glass-subtle rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="h-3 w-3 text-yellow-400" />
                            <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Hook / Gancho</span>
                          </div>
                          <p className="text-xs text-foreground">"{s.hook}"</p>
                        </div>
                      )}
                      {s.cta && (
                        <div className="glass-subtle rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">CTA</span>
                          </div>
                          <p className="text-xs text-foreground">{s.cta}</p>
                        </div>
                      )}
                    </div>

                    {s.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        {s.hashtags.map((h) => (
                          <span key={h} className="text-xs px-2 py-0.5 glass-subtle rounded-full text-primary">{h}</span>
                        ))}
                      </div>
                    )}

                    {s.reasoning && (
                      <div className="glass-subtle rounded-xl p-3 border-l-2 border-primary/40">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Brain className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Por que a IA sugeriu isso</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.reasoning}</p>
                      </div>
                    )}

                    {s.status === "rejected" && s.reject_reason && (
                      <div className="glass-subtle rounded-xl p-3 border-l-2 border-red-500/40">
                        <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Motivo do rejeito (usado para aprendizado)</span>
                        <p className="text-xs text-red-400 mt-1">{s.reject_reason}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Modal: Aceitar + escolher data ── */}
      <Dialog open={acceptModal.open} onOpenChange={(o) => !o && setAcceptModal({ open: false, suggestion: null })}>
        <DialogContent className="max-w-md glass-elevated rounded-2xl border-0">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" /> Aceitar sugestão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {acceptModal.suggestion && (
              <div className="glass-subtle rounded-xl p-3">
                <p className="text-sm font-medium text-foreground">{acceptModal.suggestion.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{acceptModal.suggestion.platform} · {acceptModal.suggestion.type}</p>
              </div>
            )}
            <div>
              <Label className="text-xs">Data sugerida para publicação</Label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-1 w-full bg-transparent border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground"
              />
              {acceptModal.suggestion?.ideal_time && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  IA recomenda postar às {acceptModal.suggestion.ideal_time}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O conteúdo será criado como <span className="text-primary font-display">Ideia</span> no cronograma. 
              Quando você gravar e fazer upload do vídeo, o ciclo de aprendizado será acionado.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={() => setAcceptModal({ open: false, suggestion: null })}>
                Cancelar
              </Button>
              <Button
                className="flex-1 font-display rounded-xl bg-green-600 hover:bg-green-700"
                onClick={handleAccept}
                disabled={actionLoading}
              >
                {actionLoading ? "Criando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Rejeitar + motivo ── */}
      <Dialog open={rejectModal.open} onOpenChange={(o) => !o && setRejectModal({ open: false, id: null })}>
        <DialogContent className="max-w-md glass-elevated rounded-2xl border-0">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <X className="h-5 w-5 text-red-400" /> Rejeitar sugestão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Motivo do rejeito <span className="text-muted-foreground">(ajuda a IA aprender)</span></Label>
              <Textarea
                className="mt-1 bg-transparent border-border/40 rounded-xl text-sm min-h-[100px]"
                placeholder="Ex: Já fizemos esse tipo de conteúdo recentemente. Prefiro algo mais técnico sobre peças específicas..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A sugestão será arquivada e o motivo será usado pela IA para não repetir padrões indesejados.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={() => setRejectModal({ open: false, id: null })}>
                Cancelar
              </Button>
              <Button
                className="flex-1 font-display rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                variant="outline"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejeitando..." : "Rejeitar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ---- Componente de Upload de Vídeo ----
// Use no PostDetailSheet quando o post tiver ai_generated = true e video_uploaded = false
export function VideoUploadSection({
  contentPostId,
  suggestionId,
  onUploaded,
}: {
  contentPostId: number;
  suggestionId?: number;
  onUploaded?: () => void;
}) {
  const { uploadVideo } = useAiSuggestions();
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ok = await uploadVideo(file, contentPostId, suggestionId);
    if (ok) { setDone(true); onUploaded?.(); }
    setUploading(false);
  };

  if (done) return (
    <div className="flex items-center gap-2 text-green-400 text-sm">
      <Check className="h-4 w-4" /> Vídeo enviado! O ciclo de aprendizado foi acionado.
    </div>
  );

  return (
    <div className="border border-dashed border-primary/30 rounded-2xl p-5 text-center glass-subtle">
      <Upload className="h-8 w-8 mx-auto mb-2 text-primary opacity-60" />
      <p className="text-xs font-display text-foreground mb-1">Vídeo gravado?</p>
      <p className="text-[10px] text-muted-foreground mb-3">
        Faça upload aqui para confirmar a gravação e acionar o aprendizado da IA
      </p>
      <label className="cursor-pointer">
        <input type="file" accept="video/*" className="sr-only" onChange={handleFileChange} disabled={uploading} />
        <span className="inline-block text-xs bg-primary text-primary-foreground px-4 py-2 rounded-xl font-display hover:opacity-90 transition-opacity">
          {uploading ? "Enviando..." : "Selecionar vídeo"}
        </span>
      </label>
    </div>
  );
}
