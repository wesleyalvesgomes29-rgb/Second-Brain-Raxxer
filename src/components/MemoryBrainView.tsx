import React, { useState } from 'react';
import {
  Brain,
  Search,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { CATEGORY_DETAILS, MemoryCategory, MemoryImportance, MemoryItem } from '../types';

interface MemoryBrainViewProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'data'>) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryBrainView: React.FC<MemoryBrainViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Manual Form State
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<MemoryCategory>('identidade');
  const [importancia, setImportancia] = useState<MemoryImportance>('alta');

  // AI Automatic Memory Extraction Bar State
  const [aiExtractInput, setAiExtractInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;

    onAddMemory({
      categoria,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      importancia,
      origin: 'manual',
    });

    setTitulo('');
    setConteudo('');
    setIsAdding(false);
  };

  const handleAiExtractMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiExtractInput.trim()) return;

    setIsExtracting(true);
    setExtractionFeedback(null);

    try {
      const response = await fetch('/api/ai/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputStatement: aiExtractInput.trim() }),
      });

      if (!response.ok) throw new Error('Falha no servidor');

      const extracted = await response.json();

      onAddMemory({
        categoria: (extracted.categoria as MemoryCategory) || 'identidade',
        titulo: extracted.titulo || 'Memória Registrada',
        conteudo: extracted.conteudo || aiExtractInput.trim(),
        importancia: (extracted.importancia as MemoryImportance) || 'media',
        origin: 'auto_extracted',
      });

      setExtractionFeedback(`Memória salva na categoria "${extracted.categoria || 'geral'}"!`);
      setAiExtractInput('');
    } catch (err: any) {
      console.error(err);
      onAddMemory({
        categoria: 'identidade',
        titulo: 'Memória Registrada',
        conteudo: aiExtractInput.trim(),
        importancia: 'alta',
        origin: 'auto_extracted',
      });
      setExtractionFeedback('Memória registrada!');
      setAiExtractInput('');
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = selectedCategory === 'todas' || mem.categoria === selectedCategory;
    const matchesSearch =
      mem.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.conteudo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Memória Viva ({memories.length} Registros)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sua base de conhecimento viva com dados do Wesley Pessoa, Profissional (INC) e Direção.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Memória</span>
        </button>
      </div>

      {/* AI Automatic Memory Extraction Section */}
      <div className="bg-white border border-indigo-200 p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Extração Automática com IA (Memória Viva)</span>
        </div>
        <p className="text-xs text-slate-600 font-normal">
          Digite qualquer aprendizado, preferência ou diretriz. A IA categorizará e salvará na memória viva do RAXXER.
        </p>

        <form onSubmit={handleAiExtractMemory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiExtractInput}
            onChange={(e) => setAiExtractInput(e.target.value)}
            placeholder='Ex: "Preferência: Reuniões comerciais de apresentação de imóveis devem ocorrer à tarde."'
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isExtracting || !aiExtractInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Salvar com IA</span>
            )}
          </button>
        </form>

        {extractionFeedback && (
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {extractionFeedback}
          </p>
        )}
      </div>

      {/* Manual Memory Form Collapsible */}
      {isAdding && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-slate-900">Adicionar Memória Manual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Padrão de Contato Comercial da INC"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Categoria (9 Áreas)</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none capitalize"
              >
                {Object.keys(CATEGORY_DETAILS).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_DETAILS[catKey as MemoryCategory].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Conteúdo da Memória</label>
              <textarea
                rows={3}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Ex: Detalhes importantes, processos, preferências..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Importância</label>
              <select
                value={importancia}
                onChange={(e) => setImportancia(e.target.value as MemoryImportance)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
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
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
            >
              Salvar Memória
            </button>
          </div>
        </form>
      )}

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'todas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas ({memories.length})
          </button>

          {Object.keys(CATEGORY_DETAILS).map((catKey) => {
            const cat = CATEGORY_DETAILS[catKey as MemoryCategory];
            const count = memories.filter((m) => m.categoria === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey as MemoryCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedCategory === catKey
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas memórias..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((mem) => {
          const catDetail = CATEGORY_DETAILS[mem.categoria] || CATEGORY_DETAILS.identidade;
          return (
            <div
              key={mem.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {catDetail.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                        mem.importancia === 'alta'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : mem.importancia === 'media'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {mem.importancia}
                    </span>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{mem.titulo}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{mem.conteudo}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(mem.data).toLocaleDateString('pt-BR')}
                </span>
                {mem.origin && (
                  <span className="capitalize font-semibold text-indigo-600">
                    {mem.origin === 'interview'
                      ? 'Entrevista'
                      : mem.origin === 'auto_extracted'
                      ? 'Extração IA'
                      : 'Manual'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
