/* Motor de temas: aplica o tema escolhido (rótulos, abas, níveis, seletor).
   Os temas em si ficam em temas/<nome>.js e temas/<nome>.css. */
"use strict";
/* ---------- Tema do app: Astronáutica (inspirado na Argonáutica) ----------
   O tema troca a moldura (nome do app, abas, sumário, frase de abertura, títulos
   de nível) e a paleta. Os dados são os mesmos; a escolha fica em S.ap e sincroniza. */
var TEMAS={};
var AP_ARQ=/^(Arquivo do mutante|Porão)$/;
function apTema(){return 'astro';}
aoIniciar(function(){

(function(){var n0=normaliza;normaliza=function(p){var b=n0(p);b.ap=(p&&p.ap==='astro')?'astro':'astro-novo';return b;};})();
});

function apDados(){var t=TEMAS[apTema()];
 /* registro que vinha do tema Mutante: muda uma vez para o modo claro de planner */
 if(S.ap!=='astro'){S.ap='astro';if(!document.body.classList.contains('claro'))setTimeout(function(){var bt=document.getElementById('b-tema');if(bt)bt.click();},0);}
document.body.dataset.skin=apTema();document.title=t.titulo;
 if(typeof GM_TIT!=='undefined')GM_TIT.splice.apply(GM_TIT,[0,GM_TIT.length].concat(t.niveis));
 if(typeof GM_SEQ!=='undefined')GM_SEQ=t.seq;}
var AP_ROT_SEL='#nav-l button b,#nav-l button span,#nav-l button small,#nav-l button i,h2.sec,h2.sec span,.pl-k,#vx .vx-k,#vx .vx-metrics span,#vx .vx-card h2,#vx .vx-card h3,#vx .vx-card .k5,#vx .vx-card span,#vx .vx-card small,#rail .k9,#rail button';
function apRotulos(){var t=TEMAS[apTema()];if(!t.rotulos)return;
 var mapa={};t.rotulos.forEach(function(r){mapa[r[0].toLowerCase()]=r[1];});
 Array.prototype.forEach.call(document.querySelectorAll(AP_ROT_SEL),function(el){
  Array.prototype.forEach.call(el.childNodes,function(n){if(n.nodeType!==3)return;
   var v=n.nodeValue,tr=v.trim();if(!tr)return;
   var novo=mapa[tr.toLowerCase()];
   if(novo==null){var m=tr.match(/^(.*?)(\s*(?:\u00b7|\/\/).*)$/);if(m&&mapa[m[1].trim().toLowerCase()]!=null)novo=mapa[m[1].trim().toLowerCase()]+m[2];}
   if(novo==null){var m2=tr.match(/^(\/\/\s*)(.*)$/);if(m2&&mapa[m2[2].trim().toLowerCase()]!=null)novo=m2[1]+mapa[m2[2].trim().toLowerCase()];}
   if(novo==null&&/^ASTROMANTE/.test(tr))novo=tr.replace('ASTROMANTE','CHASE MAVERICK DUKE \u00b7 H\u00c9KATOS');
   if(novo!=null&&tr===tr.toUpperCase()&&tr!==tr.toLowerCase())novo=novo.toUpperCase();
   if(novo!=null&&novo!==tr)n.nodeValue=v.replace(tr,novo);});});}
function apTextos(){var t=TEMAS[apTema()];if(!VX)return;try{apRotulos();}catch(e){}
 var ordem=['op','camp','est','dos'];
 ordem.concat(['fin']).forEach(function(v,i){var b=VX.querySelector('.vx-tabs [data-view="'+v+'"]');if(b&&t.abas[i])b.textContent=t.abas[i];});
 var h=VX.querySelector('.vx-top h2');if(h)h.textContent=t.frase;
 Array.prototype.forEach.call(VX.querySelectorAll('.vx-k'),function(k){if(!k.querySelector('br')&&/Vértice|Astronáutica/.test(k.textContent))
  k.textContent=k.textContent.replace(/Vértice|Astronáutica/,t.app);});
 var c3=VX.querySelector('.vx-est h3');if(c3)c3.textContent=t.estudo+' / concurso, idiomas e runas';
 Array.prototype.forEach.call(VX.querySelectorAll('.vx-card h3'),function(x){if(AP_ARQ.test(x.textContent))x.textContent=t.arquivo;});
 var nb=document.querySelector('#nav .navh b');if(nb)nb.textContent=t.sumario;
 ordem.forEach(function(v,i){var g=document.querySelector('.nva.a-'+v+' .nvgn');if(g)g.textContent=t.grupos[i];});
 var top=VX.querySelector('.vx-top');if(!top)return;top.classList.add('vx-hero');
 if(Object.keys(TEMAS).length<2)return;
 var s=document.getElementById('vx-ap');
 if(!s){var w=document.createElement('label');w.className='vx-ap';w.innerHTML='<span>tema</span><select id="vx-ap" aria-label="Tema do app"></select>';
  top.appendChild(w);s=w.querySelector('select');
  s.innerHTML=Object.keys(TEMAS).map(function(k){return '<option value="'+k+'">'+TEMAS[k].nome+'</option>';}).join('');
  s.onchange=function(){S.ap=s.value;
   /* a Astronáutica nasce clara, como um planner; o botão de modo continua valendo */
   if(s.value==='astro'&&!document.body.classList.contains('claro')){var bt=document.getElementById('b-tema');if(bt)bt.click();}
   grava();vxRender();try{pinta();}catch(e){}};}
 var tb=document.getElementById('vx-tema');if(tb&&tb.nextSibling!==s.parentNode)top.insertBefore(s.parentNode,tb.nextSibling);
 s.value=apTema();}
aoIniciar(function(){

(function(){var r0=vxRender;vxRender=function(){apDados();r0();try{apTextos();}catch(e){console.error('tema:',e);}};})();
(function(){if(typeof pinta!=='function')return;var p0=pinta;pinta=function(){var r=p0.apply(this,arguments);try{apRotulos();}catch(e){}return r;};})();
/* a moldura é redesenhada em vários pontos; um observador reaplica os nomes depois de cada redesenho */
(function(){var pend=0;function vez(){pend=0;try{apRotulos();}catch(e){}}
 function agenda(){if(!pend)pend=setTimeout(vez,30);}
 if(window.MutationObserver)new MutationObserver(agenda).observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(vez,0);})();
});


