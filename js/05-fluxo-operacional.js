/* Vértice: fluxo operacional v3, vistas e navegação */
"use strict";
/* Vértice — fluxo operacional v3. Dados anteriores são preservados. */
var VX;
aoIniciar(function(){
VX=document.createElement('section'); VX.id='vx';
document.querySelector('.wrap').prepend(VX);
});
var vxStyle;
aoIniciar(function(){
vxStyle=document.createElement('style'); vxStyle.textContent=`
#vx{padding:24px 0 40px;color:var(--bone);font-family:var(--sans)}
#vx *{box-sizing:border-box} #vx button,#vx input,#vx select,#vx textarea{font:inherit;color:var(--bone);background:var(--well);border:1px solid var(--line2);border-radius:4px;padding:10px;min-height:42px}
#vx button{cursor:pointer;width:auto;letter-spacing:0;text-transform:none} #vx button:hover{border-color:var(--red)} #vx button:disabled{opacity:.4;cursor:default}
#vx input,#vx textarea,#vx select{width:100%} #vx textarea{min-height:75px;resize:vertical} #vx label{display:grid;gap:6px;font-size:13px} #vx h2{font-size:32px;margin:12px 0} #vx h3{font-size:20px;margin:0 0 14px}
#vx .vx-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap} #vx .vx-k{font:11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
#vx .vx-tabs,#vx .vx-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center} #vx .vx-tabs{margin:22px 0} #vx [aria-selected=true],#vx .vx-primary{background:var(--red);color:var(--onred);border-color:var(--red);font-weight:700}
#vx .vx-grid{display:grid;grid-template-columns:1.65fr 1fr;gap:18px} #vx .vx-card{padding:22px;background:var(--panel,var(--well));border:1px solid var(--line2);margin-bottom:16px} #vx .vx-main{border-top:4px solid var(--red)}
#vx .vx-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px} #vx .vx-wide{grid-column:1/-1} #vx .vx-muted{color:var(--dim);font-size:13px;line-height:1.6} #vx .vx-time{font:48px var(--mono);margin:16px 0} #vx .vx-item{padding:14px 0;border-top:1px solid var(--line2)} #vx .vx-item p{margin:6px 0;overflow-wrap:anywhere} #vx .vx-tag{font:11px var(--mono);color:var(--red)} #vx .vx-metrics{display:flex;gap:22px;margin:18px 0;flex-wrap:wrap} #vx .vx-metrics b{display:block;font-size:23px} #vx details{margin:12px 0} #vx summary{cursor:pointer;padding:10px 0} #vx .vx-notice{border-left:3px solid var(--red);padding:12px;margin:12px 0} #vx button:focus-visible,#vx input:focus-visible{outline:2px solid var(--red);outline-offset:3px}
[data-vx-hidden="true"]{display:none!important} .pomo{display:none!important} #b-for{display:none!important} #vx .vx-row input{flex:1;min-width:130px;width:auto} #vx-message{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--panel2);color:var(--bone);padding:14px 22px;max-width:90vw;border:2px solid var(--red);box-shadow:4px 4px 0 var(--red)} @media(max-width:760px){#vx .vx-grid,#vx .vx-fields{grid-template-columns:1fr}#vx h2{font-size:25px}#vx .vx-card{padding:16px}.rail{display:none!important}.wrap{margin-left:auto!important}}

#vx-dlg{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center}
#vx-dlg .vxd-bk{position:absolute;inset:0;background:rgba(0,0,0,.66)}
#vx-dlg .vxd-bx{position:relative;background:var(--panel);border:1px solid var(--red);padding:18px;width:min(460px,92vw);
 display:flex;flex-direction:column;gap:10px;box-shadow:0 18px 50px rgba(0,0,0,.6)}
#vx-dlg .vxd-t{margin:0;font-family:var(--display);font-size:17px;color:var(--bone)}
#vx-dlg .vxd-d{margin:0;font-family:var(--sans);font-size:13px;line-height:1.5;color:var(--dim)}
#vx-dlg label{display:flex;flex-direction:column;gap:3px;font-family:var(--mono);font-size:8px;letter-spacing:.18em;
 text-transform:uppercase;color:var(--line2)}
#vx-dlg input{background:var(--well);color:var(--bone);border:1px solid var(--line2);font-family:var(--sans);font-size:13px;padding:8px 10px}
#vx-dlg .vxd-bt{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}
#vx-dlg .vxd-bt button{width:auto;padding:7px 14px;border:1px solid var(--line2);background:transparent;
 font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);cursor:pointer}
#vx-dlg .vxd-bt button[data-dlg-ok]{border-color:var(--red);color:var(--red)}
`; document.head.appendChild(vxStyle);
});
var vxNorm;
aoIniciar(function(){
vxNorm=normaliza; normaliza=function(p){var b=vxNorm(p); if(p.vx&&typeof p.vx==='object')b.vx=p.vx;return b;};
});

function vxData(){
 if(!S.vx)S.vx={};var v=S.vx;
 if(!Array.isArray(v.tasks))v.tasks=[];if(!Array.isArray(v.sessions))v.sessions=[];if(!v.closes)v.closes={};if(!v.paid)v.paid={};
 v.limit=clamp(v.limit||3,1,12);v.capacity=clamp(v.capacity||100,10,600);v.view=['op','camp','est','dos','fin'].indexOf(v.view)>=0?v.view:'op';v.filter=v.filter||'today';
 if(!v.migrated){S.proj.forEach(function(p){(p.passos||[]).forEach(function(t,i){t.vid=t.vid||p.id+'-'+i;if(t.ok){t.paid=true;v.paid['step:'+t.vid]=true;}});});v.migrated=true;}
 return v;
}

/* Diálogos próprios: prompt e confirm nativos são bloqueados em visualizador embutido. */
function vxDlg(o){
 var w=document.getElementById('vx-dlg'); if(w) w.remove();
 w=document.createElement('div'); w.id='vx-dlg'; w.setAttribute('role','dialog');
 var campos=(o.campos||[]).map(function(c,i){
  return '<label>'+c.label+'<input data-dlg="'+i+'" type="'+(c.tipo||'text')+'" value="'+esc(c.valor||'')+'" maxlength="200"></label>';
 }).join('');
 w.innerHTML='<div class="vxd-bk"></div><div class="vxd-bx"><p class="vxd-t">'+esc(o.titulo||'')+'</p>'+
  (o.texto?'<p class="vxd-d">'+o.texto+'</p>':'')+campos+
  '<div class="vxd-bt"><button data-dlg-x>cancelar</button><button data-dlg-ok>'+(o.ok||'confirmar')+'</button></div></div>';
 document.body.appendChild(w);
 var ins=w.querySelectorAll('[data-dlg]');
 if(ins.length) try{ ins[0].focus(); }catch(e){}
 function fecha(){ w.remove(); }
 w.querySelector('[data-dlg-x]').addEventListener('click',fecha);
 w.querySelector('.vxd-bk').addEventListener('click',fecha);
 w.addEventListener('keydown',function(e){ if(e.key==='Escape') fecha();
  if(e.key==='Enter'&&e.target.tagName==='INPUT'){ e.preventDefault(); w.querySelector('[data-dlg-ok]').click(); } });
 w.querySelector('[data-dlg-ok]').addEventListener('click',function(){
  var vals=[],i; for(i=0;i<ins.length;i++) vals.push(ins[i].value.trim());
  fecha(); if(o.onOk) o.onOk(vals);
 });
}
function vxConf(texto,onOk){ vxDlg({titulo:'Confirmar',texto:texto,ok:'confirmar',onOk:function(){ onOk(); }}); }
function vxId(){return 'v'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function vxMsg(s){var n=document.getElementById('vx-message');if(!n){n=document.createElement('div');n.id='vx-message';n.setAttribute('role','status');document.body.appendChild(n);}n.textContent=s;clearTimeout(vxMsg.t);vxMsg.t=setTimeout(function(){n.remove();},4500);}
function vxSave(){grava();}
function vxTask(){var v=vxData();return v.tasks.find(function(t){return t.id===v.active;});}
function vxProject(t){return S.proj.find(function(p){return p.id===t.project;});}
function vxReward(key,points,label){var v=vxData();if(v.paid[key])return;v.paid[key]=true;move(0,points,label,false,0,0,0);}
function vxMinutes(){return vxData().sessions.filter(function(s){return s.day===hoje();}).reduce(function(a,s){return a+s.minutes;},0);}
function vxActiveProjects(){return S.proj.filter(function(p){return p.est!=='pausado'&&p.est!=='concluido'&&!((p.passos||[]).length&&p.passos.every(function(x){return x.ok;}));});}
function vxShow(view){vxData().view=view;vxRender();vxSave();window.scrollTo(0,0);}
var VX_AREA={"h-sem":"op","h-painel":"dos","h-dia":"op","h-ctn":"op","h-deck":"op",
 "h-proj":"x","h-prov":"camp","h-rec":"camp","h-rast":"camp","h-wp":"camp","h-rota":"camp","h-apt":"camp","h-orb":"camp","h-cup":"camp","h-mc":"camp",
 "h-conc":"est","h-ciclo":"est","h-mapas":"est","h-lp":"est","h-lim":"dos","h-diag":"dos"};
var VX_ORDEM=["h-dia","h-deck","h-sem","h-ctn","h-cup","h-orb","h-rast","h-wp","h-prov","h-rec","h-rota","h-apt","h-mc","h-proj","h-conc","h-ciclo","h-mapas","h-lp"];
var VX_SEMPRE={anais:1,tirbox:1,"h-sec":1};
function vxArea(id){return VX_AREA[id]||"dos";}
/* Reagrupa as seções uma vez: cada h2.sec leva consigo os blocos que o seguem. */
function vxOrganiza(){var w=document.querySelector('.wrap');if(!w||w.dataset.org)return;w.dataset.org='1';
 var vx=document.getElementById('vx'),head=[],G={},cur=null,ordem=[];
 Array.from(w.children).forEach(function(n){if(n===vx)return;
  if(n.matches('h2.sec')&&n.id){cur=n.id;G[cur]=[n];ordem.push(cur);}else if(cur)G[cur].push(n);else head.push(n);});
 var lore=[];
 (G["h-painel"]||[]).forEach(function(n){if(n.classList.contains('desigbox')||n.classList.contains('prot'))lore.push(n);});
 G["h-painel"]=(G["h-painel"]||[]).filter(function(n){return lore.indexOf(n)<0;});
 function poe(lista,area){lista.forEach(function(n){n.dataset.area=area;w.appendChild(n);});}
 VX_ORDEM.forEach(function(id){if(G[id])poe(G[id],vxArea(id));});
 poe(head,"dos");poe(lore,"dos");
 ordem.forEach(function(id){if(VX_ORDEM.indexOf(id)<0&&G[id])poe(G[id],vxArea(id));});}
function finWrap(){var w=document.getElementById('fin-wrap');if(w)return w;var wr=document.querySelector('.wrap');if(!wr)return null;
 w=document.createElement('section');w.id='fin-wrap';w.dataset.area='fin';
 w.innerHTML='<iframe id="fin-frame" title="Tesouro: finan\\u00e7as, semana e sa\\u00fade (AxisHub)" loading="lazy"></iframe>'+
  '<p class="fin-nota">O Tesouro abre o arquivo <b>financas.html</b>. No site publicado ele j\\u00e1 vem junto; aberto do computador, os dois arquivos precisam estar na mesma pasta.</p>';
 var vx=document.getElementById('vx');if(vx&&vx.nextSibling)wr.insertBefore(w,vx.nextSibling);else wr.appendChild(w);return w;}
function vxLayout(){vxOrganiza();var view=vxData().view;document.body.dataset.vxView=view;
 var fw=finWrap();if(view==='fin'&&fw){var fr=document.getElementById('fin-frame');if(fr&&!fr.getAttribute('src'))fr.setAttribute('src','financas.html?hub=fin');}
 Array.from(document.querySelector('.wrap').children).forEach(function(n){if(n===VX)return;
  if(VX_SEMPRE[n.id]){n.dataset.vxHidden='false';return;}
  n.dataset.vxHidden=String((n.dataset.area||'dos')!==view);});}
function vxField(id,label,value,type){return '<label>'+label+'<input id="'+id+'" type="'+(type||'text')+'" value="'+esc(value||'')+'" maxlength="300"></label>';}
function vxOptions(sel){return '<option value="">Sem projeto</option>'+S.proj.filter(function(p){return p.est!=='concluido';}).map(function(p){return '<option value="'+esc(p.id)+'" '+(sel===p.id?'selected':'')+'>'+esc(p.nome)+'</option>';}).join('');}
function vxEdit(t){t=t||{};return '<form id="vx-form" class="vx-fields">'+vxField('vx-title','Entrega / alvo do ciclo',t.title)+vxField('vx-done','Concluído quando…',t.done)+vxField('vx-next','Primeira ação concreta',t.next)+vxField('vx-date','Planejado para',t.date||hoje(),'date')+'<label>Projeto<select id="vx-project">'+vxOptions(t.project)+'</select></label><label>Operação<select id="vx-mode"><option '+(t.mode==='cerco'?'selected':'')+' value="cerco">Cerco · avanço gradual</option><option '+(t.mode==='ruptura'?'selected':'')+' value="ruptura">Ruptura · resolver o nó</option></select></label><details class="vx-wide"><summary>Varredura de futuros · preparar o caminho</summary><div class="vx-fields">'+vxField('vx-obstacle','Obstáculo provável',t.obstacle)+vxField('vx-response','Se acontecer, vou…',t.response)+vxField('vx-minimum','Versão mínima da entrega',t.minimum)+vxField('vx-due','Prazo real (opcional)',t.due,'date')+'</div></details><div class="vx-row vx-wide"><button class="vx-primary" type="submit">'+(t.id?'Salvar rota':'Declarar rota')+'</button><button type="button" data-vx="cancel">Cancelar</button></div></form>';}
function vxRender(){
 var v=vxData(),t=vxTask(),open=v.tasks.filter(function(x){return x.status!=='done';});
 VX.innerHTML='<div class="vx-top"><div><span class="vx-k">Astronáutica · ciclo '+hoje()+'</span><h2>Escolha o ramo. Faça o movimento.</h2></div><div class="vx-k">'+esc(S.cod)+'<br>Domínio '+S.dominio+' · Lastro '+S.lastro+'</div></div><div class="vx-tabs" role="tablist" aria-label="Vistas"><button role="tab" aria-selected="'+(v.view==='op')+'" data-view="op">01 / Operação</button><button role="tab" aria-selected="'+(v.view==='camp')+'" data-view="camp">02 / Campanha</button><button role="tab" aria-selected="'+(v.view==='est')+'" data-view="est">03 / Estudo</button><button role="tab" aria-selected="'+(v.view==='dos')+'" data-view="dos">04 / Arquivo do mutante</button><button role="tab" aria-selected="'+(v.view==='fin')+'" data-view="fin">05 / Tesouro</button></div><div class="vx-metrics"><span><b>'+S.carga+'</b>Carga percebida</span><span><b>'+Math.round(vxMinutes())+' / '+v.capacity+'</b>minutos de foco hoje</span><span><b>'+open.length+'</b>rotas abertas</span><span><b>'+vxActiveProjects().length+' / '+v.limit+'</b>frentes ativas</span></div><div id="vx-body"></div>';
 var body=el('vx-body');
 if(v.view==='op'){
 var main='<div class="vx-card vx-main"><div class="vx-top"><span class="vx-k">Alvo do ciclo / '+(t?esc(t.status):'aguardando rota')+'</span><button data-vx="new">+ Nova rota</button></div>';
 if(v.edit){main+=vxEdit(v.edit==='new'?null:t);}
 else if(t){main+='<h2>'+esc(t.title)+'</h2><p><b>Concluído quando:</b> '+esc(t.done)+'</p><p><b>Próximo movimento:</b> '+esc(t.anchor||t.next)+'</p>'+(t.result?'<p class="vx-muted">Último avanço: '+esc(t.result)+'</p>':'')+(t.status==='waiting'?'<div class="vx-notice">Aguardando '+esc(t.who||t.block)+' · verificar em '+esc(t.review||'data a definir')+'<br>'+esc(t.unblock||'')+'</div>':'')+'<div class="vx-row"><span class="vx-tag">'+esc(t.mode)+' · '+esc((vxProject(t)||{}).nome||'rota independente')+'</span><button data-vx="edit">Editar rota</button></div>';
 if(t.obstacle)main+='<details><summary>Varredura de futuros</summary><p>'+esc(t.obstacle)+'</p><p>Resposta: '+esc(t.response||'a definir')+'</p><p>Entrega mínima: '+esc(t.minimum||'a definir')+'</p></details>';
 if(t.status!=='done'){main+='<div class="vx-time" id="vx-clock">00:00</div><div class="vx-row"><button data-start="2">Ignição 2 min</button><button data-start="5">5 min</button><button data-start="10">10 min</button><button class="vx-primary" data-start="25">Foco 25 min</button><button data-vx="pause">Pausar / retomar</button><button data-vx="finish-block">Encerrar bloco</button></div><div class="vx-fields" style="margin-top:16px">'+vxField('vx-result','Resultado deste avanço',t.draftResult)+vxField('vx-anchor','Âncora · ao voltar, faça isto',t.anchor)+'</div><div class="vx-row" style="margin-top:12px"><button data-vx="anchor">Salvar âncora</button><button data-vx="complete">Concluir entrega</button><button data-vx="block">Registrar impedimento</button></div>';
 }else main+='<p class="vx-notice">Entrega concluída. O ramo agora faz parte do seu domínio.</p><button data-vx="reopen">Reabrir sem pontuar novamente</button>';
 if(v.blocking)main+='<form id="vx-block-form" class="vx-fields">'+vxField('vx-block','Impedimento',t.block)+vxField('vx-who','Pessoa / informação / recurso necessário',t.who)+vxField('vx-review','Rever em',t.review||hoje(),'date')+vxField('vx-unblock','Próximo movimento para destravar',t.unblock)+'<button class="vx-primary">Salvar impedimento</button></form>';
 }else main+='<h2>Uma rota antes de qualquer disparo.</h2><p class="vx-muted">Escolha uma entrega concreta e seu primeiro movimento. O ECO preservará o ponto de retorno.</p><button class="vx-primary" data-vx="new">Declarar primeira rota</button>';
 main+='</div>';
 var side='<div class="vx-card"><h3>Radar de campo</h3><div class="vx-row"><button data-filter="today">Hoje</button><button data-filter="all">Todas</button><button data-filter="waiting">Aguardando</button><button data-filter="done">Concluídas</button></div><div class="vx-muted">Filtro: '+esc({today:'Hoje e pendentes',all:'Todas as rotas',waiting:'Aguardando',done:'Concluídas'}[v.filter])+'</div>';
 var list=v.tasks.filter(function(x){return v.filter==='all'||(v.filter==='done'?x.status==='done':v.filter==='waiting'?x.status==='waiting':x.status!=='done'&&x.date<=hoje());});
 side+=list.map(function(x){return '<div class="vx-item"><span class="vx-tag">'+esc(x.status==='waiting'?'aguardando':x.status==='done'?'concluída':'pronta')+(x.due&&x.due<hoje()&&x.status!=='done'?' · prazo vencido':'')+'</span><p>'+esc(x.title)+'</p><button data-select="'+x.id+'">'+(x.id===v.active?'Em foco':'Abrir rota')+'</button>'+(x.status==='waiting'?'<button data-unblock="'+x.id+'">Liberar</button>':'')+'</div>';}).join('')||'<p class="vx-muted">Nenhuma rota neste filtro.</p>';
 side+='</div><div class="vx-card"><h3>Captura rápida</h3><form id="vx-capture-form"><label>Uma ideia, sem interromper a operação<input id="vx-capture" required maxlength="300"></label><button>Guardar</button></form>'+S.cap.slice(0,5).map(function(c,i){return '<div class="vx-item"><p>'+esc(c.t)+'</p><button data-capture="'+i+'">Transformar em rota</button></div>';}).join('')+'</div>';
 var yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);var yd=yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');if(v.closes[yd])main='<div class="vx-notice"><b>Âncora do último ciclo:</b> '+esc(v.closes[yd].next)+'</div>'+main;body.innerHTML='<div class="vx-grid"><div>'+main+vxCloseHTML()+'</div><aside>'+side+vxSettingsHTML()+'</aside></div>';
 }else if(v.view==='camp'){
 body.innerHTML='<div class="vx-card"><h3>Campanha / frentes e resultados</h3><p class="vx-muted">Os registros abaixo compartilham as mesmas etapas e operações. Congelar preserva o projeto e libera uma frente.</p>'+vxProjectsHTML()+'</div><div class="vx-card"><h3>Relatórios do ECO</h3>'+Object.keys(v.closes).sort().reverse().slice(0,7).map(function(d){var c=v.closes[d];return '<div class="vx-item"><b>'+d+'</b><p>Entrega: '+esc(c.result)+'</p><p>Pendente: '+esc(c.pending)+'</p><p>Próxima ignição: '+esc(c.next)+'</p></div>';}).join('')+'<p class="vx-muted">Sessões registradas: '+v.sessions.length+' · Entregas concluídas: '+v.tasks.filter(function(x){return x.status==='done';}).length+'</p></div>';
 }else if(v.view==='fin'){body.innerHTML='';
 }else if(v.view==='est'){body.innerHTML='<div class="vx-card vx-est"><h3>Estudo / concurso, idiomas e runas</h3><p class="vx-muted">A roda do concurso gira por peso de incidência. A revisão de mapas devolve a matéria antiga no dia certo. Idiomas e runas ficam na Decodificação, logo abaixo.</p></div>';
 }else{body.innerHTML='<div class="vx-card"><h3>Arquivo do mutante</h3><p class="vx-muted">Ficha, poderes, ECO, limitador, criptonita e o painel antigo de Carga, Saturação e Lastro ficam aqui, fora do uso diário. A operação está na primeira aba.</p>'+vxSettingsHTML()+'<div class="vx-row"><button data-vx="export">Exportar registro completo</button><label>Restaurar registro JSON<input id="vx-import" type="file" accept=".json"></label><button data-vx="theme">Alternar claro / escuro</button></div></div>';}
 vxLayout();vxBind();vxClock();document.body.dataset.vxView=v.view;
}
function vxCloseHTML(){var c=vxData().closes[hoje()]||{};return '<details class="vx-card"><summary>Fechamento do ciclo · relatório do ECO'+(c.result?' · salvo':'')+'</summary><form id="vx-close-form" class="vx-fields">'+vxField('vx-close-result','O que foi entregue?',c.result)+vxField('vx-close-pending','O que ficou pendente?',c.pending)+vxField('vx-close-next','Primeira ação de amanhã',c.next)+'<button class="vx-primary">Salvar fechamento</button></form></details>';}
function vxSettingsHTML(){var v=vxData();return '<details class="vx-card"><summary>Calibrar o campo</summary><form id="vx-settings" class="vx-fields">'+vxField('vx-capacity','Capacidade de foco / minutos por dia',v.capacity,'number')+vxField('vx-limit','Limite de projetos ativos',v.limit,'number')+vxField('vx-charge','Carga percebida / 0 a 100',S.carga,'number')+'<button>Salvar calibração</button></form><p class="vx-muted">Carga e saturação são sinais de planejamento. Domínio reconhece avanços; Lastro libera recompensas. Ajuste a capacidade ao seu dia.</p></details>';}
function vxProjectsHTML(){var h='<form id="vx-project-form" class="vx-fields">'+vxField('vx-pname','Novo projeto','')+vxField('vx-pdone','Critério de conclusão','')+vxField('vx-pdate','Prazo','', 'date')+'<button>Criar projeto</button></form>';h+=S.proj.map(function(p){var steps=p.passos||[],done=p.est==='concluido'||steps.length&&steps.every(function(s){return s.ok;});return '<div class="vx-item"><div class="vx-top"><h3>'+esc(p.nome)+'</h3><span class="vx-tag">'+(done?'concluído':p.est==='pausado'?'reserva':p.waiting?'aguardando':'ativo')+'</span></div><p class="vx-muted">'+esc(p.criterion||'Defina o critério de conclusão.')+' · Prazo: '+esc(p.prazo||'sem prazo')+'</p><div class="vx-row"><button data-pedit="'+p.id+'">Editar critério / prazo</button><button data-ptoggle="'+p.id+'">'+(p.est==='pausado'?'Retomar':'Congelar')+'</button><button data-pwait="'+p.id+'">'+(p.waiting?'Liberar impedimento':'Aguardando')+'</button><button data-pdone="'+p.id+'">'+(done?'Reabrir projeto':'Concluir projeto')+'</button></div>'+(p.waiting?'<p class="vx-notice">'+esc(p.waiting)+' · verificar: '+esc(p.review||'a definir')+'</p>':'')+steps.map(function(s,i){return '<div class="vx-item"><div class="vx-row"><button data-step="'+p.id+'|'+i+'">'+(s.ok?'✓ Concluída':'Marcar feita')+'</button><span>'+esc(s.t)+'</span>'+(!s.ok?'<button data-promote="'+p.id+'|'+i+'">'+(p.next===i?'Próxima ação · abrir':'Executar esta etapa')+'</button>':'')+'</div></div>';}).join('')+'<form data-step-form="'+p.id+'" class="vx-row"><input name="step" required maxlength="200" aria-label="Nova etapa" placeholder="Próxima etapa concreta"><button>Adicionar etapa</button></form></div>';}).join('');return h;}
function vxTimerStop(){var v=vxData();if(v.timer&&v.timer.running){v.timer.remaining=Math.max(0,v.timer.end-Date.now());v.timer.running=false;vxSave();}}
function vxRecordBlock(result){var v=vxData(),tm=v.timer;if(!tm)return;vxTimerStop();var minutes=Math.max(0,(tm.total-tm.remaining)/60000);if(minutes>0)v.sessions.push({id:tm.id,day:hoje(),task:tm.task,minutes:Math.round(minutes*100)/100,result:result||''});v.timer=null;vxSave();}
function vxClock(){var v=vxData(),tm=v.timer,n=el('vx-clock');if(!tm){if(n)n.textContent='Pronto';return;}var left=tm.running?Math.max(0,tm.end-Date.now()):tm.remaining;if(n)n.textContent=pmFmt(left/1000)+(tm.running?'':' · pausa');if(tm.running&&left<=0){tm.remaining=0;tm.running=false;vxSave();vxMsg('Bloco encerrado. Registre o avanço e preserve sua âncora.');} }
function vxStart(min){var v=vxData(),t=vxTask();var project=t&&vxProject(t);if(project&&(project.est==='pausado'||project.waiting||project.est==='concluido'))return vxMsg('Retome ou libere o projeto na Campanha antes de começar.');if(!t||t.status==='done'||t.status==='waiting')return vxMsg('Libere o impedimento antes de começar.');if(v.timer)return vxMsg('Encerre o bloco atual ou retome a pausa antes de iniciar outro.');v.timer={id:vxId(),task:t.id,total:min*60000,remaining:min*60000,end:Date.now()+min*60000,running:true};t.status='active';vxSave();vxClock();if(vxMinutes()+min>v.capacity)vxMsg('Este bloco ultrapassa sua capacidade planejada. Você pode ajustar ou encerrar mais cedo.');}
function vxBind(){
 VX.querySelectorAll('[data-view]').forEach(function(b){b.onclick=function(){vxShow(b.dataset.view);};});
 VX.querySelectorAll('[data-start]').forEach(function(b){b.onclick=function(){vxStart(+b.dataset.start);};});
 VX.querySelectorAll('[data-filter]').forEach(function(b){b.onclick=function(){vxData().filter=b.dataset.filter;vxRender();vxSave();};});
 VX.querySelectorAll('[data-select]').forEach(function(b){b.onclick=function(){var v=vxData();if(v.timer&&v.timer.task!==b.dataset.select)return vxMsg('Encerre o bloco e salve a âncora antes de trocar de rota.');v.active=b.dataset.select;v.edit=null;v.blocking=false;vxRender();vxSave();};});
 VX.querySelectorAll('[data-unblock]').forEach(function(b){b.onclick=function(){vxData().tasks.find(function(t){return t.id===b.dataset.unblock;}).status='ready';vxRender();vxSave();};});
 VX.querySelectorAll('[data-capture]').forEach(function(b){b.onclick=function(){var v=vxData();if(v.timer)return vxMsg('Encerre o bloco antes de declarar outra rota.');v.capture=+b.dataset.capture;v.edit='new';vxRender();el('vx-title').value=S.cap[v.capture].t;};});
 VX.querySelectorAll('[data-vx]').forEach(function(b){b.onclick=function(){vxAction(b.dataset.vx);};});
 var f=el('vx-form');if(f)f.onsubmit=function(e){e.preventDefault();var v=vxData(),title=el('vx-title').value.trim(),done=el('vx-done').value.trim(),next=el('vx-next').value.trim();if(!title||!done||!next)return vxMsg('Preencha entrega, critério de conclusão e primeira ação.');var project=el('vx-project').value,p=S.proj.find(function(p){return p.id===project;});if(p&&p.est==='pausado')return vxMsg('Retome o projeto na Campanha antes de iniciar a rota.');var t=v.edit==='new'?{id:vxId(),status:'ready'}:vxTask();Object.assign(t,{title:title,done:done,next:next,date:el('vx-date').value||hoje(),due:el('vx-due').value,project:project,mode:el('vx-mode').value,obstacle:el('vx-obstacle').value,response:el('vx-response').value,minimum:el('vx-minimum').value});if(v.edit==='new')v.tasks.push(t);v.active=t.id;v.edit=null;if(v.capture!=null){S.cap.splice(v.capture,1);v.capture=null;}S.ign.decl=hoje();vxRender();vxSave();};
 f=el('vx-capture-form');if(f)f.onsubmit=function(e){e.preventDefault();var t=el('vx-capture').value.trim();if(t)S.cap.unshift({t:t,d:hoje()});vxRender();vxSave();};
 ['vx-result','vx-anchor'].forEach(function(id){var n=el(id);if(n)n.oninput=function(){var t=vxTask();if(t){t[id==='vx-result'?'draftResult':'anchor']=n.value;vxSave();}};});
 f=el('vx-block-form');if(f)f.onsubmit=function(e){e.preventDefault();var t=vxTask(),block=el('vx-block').value.trim();if(!block||!el('vx-unblock').value.trim())return vxMsg('Defina o impedimento e o movimento para destravar.');vxRecordBlock(t.draftResult);Object.assign(t,{status:'waiting',block:block,who:el('vx-who').value,review:el('vx-review').value,unblock:el('vx-unblock').value});vxData().blocking=false;vxRender();vxSave();};
 f=el('vx-close-form');if(f)f.onsubmit=function(e){e.preventDefault();if(vxData().timer)return vxMsg('Encerre a operação em curso antes de fechar o ciclo.');var c={result:el('vx-close-result').value.trim(),pending:el('vx-close-pending').value.trim(),next:el('vx-close-next').value.trim()};if(!c.result||!c.next)return vxMsg('Registre o resultado e a primeira ação de amanhã.');vxData().closes[hoje()]=c;vxSave();vxMsg('Ciclo registrado. Sua próxima ignição está preservada.');};
 f=el('vx-settings');if(f)f.onsubmit=function(e){e.preventDefault();var v=vxData();v.capacity=clamp(el('vx-capacity').value,10,600);v.limit=clamp(el('vx-limit').value,1,12);S.carga=clamp(el('vx-charge').value,0,100);pinta();vxMsg('Campo calibrado.');};
 f=el('vx-project-form');if(f)f.onsubmit=function(e){e.preventDefault();var name=el('vx-pname').value.trim(),criterion=el('vx-pdone').value.trim();if(!name||!criterion)return vxMsg('Defina nome e critério de conclusão.');var reserved=vxActiveProjects().length>=vxData().limit;S.proj.push({id:vxId(),nome:name,criterion:criterion,prazo:el('vx-pdate').value,passos:[],aberto:hoje(),ult:hoje(),est:reserved?'pausado':'ativo'});pinta();if(reserved)vxMsg('Projeto criado na reserva: limite de frentes atingido.');};
 VX.querySelectorAll('[data-step-form]').forEach(function(f){f.onsubmit=function(e){e.preventDefault();var p=S.proj.find(function(p){return p.id===f.dataset.stepForm;}),s=f.elements.step.value.trim();if(s){if(p.est==='concluido')return vxMsg('Reabra o projeto antes de adicionar etapas.');p.passos.push({vid:vxId(),t:s,ok:false});pinta();}};});
 ['pedit','ptoggle','pwait','pdone','step','promote'].forEach(function(kind){VX.querySelectorAll('[data-'+kind+']').forEach(function(b){b.onclick=function(){vxProjectAction(kind,b.dataset[kind]);};});});
 f=el('vx-import');if(f)f.onchange=async function(){var previous=S;try{var data=JSON.parse(await f.files[0].text());if(typeof data.carga!=='number'||!Array.isArray(data.proj))throw Error('Formato inválido');pmStop();S=normaliza(data);cicloNovo();pinta();vxMsg('Registro restaurado.');}catch(e){S=previous;pinta();vxMsg('Arquivo inválido. O registro atual foi preservado.');}};
}
function vxAction(a){var v=vxData(),t=vxTask();
 if(a==='new'){if(v.timer)return vxMsg('Encerre o bloco atual antes de abrir outra rota.');v.edit='new';v.capture=null;}
 if(a==='edit')v.edit='edit';if(a==='cancel'){v.edit=null;v.capture=null;}
 if(a==='pause'){if(!v.timer)return vxMsg('Inicie uma ignição ou bloco de foco.');if(v.timer.running)vxTimerStop();else if(v.timer.remaining>0){v.timer.end=Date.now()+v.timer.remaining;v.timer.running=true;}}
 if(a==='anchor'){vxSave();return vxMsg('Âncora preservada.');}
 if(a==='block'){vxTimerStop();v.blocking=!v.blocking;}
 if(a==='finish-block'){if(!v.timer)return vxMsg('Nenhum bloco em curso.');if(!t.draftResult)return vxMsg('Descreva o avanço realizado, mesmo que parcial.');var sid=v.timer.id;vxRecordBlock(t.draftResult);t.result=t.draftResult;t.draftResult='';if(t.status==='active')t.status='ready';vxReward('session:'+sid,3,'Avanço registrado: '+esc(t.result));}
 if(a==='complete'){if(!t||t.status==='done')return;if(!t.draftResult&&!t.result)return vxMsg('Registre o resultado que atende ao critério da entrega.');
  if(!t.okConf){ vxConf('A entrega atende ao critério: <b>'+esc(t.done||'')+'</b>?',function(){ t.okConf=true; vxAction('complete'); }); return; }
  t.okConf=false;vxRecordBlock(t.draftResult||t.result);t.result=t.draftResult||t.result;t.draftResult='';t.status='done';t.completed=hoje();var p=vxProject(t);if(p){p.ult=hoje();if(p.revival){p.revival=false;vxReward('revive:'+p.id+':'+p.revivalId,3,'Projeto retomado por avanço real.');}if(t.stepId){var st=p.passos.find(function(x){return x.vid===t.stepId;});if(st){if(st.paid)v.paid['step:'+st.vid]=true;st.ok=true;st.paid=true;}}}vxReward(t.stepId?'step:'+t.stepId:'task:'+t.id,t.mode==='ruptura'?15:10,'Entrega concluída: '+esc(t.title));if(t.mode==='ruptura')S.usos.rup=Math.max(1,S.usos.rup);}
 if(a==='reopen')t.status='ready';
 if(a==='theme'){el('b-tema').click();return;}
 if(a==='export'){var txt=JSON.stringify(S,null,2),nome='vertice-registro-'+hoje()+'.json';
      function baixaLink(){try{var blob=new Blob([txt],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=nome;link.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}catch(e){}}
      if(window.claude&&claude.use){Promise.resolve(claude.use('downloads')).then(function(d){if(d&&d.save){return d.save({filename:nome,data:txt});}baixaLink();}).catch(function(){baixaLink();});}else{baixaLink();}
      return;}
 pinta();
}
function vxProjectAction(kind,key){var parts=key.split('|'),p=S.proj.find(function(p){return p.id===parts[0];}),i=+parts[1],v=vxData();if(!p)return;
 if(kind==='pedit'){vxDlg({titulo:'Projeto: '+p.nome,ok:'gravar',
  campos:[{label:'Critério de conclusão',valor:p.criterion||''},{label:'Prazo',valor:p.prazo||'',tipo:'date'}],
  onOk:function(vals){ p.criterion=vals[0]; p.prazo=vals[1]||null; vxSave(); pinta(); }}); return;}
 if(kind==='ptoggle'){if(p.est==='concluido')return vxMsg('Projeto concluído: reabra para retomar.');if(p.est==='pausado'){if(vxActiveProjects().length>=v.limit)return vxMsg('Congele outra frente ou ajuste o limite antes de retomar.');p.est='ativo';p.revival=true;p.revivalId=vxId();}else{if(v.timer&&vxTask()&&vxTask().project===p.id)return vxMsg('Encerre o bloco antes de congelar o projeto.');p.est='pausado';}}
 if(kind==='pwait'){ if(p.waiting){ p.waiting=''; }
  else { vxDlg({titulo:'Aguardando — '+p.nome,ok:'marcar',
   campos:[{label:'De quem ou do que depende',valor:''},{label:'Verificar em',valor:hoje(),tipo:'date'}],
   onOk:function(vals){ if(!vals[0]) return vxMsg('Diga de quem ou do que depende.');
    if(!vals[1]) return vxMsg('Informe a data de verificação.');
    p.waiting=vals[0]; p.review=vals[1]; vxSave(); pinta(); }}); return; } }
 if(kind==='pdone'){if(v.timer&&vxTask()&&vxTask().project===p.id)return vxMsg('Encerre o bloco antes de alterar o projeto.');if(p.est==='concluido'||p.passos.length&&p.passos.every(function(s){return s.ok;})){p.est='ativo';if(vxActiveProjects().length>v.limit)p.est='pausado';p.passos.push({vid:vxId(),t:'Revisar entrega reaberta',ok:false});}else{if(p.passos.some(function(s){return !s.ok;}))return vxMsg('Conclua as etapas antes de encerrar o projeto.');if(!p.criterion)return vxMsg('Defina o critério de conclusão.');
  vxConf('O resultado atende a: <b>'+esc(p.criterion)+'</b>?',function(){ p.est='concluido'; p.completed=hoje(); vxSave(); pinta(); }); return;}}
 if(kind==='step'){if(v.timer)return vxMsg('Encerre o bloco antes de alterar etapas.');var s=p.passos[i];s.vid=s.vid||vxId();s.ok=!s.ok;p.ult=hoje();if(s.ok&&!s.paid){s.paid=true;if(p.revival){p.revival=false;vxReward('revive:'+p.id+':'+p.revivalId,3,'Projeto retomado por avanço real.');}vxReward('step:'+s.vid,5,'Etapa concluída: '+esc(s.t));}v.tasks.filter(function(t){return t.stepId===s.vid;}).forEach(function(t){t.status=s.ok?'done':'ready';});if(!s.ok&&p.est==='concluido')p.est='pausado';}
 if(kind==='promote'){if(v.timer)return vxMsg('Encerre o bloco antes de trocar de rota.');if(p.est==='pausado'||p.waiting)return vxMsg('Retome ou libere o projeto antes de executar.');var s=p.passos[i];s.vid=s.vid||vxId();p.next=i;var t=v.tasks.find(function(t){return t.stepId===s.vid;});if(!t){t={id:vxId(),title:s.t,done:s.t+' — etapa finalizada',next:s.t,date:hoje(),project:p.id,stepId:s.vid,mode:'cerco',status:'ready'};v.tasks.push(t);}v.active=t.id;v.view='op';}
 pinta();
}/* A camada antiga continua disponível, usando a mesma base. */
var vxOldPaint;
aoIniciar(function(){
vxOldPaint=pinta;pinta=function(){vxData();vxOldPaint();vxRender();grava();};
});
var vxOldEst;
aoIniciar(function(){
vxOldEst=estProj;estProj=function(p){if(p.est==='concluido'||(p.passos||[]).length&&p.passos.every(function(s){return s.ok;}))return{c:'concluido',sig:'OK',n:'concluído',d:'entrega preservada'};if(p.waiting)return{c:'pausado',sig:'AGD',n:'aguardando',d:p.waiting};return vxOldEst(p);};
pintaProj=function(){el('pj-l').innerHTML='<p class="vx-muted">Projetos e etapas estão no início da Campanha.</p>';el('b-proj').style.display='none';};
setInterval(vxClock,1000);
setInterval(function(){if(S.ciclo!==hoje()){cicloNovo();pinta();}},30000);
/* Navegação transversal resolve a vista antes de deslocar a página. */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ir]');if(!b)return;var id=b.getAttribute('data-ir'),target=el(id);if(!target)return;vxShow(vxArea(id));target.scrollIntoView({block:'start',behavior:'smooth'});},true);
});



