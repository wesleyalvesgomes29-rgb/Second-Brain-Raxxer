import {
  callGeminiREST,
  buildPrioritiesPrompt,
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
    const { profile, tasks, goals, memories } = body || {};

    const prompt = buildPrioritiesPrompt({ profile, tasks, goals, memories });

    const answer = await callGeminiREST({
      apiKey,
      prompt,
    });

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error in Cloudflare Function priorities:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro ao gerar prioridade com a IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
