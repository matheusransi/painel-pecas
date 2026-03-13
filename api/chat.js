export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers","Content-Type");

if(req.method === "OPTIONS"){
return res.status(200).end();
}

if (req.method !== "POST") {
return res.status(405).json({ erro: "Método não permitido" });
}

try{

const { pergunta } = req.body;

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model:"gpt-4o-mini",
messages:[
{role:"system",content:"Você é um assistente de controle de peças automotivas."},
{role:"user",content:pergunta}
]
})
});

const data = await response.json();

if(!data.choices){
return res.status(500).json({erro:JSON.stringify(data)});
}

res.status(200).json({
resposta:data.choices[0].message.content
});

}catch(error){

res.status(500).json({erro:error.message});

}

}
