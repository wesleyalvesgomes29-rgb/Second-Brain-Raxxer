import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  CalendarCheck,
  AlertCircle,
  Sparkles,
  Zap,
  Tag,
  Loader2,
  Flame,
  Star,
  Clock,
} from 'lucide-react';
import { CATEGORY_DETAILS, MemoryCategory, TaskItem, TaskPriority } from '../types';

interface MyDayViewProps {
  tasks: TaskItem[];
  onAddTask: (newTask: Omit<TaskItem, 'id' | 'data'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskPriority: (id: string, newPriority: TaskPriority) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskPriority,
  onOpenAIChat,
}) => {
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState<TaskPriority>('importante');
  const [categoria, setCategoria] = useState<MemoryCategory>('projetos');
  const [notas, setNotas] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dayReview, setDayReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onAddTask({
      titulo: titulo.trim(),
      prioridade,
      categoria,
      notas: notas.trim() || undefined,
      concluida: false,
    });

    setTitulo('');
    setNotas('');
    setIsAdding(false);
  };

  const handleEndOfDayReview = async () => {
    setIsReviewing(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Faça uma revisão do meu dia comercial e pessoal com base nas tarefas concluídas e pendentes hoje. Me dê uma pontuação de 0 a 10 de foco e 2 conselhos práticos.',
          tasks,
        }),
      });
      const data = await response.json();
      setDayReview(data.text);
    } catch (err) {
      console.error('Error reviewing day:', err);
      setDayReview('Excelente trabalho ao acompanhar suas tarefas hoje! Mantenha a consistência amanhã.');
    } finally {
      setIsReviewing(false);
    }
  };

  const urgentTasks = tasks.filter((t) => t.prioridade === 'urgente');
  const importantTasks = tasks.filter((t) => t.prioridade === 'importante');
  const canWaitTasks = tasks.filter((t) => t.prioridade === 'pode_esperar');

  const completedCount = tasks.filter((t) => t.concluida).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Meu Dia — Matriz de Prioridades</h2>
              <p className="text-xs text-slate-500 font-medium">
                {completedCount} de {tasks.length} tarefas concluídas hoje.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>

          <button
            onClick={handleEndOfDayReview}
            disabled={isReviewing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all cursor-pointer"
          >
            {isReviewing ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-600" />
            )}
            <span>Revisar Final do Dia</span>
          </button>
        </div>
      </div>

      {/* AI End of Day Review Modal Banner */}
      {dayReview && (
        <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-purple-900 text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Revisão Diária do Copiloto RAXXER
            </span>
            <button
              onClick={() => setDayReview(null)}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold underline"
            >
              Fechar
            </button>
          </div>
          <div className="whitespace-pre-line text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
            {dayReview}
          </div>
        </div>
      )}

      {/* Add Task Form Collapsible */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-slate-900">Adicionar Tarefa para Hoje</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Título da Tarefa</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Fazer 10 ligações para leads quentes da INC"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nível de Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="urgente">🔥 Urgente (Fazer Agora)</option>
                <option value="importante">⭐ Importante (Alto Valor)</option>
                <option value="pode_esperar">⏳ Pode Esperar (Secundário)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Área / Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                {Object.keys(CATEGORY_DETAILS).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_DETAILS[catKey as MemoryCategory].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Notas / Detalhes (Opcional)</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ex: Checar simulação de financiamento antes de contatar..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      )}

      {/* 3 Columns Priority Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Urgente */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              🔥 Urgente ({urgentTasks.length})
            </h3>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Fazer Agora
            </span>
          </div>

          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">Sem tarefas urgentes no momento.</p>
            ) : (
              urgentTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onUpdatePriority={onUpdateTaskPriority}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Importante */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              ⭐ Importante ({importantTasks.length})
            </h3>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Alto Valor
            </span>
          </div>

          <div className="space-y-3">
            {importantTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">Sem tarefas importantes pendentes.</p>
            ) : (
              importantTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onUpdatePriority={onUpdateTaskPriority}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Pode Esperar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              📅 Pode Esperar ({canWaitTasks.length})
            </h3>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Secundário
            </span>
          </div>

          <div className="space-y-3">
            {canWaitTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">Nenhuma tarefa secundária.</p>
            ) : (
              canWaitTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onUpdatePriority={onUpdateTaskPriority}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: TaskItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, newPriority: TaskPriority) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onUpdatePriority }) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        task.concluida
          ? 'bg-slate-50 border-slate-200/60 opacity-60 line-through'
          : 'bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {task.concluida ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300" />
            )}
          </button>
          <div>
            <p className="text-xs font-semibold text-slate-900">{task.titulo}</p>
            {task.notas && <p className="text-[11px] text-slate-500 mt-0.5">{task.notas}</p>}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-rose-600 transition-colors"
          title="Excluir tarefa"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        {task.categoria && (
          <span className="text-slate-500 capitalize flex items-center gap-1 font-medium">
            <Tag className="w-3 h-3 text-slate-400" />
            {task.categoria}
          </span>
        )}

        {/* Priority quick switcher */}
        <select
          value={task.prioridade}
          onChange={(e) => onUpdatePriority(task.id, e.target.value as TaskPriority)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-1.5 py-0.5 text-[10px] focus:outline-none"
        >
          <option value="urgente">🔥 Urgente</option>
          <option value="importante">⭐ Importante</option>
          <option value="pode_esperar">📅 Pode Esperar</option>
        </select>
      </div>
    </div>
  );
};
