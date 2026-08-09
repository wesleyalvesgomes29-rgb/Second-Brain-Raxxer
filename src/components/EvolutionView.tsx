import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { DailyHistoryLog } from '../types';

interface EvolutionViewProps {
  dailyHistory: DailyHistoryLog[];
  onOpenAIChat?: (prompt?: string) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  dailyHistory,
  onOpenAIChat,
}) => {
  // Sort history by date ascending for charts, and descending for recent list
  const historyAsc = [...dailyHistory].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  const historyDesc = [...dailyHistory].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  // Take last 7 days for the weekly view
  const last7Days = historyAsc.slice(-7);

  // Weekly Aggregates
  const totalCriadas = last7Days.reduce((acc, curr) => acc + curr.criadas, 0);
  const totalConcluidas = last7Days.reduce((acc, curr) => acc + curr.concluidas, 0);
  const totalPendentes = last7Days.reduce((acc, curr) => acc + curr.pendentes, 0);
  const totalAdiadas = last7Days.reduce((acc, curr) => acc + curr.adiadas, 0);

  const taxaExecucao =
    totalCriadas > 0 ? Math.round((totalConcluidas / totalCriadas) * 100) : 0;

  // Helper to format date string DD/MM
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  // Helper for short day names
  const getShortDayName = (diaSemana: string, dateStr: string) => {
    if (diaSemana) {
      const lower = diaSemana.toLowerCase();
      if (lower.includes('segunda')) return 'Seg';
      if (lower.includes('terça') || lower.includes('terca')) return 'Ter';
      if (lower.includes('quarta')) return 'Qua';
      if (lower.includes('quinta')) return 'Qui';
      if (lower.includes('sexta')) return 'Sex';
      if (lower.includes('sábado') || lower.includes('sabado')) return 'Sáb';
      if (lower.includes('domingo')) return 'Dom';
    }
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[d.getDay()] || 'Dia';
  };

  // Prepare chart data
  const chartData = last7Days.map((item) => ({
    dia: getShortDayName(item.diaSemana, item.data),
    dataCurta: formatDateShort(item.data),
    percentual: item.percentualExecucao,
    criadas: item.criadas,
    concluidas: item.concluidas,
    pendentes: item.pendentes,
    adiadas: item.adiadas,
    diaSemana: item.diaSemana || item.data,
  }));

  // Custom Tooltip for Execution Rate Chart
  const CustomRateTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold border-b border-slate-700 pb-1">
            {data.diaSemana} ({data.dataCurta})
          </p>
          <p className="text-emerald-400 font-semibold">
            Execução: {data.percentual}%
          </p>
          <p className="text-slate-300">
            Concluídas: {data.concluidas} de {data.criadas} tarefas
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Volume Chart
  const CustomVolumeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold border-b border-slate-700 pb-1">
            {data.diaSemana} ({data.dataCurta})
          </p>
          <p className="text-slate-300">📋 Criadas: {data.criadas}</p>
          <p className="text-emerald-400">✅ Concluídas: {data.concluidas}</p>
          <p className="text-amber-400">⏳ Pendentes: {data.pendentes}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 pt-2">
      {/* HEADER DA ÁREA DE EVOLUÇÃO */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Visualização de Dados
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evolução Semanal
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
              Gráficos interativos e métricas neutras do seu ritmo de execução semanal.
            </p>
          </div>

          {onOpenAIChat && (
            <button
              onClick={() => onOpenAIChat('Como foi minha semana?')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Analisar com RAXXER</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. RESUMO VISUAL DA SEMANA */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Resumo da Semana
            </h2>
            <p className="text-xs text-slate-500">Métricas consolidadas dos últimos 7 dias</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            Taxa de execução: {taxaExecucao}%
          </span>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total de tarefas
            </span>
            <span className="text-2xl font-black text-slate-900">{totalCriadas}</span>
            <span className="text-[10px] text-slate-400 block">registradas no período</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Concluídas
            </span>
            <span className="text-2xl font-black text-emerald-800">{totalConcluidas}</span>
            <span className="text-[10px] text-emerald-600 block">executadas com sucesso</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pendentes
            </span>
            <span className="text-2xl font-black text-amber-800">{totalPendentes}</span>
            <span className="text-[10px] text-amber-600 block">aguardando conclusão</span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
              Taxa de execução
            </span>
            <span className="text-2xl font-black text-indigo-900">{taxaExecucao}%</span>
            <span className="text-[10px] text-indigo-600 block">eficiência média</span>
          </div>
        </div>

        {totalCriadas === 0 && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              Ainda não existem tarefas registradas nos últimos dias. Crie e conclua tarefas com o RAXXER para preencher este gráfico em tempo real.
            </p>
          </div>
        )}

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Ritmo semanal</span>
            <span className="text-emerald-700">{totalConcluidas} de {totalCriadas} concluídas</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taxaExecucao}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. GRÁFICO SEMANAL DE EXECUÇÃO (% por dia) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              1. Taxa de Execução Diária (%)
            </h2>
            <p className="text-xs text-slate-500">
              Percentual de tarefas concluídas por dia da semana
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
            Gráfico de Execução
          </span>
        </div>

        <div className="w-full pt-2" style={{ minHeight: '240px' }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip content={<CustomRateTooltip />} />
              <Bar dataKey="percentual" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.percentual >= 80
                        ? '#10b981'
                        : entry.percentual >= 50
                        ? '#6366f1'
                        : '#f59e0b'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>&ge; 80% (Alto)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>50% - 79% (Médio)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>&lt; 50% (Em andamento)</span>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICO DE VOLUME DE TAREFAS (Criadas vs Concluídas vs Pendentes) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              2. Volume de Tarefas por Dia
            </h2>
            <p className="text-xs text-slate-500">
              Comparativo de tarefas criadas, concluídas e pendentes por dia
            </p>
          </div>
          <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-md">
            Gráfico de Volume
          </span>
        </div>

        <div className="w-full pt-2" style={{ minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomVolumeTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar dataKey="criadas" name="Criadas" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="concluidas" name="Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="pendentes" name="Pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HISTÓRICO RECENTE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Histórico Recente
          </h2>
          <p className="text-xs text-slate-500">Detalhamento dos registros por data</p>
        </div>

        <div className="divide-y divide-slate-100">
          {historyDesc.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              Nenhum histórico registrado ainda.
            </div>
          ) : (
            historyDesc.map((item) => {
              const formattedDate = formatDateShort(item.data);

              return (
                <div
                  key={item.data}
                  className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {formattedDate}
                      </span>
                      {item.diaSemana && (
                        <span className="text-xs text-slate-500 font-medium">
                          • {item.diaSemana}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span>{item.criadas} criadas</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">
                        {item.concluidas} concluídas
                      </span>
                      {item.pendentes > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-medium">
                            {item.pendentes} pendentes
                          </span>
                        </>
                      )}
                      {item.adiadas > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-700 font-medium">
                            {item.adiadas} adiadas
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.percentualExecucao}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                        item.percentualExecucao >= 80
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.percentualExecucao >= 50
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.percentualExecucao}% concluído
                    </span>
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
