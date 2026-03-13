import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Interaction, InteractionType } from '@/data/interactions';

export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('interactions').select('*').order('date', { ascending: false });
    if (error) { console.error('Error fetching interactions:', error); setLoading(false); return; }
    setInteractions((data || []).map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      empresa: row.empresa,
      date: row.date,
      type: row.type as InteractionType,
      summary: row.summary,
      proximaAcao: row.proxima_acao,
      dataPrevista: row.data_prevista ?? undefined,
      regiao: row.regiao ?? undefined,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchInteractions(); }, [fetchInteractions]);

  const addInteraction = async (interaction: Omit<Interaction, 'id'>) => {
    const { error } = await supabase.from('interactions').insert({
      client_id: interaction.clientId, client_name: interaction.clientName,
      empresa: interaction.empresa, date: interaction.date, type: interaction.type,
      summary: interaction.summary, proxima_acao: interaction.proximaAcao,
      data_prevista: interaction.dataPrevista || null, regiao: interaction.regiao || null,
    });
    if (error) console.error('Error adding interaction:', error);
    else await fetchInteractions();
    return !error;
  };

  return { interactions, loading, fetchInteractions, addInteraction, setInteractions };
}
