/* Caixa de entrada da extensão do Chrome */
"use strict";
/* ---------- Caixa de entrada da extensão do Chrome ----------
   A extensão nunca grava o registro inteiro: ela deposita eventos em
   vertice_inbox. O app, já sincronizado, aplica cada evento no registro
   (ou nas finanças), grava e apaga o evento da fila. */
var NV_FEITOS;
aoIniciar(function(){
NV_FEITOS=KEY+'-caixa-feitos';
});

function cxFeitos(){try{return JSON.parse(localStorage.getItem(NV_FEITOS)||'[]');}catch(e){return [];}}
function cxMarca(ids){var a=cxFeitos().concat(ids).slice(-300);try{localStorage.setItem(NV_FEITOS,JSON.stringify(a));}catch(e){}}
function cxGasto(d){var k='sfp_bruno_v4',st;try{st=JSON.parse(localStorage.getItem(k)||'null');}catch(e){st=null;}
 if(!st||!Array.isArray(st.entries))return false;var v=+d.valor||0;if(!v||!d.descricao)return false;var dia=d.dia||hoje();
 st.entries.push({id:'ext'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),tipo:'variavel',mes:dia.slice(0,7),valor:v,prev:v,efet:v,
  descricao:String(d.descricao).slice(0,80),meio:null,grupo:'Gasto diário',diaGasto:dia});
 try{localStorage.setItem(k,JSON.stringify(st));localStorage.setItem(k+'__ts',String(Date.now()));}catch(e){return false;}
 try{if(window.AX&&AX.recarrega)AX.recarrega();}catch(e){}
 return true;}
function cxAplica(ev){var d=ev.dados||{},dia=d.dia||hoje();
 switch(ev.tipo){
  case 'captura':if(!d.t)return false;S.cap=S.cap||[];S.cap.unshift({t:String(d.t).slice(0,300),d:dia});return true;
  case 'agua':S.agua=S.agua||{};S.agua[dia]=(+S.agua[dia]||0)+1;return true;
  case 'habito':var h=(S.hab||[]).filter(function(x){return x.id===d.id;})[0];if(!h)return false;h.hist=h.hist||[];if(h.hist.indexOf(dia)<0)h.hist.push(dia);return true;
  case 'foco':var m=Math.max(1,Math.min(240,+d.min||0));vxData().sessions.push({id:'ext'+ev.id,day:dia,task:'extensao',minutes:m,result:String(d.tarefa||'foco pela extensão').slice(0,120)});return true;
  case 'prioridade':if(typeof plDia!=='function')return false;var x=plDia(dia),i=+d.i;if(!x.top[i])return false;x.top[i].ok=!!d.ok;return true;
  case 'gasto':return cxGasto(d);}
 return false;}
var cxRodando=false;
function nvCaixa(){if(cxRodando||!nv.user||!nv.cli||nv.est!=='ok')return;var b=nvBase();if(!b||b.u!==nv.user.id||b.ts==null)return;cxRodando=true;
 nv.cli.from('vertice_inbox').select('id,tipo,dados,criado').order('id',{ascending:true}).limit(100).then(function(r){
  if(r.error||!r.data||!r.data.length){cxRodando=false;return;}
  var feitos=cxFeitos(),ids=[],mudou=false,n=0;
  r.data.forEach(function(ev){ids.push(ev.id);if(feitos.indexOf(ev.id)>=0)return;if(cxAplica(ev)){mudou=true;n++;}});
  cxMarca(ids);if(mudou){grava();try{pinta();}catch(e){}vxMsg(n+' registro'+(n>1?'s':'')+' da extensão aplicado'+(n>1?'s':'')+'.');}
  nv.cli.from('vertice_inbox').delete().in('id',ids).then(function(){cxRodando=false;},function(){cxRodando=false;});
 },function(){cxRodando=false;});}
aoIniciar(function(){

setInterval(function(){if(document.visibilityState==='visible')nvCaixa();},30000);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(nvCaixa,1500);});
(function(){var e0=nvEstado;nvEstado=function(e){e0(e);if(e==='ok')setTimeout(nvCaixa,300);};})();

ler(); cicloNovo();
/* Semente da semana 23–29/11/2026: preenche só células vazias e cria os projetos uma vez. */
(function(){ try{
 var FLAG="seed|semana-2026-11-23"; S.tb=S.tb||{}; if(S.tb[FLAG]) return;
 var D=["2026-11-23","2026-11-24","2026-11-25","2026-11-26","2026-11-27","2026-11-28","2026-11-29"];
 var G={
  "06":["Estudo TRF3 6h30–8h","Estudo TRF3 6h30–8h","Estudo TRF3 6h30–8h","Estudo TRF3 6h30–8h","Estudo TRF3 6h30–8h","",""],
  "09":["Rota do dia · Bloco 1","Rota do dia · Bloco 1","Rota do dia · Bloco 1","Rota do dia · Bloco 1","Rota do dia · Bloco 1","Comprar máquina + itens","Estudo TRF3 · revisão"],
  "12":["Almoço · ligar natação","Almoço · Bloco 2","Almoço · Bloco 2","Almoço · Bloco 2","Almoço · Bloco 2","Almoço · descanso",""],
  "15":["Bloco 3 · fechar às 17h","Bloco 3 · fechar às 17h","Bloco 3 · fechar às 17h","Bloco 3 · fechar às 17h","Bloco 3 · fechar às 17h","Quarto: montar e fixar","Planejar semana 30/11"],
  "18":["Achar academia no trajeto","Natação (a confirmar)","Academia","Natação (a confirmar)","Livre","Livre","Livre"],
  "21":["Quarto: triar e descartar","Quarto: definir layout","Pesquisar máquina lavar","Quarto: guardar por zona","Livre · games","",""]
 };
 var f,i,id; for(f in G) for(i=0;i<7;i++){ id=D[i]+"|"+f; if(G[f][i]&&!S.tb[id]) S.tb[id]=G[f][i]; }
 var P=[
  {nome:"Casa nova · quarto pronto",criterion:"Quarto arrumado, cada coisa com lugar definido e máquina de lavar instalada.",
   passos:["Triar e descartar o que não fica","Definir o layout do quarto","Pesquisar e escolher a máquina de lavar","Comprar a máquina e os itens que faltam","Guardar tudo por zona","Montar e fixar o que faltar"]},
  {nome:"Rotina nova · corpo",criterion:"Natação e academia com dia e horário fixos na grade semanal.",
   passos:["Ligar para a natação: horários e preço","Achar academia no trajeto do trabalho","Visitar a academia e fechar plano","Lançar os horários fixos na grade"]}
 ];
 S.proj=Array.isArray(S.proj)?S.proj:[];
 var ativos=S.proj.filter(function(p){return p.est==="ativo";}).length, lim=(S.vx&&S.vx.limit)||3, n=0;
 P.forEach(function(q){
  if(S.proj.some(function(p){return p.nome===q.nome;})) return; n++;
  S.proj.push({id:"p"+Date.now()+n,nome:q.nome,criterion:q.criterion,prazo:"2026-11-29",
   passos:q.passos.map(function(t,k){return {vid:"s"+Date.now()+n+"_"+k,t:t,ok:false};}),
   aberto:hoje(),ult:hoje(),est:(ativos++<lim)?"ativo":"pausado"}); });
 S.tb[FLAG]="1"; grava();
}catch(e){ console.error("semente da semana:",e); } })();
});



