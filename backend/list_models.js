require('dotenv').config();
(async () => {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    console.log('Available models:');
    if (data.data) {
      data.data.forEach(m => console.log(`  - ${m.id}`));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
