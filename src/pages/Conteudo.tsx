import { useState, useMemo } from "react";
import { type ContentPost, type SocialPlatform, type PostStatus } from "@/data/conteudo";
import { useContentPosts } from "@/hooks/useContentPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Calendar, BarChart3, Instagram, Linkedin, TrendingUp, Eye, Heart, MessageCircle, Share2, MousePointerClick, Bookmark, DollarSign, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

const platforms: SocialPlatform[] = ["Instagram", "TikTok", "Google Ads", "LinkedIn"];
const statuses: PostStatus[] = ["Ideia", "Rascunho", "Agendado", "Publicado", "Cancelado"];

const platformIcons: Record<SocialPlatform, React.ReactNode> = {
  "Instagram": <Instagram className="h-4 w-4" />,
  "TikTok": <span className="text-sm font-bold">TK</span>,
  "Google Ads": <Target className="h-4 w-4" />,
  "LinkedIn": <Linkedin className="h-4 w-4" />,
};

const platformColors: Record<SocialPlatform, string> = {
  "Instagram": "from-pink-500 to-purple-600",
  "TikTok": "from-cyan-400 to-pink-500",
  "Google Ads": "from-blue-500 to-green-500",
  "LinkedIn": "from-blue-600 to-blue-800",
};

const statusBadge: Record<PostStatus, string> = {
  "Ideia": "bg-muted text-muted-foreground",
  "Rascunho": "bg-status-prospect/10 text-status-prospect",
  "Agendado": "bg-status-lead/10 text-status-lead",
  "Publicado": "bg-success/10 text-green-400",
  "Cancelado": "bg-destructive/10 text-destructive",
};

export default function Conteudo() {
  const { posts, loading, setPosts } = useContentPosts();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "metrics">("calendar");
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);

  const filtered = posts.filter(p => {
    const matchPlatform = selectedPlatform === "all" || p.platform === selectedPlatform;
    const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchStatus && matchSearch;
  });

  // Metrics aggregation per platform
  const platformMetrics = useMemo(() => {
    return platforms.map(platform => {
      const platformPosts = posts.filter(p => p.platform === platform && p.metrics);
      const totals = platformPosts.reduce((acc, p) => ({
        impressions: acc.impressions + (p.metrics?.impressions || 0),
        reach: acc.reach + (p.metrics?.reach || 0),
        likes: acc.likes + (p.metrics?.likes || 0),
        comments: acc.comments + (p.metrics?.comments || 0),
        shares: acc.shares + (p.metrics?.shares || 0),
        clicks: acc.clicks + (p.metrics?.clicks || 0),
        spent: acc.spent + (p.metrics?.spent || 0),
        conversions: acc.conversions + (p.metrics?.conversions || 0),
      }), { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, clicks: 0, spent: 0, conversions: 0 });
      const avgCtr = platformPosts.length > 0 ? platformPosts.reduce((sum, p) => sum + (p.metrics?.ctr || 0), 0) / platformPosts.length : 0;
      return { platform, posts: platformPosts.length, ...totals, ctr: avgCtr };
    });
  }, [posts]);

  const engagementChart = useMemo(() => {
    return platforms.map(p => {
      const m = platformMetrics.find(pm => pm.platform === p)!;
      return { name: p, Likes: m.likes, Comentários: m.comments, Compartilhamentos: m.shares, Cliques: m.clicks };
    });
  }, [platformMetrics]);

  const impressionsChart = useMemo(() => {
    return posts
      .filter(p => p.metrics && p.publishedDate)
      .sort((a, b) => (a.publishedDate || "").localeCompare(b.publishedDate || ""))
      .map(p => ({ name: formatDateShort(p.publishedDate!), Impressões: p.metrics!.impressions, Alcance: p.metrics!.reach, platform: p.platform }));
  }, [posts]);

  const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--status-lead))", "hsl(var(--success))", "hsl(var(--status-prospect))"];

  return (
    <motion.div className="p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Conteúdo & Mídias Sociais</h1>
        <div className="flex gap-2">
          <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" className="text-xs rounded-xl" onClick={() => setViewMode("calendar")}>
            <Calendar className="h-3 w-3 mr-1" /> Cronograma
          </Button>
          <Button variant={viewMode === "metrics" ? "default" : "outline"} size="sm" className="text-xs rounded-xl" onClick={() => setViewMode("metrics")}>
            <BarChart3 className="h-3 w-3 mr-1" /> Métricas
          </Button>
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs font-display rounded-xl"><Plus className="h-3 w-3 mr-1" /> Novo Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto glass-elevated rounded-2xl border-0">
              <DialogHeader><DialogTitle className="font-display text-lg">Novo Conteúdo</DialogTitle></DialogHeader>
              <NewPostForm onClose={() => setShowNewPost(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 items-center glass-subtle rounded-2xl p-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-transparent border-border/50 text-sm h-9 rounded-xl" />
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[160px] bg-transparent border-border/50 text-sm rounded-xl h-9"><SelectValue placeholder="Plataforma" /></SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            <SelectItem value="all">Todas Plataformas</SelectItem>
            {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px] bg-transparent border-border/50 text-sm rounded-xl h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            <SelectItem value="all">Todos Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Platform KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platformMetrics.map((pm, idx) => (
          <motion.div
            key={pm.platform}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="glass glass-shimmer rounded-2xl p-4 cursor-pointer"
            onClick={() => setSelectedPlatform(pm.platform === selectedPlatform ? "all" : pm.platform)}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${platformColors[pm.platform]} flex items-center justify-center text-white`}>
                {platformIcons[pm.platform]}
              </div>
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">{pm.platform}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Impressões</span><p className="font-display font-bold text-foreground">{formatNum(pm.impressions)}</p></div>
              <div><span className="text-muted-foreground">Alcance</span><p className="font-display font-bold text-foreground">{formatNum(pm.reach)}</p></div>
              <div><span className="text-muted-foreground">Engajamento</span><p className="font-display font-bold text-foreground">{formatNum(pm.likes + pm.comments + pm.shares)}</p></div>
              <div><span className="text-muted-foreground">CTR</span><p className="font-display font-bold text-primary">{pm.ctr.toFixed(1)}%</p></div>
            </div>
            {pm.spent > 0 && (
              <div className="mt-2 pt-2 border-t border-border/20 flex justify-between text-xs">
                <span className="text-muted-foreground">Investido</span>
                <span className="text-primary font-display font-bold">R$ {pm.spent.toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "calendar" ? (
          <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {/* Cronograma — grouped by month/week */}
            <div className="space-y-3">
              {filtered.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedPost(post)}
                  className="glass glass-shimmer rounded-2xl p-4 cursor-pointer flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[post.platform]} flex items-center justify-center text-white shrink-0`}>
                    {platformIcons[post.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground text-sm truncate">{post.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-display uppercase tracking-wider shrink-0 ${statusBadge[post.status]}`}>{post.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{post.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {formatDate(post.scheduledDate)}</span>
                      {post.scheduledTime && <span>{post.scheduledTime}</span>}
                      <span className="text-primary font-display">{post.type}</span>
                      {post.hashtags.length > 0 && <span className="truncate max-w-[150px]">{post.hashtags.slice(0, 2).join(" ")}</span>}
                    </div>
                  </div>
                  {post.metrics && (
                    <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNum(post.metrics.impressions)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNum(post.metrics.likes)}</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {formatNum(post.metrics.clicks)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 glass-subtle rounded-2xl">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="font-display text-sm text-muted-foreground">Nenhum conteúdo encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="metrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4">
                <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">Engajamento por Plataforma</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={engagementChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Comentários" fill="hsl(var(--status-lead))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Compartilhamentos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cliques" fill="hsl(var(--status-prospect))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-4">
                <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">Impressões & Alcance (Timeline)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={impressionsChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="Impressões" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    <Line type="monotone" dataKey="Alcance" stroke="hsl(var(--status-lead))" strokeWidth={2} dot={{ fill: "hsl(var(--status-lead))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Per-Platform Detailed Metrics */}
            <div className="space-y-3">
              {platforms.map((platform, idx) => {
                const pm = platformMetrics.find(p => p.platform === platform)!;
                const platformPostsPublished = posts.filter(p => p.platform === platform && p.metrics);
                if (platformPostsPublished.length === 0) return null;
                return (
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${platformColors[platform]} flex items-center justify-center text-white`}>
                        {platformIcons[platform]}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">{platform}</p>
                        <p className="text-[10px] text-muted-foreground">{platformPostsPublished.length} posts publicados</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {[
                        { icon: Eye, label: "Impressões", value: formatNum(pm.impressions) },
                        { icon: TrendingUp, label: "Alcance", value: formatNum(pm.reach) },
                        { icon: Heart, label: "Likes", value: formatNum(pm.likes) },
                        { icon: MessageCircle, label: "Comentários", value: formatNum(pm.comments) },
                        { icon: Share2, label: "Compartilhamentos", value: formatNum(pm.shares) },
                        { icon: Bookmark, label: "Salvos", value: formatNum(pm.likes) },
                        { icon: MousePointerClick, label: "Cliques", value: formatNum(pm.clicks) },
                        { icon: Target, label: "CTR Médio", value: `${pm.ctr.toFixed(1)}%` },
                      ].map(m => (
                        <div key={m.label} className="glass-subtle rounded-xl p-2.5 text-center">
                          <m.icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                          <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {pm.spent > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/20 flex items-center gap-6 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" /> Investido: <span className="text-primary font-display font-bold">R$ {pm.spent.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Target className="h-3 w-3" /> Conversões: <span className="text-green-400 font-display font-bold">{pm.conversions}</span></span>
                        {pm.conversions > 0 && <span className="text-muted-foreground">CPA: <span className="text-primary font-display font-bold">R$ {(pm.spent / pm.conversions).toFixed(2)}</span></span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail Sheet */}
      <Sheet open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <SheetContent className="glass-elevated border-l-0 w-[480px] sm:w-[540px] overflow-auto rounded-l-3xl">
          {selectedPost && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[selectedPost.platform]} flex items-center justify-center text-white`}>
                    {platformIcons[selectedPost.platform]}
                  </div>
                  <div>
                    <SheetTitle className="font-display text-lg text-foreground">{selectedPost.title}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{selectedPost.platform} • {selectedPost.type}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-display ${statusBadge[selectedPost.status]}`}>{selectedPost.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(selectedPost.scheduledDate)} {selectedPost.scheduledTime || ""}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPost.description}</p>

                {selectedPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.hashtags.map(h => (
                      <span key={h} className="text-xs px-2.5 py-1 glass-subtle rounded-full text-primary">{h}</span>
                    ))}
                  </div>
                )}

                {selectedPost.metrics && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                    <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Métricas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Impressões", value: formatNum(selectedPost.metrics.impressions), icon: Eye },
                        { label: "Alcance", value: formatNum(selectedPost.metrics.reach), icon: TrendingUp },
                        { label: "Likes", value: formatNum(selectedPost.metrics.likes), icon: Heart },
                        { label: "Comentários", value: formatNum(selectedPost.metrics.comments), icon: MessageCircle },
                        { label: "Compartilhamentos", value: formatNum(selectedPost.metrics.shares), icon: Share2 },
                        { label: "Salvos", value: formatNum(selectedPost.metrics.saves), icon: Bookmark },
                        { label: "Cliques", value: formatNum(selectedPost.metrics.clicks), icon: MousePointerClick },
                        { label: "CTR", value: `${selectedPost.metrics.ctr.toFixed(2)}%`, icon: Target },
                      ].map(m => (
                        <div key={m.label} className="glass-subtle rounded-xl p-2.5 flex items-center gap-2">
                          <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                            <p className="text-[9px] text-muted-foreground">{m.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedPost.metrics.spent !== undefined && (
                      <div className="glass-subtle rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Investido</span></div>
                        <span className="font-display font-bold text-primary">R$ {selectedPost.metrics.spent.toLocaleString()}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function NewPostForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Plataforma *</Label>
          <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="glass-elevated border-0 rounded-2xl">
              {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tipo *</Label>
          <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="glass-elevated border-0 rounded-2xl">
              {["Feed", "Story", "Reel", "Carrossel", "Vídeo", "Anúncio", "Artigo", "Texto"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status *</Label>
          <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="glass-elevated border-0 rounded-2xl">
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Campanha</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="Nome da campanha (opcional)" /></div>
      </div>
      <div><Label className="text-xs">Título *</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      <div><Label className="text-xs">Descrição / Copy</Label><Textarea className="bg-transparent border-border/40 mt-1 min-h-[80px] rounded-xl" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Data Agendada *</Label><Input type="date" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        <div><Label className="text-xs">Horário</Label><Input type="time" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      </div>
      <div><Label className="text-xs">Hashtags</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="#tag1 #tag2 #tag3" /></div>
      <div><Label className="text-xs">Responsável</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="Junior Pinheiro" /></div>
      <div className="border border-dashed border-border/30 rounded-2xl p-6 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
        <p className="text-xs">Arraste criativos aqui ou cole imagens (Ctrl+V)</p>
        <p className="text-[10px] mt-1">PNG, JPG, MP4, PDF</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display rounded-xl" onClick={onClose}>Agendar Conteúdo</Button>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function formatDateShort(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

function formatNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
