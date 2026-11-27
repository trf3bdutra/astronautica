/* Gamificação: XP, nível e sequência */
"use strict";
/* ---------- Gamificação simples: XP, nível e sequência ----------
   O XP é calculado do que já está registrado, sem contador paralelo:
   foco e estudo +1 a cada 10 min por bloco; tópico do edital +2;
   etapa de projeto +10; hábito marcado no dia +5.
   Nível sobe a cada 100 XP. A sequência conta dias seguidos com a meta do dia:
   pelo menos 1 bloco de foco ou de estudo e até 3 hábitos marcados. */
var GM_SEQ='sequência';
var GM_TIT=['Epsilon','Delta','Gama','Beta','Alfa','Ômega'];
var GM_REGRAS=[['bloco de foco ou de estudo','+1 a cada 10 min'],['tópico do edital marcado','+2'],['etapa de projeto concluída','+10'],['hábito do dia','+5']];
function gmDiaFoco(d){var n=0;try{vxData().sessions.forEach(function(s){if(s.day===d&&(s.minutes||0)>=1)n++;});}catch(e){}
 ((S.est&&S.est.blocos)||[]).forEach(function(b){if(b.data===d&&(b.min|0)>0)n++;});return n;}
function gmDiaHab(d){return (S.hab||[]).filter(function(h){return (h.hist||[]).indexOf(d)>=0;}).length;}
function gmMetaHab(){return Math.min(3,(S.hab||[]).length);}
function gmDiaOk(d){return gmDiaFoco(d)>=1&&gmDiaHab(d)>=gmMetaHab();}
function gmXP(){var x={foco:0,estudo:0,topicos:0,etapas:0,habitos:0};
 try{vxData().sessions.forEach(function(s){x.foco+=Math.floor((s.minutes||0)/10);});}catch(e){}
 ((S.est&&S.est.blocos)||[]).forEach(function(b){x.estudo+=Math.floor((b.min|0)/10);});
 var ok=(S.cc&&S.cc.ok)||{};Object.keys(ok).forEach(function(k){x.topicos+=2*(ok[k]||[]).length;});
 (S.proj||[]).forEach(function(p){(p.passos||[]).forEach(function(t){if(t.ok)x.etapas+=10;});});
 (S.hab||[]).forEach(function(h){x.habitos+=5*((h.hist||[]).length);});
 x.total=x.foco+x.estudo+x.topicos+x.etapas+x.habitos;return x;}
function gmNivel(xp){var n=Math.floor(xp/100)+1;return{n:n,t:GM_TIT[Math.min(GM_TIT.length-1,Math.floor((n-1)/3))],no:xp%100};}
function gmSeq(){var h=hoje(),i=0,dia=hojeN(),s=0;
 if(!gmDiaOk(h))dia--; /* hoje ainda em aberto não quebra a sequência */
 for(i=0;i<730;i++){if(gmDiaOk(diaStr(dia-i)))s++;else break;}return s;}
function gmCard(compacto){var x=gmXP(),nv=gmNivel(x.total),sq=gmSeq(),h=hoje(),f=gmDiaFoco(h),hb=gmDiaHab(h),mh=gmMetaHab();
 var barra='<span class="gm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+nv.no+'" aria-label="XP no nível"><i style="width:'+nv.no+'%"></i></span>';
 var meta='<ul class="gm-meta"><li class="'+(f>=1?'ok':'')+'">'+(f>=1?'✓':'○')+' 1 bloco de foco ou de estudo</li>'+
  (mh?'<li class="'+(hb>=mh?'ok':'')+'">'+(hb>=mh?'✓':'○')+' '+mh+' hábito'+(mh>1?'s':'')+' <small>'+Math.min(hb,mh)+'/'+mh+'</small></li>':'')+'</ul>';
 if(compacto)return '<div class="gm gm-c"><div class="gm-l"><b>Nível '+nv.n+'</b> <span>'+nv.t+'</span></div>'+barra+
  '<div class="gm-r"><span>'+nv.no+'/100 XP</span><span class="gm-sq">\u{1F525} '+sq+' dia'+(sq===1?'':'s')+'</span></div>'+meta+'</div>';
 return '<div class="gm"><div class="gm-top"><div class="gm-l"><span class="k5">nível</span><b>'+nv.n+'</b><span>'+nv.t+'</span></div>'+
  '<div class="gm-mid">'+barra+'<small>'+nv.no+'/100 XP para o nível '+(nv.n+1)+' &middot; '+x.total+' XP no total</small></div>'+
  '<div class="gm-sq"><span class="k5">'+GM_SEQ+'</span><b>\u{1F525} '+sq+'</b><span>dia'+(sq===1?'':'s')+' seguidos</span></div></div>'+
  '<div class="gm-bot"><div><span class="k5">meta do dia</span>'+meta+'</div>'+
  '<details class="gm-regras"><summary>como ganha XP</summary><ul>'+GM_REGRAS.map(function(r){return '<li><span>'+r[0]+'</span><b>'+r[1]+'</b></li>';}).join('')+'</ul></details></div></div>';}
function gmPinta(){
 /* topo: o bloco "Domínio · Lastro" passa a mostrar nível e XP */
 var x=gmXP(),nv=gmNivel(x.total);
 if(VX)Array.prototype.forEach.call(VX.querySelectorAll('.vx-k'),function(k){if(/dom[ií]nio|n[ií]vel/i.test(k.textContent)&&k.querySelector('br'))k.innerHTML=esc(S.cod||'')+'<br>N\u00edvel '+nv.n+' &middot; '+x.total+' XP';});
 /* a métrica de Carga sai: nível e sequência já estão no cartão logo abaixo */
 var m=VX&&VX.querySelector('.vx-metrics span');if(m&&/carga/i.test(m.textContent))m.remove();
 var top=VX&&VX.querySelector('.vx-metrics');if(top){var c=document.getElementById('gm-vx');if(!c){c=document.createElement('div');c.id='gm-vx';}top.parentNode.insertBefore(c,top.nextSibling);c.innerHTML=gmCard(false);}}
aoIniciar(function(){

(function(){var r0=vxRender;vxRender=function(){r0();try{gmPinta();}catch(e){console.error('gam:',e);}};})();
(function(){var p0=pinta;pinta=function(){p0();try{gmPinta();}catch(e){console.error('gam:',e);}};})();
});


