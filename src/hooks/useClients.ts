import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Client, ClientStatus, TipoEmpresa } from '@/data/clients';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('id');
    if (error) { console.error('Error fetching clients:', error); setLoading(false); return; }
    setClients((data || []).map(row => ({
      id: row.id,
      contato: row.contato,
      empresa: row.empresa,
      telefone: row.telefone,
      email: row.email,
      tipoEmpresa: row.tipo_empresa as TipoEmpresa,
      regiao: row.regiao,
      tipo: row.tipo,
      frota: row.frota,
      marcaPrincipal: row.marca_principal,
      status: row.status as ClientStatus,
      scoreFidelidade: row.score_fidelidade,
      cnpj: row.cnpj ?? undefined,
      observacoes: row.observacoes ?? undefined,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const updateClient = async (client: Client) => {
    const { error } = await supabase.from('clients').update({
      contato: client.contato, empresa: client.empresa, telefone: client.telefone,
      email: client.email, tipo_empresa: client.tipoEmpresa, regiao: client.regiao,
      tipo: client.tipo, frota: client.frota, marca_principal: client.marcaPrincipal,
      status: client.status, score_fidelidade: client.scoreFidelidade,
      cnpj: client.cnpj || null, observacoes: client.observacoes || null,
    }).eq('id', client.id);
    if (error) console.error('Error updating client:', error);
    else await fetchClients();
    return !error;
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    const { error } = await supabase.from('clients').insert({
      contato: client.contato, empresa: client.empresa, telefone: client.telefone,
      email: client.email, tipo_empresa: client.tipoEmpresa, regiao: client.regiao,
      tipo: client.tipo, frota: client.frota, marca_principal: client.marcaPrincipal,
      status: client.status, score_fidelidade: client.scoreFidelidade,
      cnpj: client.cnpj || null, observacoes: client.observacoes || null,
    });
    if (error) console.error('Error adding client:', error);
    else await fetchClients();
    return !error;
  };

  return { clients, loading, fetchClients, updateClient, addClient, setClients };
}
