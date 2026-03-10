export type InteractionType = "E-mail" | "WhatsApp" | "Reunião";

export interface Interaction {
  id: number;
  clientId: number;
  clientName: string;
  empresa: string;
  date: string;
  type: InteractionType;
  summary: string;
  proximaAcao: string;
  dataPrevista?: string;
  regiao?: string;
}

export const interactions: Interaction[] = [
  // Confenar
  { id: 1, clientId: 1, clientName: "Nino Feoli", empresa: "Confenar", date: "2025-10-29", type: "Reunião", summary: "Conforme reunião, enviei e-mail de proposta de parceria para Confenar com condições comerciais detalhadas.", proximaAcao: "Aguardar resposta da Diretoria Confenar", regiao: "Brasil" },
  { id: 2, clientId: 1, clientName: "Nino Feoli", empresa: "Confenar", date: "2025-11-17", type: "E-mail", summary: "Foi informado que proposta não foi aceita. Repasse proposto pela Morelate (0,5%) não aprovado.", proximaAcao: "Fazer contraproposta", regiao: "Brasil" },
  { id: 3, clientId: 1, clientName: "Nino Feoli", empresa: "Confenar", date: "2025-12-08", type: "E-mail", summary: "Nino e Carlos tentando compor alternativa pois acreditam na parceria.", proximaAcao: "Definir melhor proposta para ambas empresas", regiao: "Brasil" },
  { id: 4, clientId: 1, clientName: "Nino Feoli", empresa: "Confenar", date: "2026-02-25", type: "E-mail", summary: "Retomada das negociações. Carlos afastado por saúde. Reunião do Comitê prevista para março.", proximaAcao: "Agendar reunião presencial na Morelate — final de março", dataPrevista: "2026-03-31", regiao: "Brasil" },

  // CNT Coop
  { id: 5, clientId: 2, clientName: "CNT Coop", empresa: "CNT Confederação", date: "2025-11-03", type: "E-mail", summary: "Fiz contato via e-mail", proximaAcao: "Encontrar contato responsável, agendar reunião", regiao: "Brasil" },
  { id: 6, clientId: 2, clientName: "CNT Coop", empresa: "CNT Confederação", date: "2026-03-06", type: "E-mail", summary: "Fiz contato via e-mail", proximaAcao: "Encontrar contato responsável, agendar reunião", regiao: "Brasil" },

  // Let's Rent a Car
  { id: 7, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2025-11-17", type: "E-mail", summary: "Envio de e-mail Mkt", proximaAcao: "Localizar contato de responsável", regiao: "SP/MG/ES" },
  { id: 8, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2025-11-19", type: "E-mail", summary: "Envio de e-mail Mkt", proximaAcao: "Localizar contato responsável por compras", regiao: "SP/MG/ES" },
  { id: 9, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2025-12-15", type: "E-mail", summary: "E-mail Mkt enviado", proximaAcao: "Localizar contato de responsável", regiao: "SP/MG/ES" },
  { id: 10, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2025-12-22", type: "E-mail", summary: "E-mail Mkt", proximaAcao: "Localizar contato do responsável", regiao: "SP/MG/ES" },
  { id: 11, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2025-01-05", type: "E-mail", summary: "E-mail Mkt", proximaAcao: "Localizar contato de responsável", regiao: "SP/MG/ES" },
  { id: 12, clientId: 3, clientName: "Peter", empresa: "Let's Rent a Car", date: "2026-03-06", type: "E-mail", summary: "E-mail Mkt", proximaAcao: "Localizar contato de responsável", regiao: "SP/MG/ES" },

  // HDI Seguros
  { id: 13, clientId: 4, clientName: "Ricardo Martins", empresa: "HDI Seguros - Yelum", date: "2025-11-06", type: "Reunião", summary: "Apresentação para Ricardo Martins. Usam plataforma para compras, fornecedores precisam ser homologados via visita técnica.", proximaAcao: "Agendar próxima reunião e visita", regiao: "Brasil" },
  { id: 14, clientId: 4, clientName: "Ricardo Martins", empresa: "HDI Seguros - Yelum", date: "2026-02-02", type: "E-mail", summary: "Envio de e-mail solicitando data para visita", proximaAcao: "Aguardar data de visita", regiao: "Brasil" },
  { id: 15, clientId: 4, clientName: "Ricardo Martins", empresa: "HDI Seguros - Yelum", date: "2026-02-06", type: "E-mail", summary: "Ricardo informou que agenda de visita a novos fornecedores ainda não aberta. Novo gestor SP: Tiago Felisbino.", proximaAcao: "Aguardar agenda para visita técnica — final de março", dataPrevista: "2026-03-31", regiao: "Brasil" },

  // Socio Caminhoneiro
  { id: 16, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2025-11-10", type: "Reunião", summary: "Possibilidade de parceria, integração sistema Jackys App da Associação", proximaAcao: "Verificar integração dos sistemas com TI", regiao: "SP" },
  { id: 17, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2025-11-12", type: "E-mail", summary: "Integração do sistema Morelate não aprovada pela diretoria.", proximaAcao: "Buscar outras formas para atender demanda", regiao: "SP" },
  { id: 18, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2025-12-04", type: "E-mail", summary: "Nova proposta: atendimento via Taga Auto Parts", proximaAcao: "Reunião de apresentação 10/12/25", regiao: "SP" },
  { id: 19, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2025-12-15", type: "Reunião", summary: "Apresentação Projeto Sócio Caminhoneiro/Taga Auto Parts. Cronograma: Alpha 16/01, Beta 23/01, Lançamento 02/02.", proximaAcao: "Acompanhar cronograma de lançamento", regiao: "SP" },
  { id: 20, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2026-01-16", type: "E-mail", summary: "Alpha do sistema iniciado conforme cronograma", proximaAcao: "Acompanhar fase Beta 23/01", regiao: "SP" },
  { id: 21, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2026-01-23", type: "E-mail", summary: "Beta do sistema em andamento", proximaAcao: "Preparar lançamento 02/02", regiao: "SP" },
  { id: 22, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro", date: "2026-02-02", type: "Reunião", summary: "Lançamento oficial do sistema Taga Auto Parts para Sócio Caminhoneiro", proximaAcao: "Monitorar adesão dos associados", regiao: "SP" },
];
