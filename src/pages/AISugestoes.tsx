import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles, CheckCircle2, XCircle, Clock, Upload, Play, Eye,
  Instagram, Linkedin, TrendingUp, ThumbsUp, ThumbsDown,
  BarChart3, RefreshCw, ChevronRight, Video, Brain, Target,
  Loader2, AlertCircle, Info
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SuggestionStatus = "pending" | "accepted" | "rejected" | "posted";

interface AISuggestion {
  id: number;
  title: string;
  description: string;
  platform: string;
  type: string;
  hashtags: string[];
  hook: string | null;
  cta: string | null;
  ideal_time: string | null;
  reasoning: string | null;
  status: SuggestionStatus;
  generation_run_id: string;
  model_version: string;
  created_at: string;
  reject_reason?: string | null;
  video_url?: string | null;
  impressions?: number | null;
  reach?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  engagement_score?: number | null;
  posted_at?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const platformColors: Record<string, string> = {
  Instagram: "from-pink-500 to-purple-600",
  TikTok: "from-cyan-400 to-pink-500",
  LinkedIn: "from-blue-600 to-blue-800",
  YouTube: "from-red-500 to-red-700",
};

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  TikTok: <span className="text-sm font-bold">TK</span>,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  YouTube: <Play className="h-4 w-4" />,
};

const statusConfig: Record<SuggestionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-400", icon: <Clock className="h-3 w-3" /> },
  accepted: { label: "Aceito", color: "bg-blue-500/10 text-blue-400", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive", icon: <XCircle className="h-3 w-3" /> },
  posted: { label: "Postado", color: "bg-success/10 text-green-400", icon: <TrendingUp className="h-3 w-3" /> },
};

const REJECT_REASONS = [
  "Tema não relevante agora",
  "Já fiz conteúdo similar recentemente",
  "Tom não combina com minha marca",
  "Muito técnico / difícil de produzir",
  "Não tenho material para isso",
  "Prefiro outro formato",
  "Outro motivo",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AISugestoes() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | SuggestionStatus>("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [rejectModal, setRejectModal] = useState<AISuggestion | null>(null);
  const [postModal, setPostModal] = useState<AISuggestion | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, posted: 0 });

  const fetchSuggestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_suggestions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSuggestions(data as AISuggestion[]);
      const s = { total: data.length, pending: 0, accepted: 0, rejected: 0, posted: 0 };
      data.forEach((d: AISuggestion) => { if (d.status in s) s[d.status as keyof typeof s]++; });
      setStats(s);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSuggestions(); }, []);

  const handleAccept = async (s: AISuggestion) => {
    const { error } = await supabase
      .from("ai_suggestions")
      .update({ status: "accepted" })
      .eq("id", s.id);
    if (!error) {
      setSuggestions(prev => prev.map(p => p.id === s.id ? { ...p, status: "accepted" } : p));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, accepted: prev.accepted + 1 }));
    }
  };

  const handleReject = async (s: AISuggestion, reason: string) => {
    const { error } = await supabase
      .from("ai_suggestions")
      .update({ status: "rejected", reject_reason: reason })
      .eq("id", s.id);
    if (!error) {
      setSuggestions(prev => prev.map(p => p.id === s.id ? { ...p, status: "rejected", reject_reason: reason } : p));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      setRejectModal(null);
    }
  };

  const handlePostSubmit = async (s: AISuggestion, metrics: Partial<AISuggestion>, videoUrl: string) => {
    const engScore = metrics.impressions && metrics.likes
      ? parseFloat((((metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)) / metrics.impressions * 100).toFixed(2))
      : null;

    const { error } = await supabase
      .from("ai_suggestions")
      .update({
        status: "posted",
        video_url: videoUrl || null,
        impressions: metrics.impressions || null,
        reach: metrics.reach || null,
        likes: metrics.likes || null,
        comments: metrics.comments || null,
        shares: metrics.shares || null,
        saves: metrics.saves || null,
        clicks: metrics.clicks || null,
        ctr: metrics.ctr || null,
        engagement_score: engScore,
        posted_at: new Date().toISOString(),
      })
      .eq("id", s.id);

    if (!error) {
      await supabase.from("ai_learning_context").insert({
        platform: s.platform,
        type: s.type,
        title: s.title,
        avg_engagement_score: engScore,
        avg_ctr: metrics.ctr || null,
        source_suggestion_id: s.id,
        generation_run_id: s.generation_run_id,
      });

      setSuggestions(prev => prev.map(p => p.id === s.id ? { ...p, status: "posted", ...metrics, engagement_score: engScore } : p));
      setStats(prev => ({ ...prev, accepted: prev.accepted - 1, posted: prev.posted + 1 }));
      setPostModal(null);
    }
  };

  const filtered = filterStatus === "all" ? suggestions : suggestions.filter(s => s.status === filterStatus);

  return (
    <motion.div className="p-6 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Sugestões de IA</h1>
            <p className="text-xs text-muted-foreground">Gerado automaticamente · aprende com seus posts</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={fetchSuggestions}>
          <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", key: "all" },
          { label: "Pendentes", value: stats.pending, color: "text-yellow-400", key: "pending" },
          { label: "Aceitos", value: stats.accepted, color: "text-blue-400", key: "accepted" },
          { label: "Rejeitados", value: stats.rejected, color: "text-destructive", key: "rejected" },
          { label: "Postados", value: stats.posted, color: "text-green-400", key: "posted" },
        ].map(stat => (
          <motion.button
            key={stat.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(stat.key as typeof filterStatus)}
            className={`glass glass-shimmer rounded-2xl p-4 text-left transition-all ${filterStatus === stat.key ? "ring-1 ring-primary/40" : ""}`}
          >
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando sugestões...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-subtle rounded-2xl space-y-3">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
          <p className="font-display text-sm text-muted-foreground">
            {filterStatus === "all" ? "Nenhuma sugestão ainda. O n8n gera toda segunda às 8h." : `Nenhuma sugestão com status "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
                className="glass glass-shimmer rounded-2xl p-4 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[s.platform] || "from-gray-500 to-gray-700"} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                  {platformIcons[s.platform] || <Sparkles className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <p className="font-medium text-foreground text-sm">{s.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-display uppercase tracking-wider flex items-center gap-1 shrink-0 ${statusConfig[s.status].color}`}>
                      {statusConfig[s.status].icon}{statusConfig[s.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                    <span className="text-primary font-display">{s.platform} · {s.type}</span>
                    {s.ideal_time && <span>⏰ {s.ideal_time}</span>}
                    {s.hashtags?.slice(0, 3).map(h => <span key={h} className="text-primary/60">{h}</span>)}
                  </div>
                  {s.status === "rejected" && s.reject_reason && (
                    <p className="text-[10px] text-destructive mt-1">Motivo: {s.reject_reason}</p>
                  )}
                  {s.status === "posted" && s.engagement_score != null && (
                    <div className="flex items-center gap-4 mt-2 text-[10px]">
                      <span className="text-green-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Eng: {s.engagement_score}%</span>
                      {s.impressions && <span className="text-muted-foreground"><Eye className="h-3 w-3 inline mr-0.5" />{formatNum(s.impressions)}</span>}
                      {s.ctr && <span className="text-primary">CTR: {s.ctr}%</span>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-lg px-2" onClick={() => setSelectedSuggestion(s)}>
                    <Info className="h-3 w-3 mr-1" /> Ver
                  </Button>
                  {s.status === "pending" && (
                    <>
                      <Button size="sm" className="h-7 text-[10px] rounded-lg px-2 bg-green-600 hover:bg-green-500" onClick={() => handleAccept(s)}>
                        <ThumbsUp className="h-3 w-3 mr-1" /> Aceitar
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setRejectModal(s)}>
                        <ThumbsDown className="h-3 w-3 mr-1" /> Rejeitar
                      </Button>
                    </>
                  )}
                  {s.status === "accepted" && (
                    <Button size="sm" className="h-7 text-[10px] rounded-lg px-2" onClick={() => setPostModal(s)}>
                      <Upload className="h-3 w-3 mr-1" /> Confirmar Post
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Sheet open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <SheetContent className="glass-elevated border-l-0 w-[480px] sm:w-[540px] overflow-auto rounded-l-3xl">
          {selectedSuggestion && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[selectedSuggestion.platform] || "from-gray-500 to-gray-700"} flex items-center justify-center text-white`}>
                    {platformIcons[selectedSuggestion.platform] || <Sparkles className="h-4 w-4" />}
                  </div>
                  <div>
                    <SheetTitle className="font-display text-base">{selectedSuggestion.title}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{selectedSuggestion.platform} · {selectedSuggestion.type}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-5 space-y-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-display flex items-center gap-1 w-fit ${statusConfig[selectedSuggestion.status].color}`}>
                  {statusConfig[selectedSuggestion.status].icon}{statusConfig[selectedSuggestion.status].label}
                </span>

                <div className="glass-subtle rounded-2xl p-4 space-y-3">
                  <DetailRow label="Descrição" value={selectedSuggestion.description} />
                  {selectedSuggestion.hook && <DetailRow label="🎣 Hook (3 seg)" value={selectedSuggestion.hook} highlight />}
                  {selectedSuggestion.cta && <DetailRow label="📣 CTA" value={selectedSuggestion.cta} />}
                  {selectedSuggestion.ideal_time && <DetailRow label="⏰ Horário ideal" value={selectedSuggestion.ideal_time} />}
                  {selectedSuggestion.reasoning && <DetailRow label="🧠 Por que vai funcionar" value={selectedSuggestion.reasoning} />}
                </div>

                {selectedSuggestion.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSuggestion.hashtags.map(h => (
                      <span key={h} className="text-xs px-2.5 py-1 glass-subtle rounded-full text-primary">{h}</span>
                    ))}
                  </div>
                )}

                {selectedSuggestion.status === "posted" && (
                  <div className="glass-subtle rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Métricas do Post</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Impressões", formatNum(selectedSuggestion.impressions || 0)],
                        ["Alcance", formatNum(selectedSuggestion.reach || 0)],
                        ["Likes", formatNum(selectedSuggestion.likes || 0)],
                        ["Comentários", formatNum(selectedSuggestion.comments || 0)],
                        ["Compartilhamentos", formatNum(selectedSuggestion.shares || 0)],
                        ["Salvos", formatNum(selectedSuggestion.saves || 0)],
                        ["Cliques", formatNum(selectedSuggestion.clicks || 0)],
                        ["CTR", `${selectedSuggestion.ctr || 0}%`],
                      ].map(([label, value]) => (
                        <div key={label} className="glass rounded-xl p-2 text-center">
                          <p className="font-display font-bold text-sm text-foreground">{value}</p>
                          <p className="text-[9px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    {selectedSuggestion.engagement_score != null && (
                      <div className="glass rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Engajamento Score</span>
                        <span className="font-display font-bold text-green-400 text-sm">{selectedSuggestion.engagement_score}%</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedSuggestion.status === "pending" && (
                  <div className="flex gap-2">
                    <Button className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-xs" onClick={() => { handleAccept(selectedSuggestion); setSelectedSuggestion(null); }}>
                      <ThumbsUp className="h-3 w-3 mr-1" /> Aceitar
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 text-xs" onClick={() => { setRejectModal(selectedSuggestion); setSelectedSuggestion(null); }}>
                      <ThumbsDown className="h-3 w-3 mr-1" /> Rejeitar
                    </Button>
                  </div>
                )}
                {selectedSuggestion.status === "accepted" && (
                  <Button className="w-full rounded-xl text-xs" onClick={() => { setPostModal(selectedSuggestion); setSelectedSuggestion(null); }}>
                    <Upload className="h-3 w-3 mr-1" /> Confirmar que foi postado
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>

      <RejectModal suggestion={rejectModal} onReject={handleReject} onClose={() => setRejectModal(null)} />
      <PostConfirmModal suggestion={postModal} onSubmit={handlePostSubmit} onClose={() => setPostModal(null)} />
    </motion.div>
  );
}

function RejectModal({ suggestion, onReject, onClose }: {
  suggestion: AISuggestion | null;
  onReject: (s: AISuggestion, reason: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const reason = selected === "Outro motivo" ? custom : selected;

  return (
    <Dialog open={!!suggestion} onOpenChange={onClose}>
      <DialogContent className="glass-elevated border-0 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-base">
            <XCircle className="h-4 w-4 text-destructive" /> Por que rejeitar?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <p className="text-xs text-muted-foreground line-clamp-2">{suggestion?.title}</p>
          <div className="space-y-2">
            {REJECT_REASONS.map(r => (
              <button key={r} onClick={() => setSelected(r)} className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors ${selected === r ? "bg-destructive/20 text-destructive" : "glass-subtle hover:bg-white/5"}`}>
                {r}
              </button>
            ))}
          </div>
          {selected === "Outro motivo" && (
            <Textarea placeholder="Descreva o motivo..." value={custom} onChange={e => setCustom(e.target.value)} className="bg-transparent border-border/40 rounded-xl text-xs min-h-[80px]" />
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl border-border/30 text-xs" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-xs" disabled={!reason} onClick={() => suggestion && onReject(suggestion, reason)}>
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PostConfirmModal({ suggestion, onSubmit, onClose }: {
  suggestion: AISuggestion | null;
  onSubmit: (s: AISuggestion, metrics: Partial<AISuggestion>, videoUrl: string) => void;
  onClose: () => void;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"upload" | "metrics">("upload");
  const [metrics, setMetrics] = useState({ impressions: "", reach: "", likes: "", comments: "", shares: "", saves: "", clicks: "", ctr: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setVideoFile(file);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `videos/${suggestion!.id}_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("ai-content-videos").upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("ai-content-videos").getPublicUrl(filename);
      setVideoUrl(urlData.publicUrl);
    } catch {
      setVideoUrl(`local://${file.name}`);
    }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!suggestion) return;
    const m: Partial<AISuggestion> = {
      impressions: metrics.impressions ? parseInt(metrics.impressions) : null,
      reach: metrics.reach ? parseInt(metrics.reach) : null,
      likes: metrics.likes ? parseInt(metrics.likes) : null,
      comments: metrics.comments ? parseInt(metrics.comments) : null,
      shares: metrics.shares ? parseInt(metrics.shares) : null,
      saves: metrics.saves ? parseInt(metrics.saves) : null,
      clicks: metrics.clicks ? parseInt(metrics.clicks) : null,
      ctr: metrics.ctr ? parseFloat(metrics.ctr) : null,
    };
    onSubmit(suggestion, m, videoUrl);
  };

  if (!suggestion) return null;

  return (
    <Dialog open={!!suggestion} onOpenChange={onClose}>
      <DialogContent className="glass-elevated border-0 rounded-2xl max-w-lg max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" /> Confirmar Post Publicado
          </DialogTitle>
        </DialogHeader>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground pb-3">
            <button onClick={() => setStep("upload")} className={`flex items-center gap-1 ${step === "upload" ? "text-primary" : ""}`}>
              <Video className="h-3 w-3" /> Vídeo
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => step === "metrics" && setStep("metrics")} className={`flex items-center gap-1 ${step === "metrics" ? "text-primary" : ""}`}>
              <BarChart3 className="h-3 w-3" /> Métricas
            </button>
          </div>
          <p className="text-xs text-muted-foreground pb-2">{suggestion.title}</p>
          {step === "upload" ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border/40 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors glass-subtle" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}>
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs">Fazendo upload do vídeo...</p></div>
                ) : videoFile ? (
                  <div className="flex flex-col items-center gap-2"><CheckCircle2 className="h-8 w-8 text-green-400" /><p className="text-xs text-green-400 font-medium">{videoFile.name}</p><p className="text-[10px] text-muted-foreground">Clique para trocar</p></div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Video className="h-8 w-8 opacity-30" /><p className="text-xs">Arraste o vídeo aqui ou clique para selecionar</p><p className="text-[10px]">MP4, MOV, AVI</p></div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ou cole a URL do post publicado</Label>
                <Input value={videoUrl.startsWith("local://") ? "" : videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." className="bg-transparent border-border/40 rounded-xl mt-1 text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl border-border/30 text-xs" onClick={onClose}>Cancelar</Button>
                <Button className="flex-1 rounded-xl text-xs" onClick={() => setStep("metrics")}>Próximo: Métricas <ChevronRight className="h-3 w-3 ml-1" /></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-subtle rounded-2xl p-3 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                Insira as métricas do post para treinar a IA. Quanto mais dados, melhores as próximas sugestões.
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "impressions", label: "Impressões" },
                  { key: "reach", label: "Alcance" },
                  { key: "likes", label: "Likes" },
                  { key: "comments", label: "Comentários" },
                  { key: "shares", label: "Compartilhamentos" },
                  { key: "saves", label: "Salvos" },
                  { key: "clicks", label: "Cliques" },
                  { key: "ctr", label: "CTR (%)" },
                ].map(field => (
                  <div key={field.key}>
                    <Label className="text-[10px] text-muted-foreground">{field.label}</Label>
                    <Input type="number" placeholder="0" value={metrics[field.key as keyof typeof metrics]} onChange={e => setMetrics(prev => ({ ...prev, [field.key]: e.target.value }))} className="bg-transparent border-border/40 rounded-xl mt-1 text-xs h-8" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="rounded-xl border-border/30 text-xs" onClick={() => setStep("upload")}>Voltar</Button>
                <Button className="flex-1 rounded-xl text-xs" onClick={handleSubmit}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmar Post + Salvar Métricas
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-xs ${highlight ? "text-primary font-medium" : "text-foreground/80"}`}>{value}</p>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
