export type SocialPlatform = "Instagram" | "TikTok" | "Google Ads" | "LinkedIn";
export type PostStatus = "Ideia" | "Rascunho" | "Agendado" | "Publicado" | "Cancelado";
export type PostType = "Feed" | "Story" | "Reel" | "Carrossel" | "Vídeo" | "Anúncio" | "Artigo" | "Texto";

export interface PostMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  ctr: number;
  spent?: number;
  conversions?: number;
}

export interface ContentPost {
  id: number;
  platform: SocialPlatform;
  type: PostType;
  title: string;
  description: string;
  status: PostStatus;
  scheduledDate: string;
  scheduledTime?: string;
  publishedDate?: string;
  hashtags: string[];
  responsavel: string;
  metrics?: PostMetrics;
  campaignName?: string;
}

export const contentPosts: ContentPost[] = [
  {
    id: 1, platform: "Instagram", type: "Carrossel", title: "Top 5 peças mais vendidas para Mercedes-Benz",
    description: "Carrossel educativo mostrando as 5 peças mais procuradas para caminhões Mercedes-Benz da linha pesada.",
    status: "Publicado", scheduledDate: "2026-02-10", scheduledTime: "10:00", publishedDate: "2026-02-10",
    hashtags: ["#autopeças", "#mercedesbenz", "#caminhão", "#linhapesada"],
    responsavel: "Junior Pinheiro",
    metrics: { impressions: 12400, reach: 8900, likes: 342, comments: 28, shares: 67, saves: 89, clicks: 156, ctr: 1.26 }
  },
  {
    id: 2, platform: "Instagram", type: "Reel", title: "Bastidores do estoque — Filtros linha pesada",
    description: "Reel mostrando o galpão e organização dos filtros para linha pesada.",
    status: "Publicado", scheduledDate: "2026-02-14", scheduledTime: "14:00", publishedDate: "2026-02-14",
    hashtags: ["#autopeças", "#filtros", "#estoque"],
    responsavel: "Junior Pinheiro",
    metrics: { impressions: 18200, reach: 14100, likes: 567, comments: 45, shares: 123, saves: 201, clicks: 89, ctr: 0.49 }
  },
  {
    id: 3, platform: "TikTok", type: "Vídeo", title: "Como identificar peças originais vs paralelas",
    description: "Vídeo educativo de 60s comparando peças originais e paralelas de freio.",
    status: "Publicado", scheduledDate: "2026-02-18", scheduledTime: "18:00", publishedDate: "2026-02-18",
    hashtags: ["#autopeças", "#dica", "#mecânica"],
    responsavel: "Junior Pinheiro",
    metrics: { impressions: 45600, reach: 38200, likes: 2340, comments: 187, shares: 890, saves: 456, clicks: 234, ctr: 0.51 }
  },
  {
    id: 4, platform: "Google Ads", type: "Anúncio", title: "Campanha Freios — Março 2026",
    description: "Campanha de search ads para kits de freio linha pesada Mercedes-Benz e Volks.",
    status: "Publicado", scheduledDate: "2026-03-01", publishedDate: "2026-03-01",
    hashtags: [],
    responsavel: "Junior Pinheiro",
    campaignName: "Freios_LP_Mar26",
    metrics: { impressions: 32000, reach: 32000, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 1280, ctr: 4.0, spent: 2450, conversions: 34 }
  },
  {
    id: 5, platform: "LinkedIn", type: "Artigo", title: "O futuro das autopeças para frotas pesadas no Brasil",
    description: "Artigo sobre tendências do mercado de reposição para linha pesada e oportunidades B2B.",
    status: "Publicado", scheduledDate: "2026-02-25", publishedDate: "2026-02-25",
    hashtags: ["#autopeças", "#B2B", "#frotas", "#linhapesada"],
    responsavel: "Junior Pinheiro",
    metrics: { impressions: 5600, reach: 4200, likes: 89, comments: 12, shares: 34, saves: 23, clicks: 178, ctr: 3.18 }
  },
  {
    id: 6, platform: "Instagram", type: "Feed", title: "Promoção Semana do Frete — 15% off kits de suspensão",
    description: "Post de promoção com arte gráfica destacando desconto em kits de suspensão.",
    status: "Agendado", scheduledDate: "2026-03-15", scheduledTime: "11:00",
    hashtags: ["#promoção", "#suspensão", "#autopeças"],
    responsavel: "Junior Pinheiro"
  },
  {
    id: 7, platform: "TikTok", type: "Vídeo", title: "Unboxing kit de embreagem Sachs",
    description: "Vídeo de unboxing do kit de embreagem Sachs para Scania P360.",
    status: "Rascunho", scheduledDate: "2026-03-18", scheduledTime: "17:00",
    hashtags: ["#unboxing", "#sachs", "#scania"],
    responsavel: "Junior Pinheiro"
  },
  {
    id: 8, platform: "Google Ads", type: "Anúncio", title: "Campanha Suspensão — Abril 2026",
    description: "Campanha de display ads para kits de suspensão linha pesada.",
    status: "Ideia", scheduledDate: "2026-04-01",
    hashtags: [],
    responsavel: "Junior Pinheiro",
    campaignName: "Suspensao_LP_Abr26"
  },
  {
    id: 9, platform: "LinkedIn", type: "Texto", title: "Case de sucesso: parceria com Confenar",
    description: "Post sobre o case de sucesso da parceria com Confenar e os resultados alcançados.",
    status: "Ideia", scheduledDate: "2026-03-20",
    hashtags: ["#parceria", "#confenar", "#B2B"],
    responsavel: "Junior Pinheiro"
  },
  {
    id: 10, platform: "Instagram", type: "Story", title: "Enquete: qual peça você mais troca?",
    description: "Story interativo com enquete sobre peças de maior troca em frotas pesadas.",
    status: "Agendado", scheduledDate: "2026-03-13", scheduledTime: "09:00",
    hashtags: ["#enquete", "#autopeças"],
    responsavel: "Junior Pinheiro"
  },
];
