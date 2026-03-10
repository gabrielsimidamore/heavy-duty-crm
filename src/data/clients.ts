export type ClientStatus = "Ativo" | "Lead" | "Prospect" | "Inativo" | "Sem compras";
export type TipoEmpresa = "Federações" | "Locadoras" | "Seguradoras" | "Transportadora" | "Associações" | "Tecnologia";

export interface Client {
  id: number;
  contato: string;
  empresa: string;
  telefone: string;
  email: string;
  tipoEmpresa: TipoEmpresa;
  regiao: string;
  tipo: string;
  frota: number | null;
  marcaPrincipal: string;
  status: ClientStatus;
  scoreFidelidade: string;
  cnpj?: string;
  observacoes?: string;
}

export const clients: Client[] = [
  { id: 1, contato: "Nino Feoli", empresa: "Confenar", telefone: "(51)99999-7095", email: "negocioseparcerias@gmail.com", tipoEmpresa: "Federações", regiao: "Brasil", tipo: "Prospect", frota: 5288, marcaPrincipal: "Volks/Mercedes-Benz", status: "Sem compras", scoreFidelidade: "Baixo" },
  { id: 2, contato: "CNT Coop", empresa: "CNT Confederação", telefone: "(61)99832-1302", email: "contato@cntcoop.com.br", tipoEmpresa: "Federações", regiao: "Brasil", tipo: "Lead", frota: null, marcaPrincipal: "—", status: "Lead", scoreFidelidade: "Novo" },
  { id: 3, contato: "Peter", empresa: "Let's Rent a Car", telefone: "—", email: "peter@letsvou.com", tipoEmpresa: "Locadoras", regiao: "SP/MG/ES", tipo: "Prospect", frota: null, marcaPrincipal: "—", status: "Lead", scoreFidelidade: "Novo" },
  { id: 4, contato: "Ricardo Martins", empresa: "HDI Seguros - Yelum", telefone: "(11)97287-9516", email: "ricardo.martins@hdi-yelum.com.br", tipoEmpresa: "Seguradoras", regiao: "Brasil", tipo: "Prospect", frota: null, marcaPrincipal: "—", status: "Prospect", scoreFidelidade: "Novo" },
  { id: 5, contato: "Alfredo Benatti", empresa: "Socio Caminhoneiro", telefone: "(19)99953-0399", email: "alfredo.benatti@sociocaminhoneiro.com", tipoEmpresa: "Associações", regiao: "SP", tipo: "Ativo", frota: null, marcaPrincipal: "—", status: "Ativo", scoreFidelidade: "Médio" },
  { id: 6, contato: "SUPER FRIO", empresa: "SuperFrio Armazéns Gerais", telefone: "—", email: "compras.corp@superfrio.com.br", tipoEmpresa: "Transportadora", regiao: "Barueri", tipo: "Lead", frota: null, marcaPrincipal: "Mercedes-Benz", status: "Lead", scoreFidelidade: "Novo" },
  { id: 7, contato: "Renan Nery", empresa: "Youse Seguros", telefone: "(11)94931-6683", email: "renan.nery@youse.com.br", tipoEmpresa: "Seguradoras", regiao: "—", tipo: "Lead", frota: null, marcaPrincipal: "—", status: "Lead", scoreFidelidade: "Novo", cnpj: "34.020.354/0001-10" },
  { id: 8, contato: "Guilherme Meira", empresa: "FM Frotas", telefone: "(31)99943-1666", email: "guilhermemeira@fmfrotas.com", tipoEmpresa: "Locadoras", regiao: "MG", tipo: "Ativo", frota: 10, marcaPrincipal: "—", status: "Ativo", scoreFidelidade: "Alto", cnpj: "09.123.047/0001-17" },
  { id: 9, contato: "Cibele", empresa: "Sindloc-MG", telefone: "(31)3337-7660", email: "comercial@sindlocmg.com.br", tipoEmpresa: "Seguradoras", regiao: "MG", tipo: "Prospect", frota: null, marcaPrincipal: "—", status: "Prospect", scoreFidelidade: "Novo" },
  { id: 10, contato: "Daniele Vargas", empresa: "ANSAR Negócios Digitais", telefone: "(51)99660-9984", email: "parcerias@ansar.com.br", tipoEmpresa: "Tecnologia", regiao: "Brasil", tipo: "Lead", frota: null, marcaPrincipal: "—", status: "Lead", scoreFidelidade: "Ativo", cnpj: "39.401.183/0001-92" },
  { id: 11, contato: "Adelita M. Rauber", empresa: "Febradisk", telefone: "(55)98408-9280", email: "secretaria@adisksul.com.br", tipoEmpresa: "Federações", regiao: "Brasil", tipo: "Prospect", frota: 1989, marcaPrincipal: "—", status: "Prospect", scoreFidelidade: "Novo" },
  { id: 12, contato: "Luciana Almeida", empresa: "Adish-SP", telefone: "(19)99982-7514", email: "adishsp@adishsp.com.br", tipoEmpresa: "Associações", regiao: "SP", tipo: "Ativo", frota: 193, marcaPrincipal: "Volks/Mercedes-Benz", status: "Ativo", scoreFidelidade: "Alto" },
];
