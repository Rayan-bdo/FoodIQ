require('dotenv').config();

(async () => {
  const groqKey = process.env.GROQ_API_KEY;
  console.log('GROQ_API_KEY set:', !!groqKey);
  
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 50,
        }),
      });
      console.log('Groq status:', res.status);
      const data = await res.json();
      console.log('Groq response:', JSON.stringify(data).substring(0, 300));
    } catch (err) {
      console.error('Groq error:', err.message);
    }
  }
})();
