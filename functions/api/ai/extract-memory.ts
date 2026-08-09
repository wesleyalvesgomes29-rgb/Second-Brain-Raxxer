import {
  callGeminiREST,
  buildExtractMemoryPrompt,
  EXTRACT_MEMORY_RESPONSE_SCHEMA,
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
    const inputStatement = body?.inputStatement || '';

    const prompt = buildExtractMemoryPrompt(inputStatement);

    const rawText = await callGeminiREST({
      apiKey,
      prompt,
      responseMimeType: 'application/json',
      responseSchema: EXTRACT_MEMORY_RESPONSE_SCHEMA,
    });

    const parsed = JSON.parse(rawText || '{}');

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error in Cloudflare Function extract-memory:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro ao extrair memória com a IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
