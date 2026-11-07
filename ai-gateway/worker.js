/**
 * DIA Kompas 3.0 — experimental AI gateway (Cloudflare Worker).
 * Not deployed. No API keys in GitHub or browser code.
 * Secrets: OPENAI_API_KEY. Configuration: ALLOWED_ORIGIN, OPENAI_MODEL.
 */
const SOURCE_LINKS = [
  {title:"American Diabetes Association",url:"https://diabetes.org/"},
  {title:"NIDDK — Diabetes",url:"https://www.niddk.nih.gov/health-information/diabetes"},
  {title:"CDC — Diabetes",url:"https://www.cdc.gov/diabetes/"}
];
const LANGS = new Set(["cs","sk","en","hu"]);
const PROMPT = `You are DIA Kompas, a multilingual diabetes EDUCATION guide, not a doctor.
Answer in the requested language (Czech, Slovak, English, or Hungarian), in plain language.
Understand colloquial questions and maintain context from supplied conversation.
Never diagnose, prescribe, calculate individual insulin doses, change medication, or interpret personal lab values as a diagnosis.
If asked for individual dosing or treatment decisions, decline that part and recommend a clinician.
For signs of a medical emergency (unconsciousness, confusion, seizures, severe hypoglycemia, suspected DKA), advise urgent local emergency assistance (112 in the EU).
Do not request personally identifying or sensitive health information.
Do not claim to have verified live webpages. Use only the trusted source links provided separately.
Keep replies concise, supportive, and factual. If uncertain, say so.`;
function response(body,status=200,origin=""){
  const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","vary":"Origin"};
  if(origin)headers["access-control-allow-origin"]=origin;
  return new Response(JSON.stringify(body),{status,headers});
}
export default {
 async fetch(request,env){
  const allowed=env.ALLOWED_ORIGIN;
  if(!allowed || !/^https:\/\//.test(allowed)) return response({error:"Server configuration incomplete"},503);
  const origin=request.headers.get("Origin")||"";
  if(request.method==="OPTIONS"){
   if(origin!==allowed)return response({error:"Origin not allowed"},403);
   return new Response(null,{status:204,headers:{"access-control-allow-origin":allowed,"access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"content-type","access-control-max-age":"600","vary":"Origin"}});
  }
  if(request.method!=="POST")return response({error:"Method not allowed"},405);
  if(origin!==allowed)return response({error:"Origin not allowed"},403);
  if(!env.OPENAI_API_KEY)return response({error:"AI service not configured"},503,origin);
  const size=Number(request.headers.get("content-length")||0);
  if(size>16000)return response({error:"Request too large"},413,origin);
  let data;
  try{data=await request.json();}catch{return response({error:"Invalid JSON"},400,origin);}
  const language=LANGS.has(data?.language)?data.language:"cs";
  const messages=Array.isArray(data?.messages)?data.messages:[];
  if(!messages.length||messages.length>12)return response({error:"Invalid conversation length"},400,origin);
  const safe=[];
  for(const m of messages){
   if(!m||!["user","assistant"].includes(m.role)||typeof m.content!=="string"||!m.content.trim()||m.content.length>1200)return response({error:"Invalid message"},400,origin);
   safe.push({role:m.role,content:m.content});
  }
  if(safe.at(-1).role!=="user")return response({error:"Last message must be a question"},400,origin);
  const model=env.OPENAI_MODEL||"gpt-4.1-mini";
  try{
   const upstream=await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"authorization":"Bearer "+env.OPENAI_API_KEY,"content-type":"application/json"},
    body:JSON.stringify({model,store:false,temperature:0.2,max_completion_tokens:450,messages:[{role:"system",content:PROMPT+"\nResponse language: "+language},...safe]})
   });
   if(!upstream.ok)return response({error:"AI service temporarily unavailable"},502,origin);
   const result=await upstream.json();
   const answer=result?.choices?.[0]?.message?.content;
   if(typeof answer!=="string"||!answer.trim())return response({error:"Empty AI response"},502,origin);
   return response({answer:answer.slice(0,3500),language,sources:SOURCE_LINKS,notice:"Educational information only; not individual medical advice."},200,origin);
  }catch{return response({error:"AI service unavailable"},502,origin);}
 }
};
