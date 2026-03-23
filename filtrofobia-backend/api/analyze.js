export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { text } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const SYSTEM_PROMPT = `Você é o FiltraFobia, um especialista em linguagem inclusiva. Analise o texto e encontre vieses, fobias (homofobia, racismo, machismo, capacitismo, etc) ou linguagem não inclusiva.
  
  Você DEVE retornar APENAS um objeto JSON estrito com o seguinte formato:
  {
    "issues": [
      {
        "quote": "a exata palavra ou frase problemática retirada do texto",
        "analysis": "Explicação curta e direta do porquê é problemático",
        "suggestion": "Sugestão de reescrita inclusiva"
      }
    ]
  }
  Se não houver problemas, retorne {"issues": []}. Nunca retorne texto fora do JSON.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, // Força a OpenAI a responder em JSON estruturado
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analise este trecho:\n\n"${text}"` }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Erro de comunicação');

    // Retorna o JSON parseado para a extensão
    res.status(200).json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}