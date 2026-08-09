import React from 'react';
import {
  Zap,
  LayoutDashboard,
  CalendarCheck,
  Target,
  BookMarked,
  BarChart3,
  TrendingUp,
  Bot,
  UserCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { MemoryCategory } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  onOpenQuickMemoryModal: () => void;
  onOpenAIChat: () => void;
  onStartInterview: () => void;
  memoriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userName,
  onOpenQuickMemoryModal,
  onOpenAIChat,
  onStartInterview,
  memoriesCount,
}) => {
  const todayDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedDate = todayDate.charAt(0).toUpperCase() + todayDate.slice(1);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">RAXXER</h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Secretário Pessoal Inteligente <span className="text-slate-300">|</span> <span className="text-slate-600">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Mobile AI button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAIChat}
              className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              title="Abrir Copiloto RAXXER"
            >
              <Bot className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('meu_dia')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'meu_dia'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Meu Dia
          </button>

          <button
            onClick={() => setActiveTab('metas_projetos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'metas_projetos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Target className="w-4 h-4" />
            Metas & Projetos
          </button>

          <button
            onClick={() => setActiveTab('memoria_viva')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'memoria_viva'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Memória Viva
            <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'memoria_viva' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {memoriesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evolucao')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'evolucao'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Evolução
          </button>

          <button
            onClick={() => setActiveTab('revisao_semanal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'revisao_semanal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Revisão Semanal
          </button>
        </nav>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenQuickMemoryModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all shadow-2xs"
            title="Adicionar memória rápida"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Memória</span>
          </button>

          <button
            onClick={onStartInterview}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all shadow-2xs"
            title="Refazer Entrevista Inicial"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Entrevista</span>
          </button>

          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secretário RAXXER</span>
          </button>
        </div>
      </div>
    </header>
  );
};
