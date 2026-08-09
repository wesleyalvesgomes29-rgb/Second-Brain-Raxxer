import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  MessageSquare,
  ArrowRight,
  Zap,
  Calendar,
  Check,
  TrendingUp,
} from 'lucide-react';
import { GoalItem, MemoryItem, ProjectItem, TaskItem, TaskPriority, TaskStatus, UserProfile } from '../types';

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
  onAddTask?: (task: Omit<TaskItem, 'id' | 'data'> & { data?: string }) => void;
  onDeleteTask?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  tasks,
  onNavigate,
  onToggleTask,
  onOpenAIChat,
  onAddTask,
  onDeleteTask,
}) => {
  const [newInlineTaskTitle, setNewInlineTaskTitle] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);

  // Time & Greeting Helpers
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getFormattedDate = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayNum = now.getDate().toString().padStart(2, '0');
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capitalizedDay}, ${dayNum} de ${monthName}`;
  };

  const nameToUse = profile.comoSerChamado || profile.nome || 'Wesley';

  // Task Collections
  const completedTasks = tasks.filter((t) => t.concluida || t.status === 'concluida');
  const rescheduledTasks = tasks.filter((t) => t.status === 'adiada');
  const cancelledTasks = tasks.filter((t) => t.status === 'cancelada');
  const pendingTasks = tasks.filter((t) => !t.concluida && t.status !== 'cancelada' && t.status !== 'adiada');

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Next Priority Task (Top action)
  const urgentTasks = pendingTasks.filter((t) => t.prioridade === 'urgente' || t.prioridade === 'alta');
  const importantTasks = pendingTasks.filter((t) => t.prioridade === 'importante' || t.prioridade === 'media');
  const topPriorityTask = urgentTasks[0] || importantTasks[0] || pendingTasks[0];

  const handleInlineTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineTaskTitle.trim()) return;

    if (onAddTask) {
      onAddTask({
        titulo: newInlineTaskTitle.trim(),
        prioridade: 'urgente',
        status: 'pendente',
        categoria: 'geral',
        concluida: false,
        dataCriacao: new Date().toISOString().split('T')[0],
      });
    }

    setNewInlineTaskTitle('');
    setIsAddingInline(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 pt-2">
      {/* 1. CABEÇALHO DA AGENDA */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Secretário Pessoal
              </span>
              <span className="text-xs font-medium text-slate-500">
                {getFormattedDate()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {nameToUse}.
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
              Aqui está sua agenda do dia. Converse com o RAXXER para organizar tarefas, compromissos e anotações.
            </p>
          </div>

          {/* 5. BOTÃO PRINCIPAL: CONVERSAR COM RAXXER */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
            <button
              onClick={() => onOpenAIChat()}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Conversar com RAXXER</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              Eu falo. Ele entende. Ele organiza.
            </span>
          </div>
        </div>
      </div>

      {/* 2. MINHA PRIORIDADE AGORA (PRÓXIMA AÇÃO) */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border border-amber-200/90 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
              ⚡
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Minha prioridade agora
              </h2>
              <p className="text-[11px] text-slate-500">Sua próxima ação de maior impacto</p>
            </div>
          </div>
          {topPriorityTask && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
              Próxima Ação
            </span>
          )}
        </div>

        {topPriorityTask ? (
          <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs flex items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => onToggleTask(topPriorityTask.id)}
                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                title="Marcar como concluída"
              >
                <Circle className="w-5 h-5 text-amber-500 hover:text-emerald-600" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  🔹 {topPriorityTask.titulo}
                </p>
                {topPriorityTask.notas && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {topPriorityTask.notas}
                  </p>
                )}
                {topPriorityTask.data && (
                  <p className="text-[10px] text-indigo-600 font-medium mt-1">
                    📅 {topPriorityTask.data}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onToggleTask(topPriorityTask.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all shrink-0 cursor-pointer"
            >
              Concluir
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-center text-xs text-slate-500 italic">
            Nenhuma tarefa pendente para agora. Tudo organizado!
          </div>
        )}
      </div>

      {/* 4. PROGRESSO DO DIA */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-600">
          <span className="font-semibold text-slate-900">Resumo do dia</span>
          <div className="flex items-center gap-2 text-[11px] font-semibold flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✅ {completedCount} concluída{completedCount !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              ⏳ {pendingTasks.length} pendente{pendingTasks.length !== 1 ? 's' : ''}
            </span>
            {rescheduledTasks.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                📅 {rescheduledTasks.length} reagendada{rescheduledTasks.length !== 1 ? 's' : ''}
              </span>
            )}
            {cancelledTasks.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                🚫 {cancelledTasks.length} cancelada{cancelledTasks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>0%</span>
            <span>{progressPercent}% do dia concluído</span>
            <span>100%</span>
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            onClick={() => onNavigate('evolucao')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ver Evolução Semanal & Gráficos →</span>
          </button>
        </div>
      </div>

      {/* 3. MINHAS TAREFAS DE HOJE (LISTA LIMPA ESTILO NOTION/AGENDA) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Minhas tarefas de hoje
            </h3>
            <p className="text-xs text-slate-500">Lista limpa de compromissos e pendências</p>
          </div>

          <button
            onClick={() => setIsAddingInline(!isAddingInline)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Inline Task Creator */}
        {isAddingInline && (
          <form onSubmit={handleInlineTaskSubmit} className="flex items-center gap-2 pt-1 pb-3">
            <input
              type="text"
              value={newInlineTaskTitle}
              onChange={(e) => setNewInlineTaskTitle(e.target.value)}
              placeholder="Digite a tarefa e pressione Enter..."
              autoFocus
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-all"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Clean Agenda List */}
        <div className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              Nenhuma tarefa na agenda. Converse com o RAXXER para registrar o que você precisa fazer.
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = task.concluida || task.status === 'concluida';

              return (
                <div
                  key={task.id}
                  className={`py-3 px-2 flex items-center justify-between gap-3 rounded-lg transition-colors ${
                    isDone ? 'bg-slate-50/50 opacity-60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold leading-relaxed ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.titulo}
                      </p>

                      {(task.notas || task.data) && (
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          {task.data && <span>📅 {task.data}</span>}
                          {task.notas && <span className="truncate max-w-md">{task.notas}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.prioridade === 'urgente' && !isDone && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Urgente
                      </span>
                    )}

                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
