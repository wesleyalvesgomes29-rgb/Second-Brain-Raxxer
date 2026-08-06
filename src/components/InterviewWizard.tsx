import React, { useState } from 'react';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Target,
  FolderKanban,
  Clock,
  BookOpen,
  Heart,
  Coins,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface InterviewWizardProps {
  initialProfile: UserProfile;
  onCompleteInterview: (
    updatedProfile: UserProfile,
    aiGeneratedData?: {
      memories: any[];
      goals: any[];
      tasks: any[];
      welcomeAnalysis: string;
    }
  ) => void;
  onCancel?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Identidade & Arquitetura de 3 Pilares',
    icon: User,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Ajuste do RAXXER entre seus três pilares fundamentais: 🧩 Wesley Pessoa, 💼 Wesley Profissional (INC Empreendimentos) e 🎯 Wesley Direção.',
    questions: [
      { key: 'nome', label: 'Qual é o seu nome completo?', placeholder: 'Ex: Wesley Gomes' },
      { key: 'comoSerChamado', label: 'Como você prefere que o RAXXER te chame?', placeholder: 'Ex: Wesley' },
      { key: 'rotinaAtual', label: 'Como é a sua rotina diária no Pessoal, Profissional e no seu Direcionamento?', placeholder: 'Ex: Manhãs com foco no CRM/leads da INC, tardes em agendamentos/atendimentos e noites com família e estudos...' },
      { key: 'responsabilidades', label: 'Quais são suas principais responsabilidades em cada um dos pilares?', placeholder: 'Ex: Profissional: 10 vendas/mês na INC. Pessoal: Saúde, treino 4x/semana e finanças. Direção: Equilíbrio e presença...' },
    ],
  },
  {
    id: 2,
    title: 'Metas & Visão de Futuro',
    icon: Target,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Onde você quer chegar nos próximos meses e anos.',
    questions: [
      { key: 'metasProximas', label: 'Quais são seus objetivos para os próximos 3 a 6 meses?', placeholder: 'Ex: Atingir metas de vendas na INC, criar hábitos de rotina matinal...' },
      { key: 'metasLongoPrazo', label: 'Quais são seus grandes objetivos de longo prazo (1 a 5 anos)?', placeholder: 'Ex: Independência financeira, evolução patrimonial...' },
      { key: 'mudancasDesejadas', label: 'O que você mais quer mudar ou melhorar na sua vida hoje?', placeholder: 'Ex: Organização comercial, consistência de follow-up com clientes...' },
    ],
  },
  {
    id: 3,
    title: 'Projetos & Prioridades',
    icon: FolderKanban,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Os projetos que estão em andamento e as ideias no papel.',
    questions: [
      { key: 'projetosAtuais', label: 'Quais são seus projetos atuais que estão em andamento?', placeholder: 'Ex: Carteira de Leads INC, Treinos e Saúde...' },
      { key: 'ideiasFuturas', label: 'Que ideias você tem guardadas para projetos futuros?', placeholder: 'Ex: Expansão de atuação, investimentos futuros...' },
      { key: 'prioridades', label: 'Qual é a sua prioridade absoluta numero 1 hoje?', placeholder: 'Ex: Garantir processo comercial constante na INC...' },
    ],
  },
  {
    id: 4,
    title: 'Organização & Desafios',
    icon: Clock,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Como você organiza seu tempo e quais gargalos enfrenta.',
    questions: [
      { key: 'organizacaoHoje', label: 'Como você organiza o seu dia hoje?', placeholder: 'Ex: CRM da INC, WhatsApp, blocos de tempo...' },
      { key: 'dificuldades', label: 'Onde você sente que tem a sua maior dificuldade?', placeholder: 'Ex: Priorizar contatos certos, manter cadência de retrabalho...' },
      { key: 'procrastination', label: 'O que você costuma deixar para depois ou procrastinar?', placeholder: 'Ex: Acompanhamento de propostas paradas...' },
    ],
  },
  {
    id: 5,
    title: 'Aprendizado & Conhecimento',
    icon: BookOpen,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Habilidades que você quer dominar e assuntos que está estudando.',
    questions: [
      { key: 'estudando', label: 'O que você está estudando ativamente no momento?', placeholder: 'Ex: Técnicas de negociação, mercado imobiliário...' },
      { key: 'querAprender', label: 'O que mais você gostaria de aprender em breve?', placeholder: 'Ex: Estratégias avançadas de comunicação e vendas...' },
    ],
  },
  {
    id: 6,
    title: 'Saúde & Hábitos',
    icon: Heart,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Sua energia física, mental e hábitos diários.',
    questions: [
      { key: 'rotinaSaude', label: 'Como é sua rotina de saúde (exercícios, sono, alimentação)?', placeholder: 'Ex: Treino matinal, caminhadas...' },
      { key: 'habitosMelhorar', label: 'Quais hábitos você quer construir ou abandonar?', placeholder: 'Ex: Acordar cedo com energia, gerenciar tempo de tela...' },
    ],
  },
  {
    id: 7,
    title: 'Finanças & Planejamento',
    icon: Coins,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Seus objetivos financeiros e gestão orçamentária.',
    questions: [
      { key: 'objetivosFinanceiros', label: 'Quais são seus objetivos financeiros atuais?', placeholder: 'Ex: Meta de faturamento na INC, reservas...' },
      { key: 'planejamentoFinancas', label: 'Como você planeja suas finanças hoje?', placeholder: 'Ex: Controle mensal de entradas e comissões...' },
    ],
  },
];

export const InterviewWizard: React.FC<InterviewWizardProps> = ({
  initialProfile,
  onCompleteInterview,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const step = STEPS[currentStepIndex];
  const StepIcon = step.icon;

  const handleChange = (key: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinishAndGenerate();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinishAndGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/ai/onboarding-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileAnswers: formData }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor');
      }

      const data = await response.json();
      const updatedProfile: UserProfile = {
        ...formData,
        interviewCompleted: true,
        currentInterviewStep: STEPS.length,
      };

      onCompleteInterview(updatedProfile, data);
    } catch (err: any) {
      console.error('Erro no processamento com IA:', err);
      const updatedProfile: UserProfile = {
        ...formData,
        interviewCompleted: true,
        currentInterviewStep: STEPS.length,
      };
      onCompleteInterview(updatedProfile);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Configuração Estratégica</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Seu Alinhamento no RAXXER
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto font-medium">
          Responda às perguntas para alinhar a inteligência do RAXXER nos três pilares: Wesley Pessoa, Wesley Profissional (INC) e Wesley Direção.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-600">
            Etapa {currentStepIndex + 1} de {STEPS.length}: {step.title}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% concluído
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm relative">
        <div className="flex items-center gap-3.5 mb-6">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${step.color}`}>
            <StepIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{step.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{step.description}</p>
          </div>
        </div>

        {/* Questions Form */}
        <div className="space-y-5">
          {step.questions.map((q) => (
            <div key={q.key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {q.label}
              </label>
              <textarea
                rows={2}
                value={(formData as any)[q.key] || ''}
                onChange={(e) => handleChange(q.key as keyof UserProfile, e.target.value)}
                placeholder={q.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0 || isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                Pular / Ver Dashboard
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Construindo Estrutura com IA...</span>
                </>
              ) : currentStepIndex === STEPS.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Concluir e Criar Estrutura</span>
                </>
              ) : (
                <>
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {generationError && (
          <p className="mt-4 text-xs text-rose-600 text-center font-semibold">
            {generationError}
          </p>
        )}
      </div>
    </div>
  );
};
