import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Brain,
  Bot,
  User,
  Zap,
  Target,
  AlertTriangle,
  Loader2,
  BookmarkPlus,
} from 'lucide-react';
import { AIChatMessage, DailyHistoryLog, GoalItem, MemoryItem, TaskItem, TaskPriority, TaskStatus, UserProfile } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  memories: MemoryItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  dailyHistory?: DailyHistoryLog[];
  initialPrompt?: string;
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'data'>) => void;
  onAddTask?: (task: Omit<TaskItem, 'id' | 'data'> & { data?: string }) => void;
  onUpdateTaskStatus?: (searchTitleOrId: string, status: TaskStatus) => void;
  onRescheduleTask?: (searchTitleOrId: string, newDate: string) => void;
  onDeleteTask?: (searchTitleOrId: string) => void;
  onAddGoal?: (goal: Omit<GoalItem, 'id' | 'dataCriacao'>) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  memories,
  goals,
  tasks,
  dailyHistory,
  initialPrompt,
  onAddMemory,
  onAddTask,
  onUpdateTaskStatus,
  onRescheduleTask,
  onDeleteTask,
  onAddGoal,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Olá ${profile.comoSerChamado || profile.nome || 'Wesley'}! Sou seu Secretário Pessoal Inteligente. Como posso te ajudar agora? Pode me pedir para agendar compromissos, marcar tarefas como concluídas ou consultar seu histórico.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Como está meu dia?',
        'Como foi minha semana?',
        'Raxxer, amanhã preciso pagar a conta de luz.',
        'Raxxer, já paguei a conta de luz.',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          profile,
          memories,
          goals,
          tasks,
          dailyHistory,
          chatHistory: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const errorMessage = errJson?.error || `Falha na requisição (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Process Actions returned by Secretário RAXXER
      if (Array.isArray(data.actions) && data.actions.length > 0) {
        data.actions.forEach((act: any) => {
          if (!act || !act.type || !act.payload) return;
          const p = act.payload;

          switch (act.type) {
            case 'create_task':
              onAddTask?.({
                titulo: p.titulo || p.descricao || 'Nova Tarefa',
                prioridade: (p.prioridade as TaskPriority) || 'urgente',
                status: (p.status as TaskStatus) || 'pendente',
                categoria: p.categoria || 'geral',
                notas: p.horario ? `Horário: ${p.horario}` : p.descricao || undefined,
                concluida: false,
                data: p.data || new Date().toISOString().split('T')[0],
              });
              break;

            case 'update_task_status':
              onUpdateTaskStatus?.(
                p.searchTitle || p.id || p.titulo || '',
                (p.status as TaskStatus) || 'concluida'
              );
              break;

            case 'reschedule_task':
              if (p.data) {
                onRescheduleTask?.(p.searchTitle || p.id || p.titulo || '', p.data);
              }
              break;

            case 'delete_task':
              onDeleteTask?.(p.searchTitle || p.id || p.titulo || '');
              break;

            case 'add_memory':
              onAddMemory({
                categoria: p.categoria || 'identidade',
                titulo: p.titulo || 'Registro do Secretário',
                conteudo: p.conteudo || p.descricao || p.titulo || '',
                importancia: p.importancia || 'media',
              });
              break;

            case 'create_goal':
              onAddGoal?.({
                objetivo: p.objetivo || p.titulo || 'Novo Objetivo',
                prazo: p.prazo || '2026-12-31',
                progresso: 0,
                proximosPassos: p.proximosPassos || [],
                categoria: p.categoria || 'metas',
                status: 'em_andamento',
              });
              break;

            default:
              break;
          }
        });
      }

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'Anotei.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('RAXXER Chat Error:', err);
      const errorDetail = err?.message || 'Falha de comunicação.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Não consegui conectar à inteligência do RAXXER. Verifique a configuração da GEMINI_API_KEY.\n\nDetalhes do erro: ${errorDetail}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-all animate-fadeIn">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Secretário RAXXER</h3>
              <p className="text-[11px] text-indigo-600 font-semibold">Seu Secretário Pessoal Inteligente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Chip Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSendMessage('Qual é a coisa mais importante que preciso fazer hoje?')}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            Prioridade de Hoje
          </button>
          <button
            onClick={() => handleSendMessage('Analise se estou no caminho certo das minhas metas.')}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Target className="w-3 h-3 text-emerald-600" />
            Análise de Metas
          </button>
          <button
            onClick={() => handleSendMessage('Onde você identifica que posso estar procrastinando?')}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Procrastinação
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white shadow-xs font-medium'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{msg.timestamp}</span>
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>O RAXXER está analisando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Fale com seu Secretário RAXXER..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
