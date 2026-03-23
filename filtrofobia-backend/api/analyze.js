export default async function handler(req, res) {
  // Configuração de CORS (Permite que sua extensão converse com este servidor)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { text } = req.body;
  
  // A sua chave fica salva nas variáveis de ambiente (Environment Variables) do Vercel
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
  
  // Cole aqui o prompt do seu Agent Builder
  const SYSTEM_PROMPT = `Você é o FiltraFobia. Sua missão é analisar textos e identificar vieses (machismo, racismo, homofobia, capacitismo, etc). Aponte os problemas de forma clara e sugira reescritas inclusivas.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analise este trecho:\n\n"${text}"` }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Erro na OpenAI');

    res.status(200).json({ result: data.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro ao processar análise' });
  }
}