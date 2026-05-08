export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const SYSTEM_PROMPT = `You are a friendly and knowledgeable assistant dedicated to helping international students in South Korea. You answer questions about:

- Visa types (D-2 student visa, D-4 language visa, extensions, alien registration card / ARC)
- University enrollment, registration, academic life, and course registration in Korea
- Finding housing (dormitories, officetel, goshiwon, hasukjip, shared apartments)
- Public transportation (T-money card, Seoul subway, bus, KTX trains)
- Banking (opening accounts at Shinhan, KB, Kakao Bank, Toss, international remittances)
- Health insurance (NHIS enrollment, university insurance, mandatory coverage rules)
- TOPIK exam (levels 1-6, preparation strategies, registration process)
- Daily life (grocery shopping at E-Mart/Homeplus, Coupang delivery, Naver Maps, SIM cards, healthcare clinics)
- Cultural adjustment, Korean etiquette, and social customs
- Part-time work rules for international students (20 hrs/week limit)
- Scholarships (KGSP/GKS, university scholarships, NIIED)

Be concise, practical, and warm. Mention both English and Korean terms where helpful. If you're unsure about current policies (visa fees, exact dates), acknowledge it and recommend checking official sources: HIKOREA (hikorea.go.kr), the student's international office, or Study in Korea (studyinkorea.go.kr). Keep responses under 160 words unless a numbered list is genuinely needed.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content?.[0]?.text || 'No response received.' });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
