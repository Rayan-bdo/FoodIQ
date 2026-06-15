(async () => {
  const url = 'http://127.0.0.1:5000';
  const unique = Date.now();
  const registerRes = await fetch(url + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'TestGroq' + unique,
      email: 'testgroq' + unique + '@example.com',
      password: 'Password123!'
    })
  });
  console.log('register', registerRes.status);
  const cookie = registerRes.headers.get('set-cookie');
  console.log('cookie', !!cookie);
  const chatRes = await fetch(url + '/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ message: 'Quel est le meilleur petit-déjeuner pour la santé ?' })
  });
  console.log('chat', chatRes.status);
  const data = await chatRes.json();
  console.log('Provider:', data.provider);
  console.log('Reply:', data.reply.substring(0, 200));
})();
