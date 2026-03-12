export type ProjectStatus = "Ideia" | "Em Análise" | "Em Andamento" | "Pausado" | "Concluído" | "Cancelado";
export type ProjectPriority = "Alta" | "Média" | "Baixa";

export interface ProjectTask {
  id: number;
  title: string;
  done: boolean;
  dueDate?: string;
  responsavel?: string;
}

export interface Project {
  id: number;
  nome: string;
  descricao: string;
  clientId?: number;
  clientName?: string;
  tipo: string;
  prioridade: ProjectPriority;
  status: ProjectStatus;
  dataInicio?: string;
  prazo?: string;
  progresso: number;
  responsavel: string;
  tags: string[];
  notas: string;
  tasks: ProjectTask[];
}

export const projects: Project[] = [
  {
    id: 1, nome: "Parceria Confenar / Revendas Ambev", clientId: 1, clientName: "Confenar",
    descricao: "Parceria comercial com Confenar para atender revendas através da rede de distribuidores.",
    tipo: "Parceria Comercial", prioridade: "Alta", status: "Em Andamento",
    dataInicio: "2025-10-29", prazo: "2026-03-31", progresso: 40, responsavel: "Junior Pinheiro",
    tags: ["parceria", "confenar", "revendas"],
    notas: "Primeira reunião 29/10/25, proposta não aceita, retomada em fevereiro/2026, reunião presencial prevista março",
    tasks: [
      { id: 1, title: "Reunião inicial com Nino Feoli", done: true },
      { id: 2, title: "Enviar proposta comercial", done: true },
      { id: 3, title: "Contraproposta após rejeição", done: true },
      { id: 4, title: "Agendar reunião presencial março", done: false, dueDate: "2026-03-31" },
    ]
  },
  {
    id: 2, nome: "Integração Ansar — Plataforma Seguradoras", clientId: 10, clientName: "ANSAR Negócios Digitais",
    descricao: "Integração da plataforma ANSAR para atendimento a seguradoras parceiras.",
    tipo: "Integração de Sistema", prioridade: "Alta", status: "Em Andamento",
    dataInicio: "2025-11-01", prazo: "2026-04-30", progresso: 55, responsavel: "Junior Pinheiro",
    tags: ["integração", "ansar", "tecnologia"],
    notas: "Contrato em análise jurídica, cláusula 5 é ponto crítico",
    tasks: [
      { id: 1, title: "Reunião de apresentação", done: true },
      { id: 2, title: "Análise técnica de integração", done: true },
      { id: 3, title: "Revisão contratual jurídico", done: false, dueDate: "2026-03-15" },
      { id: 4, title: "Assinatura do contrato", done: false },
    ]
  },
  {
    id: 3, nome: "Projeto Piloto Sócio Caminhoneiro / Taga Auto Parts", clientId: 5, clientName: "Socio Caminhoneiro",
    descricao: "Piloto de atendimento via plataforma Taga Auto Parts para associados do Sócio Caminhoneiro.",
    tipo: "Piloto", prioridade: "Média", status: "Em Andamento",
    dataInicio: "2025-12-04", prazo: "2026-03-31", progresso: 70, responsavel: "Junior Pinheiro",
    tags: ["piloto", "taga", "associação"],
    notas: "Lista de leads enviada 26/01, aguardando início do piloto",
    tasks: [
      { id: 1, title: "Apresentação projeto", done: true },
      { id: 2, title: "Desenvolvimento Alpha", done: true },
      { id: 3, title: "Fase Beta", done: true },
      { id: 4, title: "Lançamento oficial", done: true },
      { id: 5, title: "Monitorar adesão dos associados", done: false },
    ]
  },
  {
    id: 4, nome: "Credenciamento FM Frotas — Sistema B2B", clientId: 8, clientName: "FM Frotas",
    descricao: "Credenciamento e liberação de acesso ao sistema B2B para FM Frotas.",
    tipo: "Parceria Comercial", prioridade: "Alta", status: "Em Andamento",
    dataInicio: "2025-11-27", prazo: "2026-03-15", progresso: 60, responsavel: "Junior Pinheiro",
    tags: ["credenciamento", "b2b", "locadora"],
    notas: "Cadastro aprovado 27/11/25, acesso B2B ainda não liberado",
    tasks: [
      { id: 1, title: "Cadastro no sistema", done: true },
      { id: 2, title: "Aprovação cadastral", done: true },
      { id: 3, title: "Liberação acesso B2B", done: false, dueDate: "2026-03-15" },
    ]
  },
  {
    id: 5, nome: "Participação Feira Febradisk 2026", clientId: 11, clientName: "Febradisk",
    descricao: "Participação como expositor na feira anual Febradisk 2026.",
    tipo: "Evento", prioridade: "Alta", status: "Em Análise",
    dataInicio: "2025-11-01", prazo: "2026-06-30", progresso: 20, responsavel: "Junior Pinheiro",
    tags: ["feira", "evento", "federação"],
    notas: "Proposta enviada múltiplas vezes, aguardando aprovação diretoria",
    tasks: [
      { id: 1, title: "Enviar proposta de participação", done: true },
      { id: 2, title: "Aguardar aprovação diretoria", done: false },
      { id: 3, title: "Preparar material para feira", done: false },
    ]
  },
  {
    id: 6, nome: "Parceria Adish-SP / Projeto Piloto DBK", clientId: 12, clientName: "Adish-SP",
    descricao: "Parceria com Adish-SP para projeto piloto DBK de distribuição de peças.",
    tipo: "Parceria Comercial", prioridade: "Média", status: "Em Andamento",
    dataInicio: "2025-12-03", prazo: "2026-04-30", progresso: 35, responsavel: "Junior Pinheiro",
    tags: ["parceria", "piloto", "associação"],
    notas: "Reunião 03/12/25, definição comercial e logística pendente",
    tasks: [
      { id: 1, title: "Reunião de apresentação", done: true },
      { id: 2, title: "Definição comercial", done: false },
      { id: 3, title: "Definição logística", done: false },
    ]
  },
  {
    id: 7, nome: "Credenciamento Youse Seguros — Cilia", clientId: 7, clientName: "Youse Seguros",
    descricao: "Credenciamento na plataforma Cilia para atendimento à Youse Seguros.",
    tipo: "Parceria Comercial", prioridade: "Média", status: "Em Andamento",
    dataInicio: "2026-01-05", prazo: "2026-03-31", progresso: 45, responsavel: "Junior Pinheiro",
    tags: ["credenciamento", "cilia", "seguradora"],
    notas: "Cadastro confirmado no Cilia em 05/01/26, iniciar cotações",
    tasks: [
      { id: 1, title: "Cadastro na plataforma Cilia", done: true },
      { id: 2, title: "Confirmação de credenciamento", done: true },
      { id: 3, title: "Iniciar cotações", done: false },
    ]
  },
];
