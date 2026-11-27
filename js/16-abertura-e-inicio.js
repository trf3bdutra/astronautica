/* Vértice v4 (abertura, faixa de hoje, vitórias) e inicialização */
"use strict";
/* ===== Vértice v4 · abertura, faixa de hoje, vitórias e calibração do tempo =====
   Lê e grava na mesma base (S). Nada antigo é apagado. */
var V4_ROT=["","colapso","baixo","neutro","bom","pico"];
var V4_TETO=[0,0.25,0.5,0.75,1,1];
var V4_FAIXA={"06":["fundo","rota"],"09":["fundo","rota"],"12":["varredura","lâminas"],"15":["varredura","lâminas"],"18":["reentrada","aterrar e fechar"],"21":["reentrada","aterrar e fechar"]};
var v4Lam=0;
function v4Leitura(){ return (S.estado&&S.estado[hoje()])|0; }
function v4Teto(){ var k=v4Leitura(); return k?Math.round(vxData().capacity*V4_TETO[k]):vxData().capacity; }
function v4Real(id){ return Math.round(vxData().sessions.filter(function(s){return s.task===id;}).reduce(function(a,s){return a+(s.minutes||0);},0)); }
function v4Lamina(){
 var L=todas().filter(function(f){return f.e==="baixa"&&!S.fichas[f.id];});
 if(!L.length) L=todas().filter(function(f){return !S.fichas[f.id];});
 if(!L.length) return null;
 return L[v4Lam%L.length];
}
function v4CheckHTML(){
 var k=v4Leitura(), h='<div class="vx-card v4-chk'+(k?'':' v4-aberta')+'" id="v4-chk">';
 if(!k){
  h+='<span class="vx-k">Leitura de abertura</span><h3>Como chega a corrente hoje?</h3>'+
     '<p class="vx-muted">Um toque. A leitura decide o teto de foco e o ramo que a tela propõe.</p><div class="v4-es">';
  for(var i=1;i<=5;i++) h+='<button data-v4es="'+i+'"><b>'+i+'</b>'+V4_ROT[i]+'</button>';
  return h+'</div></div>';
 }
 h+='<div class="vx-top"><span class="vx-k">Leitura de abertura · '+k+'/5 · '+V4_ROT[k]+'</span><button data-v4es="0" class="v4-mini">refazer leitura</button></div>';
 h+='<p class="v4-teto">Teto de foco hoje: <b>'+v4Teto()+' min</b><span class="vx-muted"> · '+vxMinutes().toFixed(0)+' já usados</span></p>';
 if(k<=2){
  var f=v4Lamina();
  h+='<p><b>Dia de lâmina.</b> A rota pode esperar. O ramo de hoje é uma ficha de baixa energia, com o pensamento já feito:</p>';
  if(f){
   h+='<div class="v4-lam"><div class="vx-row"><span class="vx-tag">'+f.t+' min</span><b>'+f.h+'</b></div><ol>';
   for(var j=0;j<f.s.length;j++) h+='<li>'+f.s[j]+'</li>';
   h+='</ol><div class="vx-row"><button class="vx-primary" data-v4liq="'+f.id+'">Liquidar lâmina</button><button data-v4troca>outra lâmina</button></div></div>';
  } else h+='<p class="vx-muted">Baralho todo liquidado. Aterramento conta como avanço hoje.</p>';
 } else if(k===5){
  h+='<p><b>Pico.</b> A combustão não avisa. Decida agora onde para: o teto acima é o limite externo deste ciclo.</p>';
 } else {
  h+='<p><b>Dia de rota.</b> Siga o alvo abaixo, um bloco por vez.'+'</p>';
 }
 return h+'</div>';
}
function v4FaixaHTML(){
 var d=new Date(), hr=d.getHours(), H=["06","09","12","15","18","21"], at=null, i;
 for(i=0;i<H.length;i++){ var a=+H[i]; if(hr>=a&&hr<a+3) at=H[i]; }
 var h='<div class="vx-card v4-hoje"><div class="vx-top"><span class="vx-k">Faixa de hoje</span><button data-v4sem class="v4-mini">editar na Semana</button></div><div class="v4-slots">';
 for(i=0;i<H.length;i++){
  var t=(S.tb||{})[hoje()+"|"+H[i]]||"", F=V4_FAIXA[H[i]], cls="v4-s fx-"+H[i]+(H[i]===at?" agora":"")+((at&&H[i]<at)?" foi":"");
  h+='<div class="'+cls+'"><span class="v4-h">'+H[i]+'h</span><span class="v4-t">'+(t?esc(t):'<i>'+F[1]+'</i>')+'</span>'+(H[i]===at?'<span class="v4-ag">agora</span>':'')+'</div>';
 }
 h+='</div>';
 if(at){ var fim=new Date(d); fim.setHours(+at+3,0,0,0); var m=Math.max(0,Math.round((fim-d)/60000)), pct=Math.round((180-m)/180*100);
  h+='<div class="v4-bar"><i style="width:'+pct+'%"></i></div><p class="vx-muted">Faixa de '+V4_FAIXA[at][0]+' · restam <b>'+Math.floor(m/60)+'h'+String(m%60).padStart(2,"0")+'</b> até as '+String((+at+3)%24).padStart(2,"0")+'h.</p>'; }
 else h+='<p class="vx-muted">Fora das faixas. O ciclo está em repouso.</p>';
 return h+'</div>';
}
function v4VitHTML(){
 var v=vxData(), d=hoje(), L=[], i;
 v.sessions.forEach(function(s){ if(s.day===d&&s.result) L.push('Bloco de '+Math.round(s.minutes)+' min: '+esc(s.result)); });
 v.tasks.forEach(function(t){ if(t.completed===d) L.push('Entrega concluída: '+esc(t.title)); });
 (S.hab||[]).forEach(function(x){ if((x.hist||[]).indexOf(d)>=0) L.push('Hábito: '+esc(x.nome)); });
 todas().forEach(function(f){ if(S.fichas[f.id]===d) L.push('Lâmina: '+f.h); });
 var h='<div class="vx-card v4-vit"><h3>Pequenas vitórias de hoje</h3>';
 if(!L.length) return h+'<p class="vx-muted">Nenhuma ainda. A primeira aparece aqui sozinha, sem você anotar.</p></div>';
 h+='<ul>'; for(i=0;i<Math.min(L.length,12);i++) h+='<li>'+L[i]+'</li>';
 return h+'</ul>'+(L.length>12?'<p class="vx-muted">e mais '+(L.length-12)+'.</p>':'')+'</div>';
}
function v4Calib(){
 var est=0,real=0,n=0; vxData().tasks.forEach(function(t){ var e=+t.est||0; if(t.status==='done'&&e>0){ est+=e; real+=v4Real(t.id); n++; } });
 return n?{f:real/est,n:n}:null;
}var v4BaseEdit;
aoIniciar(function(){
v4BaseEdit=vxEdit;
vxEdit=function(t){
 var h=v4BaseEdit(t), c=v4Calib();
 var campo='<label>Estimativa total / minutos<input id="vx-est" type="number" min="0" max="2000" value="'+((t&&t.est)||'')+'"></label>'+
  (c?'<p class="vx-muted vx-wide">Sua calibração: as entregas levam '+c.f.toFixed(1).replace('.',',')+'× o estimado. Multiplique antes de prometer.</p>':'');
 return h.replace('<details class="vx-wide">',campo+'<details class="vx-wide">');
};
});
var v4BaseRender;
aoIniciar(function(){
v4BaseRender=vxRender;
vxRender=function(){
 v4BaseRender();
 try{ v4Pos(); }catch(e){ console.error('v4:',e); }
};
});

function v4Pos(){
 var v=vxData(), body=el('vx-body'); if(!body) return;
 var met=Array.prototype.filter.call(VX.querySelectorAll('.vx-metrics span'),function(s){return /minutos de foco/.test(s.textContent);});
 if(met[0]&&v4Leitura()) met[0].innerHTML='<b>'+Math.round(vxMinutes())+' / '+v4Teto()+'</b>minutos de foco · teto do dia';
 if(v.view==='op'){
  var col=body.querySelector('.vx-grid > div'), side=body.querySelector('.vx-grid > aside');
  if(col) col.insertAdjacentHTML('afterbegin',v4CheckHTML()+v4FaixaHTML());
  if(side) side.insertAdjacentHTML('afterbegin',v4VitHTML());
  var t=vxTask();
  if(t&&!v.edit){
   var ps=body.querySelectorAll('.vx-main p'), alvo=null;
   for(var i=0;i<ps.length;i++) if(ps[i].textContent.indexOf('Próximo movimento')===0) alvo=ps[i];
   var r=v4Real(t.id), e=+t.est||0;
   var tx=e?('<p class="v4-tempo"><b>Tempo:</b> estimado '+e+' min · real '+r+' min'+(r?' ('+(r/e).toFixed(1).replace('.',',')+'×)':'')+'</p>')
           :(r?'<p class="v4-tempo"><b>Tempo real:</b> '+r+' min · sem estimativa (edite a rota para calibrar)</p>':'');
   if(alvo&&tx) alvo.insertAdjacentHTML('afterend',tx);
  }
  var f=el('vx-form'), inp=el('vx-est');
  if(f&&inp) f.addEventListener('submit',function(){ if(document.body.contains(f)) return; var t2=vxTask(); if(t2){ t2.est=clamp(inp.value,0,2000)||0; vxSave(); vxRender(); } });
 }
 if(v.view==='camp'){
  var hs=body.querySelectorAll('h3');
  for(var j=0;j<hs.length;j++) if(hs[j].textContent.indexOf('Relatórios do ECO')===0){
   var c=v4Calib();
   hs[j].insertAdjacentHTML('afterend','<p class="v4-tempo">'+(c?('<b>Calibração do tempo:</b> nas '+c.n+' entregas com estimativa, o real foi '+c.f.toFixed(1).replace('.',',')+'× o previsto.'):'<b>Calibração do tempo:</b> aparece quando houver entregas concluídas com estimativa.')+'</p>');
  }
 }
 VX.querySelectorAll('[data-v4es]').forEach(function(b){ b.onclick=function(){
  var k=+b.dataset.v4es; S.estado=S.estado||{};
  if(!k){ delete S.estado[hoje()]; pinta(); return; }
  S.estado[hoje()]=k; anota("Leitura de abertura: "+k+"/5 — "+V4_ROT[k]+". Teto de foco: "+v4Teto()+" min.",0,false); pinta(); }; });
 VX.querySelectorAll('[data-v4liq]').forEach(function(b){ b.onclick=function(){ liquida(b.dataset.v4liq); pinta(); }; });
 VX.querySelectorAll('[data-v4troca]').forEach(function(b){ b.onclick=function(){ v4Lam++; vxRender(); }; });
 VX.querySelectorAll('[data-v4sem]').forEach(function(b){ b.onclick=function(){ var g=el('h-sem'); if(g) g.scrollIntoView({block:'start',behavior:'smooth'}); }; });
}
/* hábitos: janela de 7 dias no lugar da sequência */
function jan7(hist){ var n=0,i,set={}; (hist||[]).forEach(function(d){set[d]=1;}); for(i=0;i<7;i++) if(set[diaStr(hojeN()-i)]) n++; return n; }
function semKey(){ var d=new Date(), w=(d.getDay()+6)%7; d.setDate(d.getDate()-w); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function habBonus(x,w){ if(w>=5&&x.semOk!==semKey()){ x.semOk=semKey(); return 10; } return 0; }
/* legenda da grade semanal */
function v4Legenda(){ var g=el('tb-g'); if(!g||el('v4-leg')) return;
 g.insertAdjacentHTML('afterend','<div id="v4-leg" class="v4-leg"><span class="fx-06">06–12 · fundo · rota</span><span class="fx-12">12–18 · varredura · lâminas</span><span class="fx-18">18–00 · reentrada · aterrar e fechar</span></div>'); }
aoIniciar(function(){

(function(){ var p4=pinta; pinta=function(){ p4(); try{ v4Legenda(); }catch(e){} }; })();
setInterval(function(){ try{ if(vxData().view==='op'&&!vxData().edit&&!(document.activeElement&&VX.contains(document.activeElement)&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) vxRender(); }catch(e){} },60000);
(function(){ var st=document.createElement('style'); st.textContent=
 '#vx .v4-aberta{border-color:var(--red)}'+
 '#vx .v4-es{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}'+
 '#vx .v4-es button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase}'+
 '#vx .v4-es b{font-size:20px}'+
 '#vx .v4-mini{font-size:10px;padding:4px 8px}'+
 '#vx .v4-teto b{font-size:18px}'+
 '#vx .v4-lam{border-left:3px solid var(--red);padding:8px 12px;margin-top:8px}'+
 '#vx .v4-lam ol{margin:8px 0 10px 18px;padding:0}'+
 '#vx .v4-slots{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:10px}'+
 '#vx .v4-s{position:relative;padding:8px 6px 10px;border:1px solid var(--line2,#333);border-radius:4px;min-height:64px;display:flex;flex-direction:column;gap:4px;font-size:12px}'+
 '#vx .v4-s.foi{opacity:.45}'+
 '#vx .v4-s.agora{outline:2px solid var(--red);outline-offset:1px}'+
 '#vx .v4-h{font-family:var(--mono);font-size:10px;letter-spacing:.1em;opacity:.7}'+
 '#vx .v4-t i{opacity:.55}'+
 '#vx .v4-ag{position:absolute;right:6px;top:6px;font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--red)}'+
 '#vx .v4-bar{height:4px;background:var(--line2,#333);margin:10px 0 6px;border-radius:2px;overflow:hidden}'+
 '#vx .v4-bar i{display:block;height:100%;background:var(--red)}'+
 '#vx .v4-vit ul{margin:8px 0 0 16px;padding:0;line-height:1.5}'+
 '#vx .v4-tempo{font-size:13px}'+
 '.fx-06,.fx-09,#tb-g .tbc.fx-06,#tb-g .tbc.fx-09{background-image:linear-gradient(rgba(86,166,189,.13),rgba(86,166,189,.13))}'+
 '.fx-12,.fx-15,#tb-g .tbc.fx-12,#tb-g .tbc.fx-15{background-image:linear-gradient(rgba(217,161,59,.11),rgba(217,161,59,.11))}'+
 '.fx-18,.fx-21,#tb-g .tbc.fx-18,#tb-g .tbc.fx-21{background-image:linear-gradient(rgba(143,127,196,.12),rgba(143,127,196,.12))}'+
 '.v4-leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase}'+
 '.v4-leg span{padding:4px 8px;border-radius:3px}'+
 '@media(max-width:640px){#vx .v4-slots{grid-template-columns:repeat(3,1fr)}#vx .v4-es button{font-size:9px}}';
 document.head.appendChild(st); })();

try{ montaNav(); }catch(e){ console.error("sum\u00e1rio:",e); }
try{ pinta(); }catch(e){ console.error("pintura:",e);
 var m=el("msg"); if(m) m.textContent="falha ao desenhar um painel \u2014 o restante segue funcionando"; }
try{ montaPomo(); fxLiga(); }catch(e){ console.error("extras:",e); }
setTimeout(function(){ var b=el("boot"); if(b&&b.parentNode) b.parentNode.removeChild(b); },1750);
window.addEventListener("resize",spark);
setInterval(pintaProgresso,60000);
});

