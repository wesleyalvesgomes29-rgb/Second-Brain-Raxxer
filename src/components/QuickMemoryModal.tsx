import React, { useState } from 'react';
import { X, Brain, Plus } from 'lucide-react';
import { CATEGORY_DETAILS, MemoryCategory, MemoryImportance, MemoryItem } from '../types';

interface QuickMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'data'>) => void;
}

export const QuickMemoryModal: React.FC<QuickMemoryModalProps> = ({ isOpen, onClose, onAddMemory }) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<MemoryCategory>('identidade');
  const [importancia, setImportancia] = useState<MemoryImportance>('alta');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            Adicionar Memória Rápida
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Meta Comercial INC 2026"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Conteúdo</label>
            <textarea
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Ex: Detalhar aprendizado ou diretriz..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              Salvar Memória
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
