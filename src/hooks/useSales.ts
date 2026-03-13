import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Sale, SaleStatus, SaleProduct } from '@/data/sales';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { data: salesData, error: salesError } = await supabase.from('sales').select('*').order('date', { ascending: false });
    if (salesError) { console.error('Error fetching sales:', salesError); setLoading(false); return; }

    const { data: productsData, error: productsError } = await supabase.from('sale_products').select('*');
    if (productsError) { console.error('Error fetching sale products:', productsError); setLoading(false); return; }

    const productsBySale = (productsData || []).reduce((acc: Record<number, SaleProduct[]>, row) => {
      const saleId = row.sale_id;
      if (!acc[saleId]) acc[saleId] = [];
      acc[saleId].push({
        codigo: row.codigo, descricao: row.descricao, marca: row.marca,
        quantidade: row.quantidade, valorUnit: row.valor_unit,
        desconto: row.desconto, total: row.total,
      });
      return acc;
    }, {});

    setSales((salesData || []).map(row => ({
      id: row.id, clientId: row.client_id, clientName: row.client_name,
      empresa: row.empresa, date: row.date, numeroPedido: row.numero_pedido,
      tipo: row.tipo as Sale['tipo'], status: row.status as SaleStatus,
      produtos: productsBySale[row.id] || [], totalValue: row.total_value,
      formaPagamento: row.forma_pagamento, prazo: row.prazo,
      observacoes: row.observacoes ?? undefined, motivoPerda: row.motivo_perda ?? undefined,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const updateSaleStatus = async (saleId: number, status: SaleStatus) => {
    const { error } = await supabase.from('sales').update({ status }).eq('id', saleId);
    if (error) console.error('Error updating sale:', error);
    else await fetchSales();
    return !error;
  };

  return { sales, loading, fetchSales, updateSaleStatus, setSales };
}
