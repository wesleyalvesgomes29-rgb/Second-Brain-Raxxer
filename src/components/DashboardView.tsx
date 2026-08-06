import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Brain,
  Plus,
  Compass,
  Zap,
  Clock,
  CheckSquare,
  BookOpen,
  Loader2,
  Flame,
  Star,
  Calendar,
  Lightbulb,
  Heart,
  Briefcase,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { GoalItem, MemoryItem, ProjectItem, TaskItem, UserProfile } from '../types';

interface DashboardViewProps {
  profile: UserProfile;
  memories: MemoryItem[];
  tasks: TaskItem[];
  goals: GoalItem[];
  projects: ProjectItem[];
  onNavigate: (tab: string) => void;
  onToggleTask: (id: string) => void;
  onOpenQuickMemory: () => void;
  onOpenAIChat: (initialPrompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  memories,
  tasks,
  goals,
  projects,
  onNavigate,
  onToggleTask,
  onOpenQuickMemory,
  onOpenAIChat,
}) => {
  const [priorityAnalysis, setPriorityAnalysis] = useState<string | null>(null);
  const [isLoadingPriority, setIsLoadingPriority] = useState<boolean>(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const nameToUse = profile.comoSerChamado || profile.nome || 'Wesley';

  // Active items calculations
  const pendingTasks = tasks.filter((t) => !t.concluida);
  const completedTasksCount = tasks.filter((t) => t.concluida).length;
  
  // Categorized tasks for the 4 buckets
  const agoraTasks = pendingTasks.filter((t) => t.prioridade === 'urgente');
  const importanteTasks = pendingTasks.filter((t) => t.prioridade === 'importante');
  const proximosTasks = pendingTasks.filter((t) => t.prioridade === 'pode_esperar');
  const ideiasTasks = memories.filter((m) => m.categoria === 'ideias').slice(0, 3);

  const activeGoals = goals.filter((g) => g.status === 'em_andamento');
  const activeProjects = projects.filter((p) => p.status === 'ativo');

  const topPriorityTask = agoraTasks[0] || importanteTasks[0] || pendingTasks[0];

  const handleAskTopPriority = async () => {
    setIsLoadingPriority(true);
    try {
      const response = await fetch('/api/ai/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, tasks, goals, memories }),
      });
      const data = await response.json();
      setPriorityAnalysis(data.answer);
    } catch (err) {
      console.error('Error fetching priority:', err);
      setPriorityAnalysis(
        `Foque na sua tarefa urgente atual: "${topPriorityTask?.titulo || 'Organizar contatos quentes e CRM no bloco da manhã'}". Isso gera retorno e destrava seu dia.`
      );
    } finally {
      setIsLoadingPriority(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOPO: Saudação Personalizada & Resumo do Estado Atual */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Copiloto RAXXER
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                <span>🧩</span>
                <span>Wesley Pessoa</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                <span>💼</span>
                <span>Wesley Profissional (INC)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span>🎯</span>
                <span>Wesley Direção</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {nameToUse}!
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-normal">
                Visão unificada da sua rotina comercial, saúde, família e alinhamento estratégico.
                {profile.prioridades ? ` Prioridade principal: "${profile.prioridades}".` : ''}
              </p>
            </div>
          </div>

          {/* Quick AI Consultation Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleAskTopPriority}
              disabled={isLoadingPriority}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isLoadingPriority ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Consultando RAXXER...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Qual a coisa mais importante de hoje?</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Answer Card Banner (if triggered) */}
        {priorityAnalysis && (
          <div className="mt-6 p-4 md:p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-slate-800 text-xs md:text-sm space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-indigo-900">
                <Brain className="w-4 h-4 text-indigo-600" />
                Análise Estratégica do RAXXER
              </span>
              <button
                onClick={() => setPriorityAnalysis(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
              >
                Fechar
              </button>
            </div>
            <div className="whitespace-pre-line text-slate-700 leading-relaxed font-normal">
              {priorityAnalysis}
            </div>
          </div>
        )}
      </div>

      {/* Quick Numbers Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ações Agora</p>
            <p className="text-lg font-extrabold text-slate-900">{agoraTasks.length} urgentes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Metas Ativas</p>
            <p className="text-lg font-extrabold text-slate-900">{activeGoals.length} em progresso</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Projetos INC</p>
            <p className="text-lg font-extrabold text-slate-900">{activeProjects.length} ativos</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Concluídas Hoje</p>
            <p className="text-lg font-extrabold text-slate-900">{completedTasksCount}/{tasks.length} concluídas</p>
          </div>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL: Foco de Hoje & Prioridades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🎯 FOCO DE HOJE (Highlight Hero Card) */}
          <div className="bg-white border border-indigo-200/90 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">🎯 Foco de Hoje</h3>
                  <p className="text-[11px] text-slate-500">A única tarefa/ação de maior impacto para seu resultado hoje</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('meu_dia')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Abrir Meu Dia <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topPriorityTask ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => onToggleTask(topPriorityTask.id)}
                    className="mt-0.5 p-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-400 hover:text-emerald-600 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 mb-1">
                      {topPriorityTask.prioridade}
                    </span>
                    <p className="text-base font-bold text-slate-900">{topPriorityTask.titulo}</p>
                    {topPriorityTask.notas && (
                      <p className="text-xs text-slate-600 mt-1">{topPriorityTask.notas}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onOpenAIChat(`Me dê um roteiro/script rápido para executar a tarefa "${topPriorityTask.titulo}" sem perder tempo.`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Pedir Roteiro IA
                </button>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs font-medium text-slate-500">Nenhuma tarefa prioritária definida para hoje 🎉</p>
                <button
                  onClick={() => onNavigate('meu_dia')}
                  className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                >
                  + Adicionar tarefa no Meu Dia
                </button>
              </div>
            )}
          </div>

          {/* 📋 ORGANIZAÇÃO DAS TAREFAS (4 Buckets: Agora, Importante, Próximos passos, Ideias) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">📋 Quadro Organizado de Tarefas</h3>
                <p className="text-[11px] text-slate-500">Divididas por urgência e contexto estratégico</p>
              </div>
              <button
                onClick={() => onNavigate('meu_dia')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Ver Lista Completa →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: 🔥 Agora */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    🔥 Agora ({agoraTasks.length})
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Ação Imediata
                  </span>
                </div>
                <div className="space-y-2">
                  {agoraTasks.length > 0 ? (
                    agoraTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-medium text-slate-800 truncate">{task.titulo}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic py-2">Sem pendências urgentes para agora.</p>
                  )}
                </div>
              </div>

              {/* Card 2: ⭐ Importante */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500" />
                    ⭐ Importante ({importanteTasks.length})
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Alto Valor
                  </span>
                </div>
                <div className="space-y-2">
                  {importanteTasks.length > 0 ? (
                    importanteTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-medium text-slate-800 truncate">{task.titulo}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic py-2">Nenhuma tarefa importante listada.</p>
                  )}
                </div>
              </div>

              {/* Card 3: 📅 Próximos passos */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    📅 Próximos Passos ({proximosTasks.length})
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Sequência
                  </span>
                </div>
                <div className="space-y-2">
                  {proximosTasks.length > 0 ? (
                    proximosTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-medium text-slate-800 truncate">{task.titulo}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic py-2">Sem tarefas agendadas para depois.</p>
                  )}
                </div>
              </div>

              {/* Card 4: 💡 Ideias */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-purple-500" />
                    💡 Ideias & Anotações ({ideiasTasks.length})
                  </span>
                  <button
                    onClick={onOpenQuickMemory}
                    className="text-[10px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 transition-colors"
                  >
                    + Anotar
                  </button>
                </div>
                <div className="space-y-2">
                  {ideiasTasks.length > 0 ? (
                    ideiasTasks.map((idea) => (
                      <div
                        key={idea.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs"
                      >
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{idea.titulo}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{idea.conteudo}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic py-2">Nenhuma ideia anotada recentemente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 📈 EVOLUÇÃO: Metas e Progresso */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">📈 Evolução & Progresso das Metas</h3>
              </div>
              <button
                onClick={() => onNavigate('metas_projetos')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Gerenciar Metas →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{goal.objetivo}</h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {goal.progresso}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progresso}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Prazo: {goal.prazo}</span>
                    <span className="capitalize text-slate-600 font-medium">{goal.categoria}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column (Right 1 Column) */}
        <div className="space-y-6">
          
          {/* 🧠 INSIGHTS DO RAXXER */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">🧠 Insights do RAXXER</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-indigo-900 block">Recomendação Comercial (INC):</span>
              <p className="text-slate-600 leading-relaxed">
                Aproveite o bloco matinal para focar no CRM e enviar mensagens humanas de retrabalho para a carteira fria.
              </p>
              <button
                onClick={() => onOpenAIChat('Crie um script de retrabalho leve e sutil para contatar leads da INC sem parecer cobrança.')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline block"
              >
                Gerar Script de Retrabalho →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-purple-900 block">Dica Anti-Procrastinação:</span>
              <p className="text-slate-600 leading-relaxed">
                Trabalhe em blocos de 45 min com foco total no telefone e WhatsApp. Evite alternar janelas do navegador.
              </p>
              <button
                onClick={() => onOpenAIChat('Analise minhas tarefas e me diga onde posso estar perdendo foco hoje.')}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 underline block"
              >
                Pedir Análise de Foco →
              </button>
            </div>
          </div>

          {/* ⚖️ EQUILÍBRIO DOS 3 PILARES */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">⚖️ Equilíbrio dos 3 Pilares</h3>
            </div>

            <div className="space-y-3">
              {/* Pilar 1: Pessoa */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>🧩</span> Wesley Pessoa
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Alinhado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Saúde, treinos 4x/semana, família sem trabalho noites/domingos.</p>
              </div>

              {/* Pilar 2: Profissional */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>💼</span> Wesley Profissional
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Foco INC
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Meta: 10 vendas/mês. Manhã fวาง nos contatos e CRM.</p>
              </div>

              {/* Pilar 3: Direção */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>🎯</span> Wesley Direção
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Estratégico
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Decisões com propósito sem se perder no operacional.</p>
              </div>
            </div>
          </div>

          {/* Quick Projects Summary */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                Projetos Ativos
              </span>
              <button
                onClick={() => onNavigate('metas_projetos')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-2">
              {projects.slice(0, 3).map((proj) => (
                <div key={proj.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{proj.nome}</span>
                    <span className="text-[10px] font-bold text-blue-600">{proj.progresso}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proj.progresso}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
