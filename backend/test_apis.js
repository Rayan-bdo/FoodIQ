require('dotenv').config();

(async () => {
  console.log('Test 1: Open Food Facts');
  try {
    const res1 = await fetch('https://world.openfoodfacts.org/api/v0/product/3017620422799.json');
    console.log('OFF status:', res1.status);
  } catch (err) {
    console.error('OFF error:', err.message);
  }

  console.log('\nTest 2: Hugging Face');
  try {
    const res2 = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      body: JSON.stringify({ inputs: 'Hello' })
    });
    console.log('HF status:', res2.status);
  } catch (err) {
    console.error('HF error:', err.message);
  }
})();
