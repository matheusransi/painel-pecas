export default async function handler(req, res) {

const response = await fetch("https://api.openai.com/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.OPENAI_KEY}`
},
body: JSON.stringify({
model: "gpt-4o-mini",
messages: [
{
role: "system",
content: "Você é um assistente que analisa dados de uma planilha de controle de peças."
},
{
role: "user",
content: req.body.pergunta
}
]
})
});

const data = await response.json();

res.status(200).json({
resposta: data.choices[0].message.content
});

}
