export default async function handler(req, res) {

try {

const response = await fetch("https://api.openai.com/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.OPENAI_KEY}`
},
body: JSON.stringify({
model: "gpt-4o-mini",
messages: [
{ role: "system", content: "Você é um assistente que responde perguntas sobre peças." },
{ role: "user", content: req.body.pergunta }
]
})
});

const data = await response.json();

res.status(200).json({
resposta: data.choices[0].message.content
});

} catch(err) {

res.status(500).json({ erro: err.message });

}

}
