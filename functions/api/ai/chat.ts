import {
  callGeminiREST,
  buildChatPrompt,
  CHAT_RESPONSE_SCHEMA,
} from '../../../src/lib/raxxerPrompts';

interface Env {
  GEMINI_API_KEY?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente do Cloudflare. Por favor, adicione GEMINI_API_KEY nos Secrets do seu projeto Cloudflare Pages.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = (await context.request.json()) as any;
    const { message, profile, memories, goals, tasks, dailyHistory, chatHistory } = body || {};

    const prompt = buildChatPrompt({
      message,
      profile,
      memories,
      goals,
      tasks,
      dailyHistory,
      chatHistory,
    });

    const rawResponse = await callGeminiREST({
      apiKey,
      prompt,
      responseMimeType: 'application/json',
      responseSchema: CHAT_RESPONSE_SCHEMA,
    });

    let text = rawResponse;
    let actions: any[] = [];

    try {
      const parsed = JSON.parse(rawResponse);
      if (parsed.text) text = parsed.text;
      if (Array.isArray(parsed.actions)) actions = parsed.actions;
    } catch (e) {
      // Fallback if not valid JSON
    }

    return new Response(JSON.stringify({ text, actions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error in Cloudflare Function chat:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro no chat com a IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
