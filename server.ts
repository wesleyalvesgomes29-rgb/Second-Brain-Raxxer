import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI SDK lazily/safely on server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Persona for RAXXER AI Copilot
const SECOND_BRAIN_SYSTEM_INSTRUCTION = `
Você é a inteligência e o assistente chamado "RAXXER" — Seu copiloto estratégico pessoal para Wesley Gomes.
Seu nome é RAXXER. NUNCA se apresente como Alex, Assistente Genérico ou qualquer outro nome. Você é RAXXER.
Ao falar com o usuário, dirija-se a ele estritamente como Wesley (ou Wesley Gomes).

Sua missão é atuar como organizador pessoal, consultor estratégico e analista de evolução integrada.

ARQUITETURA DE TRÊS PILARES DE WESLEY GOMES:

1. 🧩 WESLEY PESSOAL (Saúde, Família, Finanças & Hábitos):
   - Saúde & Vitalidade: Perda de peso, treinos diários (4x+ por semana), alimentação saudável e alta energia física/mental.
   - Família & Presença: Tempo de qualidade com esposa e filhos, preservar noites e domingos livres de trabalho.
   - Finanças Pessoais: Quitar pendências, consolidar reserva de emergência e aportar 30% de cada comissão de vendas em investimentos duradouros.
   - Aprendizado & Hábitos: Estudo diário de Inteligência Artificial, desenvolvimento pessoal e hábitos constantes.

2. 💼 WESLEY PROFISSIONAL (Corretor INC Empreendimentos):
   - Atuação: Corretor de imóveis de alta performance na INC Empreendimentos.
   - Meta Principal: Alcançar média de 10 vendas de imóveis por mês até o final do ano.
   - Organização de Leads: Qualificação em Leads Quentes (ação imediata/agendamento de visita), Mornos (nutrição/cadência) e Frios (retrabalho sistemático sem pressão).
   - Suporte de IA em Comunicação: Criar scripts de atendimento rápidos, mensagens de primeiro contato sem clichê, mensagens de retrabalho sutis e contorno certeiro de objeções (preço, entrada, financiamento, concorrência).
   - Processo Comercial Previsível: Manter cadência constante no CRM da INC e foco em agendamento de visitas presenciais.

3. 🎯 WESLEY DIREÇÃO (Princípios & Propósito de Vida):
   - Propósito: Construir uma vida com significado, ser um pai/marido excelente, um profissional estratégico e alguém em evolução constante.
   - Alertar Desvios: Alertar empaticamente quando a sobrecarga de trabalho estiver sacrificando a saúde ou o tempo familiar, ou quando a procrastinação estiver afetando o CRM.

REGRAS DE INTERAÇÃO:
- Seu nome de assistente é exclusivamente RAXXER.
- Dirija-se ao usuário sempre como Wesley.
- Seja direto, empático, pragmático, altamente estratégico e focado em ação imediata.
- Use marcadores visuais limpos, estrutura scannable em Português do Brasil.
- Ao sugerir scripts de vendas, seja natural e humano, evitando tom engessado.
`;

// API: Onboarding Interview Summary & Memory Generation
app.post('/api/ai/onboarding-summary', async (req, res) => {
  try {
    const { profileAnswers } = req.body;
    const ai = getGeminiClient();

    const prompt = `
O usuário concluiu a entrevista inicial do RAXXER. Aqui estão suas respostas:
- Nome/Como ser chamado: ${profileAnswers.nome || 'Wesley Gomes'} (${profileAnswers.comoSerChamado || 'Wesley'})
- Rotina Atual: ${profileAnswers.rotinaAtual || ''}
- Responsabilidades: ${profileAnswers.responsabilidades || ''}
- Metas Próximas: ${profileAnswers.metasProximas || ''}
- Metas Longo Prazo: ${profileAnswers.metasLongoPrazo || ''}
- Mudanças Desejadas: ${profileAnswers.mudancasDesejadas || ''}
- Projetos Atuais: ${profileAnswers.projetosAtuais || ''}
- Ideias Futuras: ${profileAnswers.ideiasFuturas || ''}
- Prioridades: ${profileAnswers.prioridades || ''}
- Organização Atual: ${profileAnswers.organizacaoHoje || ''}
- Maior Dificuldade: ${profileAnswers.dificuldades || ''}
- Procrastinação: ${profileAnswers.procrastination || ''}
- O que está Estudando: ${profileAnswers.estudando || ''}
- O que quer Aprender: ${profileAnswers.querAprender || ''}
- Rotina de Saúde/Hábitos: ${profileAnswers.rotinaSaude || ''} / ${profileAnswers.habitosMelhorar || ''}
- Finanças: ${profileAnswers.objetivosFinanceiros || ''} / ${profileAnswers.planejamentoFinancas || ''}

Gere uma estrutura inicial para o RAXXER contendo:
1. Memórias para as 9 áreas: identidade, metas, projetos, rotina, aprendizado, financas, saude, ideias, relacoes.
2. Metas iniciais estruturadas (com objetivo, prazo estimado, progresso inicial, próximos passos).
3. Tarefas prioritárias do dia (com título, prioridade: urgente, importante ou pode_esperar).
4. Uma análise de boas-vindas sintetizando quem é o usuário e qual é o seu plano de ação principal nos três pilares (Pessoal, Profissional, Direção).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SECOND_BRAIN_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            welcomeAnalysis: { type: Type.STRING },
            memories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoria: { type: Type.STRING },
                  titulo: { type: Type.STRING },
                  conteudo: { type: Type.STRING },
                  importancia: { type: Type.STRING },
                },
                required: ['categoria', 'titulo', 'conteudo', 'importancia'],
              },
            },
            goals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objetivo: { type: Type.STRING },
                  prazo: { type: Type.STRING },
                  progresso: { type: Type.NUMBER },
                  proximosPassos: { type: Type.ARRAY, items: { type: Type.STRING } },
                  categoria: { type: Type.STRING },
                },
                required: ['objetivo', 'prazo', 'progresso', 'proximosPassos', 'categoria'],
              },
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  prioridade: { type: Type.STRING },
                  categoria: { type: Type.STRING },
                },
                required: ['titulo', 'prioridade'],
              },
            },
          },
          required: ['welcomeAnalysis', 'memories', 'goals', 'tasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/onboarding-summary:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar resumo do onboarding' });
  }
});

// API: "Qual é a coisa mais importante que preciso fazer hoje?"
app.post('/api/ai/priorities', async (req, res) => {
  try {
    const { profile, tasks, goals, memories } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Analise o contexto atual do usuário (${profile?.comoSerChamado || profile?.nome || 'Wesley'}):
- Perfil e Dificuldades: ${profile?.dificuldades || 'Nenhum informado'}
- Tarefas Pendentes de Hoje: ${JSON.stringify(tasks || [])}
- Metas Ativas: ${JSON.stringify(goals || [])}
- Memórias Recentes: ${JSON.stringify((memories || []).slice(0, 10))}

Responda categoricamente à pergunta: "Qual é a coisa mais importante que preciso fazer hoje?"
Explique o porquê com base nas metas e mostre 3 passos práticos para executar essa tarefa agora.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SECOND_BRAIN_SYSTEM_INSTRUCTION,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/priorities:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar prioridade do dia' });
  }
});

// API: Auto-extract memory from user input
app.post('/api/ai/extract-memory', async (req, res) => {
  try {
    const { inputStatement } = req.body;
    const ai = getGeminiClient();

    const prompt = `
O usuário informou algo permanente ou importante: "${inputStatement}".

Identifique se isso representa um fato permanente, objetivo, hábito ou projeto.
Extraia uma memória estruturada contendo:
- categoria: uma das 9 ('identidade', 'metas', 'projetos', 'rotina', 'aprendizado', 'financas', 'saude', 'ideias', 'relacoes')
- titulo: título conciso
- conteudo: descrição detalhada e contextualizada
- importancia: 'alta', 'media' ou 'baixa'
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SECOND_BRAIN_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoria: { type: Type.STRING },
            titulo: { type: Type.STRING },
            conteudo: { type: Type.STRING },
            importancia: { type: Type.STRING },
          },
          required: ['categoria', 'titulo', 'conteudo', 'importancia'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/extract-memory:', error);
    res.status(500).json({ error: error.message || 'Erro ao extrair memória' });
  }
});

// API: Weekly Review Generator
app.post('/api/ai/weekly-review', async (req, res) => {
  try {
    const { completedTasks, pendingTasks, goals, memories, weekName } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Faça uma revisão semanal profunda para a "${weekName || 'Semana Atual'}":
- Tarefas Concluídas: ${JSON.stringify(completedTasks || [])}
- Tarefas Pendentes: ${JSON.stringify(pendingTasks || [])}
- Progresso em Metas: ${JSON.stringify(goals || [])}
- Novas Memórias: ${JSON.stringify((memories || []).slice(0, 5))}

Gere o relatório da revisão contendo:
1. conquistas (array de conquistas relevantes)
2. pendencias (array de itens que ficaram acumulados)
3. pontosAtencao (array de alertas sobre hábitos, atrasos ou perda de foco)
4. recomendacoes (array de 3 a 4 recomendações estratégicas para a próxima semana)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SECOND_BRAIN_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conquistas: { type: Type.ARRAY, items: { type: Type.STRING } },
            pendencias: { type: Type.ARRAY, items: { type: Type.STRING } },
            pontosAtencao: { type: Type.ARRAY, items: { type: Type.STRING } },
            recomendacoes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['conquistas', 'pendencias', 'pontosAtencao', 'recomendacoes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/weekly-review:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar revisão semanal' });
  }
});

// API: General AI Chat Advisor
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, profile, memories, goals, tasks, chatHistory } = req.body;
    const ai = getGeminiClient();

    const contextPrompt = `
Contexto do Usuário:
- Nome: ${profile?.nome || 'Wesley Gomes'}
- Como ser chamado: ${profile?.comoSerChamado || profile?.nome || 'Wesley'}
- Metas principais: ${goals?.map((g: any) => g.objetivo).join('; ') || 'Não especificado'}
- Dificuldades: ${profile?.dificuldades || 'Não especificado'}
- Memórias Relevantes: ${JSON.stringify((memories || []).slice(0, 8))}
- Tarefas Urgentes/Importantes Hoje: ${JSON.stringify((tasks || []).filter((t: any) => !t.concluida))}

Histórico de Conversa Recente:
${(chatHistory || [])
  .map((m: any) => `${m.sender === 'user' ? (profile?.comoSerChamado || 'Wesley') : 'RAXXER'}: ${m.text}`)
  .join('\n')}

Mensagem Atual do Usuário: "${message}"

Responda exclusivamente como o RAXXER (seu copiloto estratégico pessoal para Wesley). Dirija-se sempre a ele como Wesley. Seja cirúrgico, direto, pragmático e ofereça ações imediatas em conformidade com seus pilares (Wesley Pessoa, Wesley Profissional e Wesley Direção).
Se a mensagem contiver alguma meta nova ou fato relevante permanente, indique no final da resposta com um bloco JSON ou marcador claro para salvar como memória.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: SECOND_BRAIN_SYSTEM_INSTRUCTION,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'Erro na resposta da IA' });
  }
});

// Vite & Express Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAXXER Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
