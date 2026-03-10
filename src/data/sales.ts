export type SaleStatus = "Cotação enviada" | "Em negociação" | "Pedido confirmado" | "Faturado" | "Entregue" | "Cancelado" | "Perda";

export interface SaleProduct {
  codigo: string;
  descricao: string;
  marca: string;
  quantidade: number;
  valorUnit: number;
  desconto: number;
  total: number;
}

export interface Sale {
  id: number;
  clientId: number;
  clientName: string;
  empresa: string;
  date: string;
  numeroPedido: string;
  tipo: "Cotação" | "Pedido" | "Venda direta" | "Devolução";
  status: SaleStatus;
  produtos: SaleProduct[];
  totalValue: number;
  formaPagamento: string;
  prazo: string;
  observacoes?: string;
  motivoPerda?: string;
}

export const sales: Sale[] = [
  {
    id: 1, clientId: 8, clientName: "Guilherme Meira", empresa: "FM Frotas",
    date: "2025-12-10", numeroPedido: "PED-001", tipo: "Pedido", status: "Entregue",
    produtos: [
      { codigo: "FLT-001", descricao: "Filtro de Óleo Motor", marca: "Mercedes-Benz", quantidade: 10, valorUnit: 45.90, desconto: 5, total: 436.05 },
      { codigo: "PST-002", descricao: "Pastilha de Freio Dianteira", marca: "Volks", quantidade: 5, valorUnit: 89.90, desconto: 0, total: 449.50 },
    ],
    totalValue: 885.55, formaPagamento: "Boleto", prazo: "30d"
  },
  {
    id: 2, clientId: 12, clientName: "Luciana Almeida", empresa: "Adish-SP",
    date: "2026-01-15", numeroPedido: "PED-002", tipo: "Pedido", status: "Faturado",
    produtos: [
      { codigo: "SUS-003", descricao: "Amortecedor Traseiro", marca: "Volks", quantidade: 20, valorUnit: 195.00, desconto: 10, total: 3510.00 },
    ],
    totalValue: 3510.00, formaPagamento: "A prazo", prazo: "45d"
  },
  {
    id: 3, clientId: 5, clientName: "Alfredo Benatti", empresa: "Socio Caminhoneiro",
    date: "2026-02-20", numeroPedido: "COT-003", tipo: "Cotação", status: "Em negociação",
    produtos: [
      { codigo: "MOT-004", descricao: "Kit Embreagem Completo", marca: "Scania", quantidade: 3, valorUnit: 1250.00, desconto: 8, total: 3450.00 },
      { codigo: "ELT-005", descricao: "Alternador 24V", marca: "Mercedes-Benz", quantidade: 2, valorUnit: 680.00, desconto: 5, total: 1292.00 },
    ],
    totalValue: 4742.00, formaPagamento: "Boleto", prazo: "28d"
  },
  {
    id: 4, clientId: 1, clientName: "Nino Feoli", empresa: "Confenar",
    date: "2026-03-01", numeroPedido: "COT-004", tipo: "Cotação", status: "Cotação enviada",
    produtos: [
      { codigo: "FRE-006", descricao: "Disco de Freio Ventilado", marca: "Volks", quantidade: 50, valorUnit: 320.00, desconto: 12, total: 14080.00 },
    ],
    totalValue: 14080.00, formaPagamento: "A prazo", prazo: "60d"
  },
];
