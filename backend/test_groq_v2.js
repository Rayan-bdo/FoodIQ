require('dotenv').config();
(async () => {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32k-instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50,
      }),
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data.choices?.[0]?.message?.content || data.error?.message || JSON.stringify(data));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
