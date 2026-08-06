import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MyDayView } from './components/MyDayView';
import { GoalsProjectsView } from './components/GoalsProjectsView';
import { MemoryBrainView } from './components/MemoryBrainView';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { InterviewWizard } from './components/InterviewWizard';
import { AIChatDrawer } from './components/AIChatDrawer';
import { QuickMemoryModal } from './components/QuickMemoryModal';

import {
  GoalItem,
  MemoryCategory,
  MemoryImportance,
  MemoryItem,
  ProjectItem,
  TaskItem,
  TaskPriority,
  UserProfile,
  WeeklyReview,
} from './types';

import {
  DEFAULT_USER_PROFILE,
  INITIAL_GOALS,
  INITIAL_MEMORIES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_WEEKLY_REVIEWS,
} from './utils/initialData';

// Helper to sanitize local storage data and strip legacy "Alex" references
const getSanitizedLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    let cleanRaw = raw;
    if (cleanRaw.includes('Alex') || cleanRaw.includes('alex')) {
      cleanRaw = cleanRaw.replace(/Alex/g, 'Wesley').replace(/alex/g, 'wesley');
    }

    const parsed = JSON.parse(cleanRaw);

    if (key === 'sb_profile') {
      const p = parsed as UserProfile;
      return {
        ...DEFAULT_USER_PROFILE,
        ...p,
        nome: p.nome && !p.nome.includes('Alex') && p.nome !== 'Usuário' ? p.nome : 'Wesley Gomes',
        comoSerChamado: p.comoSerChamado && !p.comoSerChamado.includes('Alex') ? p.comoSerChamado : 'Wesley',
      };
    }

    return parsed;
  } catch (e) {
    return fallback;
  }
};

export default function App() {
  // Local Storage State Persistent Hydration with automatic Alex removal sanitization
  const [profile, setProfile] = useState<UserProfile>(() =>
    getSanitizedLocalStorage<UserProfile>('sb_profile', DEFAULT_USER_PROFILE)
  );

  const [memories, setMemories] = useState<MemoryItem[]>(() =>
    getSanitizedLocalStorage<MemoryItem[]>('sb_memories', INITIAL_MEMORIES)
  );

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    getSanitizedLocalStorage<TaskItem[]>('sb_tasks', INITIAL_TASKS)
  );

  const [goals, setGoals] = useState<GoalItem[]>(() =>
    getSanitizedLocalStorage<GoalItem[]>('sb_goals', INITIAL_GOALS)
  );

  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    getSanitizedLocalStorage<ProjectItem[]>('sb_projects', INITIAL_PROJECTS)
  );

  const [reviews, setReviews] = useState<WeeklyReview[]>(() =>
    getSanitizedLocalStorage<WeeklyReview[]>('sb_reviews', INITIAL_WEEKLY_REVIEWS)
  );

  // Auto-clean any legacy Alex data stored in localStorage on mount
  useEffect(() => {
    ['sb_profile', 'sb_memories', 'sb_tasks', 'sb_goals', 'sb_projects', 'sb_reviews', 'sb_chat_history'].forEach((key) => {
      const val = localStorage.getItem(key);
      if (val && (val.includes('Alex') || val.includes('alex'))) {
        const cleaned = val.replace(/Alex/g, 'Wesley').replace(/alex/g, 'wesley');
        localStorage.setItem(key, cleaned);
      }
    });
  }, []);

  // UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [isQuickMemoryOpen, setIsQuickMemoryOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sb_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sb_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('sb_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sb_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('sb_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('sb_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Handlers
  const handleCompleteInterview = (
    updatedProfile: UserProfile,
    aiGeneratedData?: {
      memories: any[];
      goals: any[];
      tasks: any[];
      welcomeAnalysis: string;
    }
  ) => {
    setProfile(updatedProfile);

    if (aiGeneratedData) {
      if (aiGeneratedData.memories && aiGeneratedData.memories.length > 0) {
        const newMems: MemoryItem[] = aiGeneratedData.memories.map((m: any, idx: number) => ({
          id: `mem-ai-${Date.now()}-${idx}`,
          categoria: (m.categoria as MemoryCategory) || 'identidade',
          titulo: m.titulo || 'Memória Registrada',
          conteudo: m.conteudo || '',
          importancia: (m.importancia as MemoryImportance) || 'alta',
          data: new Date().toISOString(),
          origin: 'interview',
        }));
        setMemories(newMems);
      }

      if (aiGeneratedData.goals && aiGeneratedData.goals.length > 0) {
        const newGoals: GoalItem[] = aiGeneratedData.goals.map((g: any, idx: number) => ({
          id: `goal-ai-${Date.now()}-${idx}`,
          objetivo: g.objetivo,
          prazo: g.prazo || '2026-12-31',
          progresso: g.progresso || 10,
          proximosPassos: g.proximosPassos || ['Começar primeiro passo'],
          categoria: (g.categoria as MemoryCategory) || 'metas',
          dataCriacao: new Date().toISOString().split('T')[0],
          status: 'em_andamento',
        }));
        setGoals(newGoals);
      }

      if (aiGeneratedData.tasks && aiGeneratedData.tasks.length > 0) {
        const newTasks: TaskItem[] = aiGeneratedData.tasks.map((t: any, idx: number) => ({
          id: `task-ai-${Date.now()}-${idx}`,
          titulo: t.titulo,
          prioridade: (t.prioridade as TaskPriority) || 'importante',
          concluida: false,
          data: new Date().toISOString().split('T')[0],
          categoria: (t.categoria as MemoryCategory) || 'projetos',
        }));
        setTasks(newTasks);
      }
    }

    setActiveTab('dashboard');
  };

  // Task Handlers
  const handleAddTask = (newTask: Omit<TaskItem, 'id' | 'data'>) => {
    const item: TaskItem = {
      ...newTask,
      id: `task-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [item, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTaskPriority = (id: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, prioridade: newPriority } : t))
    );
  };

  // Goal Handlers
  const handleAddGoal = (newGoal: Omit<GoalItem, 'id' | 'dataCriacao'>) => {
    const item: GoalItem = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [item, ...prev]);
  };

  const handleUpdateGoalProgress = (id: string, newProgress: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progresso: newProgress } : g))
    );
  };

  const handleToggleGoalNextStep = (goalId: string, stepIndex: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedSteps = [...g.proximosPassos];
        // Toggle step with checkmark prefix if clicked
        if (updatedSteps[stepIndex].startsWith('✓ ')) {
          updatedSteps[stepIndex] = updatedSteps[stepIndex].replace('✓ ', '');
        } else {
          updatedSteps[stepIndex] = `✓ ${updatedSteps[stepIndex]}`;
        }
        return { ...g, proximosPassos: updatedSteps };
      })
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Project Handlers
  const handleAddProject = (newProject: Omit<ProjectItem, 'id' | 'dataAtualizacao'>) => {
    const item: ProjectItem = {
      ...newProject,
      id: `proj-${Date.now()}`,
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [item, ...prev]);
  };

  const handleUpdateProjectProgress = (id: string, newProgress: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progresso: newProgress } : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Memory Handlers
  const handleAddMemory = (newMem: Omit<MemoryItem, 'id' | 'data'>) => {
    const item: MemoryItem = {
      ...newMem,
      id: `mem-${Date.now()}`,
      data: new Date().toISOString(),
    };
    setMemories((prev) => [item, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Weekly Review Handlers
  const handleSaveReview = (review: WeeklyReview) => {
    setReviews((prev) => [review, ...prev.filter((r) => r.id !== review.id)]);
  };

  const handleOpenAIChat = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={profile.comoSerChamado || profile.nome}
        onOpenQuickMemoryModal={() => setIsQuickMemoryOpen(true)}
        onOpenAIChat={() => handleOpenAIChat()}
        onStartInterview={() => setActiveTab('entrevista')}
        memoriesCount={memories.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'entrevista' ? (
          <InterviewWizard
            initialProfile={profile}
            onCompleteInterview={handleCompleteInterview}
            onCancel={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'meu_dia' ? (
          <MyDayView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskPriority={handleUpdateTaskPriority}
            onOpenAIChat={handleOpenAIChat}
          />
        ) : activeTab === 'metas_projetos' ? (
          <GoalsProjectsView
            goals={goals}
            projects={projects}
            onAddGoal={handleAddGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onToggleGoalNextStep={handleToggleGoalNextStep}
            onDeleteGoal={handleDeleteGoal}
            onAddProject={handleAddProject}
            onUpdateProjectProgress={handleUpdateProjectProgress}
            onDeleteProject={handleDeleteProject}
            onOpenAIChat={handleOpenAIChat}
          />
        ) : activeTab === 'memoria_viva' ? (
          <MemoryBrainView
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        ) : activeTab === 'revisao_semanal' ? (
          <WeeklyReviewView
            reviews={reviews}
            tasks={tasks}
            goals={goals}
            memories={memories}
            onSaveReview={handleSaveReview}
            onOpenAIChat={handleOpenAIChat}
          />
        ) : (
          <DashboardView
            profile={profile}
            memories={memories}
            tasks={tasks}
            goals={goals}
            projects={projects}
            onNavigate={setActiveTab}
            onToggleTask={handleToggleTask}
            onOpenQuickMemory={() => setIsQuickMemoryOpen(true)}
            onOpenAIChat={handleOpenAIChat}
          />
        )}
      </main>

      {/* Persistent AI Chat Advisor Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        profile={profile}
        memories={memories}
        goals={goals}
        tasks={tasks}
        initialPrompt={aiInitialPrompt}
        onAddMemory={handleAddMemory}
      />

      {/* Quick Memory Creator Modal */}
      <QuickMemoryModal
        isOpen={isQuickMemoryOpen}
        onClose={() => setIsQuickMemoryOpen(false)}
        onAddMemory={handleAddMemory}
      />
    </div>
  );
}
