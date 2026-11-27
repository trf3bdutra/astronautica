/* Painel de aquisição de língua (Biblioteca) */
"use strict";
/* ===== painel de aquisição de língua ===== */
var HAB=[["ou","escuta"],["fa","fala"],["le","leitura"],["es","escrita"],["vo","vocabulário"],["gr","gramática"]];
var INT=[1,2,4,8,16,32,64];
var ETAPA=[["Novo",0],["Aprendendo",1],["Revisando",3],["Dominado",5]];
var TABS=[["pn","painel"],["ru","runas"],["se","sessões"],["vo","vocabulário"],["gr","gramática"],
          ["re","recursos"],["cv","conversação"],["te","testes"],["sm","semana"]];
var RUNAS=[["ᚠ","Fehu"],["ᚢ","Uruz"],["ᚦ","Thurisaz"],["ᚨ","Ansuz"],["ᚱ","Raido"],["ᚲ","Kenaz"],["ᚷ","Gebo"],["ᚹ","Wunjo"],["ᚺ","Hagalaz"],["ᚾ","Naudiz"],["ᛁ","Isaz"],["ᛃ","Jera"],["ᛇ","Eihwaz"],["ᛈ","Perthro"],["ᛉ","Algiz"],["ᛊ","Sowilo"],["ᛏ","Tiwaz"],["ᛒ","Berkano"],["ᛖ","Ehwaz"],["ᛗ","Mannaz"],["ᛚ","Laguz"],["ᛜ","Ingwaz"],["ᛞ","Dagaz"],["ᛟ","Othala"]];
var lpTab="pn", vcAtual=null, vcAberto=false;
function diaN(d){ return Math.floor(new Date(d+"T00:00:00").getTime()/864e5); }
function hojeN(){ return diaN(hoje()); }
function maisDias(n){ var d=new Date(); d.setDate(d.getDate()+n);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function habNome(k){ for(var i=0;i<HAB.length;i++) if(HAB[i][0]===k) return HAB[i][1]; return k; }
function etapa(l){ l=l|0; return l>=5?3:(l>=3?2:(l>=1?1:0)); }
function langNome(id){ for(var i=0;i<S.langs.length;i++) if(S.langs[i].id===id) return S.langs[i].nome; return "—"; }
function optLangs(sel){ var h="";
 for(var i=0;i<S.langs.length;i++) h+='<option value="'+S.langs[i].id+'"'+(S.langs[i].id===sel?" selected":"")+'>'+esc(S.langs[i].nome)+'</option>';
 return h||'<option value="">registre um idioma</option>'; }
function semanaMin(lid){ var lim=hojeN()-7, t=0;
 for(var i=0;i<S.sess.length;i++){ var x=S.sess[i];
  if(x.lang===lid && diaN(x.data)>lim) t+=x.min|0; } return t; }
function vocDom(lid){ var n=0; for(var i=0;i<S.voc.length;i++) if(S.voc[i].lang===lid&&(S.voc[i].lvl|0)>=5) n++; return n; }
function venc(){ var r=[]; for(var i=0;i<S.voc.length;i++){ var v=S.voc[i];
 if(!v.next||diaN(v.next)<=hojeN()) r.push(i); } return r; }

function barras(id,dados,cor){
 var c=el(id); if(!c||!c.getContext) return;
 var w=c.width=c.clientWidth*2, h=c.height=236, x=c.getContext("2d"); if(!x) return;
 x.clearRect(0,0,w,h);
 var mx=1,i; for(i=0;i<dados.length;i++) mx=Math.max(mx,dados[i][1]);
 var n=dados.length, pad=18, bw=(w-pad*2)/n, base=h-34;
 x.strokeStyle="#23232a"; x.lineWidth=2;
 x.beginPath(); x.moveTo(pad,base+.5); x.lineTo(w-pad,base+.5); x.stroke();
 for(i=0;i<n;i++){
  var v=dados[i][1], bh=Math.round((v/mx)*(base-24)), bx=pad+i*bw+bw*0.17, bwid=bw*0.66;
  x.fillStyle = v>0 ? (cor||ACC()) : "#1c1c22";
  x.fillRect(bx, base-bh, bwid, Math.max(bh,2));
  x.fillStyle="#76767f"; x.font="500 17px 'IBM Plex Mono',monospace"; x.textAlign="center";
  x.fillText(String(dados[i][0]).slice(0,7), bx+bwid/2, h-10);
  if(v>0){ x.fillStyle="#eae8e3"; x.font="600 18px 'IBM Plex Mono',monospace";
   x.fillText(String(v), bx+bwid/2, base-bh-8); }
 }
}
function pintaGraficos(){
 var i,j,m={},L={},E=[0,0,0,0];
 for(i=0;i<HAB.length;i++) m[HAB[i][0]]=0;
 for(i=0;i<S.sess.length;i++){ var x=S.sess[i];
  if(m[x.hab]!==undefined) m[x.hab]+=x.min|0;
  L[x.lang]=(L[x.lang]||0)+(x.min|0); }
 var d1=[]; for(i=0;i<HAB.length;i++) d1.push([HAB[i][1],m[HAB[i][0]]]);
 for(i=0;i<S.voc.length;i++) E[etapa(S.voc[i].lvl)]++;
 var d2=[]; for(i=0;i<ETAPA.length;i++) d2.push([ETAPA[i][0],E[i]]);
 var d3=[]; for(i=0;i<S.langs.length;i++) d3.push([S.langs[i].nome, L[S.langs[i].id]||0]);
 if(!d3.length) d3=[["—",0]];
 barras("g1",d1); barras("g2",d2); barras("g3",d3);
}

function tabPainel(){
 var h='<p class="hdr" style="font-family:var(--mono);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--red);margin:0 0 13px">Superf&iacute;cie operacional da Decodifica&ccedil;&atilde;o Estrutural</p>';
 h+='<div class="gr3">'+
  '<div class="gr"><h5>Minutos por habilidade</h5><canvas id="g1"></canvas></div>'+
  '<div class="gr"><h5>Palavras por etapa</h5><canvas id="g2"></canvas></div>'+
  '<div class="gr"><h5>Minutos por idioma</h5><canvas id="g3"></canvas></div></div>';
 h+='<div class="lcards">';
 for(var i=0;i<S.langs.length;i++){ var L=S.langs[i],
  dias=L.exame?(diaN(L.exame)-hojeN()):null, sm=semanaMin(L.id), meta=L.meta|0,
  pc=meta?Math.min(100,Math.round(sm/meta*100)):0;
  h+='<div class="lc"><div class="limg'+(L.img?'':' vaz')+'">'+
     (L.img?'<img src="'+L.img+'" alt=""><div class="duo2"></div><button class="rmp" data-lr="'+i+'" aria-label="remover">\u2715</button>'
          :'<div class="vz7">sem placa</div>')+
     '<i class="cx a"></i><i class="cx b"></i>'+
     '<label><span>'+(L.img?"trocar":"placa")+'</span><input type="file" accept="image/*" data-li="'+i+'"></label></div>'+
     '<div class="top"><span class="nm">'+esc(L.nome)+
     (L.tipo==="sistema"?'<i class="sis">sistema fechado</i>':'')+'</span>'+
     '<span class="cef">'+esc(L.atual)+' → '+esc(L.alvo)+'</span></div>';
  h+='<div class="cd">'+(dias===null?"sem exame marcado":(dias>=0?"exame em <b>"+dias+"</b> dias":"exame há <b>"+(-dias)+"</b> dias"))+'</div>';
  h+='<div class="mt"><span>meta semanal</span><span><b>'+sm+'</b> / '+meta+' min</span></div>';
  h+='<div class="pb"><i style="width:'+pc+'%"></i></div>';
  h+='<div class="fx2"><div><span>vocabulário dominado</span><b>'+vocDom(L.id)+'</b></div>'+
     '<div><span>melhor teste</span><b>'+(L.melhor?esc(L.melhor)+"%":"—")+'</b></div></div>';
  h+='<button class="rm" data-rl="'+i+'"><strong>remover registro</strong></button></div>';
 }
 h+='</div>';
 h+='<div class="frm" style="margin-top:12px">'+
  '<div><label>Idioma</label><input id="nl-nome" maxlength="24" placeholder="Japonês"></div>'+
  '<div><label>Nível atual</label><select id="nl-atual">'+cefOpts("A1")+'</select></div>'+
  '<div><label>Meta CEFR</label><select id="nl-alvo">'+cefOpts("B2")+'</select></div>'+
  '<div><label>Meta semanal (min)</label><input id="nl-meta" type="number" min="0" step="30" value="180"></div>'+
  '<div><label>Data do exame</label><input id="nl-data" type="date"></div>'+
  '<div><button id="b-addlang"><strong>Registrar</strong></button></div></div>';
 return h;
}
function cefOpts(sel){ var C=["A1","A2","B1","B2","C1","C2"],h="";
 for(var i=0;i<C.length;i++) h+='<option'+(C[i]===sel?" selected":"")+'>'+C[i]+'</option>'; return h; }

var POS=["o que est\u00e1 posto","o que resiste","a rota prov\u00e1vel"];
function nivR(n){ return (S.run.lv&&S.run.lv[n])|0; }
function tabRunas(){
 var h='<div class="narr" style="margin-bottom:12px"><div class="txt"><span class="k5">Conceito \u00b7 Runas</span>'+
  '<p>Vinte e quatro signos, combina\u00e7\u00e3o finita, leitura infinita: sistema fechado, objeto natural da Decodifica\u00e7\u00e3o.</p>'+
  '<p>Ler padr\u00e3o e colapsar ramifica\u00e7\u00f5es s\u00e3o a <b>mesma opera\u00e7\u00e3o</b>. A tiragem n\u00e3o d\u00e1 resposta \u2014 d\u00e1 enquadramento, que \u00e9 o que falta quando o campo satura.</p></div></div>';
 var i, t=S.run.tir&&S.run.tir.length?S.run.tir[S.run.tir.length-1]:null, aberta=S.run.aberta;
 h+='<div class="tir">';
 for(i=0;i<3;i++){ var c=aberta?aberta[i]:null;
  h+='<div class="pos'+(c?"":" vz4")+'"><span class="p2">'+POS[i]+'</span>'+
     '<span class="gl2">'+(c?RUNAS[c][0]:"\u16EC")+'</span>'+
     (c?'<span class="nm5">'+RUNAS[c][1]+'</span>':'<span class="lt">vazio</span>')+'</div>';
 }
 h+='</div>';
 h+='<div class="frm"><div style="grid-column:span 3"><label>Pergunta ou n\u00f3</label><input id="ru-q" maxlength="110" placeholder="o problema que voc\u00ea quer enquadrar"></div>'+
    '<div><button id="b-tirar" class="key"><strong>Tirar tr\u00eas</strong></button></div></div>';
 if(aberta){ h+='<div class="frm"><div style="grid-column:span 3"><label>Leitura</label><textarea id="ru-l" placeholder="o que esse arranjo torna vis\u00edvel"></textarea></div>'+
   '<div><button id="b-savetir"><strong>Arquivar tiragem</strong></button></div></div>'; }
 h+='<div class="rgrid">';
 for(i=0;i<RUNAS.length;i++){ var lv=nivR(i);
  h+='<div class="rn2 l'+lv+'" data-ru="'+i+'"><span class="gl">'+RUNAS[i][0]+'</span><span class="nm4">'+RUNAS[i][1]+'</span>'+
     '<span class="dots"><i></i><i></i><i></i></span></div>'; }
 h+='</div>';
 var est=[0,0,0,0]; for(i=0;i<RUNAS.length;i++) est[nivR(i)]++;
 h+='<div class="vz2" style="border:0;padding:0 0 12px">desconhecidas '+est[0]+' &middot; vistas '+est[1]+' &middot; lidas '+est[2]+' &middot; integradas '+est[3]+' de 24</div>';
 if(S.run.tir&&S.run.tir.length){
  h+='<div class="tbw"><table class="tb"><thead><tr><th>Data</th><th>N&oacute;</th><th>Arranjo</th><th>Leitura</th><th></th></tr></thead><tbody>';
  for(i=S.run.tir.length-1;i>=0;i--){ var x=S.run.tir[i];
   h+='<tr><td class="mn">'+esc(x.data)+'</td><td>'+esc(x.q||"\u2014")+'</td><td class="mn" style="font-size:16px">'+
      x.c.map(function(k){return RUNAS[k][0];}).join(" ")+'</td><td style="color:var(--dim)">'+esc(x.l||"\u2014")+'</td>'+
      '<td><button data-rtr="'+i+'">\u2715</button></td></tr>'; }
  h+='</tbody></table></div>'; }
 return h;
}
function tabSessoes(){
 var h='<div class="frm">'+
  '<div><label>Data</label><input id="ss-d" type="date" value="'+hoje()+'"></div>'+
  '<div><label>Duração (min)</label><input id="ss-m" type="number" min="5" step="5" value="25"></div>'+
  '<div><label>Habilidade</label><select id="ss-h">'+HAB.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join("")+'</select></div>'+
  '<div><label>Idioma</label><select id="ss-l">'+optLangs()+'</select></div>'+
  '<div><label>Recurso</label><input id="ss-r" maxlength="40" placeholder="livro, app, podcast"></div>'+
  '<div><button id="b-addss"><strong>Lançar sessão</strong></button></div></div>';
 if(!S.sess.length) return h+'<div class="vz2">nenhuma sessão lançada</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Data</th><th>Idioma</th><th>Habilidade</th><th>Recurso</th><th style="text-align:right">Min</th><th></th></tr></thead><tbody>';
 for(var i=S.sess.length-1;i>=0;i--){ var x=S.sess[i];
  h+='<tr><td class="mn">'+esc(x.data)+'</td><td>'+esc(langNome(x.lang))+'</td><td>'+habNome(x.hab)+
     '</td><td>'+esc(x.rec||"—")+'</td><td class="rt">'+(x.min|0)+'</td>'+
     '<td><button data-rs="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function tabVoc(){
 var D=venc(), h='<div class="rev"><div class="box"><span class="due">'+D.length+'</span>'+
  '<span class="duel">termos vencidos hoje</span>'+
  '<span class="duel" style="color:var(--line2)">energia baixa · opera sob o limiar</span></div><div class="box" id="vc-card"></div></div>';
 h+='<div class="frm">'+
  '<div><label>Palavra</label><input id="nv-t" maxlength="60"></div>'+
  '<div><label>Tradução</label><input id="nv-d" maxlength="60"></div>'+
  '<div><label>Frase de exemplo</label><input id="nv-e" maxlength="120"></div>'+
  '<div><label>Classe</label><select id="nv-c"><option>substantivo</option><option>verbo</option><option>adjetivo</option><option>advérbio</option><option>expressão</option><option>outro</option></select></div>'+
  '<div><label>Idioma</label><select id="nv-l">'+optLangs()+'</select></div>'+
  '<div><button id="b-addvoc"><strong>Acrescentar</strong></button></div></div>';
 if(!S.voc.length) return h+'<div class="vz2">banco vazio</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Palavra</th><th>Sentido</th><th>Classe</th><th>Idioma</th><th>Etapa</th><th>Revisa</th><th></th></tr></thead><tbody>';
 for(var i=0;i<S.voc.length;i++){ var v=S.voc[i], e=etapa(v.lvl);
  h+='<tr><td>'+esc(v.t)+'</td><td>'+esc(v.d)+'</td><td class="mn">'+esc(v.classe||"—")+'</td><td class="mn">'+
     esc(langNome(v.lang))+'</td><td><span class="et e'+e+'">'+ETAPA[e][0]+'</span></td>'+
     '<td class="mn">'+(v.next||"hoje")+'</td><td><button data-rv="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}
function pintaCartaoVoc(){
 var D=venc(), c=el("vc-card"); if(!c) return;
 if(!D.length){ vcAtual=null; c.innerHTML='<span class="duel">banco em dia — nada vencido</span>'; return; }
 if(vcAtual===null||D.indexOf(vcAtual)<0){ vcAtual=D[0]; vcAberto=false; }
 var v=S.voc[vcAtual];
 c.innerHTML='<span class="termo">'+esc(v.t)+'</span>'+
  (vcAberto?'<span class="trad">'+esc(v.d)+'</span>'+(v.ex?'<span class="exfr">'+esc(v.ex)+'</span>':''):'')+
  '<span class="duel">'+ETAPA[etapa(v.lvl)][0]+' · próximo intervalo '+INT[Math.min(v.lvl|0,INT.length-1)]+'d</span>'+
  (vcAberto?'<div class="row2"><button id="vc-no"><strong>Errei</strong></button><button id="vc-ok" class="key"><strong>Acertei</strong></button></div>'
           :'<div class="row2"><button id="vc-sh"><strong>Mostrar</strong></button></div>');
 var sh=el("vc-sh"); if(sh) sh.addEventListener("click",function(){ vcAberto=true; pintaCartaoVoc(); });
 var ok=el("vc-ok"); if(ok) ok.addEventListener("click",function(){ respVoc(true); });
 var no=el("vc-no"); if(no) no.addEventListener("click",function(){ respVoc(false); });
}
function respVoc(certo){
 var v=S.voc[vcAtual]; if(!v) return;
 v.lvl = certo ? Math.min((v.lvl|0)+1, INT.length-1) : 0;
 v.next = maisDias(INT[v.lvl]); v.rev = hoje();
 vcAtual=null; vcAberto=false;
 move(-1,certo?1:0,"Vocabulário: "+esc(v.t)+(certo?" — retido, volta em "+INT[v.lvl]+"d.":" — falhou, reinicia."),false,0,1,0);
}

function tabGram(){
 var h='<div class="frm">'+
  '<div style="grid-column:span 2"><label>Regra</label><input id="gr-r" maxlength="90"></div>'+
  '<div style="grid-column:span 2"><label>Exemplo</label><input id="gr-e" maxlength="120"></div>'+
  '<div style="grid-column:span 2"><label>Meu erro mais comum</label><input id="gr-x" maxlength="120"></div>'+
  '<div><label>Confiança</label><select id="gr-c"><option value="1">1 — nenhuma</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5 — total</option></select></div>'+
  '<div><label>Idioma</label><select id="gr-l">'+optLangs()+'</select></div>'+
  '<div><button id="b-addgr"><strong>Anotar</strong></button></div></div>';
 if(!S.gram.length) return h+'<div class="vz2">nenhuma nota de gramática</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Regra</th><th>Erro comum</th><th>Idioma</th><th>Conf.</th><th>Revisa</th><th></th></tr></thead><tbody>';
 for(var i=0;i<S.gram.length;i++){ var g=S.gram[i], atras=g.next&&diaN(g.next)<=hojeN();
  h+='<tr><td>'+esc(g.regra)+(g.ex?'<br><span style="color:var(--dim);font-style:italic">'+esc(g.ex)+'</span>':'')+
     '</td><td>'+esc(g.erro||"—")+'</td><td class="mn">'+esc(langNome(g.lang))+
     '</td><td><span class="et e'+(g.conf>=4?3:(g.conf>=3?2:0))+'">'+g.conf+'/5</span></td>'+
     '<td class="mn" style="color:'+(atras?"var(--red)":"var(--dim)")+'">'+(g.next||"—")+'</td>'+
     '<td><button data-rg="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function tabRec(){
 var h='<div class="frm">'+
  '<div><label>Tipo</label><select id="rc-t"><option>livro</option><option>aplicativo</option><option>podcast</option><option>curso</option><option>canal</option></select></div>'+
  '<div style="grid-column:span 2"><label>Nome</label><input id="rc-n" maxlength="60"></div>'+
  '<div><label>Idioma</label><select id="rc-l">'+optLangs()+'</select></div>'+
  '<div><label>Progresso (%)</label><input id="rc-p" type="number" min="0" max="100" value="0"></div>'+
  '<div><button id="b-addrc"><strong>Acrescentar</strong></button></div></div>';
 if(!S.rec.length) return h+'<div class="vz2">biblioteca vazia</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Recurso</th><th>Tipo</th><th>Idioma</th><th>Progresso</th><th style="text-align:right">Min</th><th></th></tr></thead><tbody>';
 for(var i=0;i<S.rec.length;i++){ var r=S.rec[i];
  h+='<tr><td>'+esc(r.nome)+'</td><td class="mn">'+esc(r.tipo)+'</td><td class="mn">'+esc(langNome(r.lang))+
     '</td><td><div class="pb" style="min-width:68px"><i style="width:'+(r.prog|0)+'%"></i></div><span class="mn">'+(r.prog|0)+'%</span></td>'+
     '<td class="rt">'+(r.min|0)+'</td><td><button data-rr="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function tabConv(){
 var h='<div class="frm">'+
  '<div><label>Data</label><input id="cv-d" type="date" value="'+hoje()+'"></div>'+
  '<div><label>Tipo</label><select id="cv-t"><option>aula</option><option>intercâmbio</option><option>clube</option></select></div>'+
  '<div><label>Idioma</label><select id="cv-l">'+optLangs()+'</select></div>'+
  '<div style="grid-column:span 2"><label>Correções recebidas</label><input id="cv-c" maxlength="140"></div>'+
  '<div style="grid-column:span 2"><label>Frases novas</label><input id="cv-f" maxlength="140"></div>'+
  '<div><label>Confiança</label><select id="cv-k"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option></select></div>'+
  '<div><button id="b-addcv"><strong>Registrar</strong></button></div></div>';
 if(!S.conv.length) return h+'<div class="vz2">nenhuma sessão de conversação</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Data</th><th>Tipo</th><th>Idioma</th><th>Correções</th><th>Frases novas</th><th>Conf.</th><th></th></tr></thead><tbody>';
 for(var i=S.conv.length-1;i>=0;i--){ var c=S.conv[i];
  h+='<tr><td class="mn">'+esc(c.data)+'</td><td class="mn">'+esc(c.tipo)+'</td><td class="mn">'+esc(langNome(c.lang))+
     '</td><td>'+esc(c.corr||"—")+'</td><td>'+esc(c.frases||"—")+'</td>'+
     '<td><span class="et e'+(c.conf>=4?3:(c.conf>=3?2:0))+'">'+c.conf+'/5</span></td>'+
     '<td><button data-rc="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function tabTeste(){
 var h='<div class="frm">'+
  '<div><label>Data</label><input id="ts-d" type="date" value="'+hoje()+'"></div>'+
  '<div style="grid-column:span 2"><label>Nome</label><input id="ts-n" maxlength="60" placeholder="simulado, prova oficial, marco"></div>'+
  '<div><label>Idioma</label><select id="ts-l">'+optLangs()+'</select></div>'+
  '<div><label>Acertos (%)</label><input id="ts-p" type="number" min="0" max="100" value="0"></div>'+
  '<div><label>Resultado</label><select id="ts-r"><option>tentativa</option><option>aprovado</option><option>reprovado</option></select></div>'+
  '<div><button id="b-addts"><strong>Lançar</strong></button></div></div>';
 if(!S.test.length) return h+'<div class="vz2">nenhum teste lançado</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Data</th><th>Teste</th><th>Idioma</th><th>Resultado</th><th style="text-align:right">%</th><th></th></tr></thead><tbody>';
 for(var i=S.test.length-1;i>=0;i--){ var t=S.test[i];
  h+='<tr><td class="mn">'+esc(t.data)+'</td><td>'+esc(t.nome)+'</td><td class="mn">'+esc(langNome(t.lang))+
     '</td><td><span class="et e'+(t.res==="aprovado"?3:(t.res==="reprovado"?0:1))+'">'+esc(t.res)+'</span></td>'+
     '<td class="rt">'+(t.pct|0)+'</td><td><button data-rt="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function tabSemana(){
 var tot=0,i; for(i=0;i<S.langs.length;i++) tot+=S.langs[i].meta|0;
 var feito=0; for(i=0;i<S.langs.length;i++) feito+=semanaMin(S.langs[i].id);
 var pc=tot?Math.round(feito/tot*100):0;
 var h='<div class="lcards" style="margin-bottom:12px"><div class="lc">'+
  '<div class="mt"><span>meta semanal somada</span><span><b>'+feito+'</b> / '+tot+' min</span></div>'+
  '<div class="pb"><i style="width:'+Math.min(100,pc)+'%"></i></div>'+
  '<div class="cd" style="margin:10px 0 0">'+(tot===0?"nenhuma meta definida":(pc>=100?"meta <b>cumprida</b>":"faltam <b>"+(tot-feito)+"</b> min"))+'</div></div></div>';
 h+='<div class="frm">'+
  '<div style="grid-column:span 3"><label>Conquistas</label><textarea id="sm-c"></textarea></div>'+
  '<div style="grid-column:span 3"><label>Dificuldades</label><textarea id="sm-d"></textarea></div>'+
  '<div style="grid-column:span 3"><label>Próximo foco</label><textarea id="sm-f"></textarea></div>'+
  '<div><button id="b-addsm"><strong>Fechar a semana</strong></button></div></div>';
 if(!S.sem.length) return h+'<div class="vz2">nenhuma revisão semanal</div>';
 h+='<div class="tbw"><table class="tb"><thead><tr><th>Fechada em</th><th>Conquistas</th><th>Dificuldades</th><th>Próximo foco</th><th></th></tr></thead><tbody>';
 for(i=S.sem.length-1;i>=0;i--){ var w=S.sem[i];
  h+='<tr><td class="mn">'+esc(w.data)+'</td><td>'+esc(w.conq||"—")+'</td><td>'+esc(w.dif||"—")+
     '</td><td>'+esc(w.foco||"—")+'</td><td><button data-rw="'+i+'">✕</button></td></tr>'; }
 return h+'</tbody></table></div>';
}

function pintaLP(){
 var i,h="";
 for(i=0;i<TABS.length;i++) h+='<button data-tab="'+TABS[i][0]+'" aria-pressed="'+(lpTab===TABS[i][0])+'"><strong>'+TABS[i][1]+'</strong></button>';
 el("lptabs").innerHTML=h;
 var body={pn:tabPainel,ru:tabRunas,se:tabSessoes,vo:tabVoc,gr:tabGram,re:tabRec,cv:tabConv,te:tabTeste,sm:tabSemana}[lpTab];
 el("lpbody").innerHTML=body();
 if(lpTab==="pn"){ pintaGraficos();
  var li=document.querySelectorAll("[data-li]"),q;
  for(q=0;q<li.length;q++) li[q].addEventListener("change",function(){
   var k=+this.getAttribute("data-li"), f=this.files&&this.files[0]; if(!f||!S.langs[k]) return;
   importar(f,360,function(d){ S.langs[k].img=d; pinta(); }); });
  li=document.querySelectorAll("[data-lr]");
  for(q=0;q<li.length;q++) li[q].addEventListener("click",function(){
   var k=+this.getAttribute("data-lr"); if(S.langs[k]){ S.langs[k].img=null; pinta(); } });
 }
 if(lpTab==="vo") pintaCartaoVoc();
 var n=el("lptabs").querySelectorAll("[data-tab]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ lpTab=this.getAttribute("data-tab"); pintaLP(); });
 lig("b-addlang",function(){ var v=el("nl-nome").value.trim(); if(!v)return;
  S.langs.push({id:"l"+Date.now(),nome:v,atual:el("nl-atual").value,alvo:el("nl-alvo").value,
   meta:+el("nl-meta").value||0,exame:el("nl-data").value||null,melhor:null});
  anota("Idioma registrado: "+esc(v)+" — "+el("nl-atual").value+" rumo a "+el("nl-alvo").value+".",0,false); pinta();});
 var rn=document.querySelectorAll("[data-ru]");
 for(i=0;i<rn.length;i++) rn[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-ru"); S.run.lv=S.run.lv||{};
  var atual=(S.run.lv[k]|0);
  if(atual>=3){ S.run.lv[k]=0; pinta(); return; }
  S.run.lv[k]=atual+1;
  move(-1,2,"Runa "+RUNAS[k][1]+": "+["desconhecida","vista","lida","integrada"][atual+1]+".",false,0,1,0);});
 lig("b-tirar",function(){
  var pool=[],k; for(k=0;k<RUNAS.length;k++) pool.push(k);
  var esc3=[]; for(k=0;k<3;k++) esc3.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  S.run.aberta=esc3; S.run.q=el("ru-q").value.trim();
  move(-3,0,"Tiragem aberta: "+esc3.map(function(z){return RUNAS[z][1];}).join(", ")+".",false,-4,1,0);});
 lig("b-savetir",function(){ if(!S.run.aberta)return;
  S.run.tir=(S.run.tir||[]).concat({data:hoje(),q:S.run.q||"",c:S.run.aberta,l:el("ru-l").value.trim()});
  S.run.aberta=null; S.run.q="";
  move(0,4,"Tiragem arquivada. Enquadramento registrado.",false,-6,1,0);});
 rmv("data-rtr",(S.run.tir||[]));
 lig("b-addss",function(){ var m=+el("ss-m").value||0, L=el("ss-l").value; if(!m||!L)return;
  S.sess.push({id:"s"+Date.now(),data:el("ss-d").value||hoje(),min:m,hab:el("ss-h").value,lang:L,rec:el("ss-r").value.trim()});
  var M=pm(), cst=Math.max(1,Math.round(Math.max(2,Math.round(m/6))*M.sess));
  move(-cst,Math.round(m/4),"Decodifica\u00e7\u00e3o: "+m+" min de "+habNome(el("ss-h").value)+" em "+esc(langNome(L))+"."+
   (M.sess<1?" Protocolo OBSERVAT\u00d3RIO: custo pela metade, ru\u00eddo em dobro.":""),false,M.satSess,1,0);});
 lig("b-addvoc",function(){ var t=el("nv-t").value.trim(), d=el("nv-d").value.trim(); if(!t||!d)return;
  S.voc.push({id:"v"+Date.now(),t:t,d:d,ex:el("nv-e").value.trim(),classe:el("nv-c").value,lang:el("nv-l").value,lvl:0,next:null});
  vcAtual=null; pinta();});
 lig("b-addgr",function(){ var r=el("gr-r").value.trim(); if(!r)return; var cf=+el("gr-c").value||3;
  S.gram.push({id:"g"+Date.now(),regra:r,ex:el("gr-e").value.trim(),erro:el("gr-x").value.trim(),
   conf:cf,lang:el("gr-l").value,next:maisDias(cf<=2?1:(cf===3?4:(cf===4?10:21)))});
  pinta();});
 lig("b-addrc",function(){ var n2=el("rc-n").value.trim(); if(!n2)return;
  S.rec.push({id:"r"+Date.now(),nome:n2,tipo:el("rc-t").value,lang:el("rc-l").value,prog:+el("rc-p").value||0,min:0}); pinta();});
 lig("b-addcv",function(){ var L=el("cv-l").value; if(!L)return;
  S.conv.push({id:"c"+Date.now(),data:el("cv-d").value||hoje(),tipo:el("cv-t").value,lang:L,
   corr:el("cv-c").value.trim(),frases:el("cv-f").value.trim(),conf:+el("cv-k").value||3});
  move(-6,8,"Conversação em "+esc(langNome(L))+": correções recebidas e frases novas registradas.",false,0,2,0);});
 lig("b-addts",function(){ var n2=el("ts-n").value.trim(), L=el("ts-l").value; if(!n2)return;
  var pct=+el("ts-p").value||0;
  S.test.push({id:"t"+Date.now(),data:el("ts-d").value||hoje(),nome:n2,lang:L,pct:pct,res:el("ts-r").value});
  for(var k=0;k<S.langs.length;k++) if(S.langs[k].id===L && pct>(S.langs[k].melhor||0)) S.langs[k].melhor=pct;
  move(-4,10,"Teste lançado: "+esc(n2)+" — "+pct+"% de acerto.",false,0,2,0);});
 lig("b-addsm",function(){ var c=el("sm-c").value.trim(), d=el("sm-d").value.trim(), f=el("sm-f").value.trim();
  if(!c&&!d&&!f)return; S.sem.push({id:"w"+Date.now(),data:hoje(),conq:c,dif:d,foco:f});
  move(0,5,"Semana fechada: conquistas, dificuldades e próximo foco registrados.",false,-5,0,0);});
 rmv("data-rl",S.langs); rmv("data-rs",S.sess); rmv("data-rv",S.voc); rmv("data-rg",S.gram);
 rmv("data-rr",S.rec); rmv("data-rc",S.conv); rmv("data-rt",S.test); rmv("data-rw",S.sem);
}
function lig(id,fn){ var b=el(id); if(b) b.addEventListener("click",fn); }
function rmv(attr,arr){ var n=document.querySelectorAll("["+attr+"]");
 for(var i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  arr.splice(+this.getAttribute(attr),1); vcAtual=null; pinta(); }); }

var EF={recarrega:["#3d9bff","restitui"],neutro:["#8a90b5","neutro"],drena:["#ff4d5e","drena"]};
var FAIXA=[[18000,"Mestre"],[6000,"Proficiente"],[1800,"Competente"],[600,"Praticante"],[120,"Aprendiz"],[0,"Iniciado"]];
function faixa(m){ for(var i=0;i<FAIXA.length;i++) if(m>=FAIXA[i][0]) return [FAIXA[i][1], i===0?null:FAIXA[i-1][0], FAIXA[i][0]]; return ["Iniciado",120,0]; }
var aptF="todas";
function aptSt(A){ return A.st==="quero"?"quero":"treino"; }
function pintaApt(){
 var h="",i,nT=0,nQ=0;
 for(i=0;i<S.apt.length;i++){ if(aptSt(S.apt[i])==="quero") nQ++; else nT++; }
 var F=[["todas","Todas",nT+nQ],["treino","Em treino",nT],["quero","Pretendidas",nQ]];
 h=""; for(i=0;i<F.length;i++) h+='<button data-af="'+F[i][0]+'" class="'+(aptF===F[i][0]?"at":"")+'">'+F[i][1]+'<i>'+F[i][2]+'</i></button>';
 el("ap-f").innerHTML=h;
 var tot=0; for(i=0;i<S.apt.length;i++) tot+=S.apt[i].min|0;
 el("ap-tot").innerHTML="<b>"+(tot/60).toFixed(1)+"</b> h acumuladas no conjunto";
 h="";
 for(i=0;i<S.apt.length;i++){ var A=S.apt[i], st=aptSt(A);
  if(aptF!=="todas"&&aptF!==st) continue;
  var m=A.min|0, FX=faixa(m), pc=FX[1]?Math.min(100,Math.round((m-FX[2])/(FX[1]-FX[2])*100)):100;
  h+='<div class="apl'+(st==="quero"?" q":"")+'">'+
   '<div class="aph">'+(A.img?'<img src="'+A.img+'" alt="">':'<span>+</span>')+
    '<label><input type="file" accept="image/*" data-im="'+i+'"></label></div>'+
   '<div class="apc">'+
    '<div class="apt1"><b>'+esc(A.nome)+'</b><span class="apcat">'+esc(A.cat)+'</span>'+
     (st==="quero"?'<span class="apq">pretendida</span>':'<span class="apfx">'+FX[0]+'</span>')+'</div>'+
    '<div class="apm">'+(A.marco?esc(A.marco):"sem marco definido")+'</div>'+
    (st==="quero"?'':'<div class="apb"><i style="width:'+pc+'%"></i></div>')+
   '</div>'+
   '<div class="apr">'+
    (st==="quero"
      ? '<button class="apgo" data-aq="'+i+'">come&ccedil;ar</button>'
      : '<span class="aph2">'+(m/60).toFixed(1)+'h</span>'+
        '<button data-ap="'+i+'|15">+15</button><button data-ap="'+i+'|30">+30</button><button data-ap="'+i+'|60">+60</button>')+
    '<button class="apx" data-ra="'+i+'" aria-label="remover">\u2715</button>'+
   '</div></div>';
 }
 el("apt").innerHTML=h||'<div class="cvaz">nada nesta lista</div>';
 var n=document.querySelectorAll("[data-af]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ aptF=this.getAttribute("data-af"); pinta(); });
 n=document.querySelectorAll("[data-aq]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var A2=S.apt[+this.getAttribute("data-aq")]; A2.st="treino";
  move(0,2,"Aptid\u00e3o promovida a treino: "+esc(A2.nome)+".",false,0,0,0); });
 lig("b-addap",function(){ addApt("treino"); });
 lig("b-addq",function(){ addApt("quero"); });
 n=document.querySelectorAll("[data-ap]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var q=this.getAttribute("data-ap").split("|"), A3=S.apt[+q[0]], mi=+q[1];
  A3.min=(A3.min|0)+mi; A3.st="treino";
  var corpo=(A3.cat==="corpo"||A3.cat==="instrumento"), primeira=(S.ultAter!==hoje());
  if(corpo&&primeira){ S.ultAter=hoje();
   move(12,Math.round(mi/5),"Treino de "+esc(A3.nome)+", "+mi+" min. M\u00e3os e repeti\u00e7\u00e3o \u2014 vale como aterramento.",false,-6,0,0); }
  else move(-Math.max(1,Math.round(mi/10)),Math.round(mi/5),"Treino de "+esc(A3.nome)+", "+mi+" min.",false,0,0,0);
 });
 var fi=document.querySelectorAll("[data-im]");
 for(i=0;i<fi.length;i++) fi[i].addEventListener("change",function(){
  var k=+this.getAttribute("data-im"), f=this.files&&this.files[0]; if(!f) return;
  importar(f,300,function(d){ S.apt[k].img=d; pinta(); }); });
 rmv("data-ra",S.apt);
}
function addApt(st){ var v=el("ap-n").value.trim(); if(!v)return;
 S.apt.push({id:"a"+Date.now(),nome:v,cat:el("ap-c").value,min:0,marco:el("ap-m").value.trim(),st:st,img:null});
 el("ap-n").value=""; el("ap-m").value="";
 anota((st==="quero"?"Aptid\u00e3o pretendida registrada: ":"Aptid\u00e3o em treino registrada: ")+esc(v)+".",0,false);
 pinta();
}
function pintaMC(){
 if(!el("orb")) return;
 var R=S.rel,i,n=R.length,W=600,H=380,cx=300,cy=190;
 var sv='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" aria-label="Mapa de campo">';
 for(i=1;i<=5;i++) sv+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(165-(i-1)*28)+'" fill="none" stroke="#1c1c22" stroke-width="1" stroke-dasharray="2 6"/>';
 sv+='<circle cx="'+cx+'" cy="'+cy+'" r="21" style="fill:var(--well);stroke:var(--red)" stroke-width="1.6"/>';
 sv+='<text x="'+cx+'" y="'+(cy+4)+'" style="fill:var(--red)" font-family="IBM Plex Mono,monospace" font-size="10" letter-spacing="1.5" text-anchor="middle">V</text>';
 for(i=0;i<n;i++){
  var p2=R[i], ang=(i*(2*Math.PI/Math.max(n,1)))-Math.PI/2,
      r=165-((p2.conf|0)-1)*28, x=cx+Math.cos(ang)*r, y=cy+Math.sin(ang)*r,
      col=(EF[p2.ef]||EF.neutro)[0], dir=Math.cos(ang)>=0?1:-1;
  sv+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="'+col+'" stroke-width="1" opacity=".3"/>';
  sv+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="6" fill="'+col+'"/>';
  sv+='<text x="'+(x+dir*12).toFixed(1)+'" y="'+(y+4).toFixed(1)+'" fill="#c6c4bf" font-family="IBM Plex Mono,monospace" font-size="11" text-anchor="'+(dir>0?"start":"end")+'">'+esc(p2.nome).slice(0,16)+'</text>';
 }
 if(!n) sv+='<text x="'+cx+'" y="'+(cy+54)+'" fill="#34343d" font-family="IBM Plex Mono,monospace" font-size="11" letter-spacing="2" text-anchor="middle">CAMPO VAZIO</text>';
 el("orb").innerHTML=sv+'</svg>';
 var h="";
 if(!n) h='<div class="vz2">ningu&eacute;m mapeado</div>';
 else{ h='<div class="tbw"><table class="tb"><thead><tr><th>Pessoa</th><th>V&iacute;nculo</th><th>Leitura</th><th></th><th></th></tr></thead><tbody>';
  for(i=0;i<n;i++){ var q=R[i], E=EF[q.ef]||EF.neutro;
   h+='<tr><td>'+esc(q.nome)+'<br><span class="mn">confian&ccedil;a '+(q.conf|0)+'/5 &middot; <span style="color:'+E[0]+'">'+E[1]+'</span></span></td>'+
      '<td class="mn">'+esc(q.vinc)+'</td><td style="color:var(--dim)">'+esc(q.leitura||"\u2014")+'</td>'+
      '<td><button data-ct="'+i+'" style="border:1px solid var(--line2);padding:4px 8px;font-family:var(--mono);font-size:9px;letter-spacing:.12em">CONTATO</button></td>'+
      '<td><button data-rz="'+i+'">\u2715</button></td></tr>'; }
  h+='</tbody></table></div>'; }
 if(el("rl-tb")) el("rl-tb").innerHTML=h;
 lig("b-addrl",function(){ var v=el("rl-n").value.trim(); if(!v)return;
  S.rel.push({id:"p"+Date.now(),nome:v,vinc:el("rl-v").value,conf:+el("rl-c").value||3,
   ef:el("rl-e").value,leitura:el("rl-l").value.trim()});
  el("rl-n").value=""; el("rl-l").value=""; pinta();});
 var b=document.querySelectorAll("[data-ct]");
 for(i=0;i<b.length;i++) b[i].addEventListener("click",function(){
  var q=S.rel[+this.getAttribute("data-ct")]; S.ultCont=hoje();
  if(q.ef==="recarrega"){ if(S.usos.rede>=2){ el("msg").textContent="convoca&ccedil;&otilde;es do ciclo esgotadas"; return; }
   S.usos.rede++; move(22,2,"Convoca&ccedil;&atilde;o de Rede \u2014 "+esc(q.nome)+". Problema dito em voz alta; fa&iacute;sca restitu&iacute;da.",false,-15,0,0); }
  else if(q.ef==="drena"){ move(-5,0,"Contato com "+esc(q.nome)+". O radar absorveu o que n&atilde;o foi declarado.",true,10,0,0); }
  else move(-2,0,"Contato com "+esc(q.nome)+".",false,3,0,0);
 });
 rmv("data-rz",S.rel);
}
function pintaDr(){
 var h="",i,D=S.drenos;
 for(i=0;i<D.length;i++){ var d=D[i], ult=d.hist&&d.hist.length?d.hist[d.hist.length-1]:null,
  sem=0, j, dias=ult?(hojeN()-diaN(ult)):null;
  if(d.hist) for(j=0;j<d.hist.length;j++) if(hojeN()-diaN(d.hist[j])<7) sem++;
  h+='<div class="lin"><span class="nm2">'+esc(d.nome)+'<small>&minus;'+(d.carga|0)+' carga &middot; +'+(d.sat|0)+' sat &middot; '+sem+'&times; nos 7 dias</small></span>';
  h+='<span class="lim'+(dias===0?" zero":"")+'">'+(dias===null?"\u2014":dias)+'<small>dias sem</small></span>';
  h+='<button data-dr="'+i+'"><strong>ocorreu</strong></button>';
  h+='<button class="x2" data-rd="'+i+'">\u2715</button></div>';
 }
 el("dr-lista").innerHTML=h||'<div class="vz3">nenhum dreno mapeado</div>';
 lig("b-adddr",function(){ var v=el("dr-n").value.trim(); if(!v)return;
  S.drenos.push({id:"d"+Date.now(),nome:v,carga:+el("dr-c").value||0,sat:+el("dr-s").value||0,hist:[]});
  el("dr-n").value=""; pinta();});
 var b=document.querySelectorAll("[data-dr]");
 for(i=0;i<b.length;i++) b[i].addEventListener("click",function(){
  var d=S.drenos[+this.getAttribute("data-dr")];
  d.hist=(d.hist||[]).concat(hoje()); if(d.hist.length>120) d.hist=d.hist.slice(-120);
  move(-(d.carga|0),0,"Dreno: "+esc(d.nome)+". Carga foi embora sem entregar nada.",true,(d.sat|0),0,0);
 });
 rmv("data-rd",S.drenos);
}
function pintaEco(){
 el("eco-r").textContent=S.eco.r; el("eco-c").textContent=S.eco.c;
 el("eco-q").innerHTML=ecoFala();
}
function dias7(arr){ var n=0,i; if(!arr) return 0;
 for(i=0;i<arr.length;i++) if(hojeN()-diaN(arr[i])<7) n++; return n; }
function desde(d){ var base=d||S.inicio||hoje(); return Math.max(0, hojeN()-diaN(base)); }
function orbita(){ return Math.min(100, desde(S.ultAter)*14 + desde(S.ultCont)*8); }
function impulso(){
 var d=0,i; for(i=0;i<S.drenos.length;i++) d+=dias7(S.drenos[i].hist);
 return Math.min(100, d*11 + S.falsos*18 + dias7(S.aguaH)*9);
}
var ANT={
 desc:["Descarga Controlada","Nomear por escrito o que foi absorvido. A fun\u00e7\u00e3o que o mapa bloqueou, feita \u00e0 m\u00e3o.","b-desc"],
 ater:["Aterramento","Corpo, comida, sono ou organiza\u00e7\u00e3o do espa\u00e7o f\u00edsico. Recarga no terreno hostil.","b-ater"],
 lamina:["Puxar l\u00e2mina","Sem alvo definido, o baralho define por voc\u00ea. Tr\u00eas passos prontos, zero decis\u00e3o.","#lamina"],
 rede:["Convoca\u00e7\u00e3o de Rede","Dizer em voz alta para algu\u00e9m. \u00c9 a \u00fanica rota que atravessa a blindagem.","b-rede"],
 decl:["Declarar","Dizer o porqu\u00ea antes de agir. O freio que o mapa n\u00e3o deu, posto do lado de fora.","b-decl"]
};
function pintaDiag(){
 var V=[
  {t:"Retroalimenta&ccedil;&atilde;o ps&iacute;quica",src:"Lua em conjun&ccedil;&atilde;o com Marte &middot; Lua em quadratura com Netuno",v:S.sat,
   d:"A empatia de campo n&atilde;o desliga. O ru&iacute;do do ambiente acumula at&eacute; a descarga involunt&aacute;ria.",a:"desc"},
  {t:"Fragilidade som&aacute;tica",src:"Bloqueio de Terra &middot; Meio do C&eacute;u em Capric&oacute;rnio",v:100-S.carga,
   d:"Sem resist&ecirc;ncia e sem cura. A recarga depende de mat&eacute;ria &mdash; o &uacute;nico terreno sem poder algum.",a:"ater"},
  {t:"Queima seca acumulada",src:"Marte em quadratura com Netuno &middot; bloqueio de Terra",v:Math.min(100,S.falsos*34),
   d:"Corrente despejada sem alvo definido. A energia sai difusa, n&atilde;o encontra onde descarregar e se perde inteira no caminho.",a:"lamina"},
  {t:"&Oacute;rbita sem pouso",src:"Ac&uacute;mulo de Fogo e Ar &middot; bloqueio de Terra &middot; Sol e Merc&uacute;rio na Casa 9",v:orbita(),
   d:"Sobe para o mundo das ideias e n&atilde;o desce. Esquece o corpo, esquece quem est&aacute; esperando, e por fim esquece de si.",a:"rede"},
  {t:"Impulso sem freio",src:"Ascendente em &Aacute;ries &middot; Lua em conjun&ccedil;&atilde;o com Marte &middot; bloqueio de Terra",v:impulso(),
   d:"Age antes de a decis&atilde;o terminar de se formar. Falta o elemento que cont&eacute;m \u2014 n&atilde;o h&aacute; freio interno, s&oacute; gasto j&aacute; consumado.",a:"decl"}
 ];
 var h="";
 for(var i=0;i<V.length;i++){ var x=V[i], cl=x.v>=60?"c":(x.v>=35?"w":"ok");
  var rot=cl==="c"?"cr&iacute;tico":(cl==="w"?"elevado":"nominal");
  h+='<div class="dg"><span class="ix">[0'+(i+1)+']</span><span class="t">'+x.t+'</span>';
  h+='<span class="src">'+x.src+'</span>';
  h+='<div class="bar"><i class="'+(cl==="ok"?"":cl)+'" style="width:'+Math.round(x.v)+'%"></i></div>';
  h+='<div class="rd"><span class="st2 '+cl+'">'+rot+'</span><span class="vl">'+Math.round(x.v)+' / 100</span></div>';
  h+='<p class="d">'+x.d+'</p>';
  var A=ANT[x.a];
  if(A){ var alvo=A[2].charAt(0)==="#"?null:el(A[2]), inap=alvo?alvo.disabled:false;
   h+='<div class="ant"><span class="k2">ant&iacute;doto</span><span class="t2">'+A[1]+'</span>'+
      '<button data-ant="'+x.a+'"'+(inap?" disabled":"")+'><strong>'+(inap?"indispon&iacute;vel no ciclo":A[0])+'</strong></button></div>'; }
  h+='</div>';
 }
 el("diag").innerHTML=h;
 var n=document.querySelectorAll("[data-ant]");
 for(var k=0;k<n.length;k++) n[k].addEventListener("click",function(){
  var a=ANT[this.getAttribute("data-ant")];
  if(a[2]==="#lamina"){ var m=document.querySelector(".mesa");
   if(m) m.scrollIntoView({block:"center",behavior:"smooth"}); puxar(); return; }
  var b2=el(a[2]); if(b2&&!b2.disabled) b2.click();
 });
}
function pintaDE(){
 var i,min=0,dom=0;
 for(i=0;i<S.sess.length;i++) min+=S.sess[i].min|0;
 for(i=0;i<S.voc.length;i++) if((S.voc[i].lvl|0)>=5) dom++;
 var D=venc().length, L=S.langs.length;
 el("de-pw").innerHTML=
  '<span class="n">Sistemas em decodifica&ccedil;&atilde;o<small>idiomas registrados</small></span><span class="s '+(L?"on":"off")+'">'+L+'</span>'+
  '<span class="n">Horas absorvidas<small>soma das sess&otilde;es</small></span><span class="s on">'+(min>=60?(min/60).toFixed(1)+" h":min+" min")+'</span>'+
  '<span class="n">Estruturas retidas<small>termos em dom&iacute;nio</small></span><span class="s on">'+dom+'</span>'+
  '<span class="n">Vencidas hoje<small>exigem revis&atilde;o, energia baixa</small></span><span class="s '+(D?"off":"on")+'">'+D+'</span>';
 lig("b-abrelp",function(){ var h2=el("h-lp"); if(h2) h2.scrollIntoView({block:"start",behavior:"smooth"}); });
}
function vooEst(){
 var LC=limComb(), g=S.gasto|0, emp=S.carga>=LIMIAR, leme=(S.ign.decl===hoje()), casco=(g<LC*0.66);
 var n=(emp?1:0)+(leme?1:0)+(casco?1:0);
 if(emp&&leme&&casco) return {k:"voo",n:"EM VOO",d:"empuxo, leme e casco de p\u00e9. \u00c9 agora que o deslocamento sai barato.",c:"on",q:n};
 if(emp&&leme) return {k:"reent",n:"REENTRADA",d:"ainda em linha, mas a queima do ciclo passou de dois ter\u00e7os. Pousar vale mais que insistir.",c:"off",q:n};
 if(emp&&casco) return {k:"imp",n:"IMPULSO SEM LEME",d:"carga de sobra e nenhuma rota declarada. Combust\u00e3o sem deslocamento.",c:"off",q:n};
 if(leme&&casco) return {k:"solo",n:"EM SOLO \u00b7 ROTA POSTA",d:"a dire\u00e7\u00e3o existe, falta corrente. Recarregue antes de tentar subir.",c:"off",q:n};
 return {k:"solo",n:"EM SOLO",d:"sem empuxo e sem leme. For\u00e7ar daqui \u00e9 queima seca.",c:"off",q:n};
}
function pintaVoo(){
 var LC=limComb(), g=S.gasto|0, V=vooEst(), leme=(S.ign.decl===hoje());
 el("vo-pw").innerHTML=
  '<span class="n">Empuxo<small>carga no ponto de igni\u00e7\u00e3o</small></span><span class="s '+(S.carga>=LIMIAR?"on":"off")+'">'+(S.carga>=LIMIAR?"sim":"n\u00e3o")+'</span>'+
  '<span class="n">Leme<small>rota declarada no ciclo</small></span><span class="s '+(leme?"on":"off")+'">'+(leme?"sim":"n\u00e3o")+'</span>'+
  '<span class="n">Casco<small>proje\u00e7\u00e3o abaixo de dois ter\u00e7os</small></span><span class="s '+(g<LC*0.66?"on":"off")+'">'+(g<LC*0.66?"sim":"n\u00e3o")+'</span>';
 el("vo-st").innerHTML='<b class="'+V.c+'">'+V.n+'</b><span>'+V.d+'</span><i>'+V.q+' de 3 condi\u00e7\u00f5es</i>';
}
function pintaCam(){
 var ok=(S.sat>=40), feito=(S.usos.trav>=1), carga=(S.carga>=10);
 el("cm-pw").innerHTML=
  '<span class="n">Satura\u00e7\u00e3o<small>abaixo de 40 n\u00e3o h\u00e1 o que atravessar</small></span><span class="s '+(ok?"on":"off")+'">'+S.sat+'</span>'+
  '<span class="n">Travessia do ciclo<small>uma por ciclo</small></span><span class="s '+(feito?"off":"on")+'">'+(feito?"usada":"dispon\u00edvel")+'</span>';
 var b=el("b-trav"); if(b) b.disabled=!ok||feito||!carga;
}
function discNome(id){ var i,D=S.est.disc; for(i=0;i<D.length;i++) if(D[i].id===id) return D[i].nome; return "\u2014"; }
function ordemCiclo(){
 var D=S.est.disc.slice().sort(function(a,b){ return (b.peso-a.peso)||(a.nome<b.nome?-1:1); });
 var o=[],i,k;
 for(i=0;i<D.length;i++) for(k=0;k<Math.max(1,Math.round(D[i].peso/2)); k++) o.push(D[i].id);
 return o;
}
function blocoAtual(){ var o=ordemCiclo(); if(!o.length) return null; return o[S.est.at%o.length]; }
function pintaCiclo(){
 var E=S.est, o=ordemCiclo(), i,h="";
 for(i=0;i<o.length;i++) h+='<button data-ci="'+i+'" class="'+(i===(E.at%(o.length||1))?"at":(i<(E.at%(o.length||1))?"feito":""))+'">'+
  '<span>'+String(i+1).padStart(2,"0")+'</span><b>'+esc(discNome(o[i]))+'</b></button>';
 el("ci-roda").innerHTML=h||'<div class="cvaz">inclua disciplinas para montar a roda</div>';
 var at=blocoAtual();
 el("ci-at").innerHTML=at?('<span class="k9">Bloco em curso &middot; volta '+E.volta+'</span><b>'+esc(discNome(at))+'</b>'+
  '<i>'+(o.length-(E.at%o.length))+' blocos at\u00e9 fechar a volta</i>')
  :'<span class="k9">Roda vazia</span><b>\u2014</b><i>sem disciplina registrada</i>';
 el("b-ci-and").disabled=!at; el("b-ci-pula").disabled=!at;
 h="";
 var D=E.disc.slice().sort(function(a,b){ return (b.peso-a.peso)||(a.nome<b.nome?-1:1); });
 var tot=0; for(i=0;i<D.length;i++) tot+=(D[i].min|0);
 for(i=0;i<D.length;i++){ var pc=tot?Math.round((D[i].min|0)/tot*100):0;
  h+='<div class="dli"><span class="dp">'+D[i].peso+'</span><b>'+esc(D[i].nome)+'</b>'+
     '<div class="dbar"><i style="width:'+pc+'%"></i></div>'+
     '<span class="dmin">'+Math.round((D[i].min|0)/60*10)/10+'h</span>'+
     '<button data-dx="'+D[i].id+'" aria-label="remover">\u2715</button></div>'; }
 el("ci-d").innerHTML=h||'<div class="cvaz">nenhuma disciplina</div>';
 var sel=el("mp-d"), v=sel.value; h="";
 for(i=0;i<D.length;i++) h+='<option value="'+D[i].id+'">'+esc(D[i].nome)+'</option>';
 sel.innerHTML=h||'<option value="">sem disciplina</option>'; if(v) sel.value=v;
 var n=document.querySelectorAll("[data-dx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-dx");
  S.est.disc=S.est.disc.filter(function(x){return x.id!==id;}); pinta(); });
 n=document.querySelectorAll("[data-ci]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  S.est.at=+this.getAttribute("data-ci"); pinta(); });
 lig("b-ci-add",function(){ var v2=el("ci-dn").value.trim(); if(!v2)return;
  S.est.disc.push({id:"d"+Date.now(),nome:v2,peso:+el("ci-dp").value||3,min:0});
  el("ci-dn").value=""; anota("Disciplina inclu\u00edda no ciclo: "+esc(v2)+".",0,false); pinta(); });
 lig("b-ci-pula",function(){ var o2=ordemCiclo(); if(!o2.length)return;
  S.est.at++; if(S.est.at%o2.length===0) S.est.volta++;
  anota("Bloco pulado. A ordem n\u00e3o espera.",0,false); pinta(); });
 lig("b-ci-and",function(){ ciForm=!ciForm; pinta(); });
 pintaCiForm();
}
var ciForm=false;
function pintaCiForm(){
 if(!ciForm||!blocoAtual()){ el("ci-form").innerHTML=""; el("ci-form").className="creg"; return; }
 var pm2=(typeof PM!=="undefined"&&PM&&PM.min)?Math.max(0,Math.round(PM.min-(PM.rest||0)/60)):50;
 el("ci-form").className="creg on";
 el("ci-form").innerHTML=
  '<span class="k5">Fechar bloco &middot; '+esc(discNome(blocoAtual()))+'</span>'+
  '<div class="cgrid">'+
  '<label>minutos<input id="cf-m" type="number" min="5" max="400" step="5" value="50"></label>'+
  '<label>plataforma / meio<input id="cf-p" maxlength="40" placeholder="livro, v\u00eddeo, PDF, questões"></label>'+
  '<label class="w2">t\u00f3picos abordados<input id="cf-t" maxlength="120" placeholder="o que entrou neste bloco"></label>'+
  '<label class="w2">como estudou<input id="cf-c" maxlength="120" placeholder="leitura, resumo, mapa, exerc\u00edcio"></label>'+
  '<label class="w2">quest\u00f5es importantes do t\u00f3pico<input id="cf-q" maxlength="140" placeholder="o que caiu, o que errou, o que confunde"></label>'+
  '<label class="w2">pr\u00f3xima vez neste bloco<input id="cf-x" maxlength="140" placeholder="de onde retomar \u2014 escreva para n\u00e3o precisar lembrar"></label>'+
  '</div>'+
  '<div class="cbt2"><button id="b-cf-ok" class="key"><strong>Registrar e avan\u00e7ar</strong><span class="cost">custo pela dura\u00e7\u00e3o &middot; +dom\u00ednio</span></button>'+
  '<button id="b-cf-x"><strong>Cancelar</strong></button></div>';
 lig("b-cf-x",function(){ ciForm=false; pinta(); });
 lig("b-cf-ok",function(){
  var at=blocoAtual(), m=+el("cf-m").value||0; if(!at||m<=0)return;
  var M=pm(), cst=Math.max(1,Math.round(Math.max(2,Math.round(m/6))*M.sess));
  var i,D=S.est.disc; for(i=0;i<D.length;i++) if(D[i].id===at) D[i].min=(D[i].min|0)+m;
  S.est.blocos.unshift({id:"b"+Date.now(),data:hoje(),h:hora(),disc:at,min:m,
   plat:el("cf-p").value.trim(),top:el("cf-t").value.trim(),como:el("cf-c").value.trim(),
   quest:el("cf-q").value.trim(),prox:el("cf-x").value.trim(),volta:S.est.volta});
  if(S.est.blocos.length>60) S.est.blocos.length=60;
  var o=ordemCiclo(); S.est.at++; if(S.est.at%o.length===0) S.est.volta++;
  ciForm=false;
  move(-cst,Math.round(m/4),"Bloco fechado \u2014 "+esc(discNome(at))+": "+m+" min."+
   (el("cf-x").value.trim()?" Retomada escrita.":" Sem retomada escrita."),false,M.satSess,1,0); });
}
function pintaBlocos(){
 var B=S.est.blocos,i,h="";
 el("ci-n").textContent=B.length;
 for(i=0;i<Math.min(B.length,8);i++){ var b=B[i];
  h+='<div class="cb"><div class="cbt3"><b>'+esc(discNome(b.disc))+'</b>'+
   '<span>'+b.data.slice(8)+"."+b.data.slice(5,7)+' &middot; '+b.min+' min &middot; volta '+(b.volta||1)+
   (b.plat?' &middot; '+esc(b.plat):'')+'</span>'+
   '<button data-bx="'+b.id+'" aria-label="remover">\u2715</button></div>'+
   (b.top?'<p><i>t\u00f3picos</i>'+esc(b.top)+'</p>':'')+
   (b.como?'<p><i>como</i>'+esc(b.como)+'</p>':'')+
   (b.quest?'<p><i>quest\u00f5es</i>'+esc(b.quest)+'</p>':'')+
   (b.prox?'<p class="prx"><i>pr\u00f3xima vez</i>'+esc(b.prox)+'</p>':'')+'</div>'; }
 el("ci-l").innerHTML=h||'<div class="cvaz">nenhum bloco fechado ainda</div>';
 var n=document.querySelectorAll("[data-bx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-bx");
  S.est.blocos=S.est.blocos.filter(function(x){return x.id!==id;}); pinta(); });
}
function pintaMapas(){
 var M=S.est.mapas,i,h="",hj=0;
 for(i=0;i<M.length;i++) if(!M[i].next||diaN(M[i].next)<=hojeN()) hj++;
 el("mp-h").textContent=hj; el("mp-t").textContent=M.length+(M.length===1?" mapa no ciclo":" mapas no ciclo");
 var ord=M.slice().sort(function(a,b){ return (a.next||"0")<(b.next||"0")?-1:1; });
 for(i=0;i<ord.length;i++){ var m=ord[i], due=!m.next||diaN(m.next)<=hojeN(), e=etapa(m.lvl|0);
  h+='<div class="mp'+(due?" due":"")+'"><div class="mpl"><b>'+esc(m.nome)+'</b>'+
   '<span>'+esc(discNome(m.disc))+' &middot; '+ETAPA[e][0]+' &middot; '+
   (due?"vence hoje":("volta em "+(diaN(m.next)-hojeN())+"d"))+'</span></div>'+
   '<div class="mpr"><button class="ok5" data-mo="'+m.id+'">revisado</button>'+
   '<button class="ng5" data-mf="'+m.id+'">falhou</button>'+
   '<button data-mx="'+m.id+'" aria-label="remover">\u2715</button></div></div>'; }
 el("mp-l").innerHTML=h||'<div class="cvaz">nenhum mapa no ciclo de revis\u00e3o</div>';
 var n=document.querySelectorAll("[data-mo]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-mo"),k;
  for(k=0;k<S.est.mapas.length;k++) if(S.est.mapas[k].id===id){ var m2=S.est.mapas[k];
   m2.lvl=Math.min(INT.length-1,(m2.lvl|0)+1); m2.next=maisDias(INT[m2.lvl]); m2.ult=hoje();
   move(-2,4,"Mapa revisado \u2014 "+esc(m2.nome)+": volta em "+INT[m2.lvl]+" dias.",false,-2,1,0); return; } });
 n=document.querySelectorAll("[data-mf]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-mf"),k;
  for(k=0;k<S.est.mapas.length;k++) if(S.est.mapas[k].id===id){ var m3=S.est.mapas[k];
   m3.lvl=0; m3.next=maisDias(1); m3.ult=hoje();
   move(-1,1,"Mapa falhou na revis\u00e3o \u2014 "+esc(m3.nome)+": volta amanh\u00e3. Falha registrada vale mais que revis\u00e3o fingida.",false,0,0,0); return; } });
 n=document.querySelectorAll("[data-mx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-mx");
  S.est.mapas=S.est.mapas.filter(function(x){return x.id!==id;}); pinta(); });
 var u=el("mp-u"); if(document.activeElement!==u) u.value=S.est.vis||"";
 var av=el("mp-a"), ok=/^https?:\/\//i.test(S.est.vis||"");
 av.style.display=ok?"inline-block":"none"; if(ok) av.href=S.est.vis;
 lig("b-mpu",function(){ var t=el("mp-u").value.trim();
  if(t&&!/^https?:\/\//i.test(t)){ el("msg").textContent="o link precisa come\u00e7ar com https://"; return; }
  S.est.vis=t; grava(); pinta(); });
 lig("b-mp",function(){ var v=el("mp-n").value.trim(); if(!v)return;
  S.est.mapas.push({id:"m"+Date.now(),nome:v,disc:el("mp-d").value,lvl:0,next:hoje(),ult:null});
  el("mp-n").value=""; anota("Mapa inclu\u00eddo no ciclo de revis\u00e3o: "+esc(v)+".",0,false); pinta(); });
}
function rotaKr(){
 var hoje7=0,i,K=S.kr;
 for(i=0;i<(K.exp||[]).length;i++) if(K.exp[i].d===hoje()) hoje7++;
 if(S.carga<LIMIAR) return {k:"r2",n:"Rota 2 \u00b7 Baralho de Varredura",
  d:"Carga sob o ponto de igni\u00e7\u00e3o. A l\u00e2mina atravessa porque n\u00e3o aciona a muta\u00e7\u00e3o: tr\u00eas passos prontos, nenhuma decis\u00e3o.",a:"h-deck",b:"#lamina",n2:hoje7};
 if(S.sat>=60||desde(S.ultCont)>=2) return {k:"r3",n:"Rota 3 \u00b7 Convoca\u00e7\u00e3o de Rede",
  d:"Antena saturada ou isolamento de dois ciclos. Voltagem emprestada de outra pessoa custa menos que insistir sozinho.",a:"h-ctn",b:"b-rede",n2:hoje7};
 if(S.ign.decl!==hoje()) return {k:"r1",n:"Rota 1 \u00b7 Dopar a tarefa",
  d:"Em linha e sem rota declarada. Diga o porqu\u00ea antes de come\u00e7ar \u2014 prop\u00f3sito real, n\u00e3o inventado.",a:"h-rota",b:"b-decl",n2:hoje7};
 return {k:"r2",n:"Rota 2 \u00b7 Baralho de Varredura",
  d:"Rota j\u00e1 declarada neste ciclo e corrente em p\u00e9. Para a pilha mec\u00e2nica, mesmo assim, l\u00e2mina: ela n\u00e3o gasta poder.",a:"h-deck",b:"#lamina",n2:hoje7};
}
function pintaKr(){
 var K=S.kr=S.kr||{exp:[],r1:0,r2:0,r3:0}, R=rotaKr(), tot=(K.r1|0)+(K.r2|0)+(K.r3|0);
 el("kr-t").innerHTML='<div class="kr1"><span class="k9">Rota indicada agora</span><b>'+R.n+'</b><span class="krd">'+R.d+'</span></div>'+
  '<div class="kr2">'+
   '<div><span>'+(K.r1|0)+'</span><i>dopar</i></div>'+
   '<div><span>'+(K.r2|0)+'</span><i>l\u00e2mina</i></div>'+
   '<div><span>'+(K.r3|0)+'</span><i>rede</i></div>'+
  '</div>';
 el("kr-n").innerHTML=tot?("exposi\u00e7\u00f5es registradas: <b>"+tot+"</b> &middot; hoje: <b>"+R.n2+"</b>")
  :"nenhuma exposi\u00e7\u00e3o registrada ainda";
 lig("b-kr",function(){
  var R2=rotaKr();
  S.kr.exp=(S.kr.exp||[]).concat({d:hoje(),h:hora(),r:R2.k});
  if(S.kr.exp.length>120) S.kr.exp=S.kr.exp.slice(-120);
  S.kr[R2.k]=(S.kr[R2.k]|0)+1;
  anota("Exposi\u00e7\u00e3o \u00e0 energia errada registrada. "+R2.n+".",0,false);
  var alvo=R2.b;
  if(alvo==="#lamina"){ var m=document.querySelector(".mesa"); if(m) m.scrollIntoView({block:"start",behavior:"smooth"}); }
  else { var bb=el(alvo); if(bb&&!bb.disabled){ bb.click(); return; }
   var t=el(R2.a); if(t) t.scrollIntoView({block:"start",behavior:"smooth"}); }
  pinta(); });
}
var NAVG=[["01","Opera\u00e7\u00e3o","op"],["02","Campanha","camp"],["03","Estudo","est"],["04","Arquivo do mutante","dos"]];
var NAVD={
 "topo":["SUJEITO","designa\u00e7\u00e3o, origem e kit","I"],
 "h-sec":["LINHAS ATIVAS","os tr\u00eas poderes secund\u00e1rios","I"],
 "h-painel":["N\u00daCLEO","carga, dom\u00ednio e as a\u00e7\u00f5es do ciclo","II"],
 "h-deck":["VARREDURA","fichas de tr\u00eas passos","II"],
 "h-dia":["ROTINA","h\u00e1bitos e menu de recarga","II"],
 "h-voo":["ALTITUDE","empuxo, leme e casco agora","II"],
 "h-orb":["\u00d3RBITA","o que est\u00e1 girando agora","II"],
 "h-cup":["C\u00c9REBRO","notas, rascunhos e armazenamento","II"],
 "h-wp":["MARCOS","linha do tempo do per\u00edodo","II"],
 "h-sem":["SEMANA","blocos de tempo do ciclo","II"],
 "h-rast":["GRADE","const\u00e2ncia do m\u00eas","II"],
 "h-ctn":["CONTINENTE","sono, \u00e1gua, movimento, comida","II"],
 "h-proj":["FRENTES","alvos grandes em etapas","II"],
 "h-prov":["PROVAS","metas longas que pagam lastro","II"],
 "h-rec":["PR\u00caMIOS","compra com lastro e patente","II"],
 "h-en":["CORRENTE","substrato: a energia que os outros queimam","I"],

 "h-mc":["CAMPO","o radar de quem drena e quem restitui","III"],
 "h-rota":["ROTA","focos, afirma\u00e7\u00f5es, visualiza\u00e7\u00f5es","III"],
 "h-apt":["OF\u00cdCIOS","aptid\u00f5es em treino e pretendidas","III"],
 "h-lp":["DECODIFICA\u00c7\u00c3O","seis sistemas em estudo","IV"],
 "h-conc":["CONCURSO","painel do TRF3 e edital","IV"],
"h-ciclo":["RODA","ciclo de estudos por peso","IV"],
 "h-mapas":["REVIS\u00c3O","mapas por repeti\u00e7\u00e3o espa\u00e7ada","IV"],
 "h-lim":["LIMITADOR","o hardware e os drenos","V"],
 "h-diag":["DIAGN\u00d3STICO","vetores, arquivo, parecer e vulnerabilidade","V"]
};
var navAb=false, navIt=[];
function montaNav(){
 (function(){var N={op:"01",camp:"02",est:"03",dos:"04"},k;delete NAVD["h-proj"];for(k in NAVD){var a=(k==="topo"||k==="h-sec")?"dos":vxArea(k);NAVD[k][2]=N[a]||"04";}})();
 vxOrganiza();
 var hs=document.querySelectorAll("h2.sec"), i,g,k,n2=0;
 navIt=[{id:"topo",el:document.querySelector(".ident")}];
 var ordem=[{id:"topo",el:document.querySelector(".ident")}];
 for(i=0;i<hs.length;i++){ if(hs[i].id) ordem.push({id:hs[i].id,el:hs[i]}); }
 var fp=el("h-sec"); if(fp) ordem.splice(1,0,{id:"h-sec",el:fp});
 navIt=ordem;
 var h="";
 for(g=0;g<NAVG.length;g++){
  var itens="";
  for(k=0;k<ordem.length;k++){ var D=NAVD[ordem[k].id];
   if(!D||D[2]!==NAVG[g][0]) continue;
   n2++;
   itens+='<button data-nv="'+ordem[k].id+'">'+
    '<span class="nvc">\u03a3\u00b7'+String(n2).padStart(2,"0")+'</span>'+
    '<b>'+D[0]+'</b><i>'+D[1]+'</i></button>';
  }
  if(itens) h+='<div class="nva a-'+NAVG[g][2]+'"><div class="nvg"><span class="nvgt">'+NAVG[g][0]+'</span><span class="nvgn">'+NAVG[g][1]+'</span></div>'+itens+'</div>';
 }
 el("nav-l").innerHTML=h;
 var n=document.querySelectorAll("[data-nv]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var kk=this.getAttribute("data-nv");
  try{ vxShow((kk==="topo"||kk==="h-sec")?"dos":vxArea(kk)); }catch(e){}
  var t2=(kk==="topo")?document.querySelector(".ident"):el(kk);
  if(kk==="h-sec") fpAbre(true);
  if(t2) t2.scrollIntoView({block:"start",behavior:"smooth"});
  navFecha(); });
 lig("b-nav",function(){ navAb?navFecha():navAbre(); });
 lig("b-navx",navFecha);
 el("navbk").addEventListener("click",navFecha);
 document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&navAb) navFecha(); });
 window.addEventListener("scroll",navSpy,{passive:true});
 navSpy();
}
function navAbre(){ navAb=true; el("nav").classList.add("on"); el("navbk").classList.add("on");
 el("b-nav").setAttribute("aria-expanded","true"); }
function navFecha(){ navAb=false; el("nav").classList.remove("on"); el("navbk").classList.remove("on");
 el("b-nav").setAttribute("aria-expanded","false"); }
var navT=0;
function navSpy(){
 var agora=Date.now(); if(agora-navT<180) return; navT=agora;
 var at=navIt.length?navIt[0].id:null,i;
 for(i=0;i<navIt.length;i++){ var e=navIt[i].el; if(!e||!e.getBoundingClientRect) continue;
  if(e.getBoundingClientRect().top<=140) at=navIt[i].id; }
 var n=document.querySelectorAll("[data-nv]");
 for(i=0;i<n.length;i++) n[i].classList.toggle("at", n[i].getAttribute("data-nv")===at);
}
function parecer(){
 var L=[],i,hoy=hoje(),C=contencao();
 var mesa=0,T=todas(); for(i=0;i<T.length;i++) if(!S.fichas[T[i].id]) mesa++;
 var par=0,noc=0,P=S.proj||[];
 for(i=0;i<P.length;i++){ var e=estProj(P[i]); if(e.c==="travado") par++; if(e.c==="nocaute") noc++; }
 var mp=0,M=(S.est&&S.est.mapas)||[];
 for(i=0;i<M.length;i++) if(!M[i].next||diaN(M[i].next)<=hojeN()) mp++;
 var ret=0,R=(S.pc&&S.pc.ret)||[];
 for(i=0;i<R.length;i++) if(desde(R[i].data)>=10) ret++;
 var vc=venc().length, LC=limComb(), g=S.gasto|0, mis=misEstado();
 if(noc) L.push(["projetos em nocaute",noc,"h-proj"]);
 if(par) L.push(["projetos em paralisia",par,"h-proj"]);
 if(ret) L.push(["retomadas paradas h\u00e1 10 dias ou mais",ret,"h-cup"]);
 if(mp) L.push(["mapas vencidos no ciclo de revis\u00e3o",mp,"h-mapas"]);
 if(vc) L.push(["termos vencidos no banco",vc,"h-lp"]);
 if(((S.agua&&S.agua[hoy])||0)<8) L.push(["copos de \u00e1gua abaixo da meta",8-((S.agua&&S.agua[hoy])||0),"h-ctn"]);
 if(((S.sono&&S.sono[hoy])||0)<7) L.push(["horas de sono registradas hoje",((S.sono&&S.sono[hoy])||0)||0,"h-ctn"]);
 if(((S.ativ&&S.ativ[hoy])||0)<20) L.push(["minutos de movimento hoje",((S.ativ&&S.ativ[hoy])||0)||0,"h-ctn"]);
 if(C.v<50) L.push(["\u00edndice de conten\u00e7\u00e3o",C.v,"h-ctn"]);
 if(S.sat>=60) L.push(["satura\u00e7\u00e3o acima da faixa",S.sat,"h-painel"]);
 if(g>=LC*0.66) L.push(["gasto do ciclo contra o limiar "+LC,g,"h-cript"]);
 if(S.falsos) L.push(["queimas secas no registro",S.falsos,"h-painel"]);
 if(mis.n<3) L.push(["diretivas em aberto",3-mis.n,"h-painel"]);
 if(mesa>18) L.push(["fichas ainda na mesa",mesa,"h-deck"]);
 return L;
}
function pintaCal(){
 var P=S.par, h="";
 if(!P||P.d!==hoje()) h='<div class="vvaz">sem parecer neste ciclo</div>';
 else if(!P.l.length) h='<div class="vok">Tudo dentro da especifica\u00e7\u00e3o no momento da leitura \u2014 '+P.h+'.</div>';
 else { var i;
  h='<div class="vlin"><span class="vh2">fora de especifica\u00e7\u00e3o &middot; leitura de '+P.h+'</span>';
  for(i=0;i<P.l.length;i++) h+='<div class="vit"><b>'+P.l[i][1]+'</b><span>'+P.l[i][0]+'</span>'+
   '<button data-ir="'+P.l[i][2]+'">ir</button></div>';
  h+='</div>'; }
 el("cl-p").innerHTML=h;
 lig("b-cal",function(){ S.par={d:hoje(),h:hora(),l:parecer()};
  anota("Parecer t\u00e9cnico emitido: "+S.par.l.length+" item(ns) fora de especifica\u00e7\u00e3o.",0,false); pinta(); });
}
var loreAb=false;
function pintaLore(){
 var e=el("lore"); if(!e) return;
 e.classList.toggle("on",loreAb);
 var b=el("b-lore"); if(b) b.setAttribute("aria-pressed",loreAb?"true":"false");
 lig("b-lore",function(){ loreAb=!loreAb; pintaLore(); });
}
function pintaComb(){
 var LC=limComb(), g=S.gasto|0, pc=Math.min(100,Math.round(g/LC*100));
 el("cb-g").textContent=g; var lv=el("cb-l"); if(lv) lv.textContent=LC;
 el("cb-bar").style.width=pc+"%";
 var est = g>=LC ? ["off","combust&atilde;o \u2014 rebote amanh&atilde;"] : (g>=LC*0.64 ? ["off","queima alta"] : ["on","dentro da faixa"]);
 el("cb-pw").innerHTML='<span class="n">Estado da queima<small>gasto acumulado neste ciclo</small></span>'+
  '<span class="s '+est[0]+'">'+est[1]+'</span>'+
  '<span class="n">Combust&otilde;es registradas<small>ciclos fechados acima do limiar</small></span>'+
  '<span class="s '+((S.queimas|0)?"off":"on")+'">'+(S.queimas|0)+'</span>';
}
function pintaLive(){
 el("lv-c").textContent=S.carga;
 var P=[
  {n:"Colapso de Rotas",s:"poder principal",on:S.carga>=LIMIAR},
  {n:"Decodifica&ccedil;&atilde;o Estrutural",s:"secund&aacute;rio",on:S.carga>=20},
  {n:"Empatia Sensorial de Campo",s:"passivo &middot; n&atilde;o desliga",on:true},
  {n:"Resson&acirc;ncia Coletiva",s:"restitui carga",on:S.usos.rede<2}
 ],h="";
 for(var i=0;i<P.length;i++) h+='<span class="n">'+P[i].n+'<small>'+P[i].s+'</small></span><span class="s '+
   (P[i].on?"on":"off")+'">'+(P[i].on?"em linha":"fora de linha")+'</span>';
 el("lv-pw").innerHTML=h;
 el("b-ater2").disabled=S.usos.ater>=2;
}
function pinta(){
 el("today").textContent=S.ciclo;
 el("carga").textContent=S.carga; el("dominio").textContent=S.dominio; el("falsos").textContent=S.falsos;
 var LR=el("lastro"); if(LR){ LR.textContent=S.lastro|0;
  var prox=null,pi; for(pi=0;pi<RECOMPENSAS.length;pi++) if(!S.premios[pi]&&S.dominio>=RECOMPENSAS[pi].min&&(prox===null||RECOMPENSAS[pi].c<prox)) prox=RECOMPENSAS[pi].c;
  el("lbar").style.width=(prox?Math.min(100,Math.round((S.lastro|0)/prox*100)):100)+"%";
  el("lnote").innerHTML=prox?("faltam <b>"+Math.max(0,prox-(S.lastro|0))+"</b> para a pr&oacute;xima recompensa ao alcance")
   :"nenhuma recompensa dispon&iacute;vel na patente atual"; }
 el("bar").style.width=S.carga+"%";
 var on=S.carga>=LIMIAR, st=el("status");
 st.className="pill "+(on?"on":"off"); st.innerHTML=on?"muta&ccedil;&atilde;o online":"abaixo do limiar";
 var p=patente(); el("patente").innerHTML="Patente: "+p.n+" &mdash; "+p.d;
 var f=proximo(); el("prox").innerHTML=f>0?("Faltam "+f+" para a pr&oacute;xima patente."):"Teto da escala.";
 el("b-cer").disabled=S.carga<25;
 el("b-rup").disabled=!on||S.usos.rup>=(temAr("rup2")?2:1)||!pm().rup;
 el("b-for").disabled=on||S.carga<35;
 el("b-rede").disabled=S.usos.rede>=2;
 el("b-ater").disabled=S.usos.ater>=2;
 var box=el("log");
 if(!S.log.length) box.innerHTML='<div class="empty">Registro vazio. A primeira ocorr&ecirc;ncia aparece aqui.</div>';
 else{var h="<ol>";
  for(var i=0;i<S.log.length;i++){var L=S.log[i],v=L.v,c=v>0?"up":(v<0?"dn":"");
   h+='<li class="'+(L.bad?"bad":"")+'"><span class="t">'+L.t+'</span><span class="d">'+L.d+'</span><span class="v '+c+'">'+(v>0?"+":"")+(v||0)+' carga</span></li>';}
  box.innerHTML=h+"</ol>";}
 el("sat").textContent=S.sat;
 el("sbar").style.width=S.sat+"%";
 el("snote").innerHTML=S.sat>=60?("Antena saturada. Risco de queima seca na Ruptura: <b style=\"color:var(--red)\">"+risco()+"%</b>."):"Antena aberta. Acima de 60 a Ruptura sai torta.";
 el("b-desc").disabled=S.usos.desc>=1||S.sat<=0;
 var rb=el("b-rup").querySelector(".cost");
 var MP=pm();
 if(rb) rb.innerHTML=!MP.rup?"travada pelo protocolo SOLO"
  :((S.sat>=60?"risco "+risco()+"% &middot; ":"")+"&minus;35 carga &middot; +"+MP.rupDom+" dom");
 var ab=el("b-ater").querySelector(".cost");
 if(ab) ab.innerHTML="+"+(30*MP.ater)+" &middot; 2&times;/ciclo"+(MP.ater>1?" &middot; dobrado":"");
 checaMis(); pintaProt(); pintaMis(); pintaOrb(); pintaWp(); pintaFx(); pintaFp(); pintaCer(); pintaMesa(); pintaTir(); pintaArs(); pintaPC(); pintaTema(); pintaAlerta(); pintaRadar(); pintaKitc(); pintaRail(); pintaDeck(); pintaTb(); pintaProvas(); pintaRw(); pintaEco(); pintaIgn(); pintaFrames(); pintaPlacas(); pintaCod(); pintaCap(); pintaAnais(); pintaRegDia(); pintaAbertura(); pintaHab(); pintaCtn(); pintaCorpo(); pintaCorpo2(); pintaEstado(); pintaProgresso(); pintaHabTab(); pintaSB(); pintaRastro(); pintaProj(); pintaMenu(); pintaPP(); pintaEM(); pintaRS(); irPara(); pintaApt(); pintaMC(); pintaLP(); pintaDiag(); pintaLive(); pintaDE(); pintaVoo(); pintaCam(); pintaCiclo(); pintaBlocos(); pintaMapas(); pintaKr(); pintaCal(); pintaLore(); pintaComb(); pintaDr(); spark(); grava();
}
function risco(){ return S.sat<60?0:Math.min(50,Math.round((S.sat-60)/80*100)); }
aoIniciar(function(){


/* chips e form */
(function(){
 var h='<button class="chip" data-c="todos" aria-pressed="true">todos</button>';
 for(var i=0;i<CANAIS.length;i++) h+='<button class="chip" data-c="'+CANAIS[i].id+'" aria-pressed="false">'+CANAIS[i].n+'</button>';
 h+='<button class="chip" id="chip-disp" aria-pressed="false">s&oacute; o que d&aacute; agora</button>';
 el("chips").innerHTML=h;
 var cs=el("chips").querySelectorAll(".chip[data-c]");
 for(var j=0;j<cs.length;j++) cs[j].addEventListener("click",function(){
  filtro=this.getAttribute("data-c");
  for(var k=0;k<cs.length;k++) cs[k].setAttribute("aria-pressed",cs[k]===this?"true":"false");
  pintaDeck();});
 el("chip-disp").addEventListener("click",function(){
  soDisp=!soDisp; this.setAttribute("aria-pressed",soDisp?"true":"false"); pintaDeck();});
 var o="";
 for(var m=0;m<CANAIS.length;m++) o+='<option value="'+CANAIS[m].id+'">'+CANAIS[m].n+'</option>';
 el("n-canal").innerHTML=o;
})();
});


function liga(id,fn){var b=el(id); if(b) b.addEventListener("click",fn);}
aoIniciar(function(){

liga("b-cer",function(){ if(S.carga<25)return; move(-18,18,"Cerco: muitos golpes baratos at&eacute; a pilha ceder.",false,6,3,0);});
liga("b-rup",function(){ if(S.carga<LIMIAR||S.usos.rup>=(temAr("rup2")?2:1)||!pm().rup)return; S.usos.rup++;
 if(Math.random()*100<risco()){ S.falsos++;
  move(-35,0,"QUEIMA SECA por satura&ccedil;&atilde;o. Carga cheia, antena entupida &mdash; a corrente saiu inteira e n&atilde;o voltou nada.",true,0,0,1); return; }
 move(-35,pm().rupDom,"Ruptura. Ramos podados, n&oacute; desfeito no ponto exato."+
  (pm().rupDom<45?" Protocolo de leitura: parte do rendimento foi para o estudo.":""),false,10,8,0);});
liga("b-for",function(){ if(S.carga>=LIMIAR||S.carga<35)return; S.falsos++;
 move(-35,0,"QUEIMA SECA. Ruptura for&ccedil;ada sob o ponto de igni&ccedil;&atilde;o &mdash; gasto integral, voo nenhum.",true,0,0,1);});
liga("b-rede",function(){ if(S.usos.rede>=2)return; S.usos.rede++; S.ultCont=hoje(); move(22,2,"Convoca&ccedil;&atilde;o de Rede. Problema dito em voz alta para outra pessoa; fa&iacute;sca restitu&iacute;da.",false,-15,0,0);});
liga("b-ater",function(){ if(S.usos.ater>=2)return; S.usos.ater++; S.ultAter=hoje();
 var g=30*pm().ater; move(g,2,"Aterramento. Corpo, comida, sono ou espa&ccedil;o f&iacute;sico &mdash; recarga no terreno hostil."+
  (g>30?" Protocolo SOLO: o terreno devolve em dobro.":""),false,-8,0,0);});
liga("b-desc",function(){ if(S.usos.desc>=1||S.sat<=0)return; S.usos.desc++;
 move(0,2,"Descarga Controlada. O que foi absorvido virou nome escrito &mdash; a fun&ccedil;&atilde;o que o mapa bloqueou, feita &agrave; m&atilde;o.",false,-35,0,0);});
liga("b-agua",function(){ S.aguaH=(S.aguaH||[]).concat(hoje()); move(-15,0,"&Aacute;gua fervente: descarga involunt&aacute;ria. Ru&iacute;do acumulado saiu antes da decis&atilde;o.",true,-20,0,0);});
liga("b-ater2",function(){ var b1=el("b-ater"); if(b1) b1.click(); });
liga("b-trav",function(){
 if(S.sat<40||S.usos.trav>=1||S.carga<10) return; S.usos.trav++;
 var amp=temAr("cam");
 move(-10,amp?9:6,"Travessia para a C\u00e2mara. Porta fechada, nenhum alvo fora: a corrente virou leitura e levou o ru\u00eddo junto.",false,amp?-18:-14,2,0);});
liga("b-decl",function(){
 if(!S.ign.af.length||S.ign.decl===hoje())return; S.ign.decl=hoje();
 var FO=S.ign.fo||[], fa=FO.length?FO[Math.min(S.ign.foAt,FO.length-1)]:null;
 move(12,1,"Declara\u00e7\u00e3o"+(fa?" \u2014 foco: "+esc(fa.t):"")+". Combust\u00edvel dosado \u00e0 m\u00e3o: o sentido dito antes de a tarefa pedir.",false,-5,0,0);});
liga("b-addaf",function(){ var v=el("ig-naf").value.trim(); if(!v)return;
 S.ign.af.push(v); el("ig-naf").value=""; pinta();});
liga("b-addvi",function(){ var v=el("ig-nvi").value.trim(); if(!v)return;
 S.ign.vi.push(v); el("ig-nvi").value=""; pinta();});
liga("b-eco",function(){ el("eco-q").innerHTML=ecoFala(); });
liga("b-ver",function(){ var g=el("grade"); g.classList.toggle("aberta");
 this.querySelector("strong").textContent=g.classList.contains("aberta")?"Fechar o baralho":"Ver todas as fichas"; });


liga("b-print",function(){ window.print&&window.print(); });
liga("b-repor",function(){ S.fichas={}; S.puxada=null; anota("Baralho reposto. Todas as fichas voltam &agrave; mesa.",0,false); pinta(); });
liga("b-add",function(){
 var t=el("n-tit").value.trim(); if(!t){el("msg").textContent="d&ecirc; um t&iacute;tulo &agrave; ficha";return;}
 var ps=el("n-pas").value.split(";").map(function(x){return x.trim();}).filter(Boolean);
 if(!ps.length) ps=["Fa&ccedil;a a coisa."];
 S.extras.push({id:"x"+Date.now(),c:el("n-canal").value,e:"baixa",t:5,h:t,p:"",s:ps,d:""});
 el("n-tit").value=""; el("n-pas").value="";
 anota("Ficha acrescentada ao baralho: "+t,0,false); pinta();});

liga("b-copy",function(){var ta=el("dump"); ta.value=JSON.stringify(S);
 try{navigator.clipboard.writeText(ta.value).then(function(){el("msg").textContent="estado copiado";},
  function(){ta.select();el("msg").textContent="selecionado — copie com ctrl+c";});}
 catch(e){ta.select();el("msg").textContent="selecionado — copie com ctrl+c";}});
liga("b-load",function(){try{S=normaliza(JSON.parse(el("dump").value));pinta();el("msg").textContent="estado restaurado";}
 catch(e){el("msg").textContent="campo ilegível — cole o json completo";}});
});


var armado=false,tR=null;
aoIniciar(function(){

liga("b-reset",function(){var b=el("b-reset");
 if(!armado){armado=true;b.querySelector("strong").textContent="Confirmar: apaga tudo";
  el("msg").textContent="clique de novo em 4s para zerar";
  tR=setTimeout(function(){armado=false;b.querySelector("strong").textContent="Zerar registro";el("msg").textContent="";},4000);return;}
 clearTimeout(tR);armado=false;b.querySelector("strong").textContent="Zerar registro";
 S=limpo();pinta();el("msg").textContent="registro zerado";});
});


