/* Enfermaria, captura melhorada, Bunker 9 e grade semanal */
"use strict";
function nvEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nvHoje(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function nvDias(a,b){return Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);}
function nvBRL(v){return 'R$ '+(Number(v)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function nvMove(){move.apply(null,arguments);try{grava();}catch(e){}}
function nvSalva(){try{grava();}catch(e){}try{pinta();}catch(e){}}

/* ---------------- Enfermaria: medicação e gasto do dia (dados do AxisHub) ---------------- */
var ENF_CATS=['Alimentação','Transporte','Casa','Saúde','Lazer','Compras','Assinaturas','Outros'];
var ENF_FORMAS=['Pix','Débito','Crédito','Dinheiro','Transferência','Outro'];
function enfMedHTML(){var st=AX.st&&AX.st();if(!st)return '<span class="k5">P·05 Medicação</span><div class="sub2">carregando…</div>';
 var H=st.habit,d=nvHoje(),L=(H.medsLog&&H.medsLog[d])||[],meds=H.medications||[],tot=0,ok=0,lin='';
 meds.forEach(function(m){var tk=(m.times&&m.times.length)?m.times.map(function(t){return [m.id+'@'+t,t];}):[[m.id,'']];
  tk.forEach(function(x){tot++;var on=L.indexOf(x[0])>=0;if(on)ok++;
   lin+='<label class="enf-dose'+(on?' on':'')+'"><input type="checkbox" data-enf-dose="'+nvEsc(x[0])+'"'+(on?' checked':'')+'><b>'+nvEsc(m.name)+'</b><small>'+nvEsc([m.dose,x[1]].filter(Boolean).join(' · '))+'</small><button type="button" class="enf-x" data-enf-medx="'+m.id+'" aria-label="Remover '+nvEsc(m.name)+'">✕</button></label>';});});
 return '<span class="k5">P·05 Medicação</span><div class="big2"><span>'+ok+'</span><small> / '+tot+' doses hoje</small></div>'+
  '<div class="sub2">'+(tot&&ok>=tot?'todas tomadas':tot?'faltam <b>'+(tot-ok)+'</b>':'nenhuma medicação cadastrada')+'</div>'+
  '<div class="enf-doses">'+lin+'</div>'+
  '<form class="enf-f" data-enf-medform><input name="n" placeholder="medicação" maxlength="60" required><input name="d" placeholder="dose" maxlength="40"><input name="h" placeholder="horários (08:00, 20:00)" maxlength="60"><button>Adicionar</button></form>'+
  '<button type="button" class="enf-link" data-enf-hist>histórico de saúde do mês</button>';}
function enfGastoHTML(){var d=nvHoje(),it=(window.getDailyExpenseEntries?window.getDailyExpenseEntries(d):[]),tot=0;
 it.forEach(function(e){tot+=Number(e.efet||e.valor||e.prev)||0;});
 var lim=(AX.st&&AX.st()&&AX.st().habit.dailySpendLimit)||0;
 return '<span class="k5">P·06 Gasto do dia</span><div class="big2"><span>'+nvBRL(tot)+'</span><small> hoje</small></div>'+
  '<div class="sub2">'+(it.length?it.length+' lançamento'+(it.length>1?'s':'')+' · entra na planilha do mês':'nada lançado hoje')+(lim?' · limite '+nvBRL(lim):'')+'</div>'+
  '<div class="enf-gl">'+it.map(function(e){return '<div><span><b>'+nvEsc(e.descricao||'Gasto')+'</b><small>'+nvEsc((e.sub||'Outros')+' · '+(e.meio||'—'))+'</small></span><strong>'+nvBRL(e.efet||e.valor)+'</strong><button type="button" class="enf-x" data-enf-gx="'+e.id+'" aria-label="Apagar lançamento">✕</button></div>';}).join('')+'</div>'+
  '<form class="enf-f enf-fg" data-enf-gform><input name="t" placeholder="descrição" maxlength="60"><input name="v" type="number" min="0" step="0.01" placeholder="0,00" required>'+
  '<select name="c">'+ENF_CATS.map(function(c){return '<option>'+c+'</option>';}).join('')+'</select><select name="m">'+ENF_FORMAS.map(function(c){return '<option>'+c+'</option>';}).join('')+'</select><button>Lançar</button></form>';}
function enfPinta(forca){var corpo=document.querySelector('#c-h-ctn .corpo');if(!corpo||!AX.ok)return;
 var a=document.getElementById('enf-med'),b=document.getElementById('enf-gasto');
 if(!a){a=document.createElement('div');a.id='enf-med';corpo.appendChild(a);}
 if(!b){b=document.createElement('div');b.id='enf-gasto';corpo.appendChild(b);}
 var foco=document.activeElement&&(a.contains(document.activeElement)||b.contains(document.activeElement));if(foco&&!forca)return;
 a.innerHTML=enfMedHTML();b.innerHTML=enfGastoHTML();}
function enfMuda(fn){var st=AX.st();fn(st);AX.save();enfPinta(true);}
aoIniciar(function(){

document.addEventListener('change',function(e){var x=e.target.closest&&e.target.closest('[data-enf-dose]');if(!x)return;var tok=x.getAttribute('data-enf-dose');
 enfMuda(function(st){var d=nvHoje(),H=st.habit;H.medsLog=H.medsLog||{};var L=(H.medsLog[d]=H.medsLog[d]||[]),i=L.indexOf(tok);if(x.checked&&i<0)L.push(tok);if(!x.checked&&i>=0)L.splice(i,1);});});
document.addEventListener('submit',function(e){var f=e.target;
 if(f.matches&&f.matches('[data-enf-medform]')){e.preventDefault();var n=f.n.value.trim();if(!n)return;var ts=f.h.value.split(',').map(function(s){return s.trim();}).filter(Boolean).map(function(s){return /^\d{1,2}:\d{2}$/.test(s)?s.padStart(5,'0'):s;});
  enfMuda(function(st){st.habit.medications=st.habit.medications||[];st.habit.medications.push({id:AX.uid(),name:n,dose:f.d.value.trim(),quantity:1,times:ts});});return;}
 if(f.matches&&f.matches('[data-enf-gform]')){e.preventDefault();var v=parseFloat(String(f.v.value).replace(',','.'));if(!(v>0))return;
  window.addDailyExpenseEntry({value:v,description:f.t.value.trim()||'Gasto diário',category:f.c.value,method:f.m.value});try{AX.recarrega();}catch(z){}enfPinta(true);return;}});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-enf-medx],[data-enf-gx],[data-enf-hist]');if(!t)return;
 if(t.hasAttribute('data-enf-medx')){e.preventDefault();var id=t.getAttribute('data-enf-medx');enfMuda(function(st){var H=st.habit;H.medications=(H.medications||[]).filter(function(m){return m.id!==id;});Object.keys(H.medsLog||{}).forEach(function(d){H.medsLog[d]=(H.medsLog[d]||[]).filter(function(x){return x!==id&&String(x).indexOf(id+'@')!==0;});});});return;}
 if(t.hasAttribute('data-enf-gx')){window.deleteDailyExpenseEntry(t.getAttribute('data-enf-gx'));try{AX.recarrega();}catch(z){}enfPinta(true);return;}
 if(t.hasAttribute('data-enf-hist')){var b=AX.A&&AX.A.querySelector('[data-awb-tab="sono"]');if(b)b.click();}});
(function(){var c0=pintaCtn;pintaCtn=function(){var r=c0.apply(this,arguments);try{enfPinta();}catch(e){console.error(e);}return r;};})();
});


/* ---------------- Captura melhorada: categoria, prazo, hora e alarme ---------------- */
var CAP_CATS=[['ideia','Ideia','#9a7b3f'],['tarefa','Tarefa','#2f6f4e'],['lembrete','Lembrete','#b4521c'],['compra','Compra','#7a5cab'],['estudo','Estudo','#3a6ea5']];
var CAP_SEL='ideia',CAP_FILTRO='todas';
function capCat(id){for(var i=0;i<CAP_CATS.length;i++)if(CAP_CATS[i][0]===id)return CAP_CATS[i];return null;}
function capQuando(it){if(!it.p)return null;var hj=nvHoje(),n=nvDias(hj,it.p),agora=new Date(),dt=new Date(it.p+'T'+(it.h||'23:59'));
 if(dt<agora)return ['vencida',n<0?'venceu há '+(-n)+' dia'+(n<-1?'s':''):'venceu hoje'+(it.h?' às '+it.h:''),'v'];
 if(n===0)return ['hoje','hoje'+(it.h?' às '+it.h:''),'h'];if(n===1)return ['amanha','amanhã'+(it.h?' às '+it.h:''),'a'];
 return ['futura',it.p.split('-').reverse().slice(0,2).join('/')+(it.h?' às '+it.h:''),'f'];}
function capOrdem(){var C=S.cap.map(function(it,i){return {it:it,i:i};});
 function peso(x){var q=capQuando(x.it);return q?({v:0,h:1,a:2,f:3})[q[2]]:4;}
 C.sort(function(a,b){var pa=peso(a),pb=peso(b);if(pa!==pb)return pa-pb;if(a.it.p&&b.it.p&&a.it.p!==b.it.p)return a.it.p<b.it.p?-1:1;return a.i-b.i;});
 return C.filter(function(x){if(CAP_FILTRO==='todas')return true;if(CAP_FILTRO==='prazo')return !!x.it.p;return (x.it.c||'')===CAP_FILTRO;});}
aoIniciar(function(){

pintaCap=function(){var box=document.getElementById('cp-l');if(!box)return;var ent=box.previousElementSibling;
 if(!document.getElementById('cp-mais')&&ent){var m=document.createElement('div');m.id='cp-mais';m.className='cp-mais';
  m.innerHTML='<div class="cp-cats" role="radiogroup" aria-label="Categoria">'+CAP_CATS.map(function(c){return '<button type="button" role="radio" data-cpcat="'+c[0]+'" style="--cc:'+c[2]+'">'+c[1]+'</button>';}).join('')+'</div>'+
   '<label class="cp-q">prazo <input type="date" id="cp-p"></label><label class="cp-q">hora <input type="time" id="cp-h"></label><label class="cp-q cp-al"><input type="checkbox" id="cp-a"> alarme</label>';
  ent.parentNode.insertBefore(m,box);}
 Array.prototype.forEach.call(document.querySelectorAll('[data-cpcat]'),function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-cpcat')===CAP_SEL));});
 var fl='<div class="cp-filtro">'+[['todas','todas'],['prazo','com prazo']].concat(CAP_CATS.map(function(c){return [c[0],c[1]];})).map(function(f){return '<button type="button" data-cpf="'+f[0]+'" aria-pressed="'+(CAP_FILTRO===f[0])+'">'+f[1]+'</button>';}).join('')+'</div>';
 var L=capOrdem(),h=L.map(function(x){var it=x.it,c=capCat(it.c),q=capQuando(it);
  return '<li class="cp-it'+(q?' q-'+q[2]:'')+'" data-cpi="'+x.i+'">'+(c?'<i class="cp-tag" style="--cc:'+c[2]+'">'+c[1]+'</i>':'')+'<span>'+nvEsc(it.t)+'</span>'+(q?'<em class="cp-pz">'+(it.a?'⏰ ':'')+q[1]+'</em>':'')+
   '<button data-cpok="'+x.i+'" title="Resolvida">✓</button><button data-cl="'+x.i+'">vira lâmina</button><button class="x3" data-cx="'+x.i+'" aria-label="Apagar">✕</button></li>';}).join('');
 box.innerHTML=(S.cap.length?fl:'')+(h||'<li class="vz6">'+(S.cap.length?'nada neste filtro':'caixa vazia')+'</li>');
 var bc=el('b-cap');if(bc)bc.onclick=(function(){var v=el('cp-in').value.trim();if(!v)return;var it={t:v,d:hoje(),c:CAP_SEL};var p=el('cp-p').value,hr=el('cp-h').value,al=el('cp-a').checked;
  if(p||hr){it.p=p||nvHoje();if(hr)it.h=hr;}if(al&&it.p){it.a=1;try{if(window.Notification&&Notification.permission==='default')Notification.requestPermission();}catch(e){}}
  S.cap.unshift(it);if(S.cap.length>60)S.cap.length=60;CAP_SEL='ideia';el('cp-in').value='';el('cp-p').value='';el('cp-h').value='';el('cp-a').checked=false;nvMove(0,1,'Captura: '+esc(v),false,-2,0,0);});
 var inp=el('cp-in');if(inp&&!inp.dataset.cpk){inp.dataset.cpk=1;inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var b=el('b-cap');if(b)b.click();}});}};
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-cpcat],[data-cpf],[data-cpok],#cp-l [data-cl],#cp-l [data-cx]');if(!t)return;
 if(t.hasAttribute('data-cpcat')){CAP_SEL=t.getAttribute('data-cpcat');pintaCap();return;}
 if(t.hasAttribute('data-cpf')){CAP_FILTRO=t.getAttribute('data-cpf');pintaCap();return;}
 var k=+(t.getAttribute('data-cpok')||t.getAttribute('data-cl')||t.getAttribute('data-cx')),it=S.cap[k];if(!it)return;e.preventDefault();e.stopImmediatePropagation();
 if(t.hasAttribute('data-cpok')){S.cap.splice(k,1);nvMove(0,1,'Captura resolvida: “'+esc(it.t)+'”.',false,-2,0,0);return;}
 if(t.hasAttribute('data-cl')){S.extras.push({id:'x'+Date.now(),c:'dig',e:'baixa',t:5,h:it.t,p:'',s:['Faça a coisa.'],d:''});S.cap.splice(k,1);nvMove(0,2,'Captura triada: “'+esc(it.t)+'” virou lâmina.',false,-2,0,0);return;}
 if(t.hasAttribute('data-cx')){S.cap.splice(k,1);nvSalva();}},true);
});

/* alarme: confere a cada 30 s */
function capAlarme(){var agora=new Date(),mud=false;(S.cap||[]).forEach(function(it){if(!it.a||it.f||!it.p||!it.h)return;if(new Date(it.p+'T'+it.h)<=agora){it.f=1;mud=true;capAvisa(it);}});if(mud){try{grava();}catch(e){}try{pintaCap();corvoPinta();}catch(e){}}}
function capAvisa(it){var t=document.getElementById('cap-toast');if(!t){t=document.createElement('div');t.id='cap-toast';t.className='cap-toast';t.setAttribute('role','alert');document.body.appendChild(t);}
 t.innerHTML='<b>⏰ '+nvEsc(it.t)+'</b><small>'+(it.p===nvHoje()?'hoje':it.p.split('-').reverse().join('/'))+' às '+nvEsc(it.h)+'</small><button type="button">ok</button>';t.classList.add('on');
 t.querySelector('button').onclick=function(){t.classList.remove('on');};
 try{if(window.Notification&&Notification.permission==='granted')new Notification('Captura · '+it.t,{body:'agora: '+it.h});}catch(e){}}
aoIniciar(function(){

setInterval(capAlarme,30000);setTimeout(capAlarme,4000);
});


/* ---------------- Bunker 9: a oficina dos projetos, com o Corvo ---------------- */
function corvoAlertas(){var hj=nvHoje(),A=[];
 (S.proj||[]).forEach(function(p,i){if(p.est==='concluido')return;var steps=p.passos||[];if(steps.length&&steps.every(function(s){return s.ok;}))return;
  if(p.est==='pausado')return;
  if(p.prazo){var n=nvDias(hj,p.prazo);if(n<0)A.push({n:0,ic:'✶',t:p.nome,s:'prazo venceu há '+(-n)+' dia'+(n<-1?'s':''),go:'p'+i});else if(n<=3)A.push({n:1,ic:'⏳',t:p.nome,s:n===0?'prazo é hoje':'prazo em '+n+' dia'+(n>1?'s':''),go:'p'+i});}
  if(p.waiting&&p.review&&p.review<=hj)A.push({n:1,ic:'⌛',t:p.nome,s:'conferir o impedimento: '+p.waiting,go:'p'+i});
  var u=p.ult||p.aberto;if(u){var dd=nvDias(u,hj);if(dd>14)A.push({n:2,ic:'❄',t:p.nome,s:'abandonado · '+dd+' dias sem avanço',go:'p'+i});else if(dd>7)A.push({n:3,ic:'❄',t:p.nome,s:'esfriando · '+dd+' dias sem avanço',go:'p'+i});}
  if(!steps.filter(function(s){return !s.ok;}).length)A.push({n:3,ic:'◇',t:p.nome,s:'sem próxima etapa definida',go:'p'+i});});
 (S.cap||[]).forEach(function(it){var q=capQuando(it);if(!q)return;if(q[2]==='v')A.push({n:0,ic:'⏰',t:it.t,s:'captura '+q[1],go:'cap'});else if(q[2]==='h')A.push({n:1,ic:'⏰',t:it.t,s:'captura para '+q[1],go:'cap'});});
 return A.sort(function(a,b){return a.n-b.n;});}
function corvoHTML(){var A=corvoAlertas();
 return '<div class="b9-corvo'+(A.length?' tem':'')+'"><div class="b9-ch"><span class="b9-ico" aria-hidden="true">⚑</span><b>O corvo</b><small>'+(A.length?A.length+' aviso'+(A.length>1?'s':''):'nada pedindo atenção')+'</small></div>'+
  (A.length?'<ul>'+A.slice(0,8).map(function(a){return '<li class="n'+a.n+'"><button type="button" data-b9go="'+a.go+'"><i>'+a.ic+'</i><span><b>'+nvEsc(a.t)+'</b><small>'+nvEsc(a.s)+'</small></span></button></li>';}).join('')+'</ul>':'<p>Prazos, projetos parados e capturas vencidas aparecem aqui.</p>')+'</div>';}
function corvoPinta(){var c=document.querySelector('#pj-l .b9-corvo');if(!c)return;var d=document.createElement('div');d.innerHTML=corvoHTML();c.replaceWith(d.firstChild);}
aoIniciar(function(){

pintaProj=function(){var box=el('pj-l');if(!box)return;var b=el('b-proj');if(b)b.style.display='none';
 var foco=document.activeElement&&box.contains(document.activeElement)&&/INPUT|TEXTAREA/.test(document.activeElement.tagName);if(foco)return;
 var hd=el('h-proj');if(hd&&!hd.dataset.b9){hd.dataset.b9=1;hd.innerHTML='Bunker 9 <span>// a oficina dos projetos &middot; o corvo vigia</span>';}
 var ativos=(S.proj||[]).filter(function(p){return p.est!=='concluido'&&p.est!=='pausado';}).length;
 box.innerHTML='<div class="b9">'+corvoHTML()+'<div class="b9-ofi"><p class="vx-muted">'+ativos+' na bancada &middot; congelar guarda o projeto e libera uma frente.</p>'+vxProjectsHTML()+'</div></div>';
 Array.prototype.forEach.call(box.querySelectorAll('.b9-ofi > .vx-item'),function(it,i){it.id='b9-p'+i;});
 Array.prototype.forEach.call(box.querySelectorAll('[data-step-form]'),function(f){f.onsubmit=function(e){e.preventDefault();var p=S.proj.find(function(p){return p.id===f.dataset.stepForm;}),s=f.elements.step.value.trim();if(s&&p){if(p.est==='concluido')return vxMsg('Reabra o projeto antes de adicionar etapas.');p.passos.push({vid:vxId(),t:s,ok:false});p.ult=hoje();nvSalva();}};});
 ['pedit','ptoggle','pwait','pdone','step','promote'].forEach(function(kind){Array.prototype.forEach.call(box.querySelectorAll('[data-'+kind+']'),function(bt){bt.onclick=function(){vxProjectAction(kind,bt.dataset[kind]);};});});
 try{vxBind();}catch(e){}};
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-b9go]');if(!t)return;var g=t.getAttribute('data-b9go'),alvo=g==='cap'?document.getElementById('cp-l'):document.getElementById('b9-'+g);
 if(alvo){alvo.scrollIntoView({block:'center',behavior:'smooth'});alvo.classList.add('b9-pisca');setTimeout(function(){alvo.classList.remove('b9-pisca');},1600);}});
setInterval(function(){try{corvoPinta();}catch(e){}},60000);
});


/* ---------------- Grade semanal: foco e metas do mês na linha do "limpar semana" ---------------- */
var MESES_PT=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function tbMesPlano(){var st=AX.st&&AX.st();if(!st)return null;var d=new Date(),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');st.habit.monthPlan=st.habit.monthPlan||{};return {k:k,m:(st.habit.monthPlan[k]=st.habit.monthPlan[k]||{}),st:st};}
function tbFoco(){var cab=document.querySelector('.tbcab');if(!cab||!AX.ok)return;var P=tbMesPlano();if(!P)return;var w=document.getElementById('tb-mes');
 if(!w){w=document.createElement('div');w.id='tb-mes';w.className='tb-mes';
  w.innerHTML='<label><span>foco de '+MESES_PT[new Date().getMonth()]+'</span><input data-tbm="foco" maxlength="120" placeholder="sem foco definido"></label><label><span>metas do mês</span><input data-tbm="metas" maxlength="160" placeholder="sem metas"></label>';
  var lp=document.getElementById('b-tb-lp');cab.insertBefore(w,lp||null);
  w.addEventListener('change',function(e){var i=e.target.closest('[data-tbm]');if(!i)return;var Q=tbMesPlano();if(!Q)return;Q.m[i.getAttribute('data-tbm')]=i.value.trim();AX.save();});
  w.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.matches('[data-tbm]'))e.target.blur();});}
 Array.prototype.forEach.call(w.querySelectorAll('[data-tbm]'),function(i){if(document.activeElement!==i)i.value=P.m[i.getAttribute('data-tbm')]||'';});}
aoIniciar(function(){

(function(){var t0=pintaTb;pintaTb=function(){var r=t0.apply(this,arguments);try{tbFoco();}catch(e){}return r;};})();
});

