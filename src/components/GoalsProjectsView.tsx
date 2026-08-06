import React, { useState } from 'react';
import {
  Target,
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Trash2,
  Calendar,
  Loader2,
  Layers,
} from 'lucide-react';
import { CATEGORY_DETAILS, GoalItem, MemoryCategory, MemoryImportance, ProjectItem } from '../types';

interface GoalsProjectsViewProps {
  goals: GoalItem[];
  projects: ProjectItem[];
  onAddGoal: (newGoal: Omit<GoalItem, 'id' | 'dataCriacao'>) => void;
  onUpdateGoalProgress: (id: string, newProgress: number) => void;
  onToggleGoalNextStep: (goalId: string, stepIndex: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddProject: (newProject: Omit<ProjectItem, 'id' | 'dataAtualizacao'>) => void;
  onUpdateProjectProgress: (id: string, newProgress: number) => void;
  onDeleteProject: (id: string) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const GoalsProjectsView: React.FC<GoalsProjectsViewProps> = ({
  goals,
  projects,
  onAddGoal,
  onUpdateGoalProgress,
  onToggleGoalNextStep,
  onDeleteGoal,
  onAddProject,
  onUpdateProjectProgress,
  onDeleteProject,
  onOpenAIChat,
}) => {
  const [activeTab, setActiveTab] = useState<'metas' | 'projetos'>('metas');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // New Goal Form State
  const [goalObjetivo, setGoalObjetivo] = useState('');
  const [goalPrazo, setGoalPrazo] = useState('');
  const [goalCategoria, setGoalCategoria] = useState<MemoryCategory>('metas');
  const [goalStepInput, setGoalStepInput] = useState('');
  const [goalSteps, setGoalSteps] = useState<string[]>([]);

  // New Project Form State
  const [projNome, setProjNome] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPrioridade, setProjPrioridade] = useState<MemoryImportance>('alta');

  // AI Goal Advice Modal
  const [aiGoalAdvice, setAiGoalAdvice] = useState<{ goalId: string; text: string } | null>(null);
  const [loadingGoalId, setLoadingGoalId] = useState<string | null>(null);

  const handleAddStep = () => {
    if (goalStepInput.trim()) {
      setGoalSteps([...goalSteps, goalStepInput.trim()]);
      setGoalStepInput('');
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalObjetivo.trim()) return;

    onAddGoal({
      objetivo: goalObjetivo.trim(),
      prazo: goalPrazo || '2026-12-31',
      progresso: 0,
      proximosPassos: goalSteps.length > 0 ? goalSteps : ['Definir primeiro passo prático'],
      categoria: goalCategoria,
      status: 'em_andamento',
    });

    setGoalObjetivo('');
    setGoalPrazo('');
    setGoalSteps([]);
    setIsAddingGoal(false);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projNome.trim()) return;

    onAddProject({
      nome: projNome.trim(),
      descricao: projDesc.trim(),
      prioridade: projPrioridade,
      progresso: 0,
      status: 'ativo',
    });

    setProjNome('');
    setProjDesc('');
    setIsAddingProject(false);
  };

  const handleCheckGoalProgress = async (goal: GoalItem) => {
    setLoadingGoalId(goal.id);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analise a minha meta: "${goal.objetivo}". Progresso atual: ${goal.progresso}%. Prazo: ${goal.prazo}. Próximos passos: ${goal.proximosPassos.join(', ')}. Responda especificamente: "Você está avançando?" e me dê 2 ajustes táticos.`,
        }),
      });
      const data = await response.json();
      setAiGoalAdvice({ goalId: goal.id, text: data.text });
    } catch (err) {
      console.error(err);
      setAiGoalAdvice({
        goalId: goal.id,
        text: 'Você está no caminho certo. Concentre-se em concluir o primeiro passo prático da lista.',
      });
    } finally {
      setLoadingGoalId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Switch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Metas & Projetos Estratégicos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Acompanhe a evolução do Wesley Pessoa, Wesley Profissional e Wesley Direção.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('metas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'metas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              Metas ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('projetos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'projetos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Projetos ({projects.length})
            </button>
          </div>

          {activeTab === 'metas' ? (
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Meta</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* Form: Add Goal */}
      {isAddingGoal && (
        <form
          onSubmit={handleGoalSubmit}
          className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-slate-900">Criar Nova Meta Estratégica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Objetivo</label>
              <input
                type="text"
                value={goalObjetivo}
                onChange={(e) => setGoalObjetivo(e.target.value)}
                placeholder="Ex: Atingir 10 vendas de imóveis por mês na INC"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Prazo Estimado</label>
              <input
                type="date"
                value={goalPrazo}
                onChange={(e) => setGoalPrazo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Categoria</label>
              <select
                value={goalCategoria}
                onChange={(e) => setGoalCategoria(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                {Object.keys(CATEGORY_DETAILS).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_DETAILS[catKey as MemoryCategory].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700">Próximos Passos (Checklist)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalStepInput}
                  onChange={(e) => setGoalStepInput(e.target.value)}
                  placeholder="Ex: Fazer lista de 50 contatos quentes..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  Adicionar Passo
                </button>
              </div>
              {goalSteps.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {goalSteps.map((s, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      )}

      {/* Form: Add Project */}
      {isAddingProject && (
        <form
          onSubmit={handleProjectSubmit}
          className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-slate-900">Criar Novo Projeto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome do Projeto</label>
              <input
                type="text"
                value={projNome}
                onChange={(e) => setProjNome(e.target.value)}
                placeholder="Ex: Sistema RAXXER ou Carteira de Clientes INC"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Descrição</label>
              <textarea
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Ex: Estruturação dos fluxos comerciais e acompanhamento..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Prioridade</label>
              <select
                value={projPrioridade}
                onChange={(e) => setProjPrioridade(e.target.value as MemoryImportance)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingProject(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
            >
              Salvar Projeto
            </button>
          </div>
        </form>
      )}

      {/* Content Grid */}
      {activeTab === 'metas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                      {goal.categoria}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{goal.objetivo}</h3>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar & Slider */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Progresso Realizado</span>
                    <span className="text-emerald-700 font-bold">{goal.progresso}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progresso}
                    onChange={(e) => onUpdateGoalProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Checklist of Next Steps */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Próximos Passos:
                  </p>
                  <div className="space-y-1.5">
                    {goal.proximosPassos.map((step, idx) => (
                      <div
                        key={idx}
                        onClick={() => onToggleGoalNextStep(goal.id, idx)}
                        className="flex items-center gap-2.5 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Goal Bar & AI Advise trigger */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Prazo: {goal.prazo}
                  </span>

                  <button
                    onClick={() => handleCheckGoalProgress(goal)}
                    disabled={loadingGoalId === goal.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    {loadingGoalId === goal.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    <span>Você está avançando?</span>
                  </button>
                </div>

                {/* AI Advice Output if open */}
                {aiGoalAdvice?.goalId === goal.id && (
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-800 space-y-1">
                    <span className="font-bold text-purple-900 block">Análise Tática da IA:</span>
                    <p className="text-slate-700 leading-relaxed font-normal">{aiGoalAdvice.text}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Projects List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{proj.nome}</h3>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{proj.descricao}</p>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Progresso do Projeto</span>
                    <span className="text-blue-700 font-bold">{proj.progresso}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={proj.progresso}
                    onChange={(e) => onUpdateProjectProgress(proj.id, Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {proj.status}
                </span>
                <span>Atualizado: {proj.dataAtualizacao}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
