import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectStatus, ProjectPriority, ProjectTask } from '@/data/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data: projectsData, error: pErr } = await supabase.from('projects').select('*').order('id');
    if (pErr) { console.error('Error fetching projects:', pErr); setLoading(false); return; }

    const { data: tasksData, error: tErr } = await supabase.from('project_tasks').select('*');
    if (tErr) { console.error('Error fetching project tasks:', tErr); setLoading(false); return; }

    const tasksByProject = (tasksData || []).reduce((acc: Record<number, ProjectTask[]>, row) => {
      const pid = row.project_id;
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push({
        id: row.id, title: row.title, done: row.done,
        dueDate: row.due_date ?? undefined, responsavel: row.responsavel ?? undefined,
      });
      return acc;
    }, {});

    setProjects((projectsData || []).map(row => ({
      id: row.id, nome: row.nome, descricao: row.descricao,
      clientId: row.client_id ?? undefined, clientName: row.client_name ?? undefined,
      tipo: row.tipo, prioridade: row.prioridade as ProjectPriority,
      status: row.status as ProjectStatus,
      dataInicio: row.data_inicio ?? undefined, prazo: row.prazo ?? undefined,
      progresso: row.progresso, responsavel: row.responsavel,
      tags: row.tags || [], notas: row.notas,
      tasks: tasksByProject[row.id] || [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const updateProject = async (project: Project) => {
    const { error } = await supabase.from('projects').update({
      nome: project.nome, descricao: project.descricao,
      client_id: project.clientId || null, client_name: project.clientName || null,
      tipo: project.tipo, prioridade: project.prioridade, status: project.status,
      data_inicio: project.dataInicio || null, prazo: project.prazo || null,
      progresso: project.progresso, responsavel: project.responsavel,
      tags: project.tags, notas: project.notas,
    }).eq('id', project.id);
    if (error) console.error('Error updating project:', error);
    else await fetchProjects();
    return !error;
  };

  return { projects, loading, fetchProjects, updateProject, setProjects };
}
