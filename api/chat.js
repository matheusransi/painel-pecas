export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers","Content-Type");

if(req.method === "OPTIONS"){
return res.status(200).end();
}

if(req.method !== "POST"){
return res.status(405).json({erro:"Método não permitido"});
}

try{

const { pergunta } = req.body;

const csvURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQXT05p1mxD9mFsRFqzeG4ebXF10jVJra0AncChPKXz6UcrtpYFMZ31qMpcSCKnvQ/pub?gid=1723717147&single=true&output=csv";

const csv = await fetch(csvURL).then(r=>r.text());

const linhas = csv.split("\n").slice(1,200); 
// limitamos a 200 linhas para não gastar muitos tokens

const dados = linhas.map(l => l.split(",")).map(c=>({
os:c[1],
peca:c[6],
fornecedor:c[10],
prazo:c[12],
entrega:c[13],
valor:c[9]
}));

const contexto = JSON.stringify(dados).slice(0,8000);

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[
{
role:"system",
content:`Você é um assistente que analisa controle de peças automotivas.
Use os dados fornecidos para responder perguntas do usuário sobre:
- peças atrasadas
- peças de uma OS
- fornecedores
- compras e entregas.

Dados da planilha:
${contexto}`
},
{
role:"user",
content:pergunta
}
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
