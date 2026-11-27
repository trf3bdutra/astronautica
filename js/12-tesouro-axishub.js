/* Tesouro: AxisHub (finanças), função AXRUN */
"use strict";
function AXRUN(document,AXD,MutationObserver){

/* ===== Armazenamento ===== */
const LS_KEY="sfp_bruno_v4";const _mem={};
const store={get(){try{return localStorage.getItem(LS_KEY);}catch(e){return _mem[LS_KEY]||null;}},
  set(v){try{localStorage.setItem(LS_KEY,v);}catch(e){_mem[LS_KEY]=v;}}};

/* ===== Helpers ===== */
const BRL=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const BRL0=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const fmt=n=>BRL.format(n||0), fmt0=n=>BRL0.format(Math.round(n||0));
const fmtN=n=>new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0}).format(Math.round(n||0));
function fmtK(n){n=Math.round(n||0);const a=Math.abs(n);if(a>=1e6)return (n/1e6).toFixed(1).replace(".",",")+"M";if(a>=1000)return (n/1000).toFixed(1).replace(".",",")+"k";return String(n);}
const pad=n=>String(n).padStart(2,"0"), uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const num=s=>{if(typeof s==="number")return s;return parseFloat(String(s||"").replace(/\./g,"").replace(",","."))||0;};
function monthKey(d){return d.getFullYear()+"-"+pad(d.getMonth()+1);}
function addMonths(k,n){const[y,m]=k.split("-").map(Number);return monthKey(new Date(y,m-1+n,1));}
function monthLabel(k){const[y,m]=k.split("-").map(Number);const s=new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});return s.charAt(0).toUpperCase()+s.slice(1);}
function monthShort(k){const[y,m]=k.split("-").map(Number);const s=new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"short"}).replace(".","");return s.charAt(0).toUpperCase()+s.slice(1)+" "+String(y).slice(2);}
function monthDiff(a,b){const[ay,am]=a.split("-").map(Number);const[by,bm]=b.split("-").map(Number);return(by-ay)*12+(bm-am);}
function cmp(a,b){return a<b?-1:a>b?1:0;}

/* Taxonomia completa (A Grande Planilha do Tesouro) */
const TAX={
  entrada:{label:"Receitas",grupos:{
    "Receitas":["Salário","Aluguel","Pensão","13º salário / Férias","PLR / Bônus / Comissão","Outros"]}},
  investimento:{label:"Investimentos",grupos:{
    "Investimentos":["Emergência","Educação","Aposentadoria","Outros projetos"]}},
  fixo:{label:"Despesas mensais fixas",grupos:{
    "Moradia / Habitação":["Aluguel","Condomínio","Financiamento casa","Diarista/Mensalista","Seguro da casa","IPTU"],
    "Educação":["Colégio","Faculdade","Idiomas / cursos"],
    "Transporte":["Prestação do carro","Seguro do carro","IPVA"],
    "Saúde":["Plano de saúde","Academia"],
    "Outros":["Seguro de vida","Empréstimos","Outros"]}},
  variavel:{label:"Despesas mensais variáveis",grupos:{
    "Habitação":["Luz","Internet / TV","Água","Gás","Telefone / celular","Outros"],
    "Transporte":["Combustível","Estacionamento","Taxi","Ônibus / metrô","Outros"],
    "Alimentação":["Supermercado","Feira / padaria","Outros"],
    "Lazer":["Viagens / Passeios","Cinema / teatro","Restaurantes / bares","Clube","Outros"],
    "Outros":["Tarifas Banco","Outros"]}},
  anual:{label:"Despesas anuais / eventuais",grupos:{
    "Educação":["Material escolar","Uniforme","Outros"],
    "Saúde":["Médico / Hospital","Medicamentos","Outros"],
    "Manutenção / prevenção":["Carro","Casa","Outros"],
    "Vestuário":["Roupas","Calçados","Acessórios","Outros"],
    "Cuidados pessoais":["Corte de cabelo","Estética / Manicure","Farmácia / Drogaria","Outros"],
    "Outros":["Presentes","Outros Impostos","Outros"]}}
};
const GMETA={
  "Receitas":{ic:"💵",cor:"#2f6f4e"},"Investimentos":{ic:"🌱",cor:"#1f6b46"},
  "Moradia / Habitação":{ic:"🏠",cor:"#e15a72"},"Habitação":{ic:"🏠",cor:"#e15a72"},
  "Alimentação":{ic:"🍽️",cor:"#e89a9a"},"Transporte":{ic:"🚲",cor:"#7fb0c0"},
  "Saúde":{ic:"❤️",cor:"#2d8aa0"},"Educação":{ic:"✏️",cor:"#3a4a7a"},
  "Lazer":{ic:"🎮",cor:"#b08bae"},"Vestuário":{ic:"👕",cor:"#9b7fae"},
  "Cuidados pessoais":{ic:"🧴",cor:"#c98a9a"},"Manutenção / prevenção":{ic:"🔧",cor:"#8a8a6a"},
  "Outros":{ic:"◇",cor:"#9a8f78"}
};
function gMeta(g){return GMETA[g]||{ic:"◇",cor:"#9a8f78"};}
const SECBASE={entrada:"#3f8f6b",investimento:"#2f6fb0",fixo:"#6e5aa8",variavel:"#c0338f",anual:"#d2772f"};
const SUBPAL=["#9a7b3f","#2f6f4e","#a8412f","#3a4a7a","#b08bae","#2d8aa0","#c98a9a","#7fb0c0","#8a8a6a","#9b7fae","#c47f3d","#5a8a6a"];
function subColor(sub){const s=String(sub||"");let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return SUBPAL[h%SUBPAL.length];}
function isDespesa(t){return t==="fixo"||t==="variavel"||t==="anual";}

/* ===== Estado ===== */
let state={entries:[],cards:[],plans:[],game:{}};
let mes=monthKey(new Date());
let annual=false;
let habitMode=false,activeHabitTab="habit",activeFinanceTab="mes",habitTableMin=false,moodMin=true,wkSideMin=true,selDay=null;
let qnFilter='todas',qnAlarmId=null,capFilter='todas',capEditId=null,wkFootTab='afazeres',wkFootMin=true;
let weekStart=new Date();
let seedWorld=null,activeSeedTab=null;
let anoSel=new Date().getFullYear();

function defaultsGame(g){
  g=g||{};
  if(g.passaporte==null)g.passaporte=0;
  if(!g.consignados)g.consignados=[
    {id:uid(),nome:"BB Consignado R$ 30.000",valor:1683.84,quitado:false,fim:"2028-04"},
    {id:uid(),nome:"BB Consignado R$ 10.000",valor:812.06,quitado:false,fim:"2026-10"},
    {id:uid(),nome:"BB Consignado R$ 20.000",valor:712.22,quitado:false,fim:"2030-01"},
    {id:uid(),nome:"BB Consignado R$ 6.900",valor:492.44,quitado:false,fim:"2027-11"}];
  if(!g.cheque)g.cheque={meta:3322.69,pago:0};
  if(!g.semCartao)g.semCartao=Array(30).fill(false);
  if(g.semCheque==null)g.semCheque=0;
  if(g.score==null)g.score=0;
  if(!g.habitos)g.habitos=[
    {id:uid(),txt:"Não usar delivery essa semana",eco:120,feito:false},
    {id:uid(),txt:"Levar marmita ao trabalho",eco:200,feito:false},
    {id:uid(),txt:"Sem compra por impulso",eco:150,feito:false},
    {id:uid(),txt:"Fazer mercado com lista",eco:100,feito:false},
    {id:uid(),txt:"Não parcelar nada novo",eco:0,feito:false},
    {id:uid(),txt:"Revisar o orçamento do mês",eco:0,feito:false}];
  if(!g.board)g.board=[];
  if(!g.boardLeanMig){g.board=[];g.boardLeanMig=true;}
  if(g.patrimonioBase==null)g.patrimonioBase=0;
  if(g.reservaGuardado==null)g.reservaGuardado=0;
  return g;
}

function load(){
  const raw=store.get();
  if(raw){try{state=JSON.parse(raw);}catch(e){}}
  if(!raw){seed();}
  state.entries=state.entries||[];state.cards=state.cards||[];state.plans=state.plans||[];
  state.faturas=state.faturas||[{cartao:"Itaú Platinum 0979",fech:"",venc:"23"},{cartao:"BB Smiles Infinite",fech:"",venc:""},{cartao:"BB Fácil Visa",fech:"",venc:""},{cartao:"Inter",fech:"",venc:"05"}];
  state.game=defaultsGame(state.game);
  state.habit=defaultsHabit(state.habit);
  state.asgard=defaultsAsgard(state.asgard);
  state.saude=defaultsSaude(state.saude);
  state.culture=defaultsCulture(state.culture);
  state.espelho=state.espelho||{};
  if(!state.planners)state.planners={};
  if(!raw)save();
}
function save(){store.set(JSON.stringify(state));scheduleSync();}

/* ===== Sincronização com Google Sheets (Apps Script Web App) ===== */
const SYNC_KEY="sfp_sync_url";
let syncUrl="";
try{syncUrl=localStorage.getItem(SYNC_KEY)||"";}catch(e){}
let _syncTimer=null;
function scheduleSync(){if(!syncUrl)return;clearTimeout(_syncTimer);_syncTimer=setTimeout(pushToSheets,900);}
function syncPayload(){
  const P={kind:"sfp",ts:Date.now()};
  // Lançamentos
  P.lancamentos=(state.entries||[]).map(e=>{
    const prev=num(e.prev!=null?e.prev:e.valor);const efet=e.efet!=null?num(e.efet):"";const dif=e.efet!=null?(num(e.efet)-prev):"";
    return {mes:e.mes,natureza:e.tipo,descricao:e.descricao||"",categoria:[e.grupo,e.sub].filter(Boolean).join(" › "),meio:e.meio||"",dataPrev:e.dPrev||"",dataReal:e.tipo==="investimento"?(e.status||""):(e.dReal||""),previsto:prev,efetivo:efet,diferenca:dif,recorrente:e.recorrente?"sim":""};
  });
  // Consignados
  P.consignados=((state.game&&state.game.consignados)||[]).map(c=>{
    const rest=c.fim?Math.max(0,monthDiff(mes,c.fim)+1):"";const saldo=rest!==""?num(c.valor)*rest:"";
    return {divida:c.nome,parcela:num(c.valor),restantes:c.quitado?0:rest,saldoDevedor:c.quitado?0:saldo,termino:c.fim||"",quitado:c.quitado?"sim":""};
  });
  // Parcelamentos
  P.parcelamentos=(state.cards||[]).map(c=>{
    const idx=monthDiff(c.inicio,mes)+1;const atual=(idx>=1&&idx<=c.parcelas)?idx:"";const rest=Math.max(0,c.parcelas-Math.max(0,idx));
    return {compra:c.descricao||"",cartao:c.bandeira||"",valorParcela:num(c.valor),atual:atual,total:c.parcelas,restantes:rest,saldoApagar:num(c.valor)*rest,inicio:c.inicio||""};
  });
  // Faturas
  P.faturas=(state.faturas||[]).map(f=>({cartao:f.cartao,fechamento:f.fech||"",vencimento:f.venc||""}));
  // Planos + roteiro + caixa
  P.planos=[];P.roteiro=[];P.caixa=[];
  (state.plans||[]).forEach(p=>{
    const inf=planInfo(p);const aporte=inf.total/(inf.parcelas||1);
    P.planos.push({titulo:p.titulo,tipo:p.tipo,categoria:[p.grupo,p.sub].filter(Boolean).join(" › "),meio:p.meio||"",dataPrev:p.dPrev||"",parcelas:inf.parcelas,inicio:inf.inicio,total:inf.total,aporteMes:aporte,ativo:p.ativo?"sim":""});
    if(p.tipo==="viagem"&&p.versoes){p.versoes.forEach(v=>{
      (v.roteiro||[]).forEach(s=>P.roteiro.push({viagem:p.titulo,versao:v.nome,dia:s.dia,atividade:s.atividade,custo:num(s.custo)}));
      (v.caixa||[]).forEach(c=>P.caixa.push({viagem:p.titulo,versao:v.nome,item:c.item,valor:num(c.valor)}));
    });}
  });
  // Metas
  const g=state.game||{};
  const metasDef=[
    {h:"Curto",nome:"Quitar cheque especial",cat:"Dívida",alvo:num(g.cheque&&g.cheque.meta),guard:num(g.cheque&&g.cheque.pago),prazo:"2026-06-30"},
    {h:"Curto",nome:"Reserva inicial (1 mês)",cat:"Reserva",alvo:Math.round(spendOf(mes))||3000,guard:num(g.reservaGuardado||0),prazo:"2026-09-30"},
    {h:"Longo",nome:"Nova York 2026",cat:"Viagem",alvo:30000,guard:(g.passaporte||0)*250,prazo:"2026-12-18"},
    {h:"Longo",nome:"Reserva de emergência",cat:"Reserva",alvo:15000,guard:num(g.reservaGuardado||0),prazo:"2027-06-01"},
    {h:"Longo",nome:"Patrimônio",cat:"Patrimônio",alvo:100000,guard:num(g.patrimonioBase||0),prazo:"2030-12-31"}
  ];
  P.metas=metasDef.map(m=>{const falta=Math.max(0,m.alvo-m.guard);const mr=monthsUntil(m.prazo);return {prazoTipo:m.h,meta:m.nome,categoria:m.cat,valorAlvo:m.alvo,guardado:m.guard,faltante:falta,prazo:m.prazo,mesesRestantes:mr,aporteMes:Math.round(falta/Math.max(1,mr)),progresso:m.alvo?Math.round(m.guard/m.alvo*100)+"%":"0%"};});
  // Indicadores
  P.indicadores=[
    ["Score",g.score||0],["Nível",nivelDe(g.score||0)[0]],
    ["Passaporte NY (células)",(g.passaporte||0)+"/120"],["Passaporte NY (guardado)",(g.passaporte||0)*250],
    ["Cheque especial — meta",num(g.cheque&&g.cheque.meta)],["Cheque especial — abatido",num(g.cheque&&g.cheque.pago)],
    ["Dias sem crédito",((g.semCartao||[]).filter(Boolean).length)+"/30"],["Dias seguidos no positivo",g.semCheque||0],
    ["Patrimônio inicial",num(g.patrimonioBase||0)],["Reserva guardada",num(g.reservaGuardado||0)],
    ["Renda líquida atual",incomeOf(mes)],["Economia ao quitar consignados",P.consignados.filter(c=>!c.quitado).reduce((s,c)=>s+c.parcela,0)]
  ];
  return P;
}
function pushToSheets(){if(!syncUrl)return;
  try{fetch(syncUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(syncPayload())});
    const t=document.getElementById("syncTxt");if(t)t.textContent="Drive ✓";}catch(e){}
}
function refreshSyncBadge(){const dot=document.getElementById("syncDot"),txt=document.getElementById("syncTxt");if(!dot)return;if(syncUrl){dot.classList.add("on");if(txt)txt.textContent="Drive";}else{dot.classList.remove("on");if(txt)txt.textContent="local";}}
const _syncBtn=document.getElementById("syncBtn");if(_syncBtn)_syncBtn.onclick=()=>{document.getElementById("syncInput").value=syncUrl;openModal("syncModal");};
document.getElementById("syncSave").onclick=()=>{syncUrl=document.getElementById("syncInput").value.trim();try{localStorage.setItem(SYNC_KEY,syncUrl);}catch(e){}refreshSyncBadge();if(syncUrl)pushToSheets();closeModals();};
document.getElementById("syncTest").onclick=()=>{syncUrl=document.getElementById("syncInput").value.trim();try{localStorage.setItem(SYNC_KEY,syncUrl);}catch(e){}refreshSyncBadge();pushToSheets();};
document.getElementById("syncClear").onclick=()=>{syncUrl="";try{localStorage.removeItem(SYNC_KEY);}catch(e){}refreshSyncBadge();closeModals();};

/* ===== Semente vazia ===== */
function seed(){
  /* versão publicada: começa vazia; os dados reais entram pelo botão Importar ou pela sincronização */
  state.entries=[];state.cards=[];state.plans=[];state.game=defaultsGame({});
}

/* ===== Cálculos ===== */
function entriesOf(k,t){return state.entries.filter(e=>e.tipo===t&&(e.recorrente||e.mes===k));}
function sumEntries(k,t){return entriesOf(k,t).reduce((s,e)=>s+num(e.valor),0);}
function cardLoad(k){let t=0;state.cards.forEach(c=>{const end=addMonths(c.inicio,c.parcelas-1);if(cmp(k,c.inicio)>=0&&cmp(k,end)<=0)t+=num(c.valor);});return t;}
function verTotal(v){return (v.roteiro||[]).reduce((s,x)=>s+num(x.custo),0)+(v.caixa||[]).reduce((s,x)=>s+num(x.valor),0);}
function planInfo(p){
  if(p.tipo==="viagem"&&p.versoes){const v=p.versoes[p.versaoAtiva||0]||{};return {total:verTotal(v),parcelas:v.parcelas||1,inicio:v.inicio||mes};}
  return {total:num(p.valor),parcelas:p.parcelas||1,inicio:p.inicio||mes};
}
function planLoad(k){let t=0;state.plans.forEach(p=>{if(!p.ativo)return;const inf=planInfo(p);const end=addMonths(inf.inicio,inf.parcelas-1);if(cmp(k,inf.inicio)>=0&&cmp(k,end)<=0)t+=inf.total/inf.parcelas;});return t;}
function incomeOf(k){return sumEntries(k,"entrada");}
function investOf(k){return sumEntries(k,"investimento");}
function spendOf(k){return sumEntries(k,"fixo")+sumEntries(k,"variavel")+sumEntries(k,"anual");}
function freeOf(k){return incomeOf(k)-spendOf(k)-investOf(k)-cardLoad(k)-planLoad(k);}

/* ===== Mês ===== */
let catOpen=false;
let ledgerEdit=false;
function fmtDate(s){if(!s)return"";const p=String(s).split("-");return p.length===3?`${p[2]}/${p[1]}`:"";}
function difInfo(e){if(e.efet==null)return null;const dif=num(e.efet)-num(e.prev!=null?e.prev:e.valor);const bom=e.tipo==="fixo"||e.tipo==="variavel"||e.tipo==="anual"?dif<=0:dif>=0;return{dif,bom};}
function renderLedger(){
  const el=document.getElementById("secEntradas");
  ["secFixos"].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML="";});
  const secs=[["Receitas","entrada",1],["Investimentos","investimento",1],["Despesas fixas","fixo",-1],["Despesas variáveis","variavel",-1],["Eventuais / anuais","anual",-1]];
  let h=`<div class="ledgerbar"><span class="lbt">Planilha do mês</span><div class="acts">${ledgerEdit?'<button class="vedit on" id="ledgerSave">✓ Salvar</button><button class="vedit ghost" id="ledgerCancel">Cancelar</button>':'<button class="vedit" id="ledgerEditBtn">✎ Editar células</button>'}</div></div>`;
  h+=`<div class="ctblwrap ledger"><table class="ctbl grouped fam2"><thead><tr><th>Lançamento</th><th>Subcategoria</th><th>Forma</th><th>Data prev.</th><th>Real / status</th><th class="num">Previsto</th><th class="num">Efetivo</th><th class="num">Diferença</th><th></th></tr></thead><tbody>`;
  secs.forEach(s=>h+=sectionRows(s[0],s[1],s[2]));
  const tot=t=>{let p=0,e=0;entriesOf(mes,t).forEach(x=>{p+=num(x.prev!=null?x.prev:x.valor);e+=(x.efet!=null?num(x.efet):0);});return{p,e};};
  const r=tot("entrada"),iv=tot("investimento"),fx=tot("fixo"),vr=tot("variavel"),an=tot("anual"),fat=cardLoad(mes);
  const resP=r.p-iv.p-(fx.p+vr.p+fat+an.p), resE=r.e-iv.e-(fx.e+vr.e+an.e);
  h+=`<tr class="ctot final"><td>Resultado do mês · Receitas − Investimentos − Despesas</td><td></td><td></td><td></td><td></td><td class="num">${fmt0(resP)}</td><td class="num">${fmt0(resE)}</td><td class="num"></td><td></td></tr>`;
  h+=`</tbody></table></div>`;
  el.innerHTML=h;
}
function entryRow(e,tc,isInv){
  const prev=num(e.prev!=null?e.prev:e.valor);
  const di=difInfo(e);
  const d2=isInv?(e.status||"—"):(fmtDate(e.dReal)||"—");
  if(ledgerEdit){
    const pv=(''+prev).replace('.',','), ev=(e.efet!=null?(''+num(e.efet)).replace('.',','):'');
    return `<tr class="erowx ed" style="--gc:${tc}"><td><input class="celledit" data-eid="${e.id}" data-f="descricao" value="${hesc(e.descricao||'')}" placeholder="descrição"></td><td><span class="catdot" style="background:var(--gc)"></span>${e.sub||"—"}</td><td>${e.meio||"—"}</td><td>${fmtDate(e.dPrev)||"—"}</td><td>${d2}</td><td class="num"><input class="celledit num" data-eid="${e.id}" data-f="prev" inputmode="decimal" value="${pv}"></td><td class="num"><input class="celledit num" data-eid="${e.id}" data-f="efet" inputmode="decimal" value="${ev}" placeholder="—"></td><td class="num">${di?(di.dif>0?'+':'')+fmt0(di.dif):"—"}</td><td><button class="editlink" data-del="${e.id}">×</button></td></tr>`;
  }
  return `<tr class="erowx" style="--gc:${tc}"><td>${e.descricao||"—"}${e.recorrente?' <em class="rectag">rec.</em>':''}</td><td><span class="catdot" style="background:var(--gc)"></span>${e.sub||"—"}</td><td>${e.meio||"—"}</td><td>${fmtDate(e.dPrev)||"—"}</td><td>${d2}</td><td class="num">${fmt0(prev)}</td><td class="num">${e.efet!=null?fmt0(num(e.efet)):"—"}</td><td class="num" style="color:${di?(di.bom?'var(--pos)':'var(--neg)'):'var(--ink-soft)'}">${di?(di.dif>0?'+':'')+fmt0(di.dif):"—"}</td><td><button class="editlink" data-del="${e.id}">×</button></td></tr>`;
}
function sectionRows(titulo,tipo,sign){
  const items=entriesOf(mes,tipo);
  const isInv=tipo==="investimento",isRec=tipo==="entrada";
  const P=e=>num(e.prev!=null?e.prev:e.valor), E=e=>(e.efet!=null?num(e.efet):0);
  const base=SECBASE[tipo]||"#9a8f78";
  const order=Object.keys((TAX[tipo]||{grupos:{}}).grupos);
  const groups={};items.forEach(e=>{const g=e.grupo||"Outros";(groups[g]=groups[g]||[]).push(e);});
  const ordered=order.filter(g=>groups[g]).concat(Object.keys(groups).filter(g=>!order.includes(g)));
  let faturas=[],faturaSum=0;
  if(tipo==="variavel"){faturas=state.cards.filter(c=>{const i=monthDiff(c.inicio,mes)+1;return i>=1&&i<=c.parcelas;});faturaSum=faturas.reduce((s,c)=>s+num(c.valor),0);}
  let cons=[],consSum=0;
  if(tipo==="fixo"){cons=(state.game.consignados||[]).filter(c=>!c.quitado&&c.fim&&cmp(mes,c.fim)<=0);consSum=cons.reduce((s,c)=>s+num(c.valor),0);}
  const sPrev=items.reduce((s,e)=>s+P(e),0)+faturaSum, sEfet=items.reduce((s,e)=>s+E(e),0);
  let ti=0;const tone=()=>`color-mix(in srgb, ${base} ${Math.max(45,100-(ti++)*12)}%, white)`;
  let h=`<tr class="gband" style="--secc:${base}"><td colspan="9"><div class="gbandinner"><span>${titulo}</span><b>${sign>0?'+':'−'}${fmt0(sPrev)}</b></div></td></tr>`;
  const hasAny=items.length||faturas.length||cons.length;
  if(faturas.length){const tc=tone();
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">💳</span>Faturas de cartão</td><td class="num">${fmt0(faturaSum)}</td><td class="num"></td><td class="num"></td><td></td></tr>`;
    faturas.forEach(c=>{const idx=monthDiff(c.inicio,mes)+1;h+=`<tr class="erowx" style="--gc:${tc}"><td>${c.descricao||"Fatura"} <em class="rectag">${c.bandeira}</em></td><td><span class="catdot" style="background:var(--gc)"></span>${c.bandeira}</td><td>Cartão</td><td>—</td><td>${idx}/${c.parcelas}</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">—</td><td class="num">—</td><td></td></tr>`;});}
  ordered.forEach(g=>{const m=gMeta(g);const grp=groups[g];const tc=tone();
    const gp=grp.reduce((s,e)=>s+P(e),0), ge=grp.reduce((s,e)=>s+E(e),0);
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">${m.ic}</span>${g}</td><td class="num">${fmt0(gp)}</td><td class="num">${ge?fmt0(ge):""}</td><td class="num">${ge?fmt0(ge-gp):""}</td><td></td></tr>`;
    grp.forEach(e=>{const prev=P(e);const di=difInfo(e);const d2=isInv?(e.status||"—"):(fmtDate(e.dReal)||"—");
      h+=`<tr class="erowx" style="--gc:${tc}"><td>${e.descricao||"—"}${e.recorrente?' <em class="rectag">rec.</em>':''}</td><td><span class="catdot" style="background:var(--gc)"></span>${e.sub||"—"}</td><td>${e.meio||"—"}</td><td>${fmtDate(e.dPrev)||"—"}</td><td>${d2}</td><td class="num">${fmt0(prev)}</td><td class="num">${e.efet!=null?fmt0(num(e.efet)):"—"}</td><td class="num" style="color:${di?(di.bom?'var(--pos)':'var(--neg)'):'var(--ink-soft)'}">${di?(di.dif>0?'+':'')+fmt0(di.dif):"—"}</td><td><button class="editlink" data-del="${e.id}">×</button></td></tr>`;});});
  if(cons.length){const tc=tone();
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">🔒</span>Consignados · em folha</td><td class="num">${fmt0(consSum)}</td><td class="num"></td><td class="num"></td><td></td></tr>`;
    cons.forEach(c=>{const left=monthDiff(mes,c.fim)+1;h+=`<tr class="erowx folha" style="--gc:${tc}"><td>${c.nome}</td><td><span class="catdot" style="background:var(--gc)"></span>em folha</td><td>Folha</td><td>—</td><td>${left} rest.</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">—</td><td class="num">—</td><td></td></tr>`;});}
  {const sd=sEfet-sPrev;h+=`<tr class="ctot"><td>Total ${titulo}</td><td></td><td></td><td></td><td></td><td class="num">${fmt0(sPrev)}</td><td class="num">${fmt0(sEfet)}</td><td class="num">${fmt0(sd)}</td><td></td></tr>`;}
  if(cons.length)h+=`<tr class="folhanote"><td colspan="9">🔒 Consignados (${fmt0(consSum)}/mês) descontados na folha — fora do líquido, não entram no total nem no saldo.</td></tr>`;
  return h;
}
function secList(elId,titulo,tipo,sign){
  const el=document.getElementById(elId);const items=entriesOf(mes,tipo);
  const isInv=tipo==="investimento",isRec=tipo==="entrada",isDesp=!isInv&&!isRec;
  const hPrev=isInv?"Aporte prev.":"Valor prev.";
  const hEfet=isInv?"Aporte real.":"Valor efet.";
  const hD1=isDesp?"Vencimento":"Data prev.";
  const hD2=isRec?"Data Rcto.":isInv?"Status":"Data Pgto.";
  const P=e=>num(e.prev!=null?e.prev:e.valor), E=e=>(e.efet!=null?num(e.efet):0);
  const base=SECBASE[tipo]||"#9a8f78";
  const order=Object.keys((TAX[tipo]||{grupos:{}}).grupos);
  const groups={};items.forEach(e=>{const g=e.grupo||"Outros";(groups[g]=groups[g]||[]).push(e);});
  const ordered=order.filter(g=>groups[g]).concat(Object.keys(groups).filter(g=>!order.includes(g)));
  let faturas=[],faturaSum=0;
  if(tipo==="variavel"){faturas=state.cards.filter(c=>{const i=monthDiff(c.inicio,mes)+1;return i>=1&&i<=c.parcelas;});faturaSum=faturas.reduce((s,c)=>s+num(c.valor),0);}
  let cons=[],consSum=0;
  if(tipo==="fixo"){cons=(state.game.consignados||[]).filter(c=>!c.quitado&&c.fim&&cmp(mes,c.fim)<=0);consSum=cons.reduce((s,c)=>s+num(c.valor),0);}
  const sPrevE=items.reduce((s,e)=>s+P(e),0), sEfetE=items.reduce((s,e)=>s+E(e),0);
  const sPrev=sPrevE+faturaSum, sEfet=sEfetE;
  let ti=0;const tone=()=>`color-mix(in srgb, var(--bc) ${Math.max(45,100-(ti++)*12)}%, white)`;
  let h=`<div class="ctblwrap"><table class="ctbl grouped fam" style="--bc:${base}"><thead><tr><th>Lançamento</th><th>Subcategoria</th><th>Forma</th><th>${hD1}</th><th>${hD2}</th><th class="num">${hPrev}</th><th class="num">${hEfet}</th><th class="num">Diferença</th><th></th></tr></thead><tbody>`;
  h+=`<tr class="gband"><td colspan="9"><div class="gbandinner"><span>${titulo}</span><b>${sign>0?'+':'−'}${fmt0(sPrev)}</b></div></td></tr>`;
  const hasAny=items.length||faturas.length||cons.length;
  if(!hasAny)h+=`<tr><td colspan="9" class="cempty">Nada por aqui. Toque em ＋ Lançamento, no topo.</td></tr>`;
  if(faturas.length){const tc=tone();
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">💳</span>Faturas de cartão</td><td class="num">${fmt0(faturaSum)}</td><td class="num"></td><td class="num"></td><td></td></tr>`;
    faturas.forEach(c=>{const idx=monthDiff(c.inicio,mes)+1;h+=`<tr class="erowx" style="--gc:${tc}"><td>${c.descricao||"Fatura"} <em class="rectag">${c.bandeira}</em></td><td><span class="catdot" style="background:var(--gc)"></span>${c.bandeira}</td><td>Cartão</td><td>—</td><td>${idx}/${c.parcelas}</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">—</td><td class="num">—</td><td></td></tr>`;});}
  ordered.forEach(g=>{const m=gMeta(g);const grp=groups[g];const tc=tone();
    const gp=grp.reduce((s,e)=>s+P(e),0), ge=grp.reduce((s,e)=>s+E(e),0);
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">${m.ic}</span>${g}</td><td class="num">${fmt0(gp)}</td><td class="num">${ge?fmt0(ge):""}</td><td class="num">${ge?fmt0(ge-gp):""}</td><td></td></tr>`;
    grp.forEach(e=>{const prev=P(e);const di=difInfo(e);const d2=isInv?(e.status||"—"):(fmtDate(e.dReal)||"—");
      h+=`<tr class="erowx" style="--gc:${tc}"><td>${e.descricao||"—"}${e.recorrente?' <em class="rectag">rec.</em>':''}</td><td><span class="catdot" style="background:var(--gc)"></span>${e.sub||"—"}</td><td>${e.meio||"—"}</td><td>${fmtDate(e.dPrev)||"—"}</td><td>${d2}</td><td class="num">${fmt0(prev)}</td><td class="num">${e.efet!=null?fmt0(num(e.efet)):"—"}</td><td class="num" style="color:${di?(di.bom?'var(--pos)':'var(--neg)'):'var(--ink-soft)'}">${di?(di.dif>0?'+':'')+fmt0(di.dif):"—"}</td><td><button class="editlink" data-del="${e.id}">×</button></td></tr>`;});});
  if(cons.length){const tc=tone();
    h+=`<tr class="grow" style="--gc:${tc}"><td colspan="5"><span class="gic">🔒</span>Consignados · em folha</td><td class="num">${fmt0(consSum)}</td><td class="num"></td><td class="num"></td><td></td></tr>`;
    cons.forEach(c=>{const left=monthDiff(mes,c.fim)+1;h+=`<tr class="erowx folha" style="--gc:${tc}"><td>${c.nome}</td><td><span class="catdot" style="background:var(--gc)"></span>em folha</td><td>Folha</td><td>—</td><td>${left} rest.</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">—</td><td class="num">—</td><td></td></tr>`;});}
  if(hasAny){const sd=sEfet-sPrev;h+=`<tr class="ctot"><td>Total ${titulo}</td><td></td><td></td><td></td><td></td><td class="num">${fmt0(sPrev)}</td><td class="num">${fmt0(sEfet)}</td><td class="num">${fmt0(sd)}</td><td></td></tr>`;}
  if(cons.length)h+=`<tr class="folhanote"><td colspan="9">🔒 Consignados (${fmt0(consSum)}/mês) são descontados na folha — já fora do líquido, não entram no total acima nem no saldo.</td></tr>`;
  h+=`</tbody></table></div>`;
  el.innerHTML=h;
}
function entryPrev(e){return num(e.prev!=null?e.prev:e.valor);}
function entryEfet(e){return e.efet!=null?num(e.efet):entryPrev(e);}
function sumBy(tipo,fn){return entriesOf(mes,tipo).reduce((s,e)=>s+fn(e),0);}
function renderMes(){
  renderLedger();
  const inPrev=sumBy("entrada",entryPrev),inEfet=sumBy("entrada",entryEfet);
  const despPrev=sumBy("fixo",entryPrev)+sumBy("variavel",entryPrev)+sumBy("anual",entryPrev);
  const despEfet=sumBy("fixo",entryEfet)+sumBy("variavel",entryEfet)+sumBy("anual",entryEfet);
  const pc=cardLoad(mes);
  const outPrev=despPrev+pc,outEfet=despEfet+pc;
  const bal=inEfet-outEfet;
  const big=document.getElementById("balBig");big.textContent=fmt0(bal);
  big.style.color=bal>=0?"var(--pos-soft)":"var(--neg-soft)";
  document.getElementById("balInPrev").textContent=fmt0(inPrev);
  document.getElementById("balInEfet").textContent=fmt0(inEfet);
  document.getElementById("balOutPrev").textContent=fmt0(outPrev);
  document.getElementById("balOutEfet").textContent=fmt0(outEfet);
  renderCategorias();
  const mc=document.getElementById("secMesCompromissos");if(mc)mc.innerHTML="";
}
function renderMesCompromissos(){
  const el=document.getElementById("secMesCompromissos");if(!el)return;
  const live=state.cards.filter(c=>{const idx=monthDiff(c.inicio,mes)+1;return idx>=1&&idx<=c.parcelas;});
  const cons=(state.game.consignados||[]).filter(c=>!c.quitado&&c.fim&&cmp(mes,c.fim)<=0);
  if(!live.length&&!cons.length){el.innerHTML="";return;}
  const totConta=cardLoad(mes);
  let h=`<div class="sec-h"><span class="t">Faturas e compromissos do mês</span><span class="sum neg">−${fmt0(totConta)}</span></div>`;
  h+=`<div class="ctblwrap"><table class="ctbl grouped"><thead><tr><th>Cartão / compromisso</th><th>Parcela</th><th class="num">Valor no mês</th><th></th></tr></thead><tbody>`;
  const byCard={};live.forEach(c=>{(byCard[c.bandeira||"Cartão"]=byCard[c.bandeira||"Cartão"]||[]).push(c);});
  Object.keys(byCard).forEach(b=>{const es=byCard[b];const v=es.reduce((s,c)=>s+num(c.valor),0);
    h+=`<tr class="grow" style="--gc:var(--brass)"><td colspan="2"><span class="gic">💳</span>${b}</td><td class="num">${fmt0(v)}</td><td></td></tr>`;
    es.forEach(c=>{const idx=monthDiff(c.inicio,mes)+1;h+=`<tr class="erowx" style="--gc:var(--brass)"><td>${c.descricao||"—"}</td><td>${idx}/${c.parcelas}</td><td class="num">${fmt0(num(c.valor))}</td><td></td></tr>`;});});
  if(live.length)h+=`<tr class="ctot"><td>Total que sai da conta</td><td></td><td class="num">${fmt0(totConta)}</td><td></td></tr>`;
  if(cons.length){const ct=cons.reduce((s,c)=>s+num(c.valor),0);
    h+=`<tr class="grow" style="--gc:#a8412f"><td colspan="2"><span class="gic">🔒</span>Consignados — descontados em folha</td><td class="num">${fmt0(ct)}</td><td></td></tr>`;
    cons.forEach(c=>{const left=monthDiff(mes,c.fim)+1;h+=`<tr class="erowx" style="--gc:#a8412f"><td>${c.nome}</td><td>${left} rest.</td><td class="num">${fmt0(num(c.valor))}</td><td></td></tr>`;});}
  h+=`</tbody></table></div><p class="intro" style="margin:4px 2px 0">Os cartões saem da conta neste mês; os consignados já vêm descontados na folha.</p>`;
  el.innerHTML=h;
}
function bucket503(e){
  if(e.tipo==='investimento')return 'fut';
  const g=e.grupo||'Outros';const sub=e.sub||'';
  if(/empr[eé]stimo|consignad/i.test(sub)||/empr[eé]stimo/i.test(g))return 'fut';
  const WANT={"Lazer":1,"Vestuário":1,"Cuidados pessoais":1};
  if(WANT[g])return 'want';
  return 'need';
}
function renderCategorias(){
  const el=document.getElementById("secCategorias");if(!el)return;
  const renda=entriesOf(mes,'entrada').reduce((s,e)=>s+num(e.prev!=null?e.prev:e.valor),0);
  let need=0,want=0,fut=0;
  ['fixo','variavel','anual'].forEach(t=>entriesOf(mes,t).forEach(e=>{const v=num(e.prev!=null?e.prev:e.valor);const b=bucket503(e);if(b==='want')want+=v;else if(b==='fut')fut+=v;else need+=v;}));
  entriesOf(mes,'investimento').forEach(e=>{fut+=num(e.prev!=null?e.prev:e.valor);});
  want+=cardLoad(mes);
  const buckets=[
    {k:'need',nm:'Necessidades',tg:50,val:need,cor:'#2d8aa0',hint:'moradia · contas · mercado · saúde'},
    {k:'want',nm:'Desejos',tg:30,val:want,cor:'#c0338f',hint:'lazer · restaurantes · cartão'},
    {k:'fut',nm:'Futuro',tg:20,val:fut,cor:'#2f6f4e',hint:'investir · reserva · quitar dívida'}
  ];
  let h=`<div class="rule503"><div class="rhd"><div class="rt">Regra 50 · 30 · 20 <small>vs. seu mês</small></div><div class="rbase">renda do mês<b>${fmt0(renda)}</b></div></div>`;
  if(renda<=0){
    h+=`<div class="rempty">Lance suas <b>receitas</b> do mês para comparar seus gastos ao padrão 50 · 30 · 20.</div></div>`;
    el.innerHTML=h;return;
  }
  buckets.forEach(b=>{
    const pct=b.val/renda*100,ideal=renda*b.tg/100,fillW=Math.min(100,pct);
    let st,cls;
    if(b.k==='fut'){if(pct>=b.tg){st='no caminho';cls='ok';}else{st='abaixo do ideal';cls='under';}}
    else{if(pct<=b.tg){st='dentro';cls='ok';}else{st='acima do ideal';cls='over';}}
    h+=`<div class="r3row"><div class="r3hd"><div class="r3n"><span class="sw" style="background:${b.cor}"></span>${b.nm} <em>${b.tg}% · ${b.hint}</em></div><div class="r3v">${Math.round(pct)}%</div></div>`;
    h+=`<div class="r3bar"><i style="width:${fillW}%;background:${b.cor}"></i><span class="mk" style="left:${b.tg}%"></span></div>`;
    h+=`<div class="r3foot"><span class="tg">real ${fmt0(b.val)} · ideal ${fmt0(ideal)}</span><span class="st ${cls}">${st}</span></div></div>`;
  });
  const sobra=renda-need-want-fut;
  h+=`<div class="rsum"><span class="l">${sobra>=0?'Não alocado / folga':'Estourou a renda em'}</span><span class="v" style="color:${sobra>=0?'var(--pos)':'var(--neg)'}">${fmt0(Math.abs(sobra))}</span></div>`;
  h+=`<div class="rnote">Despesas do mês classificadas em necessidades, desejos (inclui faturas de cartão) e futuro (aportes de investimento). A linha preta marca a meta de cada balde.</div></div>`;
  el.innerHTML=h;
}

/* ===== Anual ===== */
function renderAnual(){
  const el=document.getElementById("anualView");
  const y=anoSel;
  const mns=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const keys=mns.map((_,i)=>y+"-"+pad(i+1));
  const rec=keys.map(incomeOf),gas=keys.map(spendOf),car=keys.map(cardLoad),pl=keys.map(planLoad);
  const sal=keys.map((k,i)=>rec[i]-gas[i]-car[i]-pl[i]);
  let acc=0;const ac=sal.map(s=>acc+=s);
  function tr(lbl,arr,cls){let r=`<tr class="${cls||''}"><td>${lbl}</td>`;arr.forEach(v=>{r+=`<td class="${v<0?'neg-c':''}" title="${fmt0(v)}">${fmtK(v)}</td>`;});return r+"</tr>";}
  let h=`<div class="yearbar"><span class="vsection" style="margin:0">📊 Visão anual</span><span class="yearpick"><button data-anom="-1">‹</button><b>${y}</b><button data-anom="1">›</button></span></div>`;
  h+=`<div class="annual"><table><thead><tr><th>${y}</th>`;
  mns.forEach(m=>h+=`<th>${m}</th>`);h+=`</tr></thead><tbody>`;
  h+=tr("Receitas",rec);h+=tr("Gastos",gas);h+=tr("Cartões",car);h+=tr("Viagens/planos",pl);
  h+=tr("Saldo",sal,"tot");h+=tr("Acumulado",ac,"tot");
  h+=`</tbody></table></div><p class="intro" style="margin-top:10px">Ano de ${y}, mês a mês. As receitas recorrentes e parcelas se distribuem automaticamente.</p>`;
  el.innerHTML=h;
}
function applyView(){
  document.getElementById("mesNormal").style.display=annual?"none":"block";
  document.getElementById("anualView").style.display=annual?"block":"none";
  const vt2=document.getElementById("viewTog");if(vt2){vt2.classList.toggle("on",annual);vt2.textContent=annual?"Mês":"Ano";}
  updateHeader();
  if(annual)renderAnual();
}
function curTab(){const t=document.querySelector('.tab[aria-selected="true"]');return t?t.dataset.tab:"mes";}
function updateHeader(){
  const prev=document.getElementById("prevM"),next=document.getElementById("nextM"),vt=document.getElementById("viewTog"),lab=document.getElementById("monthLabel");
  if(!prev||!next||!vt||!lab)return;
  prev.style.visibility="visible";next.style.visibility="visible";
  if(seedWorld){vt.style.visibility="hidden";prev.style.visibility="hidden";next.style.visibility="hidden";lab.textContent=SEED_WORLDS[seedWorld].nome;return;}
  if(habitMode){vt.style.visibility="hidden";lab.textContent=monthLabel(mes);return;}
  vt.style.visibility=(curTab()==="mes")?"visible":"hidden";
  lab.textContent=annual?(anoSel+" · ano"):monthLabel(mes);
}

/* ===== Cartão ===== */
function commitmentsList(){
  const arr=[];
  (state.game.consignados||[]).forEach(c=>{if(c.quitado)return;arr.push({tipo:"consignado",id:c.id,nome:c.nome,valor:num(c.valor),inicio:mes,fim:c.fim||null});});
  state.cards.forEach(c=>{arr.push({tipo:"parcelamento",id:c.id,nome:c.descricao,band:c.bandeira,valor:num(c.valor),inicio:c.inicio,fim:addMonths(c.inicio,c.parcelas-1)});});
  return arr;
}
function renderCompromissos(){
  const g=state.game;const ativos=(g.consignados||[]).filter(c=>!c.quitado);
  const totC=ativos.reduce((s,c)=>s+num(c.valor),0);
  // ----- Consignados: Dívida | Parcela | Restantes | Saldo devedor | Término -----
  let hc=`<div class="sec-h"><span class="t">Compromissos e consignados</span><span class="sum neg">−${fmt0(totC)}</span></div>`;
  hc+=`<div class="ctblwrap"><table class="ctbl"><thead><tr><th>Dívida</th><th class="num">Parcela</th><th class="num">Restantes</th><th class="num">Saldo devedor</th><th>Término</th><th></th></tr></thead><tbody>`;
  if(!(g.consignados||[]).length)hc+=`<tr><td colspan="6" class="cempty">Nenhum consignado.</td></tr>`;
  else g.consignados.forEach(c=>{const rest=c.fim?Math.max(0,monthDiff(mes,c.fim)+1):null;const saldo=rest!=null?num(c.valor)*rest:null;
    hc+=`<tr style="${c.quitado?'opacity:.45':''}"><td>${c.nome}</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">${c.quitado?0:(rest!=null?rest:"—")}</td><td class="num">${c.quitado?fmt0(0):(saldo!=null?fmt0(saldo):"—")}</td><td>${c.fim?monthShort(c.fim):"a definir"}</td><td><button class="editlink" data-editcons="${c.id}">editar</button></td></tr>`;});
  const saldoTot=(g.consignados||[]).filter(c=>!c.quitado).reduce((s,c)=>s+(c.fim?num(c.valor)*Math.max(0,monthDiff(mes,c.fim)+1):0),0);
  hc+=`<tr class="ctot"><td>TOTAL</td><td class="num">${fmt0(totC)}</td><td class="num"></td><td class="num">${saldoTot?fmt0(saldoTot):"—"}</td><td></td><td></td></tr>`;
  hc+=`</tbody></table></div>`;
  hc+=`<div class="libpanel"><div class="presa"><div class="lbl">Economia futura</div><div class="n" style="color:var(--pos)">${fmt0(totC)}</div></div><div class="livre"><div class="lbl">Renda disponível futura</div><div class="n" style="color:var(--pos)">${fmt0(incomeOf(mes)+totC)}</div></div></div>`;
  hc+=`<div class="tb" style="font-size:11.5px;color:var(--ink-soft);margin-top:8px;line-height:1.5">Some a renda líquida de hoje à economia que cada consignado devolve ao terminar.</div>`;
  hc+=`<button class="addmini" id="consNew">+ Adicionar compromisso</button>`;
  document.getElementById("secConsignados").innerHTML=hc;
  // ----- Parcelamentos: Compra | Cartão | Valor parcela | Parc. atual | Total parc. | Restantes | Saldo a pagar -----
  const totP=cardLoad(mes);
  let hp=`<div class="sec-h"><span class="t">Cartões e parcelas futuras</span><span class="sum neg">−${fmt0(totP)}</span></div>`;
  hp+=`<div class="ctblwrap"><table class="ctbl"><thead><tr><th>Compra</th><th>Cartão</th><th class="num">Parcela</th><th class="num">Atual</th><th class="num">Total</th><th class="num">Rest.</th><th class="num">Saldo</th><th></th></tr></thead><tbody>`;
  if(!state.cards.length)hp+=`<tr><td colspan="8" class="cempty">Nenhum parcelamento. Toque abaixo para adicionar.</td></tr>`;
  else state.cards.forEach(c=>{const idx=monthDiff(c.inicio,mes)+1;const live=idx>=1&&idx<=c.parcelas;const rest=Math.max(0,c.parcelas-Math.max(0,idx));const saldo=num(c.valor)*rest;
    hp+=`<tr style="${live?'':'opacity:.5'}"><td>${c.descricao||"—"}</td><td>${c.bandeira||"—"}</td><td class="num">${fmt0(num(c.valor))}</td><td class="num">${live?idx:"–"}</td><td class="num">${c.parcelas}</td><td class="num">${rest}</td><td class="num">${fmt0(saldo)}</td><td><button class="editlink" data-delc="${c.id}">×</button></td></tr>`;});
  hp+=`<tr class="ctot"><td>TOTAL no mês</td><td></td><td class="num">${fmt0(totP)}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
  hp+=`</tbody></table></div>`;
  document.getElementById("secParcelamentos").innerHTML=hp;
  // ----- Calendário de faturas -----
  let hf=`<div class="sec-h"><span class="t">Calendário de faturas</span></div>`;
  hf+=`<div class="ctblwrap"><table class="ctbl"><thead><tr><th>Cartão</th><th class="num">Fechamento (dia)</th><th class="num">Vencimento (dia)</th></tr></thead><tbody>`;
  (state.faturas||[]).forEach((f,i)=>{hf+=`<tr><td>${f.cartao}</td><td class="num"><input class="dayin" data-fat="${i}:fech" inputmode="numeric" maxlength="2" value="${f.fech||""}" placeholder="–"></td><td class="num"><input class="dayin" data-fat="${i}:venc" inputmode="numeric" maxlength="2" value="${f.venc||""}" placeholder="–"></td></tr>`;});
  hf+=`</tbody></table></div><div class="tb" style="font-size:11.5px;color:var(--ink-soft);margin-top:8px;line-height:1.5">Comprar logo após o <b>fechamento</b> dá quase 40 dias até o <b>vencimento</b>.</div>`;
  document.getElementById("secFaturas").innerHTML=hf;
  // timeline
  document.getElementById("secTimeline").innerHTML=renderTimeline();
}
function consignadoMes(k){return (state.game.consignados||[]).filter(c=>!c.quitado&&c.fim&&cmp(k,c.fim)<=0&&cmp(k,mes)>=0).reduce((s,c)=>s+num(c.valor),0);}
function renderTimeline(){
  const rows=[];
  (state.game.consignados||[]).forEach(c=>{if(c.quitado)return;rows.push({nome:c.nome,tipo:"consignado",inicio:mes,fim:c.fim||null,val:num(c.valor)});});
  const byCard={};state.cards.forEach(c=>{const k=c.bandeira||"Cartão";(byCard[k]=byCard[k]||[]).push(c);});
  Object.keys(byCard).forEach(band=>{const es=byCard[band];let ini=null,fim=null;
    es.forEach(c=>{const s=c.inicio,e=addMonths(c.inicio,c.parcelas-1);if(ini==null||cmp(s,ini)<0)ini=s;if(fim==null||cmp(e,fim)>0)fim=e;});
    rows.push({nome:band,tipo:"parcelamento",inicio:ini,fim:fim,entries:es});});
  const N=18;const cols=[];for(let i=0;i<N;i++)cols.push(addMonths(mes,i));
  function valNow(row){if(row.tipo==="consignado")return row.val;return row.entries.reduce((s,c)=>{const idx=monthDiff(c.inicio,mes)+1;return s+((idx>=1&&idx<=c.parcelas)?num(c.valor):0);},0);}
  const live=rows.map(row=>({row,rem:row.fim?monthDiff(mes,row.fim)+1:N})).filter(x=>x.rem>0).sort((a,b)=>b.rem-a.rem);
  let h=`<div class="tk">`;
  if(!live.length)h+=`<div class="tkempty">Nenhum compromisso ativo. Cartões parcelados e consignados aparecem aqui como faixas de duração.</div>`;
  live.forEach(({row,rem})=>{
    const col=row.tipo==="consignado"?"#a8412f":"var(--brass)";
    const startOff=Math.max(0,monthDiff(mes,row.inicio));
    const endOff=Math.min(N-1,row.fim?monthDiff(mes,row.fim):N-1);
    const leftPct=startOff/N*100, widthPct=Math.max(7,(endOff-startOff+1)/N*100);
    const vn=valNow(row);
    h+=`<div class="tkrow"><div class="tkh"><span class="tkdot" style="background:${col}"></span><span class="tknm">${row.nome}</span><span class="tkval">${vn?fmt0(vn):"—"}<small>/mês</small></span></div>`;
    h+=`<div class="tktrack"><div class="tkfill" style="left:${leftPct}%;width:${widthPct}%;background:linear-gradient(90deg,${col},color-mix(in srgb,${col} 60%,white))"><span class="tkrem">${rem>N?rem+'+':rem} ${rem===1?'mês':'meses'}</span></div></div></div>`;
  });
  if(live.length)h+=`<div class="tkscale">`+cols.map((k,i)=>`<span>${i%3===0?monthShort(k).split(" ")[0]:""}</span>`).join("")+`</div>`;
  const loadNow=cardLoad(mes)+consignadoMes(mes), freeNow=freeOf(mes);
  h+=`<div class="tksum"><div class="tksumc load"><div class="sl">Compromissos neste mês</div><div class="sv">${fmt0(loadNow)}</div><div class="ss">cartões + consignados</div></div><div class="tksumc free"><div class="sl">Saldo livre previsto</div><div class="sv">${fmt0(freeNow)}</div><div class="ss">${monthShort(mes)}</div></div></div>`;
  h+=`</div>`;
  return h;
}

/* ===== Planejar ===== */
function renderPlanos(){
  const el=document.getElementById("planList");
  if(!state.plans.length){el.innerHTML=`<div class="empty" style="padding:18px 4px">Nenhum plano ainda.</div>`;return;}
  let h="";state.plans.forEach(p=>{h+=(p.tipo==="viagem"&&p.versoes)?renderViagem(p):renderSimple(p);});
  el.innerHTML=h;
}
function renderSimple(p){
  const parc=num(p.valor)/(p.parcelas||1);const ic=p.tipo==="compra"?"🛍️":"◇";
  return `<div class="plan ${p.ativo?'':'off'}"><div class="ph"><div><div class="ttl">${ic} ${p.titulo}</div><div class="tag">${p.parcelas}x · início ${monthShort(p.inicio||mes)}</div></div><div class="total">${fmt0(num(p.valor))}<small>${fmt0(parc)}/mês</small></div></div><div class="impact">Pesa <b>${fmt0(parc)}</b>/mês de <b>${monthShort(p.inicio||mes)}</b> a <b>${monthShort(addMonths(p.inicio||mes,(p.parcelas||1)-1))}</b>.</div><div class="pacts"><button class="${p.ativo?'on-b':''}" data-toggle="${p.id}">${p.ativo?'Ativo na previsão':'Pausado'}</button><button data-realizar="${p.id}">Realizar</button><button data-delp="${p.id}">Remover</button></div></div>`;
}
function renderViagem(p){
  const vi=p.versaoAtiva||0;const v=p.versoes[vi]||{};
  const rt=(v.roteiro||[]).reduce((s,x)=>s+num(x.custo),0);
  const cx=(v.caixa||[]).reduce((s,x)=>s+num(x.valor),0);
  const total=rt+cx;const parc=total/(v.parcelas||1);
  const pills=p.versoes.map((ver,i)=>`<button class="vpill ${i===vi?'on':''}" data-ver="${p.id}:${i}">${ver.nome}<small>${fmt0(verTotal(ver))}</small></button>`).join("");
  let rrows=(v.roteiro||[]).map(s=>`<tr><td class="dia">${s.dia}</td><td>${s.atividade}</td><td class="num">${fmt0(s.custo)}</td><td><button class="trash" data-delstep="${p.id}:${s.id}">×</button></td></tr>`).join("");
  if(!rrows)rrows='<tr><td colspan="4" class="vempty">Sem etapas. Toque em "+ etapa" para montar o roteiro.</td></tr>';
  let crows=(v.caixa||[]).map(c=>`<tr><td>${c.item}</td><td class="num">${fmt0(c.valor)}</td><td><button class="trash" data-delcx="${p.id}:${c.id}">×</button></td></tr>`).join("");
  if(!crows)crows='<tr><td colspan="3" class="vempty">Sem itens no caixa ainda.</td></tr>';
  return `<div class="vtrip ${p.ativo?'':'off'}">
    <div class="vth"><div><div class="vtt">✈️ ${p.titulo}</div><div class="vsub">${v.parcelas||1}x · início ${monthShort(v.inicio||mes)}</div></div><div class="vtotal">${fmt0(total)}<small>${fmt0(parc)}/mês</small></div></div>
    <div class="vversions">${pills}<button class="vnew" data-vnew="${p.id}">+ versão</button></div>
    <div class="vsection">📅 Roteiro dia a dia</div>
    <table class="vtable"><thead><tr><th>Dia</th><th>Atividade</th><th>Custo</th><th></th></tr></thead><tbody>${rrows}</tbody><tfoot><tr><td colspan="2">Subtotal roteiro</td><td class="num">${fmt0(rt)}</td><td></td></tr></tfoot></table>
    <button class="addmini" data-step="${p.id}">+ etapa do roteiro</button>
    <div class="vsection">📒 Livro-caixa (complementar)</div>
    <table class="vtable"><thead><tr><th>Item</th><th>Valor</th><th></th></tr></thead><tbody>${crows}</tbody><tfoot><tr><td>Subtotal caixa</td><td class="num">${fmt0(cx)}</td><td></td></tr></tfoot></table>
    <button class="addmini" data-cx="${p.id}">+ item do caixa</button>
    <div class="vgrand"><span>Total da versão "${v.nome}"</span><b>${fmt0(total)}</b></div>
    <div class="pacts"><button class="${p.ativo?'on-b':''}" data-toggle="${p.id}">${p.ativo?'Ativo na previsão':'Pausado'}</button><button data-realizar="${p.id}">Realizar</button><button data-delp="${p.id}">Remover viagem</button></div>
  </div>`;
}

/* ===== DESAFIOS ===== */
const NIVEIS=[["Iniciante",0],["Organizado",100],["Planejador",300],["Investidor",600],["Independente",1000],["Livre",1500]];
function nivelDe(s){let n=NIVEIS[0];NIVEIS.forEach(x=>{if(s>=x[1])n=x;});return n;}
function metaCtx(){
  const inc=incomeOf(mes),free=incomeOf(mes)-spendOf(mes)-cardLoad(mes);
  const aporteNYC=(()=>{const p=state.plans.find(x=>x.tipo==="viagem"&&x.ativo);if(!p)return 0;const inf=planInfo(p);return inf.total/inf.parcelas;})();
  return {inc,free,aporteNYC};
}
function dividaOutstanding(k){
  let t=0;
  state.cards.forEach(c=>{const end=addMonths(c.inicio,c.parcelas-1);if(cmp(k,end)<=0){const from=cmp(k,c.inicio)>=0?k:c.inicio;const n=monthDiff(from,end)+1;if(n>0)t+=num(c.valor)*n;}});
  (state.game.consignados||[]).forEach(c=>{if(c.quitado||!c.fim)return;if(cmp(k,c.fim)<=0){const n=monthDiff(k,c.fim)+1;if(n>0)t+=num(c.valor)*n;}});
  return t;
}
/* Cards de desafio (catálogo) */
const CHALLENGES={
  passaporte:{nome:"Passaporte Financeiro — NY",ic:"✈️",fn:(g)=>{
    const guard=g.passaporte*250,meta=30000,pct=Math.round(guard/meta*100);
    let cells="";for(let i=0;i<120;i++)cells+=`<div class="cell ${i<g.passaporte?'f':''}" data-cell="${i}"></div>`;
    return `<div class="quest"><div class="qh"><span class="ic">✈️</span><span class="qt">Passaporte Financeiro — Nova York</span></div><div class="qsub">120 células de R$ 250. Cada vez que guardar, marque uma célula.</div><div class="bar"><i style="width:${pct}%"></i></div><div class="qmeta"><span>Guardado <b>${fmt0(guard)}</b></span><span>Falta <b>${fmt0(meta-guard)}</b></span><span><b>${pct}%</b></span></div><div class="passport">${cells}</div><div class="stepper"><button data-pp="-1">− célula</button><button class="go" data-pp="1">+ R$ 250</button></div></div>`;}},
  liberar:{nome:"Liberar Renda (consignados)",ic:"🔓",fn:(g,ctx)=>{
    const presa=g.consignados.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0);
    const livre=g.consignados.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0);
    let debts="";g.consignados.forEach(c=>{debts+=`<div class="debt ${c.quitado?'done':''}"><span class="dot"></span><div class="dn">${c.nome}<small>${c.quitado?'quitado — renda liberada':'parcela mensal'}</small></div><span class="dv">${fmt0(c.valor)}</span><button data-cons="${c.id}">${c.quitado?'✓':'Quitar'}</button></div>`;});
    return `<div class="quest"><div class="qh"><span class="ic">🔓</span><span class="qt">Liberar Renda</span></div><div class="qsub">Quando os três consignados caírem, sua renda salta para <b>${fmt0(ctx.inc+presa)}</b>.</div>${debts}<div class="libpanel"><div class="presa"><div class="lbl">Renda presa</div><div class="n" style="color:var(--neg)">${fmt0(presa)}</div></div><div class="livre"><div class="lbl">Renda liberada</div><div class="n" style="color:var(--pos)">${fmt0(livre)}</div></div></div></div>`;}},
  cheque:{nome:"Quitar o Cheque Especial",ic:"⛓️",fn:(g)=>{
    const chPct=Math.min(100,Math.round(g.cheque.pago/g.cheque.meta*100));
    return `<div class="quest"><div class="qh"><span class="ic">⛓️</span><span class="qt">Quitar o Cheque Especial</span></div><div class="qsub">Saldo negativo no BB: ${fmt0(g.cheque.meta)}. Registre o quanto abateu.</div><div class="bar"><i style="width:${chPct}%;background:linear-gradient(90deg,var(--neg),var(--gold))"></i></div><div class="qmeta"><span>Abatido <b>${fmt0(g.cheque.pago)}</b></span><span>Resta <b>${fmt0(g.cheque.meta-g.cheque.pago)}</b></span></div><div class="stepper"><button data-ch="-100">− R$ 100</button><button data-ch="-500">− R$ 500</button><button class="go" data-ch="-100000">Quitado!</button></div></div>`;}},
  comprar:{nome:"Posso comprar isso?",ic:"🛒",fn:(g,ctx)=>{
    return `<div class="quest calc"><div class="qh"><span class="ic">🛒</span><span class="qt">Posso comprar isso?</span></div><div class="qsub">Saldo livre previsto: <b>${fmt0(ctx.free)}</b> · meta NY exige <b>${fmt0(ctx.aporteNYC)}</b>/mês.</div><input id="buyVal" inputmode="decimal" placeholder="Valor da compra (R$)"><button class="btn" id="buyBtn" style="margin-top:10px">Avaliar impacto</button><div class="verdict" id="buyVerdict"></div><div class="zhint"><span class="zg">🟢 até ${fmt0(Math.max(0,ctx.free-ctx.aporteNYC)*0.4)}</span><span class="zy">🟡 até ${fmt0(Math.max(0,ctx.free-ctx.aporteNYC))}</span><span class="zr">🔴 acima</span></div></div>`;}},
  semcartao:{nome:"30 dias sem crédito",ic:"🚫",fn:(g)=>{
    const dias=g.semCartao.filter(Boolean).length;let daysH="";g.semCartao.forEach((on,i)=>{daysH+=`<div class="day ${on?'on':''}" data-day="${i}">${i+1}</div>`;});
    return `<div class="quest"><div class="qh"><span class="ic">🚫</span><span class="qt">30 dias sem crédito</span></div><div class="qsub">Sem parcelar, sem crédito, sem PIX crédito. ${dias>=30?'🏅 Missão concluída!':`${dias}/30 dias`}</div><div class="daygrid">${daysH}</div></div>`;}},
  semcheque:{nome:"Conta no positivo",ic:"📈",fn:(g)=>{
    const mc=g.semCheque;return `<div class="quest"><div class="qh"><span class="ic">📈</span><span class="qt">Conta no positivo</span></div><div class="qsub">Dias seguidos sem entrar no cheque especial: <b>${mc}</b>.</div><div class="stepper"><button data-sch="-1">−1 dia</button><button class="go" data-sch="1">+1 dia</button><button data-sch="0">zerar</button></div><div class="medals"><div class="medal ${mc>=30?'win':''}"><div class="em">🥉</div><div class="ml">30 dias</div></div><div class="medal ${mc>=60?'win':''}"><div class="em">🥈</div><div class="ml">60 dias</div></div><div class="medal ${mc>=90?'win':''}"><div class="em">🥇</div><div class="ml">90 dias</div></div></div></div>`;}},
  score:{nome:"Score Financeiro",ic:"⭐",fn:(g)=>{
    const nv=nivelDe(g.score);return `<div class="quest"><div class="qh"><span class="ic">⭐</span><span class="qt">Score Financeiro</span></div><div class="scorebig">${g.score}</div><div class="level">${nv[0]}</div><div class="ladder">${NIVEIS.map(n=>`<span class="${n[0]===nv[0]?'now':''}">${n[0]}</span>`).join("")}</div><div class="scoreacts"><button data-pts="10">Registrei despesas <b>+10</b></button><button data-pts="20">Mês positivo <b>+20</b></button><button data-pts="30">Aportei p/ NY <b>+30</b></button><button data-pts="50">Quitei dívida <b>+50</b></button><button data-pts="100" style="grid-column:1/3">Mês sem cheque especial <b>+100</b></button></div></div>`;}},
  central:{nome:"Central de Economias",ic:"🌱",fn:(g)=>{
    const eco=g.habitos.filter(h=>h.feito).reduce((s,h)=>s+h.eco,0);let habH="";g.habitos.forEach(h=>{habH+=`<div class="habit ${h.feito?'on':''}" data-hab="${h.id}"><div class="box">✓</div><div class="ht">${h.txt}</div><div class="he">${h.eco?fmt0(h.eco):''}</div></div>`;});
    return `<div class="quest"><div class="qh"><span class="ic">🌱</span><span class="qt">Central de Economias</span></div><div class="qsub">Hábitos atômicos: 1% melhor por dia. Economia estimada do mês: <b style="color:var(--pos)">${fmt0(eco)}</b></div>${habH}</div>`;}}
};

function renderMetas(){renderEvolucao();renderMetasPainel();renderBoard();renderLinhaTempo();}

function evoSvg(series,w,h){
  const all=series.flatMap(s=>s.vals);
  let mn=Math.min(0,...all),mx=Math.max(...all,1);const pad=(mx-mn)*0.1||1;mn-=pad;mx+=pad;
  const X=i=>(i/11)*w, Y=v=>h-((v-mn)/(mx-mn))*h;
  let svg=`<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block">`;
  if(mn<0&&mx>0){const zy=Y(0).toFixed(1);svg+=`<line x1="0" y1="${zy}" x2="${w}" y2="${zy}" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="3 3"/>`;}
  series.forEach(s=>{const pts=s.vals.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    if(s.fill)svg+=`<polygon points="0,${h} ${pts} ${w},${h}" fill="${s.fill}"/>`;
    svg+=`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;});
  series.forEach(s=>{const i=11;svg+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(s.vals[i]).toFixed(1)}" r="3.4" fill="${s.color}" stroke="var(--paper)" stroke-width="1.5"/>`;});
  return svg+`</svg>`;
}
function renderEvolucao(){
  const el=document.getElementById("evolucao");
  const mns=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const ks=mns.map((_,i)=>anoSel+"-"+pad(i+1));
  const base=num(state.game.patrimonioBase||0);let saldoAcc=0,invAcc=0;
  const patr=[],div=[],inv=[],sal=[];
  ks.forEach(k=>{saldoAcc+=freeOf(k);invAcc+=investOf(k);div.push(dividaOutstanding(k));sal.push(saldoAcc);inv.push(invAcc);patr.push(base+saldoAcc+invAcc);});
  const COL={patr:'var(--brass)',inv:'#2f6f4e',div:'#a8412f'};
  function delta(arr,goodUp){const d=arr[11]-arr[0];const cls=d===0?'flat':((d>0)===goodUp?'up':'down');return `<div class="sd ${cls}">${d>0?'+':''}${fmtK(d)} no ano</div>`;}
  function stat(lbl,col,val,deltaHtml){return `<div class="evostat"><div class="sl"><i style="background:${col}"></i>${lbl}</div><div class="sv">${fmt0(val)}</div>${deltaHtml}</div>`;}
  let h=`<div class="evo"><div class="evohd"><span class="vsection" style="margin:0">📈 Evolução financeira</span><span class="yearpick"><button data-anom="-1">‹</button><b>${anoSel}</b><button data-anom="1">›</button></span></div>`;
  h+=`<div class="evostats">`;
  h+=stat("Patrimônio",COL.patr,patr[11],delta(patr,true));
  h+=stat("Investido",COL.inv,inv[11],delta(inv,true));
  h+=stat("Dívidas",COL.div,div[11],delta(div,false));
  h+=stat("Saldo acum.","var(--ink)",sal[11],delta(sal,true));
  h+=`</div>`;
  h+=`<div class="evochart">${evoSvg([
    {vals:patr,color:COL.patr,fill:'rgba(154,123,63,.14)'},
    {vals:inv,color:COL.inv},
    {vals:div,color:COL.div}
  ],660,150)}</div>`;
  h+=`<div class="evoxax">`+mns.map((m,i)=>`<span>${i%2===0?m:''}</span>`).join('')+`</div>`;
  h+=`<div class="evolegend"><span><i style="background:${COL.patr}"></i>Patrimônio</span><span><i style="background:${COL.inv}"></i>Investido</span><span><i style="background:${COL.div}"></i>Dívidas</span></div>`;
  function row(lbl,arr,cls){let r=`<tr class="${cls||''}"><td>${lbl}</td>`;arr.forEach(v=>{r+=`<td class="${v<0?'neg-c':''}" title="${fmt0(v)}">${fmtK(v)}</td>`;});return r+"</tr>";}
  h+=`<details class="evodet"><summary>Ver mês a mês</summary><div class="annual"><table><thead><tr><th>Mês</th>`;
  mns.forEach(m=>h+=`<th>${m}</th>`);h+=`</tr></thead><tbody>`;
  h+=row("Patrimônio",patr,"tot")+row("Dívidas",div)+row("Investido",inv)+row("Saldo acum.",sal,"tot");
  h+=`</tbody></table></div></details></div>`;
  el.innerHTML=h;
}

function monthsUntil(d){if(!d)return 0;const t=new Date();const p=d.split("-").map(Number);return Math.max(0,(p[0]-t.getFullYear())*12+(p[1]-1-t.getMonth()));}
function fmtBr(d){if(!d)return"—";const p=d.split("-");return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:"—";}
function renderMetasPainel(){
  const el=document.getElementById("metasPainel");const g=state.game;
  const metas=[
    {h:"curto",nome:"Quitar cheque especial",cat:"Dívida",alvo:num(g.cheque.meta),guard:num(g.cheque.pago),prazo:"2026-06-30"},
    {h:"curto",nome:"Reserva inicial (1 mês)",cat:"Reserva",alvo:Math.round(spendOf(mes))||3000,guard:num(g.reservaGuardado||0),prazo:"2026-09-30"},
    {h:"longo",nome:"Nova York 2026",cat:"Viagem",alvo:30000,guard:g.passaporte*250,prazo:"2026-12-18"},
    {h:"longo",nome:"Reserva de emergência",cat:"Reserva",alvo:15000,guard:num(g.reservaGuardado||0),prazo:"2027-06-01"},
    {h:"longo",nome:"Patrimônio",cat:"Patrimônio",alvo:100000,guard:num(g.patrimonioBase||0),prazo:"2030-12-31"}
  ];
  function tabela(h){
    let t=`<div class="ctblwrap"><table class="ctbl"><thead><tr><th>Meta</th><th>Categoria</th><th class="num">Valor alvo</th><th class="num">Guardado</th><th class="num">Faltante</th><th>Prazo</th><th class="num">Meses</th><th class="num">Aporte/mês</th><th>Progresso</th></tr></thead><tbody>`;
    const rows=metas.filter(m=>m.h===h);
    if(!rows.length)t+=`<tr><td colspan="9" class="cempty">Sem metas.</td></tr>`;
    rows.forEach(m=>{const falta=Math.max(0,m.alvo-m.guard);const mr=monthsUntil(m.prazo);const aporte=falta/Math.max(1,mr);const pct=m.alvo?Math.min(100,Math.round(m.guard/m.alvo*100)):0;
      t+=`<tr><td>${m.nome}</td><td>${m.cat}</td><td class="num">${fmt0(m.alvo)}</td><td class="num">${fmt0(m.guard)}</td><td class="num">${fmt0(falta)}</td><td>${fmtBr(m.prazo)}</td><td class="num">${mr}</td><td class="num">${fmt0(aporte)}</td><td><div class="pwrap"><div class="pbar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div></td></tr>`;});
    return t+`</tbody></table></div>`;
  }
  let h=`<div class="vsection">🎯 Metas, reserva e viagens</div><p class="intro" style="margin:0 2px 6px">Metas com faltante, prazo, aporte necessário e progresso.</p>`;
  h+=`<div class="mlabel">Curto prazo</div>`+tabela("curto");
  h+=`<div class="mlabel">Longo prazo</div>`+tabela("longo");
  el.innerHTML=h;
}

function renderBoard(){
  const el=document.getElementById("board");const g=state.game;const ctx=metaCtx();
  let h=`<div class="vsection">🎮 Board de desafios</div>`;
  if(!g.board.length)h+=`<div class="empty" style="padding:14px 4px">Board vazia. Toque em "+ adicionar desafio" para trazer um card.</div>`;
  else g.board.forEach(id=>{const c=CHALLENGES[id];if(!c)return;h+=`<div class="boardcard">${c.fn(g,ctx)}<button class="rmboard" data-rmboard="${id}">×</button></div>`;});
  el.innerHTML=h;
}

function renderLinhaTempo(){
  const el=document.getElementById("linhaTempo");
  const mns=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const ks=mns.map((_,i)=>anoSel+"-"+pad(i+1));
  const consTot=state.game.consignados.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0);
  function row(lbl,fn,cls){let r=`<tr class="${cls||''}"><td>${lbl}</td>`;ks.forEach(k=>{const v=fn(k);r+=`<td class="${v<0?'neg-c':''}" title="${fmt0(v)}">${fmtK(v)}</td>`;});return r+"</tr>";}
  let h=`<div class="yearbar"><span class="vsection" style="margin:0">🧭 Linha do tempo financeira</span><span class="yearpick"><button data-anom="-1">‹</button><b>${anoSel}</b><button data-anom="1">›</button></span></div>`;
  h+=`<div class="annual"><table><thead><tr><th>${anoSel}</th>`;
  mns.forEach(m=>h+=`<th>${m}</th>`);h+=`</tr></thead><tbody>`;
  h+=row("Consignados",()=>consTot);
  h+=row("Cartões",k=>cardLoad(k));
  h+=row("Meta NYC",k=>planLoad(k));
  h+=row("Sobra",k=>freeOf(k),"tot");
  h+=`</tbody></table></div><p class="intro" style="margin-top:8px">Quando os compromissos terminam, a Sobra cresce — é o momento em que você recupera fôlego para investir, trocar de carro ou viajar.</p>`;
  el.innerHTML=h;
}

/* ===== Render geral ===== */
function renderAll(){
  applyView();
  if(!annual)renderMes();
  renderCompromissos();renderPlanos();renderMetas();
}

/* ===== Abas ===== */
const FIN_TABS=[['mes','Mês'],['previsao','Previsão'],['planejar','Planejar'],['desafios','Metas']];
const HAB_TABS=[['habit','WeekHub'],['planejador','Planejador'],['mapa','Mapa'],['sono','Saúde']];
function paintTabs(){
  const tabs=seedWorld?SEED_WORLDS[seedWorld].tabs:(habitMode?HAB_TABS:FIN_TABS);
  const current=seedWorld?activeSeedTab:(habitMode?activeHabitTab:activeFinanceTab);
  const el=document.getElementById('mainTabs');if(el)el.innerHTML=tabs.map(([id,label],i)=>`<button class="tab" role="tab" data-tab="${id}" aria-selected="${id===current||(!current&&i===0)?'true':'false'}">${label}</button>`).join('');
}
function activateTab(id){
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x.dataset.tab===id?'true':'false'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  if(seedWorld){activeSeedTab=id;document.getElementById('p-seed').classList.add('on');renderSeed();updateHeader();return;}
  if(habitMode){activeHabitTab=id;document.getElementById('p-habit').classList.add('on');renderHabit();}
  else{activeFinanceTab=id;document.getElementById('p-'+id).classList.add('on');}
  updateHeader();
}
document.addEventListener('click',e=>{const t=e.target.closest('#mainTabs .tab');if(!t)return;activateTab(t.dataset.tab);});
const _prevM=document.getElementById("prevM");if(_prevM)_prevM.onclick=()=>{
  if(seedWorld){return;}
  if(habitMode){mes=addMonths(mes,-1);anoSel=parseInt(mes);renderHabit();updateHeader();return;}
  if(annual){anoSel--;renderAll();return;}
  mes=addMonths(mes,-1);anoSel=parseInt(mes);renderAll();};
const _nextM=document.getElementById("nextM");if(_nextM)_nextM.onclick=()=>{
  if(seedWorld){return;}
  if(habitMode){mes=addMonths(mes,1);anoSel=parseInt(mes);renderHabit();updateHeader();return;}
  if(annual){anoSel++;renderAll();return;}
  mes=addMonths(mes,1);anoSel=parseInt(mes);renderAll();};
const _viewTog=document.getElementById("viewTog");if(_viewTog)_viewTog.onclick=()=>{annual=!annual;activateTab("mes");renderAll();};

/* ===== Modais ===== */
function openModal(id){document.getElementById(id).classList.add("on");}
function closeModals(){document.querySelectorAll(".modal").forEach(m=>m.classList.remove("on"));}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
let entryTipo="entrada";
function fillSubSelect(){
  const sel=document.getElementById("enSub");const grupos=TAX[entryTipo].grupos;let h="";
  Object.keys(grupos).forEach(g=>{h+=`<optgroup label="${g}">`;grupos[g].forEach((s,i)=>{h+=`<option value="${g}|${s}">${s}</option>`;});h+=`</optgroup>`;});
  sel.innerHTML=h;
  const isInv=entryTipo==="investimento",isRec=entryTipo==="entrada";
  document.getElementById("statusWrap").style.display=isInv?"block":"none";
  document.getElementById("dRealWrap").style.display=isInv?"none":"block";
  document.getElementById("lblDPrev").textContent=(!isRec&&!isInv)?"Vencimento":"Data prevista";
  document.getElementById("lblDReal").textContent=isRec?"Data de recebimento":"Data de pagamento";
  document.getElementById("lblPrev").textContent=isInv?"Aporte previsto (R$)":"Valor previsto (R$)";
  document.getElementById("lblEfet").textContent=isInv?"Aporte realizado (R$)":"Valor efetivo (R$)";
}
document.querySelectorAll("#entrySeg button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#entrySeg button").forEach(x=>x.classList.remove("on"));b.classList.add("on");entryTipo=b.dataset.tipo;fillSubSelect();});
function openEntry(t){entryTipo=t||"entrada";document.querySelectorAll("#entrySeg button").forEach(x=>x.classList.toggle("on",x.dataset.tipo===entryTipo));fillSubSelect();["enVal","enEfet","enMeio","enDPrev","enDReal","enDesc"].forEach(i=>document.getElementById(i).value="");document.getElementById("enStatus").value="Previsto";document.getElementById("enRec").checked=false;openModal("entryModal");}
document.getElementById("enSave").onclick=()=>{const v=num(document.getElementById("enVal").value);if(!v)return;const[grupo,sub]=(document.getElementById("enSub").value||"|").split("|");
  const efetRaw=document.getElementById("enEfet").value.trim();const efet=efetRaw?num(efetRaw):null;const isInv=entryTipo==="investimento";
  state.entries.push({id:uid(),tipo:entryTipo,mes,valor:v,prev:v,efet,descricao:document.getElementById("enDesc").value.trim()||null,meio:document.getElementById("enMeio").value.trim()||null,dPrev:document.getElementById("enDPrev").value||null,dReal:isInv?null:(document.getElementById("enDReal").value||null),status:isInv?document.getElementById("enStatus").value:null,recorrente:document.getElementById("enRec").checked,grupo,sub});
  save();closeModals();renderAll();};
document.getElementById("cardNew").onclick=()=>{["cdBand","cdDesc","cdVal"].forEach(i=>document.getElementById(i).value="");document.getElementById("cdParc").value="1";document.getElementById("cdIni").value=mes;openModal("cardModal");};
document.addEventListener('click',e=>{
  if(e.target.closest('#ledgerEditBtn')){ledgerEdit=true;renderLedger();return;}
  if(e.target.closest('#ledgerCancel')){ledgerEdit=false;renderLedger();return;}
  if(e.target.closest('#ledgerSave')){
    document.querySelectorAll('#secEntradas .celledit').forEach(inp=>{
      const en=state.entries.find(x=>x.id===inp.dataset.eid);if(!en)return;
      const f=inp.dataset.f,v=inp.value;
      if(f==='descricao')en.descricao=v.trim()||null;
      else if(f==='prev'){const n=num(v);en.prev=n;en.valor=n;}
      else if(f==='efet'){const t=String(v).trim();en.efet=t===''?null:num(t);}
    });
    ledgerEdit=false;save();renderAll();return;
  }
});
document.getElementById("cdSave").onclick=()=>{const v=num(document.getElementById("cdVal").value);const p=parseInt(document.getElementById("cdParc").value)||1;if(!v)return;state.cards.push({id:uid(),bandeira:document.getElementById("cdBand").value.trim(),descricao:document.getElementById("cdDesc").value.trim(),valor:v,parcelas:p,inicio:document.getElementById("cdIni").value||mes});save();closeModals();renderAll();};
function fillPlanSub(){
  const sel=document.getElementById("plSub");let h="";
  [["variável",TAX.variavel.grupos],["eventual",TAX.anual.grupos]].forEach(([lbl,grupos])=>{
    Object.keys(grupos).forEach(gr=>{h+=`<optgroup label="${gr} · ${lbl}">`;grupos[gr].forEach(s=>{h+=`<option value="${gr}|${s}|${lbl==='eventual'?'anual':'variavel'}">${s}</option>`;});h+=`</optgroup>`;});
  });
  sel.innerHTML=h;
}
document.getElementById("planNew").onclick=()=>{document.getElementById("plTitulo").value="";document.getElementById("plTipo").value="viagem";document.getElementById("plValor").value="";document.getElementById("plParc").value="1";document.getElementById("plInicio").value=mes;document.getElementById("plDPrev").value="";document.getElementById("plMeio").value="";fillPlanSub();openModal("planModal");};
document.getElementById("plSave").onclick=()=>{const v=num(document.getElementById("plValor").value);const p=parseInt(document.getElementById("plParc").value)||1;const tit=document.getElementById("plTitulo").value.trim();const tipo=document.getElementById("plTipo").value;const ini=document.getElementById("plInicio").value||mes;if(!tit)return;
  const[pg,ps,pt]=(document.getElementById("plSub").value||"Outros|Outros|variavel").split("|");
  const std={grupo:pg,sub:ps,catTipo:pt,dPrev:document.getElementById("plDPrev").value||null,meio:document.getElementById("plMeio").value.trim()||null};
  if(tipo==="viagem"){state.plans.push(Object.assign({id:uid(),titulo:tit,tipo:"viagem",ativo:true,versaoAtiva:0,versoes:[{nome:"Versão 1",inicio:ini,parcelas:p,roteiro:[],caixa:v?[{id:uid(),item:"Estimativa inicial",valor:v}]:[]}]},std));}
  else{if(!v)return;state.plans.push(Object.assign({id:uid(),titulo:tit,tipo,valor:v,parcelas:p,inicio:ini,ativo:true},std));}
  save();closeModals();renderAll();};

/* Modais da viagem */
let curPlan=null;
function planById(id){return state.plans.find(p=>p.id===id);}
function realizarPlan(id){const p=planById(id);if(!p)return;const inf=planInfo(p);
  if((inf.parcelas||1)>1){state.cards.push({id:uid(),bandeira:p.meio||"Planejado",descricao:p.titulo,valor:inf.total/inf.parcelas,parcelas:inf.parcelas,inicio:mes});}
  else{state.entries.push({id:uid(),tipo:p.catTipo||"variavel",mes,valor:inf.total,prev:inf.total,efet:inf.total,dPrev:p.dPrev||null,dReal:null,meio:p.meio||null,recorrente:false,grupo:p.grupo||"Outros",sub:p.sub||p.titulo});}
  state.plans=state.plans.filter(x=>x.id!==id);save();renderAll();}
function openVer(id){curPlan=id;document.getElementById("vrNome").value="";document.getElementById("vrParc").value="6";document.getElementById("vrIni").value=mes;document.getElementById("vrCopy").checked=true;openModal("verModal");}
document.getElementById("vrSave").onclick=()=>{const p=planById(curPlan);if(!p)return;const nome=document.getElementById("vrNome").value.trim()||("Versão "+(p.versoes.length+1));const parc=parseInt(document.getElementById("vrParc").value)||1;const ini=document.getElementById("vrIni").value||mes;const copy=document.getElementById("vrCopy").checked;const cur=p.versoes[p.versaoAtiva||0]||{roteiro:[],caixa:[]};
  const nova={nome,inicio:ini,parcelas:parc,roteiro:copy?cur.roteiro.map(s=>({...s,id:uid()})):[],caixa:copy?cur.caixa.map(c=>({...c,id:uid()})):[]};
  p.versoes.push(nova);p.versaoAtiva=p.versoes.length-1;save();closeModals();renderAll();};
function openStep(id){curPlan=id;document.getElementById("stDia").value="1";document.getElementById("stAtiv").value="";document.getElementById("stCusto").value="";openModal("stepModal");}
document.getElementById("stSave").onclick=()=>{const p=planById(curPlan);if(!p)return;const v=p.versoes[p.versaoAtiva||0];if(!document.getElementById("stAtiv").value.trim())return;(v.roteiro=v.roteiro||[]).push({id:uid(),dia:parseInt(document.getElementById("stDia").value)||1,atividade:document.getElementById("stAtiv").value.trim(),custo:num(document.getElementById("stCusto").value)});v.roteiro.sort((a,b)=>a.dia-b.dia);save();closeModals();renderAll();};
function openCaixa(id){curPlan=id;document.getElementById("cxItem").value="";document.getElementById("cxValor").value="";openModal("caixaModal");}
document.getElementById("cxSave").onclick=()=>{const p=planById(curPlan);if(!p)return;const v=p.versoes[p.versaoAtiva||0];const val=num(document.getElementById("cxValor").value);if(!document.getElementById("cxItem").value.trim()||!val)return;(v.caixa=v.caixa||[]).push({id:uid(),item:document.getElementById("cxItem").value.trim(),valor:val});save();closeModals();renderAll();};
let curCons=null;
function openCons(id){curCons=id;const c=id?(state.game.consignados||[]).find(x=>x.id===id):null;document.getElementById("coNome").value=c?(c.nome||""):"";document.getElementById("coVal").value=c?String(num(c.valor)).replace(".",","):"";document.getElementById("coFim").value=(c&&c.fim)?c.fim:"";openModal("consModal");}
document.getElementById("coSave").onclick=()=>{const nome=document.getElementById("coNome").value.trim();const v=num(document.getElementById("coVal").value);const fim=document.getElementById("coFim").value||null;
  if(curCons){const c=(state.game.consignados||[]).find(x=>x.id===curCons);if(!c)return;if(nome)c.nome=nome;if(v)c.valor=v;c.fim=fim;}
  else{if(!nome&&!v)return;(state.game.consignados=state.game.consignados||[]).push({id:uid(),nome:nome||"Compromisso",valor:v,quitado:false,fim});}
  save();closeModals();renderAll();};

/* ===== Delegação ===== */
document.addEventListener("input",e=>{const fi=e.target.closest("[data-fat]");if(fi){const[i,k]=fi.dataset.fat.split(":");const v=fi.value.replace(/[^0-9]/g,"").slice(0,2);if(state.faturas&&state.faturas[i]){state.faturas[i][k]=v;save();}}});
document.addEventListener("click",e=>{
  const g=state.game;
  const add=e.target.closest("[data-add]");if(add){openEntry(add.dataset.add);return;}
  const del=e.target.closest("[data-del]");if(del){state.entries=state.entries.filter(x=>x.id!==del.dataset.del);save();renderAll();return;}
  const delc=e.target.closest("[data-delc]");if(delc){state.cards=state.cards.filter(x=>x.id!==delc.dataset.delc);save();renderAll();return;}
  const ec=e.target.closest("[data-editcons]");if(ec){openCons(ec.dataset.editcons);return;}
  const cn=e.target.closest("#consNew");if(cn){openCons(null);return;}
  const delp=e.target.closest("[data-delp]");if(delp){state.plans=state.plans.filter(x=>x.id!==delp.dataset.delp);save();renderAll();return;}
  const tg=e.target.closest("[data-toggle]");if(tg){const p=state.plans.find(x=>x.id===tg.dataset.toggle);if(p){p.ativo=!p.ativo;save();renderAll();}return;}
  const rz=e.target.closest("[data-realizar]");if(rz){realizarPlan(rz.dataset.realizar);return;}
  const ver=e.target.closest("[data-ver]");if(ver){const[id,i]=ver.dataset.ver.split(":");const p=planById(id);if(p){p.versaoAtiva=parseInt(i);save();renderAll();}return;}
  const vnew=e.target.closest("[data-vnew]");if(vnew){openVer(vnew.dataset.vnew);return;}
  const stp=e.target.closest("[data-step]");if(stp){openStep(stp.dataset.step);return;}
  const cxb=e.target.closest("[data-cx]");if(cxb){openCaixa(cxb.dataset.cx);return;}
  const dst=e.target.closest("[data-delstep]");if(dst){const[id,sid]=dst.dataset.delstep.split(":");const p=planById(id);if(p){const v=p.versoes[p.versaoAtiva||0];v.roteiro=v.roteiro.filter(x=>x.id!==sid);save();renderAll();}return;}
  const dcx=e.target.closest("[data-delcx]");if(dcx){const[id,cid]=dcx.dataset.delcx.split(":");const p=planById(id);if(p){const v=p.versoes[p.versaoAtiva||0];v.caixa=v.caixa.filter(x=>x.id!==cid);save();renderAll();}return;}
  // desafios
  const pp=e.target.closest("[data-pp]");if(pp){g.passaporte=Math.max(0,Math.min(120,g.passaporte+parseInt(pp.dataset.pp)));save();renderMetas();return;}
  const cell=e.target.closest("[data-cell]");if(cell){g.passaporte=parseInt(cell.dataset.cell)+1;save();renderMetas();return;}
  const cons=e.target.closest("[data-cons]");if(cons){const c=g.consignados.find(x=>x.id===cons.dataset.cons);if(c){c.quitado=!c.quitado;save();renderMetas();}return;}
  const ch=e.target.closest("[data-ch]");if(ch){const d=parseInt(ch.dataset.ch);g.cheque.pago=Math.max(0,Math.min(g.cheque.meta,d===-100000?g.cheque.meta:g.cheque.pago-d));save();renderMetas();return;}
  const day=e.target.closest("[data-day]");if(day){const i=parseInt(day.dataset.day);g.semCartao[i]=!g.semCartao[i];save();renderMetas();return;}
  const sch=e.target.closest("[data-sch]");if(sch){const d=parseInt(sch.dataset.sch);g.semCheque=d===0?0:Math.max(0,g.semCheque+d);save();renderMetas();return;}
  const pts=e.target.closest("[data-pts]");if(pts){g.score+=parseInt(pts.dataset.pts);save();renderMetas();return;}
  const hab=e.target.closest("[data-hab]");if(hab){const h=g.habitos.find(x=>x.id===hab.dataset.hab);if(h){h.feito=!h.feito;save();renderMetas();}return;}
  const add2=e.target.closest("#addDesafio");if(add2){openDesafioPicker();return;}
  const rmb=e.target.closest("[data-rmboard]");if(rmb){g.board=g.board.filter(x=>x!==rmb.dataset.rmboard);save();renderMetas();return;}
  const pick=e.target.closest("[data-pick]");if(pick){const id=pick.dataset.pick;if(!g.board.includes(id))g.board.push(id);save();renderMetas();buildDesafioPicker();return;}
  const am=e.target.closest("[data-anom]");if(am){anoSel+=parseInt(am.dataset.anom);renderAnual();renderMetas();return;}
  const ct=e.target.closest("#catTog");if(ct){catOpen=!catOpen;renderCategorias();return;}
  const bb=e.target.closest("#buyBtn");if(bb){evalBuy();return;}
});
function buildDesafioPicker(){
  const g=state.game;
  document.getElementById("desafioPicker").innerHTML=Object.keys(CHALLENGES).map(id=>{const c=CHALLENGES[id];const has=g.board.includes(id);
    return `<div class="pickitem ${has?'has':''}"><span class="pic">${c.ic}</span><span class="pn">${c.nome}</span><button data-pick="${id}">${has?'na board ✓':'adicionar'}</button></div>`;}).join("");
}
function openDesafioPicker(){buildDesafioPicker();openModal("desafioModal");}
function evalBuy(){
  const v=num(document.getElementById("buyVal").value);const out=document.getElementById("buyVerdict");
  const free=incomeOf(mes)-spendOf(mes)-cardLoad(mes);
  const p=state.plans.find(x=>x.tipo==="viagem"&&x.ativo);const aporte=p?(()=>{const inf=planInfo(p);return inf.total/inf.parcelas;})():0;
  const folga=Math.max(0,free-aporte);
  if(!v){out.className="verdict";return;}
  out.classList.add("show");
  if(v<=folga*0.4){out.className="verdict show g";out.innerHTML=`🟢 <b>Pode comprar.</b> Cabe sem atrapalhar o aporte de Nova York. Sobram ${fmt0(folga-v)} de folga.`;}
  else if(v<=folga){out.className="verdict show y";out.innerHTML=`🟡 <b>Dá, mas atenção.</b> Come boa parte da sua folga do mês. Depois dela restam ${fmt0(folga-v)}.`;}
  else{out.className="verdict show r";out.innerHTML=`🔴 <b>Compromete a viagem.</b> Passa da sua folga (${fmt0(folga)}). Para comprar, você atrasaria o aporte de Nova York em ~${(v/Math.max(1,aporte)).toFixed(1)} mês(es).`;}
}

/* ===== Habit tracker (lado girado) ===== */
function hesc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function defaultsHabit(h){
  h=h||{};
  if(!h.daily)h.daily=[
    {id:uid(),name:"Beber 2,5L de água",goal:31},
    {id:uid(),name:"Treino de 30 min",goal:20},
    {id:uid(),name:"Dormir 8 horas",goal:31},
    {id:uid(),name:"5 porções de frutas e vegetais",goal:31},
    {id:uid(),name:"Meditar 15 min",goal:30},
    {id:uid(),name:"Ler 20 páginas",goal:20},
    {id:uid(),name:"2h de trabalho focado",goal:25},
    {id:uid(),name:"Caminhar 10 min",goal:24},
    {id:uid(),name:"1h sem telas",goal:24}];
  if(!h.weekly)h.weekly=[
    {id:uid(),name:"Planejar as refeições"},
    {id:uid(),name:"Treinos da semana"},
    {id:uid(),name:"Lista de tarefas"},
    {id:uid(),name:"Faxina semanal"},
    {id:uid(),name:"Revisar metas"}];
  if(!h.marks)h.marks={};
  if(!h.wmarks)h.wmarks={};
  if(h.notes==null)h.notes="";
  if(!h.qnotes)h.qnotes=[];
  if(!h.todos)h.todos=[];
  if(!h.closet)h.closet=[
    {id:uid(),name:'Camisas & camisetas',ic:'👕',hint:'tops do dia a dia',items:[]},
    {id:uid(),name:'Calças & shorts',ic:'👖',hint:'partes de baixo',items:[]},
    {id:uid(),name:'Calçados',ic:'👟',hint:'tênis, sapatos, botas',items:[]},
    {id:uid(),name:'Acessórios',ic:'🧢',hint:'bonés, óculos, relógios',items:[]}];
  if(!h.pertences)h.pertences=[];
  if(!h.bagMap)h.bagMap=[
    {id:uid(),name:'Mochila / bolsa',ic:'🎒',hint:'o que levo comigo',items:[]},
    {id:uid(),name:'Bolso / carteira',ic:'👛',hint:'essenciais do bolso',items:[]}];
  if(!h.consumoMap)h.consumoMap=[
    {id:uid(),name:'Suplementos',ic:'💊',hint:'vitaminas e suplementos',items:[]},
    {id:uid(),name:'Reposições',ic:'🔁',hint:'o que acaba e precisa repor',items:[]}];
  if(!h.cart)h.cart=[];
  if(!h.rhythm)h.rhythm={
    coverage:{work:6,nutrition:5,movement:3,relations:2,space:3,rest:6,mind:4},
    weak:['','',''],
    checks:[false,false,false,false,false,false],
    correction:'',
    themes:{seg:{t:'Planejamento + foco',d:'Trabalho profundo + organização'},ter:{t:'Produção',d:'Execução e avanço real'},qua:{t:'Comunicação',d:'Relações e alinhamentos'},qui:{t:'Execução admin.',d:'Tarefas e manutenção'},sex:{t:'Fechamento',d:'Review e encerramento'},sab:{t:'Casa + relações',d:'Espaço, movimento e presença'},dom:{t:'Descanso + reset',d:'Recuperação e preparação leve'}}
  };
  if(!h.qcats)h.qcats=[
    {id:'ideia',name:'Ideia',color:'#9a7b3f'},
    {id:'tarefa',name:'Tarefa',color:'#2f6f4e'},
    {id:'lembrete',name:'Lembrete',color:'#b4521c'},
    {id:'compra',name:'Compra',color:'#7a5cab'},
    {id:'estudo',name:'Estudo',color:'#3a6ea5'}];
  if(!h.weekPlan)h.weekPlan={};
  if(!h.monthPlan)h.monthPlan={};
  if(!h.retomadas)h.retomadas=[
    {id:uid(),ctx:'trabalho',title:'Voto pendente — processo destacado',next:'Reler o relatório e marcar os pontos controvertidos',ts:Date.now()-18e6},
    {id:uid(),ctx:'dev',title:'Deprecata — ajuste de release',next:'Abrir o PR e revisar os testes que falharam',ts:Date.now()-108e6},
    {id:uid(),ctx:'rpg',title:'Campanha — próximo arco',next:'Esboçar o gancho do vilão e 3 NPCs',ts:Date.now()-252e6}];
  if(!h.inbox)h.inbox=[
    {id:uid(),txt:'Ver se a passagem pra NY tá com preço bom',ts:Date.now()-24e5},
    {id:uid(),txt:'Ideia de automação pro AppRegional',ts:Date.now()-72e5}];
  if(!h.projetos)h.projetos=[
    {id:uid(),name:'Deprecata',ctx:'dev',last:Date.now()-2*864e5},
    {id:uid(),name:'AppRegional',ctx:'dev',last:Date.now()-9*864e5},
    {id:uid(),name:'Campanha de RPG',ctx:'rpg',last:Date.now()-16*864e5},
    {id:uid(),name:'Planejamento NYC',ctx:'pessoal',last:Date.now()-5*864e5}];
  h.projetos.forEach(p=>{if(!p.days)p.days=[];});
  if(!h.hydration)h.hydration={};
  if(h.hydrationGoal==null)h.hydrationGoal=8;
  if(!h.sleep)h.sleep={};
  if(!h.sleepLog)h.sleepLog={};
  if(h.sleepGoal==null)h.sleepGoal=8;
  if(!h.mealPresets)h.mealPresets=[{id:uid(),name:'Café da manhã'},{id:uid(),name:'Almoço'},{id:uid(),name:'Lanche'},{id:uid(),name:'Jantar'}];
  if(!h.mealLog)h.mealLog={};
  if(h.dailySpendLimit===undefined)h.dailySpendLimit=null;
  if(!h.medications)h.medications=[{id:uid(),name:'Vitamina D',dose:'1 cápsula'}];
  if(!h.medsLog)h.medsLog={};
  if(!h.captures){
    h.captures=[];
    (h.inbox||[]).forEach(it=>h.captures.push({id:it.id||uid(),kind:'nota',txt:it.txt,cat:'ideia',area:null,goal:null,created:it.ts||Date.now(),date:null,time:null,done:false,alarm:null,fired:false}));
    (h.qnotes||[]).forEach(n=>h.captures.push({id:n.id||uid(),kind:'nota',txt:n.txt,cat:n.cat||'ideia',area:null,goal:null,created:n.ts||Date.now(),date:null,time:null,done:!!n.done,alarm:n.alarm||null,fired:!!n.fired}));
  }
  if(!h.toolsMap)h.toolsMap={
    flow:[['Ideias','Caderno / Inbox'],['Conhecimento','OneNote'],['Arquivos','Drive'],['Dados','Excel'],['Código','GitHub'],['Agenda','Calendário'],['Ação','Este app']],
    tools:[
      {id:uid(),ic:'📓',nm:'Caderno',fn:'Captura rápida e pensamento livre.',fr:'Ideias soltas · brainstorm'},
      {id:uid(),ic:'📝',nm:'OneNote',fn:'Base de conhecimento e procedimentos.',fr:'Fluxos · tutoriais · TRF3'},
      {id:uid(),ic:'📁',nm:'Drive',fn:'Arquivos e documentos finais.',fr:'PDFs · anexos · backups'},
      {id:uid(),ic:'📊',nm:'Excel',fn:'Dados, cálculos e controle.',fr:'Planilhas · números'},
      {id:uid(),ic:'🐙',nm:'GitHub',fn:'Código e versionamento.',fr:'Projetos dev · scripts'},
      {id:uid(),ic:'📅',nm:'Calendário',fn:'Compromissos inevitáveis.',fr:'Sessões · reuniões · viagens'},
      {id:uid(),ic:'✅',nm:'Este app',fn:'Orquestrador — não armazena tudo.',fr:'O que fazer · onde · onde parei'}]};
  return h;
}
const WD=['D','S','T','Q','Q','S','S'];
const LIFE_AREAS=[
  {id:'fisica',name:'Física',ic:'🪨',color:'#b4521c'},
  {id:'mental',name:'Mental',ic:'🧠',color:'#3a6ea5'},
  {id:'espiritual',name:'Espiritual',ic:'✦',color:'#7a5cab'},
  {id:'social',name:'Social',ic:'🤝',color:'#c79a3a'},
  {id:'financeira',name:'Financeira',ic:'◈',color:'#2f6f4e'},
  {id:'familiar',name:'Familiar',ic:'⌂',color:'#a8412f'},
  {id:'vocacional',name:'Vocacional',ic:'⚒',color:'#2d6a8a'}];
function defaultsAsgard(a){a=a||{};
  if(!a.areas)a.areas=LIFE_AREAS.map(x=>({...x}));
  if(!a.goals)a.goals=[
    {id:uid(),area:'fisica',title:'Recuperar a melhor forma física',why:'Energia e disposição para tudo o mais.',target:'Treino 4x/semana + 12% BF',progress:35,horizon:'2026'},
    {id:uid(),area:'vocacional',title:'Consolidar carreira na magistratura',why:'Domínio técnico e reconhecimento.',target:'Aprovação + portfólio sólido',progress:55,horizon:'2027'},
    {id:uid(),area:'financeira',title:'Independência financeira',why:'Liberdade para escolher.',target:'Reserva + patrimônio 100k',progress:20,horizon:'2030'}];
  if(a.vision==null)a.vision='';
  return a;}
function areaById(id){return (state.asgard&&state.asgard.areas||LIFE_AREAS).find(a=>a.id===id)||null;}
function goalById(id){return (state.asgard&&state.asgard.goals||[]).find(g=>g.id===id)||null;}
function defaultsSaude(s){s=s||{};
  if(!s.consultas)s.consultas=[
    {id:uid(),what:'Cardiologista — rotina',doctor:'Dr. Almeida',date:'',time:'',place:'Clínica Vita',notes:'Levar exames anteriores.'}];
  if(!s.exames)s.exames=[
    {id:uid(),name:'Hemograma completo',date:'',status:'Pendente',result:'',notes:''},
    {id:uid(),name:'Vitamina D',date:'',status:'Pendente',result:'',notes:''}];
  if(!s.treinos)s.treinos=[
    {id:uid(),name:'Treino A',focus:'Peito · Tríceps',exercises:'Supino reto 4x10\nSupino inclinado 3x12\nCrucifixo 3x15\nTríceps corda 4x12',notes:''},
    {id:uid(),name:'Treino B',focus:'Costas · Bíceps',exercises:'Barra fixa 4x máx\nRemada curvada 4x10\nPuxada frente 3x12\nRosca direta 4x12',notes:''},
    {id:uid(),name:'Treino C',focus:'Pernas · Ombro',exercises:'Agachamento 4x10\nLeg press 4x12\nCadeira extensora 3x15\nDesenvolvimento 4x10',notes:''}];
  if(!s.receitas)s.receitas=[
    {id:uid(),name:'Frango com batata-doce',servings:'2',kcal:'520',ingredients:'200g frango\n300g batata-doce\nazeite, sal, alho',steps:'Asse o frango temperado.\nCozinhe a batata-doce.\nMonte e finalize com azeite.'},
    {id:uid(),name:'Omelete proteico',servings:'1',kcal:'340',ingredients:'3 ovos\n50g queijo\nespinafre',steps:'Bata os ovos.\nLeve à frigideira com o recheio.\nDobre e sirva.'}];
  return s;}
const CV_GROUPS=[
  {g:'Assistir',ic:'🎬',cats:[['movies','Filmes / Séries'],['viral','Vídeos virais'],['cheap','Entretenimento barato']]},
  {g:'Ler',ic:'📚',cats:[['books','Livros / Autores'],['sites','Sites'],['trashy','Coisa rasteira']]},
  {g:'Ouvir',ic:'🎧',cats:[['artists','Artistas / Bandas'],['podcasts','Podcasts'],['guilty','Prazeres culposos']]}];
function defaultsCulture(c){c=c||{};if(!c.items)c.items={};CV_GROUPS.forEach(gr=>gr.cats.forEach(ct=>{if(!c.items[ct[0]])c.items[ct[0]]=[];}));if(c.notes==null)c.notes='';if(!c.refs)c.refs={blog:false,convo:false,hip:false};return c;}
const SAUDE_SCHEMA={
  consultas:{title:'Consulta',icon:'🩺',sort:'date',fields:[['what','Especialidade / Motivo','text'],['doctor','Profissional','text'],['date','Data','date'],['time','Hora','time'],['place','Local','text'],['notes','Observações','textarea']]},
  exames:{title:'Exame',icon:'🧪',sort:'date',fields:[['name','Exame','text'],['date','Data','date'],['status','Status','select:Pendente,Agendado,Feito,Com resultado'],['result','Resultado','text'],['notes','Observações','textarea']]},
  treinos:{title:'Treino',icon:'🏋️',fields:[['name','Nome (ex.: Treino A)','text'],['focus','Foco (grupos musculares)','text'],['exercises','Exercícios','textarea'],['notes','Notas','textarea']]},
  receitas:{title:'Receita',icon:'🍳',fields:[['name','Nome','text'],['servings','Porções','text'],['kcal','Calorias','text'],['ingredients','Ingredientes','textarea'],['steps','Modo de preparo','textarea']]}
};
const WKC=['#c2611f','#9a7b3f','#b4521c','#a8843a','#bd6a24','#8a7a52'];
let inboxDraft='';
const CTXS={
  trabalho:{ic:'⚖️',label:'Trabalho',cor:'#3a4a7a'},
  financas:{ic:'💰',label:'Finanças',cor:'#2f6f4e'},
  rpg:{ic:'🎲',label:'RPG',cor:'#8a3a7a'},
  dev:{ic:'💻',label:'Dev',cor:'#2d6a8a'},
  pessoal:{ic:'✈️',label:'Pessoal',cor:'#b4521c'}};
const TOOLS=[
  {ic:'📓',nm:'Caderno',fn:'Captura rápida e pensamento livre.',fr:'Ideias soltas · brainstorm'},
  {ic:'📝',nm:'OneNote',fn:'Base de conhecimento e procedimentos.',fr:'Fluxos · tutoriais · TRF3'},
  {ic:'📁',nm:'Drive',fn:'Arquivo mestre de documentos.',fr:'PDFs · modelos · planilhas'},
  {ic:'📊',nm:'Excel',fn:'Controle estruturado e quantitativo.',fr:'Finanças · indicadores'},
  {ic:'💻',nm:'GitHub',fn:'Fonte da verdade dos projetos.',fr:'Código · versões · automações'},
  {ic:'🤖',nm:'ChatGPT',fn:'Copiloto cognitivo.',fr:'Estruturar · resumir · planejar'},
  {ic:'📅',nm:'Calendário',fn:'Compromissos inevitáveis.',fr:'Sessões · reuniões · viagens'},
  {ic:'✅',nm:'Este app',fn:'Orquestrador — não armazena tudo.',fr:'O que fazer · onde · onde parei'}];
const FLOW=[['Ideias','Caderno / Inbox'],['Conhecimento','OneNote'],['Arquivos','Drive'],['Dados','Excel'],['Código','GitHub'],['Agenda','Calendário'],['Ação','Este app']];
function ctxTag(k){const c=CTXS[k]||CTXS.pessoal;return `<span class="ctx" style="background:${c.cor}"><span class="ci">${c.ic}</span>${c.label}</span>`;}
function timeAgo(ts){const s=Math.max(0,(Date.now()-ts)/1000);if(s<90)return'agora';const m=s/60;if(m<60)return Math.round(m)+' min';const h=m/60;if(h<24)return Math.round(h)+'h';const d=Math.round(h/24);return d+(d===1?' dia':' dias');}
function pickCtx(){const o=['trabalho','financas','rpg','dev','pessoal'];const n=prompt('Contexto:\n1 ⚖️ Trabalho\n2 💰 Finanças\n3 🎲 RPG\n4 💻 Dev\n5 ✈️ Pessoal','1');return o[parseInt(n)-1]||'pessoal';}
function pickDest(){const o=['Caderno','OneNote','Drive','Excel','GitHub','ChatGPT','Calendário','Virar tarefa'];const n=prompt('Mandar para onde?\n1 Caderno\n2 OneNote\n3 Drive\n4 Excel\n5 GitHub\n6 ChatGPT\n7 Calendário\n8 Virar tarefa','1');return o[parseInt(n)-1];}
function mondayOf(d){const x=new Date(d);const wd=(x.getDay()+6)%7;x.setDate(x.getDate()-wd);x.setHours(0,0,0,0);return x;}
function weekKeyOf(d){const m=mondayOf(d);return m.getFullYear()+'-'+String(m.getMonth()+1).padStart(2,'0')+'-'+String(m.getDate()).padStart(2,'0');}
function hWeeks(){const[y,m]=mes.split('-').map(Number);const dim=new Date(y,m,0).getDate();const weeks=[];let d=1;while(d<=dim){const wk=[];for(let i=0;i<7&&d<=dim;i++,d++)wk.push(d);weeks.push(wk);}return{weeks,y,m,dim};}
function hMarks(){state.habit.marks[mes]=state.habit.marks[mes]||{};return state.habit.marks[mes];}
function hOn(hid,d){const m=state.habit.marks[mes];return !!(m&&m[hid]&&m[hid][d]);}
function ring(pct,size,color){const r=(size-7)/2,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(1,pct/100))),s=size/2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${s}" cy="${s}" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="${s}" cy="${s}" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${s} ${s})"/><text x="${s}" y="${s}" text-anchor="middle" dominant-baseline="central" font-family="Space Mono,monospace" font-weight="700" font-size="${Math.round(size*0.23)}" fill="var(--ink)">${Math.round(pct)}%</text></svg>`;}
function spark(vals,w,h){if(!vals.length)return'';const step=w/Math.max(1,vals.length-1);const pts=vals.map((v,i)=>`${(i*step).toFixed(1)},${(h-(Math.max(0,Math.min(100,v))/100)*h).toFixed(1)}`);const line=pts.join(' ');
  return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="0,${h} ${line} ${w},${h}" fill="var(--pos-soft)"/><polyline points="${line}" fill="none" stroke="var(--pos)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;}
const WKNOTE_META={inegociaveis:{t:'◆ Inegociáveis diários',h:'O que não pode faltar em nenhum dia — treino, leitura, água…'},gratidao:{t:'Gratidão',h:'Três coisas pelas quais sou grato esta semana.'},revisao:{t:'Revisão da semana',h:'O que funcionou, o que drenou energia, o que ajustar.'}};
function openWkNote(field){const m=WKNOTE_META[field]||WKNOTE_META.inegociaveis;const wk=state.habit.weekPlan[weekKeyOf(weekStart)]||{};const box=document.getElementById('wkNoteBox');box.dataset.wp=field;box.value=wk[field]||'';document.getElementById('wkNoteTitle').textContent=m.t;document.getElementById('wkNoteHint').textContent=m.h;openModal('wkNoteModal');setTimeout(()=>box.focus(),60);}
const _wkDone=document.getElementById('wkNoteDone');if(_wkDone)_wkDone.onclick=()=>{closeModals();renderHabit();};
const _qnSet=document.getElementById('qnAlarmSet');if(_qnSet)_qnSet.onclick=()=>{const n=(state.habit.captures||[]).find(x=>x.id===qnAlarmId);if(!n)return;const v=document.getElementById('qnAlarmInput').value;if(v){n.alarm=new Date(v).getTime();n.fired=n.alarm<=Date.now();qnAskNotify();}save();closeModals();gtRender();};
const _qnClr=document.getElementById('qnAlarmClear');if(_qnClr)_qnClr.onclick=()=>{const n=(state.habit.captures||[]).find(x=>x.id===qnAlarmId);if(n){n.alarm=null;n.fired=false;}save();closeModals();gtRender();};
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const t=e.target.closest('#qnText');if(t){e.preventDefault();qnAdd();}const t2=e.target.closest('#tdText');if(t2){e.preventDefault();tdAdd();}const t3=e.target.closest('#capText');if(t3){e.preventDefault();capAdd();}const cv=e.target.closest('[data-cv-add]');if(cv){e.preventDefault();const v=cv.value.trim();if(v){const k=cv.dataset.cvAdd;(state.culture.items[k]=state.culture.items[k]||[]).push({id:uid(),txt:v,done:false});save();gtRender();}}const wa=e.target.closest('#wkAddInput');if(wa){e.preventDefault();const v=wa.value.trim();if(v){state.habit.weekly.push({id:uid(),name:v});save();renderHabit();}}const wt=e.target.closest('#wtInput');if(wt){e.preventDefault();wtAdd();}}});
document.addEventListener('click',e=>{const hd=e.target.closest('[data-hydro]');if(hd){const k=pdStr();const cur=state.habit.hydration[k]||0;const v=+hd.dataset.hydro;state.habit.hydration[k]=(cur===v?v-1:v);save();renderHabit();return;}
  const hdd=e.target.closest('[data-hydro-d]');if(hdd){const k=pdStr();state.habit.hydration[k]=Math.max(0,(state.habit.hydration[k]||0)+(+hdd.dataset.hydroD));save();renderHabit();return;}});
document.addEventListener('input',e=>{const sl=e.target.closest('[data-sleep]');if(sl){const k=pdStr();state.habit.sleep[k]=+sl.value;save();const card=sl.closest('.asleep');if(card){const v=+sl.value;const val=card.querySelector('.trkval');if(val)val.textContent=v?v+'h':'—';const bar=card.querySelector('.slbar i');if(bar)bar.style.width=Math.min(100,(state.habit.sleepGoal?v/state.habit.sleepGoal*100:0)).toFixed(0)+'%';}}});
document.addEventListener('change',e=>{const mv=e.target.closest('[data-td-move]');if(mv){const t=(state.habit.todos||[]).find(x=>x.id===mv.dataset.tdMove);if(t){t.day=mv.value;save();renderHabit();}}
  const trd=e.target.closest('[data-treino-dia]');if(trd){const k=weekKeyOf(weekStart);const o=(state.habit.weekPlan[k]=state.habit.weekPlan[k]||{});o['treinoDia-'+trd.dataset.treinoDia]=trd.value;save();renderHabit();}
  const ddd=e.target.closest('[data-dieta-dia]');if(ddd){const k=weekKeyOf(weekStart);const o=(state.habit.weekPlan[k]=state.habit.weekPlan[k]||{});o['dieta-'+ddd.dataset.dietaDia]=ddd.value;save();renderHabit();}
  const cvr=e.target.closest('[data-cv-ref]');if(cvr){state.culture.refs[cvr.dataset.cvRef]=cvr.checked;save();gtRender();}
  const sto=e.target.closest('[data-slog-toggle]');if(sto){const k=pdStr();const o=(state.habit.sleepLog[k]=state.habit.sleepLog[k]||{});o[sto.dataset.slogToggle]=sto.checked;save();}});
setInterval(qnCheckAlarms,15000);
setInterval(()=>{try{updateRavenBadge();}catch(e){}},20000);
function schedFindBlock(day,id){const wkv=state.habit.weekPlan[weekKeyOf(weekStart)];if(!wkv||!wkv.blocks||!wkv.blocks[day])return null;return wkv.blocks[day].find(b=>b.id===id)||null;}
function wtAdd(){const inp=document.getElementById('wtInput');if(!inp)return;const txt=inp.value.trim();if(!txt)return;const cat=document.getElementById('wtCat')?.value||'ideia';const wk=weekKeyOf(weekStart);const wkv=(state.habit.weekPlan[wk]=state.habit.weekPlan[wk]||{});(wkv.wtasks=wkv.wtasks||[]).unshift({id:uid(),txt,cat,done:false});save();inp.value='';renderHabit();}
function openWtSchedModal(taskId){wtSchedId=taskId;openModal('wtSchedModal');}
function wtAssignToDay(taskId,day,startMin){
  const wk=weekKeyOf(weekStart);const wkv=(state.habit.weekPlan[wk]=state.habit.weekPlan[wk]||{});
  const list=wkv.wtasks||[];const idx=list.findIndex(t=>t.id===taskId);if(idx<0)return;
  const t=list[idx];list.splice(idx,1);
  wkv.blocks=wkv.blocks||{};const dayBlocks=(wkv.blocks[day]=wkv.blocks[day]||[]);
  let st=Math.round(startMin/SCHED_STEP)*SCHED_STEP;st=Math.max(SCHED_START,Math.min(SCHED_END-15,st));
  dayBlocks.push({id:uid(),title:t.txt,desc:'',nota:'',area:'work',color:null,start:st,dur:60});
  save();if(habitMode)renderHabit();
}
let _schedResize=null,wtSchedId=null;
document.addEventListener('input',e=>{const sf=e.target.closest('[data-sbf]');if(sf){const[d,id,k]=sf.dataset.sbf.split(':');const b=schedFindBlock(+d,id);if(b){b[k]=sf.value;save();if(k==='title'){const t=sf.closest('.sblock');}}}
  const pf=e.target.closest('[data-pbf]');if(pf){const[d,id,k]=pf.dataset.pbf.split(':');const b=schedFindBlock(+d,id);if(b){b[k]=pf.value;save();}return;}
  const pd=e.target.closest('[data-pbdur]');if(pd){const[d,id]=pd.dataset.pbdur.split(':');const b=schedFindBlock(+d,id);if(b){let v=Math.round((parseInt(pd.value)||60)/15)*15;v=Math.min(360,Math.max(15,v));b.dur=v;save();updatePbTimes(+d);}return;}
});
document.addEventListener('change',e=>{const sa=e.target.closest('[data-sbarea]');if(sa){const[d,id]=sa.dataset.sbarea.split(':');const b=schedFindBlock(+d,id);if(b){b.area=sa.value;save();paintScheduler();}}
  const pa=e.target.closest('[data-pbarea]');if(pa){const[d,id]=pa.dataset.pbarea.split(':');const b=schedFindBlock(+d,id);if(b){b.area=pa.value;save();renderHabit();}return;}});
document.addEventListener('click',e=>{
  const sad=e.target.closest('[data-sbadd]');if(sad){const day=+sad.dataset.sbadd;const wkv=(state.habit.weekPlan[weekKeyOf(weekStart)]=state.habit.weekPlan[weekKeyOf(weekStart)]||{});wkv.blocks=wkv.blocks||{};const dayBlocks=(wkv.blocks[day]=wkv.blocks[day]||[]);const {items}=schedResolveDay(dayBlocks);const lastEnd=items.length?items[items.length-1].en:SCHED_START;const start=Math.min(lastEnd,SCHED_END-60);const nb={id:uid(),title:'',desc:'',nota:'',area:'work',color:null,start,dur:60};dayBlocks.push(nb);save();paintScheduler();openBlockModal(day,nb.id);return;}
  const sdl=e.target.closest('[data-sbdel]');if(sdl){const[d,id]=sdl.dataset.sbdel.split(':');const wkv=state.habit.weekPlan[weekKeyOf(weekStart)];if(wkv&&wkv.blocks&&wkv.blocks[d]){wkv.blocks[d]=wkv.blocks[d].filter(b=>b.id!==id);save();paintScheduler();}return;}
  const pad=e.target.closest('[data-pbadd]');if(pad){const day=+pad.dataset.pbadd;const wkv=(state.habit.weekPlan[weekKeyOf(weekStart)]=state.habit.weekPlan[weekKeyOf(weekStart)]||{});wkv.blocks=wkv.blocks||{};const dayBlocks=(wkv.blocks[day]=wkv.blocks[day]||[]);const {items}=schedResolveDay(dayBlocks);const lastEnd=items.length?items[items.length-1].en:SCHED_START;const start=Math.min(lastEnd,SCHED_END-60);const nb={id:uid(),title:'',desc:'',nota:'',area:'work',color:null,start,dur:60};dayBlocks.push(nb);save();renderHabit();openBlockModal(day,nb.id);return;}
  const pdl=e.target.closest('[data-pbdel]');if(pdl){const[d,id]=pdl.dataset.pbdel.split(':');const wkv=state.habit.weekPlan[weekKeyOf(weekStart)];if(wkv&&wkv.blocks&&wkv.blocks[d]){wkv.blocks[d]=wkv.blocks[d].filter(b=>b.id!==id);save();renderHabit();}return;}
  const sbo=e.target.closest('[data-sb-open]');if(sbo&&!e.target.closest('.sbresize')){const[d,id]=sbo.dataset.sbOpen.split(':');openBlockModal(+d,id);return;}
  const pbo=e.target.closest('[data-pbopen]');if(pbo){const[d,id]=pbo.dataset.pbopen.split(':');openBlockModal(+d,id);return;}
});
document.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-sbresize]');if(!h)return;const[d,id]=h.dataset.sbresize.split(':');const b=schedFindBlock(+d,id);if(!b)return;_schedResize={day:+d,id,startY:e.clientY,startDur:b.dur||60};h.closest('.sblock').classList.add('is-resizing');try{h.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
document.addEventListener('pointermove',e=>{if(!_schedResize)return;const slotH=16;const delta=(e.clientY-_schedResize.startY)/slotH;let nd=Math.round((_schedResize.startDur+delta*SCHED_STEP)/SCHED_STEP)*SCHED_STEP;nd=Math.min(360,Math.max(SCHED_STEP,nd));const b=schedFindBlock(_schedResize.day,_schedResize.id);if(b&&b.dur!==nd){b.dur=nd;paintScheduler();}});
document.addEventListener('pointerup',()=>{if(_schedResize){save();_schedResize=null;document.querySelectorAll('.sblock.is-resizing').forEach(x=>x.classList.remove('is-resizing'));}});
document.addEventListener('dragstart',e=>{const chip=e.target.closest('[data-wtask]');if(!chip)return;e.dataTransfer.setData('text/plain',chip.dataset.wtask);e.dataTransfer.effectAllowed='move';chip.classList.add('dragging');});
document.addEventListener('dragend',e=>{const chip=e.target.closest('[data-wtask]');if(chip)chip.classList.remove('dragging');document.querySelectorAll('.schcol.dragover').forEach(c=>c.classList.remove('dragover'));});
document.addEventListener('dragover',e=>{const col=e.target.closest('.schcol');if(col){e.preventDefault();col.classList.add('dragover');}});
document.addEventListener('dragleave',e=>{const col=e.target.closest('.schcol');if(col&&!col.contains(e.relatedTarget))col.classList.remove('dragover');});
document.addEventListener('drop',e=>{const col=e.target.closest('.schcol');if(!col)return;e.preventDefault();col.classList.remove('dragover');const taskId=e.dataTransfer.getData('text/plain');if(!taskId)return;const day=+col.dataset.schday;const rect=col.getBoundingClientRect();const y=e.clientY-rect.top;const slotIdx=Math.max(0,Math.min(SCHED_ROWS-1,Math.round(y/16)));const start=SCHED_START+slotIdx*SCHED_STEP;wtAssignToDay(taskId,day,start);});
function tdDayLabel(day,today){if(!day)return 'sem data';const d=new Date(day+'T00:00:00'),t=new Date(today+'T00:00:00');const diff=Math.round((d-t)/864e5);if(diff===0)return 'hoje';if(diff===1)return 'amanhã';if(diff===-1)return 'ontem';if(diff<0)return Math.abs(diff)+'d atrás';return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});}
function tdAdd(){const t=document.getElementById('tdText');if(!t)return;const txt=t.value.trim();if(!txt)return;const day=document.getElementById('tdDay').value||'';state.habit.todos=state.habit.todos||[];state.habit.todos.unshift({id:uid(),txt,day,done:false,ts:Date.now()});save();renderHabit();}
function qnAlarmLabel(ts){const d=new Date(ts),now=new Date();const sameDay=d.toDateString()===now.toDateString();const tm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');const dp=sameDay?'hoje':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});return dp+' '+tm;}
function qnAdd(){const t=document.getElementById('qnText');if(!t)return;const txt=t.value.trim();if(!txt)return;const cat=document.getElementById('qnCat').value;const al=document.getElementById('qnAlarm').value;const alarm=al?new Date(al).getTime():null;if(alarm)qnAskNotify();state.habit.qnotes.unshift({id:uid(),txt,cat,alarm,fired:false,done:false,ts:Date.now()});save();renderHabit();}
function qnAskNotify(){try{if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}}
function openQnAlarm(id){qnAlarmId=id;const n=(state.habit.captures||[]).find(x=>x.id===id);if(!n)return;document.getElementById('qnAlarmTxt').textContent=n.txt;const inp=document.getElementById('qnAlarmInput');if(n.alarm){const d=new Date(n.alarm);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());inp.value=d.toISOString().slice(0,16);}else if(n.date){const d=new Date(n.date+'T'+(n.time||'09:00'));d.setMinutes(d.getMinutes()-d.getTimezoneOffset());inp.value=d.toISOString().slice(0,16);}else{const d=new Date(Date.now()+36e5);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());inp.value=d.toISOString().slice(0,16);}openModal('qnAlarmModal');}
function qnBeep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const x=new C();const o= x.createOscillator(),g=x.createGain();o.connect(g);g.connect(x.destination);o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(0.001,x.currentTime);g.gain.exponentialRampToValueAtTime(0.4,x.currentTime+0.02);g.gain.exponentialRampToValueAtTime(0.001,x.currentTime+0.5);o.start();o.stop(x.currentTime+0.52);setTimeout(()=>{const o2=x.createOscillator(),g2=x.createGain();o2.connect(g2);g2.connect(x.destination);o2.type='sine';o2.frequency.value=1175;g2.gain.setValueAtTime(0.001,x.currentTime);g2.gain.exponentialRampToValueAtTime(0.4,x.currentTime+0.02);g2.gain.exponentialRampToValueAtTime(0.001,x.currentTime+0.5);o2.start();o2.stop(x.currentTime+0.52);},260);}catch(e){}}
function qnToast(n){const cats=state.habit.qcats||[];const c=cats.find(x=>x.id===n.cat)||{name:'Nota',color:'#b4521c'};let host=document.getElementById('qnToastHost');if(!host){host=document.createElement('div');host.id='qnToastHost';document.body.appendChild(host);}const el=document.createElement('div');el.className='qntoast';el.style.setProperty('--cc',c.color);el.innerHTML=`<div class="qtic">⏰</div><div class="qtbd"><div class="qtcat">${hesc(c.name)} · alarme</div><div class="qttx">${hesc(n.txt)}</div></div><button class="qtx">✕</button>`;el.querySelector('.qtx').onclick=()=>el.remove();host.appendChild(el);qnBeep();try{if('Notification'in window&&Notification.permission==='granted')new Notification('⏰ '+c.name,{body:n.txt});}catch(e){}setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),400);},9000);}
function qnCheckAlarms(){if(typeof state==='undefined'||!state||!state.habit)return;const now=Date.now();let hit=false;(state.habit.captures||[]).forEach(n=>{if(n.alarm&&!n.fired&&!n.done&&n.alarm<=now){n.fired=true;hit=true;qnToast(n);}});if(hit){save();if(typeof gtRender==='function')gtRender();}}
const RHYTHM_AREAS=[{id:'work',name:'Trabalho',color:'#c95f1c'},{id:'nutrition',name:'Nutrição',color:'#768b43'},{id:'movement',name:'Movimento',color:'#557fb6'},{id:'relations',name:'Relações',color:'#c77276'},{id:'space',name:'Meu Espaço',color:'#b58b3d'},{id:'rest',name:'Descanso',color:'#7658a5'},{id:'mind',name:'Mindfulness',color:'#5e95a7'}];
let pjCollapse={},sonoNoteOpen={},mgTrkOpen={};
const rhm=m=>{const hh=Math.floor(m/60),mm=m%60;return mm?hh+'h'+String(mm).padStart(2,'0'):hh+'h';};
function pjSection(id,title,body,sub){const open=!pjCollapse[id];return `<section class="pjsec${open?'':' col'}"><button type="button" class="pjsech" data-pjsec="${id}"><span class="pjsect">${title}</span>${sub?`<span class="pjsecsub">${sub}</span>`:''}<span class="pjseca">${open?'▾':'▸'}</span></button><div class="pjsecbody">${body}</div></section>`;}
function pjRhythmData(){const wkvR=state.habit.weekPlan[weekKeyOf(weekStart)]||{};const rmins={};RHYTHM_AREAS.forEach(a=>rmins[a.id]=0);let rtot=0;for(let d=0;d<7;d++){((wkvR.blocks&&wkvR.blocks[d])||[]).forEach(b=>{if(rmins[b.area]!=null){rmins[b.area]+=(b.dur||0);rtot+=(b.dur||0);}});}return {wkvR,rmins,rtot};}
function rhythmWheelHTML(){const wheelLabels=RHYTHM_AREAS.map((a,i)=>{const ang=i*51.4286+25.714;return `<span class="rwlabel" style="transform:translate(-50%,-50%) rotate(${ang.toFixed(2)}deg) translateY(-94px) rotate(${(-ang).toFixed(2)}deg)">${a.name}</span>`;}).join('');return `<div class="rwheelwrap"><div class="rwheel"></div>${wheelLabels}<div class="rwcenter">semana<br>integrada</div></div>`;}
function rhythmCoverageHTML(){const {rmins,rtot}=pjRhythmData();const rmax=Math.max(60,...RHYTHM_AREAS.map(a=>rmins[a.id]));return `<div class="rcov2">`+RHYTHM_AREAS.map(a=>{const mn=rmins[a.id];const pct=rmax?mn/rmax*100:0;return `<div class="rcov2row"><span class="rcovl">${a.name}</span><div class="rcbar"><i style="width:${pct.toFixed(0)}%;background:${a.color}"></i></div><span class="rcovv">${mn?rhm(mn):'—'}</span></div>`;}).join('')+`</div><div class="rcovtot">Total planejado: <b>${rtot?rhm(rtot):'0h'}</b></div>`;}
function rhythmBalanceHTML(){const R=state.habit.rhythm;const weakLabels=['Relações','Movimento','Mindfulness'];let h=`<div class="rsubh">Áreas fracas · ação mínima</div>`+weakLabels.map((l,i)=>`<label class="rwk"><span>${l}</span><textarea data-rweak="${i}" placeholder="Ação mínima…">${hesc(R.weak[i]||'')}</textarea></label>`).join('');const checkTxt=['Confirmar quais áreas precisam de reforço.','O theme do dia resolve áreas fracas, não só repete rotina.','Todo bloco tem função e área.','Nenhuma área da roda termina zerada.','Descanso é bloco positivo, não vazio.','Buffers protegem blocos de trabalho pesado.'];h+=`<div class="rsubh" style="margin-top:12px">Balance check</div>`+checkTxt.map((t,i)=>`<label class="rchk${R.checks[i]?' on':''}"><span class="rbox" data-rcheck="${i}">${R.checks[i]?'✓':''}</span><span>${t}</span></label>`).join('')+`<label class="rwk" style="margin-top:7px"><span>Correção estrutural da semana</span><textarea data-rfield="correction" placeholder="O que mudar antes de colocar horários?">${hesc(R.correction||'')}</textarea></label>`;return h;}
function rhythmDaysHTML(){const {wkvR}=pjRhythmData();const R=state.habit.rhythm;const days=[['seg','Segunda'],['ter','Terça'],['qua','Quarta'],['qui','Quinta'],['sex','Sexta'],['sab','Sábado'],['dom','Domingo']];
  return `<div class="rdays">`+days.map((d,di)=>{const t=R.themes[d[0]]||{};const {items}=schedResolveDay((wkvR.blocks&&wkvR.blocks[di])||[]);
    const blocksHTML=items.map(({b,st,en})=>{const a=RHYTHM_AREAS.find(x=>x.id===b.area)||RHYTHM_AREAS[0];const cc=a.color;return `<div class="pbk" style="--cc:${cc}" data-pbopen="${di}:${b.id}"><span class="pbdot"></span><span class="pbttl">${hesc(b.title||'Bloco')}</span><span class="pbtime">${schedTime(st)}–${schedTime(en)}</span><span class="pbarrow">✎</span></div>`;}).join('')||`<div class="pbempty">Sem blocos — adicione abaixo.</div>`;
    return `<div class="rday"><div class="rdayhd"><span class="rdaynm">${d[1]}</span><input class="rdaytheme" data-rtheme="${d[0]}:t" value="${hesc(t.t||'')}" placeholder="Theme do dia"></div><div class="rdayblocks">${blocksHTML}<button class="pbadd" data-pbadd="${di}">＋ bloco</button></div></div>`;}).join('')+`</div>`;
}
function renderPlanejador(){
  const H=state.habit;const{weeks,y,m,dim}=hWeeks();const daily=H.daily;
  const mpv=(H.monthPlan[mes]=H.monthPlan[mes]||{});
  let progBody='<div class="hweeks">';weeks.forEach((wk,wi)=>{const col=WKC[wi%WKC.length];let done=0,poss=wk.length*daily.length;wk.forEach(d=>daily.forEach(hb=>{if(hOn(hb.id,d))done++;}));const pct=poss?done/poss*100:0;progBody+=`<div class="hweekc"><div class="wl">Sem ${wi+1}</div>${ring(pct,62,col)}<div class="wc2"><b>${done}</b>/${poss}</div></div>`;});progBody+='</div>';
  const wm=(H.wmarks[mes]=H.wmarks[mes]||{});let wkBody='<div class="hwkgrid">';weeks.forEach((wk,wi)=>{const col=WKC[wi%WKC.length];wkBody+=`<div class="hwkcol"><div class="hwkh" style="--wc:${col}">Sem ${wi+1}</div>`;H.weekly.forEach(w=>{const on=!!(wm[w.id]&&wm[w.id][wi]);wkBody+=`<div class="hwkitem ${on?'on':''}" data-hw="${w.id}:${wi}"><span class="box">✓</span><span>${hesc(w.name)}</span></div>`;});wkBody+='</div>';});wkBody+='</div>';
  let manageBody='<div class="pjwk">';H.weekly.forEach(w=>{manageBody+=`<div class="pjwkrow"><span>${hesc(w.name)}</span><button class="pjwkdel" data-delwk="${w.id}" title="remover">✕</button></div>`;});manageBody+=`<div class="pjwkadd"><input id="wkAddInput" placeholder="Novo hábito semanal…"><button id="wkAddBtn">+ adicionar</button></div></div>`;
  const focoBody=`<div class="pjfoco"><div class="asec ames"><span class="al">Foco do mês</span><textarea class="abox" data-mp="foco" placeholder="Uma intenção para o mês">${hesc(mpv.foco||'')}</textarea></div><div class="asec"><span class="al">Metas do mês</span><textarea class="abox" data-mp="metas" placeholder="O que quero concluir">${hesc(mpv.metas||'')}</textarea></div></div>`;
  const rodaBody=`<div class="rroda"><div class="rcard rwheelcard">${rhythmWheelHTML()}</div><div class="rcard"><div class="rct">Cobertura por área · blocos</div>${rhythmCoverageHTML()}</div></div>`;
  let main='';
  main+=pjSection('foco','Foco & metas do mês',focoBody,monthLabel(mes));
  main+=pjSection('roda','Roda da semana & cobertura',rodaBody);
  main+=pjSection('balance','Equilíbrio & áreas fracas',rhythmBalanceHTML());
  main+=pjSection('blocos','Blocos da semana',`<p class="chelp" style="margin:-2px 2px 10px">O que você planeja aqui é exatamente o que aparece na planilha da Semana — e a área de cada bloco alimenta a cobertura.</p>`+rhythmDaysHTML(),'sincronizado');
  main+=pjSection('gerir','Gerir hábitos semanais',manageBody);
  let side='';
  side+=pjSection('prog','Progresso das semanas',progBody);
  side+=pjSection('hsem','Hábitos semanais',wkBody);
  let h=`<div class="cctitle"><span class="e">visão do mês</span><span class="t">Planejador</span><span class="ln"></span></div>`;
  h+=`<p class="chelp">Visão mensal organizada em seções minimizáveis — o progresso fica fixo na lateral.</p>`;
  h+=`<div class="pjwrap"><div class="pjmain">${main}</div><aside class="pjside">${side}</aside></div>`;
  return h;
}
function renderSonoSheet(){
  const H=state.habit,today=pdStr();
  H.sleep=H.sleep||{};H.sleepLog=H.sleepLog||{};H.sleepRoutine=H.sleepRoutine||{};H.hydration=H.hydration||{};H.medsLog=H.medsLog||{};H.medications=H.medications||[];
  H.healthMonth=H.healthMonth||today.slice(0,7);
  H.medications.forEach(m=>{if(!m.times)m.times=[];if(m.quantity==null)m.quantity=1;});
  const slp=+(H.sleep[today]||0),SL=(H.sleepLog[today]=H.sleepLog[today]||{}),SR=(H.sleepRoutine[today]=H.sleepRoutine[today]||{});
  const satEmoji=v=>({1:'😫',2:'😕',3:'😐',4:'🙂',5:'😄'}[+v]||'—');
  const prevDate=(()=>{const d=new Date(today+'T12:00:00');d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)})();
  const prevSR=H.sleepRoutine[prevDate]||{};
  const seg=(f,opts,cur)=>`<div class="slseg">${opts.map(o=>`<button class="slsegb${cur===o?' on':''}" data-slog-seg="${f}:${o}">${o}</button>`).join('')}</div>`;
  const chips=(f,opts,arr)=>`<div class="slchips">${opts.map(o=>`<button class="slchip${(arr||[]).indexOf(o)>=0?' on':''}" data-slog-chip="${f}:${o}">${o}</button>`).join('')}</div>`;
  const noteBtn=(f,label,ph)=>{const filled=(SL[f]||'').trim(),open=sonoNoteOpen[f]||!!filled;return `<div class="slnote${open?' open':''}"><button class="slnoteh" data-slnote="${f}"><span class="slnotel">${label}</span>${filled?'<span class="slnotedot"></span>':''}<span class="slnotechev">⌄</span></button><div class="slnotebody"><textarea data-slog="${f}" rows="2" placeholder="${ph}">${hesc(SL[f]||'')}</textarea></div></div>`;};
  const D=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  const hm=H.healthMonth,[yy,mm]=hm.split('-').map(Number),days=new Date(yy,mm,0).getDate(),first=(new Date(yy,mm-1,1).getDay()+6)%7;
  const expectedFor=(med)=>Math.max(1,(med.times||[]).length)*(+(med.quantity||1));
  const takenTokens=(date)=>H.medsLog[date]||[];
  const medDoneCount=(date,med)=>{const L=takenTokens(date);return L.filter(x=>x===med.id||String(x).startsWith(med.id+'@')).length;};
  const monthDates=Array.from({length:days},(_,i)=>`${hm}-${String(i+1).padStart(2,'0')}`);
  const sleepVals=monthDates.map(d=>+H.sleep[d]||0).filter(v=>v>0),avg=sleepVals.length?sleepVals.reduce((a,b)=>a+b,0)/sleepVals.length:0;
  const waterVals=monthDates.map(d=>+H.hydration[d]||0),waterAvg=waterVals.length?waterVals.reduce((a,b)=>a+b,0)/waterVals.length:0;const expenseTotal=monthDates.reduce((s,d)=>s+(+H.dailyExpense?.[d]||0),0);
  let medExpected=0,medTaken=0;monthDates.forEach(d=>H.medications.forEach(m=>{medExpected+=expectedFor(m);medTaken+=Math.min(expectedFor(m),medDoneCount(d,m));}));
  const cells=[];for(let i=0;i<first;i++)cells.push('<div class="health-day empty"></div>');
  monthDates.forEach((d,i)=>{const sv=+H.sleep[d]||0,w=+H.hydration[d]||0,g=+(window.getDailyExpenseTotal?window.getDailyExpenseTotal(d):(H.dailyExpense?.[d]||0));let exp=0,done=0;H.medications.forEach(m=>{exp+=expectedFor(m);done+=Math.min(expectedFor(m),medDoneCount(d,m));});const pct=exp?Math.round(done/exp*100):0;cells.push(`<button class="health-day${d===today?' today':''}" data-health-date="${d}"><span class="hdn">${i+1}</span><span class="hdrow sleep">☾ <b>${sv?sv+'h':'—'}</b></span><span class="hdrow satisfaction">${satEmoji(H.sleepRoutine[d]?.satisfaction)} <b>${H.sleepRoutine[d]?.wakeTime||'—'}</b></span><span class="hdrow water">💧 <b>${w}/${H.hydrationGoal||8}</b></span><span class="hdrow med">💊 <b>${exp?done+'/'+exp:'—'}</b></span><span class="hdrow expense">◈ <b>${g?'R$ '+g.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</b></span><i class="hdmedbar"><i style="width:${pct}%"></i></i></button>`);});
  const monthName=new Date(yy,mm-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const todayTaken=takenTokens(today);
  const medsHTML=H.medications.map(m=>{const times=(m.times||[]);return `<article class="med-card" data-med-card="${m.id}"><div class="med-card-head"><div><b>${hesc(m.name)}</b><small>${hesc(m.dose||'Sem descrição')} · quantidade ${m.quantity||1}</small></div><div class="med-card-actions"><button data-med-edit="${m.id}" title="Editar">✎</button><button data-med-del="${m.id}" title="Excluir">×</button></div></div><div class="med-times">${times.length?times.map(t=>{const token=m.id+'@'+t,checked=todayTaken.includes(token)||todayTaken.includes(m.id);return `<label class="med-time${checked?' done':''}"><input type="checkbox" data-med-dose="${token}" ${checked?'checked':''}><span>${t}</span><small>${m.quantity||1} un.</small></label>`;}).join(''):`<span class="med-no-time">Sem horário definido</span>`}</div></article>`;}).join('')||'<div class="med-empty">Nenhuma medicação cadastrada.</div>';
  let h=`<div class="cctitle"><span class="e">saúde & recuperação</span><span class="t">Saúde</span><span class="ln"></span></div>`;
  h+=`<p class="chelp">${D} — sono, hidratação e medicação em uma base diária integrada.</p>`;
  h+=`<section class="health-month"><header><div><small>Histórico mensal</small><h3>${monthName}</h3></div><div class="health-month-nav"><button data-health-month-step="-1">‹</button><input type="month" data-health-month value="${hm}"><button data-health-month-step="1">›</button></div></header><div class="health-kpis"><div><small>Sono médio</small><b>${avg?avg.toFixed(1)+'h':'—'}</b></div><div><small>Hidratação média</small><b>${waterAvg.toFixed(1)} copos</b></div><div><small>Adesão medicamentosa</small><b>${medExpected?Math.round(medTaken/medExpected*100)+'%':'—'}</b></div><div><small>Gastos registrados</small><b>${expenseTotal?'R$ '+expenseTotal.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</b></div></div><div class="health-weekdays">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<span>${x}</span>`).join('')}</div><div class="health-grid">${cells.join('')}</div></section>`;
  h+=`<section class="med-manager"><header><div><small>Tratamento atual</small><h3>Medicações</h3></div><button class="med-add" data-med-add>＋ Adicionar medicação</button></header><div class="med-list">${medsHTML}</div></section>`;
  h+=`<section class="sleep-daily-card"><header><div><small>Registro associado a ${new Date(today+'T12:00:00').toLocaleDateString('pt-BR')}</small><h3>Ritmo diário do sono</h3></div><div class="sleep-calc-pill"><span>Noite calculada</span><b>${slp?slp.toFixed(1)+'h':'aguardando dados'}</b></div></header><div class="sleep-daily-fields"><label><span>Hora que acordei hoje</span><input type="time" data-sleep-routine="wakeTime" value="${hesc(SR.wakeTime||'')}"></label><label><span>Hora que vou dormir hoje</span><input type="time" data-sleep-routine="bedTime" value="${hesc(SR.bedTime||'')}"></label><div class="sleep-origin"><small>Cálculo desta noite</small><b>${prevSR.bedTime?prevSR.bedTime+' de ontem':'hora de dormir de ontem não registrada'} → ${SR.wakeTime||'hora de acordar de hoje'}</b></div></div><div class="sleep-satisfaction"><span>Como foi o sono?</span><div>${[[1,'😫','Péssimo'],[2,'😕','Ruim'],[3,'😐','Regular'],[4,'🙂','Bom'],[5,'😄','Ótimo']].map(x=>`<button type="button" data-sleep-satisfaction="${x[0]}" class="${+SR.satisfaction===x[0]?'on':''}"><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div></div></section>`;
  h+=`<div class="sonopage"><div class="sonocard"><div class="sonoct">Sono de hoje</div><div class="slgrid2"><label class="slf"><span>Deitar</span><input type="time" data-slog="bedtime" value="${hesc(SL.bedtime||'')}"></label><label class="slf"><span>Adormeci</span><input type="time" data-slog="fellAsleep" value="${hesc(SL.fellAsleep||'')}"></label><label class="slf"><span>Acordei</span><input type="time" data-slog="wakeTime" value="${hesc(SL.wakeTime||'')}"></label><label class="slf"><span>Levantei</span><input type="time" data-slog="getOut" value="${hesc(SL.getOut||'')}"></label></div><label class="slf wide"><span>Tempo total de sono (h)</span><input type="number" min="0" max="14" step="0.5" data-sleep="1" value="${slp||''}" placeholder="ex.: 8"></label></div>`;
  h+=`<div class="sonocard"><div class="sonoct">Estado ao acordar</div><div class="slblk"><span class="sll">Qualidade do sono</span>${seg('quality',['Ruim','Média','Boa'],SL.quality)}</div><div class="slblk"><span class="sll">Energia</span>${seg('energy',['Baixa','Média','Alta'],SL.energy)}</div><div class="slblk"><span class="sll">Estado do corpo</span>${seg('bodyState',['Esgotado','Equilibrado','Renovado'],SL.bodyState)}</div></div>`;
  h+=`<div class="sonocard"><div class="sonoct">Hidratação de hoje</div><div class="health-water-now"><button data-hydro-d="-1">−</button><b>${H.hydration[today]||0}<small> / ${H.hydrationGoal||8} copos</small></b><button data-hydro-d="1">＋</button></div><label class="slf wide"><span>Meta diária de copos</span><input type="number" min="1" max="30" data-hydro-goal value="${H.hydrationGoal||8}"></label></div>`;
  h+=`<div class="sonocard"><div class="sonoct">Mente & registros</div><div class="slblk"><span class="sll">Mente antes de dormir</span>${chips('mentalBefore',['Ansioso','Inquieto','Acelerado','Disperso','Calmo','Relaxado'],SL.mentalBefore)}</div><div class="slnotes">${noteBtn('notesBefore','🌙 Antes de dormir','Pensamentos e preocupações…')}${noteBtn('notes','☀ Ao acordar','Sonhos, despertares e sensações…')}</div></div></div>`;
  return h;
}
const SCHED_AREAS={work:{c:'#c95f1c',n:'Trabalho',ic:'◆'},nutrition:{c:'#768b43',n:'Nutrição',ic:'◒'},movement:{c:'#557fb6',n:'Movimento',ic:'▲'},relations:{c:'#c77276',n:'Relações',ic:'✦'},space:{c:'#b58b3d',n:'Meu Espaço',ic:'▣'},rest:{c:'#7658a5',n:'Descanso',ic:'◐'},mind:{c:'#5e95a7',n:'Mindfulness',ic:'✧'}};
const SCHED_START=360,SCHED_END=1320,SCHED_STEP=15,SCHED_ROWS=(1320-360)/15;
function schedTime(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function timeToMin(s){if(!s)return null;const p=s.split(':');return (+p[0])*60+(+(p[1]||0));}
function schedResolveDay(blocks){
  let list=(blocks||[]).slice();
  list.forEach(b=>{if(b.start==null)b.start=SCHED_START;if(b.dur==null)b.dur=60;});
  list.sort((a,b)=>a.start-b.start);
  const items=[],gaps=[];let cur=SCHED_START;
  list.forEach(b=>{
    let st=Math.max(SCHED_START,Math.min(SCHED_END-15,b.start));
    let en=Math.max(st+15,Math.min(SCHED_END,st+(b.dur||60)));
    if(st>cur)gaps.push([cur,st]);
    items.push({b,st,en});
    cur=Math.max(cur,en);
  });
  if(cur<SCHED_END)gaps.push([cur,SCHED_END]);
  return {items,gaps};
}
let bmDay=null,bmId=null;
function openBlockModal(day,id){
  bmDay=day;bmId=id;
  const b=schedFindBlock(day,id);if(!b)return;
  if(b.start==null)b.start=SCHED_START;if(b.dur==null)b.dur=60;
  const en=b.start+b.dur;
  const areaSel=document.getElementById('bmArea');
  areaSel.innerHTML=Object.keys(SCHED_AREAS).map(k=>`<option value="${k}">${SCHED_AREAS[k].ic} ${SCHED_AREAS[k].n}</option>`).join('');
  areaSel.value=b.area||'work';
  document.getElementById('bmTitle').value=b.title||'';
  document.getElementById('bmStart').value=schedTime(b.start);
  document.getElementById('bmEnd').value=schedTime(en);
  document.getElementById('bmDesc').value=b.desc||'';
  document.getElementById('bmNota').value=b.nota||'';
  document.getElementById('bmIndisp').checked=!!b.indispensavel;
  openModal('blockModal');
}
function bmApplyTimes(){
  const b=schedFindBlock(bmDay,bmId);if(!b)return;
  let st=timeToMin(document.getElementById('bmStart').value);
  let en=timeToMin(document.getElementById('bmEnd').value);
  if(st==null||en==null)return;
  st=Math.round(st/15)*15;en=Math.round(en/15)*15;
  st=Math.max(SCHED_START,Math.min(SCHED_END-15,st));
  if(en<=st)en=st+15;en=Math.min(SCHED_END,en);
  b.start=st;b.dur=en-st;save();
}
function closeBlockModal(){closeModals();if(habitMode)renderHabit();bmDay=null;bmId=null;}
function buildSchedulerHTML(){
  const wkv=state.habit.weekPlan[weekKeyOf(weekStart)]||{};
  const wmon=mondayOf(weekStart),WDl=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],today=new Date();
  let axis='<div class="schaxis">';
  for(let i=0;i<SCHED_ROWS;i++){const t=SCHED_START+i*SCHED_STEP;const cls=t%60===0?'hour':(t%30===0?'half':'');axis+=`<div class="schslot ${cls}">${t%60===0?String(t/60).padStart(2,'0')+'h':(t%30===0?':30':'')}</div>`;}
  axis+='</div>';
  let head='<div class="schcorner">15<small>min</small></div>';
  for(let i=0;i<7;i++){const dd=new Date(wmon);dd.setDate(wmon.getDate()+i);const tdy=dd.toDateString()===today.toDateString();const wknd=i>=5;head+=`<div class="schdh${tdy?' today':''}${wknd?' wknd':''}"><span class="schdl">${WDl[i]}</span><span class="schdn">${dd.getDate()}</span></div>`;}
  let cols='';
  for(let i=0;i<7;i++){
    const {items,gaps}=schedResolveDay((wkv.blocks&&wkv.blocks[i])||[]);
    const combined=[...items.map(x=>({...x,kind:'b'})),...gaps.map(g=>({st:g[0],en:g[1],kind:'g'}))].sort((a,b)=>a.st-b.st);
    let inner='';
    combined.forEach(c=>{
      const rs=Math.round((c.st-SCHED_START)/SCHED_STEP)+1,span=Math.round((c.en-c.st)/SCHED_STEP);
      if(c.kind==='g'){inner+=`<div class="sblock flex" style="grid-row:${rs}/span ${span}"><span class="sbflex">Buffer · Flex</span></div>`;return;}
      const b=c.b,a=SCHED_AREAS[b.area]||SCHED_AREAS.work,cc=a.c;
      inner+=`<div class="sblock" style="--cc:${cc};grid-row:${rs}/span ${span}" data-sb-open="${i}:${b.id}"><div class="sbtop"><span class="sbic">${a.ic}</span><span class="sbttl">${hesc(b.title||'Bloco')}</span></div><span class="sbrange">${schedTime(c.st)}–${schedTime(c.en)}</span><div class="sbresize" data-sbresize="${i}:${b.id}" title="arrastar para redimensionar"></div></div>`;
    });
    cols+=`<div class="schcol${i>=5?' wknd':''}" data-schday="${i}">${inner}<button class="sbadd" data-sbadd="${i}">＋ bloco</button></div>`;
  }
  return `<div class="sched"><div class="schhead">${head}</div><div class="schbody">${axis}${cols}</div></div>`;
}
function paintScheduler(){const w=document.querySelector('.wgwrap');if(w)w.innerHTML=buildSchedulerHTML();}
function updatePbTimes(di){const wkv=state.habit.weekPlan[weekKeyOf(weekStart)]||{};const blocks=(wkv.blocks&&wkv.blocks[di])||[];let cur=SCHED_START;blocks.forEach(b=>{let dur=Math.max(15,b.dur||60);if(cur+dur>SCHED_END)dur=Math.max(15,SCHED_END-cur);const el=document.querySelector('[data-pbtime="'+di+':'+b.id+'"]');if(el)el.textContent=schedTime(cur)+'–'+schedTime(cur+dur);cur+=dur;});}
function renderHabit(){
  const el=document.getElementById('habitApp');if(!el)return;
  const sh0=el.querySelector('.hsheet');const prevScroll=sh0?sh0.scrollLeft:0;
  const H=state.habit;const{weeks,y,m,dim}=hWeeks();hMarks();const daily=H.daily;
  const dayPct=[];for(let d=1;d<=dim;d++){let on=0;daily.forEach(h=>{if(hOn(h.id,d))on++;});dayPct.push(daily.length?on/daily.length*100:0);}
  let totDone=0,totGoal=0;daily.forEach(h=>{let c=0;for(let d=1;d<=dim;d++)if(hOn(h.id,d))c++;totDone+=c;totGoal+=(h.goal||dim);});
  const overall=totGoal?totDone/totGoal*100:0;
  let html='',asideHTML='',aside2HTML='',planHTML='',trkbarsHTML='',sonoHTML='',afazeresView='';
  const MOODS=[{e:'·',c:'transparent'},{e:'😣',c:'#c2611f'},{e:'😟',c:'#cb8a3a'},{e:'😐',c:'#9a7b3f'},{e:'🙂',c:'#5b8c5a'},{e:'😄',c:'#2f8a4e'}];

  if(activeHabitTab==='habit'){
    {const MMl=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];const WDl=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
      const wmon=mondayOf(weekStart),wsun=new Date(wmon);wsun.setDate(wmon.getDate()+6);
      const wkkey=weekKeyOf(weekStart),wkv=(H.weekPlan[wkkey]=H.weekPlan[wkkey]||{});
      const _wkEnd=new Date(wmon);_wkEnd.setDate(wmon.getDate()+6);_wkEnd.setHours(23,59,59,999);
      const capByCell={},looseCaps=[];
      (H.captures||[]).forEach(cp=>{if(cp.done||!cp.date)return;const d=new Date(cp.date+'T00:00:00');if(d<wmon||d>_wkEnd)return;const dayIdx=Math.round((d-wmon)/864e5);if(cp.time){const hh=parseInt(cp.time.split(':')[0]);(capByCell[dayIdx+'-'+hh]=capByCell[dayIdx+'-'+hh]||[]).push(cp);}else looseCaps.push({cp,dayIdx});});
      const WDX=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
      let looseListHTML='';if(looseCaps.length){looseListHTML='<div class="wloosecaps">'+looseCaps.map(({cp,dayIdx})=>{const a=areaById(cp.area);return `<span class="wlchip${cp.kind==='task'?' task':''}" data-cap-open="${cp.id}" style="--cc:${a?a.color:'#9a7b3f'}">${cp.kind==='task'?'☑ ':'• '}${hesc(cp.txt)} <i>${WDX[dayIdx]}</i></span>`;}).join('')+'</div>';}
      const wrange=wmon.getMonth()===wsun.getMonth()?`${wmon.getDate()}–${wsun.getDate()} ${MMl[wmon.getMonth()]}`:`${wmon.getDate()} ${MMl[wmon.getMonth()]} – ${wsun.getDate()} ${MMl[wsun.getMonth()]}`;
      let whead='<th class="wgcorner"></th>';
      let todayIdx=-1;for(let i=0;i<7;i++){const dd=new Date(wmon);dd.setDate(wmon.getDate()+i);if(dd.toDateString()===new Date().toDateString())todayIdx=i;}
      const effSel=(selDay==null?todayIdx:selDay);
      const hourPct=5,moodPct=(moodMin?4:9),daysPct=100-hourPct-moodPct;
      const unit=(effSel>=0?daysPct/(6+2.3):daysPct/7);
      for(let i=0;i<7;i++){const dd=new Date(wmon);dd.setDate(wmon.getDate()+i);const tdy=dd.toDateString()===new Date().toDateString();const sel=(i===effSel);const w=(sel?unit*2.3:unit);whead+=`<th class="wgday${tdy?' today':''}${sel?' sel':''}" data-selday="${i}" style="width:${w.toFixed(2)}%" title="${sel?'recolher dia':'destacar dia'}"><span class="wgdl">${WDl[i]}</span><span class="wgdn">${dd.getDate()}</span></th>`;}
      whead+=`<th class="wgmoodh${moodMin?' min':''}" style="width:${moodPct}%"><button class="wgmtog" id="wgMoodTog" title="${moodMin?'expandir coluna de humor':'minimizar coluna de humor'}">${moodMin?'☺':'Humor ◂'}</button></th>`;
      let wrows='';
      for(let hh=6;hh<=23;hh++){let cells='';for(let i=0;i<7;i++){const ck=i+'-'+hh;const chips=(capByCell[ck]||[]).map(cp=>{const a=areaById(cp.area);return `<span class="wgchip${cp.kind==='task'?' task':''}" data-cap-open="${cp.id}" style="--cc:${a?a.color:'#9a7b3f'}" title="${hesc(cp.txt)}">${cp.kind==='task'?'☑ ':''}${hesc(cp.txt)}</span>`;}).join('');cells+=`<td class="wgcell${i===effSel?' selcol':''}">${chips}<div class="wgbox" contenteditable="true" data-wp="${ck}">${hesc(wkv[ck]||'')}</div></td>`;}const mi=+(wkv['mood-'+hh]||0);const MM=MOODS[mi];cells+=`<td class="wgmoodc${moodMin?' min':''}"><button class="moodbtn${mi?' set':''}" data-mood="${hh}" style="--mc:${MM.c}" title="humor às ${String(hh).padStart(2,'0')}h">${moodMin?'':MM.e}</button></td>`;wrows+=`<tr><th class="wghour">${String(hh).padStart(2,'0')}<small>h</small></th>${cells}</tr>`;}
      const looseV=wkv['loose']||'';
      {const tdNow=new Date();const tdStr=tdNow.getFullYear()+'-'+String(tdNow.getMonth()+1).padStart(2,'0')+'-'+String(tdNow.getDate()).padStart(2,'0');
        const todos=(H.todos||[]);const pend=todos.filter(t=>!t.done);
        const dueToday=pend.filter(t=>t.day===tdStr).length,overdue=pend.filter(t=>t.day&&t.day<tdStr).length;
        let alert='';if(overdue)alert=`<div class="tdalert over">⚠ ${overdue} atrasado${overdue>1?'s':''}${dueToday?' · '+dueToday+' hoje':''}</div>`;else if(dueToday)alert=`<div class="tdalert">🔔 ${dueToday} afazer${dueToday>1?'es':''} para hoje</div>`;
        const sorted=todos.slice().sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;return (a.day||'9999').localeCompare(b.day||'9999');});
        const tdItems=sorted.map(t=>{const st=t.done?'done':(t.day&&t.day<tdStr?'over':(t.day===tdStr?'today':'up'));return `<div class="tditem ${st}"><button class="tdcheck" data-td-done="${t.id}" title="concluir">✓</button><div class="tdbody"><div class="tdtx">${hesc(t.txt)}</div><label class="tdmv"><span class="tdmvl">${tdDayLabel(t.day,tdStr)}</span><input type="date" class="tdmove" data-td-move="${t.id}" value="${t.day||''}"></label></div><button class="tddel" data-td-del="${t.id}" title="remover">✕</button></div>`;}).join('')||`<div class="tdempty">Sem afazeres — adicione um abaixo.</div>`;
        afazeresView=`<div class="atdhd"><span class="al">🔔 Afazeres</span><span class="atdc">${pend.length}</span></div>${alert}<div class="tdcompose"><input id="tdText" class="tdin" placeholder="Novo afazer…"><div class="tdcrow"><input type="date" id="tdDay" class="tddate" value="${tdStr}"><button class="tdadd" id="tdAdd">+ lançar</button></div></div><div class="tdlist">${tdItems}</div>`;}
      const wkBtn=(f,lab)=>`<button class="wknbtn${(wkv[f]||'').trim()?' has':''}" data-wknote="${f}">${lab}</button>`;
      const wknotesHTML=`<div class="wknotes">${wkBtn('revisao','Revisão da semana')}</div>`;
      const SAUDE=state.saude,WDfull=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
      const footDay=effSel>=0?effSel:0;const footDate=new Date(wmon);footDate.setDate(wmon.getDate()+footDay);
      const trSel=wkv['treinoDia-'+footDay]||'';const trOpts=`<option value="">— escolher treino —</option>`+SAUDE.treinos.map(t=>`<option value="${t.id}"${t.id===trSel?' selected':''}>${hesc(t.name)} · ${hesc(t.focus||'')}</option>`).join('');const trObj=SAUDE.treinos.find(t=>t.id===trSel);
      let treinoView=`<div class="wkfday">🏋 ${WDfull[footDay]} ${footDate.getDate()}/${footDate.getMonth()+1}</div><select class="wkfsel" data-treino-dia="${footDay}">${trOpts}</select>`;
      if(trObj)treinoView+=`<div class="wkfex">${(trObj.exercises||'').split('\n').filter(Boolean).map(l=>`<div class="wkfexl">${hesc(l)}</div>`).join('')}</div>`;else treinoView+=`<div class="wkfhint">Sem treino atribuído — escolha um dos seus treinos (cadastrados no mundo Saúde).</div>`;
      treinoView+=`<div class="wkfweekly"><span class="al">Plano da semana</span><textarea class="abox" data-wp="treino" placeholder="Divisão A/B/C, cardio, descanso…">${hesc(wkv['treino']||'')}</textarea></div>`;
      const meals=[['cafe','Café da manhã'],['almoco','Almoço'],['jantar','Jantar']];
      let dietaView=`<div class="wkfday">🍽 ${WDfull[footDay]} ${footDate.getDate()}/${footDate.getMonth()+1}</div>`;
      meals.forEach(mm=>{const rsel=wkv['dieta-'+footDay+'-'+mm[0]]||'';const ropts=`<option value="">—</option>`+SAUDE.receitas.map(r=>`<option value="${r.id}"${r.id===rsel?' selected':''}>${hesc(r.name)}${r.kcal?' · '+r.kcal+'kcal':''}</option>`).join('');dietaView+=`<div class="wkfmeal"><span class="wkfml">${mm[1]}</span><select class="wkfsel" data-dieta-dia="${footDay}:${mm[0]}">${ropts}</select></div>`;});
      dietaView+=`<div class="wkfweekly"><span class="al">Plano da semana</span><textarea class="abox" data-wp="dieta" placeholder="Refeições, macros, lista do mercado…">${hesc(wkv['dieta']||'')}</textarea></div>`;
      const wkFootHTML=`<div class="wkfoot${wkFootMin?' min':''}"><div class="wkftabs"><button class="wkftab${wkFootTab==='afazeres'?' on':''}" data-wkfoot="afazeres">📋 Afazeres</button><button class="wkftab${wkFootTab==='treino'?' on':''}" data-wkfoot="treino">🏋 Treino do dia</button><button class="wkftab${wkFootTab==='dieta'?' on':''}" data-wkfoot="dieta">🍽 Dieta do dia</button><button class="wkftog" id="wkFootTog">${wkFootMin?'expandir ▾':'recolher ▴'}</button></div><div class="wkfbody">${wkFootTab==='afazeres'?afazeresView:wkFootTab==='dieta'?dietaView:treinoView}</div></div>`;
      const mpv=(H.monthPlan[mes]=H.monthPlan[mes]||{});
      {const fw=new Date(y,m-1,1).getDay(),tdK=new Date();let cal='';
        for(let b=0;b<fw;b++)cal+='<span class="mcd off"></span>';
        for(let d=1;d<=dim;d++){let on=0;daily.forEach(h=>{if(hOn(h.id,d))on++;});const full=daily.length&&on===daily.length;const part=on>0&&!full;const isT=(tdK.getFullYear()===y&&tdK.getMonth()===m-1&&tdK.getDate()===d);cal+=`<span class="mcd${isT?' today':''}${full?' full':part?' part':''}">${d}</span>`;}
        aside2HTML=`<div class="asec ames"><div class="ameshd"><span class="al">📆 Mês</span><span class="amesm">${monthLabel(mes)}</span></div><div class="mcal"><div class="mcalh">${WD.map(d=>`<span>${d}</span>`).join('')}</div><div class="mcalg">${cal}</div></div></div><div class="asec"><span class="al">Foco do mês</span><textarea class="abox" data-mp="foco" placeholder="Uma intenção para o mês">${hesc(mpv.foco||'')}</textarea></div><div class="asec"><span class="al">Metas</span><textarea class="abox" data-mp="metas" placeholder="O que quero concluir">${hesc(mpv.metas||'')}</textarea></div><div class="asec aneg"><span class="al">◆ Inegociáveis diários</span><textarea class="abox tall" data-wp="inegociaveis" placeholder="O que não pode faltar em nenhum dia — treino, leitura, água…">${hesc(wkv['inegociaveis']||'')}</textarea></div>`;}
      const wtasks=(wkv.wtasks||[]);const wtCatOpts=(H.qcats||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
      const wtCatOf=cid=>(H.qcats||[]).find(c=>c.id===cid)||{name:'—',color:'#999'};
      const wtasksTrayHTML=`<div class="wtray"><div class="wtcompose"><input id="wtInput" class="wtin" placeholder="+ nova tarefa ou nota…"><select id="wtCat" class="wtcatsel">${wtCatOpts}</select><button class="wtadd" id="wtAdd">Adicionar</button></div><div class="wtchips">${wtasks.length?wtasks.map(t=>{const c=wtCatOf(t.cat);return `<div class="wtchip" draggable="true" data-wtask="${t.id}" style="--cc:${c.color}"><span class="wtdot"></span><span class="wttxt">${hesc(t.txt)}</span><span class="wtcatlbl">${hesc(c.name)}</span><button class="wtsched" data-wtsched="${t.id}" title="atribuir dia e horário">📅</button><button class="wtdel" data-wtdel="${t.id}" title="remover">✕</button></div>`;}).join(''):'<span class="wtempty">Nada por aqui — crie uma tarefa e atribua a um dia.</span>'}</div></div>`;
      const looseHTML=`<div class="wloose wloose-head"></div>`;
      planHTML=`<div class="planrow"><section class="planc wplan"><div class="wplan-main"><div class="planhd"><div class="planhl">${wknotesHTML}<button class="weekhub-panel-btn" id="awbWeekPanelInline" type="button"><span>▦</span><b>Painel semanal</b><small>hábitos · metas · blocos</small></button><button class="weekhub-new-block-btn" id="awbAddInline" type="button"><span>＋</span><b>Novo bloco</b><small>criar na semana</small></button></div><div class="weeknav"><button class="wkbtn" data-wkp="-1" aria-label="Semana anterior">‹</button><span class="wkrange" style="font-size:23px;color:#FF7900;font-family:'Bebas Neue';font-weight:500">${wrange}</span><button class="wkbtn" data-wkp="1" aria-label="Próxima semana">›</button></div></div><div class="wgwrap">${buildSchedulerHTML()}</div>${wtasksTrayHTML}${looseHTML}</div></section></div>`;
    }
    {const today=pdStr();const cups=H.hydration[today]||0,hgoal=H.hydrationGoal||8;const slp=+(H.sleep[today]||0),sgoal=H.sleepGoal||8;
      const hpct=hgoal?Math.min(100,cups/hgoal*100):0,spct=sgoal?Math.min(100,slp/sgoal*100):0;
      trkbarsHTML=`<div class="trkbars"><div class="trkbar"><div class="tbh"><span class="tbl">💧 Hidratação</span><span class="tbv">${cups}/${hgoal} copos</span></div><div class="tbtrack hydro"><i style="width:${hpct}%"></i></div><div class="tbctl"><button class="trkbtn" data-hydro-d="-1">−</button><button class="trkbtn" data-hydro-d="1">+</button></div></div><div class="trkbar"><div class="tbh"><span class="tbl">🌙 Sono</span><span class="tbv">${slp?slp+'h':'—'} / ${sgoal}h</span></div><div class="tbtrack sleep"><i style="width:${spct}%"></i></div><div class="tbctl"><span class="tbnote">registre na folha de sono →</span></div></div></div>`;
      const SL=(H.sleepLog[today]=H.sleepLog[today]||{});
      const seg=(f,opts,cur)=>`<div class="slseg">`+opts.map(o=>`<button class="slsegb${cur===o?' on':''}" data-slog-seg="${f}:${o}">${o}</button>`).join('')+`</div>`;
      const chips=(f,opts,arr)=>`<div class="slchips">`+opts.map(o=>`<button class="slchip${(arr||[]).indexOf(o)>=0?' on':''}" data-slog-chip="${f}:${o}">${o}</button>`).join('')+`</div>`;
      sonoHTML=`<div class="asec asono"><div class="asonohd"><span class="al">🌙 Sono — hoje</span><span class="asonosub">${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</span></div><div class="slgrid2"><label class="slf"><span>Deitar</span><input type="time" data-slog="bedtime" value="${hesc(SL.bedtime||'')}"></label><label class="slf"><span>Adormeci</span><input type="time" data-slog="fellAsleep" value="${hesc(SL.fellAsleep||'')}"></label><label class="slf"><span>Acordei</span><input type="time" data-slog="wakeTime" value="${hesc(SL.wakeTime||'')}"></label><label class="slf"><span>Levantei</span><input type="time" data-slog="getOut" value="${hesc(SL.getOut||'')}"></label></div><label class="slf wide"><span>Tempo total de sono (h)</span><input type="number" min="0" max="14" step="0.5" data-sleep="1" value="${slp||''}" placeholder="ex.: 8"></label><div class="slblk"><span class="sll">Qualidade do sono</span>${seg('quality',['Ruim','Média','Boa'],SL.quality)}</div><div class="slblk"><span class="sll">Energia ao acordar</span>${seg('energy',['Baixa','Média','Alta'],SL.energy)}</div><div class="slblk"><span class="sll">Estado do corpo</span>${seg('bodyState',['Esgotado','Equilibrado','Renovado'],SL.bodyState)}</div><div class="slblk"><span class="sll">Mente antes de dormir</span>${chips('mentalBefore',['Ansioso','Inquieto','Acelerado','Disperso','Calmo','Relaxado','Em paz','Contente'],SL.mentalBefore)}</div><div class="slblk"><span class="sll">Como me senti</span>${chips('feltDuring',['Dormi fundo','Seguro','Descansado','Interrompido'],SL.feltDuring)}</div><div class="slblk2"><label class="sltog"><input type="checkbox" data-slog-toggle="hadDream" ${SL.hadDream?'checked':''}> Tive um sonho</label><label class="slf inl"><span>Acordei ×</span><input type="number" min="0" max="20" data-slog="wokeCount" value="${SL.wokeCount||''}"></label></div><div class="slblk"><span class="sll">Comida/bebida antes</span>${chips('foodBefore',['Chá','Lanche leve','Chocolate','Meditei','Celular','Li um livro'],SL.foodBefore)}</div><label class="slf wide"><span>Notas ao despertar</span><textarea data-slog="notes" rows="2" placeholder="Sonhos, despertares, sensações…">${hesc(SL.notes||'')}</textarea></label></div>`;}
    let h1='<tr><th class="nm">Hábitos diários</th>',h2='<tr><th class="nm"></th>';
    weeks.forEach((wk,wi)=>{const col=WKC[wi%WKC.length];h1+=`<th class="wk" colspan="${wk.length}" style="--wc:${col}">Sem ${wi+1}</th>`;wk.forEach(d=>{const dt=new Date(y,m-1,d);h2+=`<th class="dcol" style="--wc:${col}"><span class="dl">${WD[dt.getDay()]}</span><span class="dn">${d}</span></th>`;});});
    h1+='<th class="goalh">Meta</th><th class="progh">Progresso</th></tr>';h2+='</tr>';
    let body='';
    daily.forEach(h=>{let done=0;let row=`<td class="nm">${hesc(h.name)}<span class="hdel" data-delhab="${h.id}" title="remover">✕</span></td>`;
      weeks.forEach((wk,wi)=>{const col=WKC[wi%WKC.length];wk.forEach(d=>{const on=hOn(h.id,d);if(on)done++;row+=`<td class="cell" style="--wc:${col}"><button class="hbox ${on?'on':''}" data-hd="${h.id}:${d}" aria-label="dia ${d}"></button></td>`;});});
      const goal=h.goal||dim,pct=Math.min(100,goal?done/goal*100:0);
      row+=`<td class="goalc">${goal}</td><td class="progc"><div class="hprog"><div class="hbar"><i style="width:${pct}%"></i></div><span>${done}/${goal}</span></div></td>`;
      body+=`<tr>${row}</tr>`;});
    const span=2+weeks.reduce((s,w)=>s+w.length,0);
    body+=`<tr class="addrow"><td class="nm"><span class="hadd" id="habitAdd">+ novo hábito</span></td><td colspan="${span-1}"><button class="htbltog" id="habitTblTog" aria-expanded="${!habitTableMin}">${habitTableMin?'expandir ▾':'minimizar ▴'}</button></td></tr>`;
    html+=`<div class="hsheet${habitTableMin?' min':''}"><table class="hgrid"><thead>${h1}${h2}</thead><tbody>${body}</tbody></table></div>`;
    html=`<div class="weekhub-stack"><section class="weekhub-sheet">${planHTML}</section><section class="weekhub-habits">${html}</section></div>`;
  }

  if(activeHabitTab==='notas'){
    const cats=H.qcats,catMap={};cats.forEach(c=>catMap[c.id]=c);
    const all=H.qnotes||[];
    html+=`<div class="cctitle"><span class="e">captura rápida</span><span class="t">Notas rápidas</span><span class="ln"></span></div>`;
    html+=`<p class="chelp">Solte qualquer coisa aqui, classifique por categoria e ative um alarme para não esquecer.</p>`;
    html+=`<div class="hcard qncomposer"><input id="qnText" class="qnin" placeholder="Escreva uma nota rápida…" value=""><div class="qnrow"><select id="qnCat" class="qnsel">${cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select><label class="qnalw"><span class="qnalk">⏰</span><input id="qnAlarm" type="datetime-local" class="qnsel qnalarm"></label><button class="qnadd" id="qnAdd">+ adicionar</button></div></div>`;
    const pending=all.filter(n=>!n.done);
    html+=`<div class="qnfilters"><button class="qnchip${qnFilter==='todas'?' on':''}" data-qnf="todas">Todas <b>${pending.length}</b></button>${cats.map(c=>`<button class="qnchip${qnFilter===c.id?' on':''}" data-qnf="${c.id}" style="--cc:${c.color}"><i></i>${c.name} <b>${pending.filter(n=>n.cat===c.id).length}</b></button>`).join('')}<button class="qnchip${qnFilter==='done'?' on':''}" data-qnf="done">Concluídas <b>${all.filter(n=>n.done).length}</b></button></div>`;
    let list=all.slice();
    if(qnFilter==='done')list=list.filter(n=>n.done);
    else{list=list.filter(n=>!n.done);if(qnFilter!=='todas')list=list.filter(n=>n.cat===qnFilter);}
    list.sort((a,b)=>{const aa=a.alarm&&!a.done?a.alarm:null,bb=b.alarm&&!b.done?b.alarm:null;if(aa&&bb)return aa-bb;if(aa)return -1;if(bb)return 1;return b.ts-a.ts;});
    if(!list.length){html+=`<div class="qnempty">${qnFilter==='done'?'Nenhuma nota concluída ainda.':'Nada por aqui. Capture sua primeira nota acima.'}</div>`;}
    else{html+=`<div class="qnlist">`+list.map(n=>{const c=catMap[n.cat]||{name:'—',color:'#999'};
      let badge='';if(n.alarm){const due=n.alarm<=Date.now();const st=n.fired||due?'rang':'up';badge=`<span class="qnalb ${st}">⏰ ${qnAlarmLabel(n.alarm)}</span>`;}
      return `<div class="qnitem${n.done?' done':''}" style="--cc:${c.color}"><button class="qncheck" data-qn-done="${n.id}" title="${n.done?'reabrir':'concluir'}">✓</button><div class="qnbody"><div class="qntop"><span class="qncat"><i></i>${c.name}</span>${badge}<span class="qnwhen">${timeAgo(n.ts)}</span></div><div class="qntxt">${hesc(n.txt)}</div></div><div class="qnacts"><button class="qnact${n.alarm?' has':''}" data-qn-alarm="${n.id}" title="alarme">⏰</button><button class="qnact" data-qn-del="${n.id}" title="remover">✕</button></div></div>`;
    }).join('')+`</div>`;}
  }

  if(activeHabitTab==='sono'){html=renderSonoSheet();}
  if(activeHabitTab==='planejador'){html=renderPlanejador();}
  if(activeHabitTab==='mapa'){html=renderMapaTab();}
  renderMgPanel();

  el.innerHTML=html;
  const sh=el.querySelector('.hsheet');if(sh)sh.scrollLeft=prevScroll;
}
function applyMode(){
  document.documentElement.classList.toggle('habit',habitMode);
  paintTabs();
  const btn=document.getElementById('modeBtn');
  if(btn){btn.textContent='ᛉ';btn.title='Abrir a árvore — trocar de mundo';}
  const eb=document.getElementById('eyebrow');if(eb)eb.textContent=habitMode?'WeekHub · controle integrado':'FinanceHub · planner financeiro';
  activateTab(habitMode?activeHabitTab:activeFinanceTab);
}
function toggleMode(){
  habitMode=!habitMode;
  if(habitMode)annual=false;
  applyMode();
  AXD.scrollTo(0,0);
}
const _modeBtn=document.getElementById('modeBtn');if(_modeBtn)_modeBtn.onclick=goHome;
const _modeBtnTop=document.getElementById('modeBtnTop');if(_modeBtnTop)_modeBtnTop.onclick=goHome;
document.addEventListener('click',e=>{
  const hd=e.target.closest('[data-hd]');if(hd){const a=hd.dataset.hd.split(':'),id=a[0],d=a[1];const M=hMarks();M[id]=M[id]||{};if(M[id][d])delete M[id][d];else M[id][d]=1;save();renderHabit();return;}
  const hw=e.target.closest('[data-hw]');if(hw){const a=hw.dataset.hw.split(':'),id=a[0],wi=a[1];const wm=(state.habit.wmarks[mes]=state.habit.wmarks[mes]||{});wm[id]=wm[id]||{};if(wm[id][wi])delete wm[id][wi];else wm[id][wi]=1;save();renderHabit();return;}
  const ah=e.target.closest('#habitAdd');if(ah){const n=prompt('Novo hábito diário:');if(n&&n.trim()){const o=hWeeks();state.habit.daily.push({id:uid(),name:n.trim(),goal:o.dim});save();renderHabit();}return;}
  const dh=e.target.closest('[data-delhab]');if(dh){if(confirm('Remover este hábito?')){state.habit.daily=state.habit.daily.filter(x=>x.id!==dh.dataset.delhab);save();renderHabit();}return;}
  const dwk=e.target.closest('[data-delwk]');if(dwk){if(confirm('Remover este hábito semanal?')){state.habit.weekly=state.habit.weekly.filter(x=>x.id!==dwk.dataset.delwk);save();renderHabit();}return;}
  if(e.target.closest('#wkAddBtn')){const inp=document.getElementById('wkAddInput');const v=(inp.value||'').trim();if(v){state.habit.weekly.push({id:uid(),name:v});save();renderHabit();}return;}
  const cov=e.target.closest('[data-cov]');if(cov){const[a,n]=cov.dataset.cov.split(':');const v=+n;state.habit.rhythm.coverage[a]=(state.habit.rhythm.coverage[a]===v?v-1:v);save();renderHabit();return;}
  const rck=e.target.closest('[data-rcheck]');if(rck){const i=+rck.dataset.rcheck;state.habit.rhythm.checks[i]=!state.habit.rhythm.checks[i];save();renderHabit();return;}
  const ps=e.target.closest('[data-pjsec]');if(ps){const id=ps.dataset.pjsec;pjCollapse[id]=!pjCollapse[id];const sec=ps.closest('.pjsec');if(sec)sec.classList.toggle('col',!!pjCollapse[id]);const ar=ps.querySelector('.pjseca');if(ar)ar.textContent=pjCollapse[id]?'▸':'▾';return;}
  const sn=e.target.closest('[data-slnote]');if(sn){const f=sn.dataset.slnote;sonoNoteOpen[f]=!sonoNoteOpen[f];const wrap=sn.closest('.slnote');if(wrap)wrap.classList.toggle('open',!!sonoNoteOpen[f]);return;}
  const mtk=e.target.closest('[data-mgtrk]');if(mtk){const k=mtk.dataset.mgtrk;mgTrkOpen[k]=!mgTrkOpen[k];const wrap=mtk.closest('.mgtrk');if(wrap)wrap.classList.toggle('open',!!mgTrkOpen[k]);return;}
  const gts=e.target.closest('[data-gtsec]');if(gts){const id=gts.dataset.gtsec;gtOpenSec[id]=!gtOpenSec[id];const sec=gts.closest('.gtsec');if(sec)sec.classList.toggle('open',!!gtOpenSec[id]);const ar=gts.querySelector('.gtseca');if(ar)ar.textContent=gtOpenSec[id]?'⌄':'›';return;}
  const rvg=e.target.closest('[data-raven-go]');if(rvg){openGT(rvg.dataset.ravenGo);return;}
  const rba=e.target.closest('[data-rblock-add]');if(rba){const d=rba.dataset.rblockAdd;const time=prompt('Horário (ex.: 08–10):','');if(time===null)return;const label=prompt('Tarefa / bloco:','');if(label===null)return;const opts=RHYTHM_AREAS.map((a,i)=>(i+1)+' '+a.name).join('\n');const an=prompt('Área:\n'+opts,'1');const area=RHYTHM_AREAS[(parseInt(an)||1)-1]?RHYTHM_AREAS[(parseInt(an)||1)-1].id:'work';const t=(state.habit.rhythm.themes[d]=state.habit.rhythm.themes[d]||{});(t.blocks=t.blocks||[]).push({id:uid(),time:(time||'').trim(),label:(label||'').trim(),area});save();renderHabit();return;}
  const rbx=e.target.closest('[data-rblock-del]');if(rbx){const[d,bid]=rbx.dataset.rblockDel.split(':');const t=state.habit.rhythm.themes[d];if(t&&t.blocks){t.blocks=t.blocks.filter(x=>x.id!==bid);save();renderHabit();}return;}
  const tt=e.target.closest('#habitTblTog');if(tt){habitTableMin=!habitTableMin;renderHabit();return;}
  const wkp=e.target.closest('[data-wkp]');if(wkp){weekStart=new Date(weekStart);weekStart.setDate(weekStart.getDate()+parseInt(wkp.dataset.wkp)*7);renderHabit();return;}
  const mtog=e.target.closest('#wgMoodTog');if(mtog){moodMin=!moodMin;renderHabit();return;}
  const wft=e.target.closest('[data-wkfoot]');if(wft){wkFootTab=wft.dataset.wkfoot;wkFootMin=false;renderHabit();return;}
  const wftog=e.target.closest('#wkFootTog');if(wftog){wkFootMin=!wkFootMin;renderHabit();return;}
  if(e.target.closest('#wtAdd')){wtAdd();return;}
  const wtd=e.target.closest('[data-wtdel]');if(wtd){const wk=weekKeyOf(weekStart);const wkv=state.habit.weekPlan[wk];if(wkv&&wkv.wtasks){wkv.wtasks=wkv.wtasks.filter(t=>t.id!==wtd.dataset.wtdel);save();renderHabit();}return;}
  const wts=e.target.closest('[data-wtsched]');if(wts){openWtSchedModal(wts.dataset.wtsched);return;}
  const ssg=e.target.closest('[data-slog-seg]');if(ssg){const[f,v]=ssg.dataset.slogSeg.split(':');const k=pdStr();const o=(state.habit.sleepLog[k]=state.habit.sleepLog[k]||{});o[f]=(o[f]===v?'':v);save();renderHabit();return;}
  const sch=e.target.closest('[data-slog-chip]');if(sch){const[f,v]=sch.dataset.slogChip.split(':');const k=pdStr();const o=(state.habit.sleepLog[k]=state.habit.sleepLog[k]||{});const arr=(o[f]=o[f]||[]);const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);save();renderHabit();return;}
  const wst=e.target.closest('#wkSideTog');if(wst){wkSideMin=!wkSideMin;renderHabit();return;}
  const wkn=e.target.closest('[data-wknote]');if(wkn){openWkNote(wkn.dataset.wknote);return;}
  const sdy=e.target.closest('[data-selday]');if(sdy){const i=+sdy.dataset.selday;selDay=(selDay===i?-1:i);renderHabit();return;}
  if(e.target.closest('#qnAdd')){qnAdd();return;}
  if(e.target.closest('#tdAdd')){tdAdd();return;}
  const td=e.target.closest('[data-td-done]');if(td){const t=(state.habit.todos||[]).find(x=>x.id===td.dataset.tdDone);if(t){t.done=!t.done;save();renderHabit();}return;}
  const tdx=e.target.closest('[data-td-del]');if(tdx){state.habit.todos=(state.habit.todos||[]).filter(x=>x.id!==tdx.dataset.tdDel);save();renderHabit();return;}
  const qf=e.target.closest('[data-qnf]');if(qf){qnFilter=qf.dataset.qnf;renderHabit();return;}
  const qd=e.target.closest('[data-qn-done]');if(qd){const n=(state.habit.qnotes||[]).find(x=>x.id===qd.dataset.qnDone);if(n){n.done=!n.done;save();renderHabit();}return;}
  const qx=e.target.closest('[data-qn-del]');if(qx){state.habit.qnotes=(state.habit.qnotes||[]).filter(x=>x.id!==qx.dataset.qnDel);save();renderHabit();return;}
  const qa=e.target.closest('[data-qn-alarm]');if(qa){openQnAlarm(qa.dataset.qnAlarm);return;}
  const mb=e.target.closest('[data-mood]');if(mb){const k=weekKeyOf(weekStart);const o=(state.habit.weekPlan[k]=state.habit.weekPlan[k]||{});const mk='mood-'+mb.dataset.mood;o[mk]=((+(o[mk]||0))+1)%6;save();renderHabit();return;}
});
document.addEventListener('input',e=>{const nt=e.target.closest('#habitNotes');if(nt){state.habit.notes=nt.value;save();}
  const slg=e.target.closest('[data-slog]');if(slg){const k=pdStr();const o=(state.habit.sleepLog[k]=state.habit.sleepLog[k]||{});o[slg.dataset.slog]=slg.value;save();return;}
  const wp=e.target.closest('[data-wp]');if(wp){const k=weekKeyOf(weekStart);const o=(state.habit.weekPlan[k]=state.habit.weekPlan[k]||{});o[wp.dataset.wp]=(wp.value!==undefined?wp.value:wp.innerText);save();return;}
  const mpf=e.target.closest('[data-mp]');if(mpf){const o=(state.habit.monthPlan[mes]=state.habit.monthPlan[mes]||{});o[mpf.dataset.mp]=mpf.value;save();return;}const ib=e.target.closest('#ccInbox');if(ib){inboxDraft=ib.value;}
  const te=e.target.closest('[data-tool-edit]');if(te){const[id,f]=te.dataset.toolEdit.split(':');const t=(state.habit.toolsMap.tools||[]).find(x=>x.id===id);if(t){t[f]=te.innerText.trim();save();}return;}
  const fe=e.target.closest('[data-flow-edit]');if(fe){const[i,j]=fe.dataset.flowEdit.split(':').map(Number);if(state.habit.toolsMap.flow[i]){state.habit.toolsMap.flow[i][j]=fe.innerText.trim();save();}return;}
  const mst=e.target.closest('[data-mmsec-title]');if(mst){const s=(state.habit.toolsMap.sections||[]).find(x=>x.id===mst.dataset.mmsecTitle);if(s){s.title=mst.innerText.trim();save();}return;}
  const esp=e.target.closest('[data-esp]');if(esp){const k=esp.dataset.esp;(state.espelho=state.espelho||{})[k]=(esp.value!==undefined?esp.value:esp.innerText.trim());save();return;}
  const mct=e.target.closest('[data-mmcard]');if(mct){const[sid,cid]=mct.dataset.mmcard.split(':');const s=(state.habit.toolsMap.sections||[]).find(x=>x.id===sid);const c=s&&(s.cards||[]).find(x=>x.id===cid);if(c){c.text=mct.innerText.trim();save();}return;}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const ib=e.target.closest('#ccInbox');if(ib){e.preventDefault();const v=ib.value.trim();if(v){state.habit.inbox.unshift({id:uid(),txt:v,ts:Date.now()});inboxDraft='';save();gtRender();}}});
document.addEventListener('change',e=>{const pa=e.target.closest('[data-pj-dayadd]');if(pa){const p=state.habit.projetos.find(x=>x.id===pa.dataset.pjDayadd);if(p&&pa.value){p.days=p.days||[];if(!p.days.includes(pa.value))p.days.push(pa.value);const t=new Date(pa.value).getTime();if(t>(p.last||0))p.last=t;save();gtRender();}}});
document.addEventListener('click',e=>{
  if(e.target.closest('#capAdd')){capAdd();return;}
  const cf=e.target.closest('[data-capf]');if(cf){capFilter=cf.dataset.capf;gtRender();return;}
  const cd=e.target.closest('[data-cap-done]');if(cd){const n=(state.habit.captures||[]).find(x=>x.id===cd.dataset.capDone);if(n){n.done=!n.done;save();gtRender();}return;}
  const cx=e.target.closest('[data-cap-del]');if(cx){state.habit.captures=(state.habit.captures||[]).filter(x=>x.id!==cx.dataset.capDel);save();gtRender();return;}
  const ce=e.target.closest('[data-cap-edit]');if(ce){openCapEdit(ce.dataset.capEdit);return;}
  const ca=e.target.closest('[data-cap-alarm]');if(ca){openQnAlarm(ca.dataset.capAlarm);return;}
  const co=e.target.closest('[data-cap-open]');if(co){openGT('comando');return;}
  const cvd=e.target.closest('[data-cv-done]');if(cvd){const[k,id]=cvd.dataset.cvDone.split(':');const it=(state.culture.items[k]||[]).find(x=>x.id===id);if(it){it.done=!it.done;save();gtRender();}return;}
  const cvx=e.target.closest('[data-cv-del]');if(cvx){const[k,id]=cvx.dataset.cvDel.split(':');state.culture.items[k]=(state.culture.items[k]||[]).filter(x=>x.id!==id);save();gtRender();return;}
  const rtAdd=e.target.closest('[data-rt-add]');if(rtAdd){const t=prompt('O que você quer retomar?');if(t&&t.trim()){const ctx=pickCtx();const nx=prompt('Próximo passo concreto:')||'';state.habit.retomadas.push({id:uid(),ctx,title:t.trim(),next:nx.trim(),ts:Date.now()});save();gtRender();}return;}
  const rtDone=e.target.closest('[data-rt-done]');if(rtDone){const r=state.habit.retomadas.find(x=>x.id===rtDone.dataset.rtDone);if(r){const nx=prompt('Avançou! Qual o próximo passo agora?',r.next||'');if(nx!==null){r.next=nx.trim();r.ts=Date.now();save();gtRender();}}return;}
  const rtEdit=e.target.closest('[data-rt-edit]');if(rtEdit){const r=state.habit.retomadas.find(x=>x.id===rtEdit.dataset.rtEdit);if(r){const nx=prompt('Próximo passo:',r.next||'');if(nx!==null){r.next=nx.trim();save();gtRender();}}return;}
  const rtUp=e.target.closest('[data-rt-up]');if(rtUp){const r=state.habit.retomadas.find(x=>x.id===rtUp.dataset.rtUp);if(r){r.ts=Date.now();if(r.proj){const p=state.habit.projetos.find(x=>x.id===r.proj);if(p){p.days=p.days||[];const ds=pdStr();if(!p.days.includes(ds))p.days.push(ds);p.last=Date.now();}}save();gtRender();}return;}
  const rtSched=e.target.closest('[data-rt-sched]');if(rtSched){openRtSched(rtSched.dataset.rtSched);return;}
  const rtLink=e.target.closest('[data-rt-link]');if(rtLink){const r=state.habit.retomadas.find(x=>x.id===rtLink.dataset.rtLink);if(r){const P=state.habit.projetos;const list=P.map((p,i)=>(i+1)+' '+p.name).join('\n');const n=prompt('Vincular a qual projeto?\n0 nenhum\n'+list,'0');if(n!==null){const idx=parseInt(n)-1;r.proj=(idx>=0&&P[idx])?P[idx].id:null;save();gtRender();}}return;}
  const rtDel=e.target.closest('[data-rt-del]');if(rtDel){state.habit.retomadas=state.habit.retomadas.filter(x=>x.id!==rtDel.dataset.rtDel);save();gtRender();return;}
  const ibAdd=e.target.closest('#ccInboxAdd');if(ibAdd){const inp=document.getElementById('ccInbox');const v=(inp.value||'').trim();if(v){state.habit.inbox.unshift({id:uid(),txt:v,ts:Date.now()});inboxDraft='';save();gtRender();}return;}
  const ibDel=e.target.closest('[data-ib-del]');if(ibDel){state.habit.inbox=state.habit.inbox.filter(x=>x.id!==ibDel.dataset.ibDel);save();gtRender();return;}
  const ibDest=e.target.closest('[data-ib-dest]');if(ibDest){const d=pickDest();if(d){state.habit.inbox=state.habit.inbox.filter(x=>x.id!==ibDest.dataset.ibDest);save();gtRender();}return;}
  const pjAdd=e.target.closest('[data-pj-add]');if(pjAdd){const n=prompt('Nome do projeto:');if(n&&n.trim()){const ctx=pickCtx();state.habit.projetos.push({id:uid(),name:n.trim(),ctx,last:Date.now(),days:[]});save();gtRender();}return;}
  const pjTouch=e.target.closest('[data-pj-touch]');if(pjTouch){const p=state.habit.projetos.find(x=>x.id===pjTouch.dataset.pjTouch);if(p){p.last=Date.now();save();gtRender();}return;}
  const pjRtAdd=e.target.closest('[data-pj-rt-add]');if(pjRtAdd){const pid=pjRtAdd.dataset.pjRtAdd;const p=state.habit.projetos.find(x=>x.id===pid);const t=prompt('O que você quer retomar neste projeto?',p?p.name:'');if(t&&t.trim()){const nx=prompt('Próximo passo concreto:')||'';state.habit.retomadas.push({id:uid(),title:t.trim(),next:nx,ctx:p?p.ctx:'pessoal',proj:pid,ts:Date.now()});save();gtRender();}return;}
  const pjDay=e.target.closest('[data-pj-day]');if(pjDay){const p=state.habit.projetos.find(x=>x.id===pjDay.dataset.pjDay);if(p){p.days=p.days||[];const ds=pdStr();const i=p.days.indexOf(ds);if(i>=0)p.days.splice(i,1);else{p.days.push(ds);p.last=Date.now();}save();gtRender();}return;}
  const pjDel=e.target.closest('[data-pj-del]');if(pjDel){if(confirm('Remover este projeto?')){state.habit.projetos=state.habit.projetos.filter(x=>x.id!==pjDel.dataset.pjDel);save();gtRender();}return;}
  const tlAdd=e.target.closest('#toolAdd');if(tlAdd){state.habit.toolsMap.tools.push({id:uid(),ic:'🔧',nm:'Nova ferramenta',fn:'Para que serve.',fr:'Quando usar'});save();gtRender();return;}
  const tlDel=e.target.closest('[data-tool-del]');if(tlDel){state.habit.toolsMap.tools=state.habit.toolsMap.tools.filter(x=>x.id!==tlDel.dataset.toolDel);save();gtRender();return;}
  const flAdd=e.target.closest('#flowAdd');if(flAdd){state.habit.toolsMap.flow.push(['Etapa','Destino']);save();gtRender();return;}
  if(e.target.closest('#mmSecAdd')){state.habit.toolsMap.sections=state.habit.toolsMap.sections||[];state.habit.toolsMap.sections.push({id:uid(),title:'Nova seção',cards:[]});save();gtRender();return;}
  const msd=e.target.closest('[data-mmsec-del]');if(msd){if(confirm('Remover esta seção?')){state.habit.toolsMap.sections=(state.habit.toolsMap.sections||[]).filter(x=>x.id!==msd.dataset.mmsecDel);save();gtRender();}return;}
  const mca=e.target.closest('[data-mmcard-add]');if(mca){const s=(state.habit.toolsMap.sections||[]).find(x=>x.id===mca.dataset.mmcardAdd);if(s){const cols=['#c95f1c','#768b43','#557fb6','#c77276','#b58b3d','#7658a5','#5e95a7'];(s.cards=s.cards||[]).push({id:uid(),text:'Novo bloco',color:cols[s.cards.length%cols.length]});save();gtRender();}return;}
  const mcd=e.target.closest('[data-mmcard-del]');if(mcd){const[sid,cid]=mcd.dataset.mmcardDel.split(':');const s=(state.habit.toolsMap.sections||[]).find(x=>x.id===sid);if(s){s.cards=(s.cards||[]).filter(x=>x.id!==cid);save();gtRender();}return;}
  const flDel=e.target.closest('[data-flow-del]');if(flDel){state.habit.toolsMap.flow.splice(+flDel.dataset.flowDel,1);save();gtRender();return;}
});

/* ===== Tools gerais: Comando + Ferramentas (overlay) ===== */
function pdStr(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
let gtActive=null,gtOpenSec={};
function gtSection(id,title,icon,body){const open=!!gtOpenSec[id];return `<section class="gtsec${open?' open':''}"><button type="button" class="gtsech" data-gtsec="${id}"><span class="gtseci">${icon}</span><span class="gtsect">${title}</span><span class="gtseca">${open?'⌄':'›'}</span></button><div class="gtsecbody">${body}</div></section>`;}
const DOCK_META={raven:['o corvo avisa','Notificações',()=>renderRaven()],retomada:['onde você parou','Retomada',()=>renderRetomada()],projetos:['visão geral','Projetos',()=>renderProjetosMain()],captura:['captura rápida','Captura',()=>renderCaptura()],referencias:['referências rápidas','Referências rápidas',()=>renderFerramentas()]};
function renderProjetosRetomadas(){return renderProjetos()+'<div style="height:6px"></div>'+renderRetomada();}
function ravenItems(){const H=state.habit,now=Date.now();let items=[];
  const rc=(H.retomadas||[]).length;if(rc)items.push({ic:'🧭',t:`${rc} para retomar`,s:'onde você parou',k:'retomada'});
  (H.projetos||[]).forEach(p=>{const days=Math.floor((now-(p.last||0))/864e5);if(days>10)items.push({ic:'📊',t:`"${p.name}" abandonado`,s:`há ${days} dias sem toque`,k:'projetos'});else if(days>3)items.push({ic:'📊',t:`"${p.name}" esfriando`,s:`há ${days} dias`,k:'projetos'});});
  (H.captures||[]).forEach(n=>{if(n.done)return;if(n.alarm&&n.alarm<=now)items.push({ic:'⏰',t:n.txt,s:'alarme disparado',k:'captura'});else if(n.date){const dt=new Date(n.date+'T'+(n.time||'23:59'));if(dt.getTime()<=now)items.push({ic:'📅',t:n.txt,s:'prazo vencido',k:'captura'});}});
  return items;}
function renderRaven(){const items=ravenItems();
  let h=`<p class="chelp" style="margin-top:0">O corvo observa o que precisa da sua atenção — projetos parados, retomadas em aberto e alarmes vencidos.</p>`;
  if(!items.length){h+=`<div class="ravenempty">🪶 Nada urgente. Tudo sob controle.</div>`;return h;}
  h+=`<div class="ravenlist">`+items.map(it=>`<button class="ravenitem" data-raven-go="${it.k}"><span class="rvic">${it.ic}</span><span class="rvbd"><span class="rvt">${hesc(it.t)}</span><span class="rvs">${hesc(it.s)}</span></span><span class="rvarr">›</span></button>`).join('')+`</div>`;
  return h;}
function updateRavenBadge(){const b=document.getElementById('ravenBadge');if(!b)return;const n=ravenItems().length;b.textContent=n>9?'9+':String(n);b.style.display=n?'grid':'none';const btn=document.querySelector('.td-raven');if(btn)btn.classList.toggle('alert',n>0);}
function gtIsOpen(){return document.body.classList.contains('dock-open');}
function gtRender(){if(!gtIsOpen()||!gtActive)return;const m=DOCK_META[gtActive];if(!m)return;document.getElementById('dockEb').textContent=m[0];document.getElementById('dockTitle').textContent=m[1];document.getElementById('dockBody').innerHTML=m[2]();updateRavenBadge();}
function openGT(which){if(gtActive===which&&gtIsOpen()){closeGT();return;}gtActive=which;document.body.classList.add('dock-open');document.querySelectorAll('#toolDock .td-ic-btn').forEach(b=>b.classList.toggle('on',b.dataset.dock===which));gtRender();document.getElementById('dockBody').scrollTop=0;}
function closeGT(){document.body.classList.remove('dock-open');gtActive=null;document.querySelectorAll('#toolDock .td-ic-btn').forEach(b=>b.classList.remove('on'));}
function renderCaptura(){
  const H=state.habit,A=state.asgard;let h='';
  const cats=H.qcats,catMap={};cats.forEach(c=>catMap[c.id]=c);
  const all=H.captures||[];
  const areaOpts=`<option value="">área…</option>`+A.areas.map(a=>`<option value="${a.id}">${a.ic} ${a.name}</option>`).join('');
  const goalOpts=`<option value="">meta…</option>`+A.goals.map(g=>`<option value="${g.id}">${hesc(g.title)}</option>`).join('');
  const catOpts=cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  const composer=`<div class="hcard capcomposer"><input id="capText" class="qnin" placeholder="Escreva uma nota ou tarefa…"><div class="caprow"><select id="capKind" class="qnsel"><option value="nota">📝 Nota</option><option value="task">☑ Tarefa</option></select><select id="capCat" class="qnsel">${catOpts}</select><select id="capArea" class="qnsel">${areaOpts}</select><select id="capGoal" class="qnsel">${goalOpts}</select></div><div class="caprow"><label class="qnalw"><span class="qnalk">📅</span><input id="capDate" type="date" class="qnsel qnalarm"></label><label class="qnalw"><span class="qnalk">⏰</span><input id="capTime" type="time" class="qnsel qnalarm"></label><button class="qnadd" id="capAdd">+ capturar</button></div></div>`;
  h+=gtSection('cap-new','Capturar','🗒️',composer);
  const pend=all.filter(n=>!n.done);
  let listBody=`<div class="qnfilters"><button class="qnchip${capFilter==='todas'?' on':''}" data-capf="todas">Todas <b>${pend.length}</b></button><button class="qnchip${capFilter==='nota'?' on':''}" data-capf="nota">Notas <b>${pend.filter(n=>n.kind==='nota').length}</b></button><button class="qnchip${capFilter==='task'?' on':''}" data-capf="task">Tarefas <b>${pend.filter(n=>n.kind==='task').length}</b></button><button class="qnchip${capFilter==='done'?' on':''}" data-capf="done">Concluídas <b>${all.filter(n=>n.done).length}</b></button></div>`;
  let list=all.slice();
  if(capFilter==='done')list=list.filter(n=>n.done);else{list=list.filter(n=>!n.done);if(capFilter==='nota'||capFilter==='task')list=list.filter(n=>n.kind===capFilter);}
  list.sort((a,b)=>{const ax=a.date?new Date(a.date+'T'+(a.time||'00:00')).getTime():Infinity;const bx=b.date?new Date(b.date+'T'+(b.time||'00:00')).getTime():Infinity;if(ax!==bx)return ax-bx;return b.created-a.created;});
  if(!list.length){listBody+=`<div class="qnempty">Nada aqui ainda. Capture sua primeira nota ou tarefa.</div>`;}
  else{listBody+=`<div class="qnlist">`+list.map(n=>{const c=catMap[n.cat]||{name:'—',color:'#999'};const a=areaById(n.area),g=goalById(n.goal);
    let assoc='';if(n.date){const dd=new Date(n.date+'T00:00:00');assoc=`<span class="qnalb up">📅 ${dd.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}${n.time?' '+n.time:''}</span>`;}
    let alarmB='';if(n.alarm){const due=n.alarm<=Date.now();alarmB=`<span class="qnalb ${n.fired||due?'rang':'up'}">⏰ ${qnAlarmLabel(n.alarm)}</span>`;}
    const areaB=a?`<span class="qnarea" style="--cc:${a.color}">${a.ic} ${a.name}</span>`:'';
    const goalB=g?`<span class="qngoal">🎯 ${hesc(g.title)}</span>`:'';
    const check=n.kind==='task'?`<button class="qncheck" data-cap-done="${n.id}" title="${n.done?'reabrir':'concluir'}">✓</button>`:`<span class="capdot" style="--cc:${c.color}"></span>`;
    return `<div class="qnitem${n.done?' done':''}${n.kind==='task'?' istask':''}" style="--cc:${a?a.color:c.color}">${check}<div class="qnbody"><div class="qntop"><span class="qncat"><i style="background:${c.color}"></i>${c.name}</span>${areaB}${goalB}${assoc}${alarmB}<span class="qnwhen">${timeAgo(n.created)}</span></div><div class="qntxt">${hesc(n.txt)}</div></div><div class="qnacts"><button class="qnact" data-cap-edit="${n.id}" title="data · área · meta">✎</button><button class="qnact${n.alarm?' has':''}" data-cap-alarm="${n.id}" title="alarme">⏰</button><button class="qnact" data-cap-del="${n.id}" title="remover">✕</button></div></div>`;
  }).join('')+`</div>`;}
  h+=gtSection('cap-list','Itens capturados','📥',listBody);
  return h;
}
function capAdd(){const t=document.getElementById('capText');if(!t)return;const txt=t.value.trim();if(!txt)return;
  const kind=document.getElementById('capKind').value,cat=document.getElementById('capCat').value,area=document.getElementById('capArea').value||null,goal=document.getElementById('capGoal').value||null,dv=document.getElementById('capDate').value||null,tv=document.getElementById('capTime').value||null;
  state.habit.captures.unshift({id:uid(),kind,txt,cat,area,goal,created:Date.now(),date:dv,time:tv,done:false,alarm:null,fired:false});save();gtRender();}
function openCapEdit(id){capEditId=id;const n=(state.habit.captures||[]).find(x=>x.id===id);if(!n)return;const A=state.asgard;
  document.getElementById('capEditTxt').textContent=n.txt;
  document.getElementById('capEditDate').value=n.date||'';document.getElementById('capEditTime').value=n.time||'';
  document.getElementById('capEditArea').innerHTML=`<option value="">área…</option>`+A.areas.map(a=>`<option value="${a.id}"${a.id===n.area?' selected':''}>${a.ic} ${a.name}</option>`).join('');
  document.getElementById('capEditGoal').innerHTML=`<option value="">meta…</option>`+A.goals.map(g=>`<option value="${g.id}"${g.id===n.goal?' selected':''}>${hesc(g.title)}</option>`).join('');
  openModal('capEditModal');}
function renderProjetosMain(){
  const H=state.habit;const todayStr=pdStr();
  const yy=+mes.split('-')[0],mm=+mes.split('-')[1];const dim=new Date(yy,mm,0).getDate(),fw=new Date(yy,mm-1,1).getDay();
  const dayCount={};H.projetos.forEach(p=>(p.days||[]).forEach(ds=>{const dd=new Date(ds+'T00:00:00');if(dd.getFullYear()===yy&&dd.getMonth()===mm-1)dayCount[dd.getDate()]=(dayCount[dd.getDate()]||0)+1;}));
  const nowD=new Date();let cal='';for(let b=0;b<fw;b++)cal+='<span class="mcd off"></span>';
  for(let d=1;d<=dim;d++){const c=dayCount[d]||0;const isT=(nowD.getFullYear()===yy&&nowD.getMonth()===mm-1&&nowD.getDate()===d);cal+=`<span class="mcd${isT?' today':''}${c>=2?' full':c===1?' part':''}" title="${c} projeto(s)">${d}</span>`;}
  const calBody=`<div class="hcard" style="padding:13px"><div class="ameshd"><span class="al">📆 ${monthLabel(mes)}</span><span class="amesm" style="font-size:10.5px;color:var(--ink-soft);font-weight:600">sincronizado · Semana &amp; Mês</span></div><div class="mcal" style="margin-top:8px"><div class="mcalh">${WD.map(d=>`<span>${d}</span>`).join('')}</div><div class="mcalg">${cal}</div></div></div>`;
  const R=[...H.retomadas].sort((a,b)=>b.ts-a.ts);
  const retomadaBlock=r=>`<div class="pjrt"><div class="pjrtti">${hesc(r.title)}</div><div class="pjrtnx"><b>Próximo:</b> ${hesc(r.next||'—')}</div><div class="pjrtacts"><span class="when">há ${timeAgo(r.ts)}</span><span class="cclink" data-rt-up="${r.id}">↑ retomei agora</span><span class="cclink" data-rt-sched="${r.id}">⏱ agendar</span><span class="cclink" data-rt-edit="${r.id}">editar</span><span class="cclink mut" data-rt-del="${r.id}">remover</span></div></div>`;
  const P=[...H.projetos].sort((a,b)=>a.last-b.last);let cards='';
  P.forEach(p=>{const days=Math.floor((Date.now()-p.last)/864e5);let cls='ok',lab='ativo';if(days>10){cls='cold';lab='abandonado';}else if(days>3){cls='warn';lab='esfriando';}const c=CTXS[p.ctx]||CTXS.pessoal;const today=(p.days||[]).includes(todayStr);const n=(p.days||[]).length;
    const rts=R.filter(r=>r.proj===p.id);
    const rtHTML=rts.length?rts.map(retomadaBlock).join(''):`<button class="pjrtadd" data-pj-rt-add="${p.id}">🧭 + registrar retomada deste projeto</button>`;
    cards+=`<div class="pjcard ${cls}" style="--cc:${c.cor}"><div class="pjcardtop"><span class="pjdot"></span><div class="pjinfo"><div class="pn">${hesc(p.name)}</div><div class="pm">${c.ic} ${c.label} · <b>${n}</b> dia(s) · ${days===0?'hoje':'há '+days+(days===1?' dia':' dias')}</div></div><span class="ccstat ${cls}">${lab}</span><span class="ccx" data-pj-del="${p.id}" title="remover projeto">✕</span></div><div class="pjcardacts"><button class="cclink${today?' mut':''}" data-pj-day="${p.id}">${today?'✓ dediquei hoje':'✋ dediquei hoje'}</button><label class="pjdate" title="registrar outro dia">📅 outro dia<input type="date" data-pj-dayadd="${p.id}"></label></div><div class="pjcardrt">${rtHTML}</div></div>`;});
  cards+=`<button class="pjaddcard" data-pj-add="1">＋ novo projeto</button>`;
  const Rsolta=R.filter(r=>!r.proj);let rinner='';
  if(Rsolta.length){rinner=Rsolta.map(r=>`<div class="ccrow"><div class="body"><div class="ti">${hesc(r.title)}</div><div class="nx"><b>Próximo:</b> ${hesc(r.next||'—')}</div><div class="r">${ctxTag(r.ctx)}<span class="when">há ${timeAgo(r.ts)}</span><span class="cclink" data-rt-link="${r.id}">🗂 vincular projeto</span><span class="cclink" data-rt-up="${r.id}">↑ retomei agora</span><span class="cclink" data-rt-sched="${r.id}">⏱ agendar no dia</span><span class="cclink" data-rt-edit="${r.id}">editar</span><span class="cclink mut" data-rt-del="${r.id}">remover</span></div></div></div>`).join('');
  }else{rinner=`<div class="ccempty">Nenhuma retomada solta — as vinculadas aparecem dentro do próprio projeto.</div>`;}
  rinner+=`<div style="margin-top:10px"><span class="cclink" data-rt-add="1" style="font-size:13px">+ nova retomada solta</span></div>`;
  let h=`<p class="chelp" style="margin-top:0">Cada projeto já traz sua retomada — retome, agende ou edite direto no card, sem precisar procurar em outro lugar.</p>`;
  h+=gtSection('pj-list','Projetos & retomadas','📊',`<div class="pjgrid">${cards}</div>`);
  h+=gtSection('pj-rt-solta','Retomadas soltas','🧭',rinner);
  h+=gtSection('pj-cal','Calendário de dedicação','📅',calBody);
  return h;
}
function renderRetomada(){
  const H=state.habit;const R=[...H.retomadas].sort((a,b)=>b.ts-a.ts);
  let inner='';
  if(R.length){R.forEach(r=>{const proj=r.proj?H.projetos.find(p=>p.id===r.proj):null;const projTag=proj?`<span class="cclink mut" data-rt-link="${r.id}">🗂 ${hesc(proj.name)}</span>`:`<span class="cclink" data-rt-link="${r.id}">🗂 vincular projeto</span>`;
    inner+=`<div class="ccrow"><div class="body"><div class="ti">${hesc(r.title)}</div><div class="nx"><b>Próximo:</b> ${hesc(r.next||'—')}</div><div class="r">${ctxTag(r.ctx)}<span class="when">há ${timeAgo(r.ts)}</span>${projTag}<span class="cclink" data-rt-up="${r.id}">↑ retomei agora</span><span class="cclink" data-rt-sched="${r.id}">⏱ agendar no dia</span><span class="cclink" data-rt-edit="${r.id}">editar</span><span class="cclink mut" data-rt-del="${r.id}">remover</span></div></div></div>`;});
  }else{inner+=`<div class="ccempty">Nada em aberto — adicione o que você quer retomar.</div>`;}
  inner+=`<div style="margin-top:10px"><span class="cclink" data-rt-add="1" style="font-size:13px">+ nova retomada</span></div>`;
  let h=`<p class="chelp" style="margin-top:0">Onde você parou — e o próximo passo concreto.</p>`;
  h+=gtSection('rt-list','Retomadas','🧭',inner);
  return h;
}
function renderProjetos(){
  const H=state.habit;const todayStr=pdStr();
  const yy=+mes.split('-')[0],mm=+mes.split('-')[1];const dim=new Date(yy,mm,0).getDate(),fw=new Date(yy,mm-1,1).getDay();
  const dayCount={};H.projetos.forEach(p=>(p.days||[]).forEach(ds=>{const dd=new Date(ds+'T00:00:00');if(dd.getFullYear()===yy&&dd.getMonth()===mm-1)dayCount[dd.getDate()]=(dayCount[dd.getDate()]||0)+1;}));
  const nowD=new Date();let cal='';for(let b=0;b<fw;b++)cal+='<span class="mcd off"></span>';
  for(let d=1;d<=dim;d++){const c=dayCount[d]||0;const isT=(nowD.getFullYear()===yy&&nowD.getMonth()===mm-1&&nowD.getDate()===d);cal+=`<span class="mcd${isT?' today':''}${c>=2?' full':c===1?' part':''}" title="${c} projeto(s)">${d}</span>`;}
  const calBody=`<div class="hcard" style="padding:13px"><div class="ameshd"><span class="al">📆 ${monthLabel(mes)}</span><span class="amesm" style="font-size:10.5px;color:var(--ink-soft);font-weight:600">sincronizado · Semana &amp; Mês</span></div><div class="mcal" style="margin-top:8px"><div class="mcalh">${WD.map(d=>`<span>${d}</span>`).join('')}</div><div class="mcalg">${cal}</div></div></div>`;
  const P=[...H.projetos].sort((a,b)=>a.last-b.last);let listInner='';
  P.forEach(p=>{const days=Math.floor((Date.now()-p.last)/864e5);let cls='ok',lab='ativo';if(days>10){cls='cold';lab='abandonado';}else if(days>3){cls='warn';lab='esfriando';}const c=CTXS[p.ctx]||CTXS.pessoal;const today=(p.days||[]).includes(todayStr);const n=(p.days||[]).length;
    listInner+=`<div class="ccproj"><span class="ccdot" style="background:${c.cor}"></span><div class="body"><div class="pn">${hesc(p.name)}</div><div class="pm">${c.ic} ${c.label} · <b>${n}</b> dia(s) · ${days===0?'hoje':'há '+days+(days===1?' dia':' dias')}</div></div><span class="ccstat ${cls}">${lab}</span><button class="cclink${today?' mut':''}" data-pj-day="${p.id}">${today?'✓ hoje':'✋ dediquei hoje'}</button><label class="pjdate" title="registrar outro dia">📅<input type="date" data-pj-dayadd="${p.id}"></label><span class="ccx" data-pj-del="${p.id}">✕</span></div>`;});
  listInner+=`<div style="margin-top:10px"><span class="cclink" data-pj-add="1" style="font-size:13px">+ projeto</span></div>`;
  let h=`<p class="chelp" style="margin-top:0">Registre os dias dedicados a cada projeto — aparecem no calendário do mês.</p>`;
  h+=gtSection('pj-cal','Calendário de dedicação','📅',calBody);
  h+=gtSection('pj-list','Projetos','📊',listInner);
  return h;
}
function renderComando(){
  const H=state.habit;let html='';const todayStr=pdStr();
  html+=`<p class="chelp" style="margin-top:0">A próxima ação, a captura de ideias e o radar dos projetos — agora sincronizados com o calendário da <b>Semana</b> e do <b>Mês</b>.</p>`;
  const R=[...H.retomadas].sort((a,b)=>b.ts-a.ts);
  html+=`<div class="ccbanner"><span class="bnum">01</span><div class="bic">🧭</div><div class="bt"><h3>Retomada inteligente</h3><p>Onde você parou — e o próximo passo concreto.</p></div></div>`;
  if(R.length){R.forEach(r=>{const proj=r.proj?H.projetos.find(p=>p.id===r.proj):null;const projTag=proj?`<span class="cclink mut" data-rt-link="${r.id}">🗂 ${hesc(proj.name)}</span>`:`<span class="cclink" data-rt-link="${r.id}">🗂 vincular projeto</span>`;
    html+=`<div class="ccrow"><div class="body"><div class="ti">${hesc(r.title)}</div><div class="nx"><b>Próximo:</b> ${hesc(r.next||'—')}</div><div class="r">${ctxTag(r.ctx)}<span class="when">há ${timeAgo(r.ts)}</span>${projTag}<span class="cclink" data-rt-up="${r.id}">↑ retomei agora</span><span class="cclink" data-rt-sched="${r.id}">⏱ agendar no dia</span><span class="cclink" data-rt-edit="${r.id}">editar</span><span class="cclink mut" data-rt-del="${r.id}">remover</span></div></div></div>`;});
  }else{html+=`<div class="ccempty">Nada em aberto — adicione o que você quer retomar.</div>`;}
  html+=`<div style="margin-top:10px"><span class="cclink" data-rt-add="1" style="font-size:13px">+ nova retomada</span></div>`;
  html+=`<div class="ccbanner"><span class="bnum">02</span><div class="bic">📅</div><div class="bt"><h3>Dedicação aos projetos</h3><p>Registre os dias dedicados a cada projeto — aparecem no calendário do mês.</p></div></div>`;
  const yy=+mes.split('-')[0],mm=+mes.split('-')[1];const dim=new Date(yy,mm,0).getDate(),fw=new Date(yy,mm-1,1).getDay();
  const dayCount={};H.projetos.forEach(p=>(p.days||[]).forEach(ds=>{const dd=new Date(ds+'T00:00:00');if(dd.getFullYear()===yy&&dd.getMonth()===mm-1)dayCount[dd.getDate()]=(dayCount[dd.getDate()]||0)+1;}));
  const nowD=new Date();let cal='';for(let b=0;b<fw;b++)cal+='<span class="mcd off"></span>';
  for(let d=1;d<=dim;d++){const c=dayCount[d]||0;const isT=(nowD.getFullYear()===yy&&nowD.getMonth()===mm-1&&nowD.getDate()===d);cal+=`<span class="mcd${isT?' today':''}${c>=2?' full':c===1?' part':''}" title="${c} projeto(s)">${d}</span>`;}
  html+=`<div class="hcard" style="padding:13px"><div class="ameshd"><span class="al">📆 ${monthLabel(mes)}</span><span class="amesm" style="font-size:10.5px;color:var(--ink-soft);font-weight:600">sincronizado · Semana &amp; Mês</span></div><div class="mcal" style="margin-top:8px"><div class="mcalh">${WD.map(d=>`<span>${d}</span>`).join('')}</div><div class="mcalg">${cal}</div></div></div>`;
  const P=[...H.projetos].sort((a,b)=>a.last-b.last);
  P.forEach(p=>{const days=Math.floor((Date.now()-p.last)/864e5);let cls='ok',lab='ativo';if(days>10){cls='cold';lab='abandonado';}else if(days>3){cls='warn';lab='esfriando';}const c=CTXS[p.ctx]||CTXS.pessoal;const today=(p.days||[]).includes(todayStr);const n=(p.days||[]).length;
    html+=`<div class="ccproj"><span class="ccdot" style="background:${c.cor}"></span><div class="body"><div class="pn">${hesc(p.name)}</div><div class="pm">${c.ic} ${c.label} · <b>${n}</b> dia(s) · ${days===0?'hoje':'há '+days+(days===1?' dia':' dias')}</div></div><span class="ccstat ${cls}">${lab}</span><button class="cclink${today?' mut':''}" data-pj-day="${p.id}">${today?'✓ hoje':'✋ dediquei hoje'}</button><label class="pjdate" title="registrar outro dia">📅<input type="date" data-pj-dayadd="${p.id}"></label><span class="ccx" data-pj-del="${p.id}">✕</span></div>`;});
  html+=`<div style="margin-top:10px"><span class="cclink" data-pj-add="1" style="font-size:13px">+ projeto</span></div>`;
  return html;
}
function renderCulture(){
  const C=state.culture;let h='';
  h+=`<p class="chelp" style="margin-top:0">"Você é aquilo de que gosta." Registre o que quer assistir, ler e ouvir — marque ao consumir.</p>`;
  h+=`<div class="cvgrid">`+CV_GROUPS.map(gr=>{
    let col=`<div class="cvcol"><div class="cvgh">${gr.ic} ${gr.g}</div>`;
    gr.cats.forEach(ct=>{const key=ct[0],items=C.items[key]||[];
      col+=`<div class="cvcat"><div class="cvct">${ct[1]}</div>`;
      col+=items.map(it=>`<div class="cvitem${it.done?' done':''}"><button class="cvchk" data-cv-done="${key}:${it.id}">✓</button><span class="cvtx">${hesc(it.txt)}</span><button class="cvx" data-cv-del="${key}:${it.id}">✕</button></div>`).join('');
      col+=`<input class="cvadd" data-cv-add="${key}" placeholder="+ adicionar…"></div>`;
    });
    return col+`</div>`;
  }).join('')+`</div>`;
  h+=`<div class="cvnotes"><span class="al">Notas</span><textarea class="abox" data-cv-notes placeholder="Recomendações, links, o que dizer numa conversa…">${hesc(C.notes||'')}</textarea></div>`;
  h+=`<div class="cvrefs"><span class="cvrl">Para referência:</span><label class="cvref${C.refs.blog?' on':''}"><input type="checkbox" data-cv-ref="blog"${C.refs.blog?' checked':''}>no blog</label><label class="cvref${C.refs.convo?' on':''}"><input type="checkbox" data-cv-ref="convo"${C.refs.convo?' checked':''}>numa conversa</label><label class="cvref${C.refs.hip?' on':''}"><input type="checkbox" data-cv-ref="hip"${C.refs.hip?' checked':''}>provar hipness</label></div>`;
  return h;
}
function renderFerramentas(){
  const tm=state.habit.toolsMap;let html='';
  html+=`<p class="chelp" style="margin-top:0">Referências rápidas — onde cada coisa mora e blocos livres para organizar.</p>`;
  let mapBody=`<div class="ccmap">`+tm.tools.map(t=>`<div class="cctool"><button class="tlx" data-tool-del="${t.id}" title="remover">✕</button><div class="ic" contenteditable="true" data-tool-edit="${t.id}:ic">${hesc(t.ic)}</div><div class="nm" contenteditable="true" data-tool-edit="${t.id}:nm">${hesc(t.nm)}</div><div class="fn" contenteditable="true" data-tool-edit="${t.id}:fn">${hesc(t.fn)}</div><div class="fr" contenteditable="true" data-tool-edit="${t.id}:fr">${hesc(t.fr)}</div></div>`).join('')+`</div>`;
  mapBody+=`<div style="margin:10px 2px"><span class="cclink" id="toolAdd" style="font-size:13px">+ ferramenta</span></div>`;
  html+=gtSection('rf-map','Mapa de ferramentas','🗺️',mapBody);
  const secs=tm.sections||[];
  let secBody=`<div class="mmsecs">`+secs.map(s=>`<div class="mmsec"><div class="mmsech"><span class="mmtitle" contenteditable="true" data-mmsec-title="${s.id}">${hesc(s.title)}</span><button class="mmsecdel" data-mmsec-del="${s.id}" title="remover seção">✕</button></div><div class="mmcards">${(s.cards||[]).map(c=>`<div class="mmcard" style="--cc:${c.color||'#9a7b3f'}"><span class="mmctext" contenteditable="true" data-mmcard="${s.id}:${c.id}">${hesc(c.text)}</span><button class="mmcdel" data-mmcard-del="${s.id}:${c.id}" title="remover">×</button></div>`).join('')}<button class="mmcadd" data-mmcard-add="${s.id}">＋ bloco</button></div></div>`).join('')+`</div>`;
  secBody+=`<div style="margin:10px 2px"><span class="cclink" id="mmSecAdd" style="font-size:13px">+ nova seção</span></div>`;
  html+=gtSection('rf-secs','Seções livres','🧩',secBody);
  return html;
}
let rtSchedId=null;
function openRtSched(id){rtSchedId=id;const r=state.habit.retomadas.find(x=>x.id===id);if(!r)return;document.getElementById('rtSchedTxt').textContent=r.title;
  const wmon=mondayOf(weekStart),WDl=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];let dopts='';for(let i=0;i<7;i++){const dd=new Date(wmon);dd.setDate(wmon.getDate()+i);dopts+=`<option value="${i}">${WDl[i]} ${dd.getDate()}/${dd.getMonth()+1}</option>`;}
  document.getElementById('rtSchedDay').innerHTML=dopts;let hopts='';for(let h=6;h<=23;h++)hopts+=`<option value="${h}">${String(h).padStart(2,'0')}h</option>`;document.getElementById('rtSchedHour').innerHTML=hopts;
  openModal('rtSchedModal');}
document.querySelectorAll('#toolDock [data-dock]').forEach(b=>b.addEventListener('click',()=>openGT(b.dataset.dock)));
const _projFab=document.getElementById('projFab');if(_projFab)_projFab.onclick=()=>openGT('projetos');
document.getElementById('dockClose').onclick=closeGT;
document.getElementById('mgHandle').onclick=()=>{document.body.classList.toggle('mg-open');renderMgPanel();};
document.getElementById('mgBody').addEventListener('click',e=>{const c=e.target.closest('[data-mgworld]');if(c)selectWorld(c.dataset.mgworld);});
function renderMealModal(){
  const H=state.habit,todayStr=pdStr();
  const presets=document.getElementById('mealPresets');
  presets.innerHTML=(H.mealPresets||[]).map(p=>`<div class="mealpreset"><button class="mealpresetbtn" data-meal-preset="${p.id}">${hesc(p.name)}</button><button class="mealpresetdel" data-meal-preset-del="${p.id}" title="remover">✕</button></div>`).join('')||'<span class="mgtnote">sem presets</span>';
  const log=(H.mealLog[todayStr]||[]).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  const le=document.getElementById('mealLogEdit');
  le.innerHTML=log.length?log.map(m=>`<div class="meallogrow"><span class="mlrname">${hesc(m.name)}</span><span class="mlrtime">${hesc(m.time||'—')}</span><button class="mlrdel" data-meal-del="${m.id}" title="remover">✕</button></div>`).join(''):'<div class="mgtnote">Nenhuma refeição registrada hoje.</div>';
}
function openMealModal(){document.getElementById('mealName').value='';document.getElementById('mealTime').value='';renderMealModal();openModal('mealModal');}
document.addEventListener('click',e=>{if(e.target.closest('#mgMealOpen'))openMealModal();});
document.getElementById('wtSchedSet').onclick=()=>{if(!wtSchedId)return;const day=+document.getElementById('wtSchedDay').value;const t=document.getElementById('wtSchedTime').value||'09:00';const mins=timeToMin(t);wtAssignToDay(wtSchedId,day,mins);closeModals();};
document.getElementById('mealSave').onclick=()=>{const name=document.getElementById('mealName').value.trim();if(!name)return;const time=document.getElementById('mealTime').value||'';const todayStr=pdStr();const H=state.habit;(H.mealLog[todayStr]=H.mealLog[todayStr]||[]).push({id:uid(),name,time});save();document.getElementById('mealName').value='';document.getElementById('mealTime').value='';renderMealModal();renderMgPanel();};
document.getElementById('mealPresetAdd').onclick=()=>{const inp=document.getElementById('mealPresetNew');const name=inp.value.trim();if(!name)return;state.habit.mealPresets.push({id:uid(),name});save();inp.value='';renderMealModal();};
document.getElementById('mealPresets').addEventListener('click',e=>{
  const p=e.target.closest('[data-meal-preset]');if(p){document.getElementById('mealName').value=state.habit.mealPresets.find(x=>x.id===p.dataset.mealPreset)?.name||'';return;}
  const pd=e.target.closest('[data-meal-preset-del]');if(pd){state.habit.mealPresets=state.habit.mealPresets.filter(x=>x.id!==pd.dataset.mealPresetDel);save();renderMealModal();return;}
});
document.getElementById('mealLogEdit').addEventListener('click',e=>{const d=e.target.closest('[data-meal-del]');if(!d)return;const todayStr=pdStr();const H=state.habit;H.mealLog[todayStr]=(H.mealLog[todayStr]||[]).filter(x=>x.id!==d.dataset.mealDel);save();renderMealModal();renderMgPanel();});
document.addEventListener('input',e=>{const sp=e.target.closest('#mgSpendLimit');if(sp){const v=sp.value===''?null:+sp.value;state.habit.dailySpendLimit=v;save();}});
document.addEventListener('change',e=>{const mt=e.target.closest('[data-med-take]');if(mt){const today=pdStr();const H=state.habit;const list=(H.medsLog[today]=H.medsLog[today]||[]);const id=mt.dataset.medTake;const ix=list.indexOf(id);if(mt.checked&&ix<0)list.push(id);else if(!mt.checked&&ix>=0)list.splice(ix,1);save();renderMgPanel();}});
document.addEventListener('click',e=>{if(e.target.closest('#mgMedAdd')){const name=prompt('Nome do medicamento:');if(name&&name.trim()){const dose=prompt('Dose (opcional):','')||'';state.habit.medications.push({id:uid(),name:name.trim(),dose:dose.trim()});save();renderMgPanel();}}});
document.addEventListener('click',e=>{if(e.target.closest('#mgSpendAdd')){document.getElementById('gastoNome').value='';document.getElementById('gastoValor').value='';document.getElementById('gastoData').value=pdStr();openModal('gastoModal');}});
document.getElementById('gastoSave').onclick=()=>{
  const nome=document.getElementById('gastoNome').value.trim();
  const v=num(document.getElementById('gastoValor').value);
  const dia=document.getElementById('gastoData').value||pdStr();
  if(!nome||!v)return;
  const mesDoGasto=dia.slice(0,7);
  state.entries.push({id:uid(),tipo:'variavel',mes:mesDoGasto,valor:v,prev:v,efet:v,descricao:nome,meio:null,grupo:'Gasto diário',diaGasto:dia});
  save();closeModals();renderMgPanel();if(mesDoGasto===mes)renderAll();
};
let mgInlineCollapsed=false;
const _mgInlineTog=document.getElementById('mgInlineTog');if(_mgInlineTog)_mgInlineTog.onclick=()=>{mgInlineCollapsed=!mgInlineCollapsed;document.getElementById('mgInline').classList.toggle('collapsed',mgInlineCollapsed);document.getElementById('mgInlineChev').textContent=mgInlineCollapsed?'›':'⌄';};
const _mgBodyHab=document.getElementById('mgBodyHab');if(_mgBodyHab)_mgBodyHab.addEventListener('click',e=>{const c=e.target.closest('[data-mgworld]');if(c)selectWorld(c.dataset.mgworld);});
const _capSave=document.getElementById('capEditSave');if(_capSave)_capSave.onclick=()=>{const n=(state.habit.captures||[]).find(x=>x.id===capEditId);if(n){n.date=document.getElementById('capEditDate').value||null;n.time=document.getElementById('capEditTime').value||null;n.area=document.getElementById('capEditArea').value||null;n.goal=document.getElementById('capEditGoal').value||null;save();}closeModals();gtRender();};
const _capClr=document.getElementById('capEditClear');if(_capClr)_capClr.onclick=()=>{const n=(state.habit.captures||[]).find(x=>x.id===capEditId);if(n){n.date=null;n.time=null;save();}closeModals();gtRender();};
document.getElementById('bmScrim').onclick=closeBlockModal;
document.getElementById('bmDone').onclick=closeBlockModal;
document.getElementById('bmDelete').onclick=()=>{if(bmDay==null||bmId==null)return;const wkv=state.habit.weekPlan[weekKeyOf(weekStart)];if(wkv&&wkv.blocks&&wkv.blocks[bmDay]){wkv.blocks[bmDay]=wkv.blocks[bmDay].filter(x=>x.id!==bmId);save();}closeBlockModal();};
document.getElementById('bmStart').addEventListener('change',bmApplyTimes);
document.getElementById('bmEnd').addEventListener('change',bmApplyTimes);
document.getElementById('bmTitle').addEventListener('input',e=>{const b=schedFindBlock(bmDay,bmId);if(b){b.title=e.target.value;save();}});
document.getElementById('bmDesc').addEventListener('input',e=>{const b=schedFindBlock(bmDay,bmId);if(b){b.desc=e.target.value;save();}});
document.getElementById('bmNota').addEventListener('input',e=>{const b=schedFindBlock(bmDay,bmId);if(b){b.nota=e.target.value;save();}});
document.getElementById('bmArea').addEventListener('change',e=>{const b=schedFindBlock(bmDay,bmId);if(b){b.area=e.target.value;save();}});
document.getElementById('bmIndisp').addEventListener('change',e=>{const b=schedFindBlock(bmDay,bmId);if(b){b.indispensavel=e.target.checked;save();renderMgPanel();}});
document.querySelectorAll('[data-gt-close]').forEach(b=>b.addEventListener('click',closeGT));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&gtIsOpen())closeGT();});
const _rtSet=document.getElementById('rtSchedSet');if(_rtSet)_rtSet.onclick=()=>{const r=state.habit.retomadas.find(x=>x.id===rtSchedId);if(!r){closeModals();return;}const di=+document.getElementById('rtSchedDay').value,hh=+document.getElementById('rtSchedHour').value;const k=weekKeyOf(weekStart);const o=(state.habit.weekPlan[k]=state.habit.weekPlan[k]||{});const ck=di+'-'+hh;o[ck]=(o[ck]?o[ck]+' · ':'')+r.title;r.ts=Date.now();
  if(r.proj){const p=state.habit.projetos.find(x=>x.id===r.proj);if(p){const wmon=mondayOf(weekStart);const dd=new Date(wmon);dd.setDate(wmon.getDate()+di);const ds=pdStr(dd);p.days=p.days||[];if(!p.days.includes(ds))p.days.push(ds);p.last=Date.now();}}
  save();closeModals();gtRender();if(habitMode&&activeHabitTab==='habit')renderHabit();};

/* ===== Yggdrasil — navegação em árvore (overlay) ===== */
const YGG_WORLDS=[
  {id:'alimentacao',nome:'Vanaheim',realm:'Cultura',zona:'copa',glyph:'❖',ac:'#9c7a1e',resumo:'Cultura, Ikigai e decisões — a mente que escolhe.'},
  {id:'habitos',nome:'Miðgard',realm:'Hábitos & Rotina',zona:'ramos',glyph:'❂',ac:'#c2611f',resumo:'Sequências diárias, semanas e comando.'},
  {id:'tarefas',nome:'Niflheim',realm:'Self-Therapy',zona:'ramos',glyph:'☉',ac:'#715a86',resumo:'Desembaralhar o que sente.'},
  {id:'cosmo',nome:'Cosmo',realm:'Aprovação Federal',zona:'ramos',glyph:'✦',ac:'#2d54c8',resumo:'Edital, questões, ciclo e revisão espaçada.'},
  {id:'espelho',nome:'Urðarbrunnr',realm:'Espelho',zona:'raizes',glyph:'ᚱ',ac:'#8a6d3b',resumo:'Mapa astral, numerologia e vocação.'},
  {id:'financeiro',nome:'Niðavellir',realm:'Sistema Financeiro',zona:'raizes',glyph:'❦',ac:'#1f6b46',resumo:'Mês, previsão, planejamento e metas.'},
  {id:'saude',nome:'Jötunheim',realm:'Saúde',zona:'raizes',glyph:'✚',ac:'#a8412f',resumo:'Indicadores, consultas e exames.'},
  {id:'asgard',nome:'Asgard',realm:'Vision Board',zona:'copa',glyph:'⟡',ac:'#9a7b3f',resumo:'Metas e áreas da vida.'},
];
const ACTIVE_WORLDS={financeiro:1,habitos:1,asgard:1,saude:1,tarefas:1,alimentacao:1,espelho:1,cosmo:1};
// Por ora, só o Miðgard fica visível como homepage do app — os demais mundos ficam ocultos (fácil reverter: adicione o id aqui).
const WORLDS_VISIBLE={habitos:1};
const SEED_WORLDS={
  asgard:{nome:'Asgard',realm:'Asgard',glyph:'⟡',ac:'#9a7b3f',acs:'#efe6cf',tabs:[['vision','Vision Board'],['areas','Áreas da Vida'],['metas','Metas'],['decision','Decisão']],rows:[]},
  saude:{nome:'Jötunheim',realm:'Saúde',glyph:'✚',ac:'#a8412f',acs:'#f3ddd5',tabs:[['consultas','Consultas'],['exames','Exames'],['treinos','Treinos'],['receitas','Receitas']],rows:[]},
  alimentacao:{nome:'Vanaheim',realm:'Cultura',glyph:'❖',ac:'#9c7a1e',acs:'#f1e6cf',tabs:[['culture','Culture']],rows:[]},
  tarefas:{nome:'Niflheim',realm:'Niflheim',glyph:'☉',ac:'#715a86',acs:'#e7e0ee',tabs:[['therapy','Self-Therapy'],['ikigai','Ikigai']],rows:[]},
  espelho:{nome:'Urðarbrunnr',realm:'Poço de Urðr',glyph:'ᚱ',ac:'#8a6d3b',acs:'#efe3c8',tabs:[['resumo','Resumo'],['astral','Mapa Astral'],['numero','Numerologia'],['prof','Profissional'],['sintese','Síntese']],rows:[]},
  cosmo:{nome:'Cosmo',realm:'Aprovação Federal',glyph:'✦',ac:'#2d54c8',acs:'#e3e9f7',tabs:[['app','Painel']],rows:[]},
};
let homeMode=true;
function currentWorldId(){return seedWorld?seedWorld:(habitMode?'habitos':'financeiro');}
function enterHome(){homeMode=true;document.documentElement.classList.add('ygg-home');document.documentElement.classList.remove('ygg-world');paintTree();AXD.scrollTo(0,0);}
function goHome(){enterHome();}
function showWorldShell(){homeMode=false;document.documentElement.classList.remove('ygg-home');document.documentElement.classList.add('ygg-world');paintRail();}
function paintRail(){
  const cur=currentWorldId();
  let h='<button class="yr-home" title="Voltar ao hub central">ᛉ</button><div class="yr-nodes">';
  ['copa','ramos','raizes'].forEach((zk,zi)=>{ if(zi)h+='<div class="yr-sep"></div>';
    YGG_WORLDS.filter(w=>w.zona===zk&&WORLDS_VISIBLE[w.id]).forEach(w=>{const act=!!ACTIVE_WORLDS[w.id],sel=w.id===cur;
      h+=`<button class="yr-disc${act?' active':''}${sel?' sel':''}" data-world="${w.id}" style="--wc:${w.ac}" title="${w.nome} · ${w.realm}">${w.glyph}</button>`;});
  });
  h+='</div>';
  document.getElementById('yggRail').innerHTML=h;
}
function paintTree(){
  const cur=homeMode?null:currentWorldId();
  const zones=[['copa','copa'],['ramos','ramos'],['raizes','raízes']];
  let h='';
  zones.forEach(z=>{ h+=`<div class="yzh">${z[1]}</div>`;
    YGG_WORLDS.filter(w=>w.zona===z[0]&&WORLDS_VISIBLE[w.id]).forEach(w=>{
      const act=!!ACTIVE_WORLDS[w.id], sel=w.id===cur;
      h+=`<button class="ynode${act?' active':''}${sel?' sel':''}" data-world="${w.id}" style="--wc:${w.ac}"><span class="ydisc">${w.glyph}</span><span class="yinfo"><span class="yname">${w.nome}</span><span class="yrealm">${w.realm}</span><span class="yres">${w.resumo}</span></span><span class="ybadge${act?' on':''}">${act?(sel?'aqui':'entrar'):'em breve'}</span></button>`;
    });
  });
  document.getElementById('yggNodes').innerHTML=h;
}
function exitSeed(){seedWorld=null;document.documentElement.classList.remove('seed');const r=document.documentElement.style;r.removeProperty('--pos');r.removeProperty('--pos-soft');}
function enterSeed(id){
  const w=SEED_WORLDS[id];if(!w)return;
  seedWorld=id;activeSeedTab=w.tabs[0][0];habitMode=false;annual=false;
  document.documentElement.classList.remove('habit');
  document.documentElement.classList.add('seed');
  const r=document.documentElement.style;r.setProperty('--pos',w.ac);r.setProperty('--pos-soft',w.acs);
  const eb2=document.getElementById('eyebrow');if(eb2)eb2.textContent=w.nome.toLowerCase()+' · '+w.realm.toLowerCase()+' · bruno dutra';
  paintTabs();activateTab(activeSeedTab);AXD.scrollTo(0,0);
}
function selectWorld(id){
  if(id==='financeiro'){exitSeed();habitMode=false;applyMode();}
  else if(id==='habitos'){exitSeed();habitMode=true;annual=false;applyMode();}
  else{enterSeed(id);}
  document.documentElement.classList.toggle('mid',id==='habitos');
  if(id!=='habitos')document.body.classList.remove('mg-open');
  renderMgPanel();
  showWorldShell();AXD.scrollTo(0,0);
}
function mgCard(world,glyph,title,color,body){return `<div class="mgcard" style="--cc:${color}" data-mgworld="${world}"><div class="mgch"><span class="mgglyph">${glyph}</span><span class="mgt">${title}</span></div><div class="mgcb">${body}</div></div>`;}
function renderMgPanel(){
  const el=document.getElementById('mgBody');const elHab=document.getElementById('mgBodyHab');
  if(!el&&!elHab)return;
  const H=state.habit,wkv=H.weekPlan[weekKeyOf(weekStart)]||{},todayIdx=(new Date().getDay()+6)%7,todayStr=pdStr();
  const trId=wkv['treinoDia-'+todayIdx],tr=(state.saude.treinos||[]).find(t=>t.id===trId);
  const meals=[['cafe','Café'],['almoco','Almoço'],['jantar','Jantar']];
  const dieta=meals.map(mm=>{const r=(state.saude.receitas||[]).find(x=>x.id===wkv['dieta-'+todayIdx+'-'+mm[0]]);return `${mm[1]}: ${r?hesc(r.name):'—'}`;}).join('<br>');
  const mpv=(H.monthPlan[mes]=H.monthPlan[mes]||{});
  const goals=(state.asgard.goals||[]).slice(0,3);
  const goalsHTML=goals.length?goals.map(g=>`<div class="mggoal"><span class="mggoaltxt">${hesc(g.title)}</span><span class="mggoalpct">${g.progress||0}%</span></div>`).join(''):'<div class="mggoalempty">Sem metas cadastradas em Asgard.</div>';
  const metasHTML=`<div class="mgmetas"><div class="mgmetash"><span class="al">🎯 Metas do mês/semana</span></div><div class="mggoals">${goalsHTML}</div><textarea class="abox" data-mp="metas" placeholder="Metas e intenções do mês…">${hesc(mpv.metas||'')}</textarea></div>`;
  const cardsHTML=`<div class="mgstack">${metasHTML}</div>`;
  if(el)el.innerHTML=cardsHTML;
  if(elHab)elHab.innerHTML=cardsHTML;
  const MMn=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const calEl=document.getElementById('mgCalInline');
  if(calEl){
    const yy2=+mes.split('-')[0],mm3=+mes.split('-')[1],dim2=new Date(yy2,mm3,0).getDate(),fw2=new Date(yy2,mm3-1,1).getDay(),nowD2=new Date();
    let cal2='';for(let b=0;b<fw2;b++)cal2+='<span class="mcd off"></span>';
    for(let d=1;d<=dim2;d++){let on=0;H.daily.forEach(hb=>{if(hOn(hb.id,d))on++;});const full=H.daily.length&&on===H.daily.length,part=on>0&&!full,isT=(nowD2.getFullYear()===yy2&&nowD2.getMonth()===mm3-1&&nowD2.getDate()===d);cal2+=`<span class="mcd${isT?' today':''}${full?' full':part?' part':''}">${d}</span>`;}
    const wmonNow=mondayOf(weekStart);const weekNum=Math.ceil(wmonNow.getDate()/7);
    calEl.innerHTML=`<div class="mgcal"><div class="mcalh">${WD.map(d=>`<span>${d}</span>`).join('')}</div><div class="mcalg">${cal2}</div></div><div class="mgweeklabel">📍 Semana ${weekNum} de ${MMn[wmonNow.getMonth()]}</div>`;
  }
  const foot=document.getElementById('mgFoot');const footHab=document.getElementById('mgFootHab');
  const quickEl=document.getElementById('mgQuickTrk');
  const today=pdStr();
  if(quickEl){
    const cups=H.hydration[today]||0,hgoal=H.hydrationGoal||8,slp=+(H.sleep[today]||0),sgoal=H.sleepGoal||8;
    const hpct=hgoal?Math.min(100,cups/hgoal*100):0,spct=sgoal?Math.min(100,slp/sgoal*100):0;
    const medsToday=(H.medsLog[today]||[]);
    const medsBody=`<div class="mgmeds">${(H.medications||[]).map(md=>{const taken=medsToday.includes(md.id);return `<label class="mgmedrow${taken?' taken':''}"><input type="checkbox" data-med-take="${md.id}" ${taken?'checked':''}><span class="mgmedn">${hesc(md.name)}</span>${md.dose?`<span class="mgmedd">${hesc(md.dose)}</span>`:''}</label>`;}).join('')||'<span class="mgtnote">sem medicamentos cadastrados</span>'}</div><button class="mgtrkbtn" id="mgMedAdd">＋ medicamento</button>`;
    const trk=(key,ic,label,val,body)=>`<div class="mgtrk${mgTrkOpen[key]?' open':''}"><button class="mgtrkh" data-mgtrk="${key}"><span class="mgtico">${ic}</span><span class="mgtl">${label}</span>${val?`<span class="mgtv">${val}</span>`:''}<span class="mgtchev">⌄</span></button><div class="mgtrkbody">${body}</div></div>`;
    const limitVal=H.dailySpendLimit!=null?H.dailySpendLimit:'';
    const spentToday=(state.entries||[]).filter(e=>e.diaGasto===today).reduce((s,e)=>s+num(e.efet!=null?e.efet:e.valor),0);
    const restante=H.dailySpendLimit!=null?(H.dailySpendLimit-spentToday):null;
    const gastoAlways=`<div class="mggasto"><div class="mggastoh"></div><div class="mggastorow"><span class="mgtico">💰</span><input type="number" min="0" step="10" class="mgspend-in" id="mgSpendLimit" value="${limitVal}" placeholder="0,00"><button class="mgtrkbtn" id="mgSpendAdd">＋</button></div>${restante!=null?`<div class="mggastostatus${restante<0?' over':''}">Gasto hoje: ${fmt0(spentToday)} · Resta: ${fmt0(restante)}</div>`:''}</div>`;
    quickEl.innerHTML=gastoAlways
      +trk('sleep','🌙','Sono',(slp||0)+'h',`<div class="mgbt sleep"><i style="width:${spct}%"></i></div><div class="mgtctl"><span class="mgtnote">registrado na aba Saúde</span></div>`)
      +trk('hydro','💧','Hidratação',cups+'/'+hgoal,`<div class="mgbt hydro"><i style="width:${hpct}%"></i></div><div class="mgtctl"><button class="mgbpm" data-hydro-d="-1">−</button><button class="mgbpm" data-hydro-d="1">+</button><span class="mgtnote">copos de hoje</span></div>`)
      +trk('meds','💊','Medicação',medsToday.length+'/'+(H.medications||[]).length,medsBody);
  }
  if(foot||footHab){
    const todayMeals=(H.mealLog[today]||[]).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    const mealChips=todayMeals.length?`<div class="mgmeallog">${todayMeals.map(m=>`<span class="mgmealchip">${hesc(m.name)}${m.time?' · '+hesc(m.time):''}</span>`).join('')}</div>`:'';
    const dietaBody=`<div class="mgdplanned">${dieta}</div>${mealChips}<button class="mgtrkbtn" id="mgMealOpen">🍽 Registrar refeição</button>`;
    const treinoBody=tr?`<b>${hesc(tr.name)}</b>${tr.focus?' · '+hesc(tr.focus):''}`:'<i>sem treino hoje</i>';
    const trk=(key,ic,label,val,body)=>`<div class="mgtrk${mgTrkOpen[key]?' open':''}"><button class="mgtrkh" data-mgtrk="${key}"><span class="mgtico">${ic}</span><span class="mgtl">${label}</span>${val?`<span class="mgtv">${val}</span>`:''}<span class="mgtchev">⌄</span></button><div class="mgtrkbody">${body}</div></div>`;
    const indispBlocks=((wkv.blocks&&wkv.blocks[todayIdx])||[]).filter(b=>b.indispensavel);
    const indispChips=indispBlocks.length?`<div class="mgindispitems">${indispBlocks.map(b=>`<span class="mgindispchip">◆ ${hesc(b.title||'Bloco')}</span>`).join('')}</div>`:'';
    const footHTML=metasHTML
      +`<label class="mgf"><span>◆ Indispensáveis diários</span>${indispChips}<textarea class="abox" data-wp="inegociaveis" placeholder="O que não pode faltar">${hesc(wkv['inegociaveis']||'')}</textarea></label>`
      +`<div class="mgtrks">`
      +trk('treino','🏋','Treino de hoje','',treinoBody)
      +trk('dieta','🍽','Dieta de hoje','',dietaBody)
      +`</div>`;
    if(foot)foot.innerHTML=footHTML;
    if(footHab)footHab.innerHTML=footHTML;
  }
}
let asgGoalId=null;
function goalCard(g,areaMap){const a=areaMap[g.area]||{ic:'•',name:'—',color:'#999'};
  return `<div class="goalcard" style="--cc:${a.color}" data-goal-edit="${g.id}"><div class="gch"><span class="gcarea">${a.ic} ${hesc(a.name)}</span>${g.horizon?`<span class="gchz">${hesc(g.horizon)}</span>`:''}</div><div class="gctitle">${hesc(g.title)}</div>${g.target?`<div class="gctarget">🎯 ${hesc(g.target)}</div>`:''}${g.why?`<div class="gcwhy">${hesc(g.why)}</div>`:''}<div class="gcbar"><i style="width:${g.progress||0}%"></i></div><div class="gcpct">${g.progress||0}% concluído</div></div>`;}
function renderAsgard(){
  const A=state.asgard;const tab=activeSeedTab;const areaMap={};A.areas.forEach(a=>areaMap[a.id]=a);
  let h=`<div class="sec asgsec"><div class="sec-h"><span class="t">${tab==='areas'?'Áreas da Vida':tab==='metas'?'Metas':'Vision Board'}</span><span class="sum" style="font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Asgard · o alto</span></div>`;
  if(tab==='vision'){
    h+=`<div class="asgvision"><span class="al">✦ Minha visão</span><textarea class="abox tall" data-asg-vision placeholder="Quem eu quero ser, a vida que estou construindo, os princípios que me guiam…">${hesc(A.vision||'')}</textarea></div>`;
    h+=`<div class="asgsub">Metas por área</div><div class="asgboard">`+A.goals.map(g=>goalCard(g,areaMap)).join('')+`<button class="asgaddcard" data-goal-add="1">＋ nova meta</button></div>`;
  }else if(tab==='areas'){
    h+=`<p class="chelp" style="margin:2px 2px 10px">As sete áreas que estruturam a sua vida. Toque no nome para renomear.</p><div class="asgareas">`+A.areas.map(a=>{const gs=A.goals.filter(g=>g.area===a.id);return `<div class="asgarea" style="--cc:${a.color}"><div class="aah"><span class="aaic">${a.ic}</span><span class="aanm" contenteditable="true" data-area-edit="${a.id}">${hesc(a.name)}</span><span class="aacount">${gs.length}</span></div>${gs.length?'<div class="aagoals">'+gs.map(g=>`<div class="aagoal" data-goal-edit="${g.id}"><span>${hesc(g.title)}</span><i>${g.progress||0}%</i></div>`).join('')+'</div>':'<div class="aaempty">Sem metas ainda</div>'}</div>`;}).join('')+`</div>`;
  }else{
    h+=`<p class="chelp" style="margin:2px 2px 10px">Suas metas de vida. Toque numa meta para editar progresso, área e horizonte.</p><div class="asgboard">`+A.goals.map(g=>goalCard(g,areaMap)).join('')+`<button class="asgaddcard" data-goal-add="1">＋ nova meta</button></div>`;
  }
  h+=`</div>`;
  document.getElementById('seedApp').innerHTML=h;
}
function openGoal(id){asgGoalId=id;const A=state.asgard;const g=id?A.goals.find(x=>x.id===id):{title:'',area:A.areas[0]&&A.areas[0].id,why:'',target:'',horizon:'',progress:0};
  document.getElementById('goalTitle').value=g.title||'';
  document.getElementById('goalArea').innerHTML=A.areas.map(a=>`<option value="${a.id}"${a.id===g.area?' selected':''}>${a.ic} ${a.name}</option>`).join('');
  document.getElementById('goalWhy').value=g.why||'';document.getElementById('goalTarget').value=g.target||'';document.getElementById('goalHorizon').value=g.horizon||'';
  document.getElementById('goalProg').value=g.progress||0;document.getElementById('goalProgV').textContent=(g.progress||0)+'%';
  document.getElementById('goalDel').style.display=id?'':'none';
  openModal('goalModal');}
let saudeType=null,saudeId=null;
function saudeCard(type,it){const E=hesc;
  if(type==='consultas'){const dt=it.date?new Date(it.date+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'sem data';return `<div class="saudec" data-saude-edit="${type}:${it.id}" style="--cc:#a8412f"><div class="scbadge">🩺 ${dt}${it.time?' · '+E(it.time):''}</div><div class="sctitle">${E(it.what||'Consulta')}</div><div class="scsub">${E(it.doctor||'')}${it.place?' · '+E(it.place):''}</div>${it.notes?`<div class="scpre">${E(it.notes)}</div>`:''}</div>`;}
  if(type==='exames'){const st=it.status||'Pendente';const dt=it.date?new Date(it.date+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'';return `<div class="saudec" data-saude-edit="${type}:${it.id}" style="--cc:#6f5aa8"><div class="scbadge stb" data-st="${E(st)}">${E(st)}</div><div class="sctitle">${E(it.name)}</div><div class="scsub">${dt}${it.result?' · '+E(it.result):''}</div></div>`;}
  if(type==='treinos'){return `<div class="saudec" data-saude-edit="${type}:${it.id}" style="--cc:#3f5d75"><div class="scbadge">🏋️ ${E(it.focus||'')}</div><div class="sctitle">${E(it.name)}</div><div class="scpre">${E((it.exercises||'').split('\n').filter(Boolean).slice(0,4).join(' · '))}</div></div>`;}
  return `<div class="saudec" data-saude-edit="${type}:${it.id}" style="--cc:#2f6f4e"><div class="scbadge">🍳 ${E(it.servings||'?')} porç · ${E(it.kcal||'?')} kcal</div><div class="sctitle">${E(it.name)}</div><div class="scpre">${E((it.ingredients||'').split('\n').filter(Boolean).slice(0,4).join(' · '))}</div></div>`;}
const SAUDE_DESC={consultas:'Agende e acompanhe consultas — com profissional, data, hora e local.',exames:'Cadastre exames, status e resultados.',treinos:'Seus treinos (A/B/C) — viram a aba Treino no rodapé da Semana.',receitas:'Suas receitas — viram a aba Dieta no rodapé da Semana.'};
function renderSaude(){
  const type=activeSeedTab,sc=SAUDE_SCHEMA[type]||SAUDE_SCHEMA.consultas,list=(state.saude[type]||[]);
  let arr=list.slice();if(sc.sort==='date')arr.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  let h=`<div class="sec asgsec"><div class="sec-h"><span class="t">${sc.title}s</span><span class="sum" style="font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Jötunheim · Saúde</span></div>`;
  h+=`<p class="chelp" style="margin:2px 2px 12px">${SAUDE_DESC[type]||''}</p>`;
  h+=`<div class="saudegrid">`+arr.map(it=>saudeCard(type,it)).join('')+`<button class="asgaddcard" data-saude-add="${type}">＋ ${sc.title.toLowerCase()}</button></div></div>`;
  document.getElementById('seedApp').innerHTML=h;
}
function openSaudeItem(type,id){saudeType=type;saudeId=id;const sc=SAUDE_SCHEMA[type];const it=id?state.saude[type].find(x=>x.id===id):{};
  document.getElementById('saudeTitle').textContent=(id?'Editar ':'Nova ')+sc.title.toLowerCase();
  let b='';sc.fields.forEach(f=>{const[key,label,kind]=f;const val=hesc(it[key]||'');
    if(kind==='textarea')b+=`<div class="fr"><label>${label}</label><textarea data-sf="${key}" rows="3">${val}</textarea></div>`;
    else if(kind.indexOf('select:')===0){const opts=kind.slice(7).split(',');b+=`<div class="fr"><label>${label}</label><select data-sf="${key}">${opts.map(o=>`<option${o===it[key]?' selected':''}>${o}</option>`).join('')}</select></div>`;}
    else b+=`<div class="fr"><label>${label}</label><input type="${kind}" data-sf="${key}" value="${val}"></div>`;});
  document.getElementById('saudeBody').innerHTML=b;
  document.getElementById('saudeDel').style.display=id?'':'none';
  openModal('saudeModal');}
const PLANNER_TABS={
  culture:{title:'Culture Vulture',desc:'O que assistir, ler e ouvir sem deixar boas ideias evaporarem.',sections:[
    {type:'columns',cols:[['watch','Assistir'],['read','Ler'],['listen','Ouvir']],count:8},
    {type:'columns',cols:[['viral','Vídeos virais'],['sites','Sites'],['podcasts','Podcasts']],count:5},
    {type:'columns',cols:[['cheap','Entretenimento barato'],['trash','Trashy stuff'],['guilty','Guilty pleasures']],count:5},
    {type:'text',key:'notes',title:'Notas',wide:true},
    {type:'choices',key:'reference',title:'Usar como referência',options:['Blog','Conversa casual','Provar hipness']}]},
  therapy:{title:'Self-Therapy',desc:'Desembaralhar um drama do momento sem precisar fingir elegância emocional.',sections:[
    {type:'text',key:'drama',title:'Psicodrama do momento',wide:true},
    {type:'text',key:'feelingAbout',title:'Como eu me sinto sobre isso?',wide:true},
    {type:'choices',key:'feel1',title:'Camada visível',options:['Raiva','Medo','Alegria','Tristeza','Cínico','Impotente','Perseguido','Entorpecido']},
    {type:'choices',key:'feel2',title:'Camada real',options:['Aliviado','Deprimido','Estressado','Alienado','Animado','Invejoso','Envergonhado']},
    {type:'choices',key:'source',title:'Isso provavelmente vem de',options:['Mãe','Pai','Cônjuge','Filhos','Outras pessoas','Eu','Criança interior','Química cerebral','Limites','Má sorte']},
    {type:'columns',cols:[['present','Influências presentes'],['past','Questões antigas']],count:4},
    {type:'text',key:'meaning',title:'O que isso significa',wide:true},
    {type:'choices',key:'breakthrough',title:'Breakthrough',options:['Terapia real','Medicação, por favor','Todo mundo é doido','Estou evoluído']}]},
  ikigai:{title:'Ikigai',desc:'Cruzamento entre amor, talento, necessidade do mundo e dinheiro.',sections:[
    {type:'text',key:'love',title:'O que eu amo'},
    {type:'text',key:'goodAt',title:'No que sou bom'},
    {type:'text',key:'worldNeeds',title:'O que o mundo precisa'},
    {type:'text',key:'paidFor',title:'Pelo que posso ser pago'},
    {type:'text',key:'passion',title:'Paixão'},
    {type:'text',key:'mission',title:'Missão'},
    {type:'text',key:'profession',title:'Profissão'},
    {type:'text',key:'vocation',title:'Vocação'},
    {type:'columns',cols:[['alt1','Alternativa 1'],['alt2','Alternativa 2'],['alt3','Alternativa 3']],count:4}]},
  decision:{title:'Make a Decision',desc:'Decidir sem rodar em círculo: cenários, intuição, prós/contras e próximo passo.',sections:[
    {type:'columns',cols:[['dilemma','Dilema'],['date','Data'],['neededBy','Decidir até']],count:1},
    {type:'choices',key:'importance',title:'Importância',options:['Trivial','Não letal','Vale a pena','Pesado','Life changing']},
    {type:'choices',key:'indecision',title:'Indecisão',options:['Wishy','Washy','Neutro','Partisan','Mind made up']},
    {type:'text',key:'best',title:'Melhor cenário',wide:true},
    {type:'text',key:'worst',title:'Pior cenário',wide:true},
    {type:'columns',cols:[['gut','Gut feelings'],['pros','Prós'],['cons','Contras']],count:7},
    {type:'text',key:'intuitive',title:'Conclusão intuitiva'},
    {type:'text',key:'rational',title:'Conclusão racional'},
    {type:'text',key:'decision',title:'Decisão',wide:true},
    {type:'text',key:'next',title:'Próximos passos',wide:true}]}
};
function mapStore(kind){return kind==='bag'?state.habit.bagMap:state.habit.consumoMap;}
function mapFind(kind,gid,iid){const groups=mapStore(kind);const g=groups.find(x=>x.id===gid);const it=g&&iid?(g.items||[]).find(x=>x.id===iid):null;return{groups,g,it};}
function askMapItem(seed){const name=prompt('Nome do item:',seed?seed.name:'');if(!name||!name.trim())return null;const meta=prompt('Dose, quantidade, frequência ou uso:',seed?seed.meta:'')||'';const note=prompt('Observações:',seed?seed.note:'')||'';return{name:name.trim(),meta:meta.trim(),note:note.trim()};}
function askClosetItem(seed){const name=prompt('Nome da peça/item:',seed?seed.name:'');if(!name||!name.trim())return null;const meta=prompt('Detalhes (tecido, tamanho, ocasião, marca):',seed?seed.meta:'')||'';const color=prompt('Cor ou código (ex: preto, #7a4f86):',seed?seed.color:'')||'';return{name:name.trim(),meta:meta.trim(),color:color.trim(),selected:seed?!!seed.selected:false};}
function askPertence(seed){const name=prompt('Nome do pertence:',seed?seed.name:'');if(!name||!name.trim())return null;const bought=prompt('Data da compra:',seed?seed.bought:'')||'';const place=prompt('Paradeiro:',seed?seed.place:'')||'';return{name:name.trim(),bought:bought.trim(),place:place.trim()};}
function closetSelected(){return (state.habit.closet||[]).flatMap(g=>(g.items||[]).filter(it=>it.selected).map(it=>({...it,cat:g.name,ic:g.ic})));}
function mapHtml(kind,title,lead,groups){
  const count=groups.reduce((s,g)=>s+(g.items?g.items.length:0),0);
  return `<section class="mapsection"><div class="mapsection-head"><div><h4>${title}</h4><p>${lead}</p></div><span class="mapcount">${count} itens</span></div><div class="lifemap">`+
    groups.map(g=>`<div class="lifecard"><div class="lifehead"><div class="lifeico">${g.ic||'•'}</div><div class="lifetitle"><div class="nm">${hesc(g.name)}</div><div class="ct">${hesc(g.hint||'')}</div></div><button class="lifeadd" data-map-add="${kind}:${g.id}">+ item</button></div><div class="lifeitems">${
      (g.items&&g.items.length)?g.items.map(it=>`<div class="lifeitem ${it.checked?'done':''}"><button class="lifecheck" data-map-check="${kind}:${g.id}:${it.id}">✓</button><div class="lifebody"><div class="n">${hesc(it.name)}</div><div class="m">${hesc([it.meta,it.note].filter(Boolean).join(' · '))}</div></div><div class="lifeacts"><button class="cartadd" title="carrinho" data-cart-map="${kind}:${g.id}:${it.id}">🛒</button><button title="editar" data-map-edit="${kind}:${g.id}:${it.id}">✎</button><button title="remover" data-map-del="${kind}:${g.id}:${it.id}">×</button></div></div>`).join(''):`<div class="lifeempty">Nenhum item registrado.</div>`
    }</div></div>`).join('')+`</div></section>`;
}
function renderClosetPanel(H){
  const sel=closetSelected();const groups=H.closet||[];
  let h=`<section class="closetpanel"><div class="closetbar"><div><h4>Meu closet</h4><p>Itens categorizáveis para montar looks, lembrar o que existe e combinar sem depender da memória.</p></div><div class="closetactions"><button data-closet-add-cat="">+ categoria</button><button data-closet-clear="">limpar seleção</button><button class="primary" data-closet-combine="">combinar (${sel.length})</button></div></div>`;
  if(sel.length)h+=`<div class="lookpreview"><span class="lookl">Look montado</span><div class="lookchips">`+sel.map(it=>`<span class="lookchip"><span class="closetswatch" style="${it.color?`background:${hesc(it.color)}`:''}"></span>${hesc(it.name)} <i>${hesc(it.cat)}</i></span>`).join('')+`</div></div>`;
  h+=`<div class="closetgrid">`+groups.map(g=>`<div class="closetcat"><div class="closetcat-head"><div class="lifeico">${g.ic||'👗'}</div><div class="closetcat-title"><div class="nm">${hesc(g.name)}</div><div class="ct">${hesc(g.hint||'')}</div></div><button data-closet-add="${g.id}">+ item</button></div><div class="closetitems">${
    (g.items&&g.items.length)?g.items.map(it=>`<div class="closetitem ${it.selected?'sel':''}"><div class="top"><button class="closetpick" data-closet-select="${g.id}:${it.id}">${it.selected?'✓':'+'}</button><div class="body"><div class="n">${hesc(it.name)}</div><div class="m">${hesc(it.meta||'')}</div></div><div class="closetswatch" style="${it.color?`background:${hesc(it.color)}`:''}"></div></div><div class="acts"><button title="carrinho" data-cart-closet="${g.id}:${it.id}">🛒</button><button title="editar" data-closet-edit="${g.id}:${it.id}">✎</button><button title="remover" data-closet-del="${g.id}:${it.id}">×</button></div></div>`).join(''):`<div class="closetempty">Nenhum item nesta categoria.</div>`
  }</div></div>`).join('')+`</div></section>`;
  return h;
}
function renderPertencesPanel(H){
  const items=H.pertences||[];
  return `<section class="belongpanel"><div class="belongbar"><div><h4>Pertences</h4><p>Registro rápido de compra e paradeiro: onde está, quando entrou na sua vida e o que não pode sumir.</p></div><button data-pert-add="">+ pertence</button></div><div class="belonggrid">`+
    (items.length?items.map(it=>`<div class="belongrow"><div class="stamp">⌁</div><div class="body"><div class="n">${hesc(it.name)}</div><div class="m">${hesc([it.bought?`compra: ${it.bought}`:'',it.place?`paradeiro: ${it.place}`:''].filter(Boolean).join(' · '))}</div></div><div class="acts"><button title="editar" data-pert-edit="${it.id}">✎</button><button title="remover" data-pert-del="${it.id}">×</button></div></div>`).join(''):`<div class="closetempty">Nenhum pertence registrado.</div>`)+
    `</div></section>`;
}
function renderMapaTab(){
  const H=state.habit;
  let h=`<div class="cctitle"><span class="e">mapa de vida</span><span class="t">Mapa</span><span class="ln"></span></div><p class="chelp">O que você veste, carrega e consome — categorizado, combinável e rastreável. Use 🛒 para mandar pro carrinho.</p>`;
  const cart=H.cart||[];
  if(cart.length)h+=`<div class="cartbar"><span class="cartl">🛒 Carrinho · ${cart.length}</span><div class="cartitems">`+cart.map(c=>`<span class="cartchip">${hesc(c.name)}<button data-cart-del="${c.id}">×</button></span>`).join('')+`</div><button class="cartclear" data-cart-clear="">limpar</button></div>`;
  h+=renderClosetPanel(H);
  h+=mapHtml('bag','Itinerário & bagagem','O que levo comigo no dia a dia e nas saídas.',H.bagMap);
  h+=mapHtml('consumo','Consumo & reposição','Suplementos, hábitos de consumo e o que precisa repor.',H.consumoMap);
  h+=renderPertencesPanel(H);
  return h;
}
function renderPlannerTab(id){
  const cfg=PLANNER_TABS[id];if(!cfg)return'';
  const D=(state.planners[id]=state.planners[id]||{});
  let h=`<div class="cctitle"><span class="e">planner</span><span class="t">${cfg.title}</span><span class="ln"></span></div><p class="chelp">${cfg.desc}</p><div class="plnr">`;
  cfg.sections.forEach(s=>{
    if(s.type==='text'){h+=`<div class="plblk${s.wide?' wide':''}"><label class="pll">${s.title}</label><textarea class="plta" data-pln="${id}:${s.key}" placeholder="…">${hesc(D[s.key]||'')}</textarea></div>`;}
    else if(s.type==='choices'){const sel=D[s.key]||[];h+=`<div class="plblk wide"><label class="pll">${s.title}</label><div class="plchips">`+s.options.map(o=>`<button class="plchip${sel.indexOf(o)>=0?' on':''}" data-plc="${id}:${s.key}:${o}">${o}</button>`).join('')+`</div></div>`;}
    else if(s.type==='columns'){h+=`<div class="plcols" style="grid-template-columns:repeat(${s.cols.length},1fr)">`+s.cols.map(c=>{const arr=D[c[0]]||[];let rows='';for(let i=0;i<s.count;i++)rows+=`<input class="plci" data-plcol="${id}:${c[0]}:${i}" value="${hesc(arr[i]||'')}" placeholder="…">`;return `<div class="plcol"><div class="plcolh">${c[1]}</div>${rows}</div>`;}).join('')+`</div>`;}
  });
  return h+`</div>`;
}
function renderEspelho(tab){
  const E=(state.espelho=state.espelho||{});const g=(k,d)=>hesc(E[k]!=null?E[k]:d);
  const ef=(k,d,cls)=>`<span class="esp-ed${cls?' '+cls:''}" contenteditable="true" data-esp="${k}">${g(k,d)}</span>`;
  const eta=(k,d)=>`<textarea class="esp-ta" data-esp="${k}" rows="3" placeholder="…">${g(k,d)}</textarea>`;
  const head=(eb,t)=>`<div class="esp-head"><span class="esp-eb">${eb}</span><h2 class="esp-t">${t}</h2><span class="esp-rune">${'ᚢ ᚱ ᚦ ᚨ ᚱ'}</span></div>`;
  const card=(inner,cls)=>`<div class="esp-card${cls?' '+cls:''}">${inner}</div>`;
  const metric=(b,s)=>`<div class="esp-metric"><b>${b}</b><span>${s}</span></div>`;
  let h=`<div class="espelho">`;
  if(tab==='astral'){
    h+=head('céu natal','Mapa Astral');
    h+=`<div class="esp-grid2">`;
    h+=card(`<h3>Roda natal</h3><div class="esp-wheel"><div class="esp-wheelring"></div><div class="esp-wheelc">céu de<br>nascimento</div></div><p class="esp-cap">Arraste sua imagem do mapa para o espaço acima.</p>`,'esp-wheelcard');
    h+=card(`<h3>Tríade essencial</h3><div class="esp-rows">`+
      `<div class="esp-row"><span class="esp-k">☉ Sol</span><span class="esp-v">${ef('sun','Sagitário · Casa 9')}</span></div>`+
      `<div class="esp-row"><span class="esp-k">↑ Ascendente</span><span class="esp-v">${ef('asc','Áries')}</span></div>`+
      `<div class="esp-row"><span class="esp-k">☾ Lua</span><span class="esp-v">${ef('moon','Escorpião')}</span></div>`+
      `<div class="esp-row"><span class="esp-k">☿ Mercúrio</span><span class="esp-v">${ef('merc','—')}</span></div>`+
      `<div class="esp-row"><span class="esp-k">♀ Vênus</span><span class="esp-v">${ef('venus','—')}</span></div>`+
      `<div class="esp-row"><span class="esp-k">♂ Marte</span><span class="esp-v">${ef('mars','—')}</span></div>`+
      `</div>`);
    h+=`</div>`;
    h+=card(`<h3>Leitura do céu</h3>${eta('astralRead','Fogo dominante: impulso, coragem e fé no sentido. A Casa 9 forma a identidade pelo estudo, filosofia e transmissão de valores.')}`);
  } else if(tab==='numero'){
    h+=head('vibração','Numerologia');
    h+=`<div class="esp-grid3">`+
      card(`<h3>Motivação</h3><div class="esp-num">${ef('mot','2')}</div><p>${ef('motd','Paz, parceria, diplomacia.','esp-sub')}</p>`)+
      card(`<h3>Expressão</h3><div class="esp-num">${ef('exp','6')}</div><p>${ef('expd','Cuidado, estética, serviço.','esp-sub')}</p>`)+
      card(`<h3>Destino</h3><div class="esp-num">${ef('des','—')}</div><p>${ef('desd','Caminho de vida.','esp-sub')}</p>`)+
      `</div>`;
    h+=card(`<h3>Síntese numerológica</h3>${eta('numRead','A motivação 2 suaviza conflitos; a expressão 6 constrói harmonia concreta. Juntas pedem equilíbrio entre acolher e se posicionar.')}`);
  } else if(tab==='prof'){
    h+=head('vocação','Mapa Profissional');
    h+=`<div class="esp-grid2">`+
      card(`<h3>Eixo de atuação</h3><div class="esp-rows">`+
        `<div class="esp-row"><span class="esp-k">Casa 2</span><span class="esp-v">${ef('c2','Valor, triagem, recursos')}</span></div>`+
        `<div class="esp-row"><span class="esp-k">Casa 7</span><span class="esp-v">${ef('c7','Orientação relacional')}</span></div>`+
        `<div class="esp-row"><span class="esp-k">Casa 9</span><span class="esp-v">${ef('c9','Ensino, sentido, direção')}</span></div></div>`)+
      card(`<h3>Direções possíveis</h3><div class="esp-pills">`+['Triagem & guia','Orientação','Ensino','Curadoria','Estratégia'].map((p,i)=>`<span class="esp-pill" contenteditable="true" data-esp="dir${i}">${g('dir'+i,p)}</span>`).join('')+`</div>`)+
      `</div>`;
    h+=card(`<h3>Plano de vocação</h3>${eta('profRead','Explorar sem se dispersar; orientar sem virar dono da verdade; cuidar sem se apagar.')}`);
  } else if(tab==='sintese'){
    h+=head('operacional','Síntese');
    h+=card(`<div class="esp-quote">${ef('synth','Explorar sem se dispersar; orientar sem virar dono da verdade; cuidar sem se apagar.','esp-q')}</div>`,'esp-quotecard');
    h+=`<div class="esp-grid2">`+
      card(`<h3>Princípios diários</h3><ul class="esp-ul">`+[0,1,2].map(i=>`<li contenteditable="true" data-esp="prin${i}">${g('prin'+i,['Decidir o próximo passo, não a vida toda.','Buffer antes de blocos pesados.','Descanso é bloco positivo, não vazio.'][i])}</li>`).join('')+`</ul>`)+
      card(`<h3>Tensão a vigiar</h3><div class="esp-tension"><span>${ef('tA','velocidade')}</span><span class="esp-x">×</span><span>${ef('tB','cautela')}</span></div>${eta('tNote','Quando acelerar demais, voltar ao corpo e ao próximo passo concreto.')}`)+
      `</div>`;
  } else {
    h+=head('primeira página','Resumo da Identidade');
    h+=`<div class="esp-grid2">`;
    h+=card(`<h3>Identidade-base</h3><div class="esp-lead">${ef('lead','O Astronauta que precisa aterrissar — Fogo, busca de sentido e ação direta.','esp-lead-ed')}</div><div class="esp-metrics">`+
      metric('Sagitário + Áries','Impulso, coragem, abrir caminhos.')+
      metric('Casa 9','Estudo, filosofia, transmissão.')+
      metric('Lua em Escorpião','Intensidade e leitura profunda.')+
      metric('Motivação 2','Paz, parceria, diplomacia.')+
      metric('Expressão 6','Cuidado, estética, serviço.')+
      metric('Casa 2 + 7','Valor, triagem, relação.')+
      `</div>`);
    h+=card(`<h3>Selo</h3><div class="esp-seal">${state.espelho.glyph||'ᚱ'}</div><div class="esp-pills">`+['Arquétipo: Astronauta','Função: Agente de orientação','Vocação: triagem + guia','Tensão: velocidade × cautela'].map((p,i)=>`<span class="esp-pill" contenteditable="true" data-esp="rp${i}">${g('rp'+i,p)}</span>`).join('')+`</div>`,'esp-sealcard');
    h+=`</div>`;
    h+=card(`<div class="esp-quote">${ef('quote','Explorar sem se dispersar; orientar sem virar dono da verdade; cuidar sem se apagar.','esp-q')}</div>`,'esp-quotecard');
  }
  h+=`</div>`;return h;
}
function renderSeed(){
  const w=SEED_WORLDS[seedWorld];if(!w)return;
  if(seedWorld==='asgard'){if(activeSeedTab==='decision'){document.getElementById('seedApp').innerHTML=renderPlannerTab('decision');}else{renderAsgard();}return;}
  if(seedWorld==='saude'){renderSaude();return;}
  if(seedWorld==='tarefas'){document.getElementById('seedApp').innerHTML=renderPlannerTab(activeSeedTab==='ikigai'?'ikigai':'therapy');return;}
  if(seedWorld==='alimentacao'){document.getElementById('seedApp').innerHTML=renderPlannerTab('culture');return;}
  if(seedWorld==='espelho'){document.getElementById('seedApp').innerHTML=renderEspelho(activeSeedTab);return;}
  if(seedWorld==='cosmo'){const cosmoSrc=(window.__resources&&window.__resources.cosmoApp)?window.__resources.cosmoApp:'cosmo-aprovacao-federal/app/Aprovacao Federal.html';document.getElementById('seedApp').innerHTML=`<div class="cosmo-launch"><div class="cl-card"><div class="cl-glyph">✦</div><div class="cl-eb">painel de estudos</div><h2 class="cl-t">Aprovação Federal</h2><p class="cl-p">Edital verticalizado, banco de questões, ciclo de horas e revisão espaçada — com sincronização opcional para planilha Google.</p><a class="cl-btn" href="${cosmoSrc}" target="_blank" rel="noopener">Abrir painel ↗</a></div><iframe class="cl-frame" src="${cosmoSrc}" title="Aprovação Federal"></iframe></div>`;return;}
  const t=(w.tabs.find(x=>x[0]===activeSeedTab)||w.tabs[0]);
  let h=`<div class="sec"><div class="sec-h"><span class="t">${t[1]}</span><span class="sum" style="font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">${w.realm}</span></div>`;
  w.rows.forEach(r=>{h+=`<div class="row"><div class="d">${r[0]}${r[1]?`<small>${r[1]}</small>`:''}</div><div class="rv"><b class="v" style="color:var(--ink-soft)">—</b></div></div>`;});
  h+=`</div><div class="sec" style="text-align:center;border-style:dashed;border-color:${w.ac};background:${w.acs}"><div style="font-size:28px;line-height:1;color:${w.ac}">${w.glyph}</div><div style="font-family:'Fraunces',serif;font-size:19px;font-weight:500;margin-top:8px">Galho a brotar</div><div style="font-size:13px;line-height:1.55;color:var(--ink-soft);max-width:380px;margin:7px auto 0">${w.nome} ainda não floresceu — mas já vive na árvore, com o mesmo padrão de abas, painéis e tabelas do Sistema Financeiro.</div></div>`;
  document.getElementById('seedApp').innerHTML=h;
}
document.addEventListener('click',e=>{
  const yn=e.target.closest('#yggNodes .ynode');if(yn){selectWorld(yn.dataset.world);return;}
  const rd=e.target.closest('#yggRail .yr-disc');if(rd){selectWorld(rd.dataset.world);return;}
  if(e.target.closest('#yggRail .yr-home')||e.target.closest('#yggClose')){goHome();return;}
  const ga=e.target.closest('[data-goal-add]');if(ga){openGoal(null);return;}
  const ge=e.target.closest('[data-goal-edit]');if(ge){openGoal(ge.dataset.goalEdit);return;}
  const sa=e.target.closest('[data-saude-add]');if(sa){openSaudeItem(sa.dataset.saudeAdd,null);return;}
  const se=e.target.closest('[data-saude-edit]');if(se){const[t,i]=se.dataset.saudeEdit.split(':');openSaudeItem(t,i);return;}
});
document.addEventListener('input',e=>{
  const pn=e.target.closest('[data-pln]');if(pn){const[id,k]=pn.dataset.pln.split(':');(state.planners[id]=state.planners[id]||{})[k]=pn.value;save();return;}
  const pc=e.target.closest('[data-plcol]');if(pc){const[id,k,i]=pc.dataset.plcol.split(':');const D=(state.planners[id]=state.planners[id]||{});const arr=(D[k]=D[k]||[]);arr[+i]=pc.value;save();return;}
});
document.addEventListener('click',e=>{
  const pch=e.target.closest('[data-plc]');if(pch){const[id,k,o]=pch.dataset.plc.split(':');const D=(state.planners[id]=state.planners[id]||{});const arr=(D[k]=D[k]||[]);const ix=arr.indexOf(o);if(ix>=0)arr.splice(ix,1);else arr.push(o);save();if(seedWorld)renderSeed();return;}
  const mAdd=e.target.closest('[data-map-add]');if(mAdd){const[kind,gid]=mAdd.dataset.mapAdd.split(':');const{g}=mapFind(kind,gid);if(g){const it=askMapItem();if(it){g.items=g.items||[];g.items.push({id:uid(),...it,checked:false});save();renderHabit();}}return;}
  const mChk=e.target.closest('[data-map-check]');if(mChk){const[kind,gid,iid]=mChk.dataset.mapCheck.split(':');const{it}=mapFind(kind,gid,iid);if(it){it.checked=!it.checked;save();renderHabit();}return;}
  const mEd=e.target.closest('[data-map-edit]');if(mEd){const[kind,gid,iid]=mEd.dataset.mapEdit.split(':');const{it}=mapFind(kind,gid,iid);if(it){const nv=askMapItem(it);if(nv){Object.assign(it,nv);save();renderHabit();}}return;}
  const mDel=e.target.closest('[data-map-del]');if(mDel){const[kind,gid,iid]=mDel.dataset.mapDel.split(':');const{g}=mapFind(kind,gid,iid);if(g){g.items=(g.items||[]).filter(x=>x.id!==iid);save();renderHabit();}return;}
  const cMap=e.target.closest('[data-cart-map]');if(cMap){const[kind,gid,iid]=cMap.dataset.cartMap.split(':');const{it}=mapFind(kind,gid,iid);if(it){state.habit.cart.push({id:uid(),name:it.name});save();renderHabit();}return;}
  const cClo=e.target.closest('[data-cart-closet]');if(cClo){const[gid,iid]=cClo.dataset.cartCloset.split(':');const g=(state.habit.closet||[]).find(x=>x.id===gid);const it=g&&(g.items||[]).find(x=>x.id===iid);if(it){state.habit.cart.push({id:uid(),name:it.name});save();renderHabit();}return;}
  const cDel=e.target.closest('[data-cart-del]');if(cDel){state.habit.cart=(state.habit.cart||[]).filter(x=>x.id!==cDel.dataset.cartDel);save();renderHabit();return;}
  if(e.target.closest('[data-cart-clear]')){state.habit.cart=[];save();renderHabit();return;}
  if(e.target.closest('[data-closet-add-cat]')){const n=prompt('Nome da categoria:');if(n&&n.trim()){const ic=prompt('Ícone (emoji):','👗')||'👗';state.habit.closet.push({id:uid(),name:n.trim(),ic:ic.trim(),hint:'',items:[]});save();renderHabit();}return;}
  const clAdd=e.target.closest('[data-closet-add]');if(clAdd){const g=(state.habit.closet||[]).find(x=>x.id===clAdd.dataset.closetAdd);if(g){const it=askClosetItem();if(it){g.items=g.items||[];g.items.push({id:uid(),...it});save();renderHabit();}}return;}
  const clSel=e.target.closest('[data-closet-select]');if(clSel){const[gid,iid]=clSel.dataset.closetSelect.split(':');const g=(state.habit.closet||[]).find(x=>x.id===gid);const it=g&&(g.items||[]).find(x=>x.id===iid);if(it){it.selected=!it.selected;save();renderHabit();}return;}
  const clEd=e.target.closest('[data-closet-edit]');if(clEd){const[gid,iid]=clEd.dataset.closetEdit.split(':');const g=(state.habit.closet||[]).find(x=>x.id===gid);const it=g&&(g.items||[]).find(x=>x.id===iid);if(it){const nv=askClosetItem(it);if(nv){Object.assign(it,nv);save();renderHabit();}}return;}
  const clDel=e.target.closest('[data-closet-del]');if(clDel){const[gid,iid]=clDel.dataset.closetDel.split(':');const g=(state.habit.closet||[]).find(x=>x.id===gid);if(g){g.items=(g.items||[]).filter(x=>x.id!==iid);save();renderHabit();}return;}
  if(e.target.closest('[data-closet-clear]')){(state.habit.closet||[]).forEach(g=>(g.items||[]).forEach(it=>it.selected=false));save();renderHabit();return;}
  if(e.target.closest('[data-closet-combine]')){renderHabit();return;}
  if(e.target.closest('[data-pert-add]')){const it=askPertence();if(it){state.habit.pertences.push({id:uid(),...it});save();renderHabit();}return;}
  const pEd=e.target.closest('[data-pert-edit]');if(pEd){const it=(state.habit.pertences||[]).find(x=>x.id===pEd.dataset.pertEdit);if(it){const nv=askPertence(it);if(nv){Object.assign(it,nv);save();renderHabit();}}return;}
  const pDel=e.target.closest('[data-pert-del]');if(pDel){state.habit.pertences=(state.habit.pertences||[]).filter(x=>x.id!==pDel.dataset.pertDel);save();renderHabit();return;}
});
document.addEventListener('input',e=>{
  const gv=e.target.closest('[data-asg-vision]');if(gv){state.asgard.vision=gv.value;save();return;}
  const ae=e.target.closest('[data-area-edit]');if(ae){const a=state.asgard.areas.find(x=>x.id===ae.dataset.areaEdit);if(a){a.name=ae.innerText.trim();save();}return;}
  const gp=e.target.closest('#goalProg');if(gp){document.getElementById('goalProgV').textContent=gp.value+'%';}
  const cvn=e.target.closest('[data-cv-notes]');if(cvn){state.culture.notes=cvn.value;save();return;}
  const rw=e.target.closest('[data-rweak]');if(rw){state.habit.rhythm.weak[+rw.dataset.rweak]=rw.value;save();return;}
  const rf=e.target.closest('[data-rfield]');if(rf){state.habit.rhythm[rf.dataset.rfield]=rf.value;save();return;}
  const rt=e.target.closest('[data-rtheme]');if(rt){const[d,k]=rt.dataset.rtheme.split(':');(state.habit.rhythm.themes[d]=state.habit.rhythm.themes[d]||{})[k]=rt.value;save();return;}
});
(function(){const s=document.getElementById('goalSave');if(s)s.onclick=()=>{const A=state.asgard;const title=document.getElementById('goalTitle').value.trim();if(!title){closeModals();return;}const data={area:document.getElementById('goalArea').value,why:document.getElementById('goalWhy').value.trim(),target:document.getElementById('goalTarget').value.trim(),horizon:document.getElementById('goalHorizon').value.trim(),progress:+document.getElementById('goalProg').value,title};
  if(asgGoalId){const g=A.goals.find(x=>x.id===asgGoalId);if(g)Object.assign(g,data);}else{A.goals.push({id:uid(),...data});}save();closeModals();if(seedWorld==='asgard')renderAsgard();};
  const d=document.getElementById('goalDel');if(d)d.onclick=()=>{if(asgGoalId&&confirm('Excluir esta meta?')){state.asgard.goals=state.asgard.goals.filter(x=>x.id!==asgGoalId);save();closeModals();if(seedWorld==='asgard')renderAsgard();}};})();
(function(){const s=document.getElementById('saudeSave');if(s)s.onclick=()=>{const obj={};document.querySelectorAll('#saudeBody [data-sf]').forEach(el=>obj[el.dataset.sf]=el.value);if(!Object.values(obj).some(v=>(v||'').trim())){closeModals();return;}
  if(saudeId){const it=state.saude[saudeType].find(x=>x.id===saudeId);if(it)Object.assign(it,obj);}else{state.saude[saudeType].push({id:uid(),...obj});}save();closeModals();if(seedWorld==='saude')renderSaude();};
  const d=document.getElementById('saudeDel');if(d)d.onclick=()=>{if(saudeId&&confirm('Excluir este registro?')){state.saude[saudeType]=state.saude[saudeType].filter(x=>x.id!==saudeId);save();closeModals();if(seedWorld==='saude')renderSaude();}};})();

/* Boot */
load();paintTabs();renderAll();refreshSyncBadge();selectWorld('habitos');showWorldShell();qnCheckAlarms();updateRavenBadge();

/* ===== Repositório / Biblioteca de mundos (IndexedDB) ===== */
(function(){
  const DB_NAME='axishub_repo',STORE='files';let _db=null;
  function db(){return new Promise((res,rej)=>{if(_db)return res(_db);const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});};
    r.onsuccess=()=>{_db=r.result;res(_db);};r.onerror=()=>rej(r.error);});}
  function tx(m){return db().then(d=>d.transaction(STORE,m).objectStore(STORE));}
  function putFile(rec){return tx('readwrite').then(s=>new Promise((res,rej)=>{const r=s.put(rec);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);}));}
  function allFiles(){return tx('readonly').then(s=>new Promise((res,rej)=>{const r=s.getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);}));}
  function delFile(id){return tx('readwrite').then(s=>new Promise((res,rej)=>{const r=s.delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);}));}

  const RW=(typeof YGG_WORLDS!=='undefined'?YGG_WORLDS:[]).map(w=>({id:w.id,nome:w.nome,glyph:w.glyph,ac:w.ac}));
  RW.push({id:'geral',nome:'Geral',glyph:'❖',ac:'#7a7163'});
  const wmap={};RW.forEach(w=>wmap[w.id]=w);
  const W=id=>wmap[id]||wmap.geral;

  let _files=[],_filter='todos',_q='',_urls=[],_rvId=null,_rvURL=null;
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function fmtSize(b){if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(0)+' KB';return (b/1048576).toFixed(1)+' MB';}
  function fmtDate(ts){try{return new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'});}catch(e){return '';}}
  function extOf(rec){const m=(rec.name||'').match(/\.([a-z0-9]+)$/i);if(m)return m[1];if((rec.type||'').includes('pdf'))return 'pdf';return (rec.type||'?').split('/').pop()||'?';}
  function isImg(rec){return (rec.type||'').startsWith('image/');}
  function isPdf(rec){return (rec.type||'')==='application/pdf'||/\.pdf$/i.test(rec.name||'');}
  function freshURL(b){const u=URL.createObjectURL(b);_urls.push(u);return u;}
  function clearURLs(){_urls.forEach(u=>URL.revokeObjectURL(u));_urls=[];}

  function renderRail(){
    const counts={todos:_files.length};RW.forEach(w=>counts[w.id]=0);
    _files.forEach(f=>{counts[f.world]=(counts[f.world]||0)+1;});
    let h='<div class="rp-railh">Mundos</div>';
    h+=`<div class="rp-chip${_filter==='todos'?' sel':''}" data-w="todos"><span class="rp-disc" style="--cc:var(--brass)">∗</span><span class="nm">Todos</span><span class="ct">${counts.todos}</span></div>`;
    RW.forEach(w=>{h+=`<div class="rp-chip${_filter===w.id?' sel':''}" data-w="${w.id}"><span class="rp-disc" style="--cc:${w.ac}">${w.glyph}</span><span class="nm">${esc(w.nome)}</span><span class="ct">${counts[w.id]||0}</span></div>`;});
    document.getElementById('rpRail').innerHTML=h;
  }
  function renderGrid(){
    clearURLs();
    const g=document.getElementById('rpGrid');
    let list=_files.slice().sort((a,b)=>b.ts-a.ts);
    if(_filter!=='todos')list=list.filter(f=>f.world===_filter);
    if(_q)list=list.filter(f=>(f.name||'').toLowerCase().includes(_q));
    if(!list.length){
      g.innerHTML=`<div class="rp-empty"><div class="g">▤</div>${_q?'Nenhum arquivo encontrado.':'Nenhum arquivo aqui ainda.<br>Importe seus planners deste mundo.'}</div>`;return;
    }
    g.innerHTML=list.map(f=>{
      const w=W(f.world);
      const thumb=isImg(f)
        ? `<img src="${freshURL(f.blob)}" alt="" loading="lazy">`
        : `<span class="ext" style="--cc:${w.ac}">${esc(extOf(f))}</span>`;
      return `<div class="rp-card" data-id="${f.id}"><div class="rp-thumb"><span class="rp-tag" style="--cc:${w.ac}">${w.glyph}</span>${thumb}</div><div class="rp-cap"><div class="fn">${esc(f.name)}</div><div class="fs">${fmtSize(f.size)} · ${fmtDate(f.ts)}</div></div></div>`;
    }).join('');
  }
  async function refreshMeter(){
    const el=document.getElementById('rpMeter');if(!el)return;
    const n=_files.length,bytes=_files.reduce((s,f)=>s+(f.size||0),0);
    let extra='';
    try{if(navigator.storage&&navigator.storage.estimate){const q=await navigator.storage.estimate();if(q.quota)extra=' · '+((q.usage||0)/q.quota*100).toFixed(0)+'% usado';}}catch(e){}
    el.innerHTML=`${n} arquivo${n===1?'':'s'}<br>${fmtSize(bytes)}${extra}`;
  }
  async function loadAndRender(){_files=await allFiles();renderRail();renderGrid();refreshMeter();}

  function importFiles(list){
    if(!list||!list.length)return;
    const world=(_filter&&_filter!=='todos')?_filter:'geral';
    let pending=list.length;
    [...list].forEach(file=>{
      const rec={id:'f_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:file.name,world,type:file.type||'',size:file.size,ts:Date.now(),blob:file};
      putFile(rec).then(()=>{if(--pending===0)loadAndRender();}).catch(()=>{if(--pending===0)loadAndRender();});
    });
  }

  function openRepo(){loadAndRender();document.getElementById('repoOverlay').classList.add('on');}
  function closeRepo(){document.getElementById('repoOverlay').classList.remove('on');clearURLs();}

  function openViewer(id){
    const rec=_files.find(f=>f.id===id);if(!rec)return;_rvId=id;
    if(_rvURL)URL.revokeObjectURL(_rvURL);_rvURL=URL.createObjectURL(rec.blob);
    const stage=document.getElementById('rvStage');
    if(isImg(rec))stage.innerHTML=`<img src="${_rvURL}" alt="">`;
    else if(isPdf(rec))stage.innerHTML=`<iframe src="${_rvURL}" title="${esc(rec.name)}"></iframe>`;
    else stage.innerHTML=`<div class="rv-generic"><div class="g">▤</div>Pré-visualização indisponível<br>para este tipo de arquivo.</div>`;
    document.getElementById('rvMeta').innerHTML=`<span class="rv-name">${esc(rec.name)}</span><span class="rv-sub">${esc(W(rec.world).nome)} · ${fmtSize(rec.size)} · ${fmtDate(rec.ts)}</span>`;
    const opts=RW.map(w=>`<option value="${w.id}"${w.id===rec.world?' selected':''}>${esc(w.nome)}</option>`).join('');
    document.getElementById('rvTools').innerHTML=`<select id="rvMove" title="Mover para outro mundo">${opts}</select><a class="rv-btn" id="rvDl" href="${_rvURL}" download="${esc(rec.name)}">Baixar</a><button class="rv-btn" id="rvRen">Renomear</button><button class="rv-btn danger" id="rvDel">Excluir</button>`;
    document.getElementById('rvMove').onchange=e=>{rec.world=e.target.value;putFile(rec).then(()=>{loadAndRender();document.getElementById('rvMeta').querySelector('.rv-sub').textContent=`${W(rec.world).nome} · ${fmtSize(rec.size)} · ${fmtDate(rec.ts)}`;});};
    document.getElementById('rvRen').onclick=()=>{const nv=prompt('Novo nome do arquivo:',rec.name);if(nv&&nv.trim()){rec.name=nv.trim();putFile(rec).then(()=>{loadAndRender();document.getElementById('rvMeta').querySelector('.rv-name').textContent=rec.name;});}};
    document.getElementById('rvDel').onclick=()=>{if(confirm('Excluir "'+rec.name+'" definitivamente?')){delFile(rec.id).then(()=>{closeViewer();loadAndRender();});}};
    document.getElementById('rpViewer').classList.add('on');
  }
  function closeViewer(){document.getElementById('rpViewer').classList.remove('on');if(_rvURL){URL.revokeObjectURL(_rvURL);_rvURL=null;}_rvId=null;}

  /* wiring */
  const _rb=document.getElementById('repoBtn');if(_rb)_rb.onclick=openRepo;window.openRepo=openRepo;
  document.getElementById('rpImport').onclick=()=>document.getElementById('rpFile').click();
  document.getElementById('rpFile').onchange=e=>{importFiles(e.target.files);e.target.value='';};
  document.getElementById('rpSearch').oninput=e=>{_q=e.target.value.trim().toLowerCase();renderGrid();};
  document.getElementById('rpRail').addEventListener('click',e=>{const c=e.target.closest('.rp-chip');if(!c)return;_filter=c.dataset.w;renderRail();renderGrid();});
  document.getElementById('rpGrid').addEventListener('click',e=>{const c=e.target.closest('.rp-card');if(c)openViewer(c.dataset.id);});
  document.querySelectorAll('[data-repo-close]').forEach(b=>b.addEventListener('click',closeRepo));
  document.querySelectorAll('[data-rv-close]').forEach(b=>b.addEventListener('click',closeViewer));
  const drop=document.getElementById('rpDrop'),shell=document.querySelector('.rp-shell');
  ['dragenter','dragover'].forEach(ev=>shell.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('hot');}));
  ['dragleave','drop'].forEach(ev=>shell.addEventListener(ev,e=>{e.preventDefault();if(ev==='drop'){importFiles(e.dataTransfer.files);}drop.classList.remove('hot');}));
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(document.getElementById('rpViewer').classList.contains('on'))closeViewer();else if(document.getElementById('repoOverlay').classList.contains('on'))closeRepo();});
})();

;

(function(){
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 function clickTab(id){const t=q('.tab[data-tab="'+id+'"]');if(t)t.click();qa('[data-awb-tab]').forEach(b=>b.classList.toggle('on',b.dataset.awbTab===id));}
 function weekLabel(){const d=new Date(), day=(d.getDay()+6)%7, a=new Date(d);a.setDate(d.getDate()-day);const z=new Date(a);z.setDate(a.getDate()+6);const f=x=>x.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');q('#awbWeekTitle').textContent='Semana '+getWeek(d);q('#awbWeekRange').textContent=f(a)+' — '+f(z);}
 function getWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7)}
 qa('[data-awb-tab]').forEach(b=>b.onclick=()=>clickTab(b.dataset.awbTab));
 const weekDlg=q('#awbWeekDialog'),weekBody=q('#awbWeekDialogBody');
 function refreshAwbTrackers(){try{const k=(typeof pdStr==='function'?pdStr():new Date().toISOString().slice(0,10));const H=state?.habit||{};const sh=H.sleep?.[k]??H.sleepLog?.[k]?.total??H.sleepLog?.[k]?.hours??'';q('#awbSleepVal').textContent=sh?(sh+'h'):'—';const cups=H.hydration?.[k]??0;const goal=H.hydrationGoal||8;q('#awbWaterVal').textContent=cups+'/'+goal;const meds=(H.medications||[]);const done=(H.medsLog?.[k]||[]).length;const expected=meds.reduce((s,m)=>s+Math.max(1,(m.times||[]).length),0);q('#awbMedsVal').textContent=expected?(done+'/'+expected):'0/0';const expense=window.getDailyExpenseTotal?window.getDailyExpenseTotal(k):(H.dailyExpense?.[k]??H.expenses?.[k]??0);q('#awbExpenseVal').textContent='R$ '+Number(expense||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});}catch(e){}}
 function openWeekPanel(){activeHabitTab='habit';clickTab('habit');weekBody.innerHTML=(typeof renderPlanejador==='function'?renderPlanejador():'<p>Painel semanal indisponível.</p>');weekDlg.classList.add('open');weekDlg.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';refreshAwbTrackers();}
 function syncWeekPanel(){if(weekDlg.classList.contains('open')){weekBody.innerHTML=(typeof renderPlanejador==='function'?renderPlanejador():'<p>Painel semanal indisponível.</p>');refreshAwbTrackers();}}
 function closeWeekPanel(){weekDlg.classList.remove('open');weekDlg.setAttribute('aria-hidden','true');document.body.style.overflow='';}
 q('#awbWeekClose').onclick=closeWeekPanel;document.addEventListener('click',e=>{if(e.target.closest('#awbWeekPanelInline'))openWeekPanel();});weekDlg.onclick=e=>{if(e.target===weekDlg)closeWeekPanel()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&weekDlg.classList.contains('open'))closeWeekPanel()});
 refreshAwbTrackers();
 q('#awbHome').onclick=()=>{if(typeof goHome==='function')goHome();else if(q('#modeBtnTop'))q('#modeBtnTop').click()};
 q('#awbToday').onclick=()=>{const now=new Date(), key=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');if(typeof mes!=='undefined'){try{mes=key;annual=false;if(typeof render==='function')render();if(typeof applyView==='function')applyView()}catch(e){}}clickTab('habit')};
 document.addEventListener('click',e=>{if(!e.target.closest('#awbAddInline'))return;openWeekPanel();setTimeout(()=>{const candidates=['#wtNew','#blockNew','#newBlock','#addBlock','.addmini'];for(const s of candidates){const el=q(s);if(el){el.click();break}}},120)});
 qa('[data-awb-action="projects"]').forEach(b=>b.onclick=()=>{const p=q('#projFab');if(p)p.click();else if(typeof openProjects==='function')openProjects()});
 document.addEventListener('click',e=>{const t=e.target.closest?.('.tab[data-tab]');if(t)qa('[data-awb-tab]').forEach(b=>b.classList.toggle('on',b.dataset.awbTab===t.dataset.tab))});
 window.__syncWeekPanel=syncWeekPanel;
 weekLabel();
})();

;

(function(){const q=s=>document.querySelector(s),pop=q('#awbQuickPop');function key(){return typeof pdStr==='function'?pdStr():new Date().toISOString().slice(0,10)}function refresh(){const H=state.habit,k=key(),sh=H.sleep?.[k]||0,c=H.hydration?.[k]||0,g=H.hydrationGoal||8,m=H.medications||[],d=(H.medsLog?.[k]||[]).length,exp=m.reduce((s,x)=>s+Math.max(1,(x.times||[]).length),0);q('#awbSleepVal').textContent=sh?sh+'h':'—';q('#awbWaterVal').textContent=c+'/'+g;q('#awbMedsVal').textContent=d+'/'+exp;const ex=window.getDailyExpenseTotal?window.getDailyExpenseTotal(k):(H.dailyExpense?.[k]||0);q('#awbExpenseVal').textContent='R$ '+Number(ex).toLocaleString('pt-BR')}function saveAll(){save();refresh();window.__syncWeekPanel?.();if(typeof activeHabitTab!=='undefined'&&activeHabitTab==='sono'&&typeof renderHabit==='function')renderHabit()}function pos(b){const r=b.getBoundingClientRect();pop.style.top=r.bottom+8+'px';pop.style.left=Math.max(8,Math.min(innerWidth-294,r.left))+'px';pop.classList.add('open')}function close(){pop.classList.remove('open')}document.addEventListener('click',e=>{const t=e.target.closest('.awb-tracker');if(t){const H=state.habit,k=key();if(t.id==='awbExpense'){const total=window.getDailyExpenseTotal?window.getDailyExpenseTotal(k):(H.dailyExpense?.[k]||0),items=window.getDailyExpenseEntries?window.getDailyExpenseEntries(k):[];pop.innerHTML='<div class="aqp-head"><div><b>Lançar gasto de hoje</b><small>Total do dia · R$ '+Number(total).toLocaleString('pt-BR',{minimumFractionDigits:2})+'</small></div><button data-aqp-close>×</button></div><div class="aqp-expense-form"><input id="aqpExpenseDesc" placeholder="Descrição do gasto"><div class="aqp-grid"><input id="aqpExpenseInput" type="number" min="0" step="0.01" placeholder="0,00"><select id="aqpExpenseCat"><option>Alimentação</option><option>Transporte</option><option>Casa</option><option>Saúde</option><option>Lazer</option><option>Compras</option><option>Assinaturas</option><option>Outros</option></select></div><div class="aqp-grid"><select id="aqpExpenseMethod"><option>Pix</option><option>Débito</option><option>Crédito</option><option>Dinheiro</option><option>Transferência</option><option>Outro</option></select><button id="aqpExpenseSave">＋ lançar</button></div></div><div class="aqp-day-list">'+(items.length?items.map(x=>'<div><span><b>'+((x.descricao||'Gasto'))+'</b><small>'+((x.sub||x.grupo||'Outros'))+' · '+(x.meio||'—')+'</small></span><strong>R$ '+Number(x.efet??x.valor??0).toLocaleString('pt-BR',{minimumFractionDigits:2})+'</strong><button data-aqp-exp-del="'+x.id+'">×</button></div>').join(''):'<p>Nenhum lançamento hoje.</p>')+'</div>'}else if(t.id==='awbSleep'){pop.innerHTML='<div class="aqp-head"><b>Sono de hoje</b><button data-aqp-close>×</button></div><div class="aqp-row"><input id="aqpSleepInput" type="number" min="0" max="14" step=".5" value="'+(H.sleep?.[k]||'')+'"><button id="aqpSleepSave">Salvar</button></div>'}else if(t.id==='awbWater'){pop.innerHTML='<div class="aqp-head"><b>Hidratação</b><button data-aqp-close>×</button></div><div class="aqp-row"><button data-aqp-water="-1">−</button><input id="aqpWaterInput" type="number" min="0" value="'+(H.hydration?.[k]||0)+'"><button data-aqp-water="1">＋ copo</button></div>'}else{const L=H.medications||[],T=H.medsLog?.[k]||[];pop.innerHTML='<div class="aqp-head"><b>Medicação de hoje</b><button data-aqp-close>×</button></div><div class="aqp-meds">'+(L.map(m=>{const times=(m.times&&m.times.length)?m.times:['sem horário'];return '<div class="aqp-med-group"><b>'+m.name+'</b><small>'+(m.dose||'')+'</small>'+times.map(tm=>{const token=m.id+'@'+tm;return '<label><input type="checkbox" data-aqp-med="'+token+'" '+(T.includes(token)?'checked':'')+'><span>'+tm+'</span><small>'+(m.quantity||1)+' un.</small></label>'}).join('')+'</div>'}).join('')||'<small>Sem medicamentos cadastrados.</small>')+'</div>'}pos(t);e.stopPropagation();return}if(e.target.closest('[data-aqp-close]')){close();return}if(e.target.closest('#aqpExpenseSave')){const v=+(q('#aqpExpenseInput').value||0);if(v>0&&window.addDailyExpenseEntry){window.addDailyExpenseEntry({date:key(),value:v,description:(q('#aqpExpenseDesc').value||'').trim()||'Gasto diário',category:q('#aqpExpenseCat').value||'Outros',method:q('#aqpExpenseMethod').value||null});saveAll();if(typeof renderAll==='function'&&!habitMode)renderAll();close();}return}const delExp=e.target.closest('[data-aqp-exp-del]');if(delExp&&window.deleteDailyExpenseEntry){window.deleteDailyExpenseEntry(delExp.dataset.aqpExpDel);saveAll();close();return}if(e.target.closest('#aqpSleepSave')){state.habit.sleep[key()]=+(q('#aqpSleepInput').value||0);saveAll();renderHabit();close();return}const wd=e.target.closest('[data-aqp-water]');if(wd){const k=key();state.habit.hydration[k]=Math.max(0,(state.habit.hydration[k]||0)+(+wd.dataset.aqpWater));saveAll();q('#aqpWaterInput').value=state.habit.hydration[k];return}if(!e.target.closest('#awbQuickPop'))close()});document.addEventListener('change',e=>{const m=e.target.closest('[data-aqp-med]');if(!m)return;const k=key(),L=(state.habit.medsLog[k]=state.habit.medsLog[k]||[]),i=L.indexOf(m.dataset.aqpMed);if(m.checked&&i<0)L.push(m.dataset.aqpMed);if(!m.checked&&i>=0)L.splice(i,1);saveAll()});setTimeout(refresh,200)})();

;

(function(){
 let editing=null;const q=s=>document.querySelector(s),dlg=q('#healthMedDialog');
 function openMed(id){const H=state.habit,m=id?(H.medications||[]).find(x=>x.id===id):null;editing=id||null;q('#healthMedTitle').textContent=m?'Editar medicação':'Nova medicação';q('#healthMedName').value=m?.name||'';q('#healthMedDose').value=m?.dose||'';q('#healthMedQty').value=m?.quantity||1;q('#healthMedTimes').value=(m?.times||[]).join(', ');dlg.classList.add('open');setTimeout(()=>q('#healthMedName').focus(),40)}
 function closeMed(){dlg.classList.remove('open');editing=null}
 function rerender(){save();renderHabit();if(typeof refreshAwbTrackers==='function')refreshAwbTrackers()}
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-med-add]')){openMed();return}
  const ed=e.target.closest('[data-med-edit]');if(ed){openMed(ed.dataset.medEdit);return}
  const del=e.target.closest('[data-med-del]');if(del){const id=del.dataset.medDel,m=state.habit.medications.find(x=>x.id===id);if(m&&confirm('Excluir '+m.name+'?')){state.habit.medications=state.habit.medications.filter(x=>x.id!==id);Object.keys(state.habit.medsLog||{}).forEach(d=>state.habit.medsLog[d]=(state.habit.medsLog[d]||[]).filter(x=>x!==id&&!String(x).startsWith(id+'@')));rerender()}return}
  if(e.target.closest('[data-health-med-close]')){closeMed();return}
  if(e.target.closest('[data-health-med-save]')){const name=q('#healthMedName').value.trim();if(!name){q('#healthMedName').focus();return}const times=q('#healthMedTimes').value.split(',').map(x=>x.trim()).filter(Boolean).map(x=>/^\d{1,2}:\d{2}$/.test(x)?x.padStart(5,'0'):x);const obj={name,dose:q('#healthMedDose').value.trim(),quantity:Math.max(1,+q('#healthMedQty').value||1),times};if(editing){const m=state.habit.medications.find(x=>x.id===editing);Object.assign(m,obj)}else state.habit.medications.push({id:uid(),...obj});closeMed();rerender();return}
  const ms=e.target.closest('[data-health-month-step]');if(ms){const [y,m]=state.habit.healthMonth.split('-').map(Number),d=new Date(y,m-1+(+ms.dataset.healthMonthStep),1);state.habit.healthMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');rerender();return}
  const day=e.target.closest('[data-health-date]');if(day){const d=day.dataset.healthDate;state.habit.healthMonth=d.slice(0,7);const sl=state.habit.sleep[d]||0,w=state.habit.hydration[d]||0,g=state.habit.dailyExpense?.[d]||0;let ex=0,tk=0;(state.habit.medications||[]).forEach(m=>{ex+=Math.max(1,(m.times||[]).length)*(+(m.quantity||1));tk+=(state.habit.medsLog?.[d]||[]).filter(x=>x===m.id||String(x).startsWith(m.id+'@')).length;});const sr=state.habit.sleepRoutine?.[d]||{},em=({1:'😫 Péssimo',2:'😕 Ruim',3:'😐 Regular',4:'🙂 Bom',5:'😄 Ótimo'}[+sr.satisfaction]||'sem avaliação');alert(new Date(d+'T00:00:00').toLocaleDateString('pt-BR')+'\nSono: '+(sl?sl+'h':'sem registro')+'\nAcordou: '+(sr.wakeTime||'—')+'\nDormir: '+(sr.bedTime||'—')+'\nSatisfação: '+em+'\nHidratação: '+w+' copos\nMedicação: '+tk+'/'+ex+' doses\nGastos: '+(g?'R$ '+Number(g).toLocaleString('pt-BR',{minimumFractionDigits:2}):'sem registro'));return}
 });
 document.addEventListener('change',e=>{
  const mo=e.target.closest('[data-health-month]');if(mo){state.habit.healthMonth=mo.value;rerender();return}
  const dose=e.target.closest('[data-med-dose]');if(dose){const d=pdStr(),L=(state.habit.medsLog[d]=state.habit.medsLog[d]||[]),token=dose.dataset.medDose,i=L.indexOf(token);if(dose.checked&&i<0)L.push(token);if(!dose.checked&&i>=0)L.splice(i,1);rerender();return}
  const goal=e.target.closest('[data-hydro-goal]');if(goal){state.habit.hydrationGoal=Math.max(1,+goal.value||8);rerender();return}
 });
})();

;

(function(){
 const q=s=>document.querySelector(s),pop=q('#awbQuickPop');
 const key=()=>typeof pdStr==='function'?pdStr():new Date().toISOString().slice(0,10);
 const prevKey=k=>{const d=new Date(k+'T12:00:00');d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)};
 const emoji=v=>({1:'😫',2:'😕',3:'😐',4:'🙂',5:'😄'}[+v]||'');
 function ensure(){const H=state.habit;H.sleep=H.sleep||{};H.sleepLog=H.sleepLog||{};H.sleepRoutine=H.sleepRoutine||{};return H}
 function duration(k){const H=ensure(),cur=H.sleepRoutine[k]||{},prev=H.sleepRoutine[prevKey(k)]||{};if(!cur.wakeTime||!prev.bedTime)return 0;const start=new Date(prevKey(k)+'T'+prev.bedTime+':00'),end=new Date(k+'T'+cur.wakeTime+':00');const h=(end-start)/36e5;return h>0&&h<24?Math.round(h*100)/100:0}
 function persist(k){const H=ensure(),r=H.sleepRoutine[k]||{};H.sleepLog[k]=H.sleepLog[k]||{};H.sleepLog[k].wakeTime=r.wakeTime||'';H.sleepLog[k].satisfaction=r.satisfaction||null;H.sleepLog[k].calculatedFromPreviousBedtime=H.sleepRoutine[prevKey(k)]?.bedTime||'';H.sleepLog[k].bedTime=r.bedTime||'';const h=duration(k);if(h)H.sleep[k]=h;else delete H.sleep[k];save();refresh();if(typeof activeHabitTab!=='undefined'&&activeHabitTab==='sono'&&typeof renderHabit==='function')renderHabit()}
 function refresh(){const H=ensure(),k=key(),r=H.sleepRoutine[k]||{},h=duration(k)||H.sleep[k]||0;const el=q('#awbSleepVal');if(el)el.textContent=(h?h.toFixed(1)+'h':'—')+(r.satisfaction?' · '+emoji(r.satisfaction):'')}
 function renderPopup(btn){const H=ensure(),k=key(),r=H.sleepRoutine[k]||{},prev=H.sleepRoutine[prevKey(k)]||{},h=duration(k);pop.classList.add('awb-sleep-popup');pop.innerHTML=`<div class="aqp-head"><b>Sono · hoje</b><button data-aqp-close>×</button></div><div class="aqp-sleep-grid"><label>Hora que acordei<input id="sleepWakeToday" type="time" value="${r.wakeTime||''}"></label><label>Hora que vou dormir<input id="sleepBedToday" type="time" value="${r.bedTime||''}"></label></div><div class="aqp-sat"><small>Satisfação com o sono</small><div class="aqp-sat-row">${[1,2,3,4,5].map(v=>`<button type="button" data-popup-sat="${v}" class="${+r.satisfaction===v?'on':''}">${emoji(v)}</button>`).join('')}</div></div><div class="aqp-sleep-result">${prev.bedTime&&r.wakeTime?`Dormiu de ${prev.bedTime} de ontem até ${r.wakeTime}: <b>${h.toFixed(1)}h</b>`:'Registre hoje a hora de acordar e, diariamente, a hora de dormir. O total será calculado na manhã seguinte.'}</div><div class="aqp-sleep-actions"><button id="saveSleepDaily">Salvar no Saúde</button></div>`;const rc=btn.getBoundingClientRect();pop.style.top=(rc.bottom+8)+'px';pop.style.left=Math.max(8,Math.min(innerWidth-350,rc.left))+'px';pop.classList.add('open')}
 document.addEventListener('click',e=>{const b=e.target.closest('#awbSleep');if(b){e.preventDefault();e.stopImmediatePropagation();renderPopup(b);return}},true);
 document.addEventListener('click',e=>{const sat=e.target.closest('[data-popup-sat]');if(sat){pop.querySelectorAll('[data-popup-sat]').forEach(x=>x.classList.remove('on'));sat.classList.add('on');return}if(e.target.closest('#saveSleepDaily')){const H=ensure(),k=key(),r=(H.sleepRoutine[k]=H.sleepRoutine[k]||{});r.wakeTime=q('#sleepWakeToday').value;r.bedTime=q('#sleepBedToday').value;r.satisfaction=+(pop.querySelector('[data-popup-sat].on')?.dataset.popupSat||0)||null;persist(k);pop.classList.remove('open');return}const ss=e.target.closest('[data-sleep-satisfaction]');if(ss){const H=ensure(),k=key(),r=(H.sleepRoutine[k]=H.sleepRoutine[k]||{});r.satisfaction=+ss.dataset.sleepSatisfaction;persist(k);return}},true);
 document.addEventListener('change',e=>{const f=e.target.closest('[data-sleep-routine]');if(!f)return;const H=ensure(),k=key(),r=(H.sleepRoutine[k]=H.sleepRoutine[k]||{});r[f.dataset.sleepRoutine]=f.value;persist(k)},true);
 setTimeout(refresh,250);window.__refreshSleepDaily=refresh;
})();

;

(function(){
  function removeCalendarRail(){
    document.body.classList.remove('mg-open');
    ['mgDock','mgHandle'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
    document.querySelectorAll('.mgdock,.mg-handle,.mg-cal-inline,.side-rail,.world-rail').forEach(function(el){el.remove();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeCalendarRail);else removeCalendarRail();
  new MutationObserver(removeCalendarRail).observe(document.documentElement,{childList:true,subtree:true});
})();

;

(function(){
 const MONTHS=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
 let navYear=(new Date()).getFullYear();
 let initialized=false;
 function monday(date){const d=new Date(date);const day=d.getDay();d.setDate(d.getDate()-(day===0?6:day-1));d.setHours(0,0,0,0);return d}
 function currentBase(){return (typeof weekStart!=='undefined'&&weekStart)?new Date(weekStart):new Date()}
 function setPeriod(date){
   const d=new Date(date);
   if(typeof weekStart!=='undefined')weekStart=monday(d);
   if(typeof mes!=='undefined')mes=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
   if(typeof anoSel!=='undefined')anoSel=d.getFullYear();
   navYear=d.getFullYear();
   if(typeof renderHabit==='function')renderHabit();
   if(typeof updateHeader==='function')updateHeader();
   setTimeout(renderCalendarTabs,10);
 }
 function renderCalendarTabs(){
   const main=document.querySelector('.axhtml.habit main');if(!main)return;
   let box=main.querySelector('.planner-edge-tabs');
   if(!box){box=document.createElement('nav');box.className='planner-edge-tabs';box.setAttribute('aria-label','Selecionar ano e mês');main.prepend(box)}
   const base=currentBase(),activeYear=base.getFullYear(),activeMonth=base.getMonth();
   if(!Number.isFinite(navYear))navYear=activeYear;
   box.innerHTML=`<div class="planner-year-tab"><button type="button" data-planner-year="-1" aria-label="Ano anterior">‹</button><strong>${navYear}</strong><button type="button" data-planner-year="1" aria-label="Próximo ano">›</button><small>ANO</small></div>`+
    MONTHS.map((m,i)=>`<button type="button" class="planner-month-tab ${navYear===activeYear&&i===activeMonth?'active':''}" data-planner-month="${i}" aria-label="Abrir ${m} de ${navYear}">${m}</button>`).join('');
 }
 function initializeToday(){
   if(initialized)return;initialized=true;
   const today=new Date();navYear=today.getFullYear();
   if(typeof weekStart!=='undefined')weekStart=monday(today);
   if(typeof mes!=='undefined')mes=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
   if(typeof anoSel!=='undefined')anoSel=today.getFullYear();
   if(typeof renderHabit==='function')renderHabit();
   if(typeof updateHeader==='function')updateHeader();
   setTimeout(renderCalendarTabs,20);
 }
 document.addEventListener('click',e=>{
   const y=e.target.closest('[data-planner-year]');
   if(y){navYear+=Number(y.dataset.plannerYear);renderCalendarTabs();return}
   const m=e.target.closest('[data-planner-month]');
   if(m){const month=Number(m.dataset.plannerMonth);setPeriod(new Date(navYear,month,1));return}
   const w=e.target.closest('[data-wkp]');
   if(w)setTimeout(()=>{navYear=currentBase().getFullYear();renderCalendarTabs()},40);
 },true);
 new MutationObserver(()=>{if(document.documentElement.classList.contains('habit'))renderCalendarTabs()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeToday);else initializeToday();
 setTimeout(initializeToday,100);
})();

;

(function(){
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const DAYS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
 const MON=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
 function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7)}
 function day2(n){return String(n).padStart(2,'0')}
 function updateHeaderDate(){
   const d=new Date(), dow=(d.getDay()+6)%7, a=new Date(d), z=new Date(d);
   a.setDate(d.getDate()-dow);z.setDate(a.getDate()+6);
   const title=q('#awbWeekTitle'),range=q('#awbWeekRange');
   if(title)title.textContent=DAYS[d.getDay()]+', '+day2(d.getDate())+' '+MON[d.getMonth()];
   if(range)range.textContent='semana '+isoWeek(d)+' · '+day2(a.getDate())+' '+MON[a.getMonth()]+' — '+day2(z.getDate())+' '+MON[z.getMonth()];
 }
 function clearPanelState(){qa('.awb-nav button').forEach(b=>b.classList.remove('panel-on'))}
 function openContextPanel(kind,button){
   clearPanelState();button?.classList.add('panel-on');
   try{
     if(kind==='mapa'){
       document.body.classList.add('dock-open');
       const eb=q('#dockEb'),tt=q('#dockTitle'),bd=q('#dockBody');
       if(eb)eb.textContent='visão integrada';if(tt)tt.textContent='Mapa';
       if(bd)bd.innerHTML=typeof renderMapaTab==='function'?renderMapaTab():'<p>Mapa indisponível.</p>';
     }else if(kind==='saude'){
       document.body.classList.add('dock-open');
       const eb=q('#dockEb'),tt=q('#dockTitle'),bd=q('#dockBody');
       if(eb)eb.textContent='saúde & recuperação';if(tt)tt.textContent='Saúde';
       if(bd){
         bd.innerHTML=typeof renderSonoSheet==='function'
           ? renderSonoSheet()
           : '<div class="panel-error"><b>Saúde indisponível</b><span>O módulo não foi carregado.</span></div>';
         if(typeof refreshAwbTrackers==='function')refreshAwbTrackers();
       }
     }else if(kind==='projetos'){
       if(typeof openGT==='function')openGT('projetos');
       else document.body.classList.add('dock-open');
     }
   }catch(err){console.error(err)}
 }
 function bind(){
   const map=q('[data-awb-tab="mapa"]'),health=q('[data-awb-tab="sono"]'),projects=q('[data-awb-action="projects"]'),week=q('[data-awb-tab="habit"]');
   if(map)map.onclick=e=>{e.preventDefault();openContextPanel('mapa',map)};
   if(health)health.onclick=e=>{e.preventDefault();openContextPanel('saude',health)};
   if(projects)projects.onclick=e=>{e.preventDefault();openContextPanel('projetos',projects)};
   if(week){const old=week.onclick;week.onclick=e=>{clearPanelState();document.body.classList.remove('dock-open');if(typeof closeGT==='function')closeGT();if(old)old.call(week,e)}}
   const close=q('#dockClose');if(close)close.addEventListener('click',clearPanelState);
 }
 updateHeaderDate();bind();setInterval(updateHeaderDate,60000);
})();

;

(function(){
  const root=document.documentElement;
  const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const monthOf=d=>String(d||todayKey()).slice(0,7);
  const amount=e=>Number(e.efet!=null?e.efet:(e.valor!=null?e.valor:e.prev))||0;
  const isDaily=e=>!!(e&&(e.source==='weekhub-header'||e.dailyHeader||e.diaGasto));
  window.getDailyExpenseEntries=function(date){return (state.entries||[]).filter(e=>isDaily(e)&&(e.diaGasto||e.dReal||e.dPrev)===date).sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));};
  window.getDailyExpenseTotal=function(date){return window.getDailyExpenseEntries(date).reduce((sum,e)=>sum+amount(e),0);};
  window.syncDailyExpenseCache=function(date){state.habit=state.habit||{};state.habit.dailyExpense=state.habit.dailyExpense||{};state.habit.dailyExpense[date]=window.getDailyExpenseTotal(date);};
  window.addDailyExpenseEntry=function(o){
    const date=o.date||todayKey(), value=Number(o.value)||0;if(value<=0)return null;
    const entry={id:(typeof uid==='function'?uid():'dh_'+Date.now()),tipo:'variavel',mes:monthOf(date),valor:value,prev:value,efet:value,descricao:o.description||'Gasto diário',meio:o.method||null,dPrev:date,dReal:date,recorrente:false,grupo:'Gastos diários',sub:o.category||'Outros',diaGasto:date,source:'weekhub-header',dailyHeader:true,createdAt:new Date().toISOString()};
    state.entries.push(entry);window.syncDailyExpenseCache(date);if(typeof save==='function')save();return entry;
  };
  window.deleteDailyExpenseEntry=function(id){const e=(state.entries||[]).find(x=>x.id===id),date=e&&(e.diaGasto||e.dReal||e.dPrev);state.entries=(state.entries||[]).filter(x=>x.id!==id);if(date)window.syncDailyExpenseCache(date);if(typeof save==='function')save();};
  // Migrate the old one-value-per-day tracker to proper finance launches once.
  state.habit=state.habit||{};state.habit.dailyExpense=state.habit.dailyExpense||{};
  Object.entries(state.habit.dailyExpense).forEach(([date,val])=>{if(Number(val)>0&&!window.getDailyExpenseEntries(date).length){window.addDailyExpenseEntry({date,value:Number(val),description:'Gasto diário importado',category:'Outros',method:null});}});

  function markNav(which){document.querySelectorAll('.awb-nav button').forEach(b=>b.classList.toggle('on',which==='finance'?b.dataset.awbAction==='finance':b.dataset.awbTab===which));}
  window.openFinanceHub=function(){
    if(typeof closeToolPanel==='function')try{closeToolPanel()}catch(e){}
    seedWorld=null;habitMode=false;annual=false;activeFinanceTab=activeFinanceTab||'mes';mes=monthOf(todayKey());anoSel=Number(mes.slice(0,4));root.classList.add('financehub-page');
    if(typeof applyMode==='function')applyMode();if(typeof renderAll==='function')renderAll();markNav('finance');AXD.scrollTo({top:0,behavior:'smooth'});
  };
  window.openWeekHubPage=function(tab){
    seedWorld=null;habitMode=true;annual=false;root.classList.remove('financehub-page');activeHabitTab=tab||'habit';
    if(typeof applyMode==='function')applyMode();markNav(activeHabitTab);AXD.scrollTo({top:0,behavior:'smooth'});
  };
  document.addEventListener('click',function(e){
    const f=e.target.closest('[data-awb-action="finance"]');if(f){e.preventDefault();e.stopImmediatePropagation();window.openFinanceHub();return;}
    const w=e.target.closest('[data-awb-tab="habit"]');if(w&&!habitMode){e.preventDefault();e.stopImmediatePropagation();window.openWeekHubPage('habit');return;}
  },true);
  // Keep FinanceHub page active state coherent when native tabs change.
  document.addEventListener('click',e=>{const t=e.target.closest('#mainTabs .tab');if(t&&!habitMode)markNav('finance')});
  // Add source tags to daily launches after every render.
  const decorate=()=>document.querySelectorAll('[data-del]').forEach(btn=>{const e=(state.entries||[]).find(x=>x.id===btn.dataset.del);if(e&&isDaily(e)){const row=btn.closest('tr');const first=row&&row.querySelector('td');if(first&&!first.querySelector('.finance-source-tag'))first.insertAdjacentHTML('beforeend',' <span class="finance-source-tag">header · '+(e.diaGasto||'')+'</span>');}});
  const mo=new MutationObserver(()=>requestAnimationFrame(decorate));mo.observe(document.body,{subtree:true,childList:true});decorate();
  if(typeof refreshAwbTrackers==='function')refreshAwbTrackers();
})();

;
/* aberto pela aba Tesouro: vai direto ao FinanceHub */
/* backup: exportar e importar o registro inteiro (chave sfp_bruno_v4) */
(function(){var K='sfp_bruno_v4';function poe(){var nav=document.querySelector('.awb-nav');if(!nav||document.getElementById('fin-bk'))return;
 var w=document.createElement('span');w.id='fin-bk';w.style.cssText='display:inline-flex;gap:6px;margin-left:8px';
 w.innerHTML='<button type="button" id="fin-exp" title="Baixar um arquivo com todos os dados das finanças">\u2913 Exportar</button><button type="button" id="fin-imp" title="Carregar um arquivo de backup">\u2912 Importar</button><input id="fin-arq" type="file" accept="application/json,.json" hidden>';
 nav.appendChild(w);
 document.getElementById('fin-exp').onclick=function(){var v=localStorage.getItem(K)||'{}';var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([v],{type:'application/json'}));a.download='financas-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();};
 var arq=document.getElementById('fin-arq');document.getElementById('fin-imp').onclick=function(){arq.click();};
 arq.onchange=function(){var f=arq.files&&arq.files[0];if(!f)return;f.text().then(function(t){var o;try{o=JSON.parse(t);}catch(e){alert('Arquivo inválido: não é um backup das finanças.');return;}
  if(!o||typeof o!=='object'||!Array.isArray(o.entries)){alert('Arquivo inválido: falta a lista de lançamentos.');return;}
  if(!confirm('Substituir os dados das finanças deste aparelho pelo backup?'))return;localStorage.setItem(K,JSON.stringify(o));location.reload();});};}
 if(document.readyState!=='loading')poe();else document.addEventListener('DOMContentLoaded',poe);})();
;try{var __s0=save;save=function(){var r=__s0.apply(this,arguments);try{axSalvou();}catch(e){}return r;};}catch(e){}
AX.selectWorld=function(id){selectWorld(id);};AX.gt=function(k){openGT(k);};AX.selo=function(){try{updateRavenBadge();}catch(e){}};AX.st=function(){return state;};AX.save=function(){save();};AX.uid=function(){return uid();};
AX.recarrega=function(){try{load();renderAll();if(typeof refreshAwbTrackers==="function")refreshAwbTrackers();if(typeof updateRavenBadge==="function")updateRavenBadge();}catch(e){console.error(e);}};
}/* ===== Peças nativas: Enfermaria com medidores, Captura melhorada, Bunker 9 com o Corvo ===== */
