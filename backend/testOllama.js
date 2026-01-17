import axios from 'axios';

const res = await axios.post('http://localhost:11434/api/generate', {
  model: 'llama3',
  prompt: 'Return ONLY JSON: { "status": "ok" }',
  stream: false
});

console.log(res.data.response);
