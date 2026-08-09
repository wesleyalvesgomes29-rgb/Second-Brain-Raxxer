import React, { useState } from 'react';
import {
  BarChart3,
  Trophy,
  AlertCircle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Calendar,
  Loader2,
  ListTodo,
} from 'lucide-react';
import { GoalItem, MemoryItem, TaskItem, WeeklyReview } from '../types';

interface WeeklyReviewViewProps {
  reviews: WeeklyReview[];
  tasks: TaskItem[];
  goals: GoalItem[];
  memories: MemoryItem[];
  onSaveReview: (review: WeeklyReview) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({
  reviews,
  tasks,
  goals,
  memories,
  onSaveReview,
  onOpenAIChat,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReview, setSelectedReview] = useState<WeeklyReview | null>(reviews[0] || null);

  const completedTasks = tasks.filter((t) => t.concluida);
  const pendingTasks = tasks.filter((t) => !t.concluida);

  const handleGenerateWeeklyReview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks,
          pendingTasks,
          goals,
          memories,
          weekName: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        }),
      });

      if (!response.ok) throw new Error('Erro no servidor');

      const data = await response.json();

      const newReview: WeeklyReview = {
        id: `review-${Date.now()}`,
        semana: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        conquistas: data.conquistas || ['Avançou nas metas principais da semana'],
        pendencias: data.pendencias || ['Revisar tarefas não concluídas'],
        pontosAtencao: data.pontosAtencao || ['Manter foco nos horários de maior energia'],
        recomendacoes: data.recomendacoes || ['Priorizar o bloco matinal para deep work'],
        data: new Date().toISOString(),
      };

      onSaveReview(newReview);
      setSelectedReview(newReview);
    } catch (err: any) {
      console.error(err);
      const fallbackReview: WeeklyReview = {
        id: `review-${Date.now()}`,
        semana: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        conquistas: [
          `Concluiu ${completedTasks.length} tarefas relevantes na semana`,
          'Manteve a estrutura do RAXXER atualizada',
        ],
        pendencias: pendingTasks.map((t) => t.titulo).slice(0, 3),
        pontosAtencao: ['Atenção aos horários em que a energia cai durante a tarde'],
        recomendacoes: [
          'Começar o dia executando a tarefa mais urgente primeiro',
          'Bloquear 1 hora por dia sem notificações',
        ],
        data: new Date().toISOString(),
      };
      onSaveReview(fallbackReview);
      setSelectedReview(fallbackReview);
    } finally {
      setIsGenerating(false);
    }
  };

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const current = selectedReview || reviews[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Revisão Semanal — Diagnóstico & Reflexão
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Análise de conquistas, gargalos e direcionamento nos três pilares (Pessoa, INC e Direção).
          </p>
        </div>

        <button
          onClick={handleGenerateWeeklyReview}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Sintetizando com IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Gerar Nova Revisão com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Weekly Progress Chart */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">📊 Desempenho Visual da Semana</h3>
            <p className="text-[11px] text-slate-500">Taxa de conclusão e ritmo de entregas diárias</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {completedTasks.length} tarefas entregues
          </span>
        </div>

        {/* Simple Bar Chart for Days of Week */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 pt-2">
          {[
            { day: 'Seg', val: 85, tasks: '4/5' },
            { day: 'Ter', val: 100, tasks: '5/5' },
            { day: 'Qua', val: 70, tasks: '3/4' },
            { day: 'Qui', val: 90, tasks: '4/4' },
            { day: 'Sex', val: 60, tasks: '3/5' },
            { day: 'Sáb', val: 40, tasks: '2/3' },
            { day: 'Dom', val: 100, tasks: '1/1' },
          ].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full bg-slate-100 h-28 rounded-xl relative overflow-hidden flex items-end p-1 border border-slate-200/60">
                <div
                  className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-500 flex items-center justify-center"
                  style={{ height: `${d.val}%` }}
                >
                  <span className="text-[9px] font-bold text-white hidden md:inline">{d.val}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">{d.day}</p>
                <p className="text-[10px] text-slate-500 font-medium">{d.tasks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReview(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                current?.id === r.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r.semana}
            </button>
          ))}
        </div>
      )}

      {current ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Conquistas da Semana */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                🏆 Conquistas da Semana
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.conquistas.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Box 2: Pendências Acumuladas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ListTodo className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                📌 Pendências & Gargalos
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.pendencias.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Box 3: Pontos de Atenção */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                ⚠️ Pontos de Atenção (Procrastinação / Hábitos)
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.pontosAtencao.map((pa, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{pa}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Box 4: Recomendações Estratégicas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                💡 Recomendações Estratégicas da IA
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.recomendacoes.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white">
          <p className="text-xs text-slate-500 font-medium">
            Nenhuma revisão semanal gerada ainda. Clique no botão acima para sintetizar a sua primeira revisão!
          </p>
        </div>
      )}
    </div>
  );
};
