/* Captura, abertura, hábitos, projetos e menu de recarga */
"use strict";
/* ===== captura, abertura, hábitos, projetos, menu ===== */
function seq(hist){ if(!hist||!hist.length) return 0;
 var set={},i; for(i=0;i<hist.length;i++) set[hist[i]]=1;
 var n=0,d=hojeN();
 if(!set[hoje()]) d=d-1;
 while(set[diaStr(d)]){ n++; d--; }
 return n; }
function diaStr(n){ var d=new Date(n*864e5); return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0"); }
function pintaCap(){
 var h="",i,C=S.cap;
 for(i=0;i<C.length;i++) h+='<li><span>'+esc(C[i].t)+'</span>'+
   '<button data-cl="'+i+'">vira lâmina</button><button class="x3" data-cx="'+i+'">✕</button></li>';
 el("cp-l").innerHTML=h||'<li class="vz6">caixa vazia</li>';
 lig("b-cap",function(){ var v=el("cp-in").value.trim(); if(!v)return;
  S.cap.unshift({t:v,d:hoje()}); if(S.cap.length>60) S.cap.length=60;
  el("cp-in").value=""; move(0,1,"Captura: "+esc(v),false,-2,0,0);});
 var n=document.querySelectorAll("[data-cl]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-cl"), it=S.cap[k];
  S.extras.push({id:"x"+Date.now(),c:"dig",e:"baixa",t:5,h:it.t,p:"",s:["Faça a coisa."],d:""});
  S.cap.splice(k,1); move(0,2,"Captura triada: “"+esc(it.t)+"” virou lâmina.",false,-2,0,0);});
 n=document.querySelectorAll("[data-cn]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-cn"), it=S.cap[k];
  S.notas.unshift({t:it.t.slice(0,60),b:it.t,tags:["captura"],d:hoje()});
  S.cap.splice(k,1); move(0,2,"Captura arquivada como nota.",false,-2,1,0);});
 n=document.querySelectorAll("[data-cx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  S.cap.splice(+this.getAttribute("data-cx"),1); pinta();});
 var inp=el("cp-in");
 if(inp) inp.addEventListener("keydown",function(e){ if(e.key==="Enter"){ var b=el("b-cap"); if(b) b.click(); }});
}
var DIRC=[
 ["agua","Oito copos de \u00e1gua",function(d){return ((S.agua&&S.agua[d])||0)>=8;}],
 ["ativ","Vinte minutos de corpo",function(d){return ((S.ativ&&S.ativ[d])||0)>=20;}],
 ["sono","Sete horas de sono registradas",function(d){return ((S.sono&&S.sono[d])||0)>=7;}],
 ["ref","Tr\u00eas refei\u00e7\u00f5es marcadas",function(d){var q=(S.refs&&S.refs[d])||{};return (q.m?1:0)+(q.t?1:0)+(q.n?1:0)>=3;}]
];
function misNova(){
 var d=hoje(), n=diaN(d), c=DIRC[n%DIRC.length][0], pesada=S.carga>=LIMIAR;
 S.mis={d:d,c:c,r:pesada?"rup":"decl",pago:0};
}
function misCont(){ var i; for(i=0;i<DIRC.length;i++) if(DIRC[i][0]===(S.mis&&S.mis.c)) return DIRC[i]; return DIRC[0]; }
function fichaHoje(){ var k; for(k in S.fichas) if(S.fichas[k]===hoje()) return true; return false; }
function misEstado(){
 if(!S.mis||S.mis.d!==hoje()) misNova();
 var d=hoje(), C=misCont();
 var a=C[2](d), b=fichaHoje();
 var c=(S.mis.r==="rup")?(S.usos.rup>=1&&S.ign.decl===d):(S.ign.decl===d);
 return {a:a,b:b,c:c,n:(a?1:0)+(b?1:0)+(c?1:0),rot:C[1]};
}
function checaMis(){
 var m=misEstado();
 if(m.n===3&&!S.mis.pago){ S.mis.pago=1;
  var ant=S.carga; S.carga=clamp(S.carga+15,0,100); S.sat=clamp(S.sat-10,0,100);
  S.hist.push(S.carga); if(S.hist.length>28)S.hist.shift();
  anota("Sinergia de circuito: as tr\u00eas diretivas fecharam no mesmo ciclo. Continente, ru\u00eddo e rota alinhados \u2014 retorno sem consumir uso.",S.carga-ant,false);
 }
}
function pintaMis(){
 var m=misEstado(), rot=[
  ["Conten\u00e7\u00e3o",m.rot,m.a,"h-ctn","manter o continente de p\u00e9"],
  ["Varredura","Liquidar uma l\u00e2mina do baralho",m.b,"h-deck","limpar ru\u00eddo sem gastar poder"],
  [(S.mis.r==="rup")?"Ruptura":"Rota",(S.mis.r==="rup")?"Declarar a rota e romper o n\u00f3 mais denso":"Declarar a rota do dia",m.c,"h-rota",(S.mis.r==="rup")?"carga estava em linha na abertura":"carga sob o limiar na abertura \u2014 diretiva leve"]
 ],h="",i;
 for(i=0;i<rot.length;i++) h+='<div class="dr'+(rot[i][2]?" ok":"")+'">'+
  '<span class="dk">'+rot[i][0]+'</span>'+
  '<b>'+rot[i][1]+'</b>'+
  '<i>'+rot[i][4]+'</i>'+
  '<div class="dft"><span class="mk">'+(rot[i][2]?"cumprida":"em aberto")+'</span>'+
  '<button data-ir="'+rot[i][3]+'">ir</button></div></div>';
 el("mis").innerHTML=h;
 el("mis-n").textContent=m.n+"/3";
 el("mis-s").className="sin "+(S.mis.pago?"on":(m.n===3?"on":""));
 el("mis-s").innerHTML=S.mis.pago
  ? "Sinergia de circuito aplicada: +15 de carga e &minus;10 de satura&ccedil;&atilde;o, sem consumir uso di&aacute;rio."
  : "Fechar as tr&ecirc;s libera a <b>sinergia de circuito</b>: +15 de carga e &minus;10 de satura&ccedil;&atilde;o, sem consumir uso di&aacute;rio.";
}
function pintaAbertura(){
 var on=S.carga>=LIMIAR, D=venc().length, p=patente(), f;
 var pend=[]; if(!S.ign.decl||S.ign.decl!==hoje()) pend.push("declarar a rota");
 if(D) pend.push(D+" termo"+(D>1?"s":"")+" para revisar");
 if(desde(S.ultAter)>=2) pend.push("pousar");
 if(on) f='Mutação <b>em linha</b>. A Ruptura está aberta — use nela o nó mais denso do dia, não o mais urgente.';
 else if(S.carga>=25) f='Carga sob o limiar. O poder principal não abre, mas <b>o baralho abre</b> — e Cerco ainda roda.';
 else f='Carga no chão. Hoje é <b>dia de lâmina</b>: uma carta, três passos, nada de decisão.';
 if(S.sat>=60) f+=' Antena saturada: processe antes de disparar.';
 if((S.gasto|0)>=70) f+=' Queima do ciclo no teto — amanhã nasce devendo.';
 if(pend.length) f+=' Pendente: '+pend.join(", ")+'.';
 el("ab-f").innerHTML=f;
 el("ab-m").innerHTML=
  '<div><span class="v2">'+S.carga+'</span><span class="k7">carga</span></div>'+
  '<div><span class="v2">'+S.dominio+'</span><span class="k7">domínio</span></div>'+
  '<div><span class="v2">'+(S.cap.length)+'</span><span class="k7">na caixa</span></div>';
}
function pintaHab(){
 var h="",i,j,H=S.hab;
 for(i=0;i<H.length;i++){ var x=H[i], st=seq(x.hist), feito=(x.hist||[]).indexOf(hoje())>=0, g="";
  for(j=6;j>=0;j--) g+='<i class="'+(((x.hist||[]).indexOf(diaStr(hojeN()-j))>=0)?"on2":"")+'"></i>';
  h+='<div class="hb"><span class="n6">'+esc(x.nome)+'</span><span class="grid7">'+g+'</span>'+
     '<span class="sq" title="dias feitos nos últimos 7">'+jan7(x.hist)+'/7</span>'+
     '<button data-hb="'+i+'"'+(feito?' disabled':'')+'>'+(feito?"feito":"marcar")+'</button>'+
     '<button class="x4" data-hx="'+i+'">✕</button></div>'; }
 el("hb-l").innerHTML=h||'<div class="travado" style="color:var(--line2)">nenhum hábito registrado</div>';
 lig("b-hab",function(){ var v=el("hb-in").value.trim(); if(!v)return;
  S.hab.push({id:"h"+Date.now(),nome:v,hist:[]}); el("hb-in").value=""; pinta();});
 var n=document.querySelectorAll("[data-hb]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var x=S.hab[+this.getAttribute("data-hb")];
  if((x.hist||[]).indexOf(hoje())>=0) return;
  x.hist=(x.hist||[]).concat(hoje()); if(x.hist.length>400) x.hist=x.hist.slice(-400);
  var w7=jan7(x.hist), bonus=habBonus(x,w7);
  move(0,3+bonus,"Hábito: "+esc(x.nome)+" — "+w7+" de 7 dias"+(bonus?", semana cumprida.":"."),false,0,0,0);});
 n=document.querySelectorAll("[data-hx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ S.hab.splice(+this.getAttribute("data-hx"),1); pinta();});
}
function estProj(x){
 var par=desde(x.ult||x.aberto||S.inicio);
 if(x.est==="pausado") return {c:"pausado",sig:"CNG",n:"congelamento",d:"rota pausada por decis\u00e3o"};
 if(par>=10) return {c:"nocaute",sig:"NOC",n:"nocaute",d:"parado h\u00e1 "+par+" dias \u2014 reanimar ou encerrar"};
 if(par>=4) return {c:"travado",sig:"PAR",n:"paralisia",d:"sem etapa h\u00e1 "+par+" dias"};
 return {c:"ativo",sig:"ATV",n:"ativo",d:par===0?"tocado neste ciclo":("\u00faltimo toque h\u00e1 "+par+" dias")};
}
function pintaProj(){
 var h="",i,j,P=S.proj;
 for(i=0;i<P.length;i++){ var x=P[i], ps=x.passos||[], ok=0;
  for(j=0;j<ps.length;j++) if(ps[j].ok) ok++;
  var pc=ps.length?Math.round(ok/ps.length*100):0, dd=x.prazo?(diaN(x.prazo)-hojeN()):null;
  var E=estProj(x);
  h+='<div class="pj '+E.c+'"><div class="tp2"><span class="n7">'+esc(x.nome)+'</span><span class="pz">'+
     (dd===null?"sem prazo":(dd>=0?dd+" dias":"vencido h\u00e1 "+(-dd)))+'</span></div>';
  h+='<div class="pest"><span class="eb '+E.c+'">'+E.sig+'</span><span class="et">'+E.n+'</span>'+
     '<span class="ed">'+E.d+'</span>'+
     '<button data-pv="'+i+'">'+(E.c==="pausado"?"retomar":"congelar")+'</button>'+
     (E.c==="nocaute"?'<button class="rev" data-prv="'+i+'">reanimar</button>':'')+'</div>';
  h+='<div class="pb3"><i style="width:'+pc+'%"></i></div>';
  h+='<div class="tp2" style="font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)"><span>'+ok+' de '+ps.length+' etapas</span><button class="x4" data-px="'+i+'" style="border:0;background:transparent;color:var(--line2);width:auto;padding:0">remover</button></div>';
  h+='<ul>';
  for(j=0;j<ps.length;j++) h+='<li class="'+(ps[j].ok?"feito":"")+'"><span class="cb" data-pt="'+i+'|'+j+'"></span><span>'+esc(ps[j].t)+'</span><button data-pr="'+i+'|'+j+'">✕</button></li>';
  h+='</ul>';
  h+='<div style="display:flex;gap:6px;margin-top:8px"><input data-pn="'+i+'" maxlength="70" placeholder="nova etapa" style="flex:1;background:var(--well);color:var(--bone);border:1px solid var(--line2);font-family:var(--sans);font-size:12.5px;padding:6px 9px"><button data-pa="'+i+'" style="width:auto;padding:6px 10px;font-family:var(--mono);font-size:9px;letter-spacing:.12em">somar</button></div></div>';
 }
 el("pj-l").innerHTML=h||'<div class="travado" style="color:var(--line2)">nenhum projeto aberto</div>';
 lig("b-proj",function(){ var v=el("pj-n").value.trim(); if(!v)return;
  S.proj.push({id:"p"+Date.now(),nome:v,prazo:el("pj-d").value||null,passos:[],aberto:hoje(),ult:hoje(),est:"ativo"});
  el("pj-n").value=""; anota("Projeto aberto: "+esc(v)+".",0,false); pinta();});
 var n=document.querySelectorAll("[data-pv]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-pv"), x=S.proj[k];
  if(x.est==="pausado"){ x.est="ativo"; x.ult=hoje();
   anota("Projeto retomado: "+esc(x.nome)+". Rota volta a correr.",0,false); }
  else { x.est="pausado";
   anota("Projeto congelado: "+esc(x.nome)+". Pausa declarada n\u00e3o conta como abandono.",0,false); }
  pinta(); });
 n=document.querySelectorAll("[data-prv]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var x=S.proj[+this.getAttribute("data-prv")]; x.est="ativo"; x.ult=hoje();
  move(-3,6,"Projeto reanimado: "+esc(x.nome)+". Nocaute desfeito com um toque, n\u00e3o com um plano.",false,0,1,0); });
 n=document.querySelectorAll("[data-pa]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-pa"), f=document.querySelector('[data-pn="'+k+'"]'), v=f?f.value.trim():"";
  if(!v)return; S.proj[k].passos=(S.proj[k].passos||[]).concat({t:v,ok:false}); pinta();});
 n=document.querySelectorAll("[data-pt]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var q=this.getAttribute("data-pt").split("|"), st=S.proj[+q[0]].passos[+q[1]];
  st.ok=!st.ok;
  S.proj[+q[0]].ult=hoje();
  if(st.ok) move(-4,5,"Etapa concluída em "+esc(S.proj[+q[0]].nome)+": "+esc(st.t),false,0,1,0);
  else pinta();});
 n=document.querySelectorAll("[data-pr]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var q=this.getAttribute("data-pr").split("|"); S.proj[+q[0]].passos.splice(+q[1],1); pinta();});
 n=document.querySelectorAll("[data-px]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ S.proj.splice(+this.getAttribute("data-px"),1); pinta();});
}
function pintaMenu(){
 var h="",i,M=S.menu, alto=S.carga>=LIMIAR;
 for(i=0;i<M.length;i++) h+='<div><span>'+esc(M[i])+'</span>'+
   '<button data-mu="'+i+'"'+(S.usos.menu>=1?' disabled':'')+'>usar</button>'+
   '<button class="x5" data-mx="'+i+'">✕</button></div>';
 el("mn-l").innerHTML=h||'<div><span style="color:var(--line2)">menu vazio</span></div>';
 el("mn-add").innerHTML = alto
  ? '<div class="ent" style="display:flex;gap:7px"><input id="mn-in" maxlength="60" placeholder="o que te devolve o corpo" style="flex:1;background:var(--well);color:var(--bone);border:1px solid var(--line2);font-family:var(--sans);font-size:13.5px;padding:8px 10px"><button id="b-menu" style="width:auto"><strong>Somar</strong></button></div>'
  : '<p class="travado">Trancado. O menu s&oacute; se monta com carga acima de '+LIMIAR+' &mdash; a lista boa se escreve no dia bom, n&atilde;o no dia ruim.</p>';
 lig("b-menu",function(){ var v=el("mn-in").value.trim(); if(!v)return;
  S.menu.push(v); el("mn-in").value=""; pinta();});
 var n=document.querySelectorAll("[data-mu]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  if(S.usos.menu>=1) return; S.usos.menu=1;
  move(8,0,"Menu de recarga: "+esc(S.menu[+this.getAttribute("data-mu")])+".",false,-4,0,0);});
 n=document.querySelectorAll("[data-mx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ S.menu.splice(+this.getAttribute("data-mx"),1); pinta();});
}

var FASES=[
 ["IGNI\u00c7\u00c3O","a primeira queima, sem controle","IGNITER"],
 ["DERIVA","deslocamento sem propuls\u00e3o pr\u00f3pria","DRIFTER"],
 ["ASTROMANTE","opera lendo padr\u00e3o, n\u00e3o for\u00e7ando","ASTROMANCER"],
 ["APOGEU","pot\u00eancia m\u00e1xima, dist\u00e2ncia m\u00e1xima do ch\u00e3o","APOGEE"],
 ["REENTRADA","sobrevive \u00e0 volta","VOIDWALKER"]
];
function equil(){
 var i,c=contencao().v, sat=100-S.sat;
 var h=(S.hist||[]).slice(-7), m=0; for(i=0;i<h.length;i++) m+=h[i];
 m=h.length?m/h.length:S.carga;
 var est=Math.max(0,Math.round(100-Math.abs(m-65)*2.2));
 var P=S.proj||[], viva=0; for(i=0;i<P.length;i++) if(estProj(P[i]).c!=="nocaute") viva++;
 var fr=P.length?Math.round(viva/P.length*100):100;
 var lim=Math.max(0,100-((S.falsos|0)*25+(S.queimas|0)*12));
 return {v:clamp(Math.round(c*.30+sat*.20+est*.15+fr*.15+lim*.20),0,100),
         c:c,s:sat,e:est,f:fr,l:lim,md:Math.round(m)};
}
function teto(v){ return v<30?1:(v<50?2:(v<70?3:4)); }
function faseIdx(){
 var i,base=0;
 for(i=0;i<PATENTES.length;i++) if(S.dominio>=PATENTES[i].min){ base=4-i; break; }
 var f=Math.min(base,teto(equil().v));
 if(f===4&&S.falsos>0) f=3;
 return f;
}
function faseBase(){ var i; for(i=0;i<PATENTES.length;i++) if(S.dominio>=PATENTES[i].min) return 4-i; return 0; }
function pintaArco(){
 var f=faseIdx(),h="",i;
 for(i=0;i<FASES.length;i++) h+='<div class="fa'+(i===f?" atual":(i<f?" feita":""))+'">'+
  '<span class="ix2">['+String(i+1).padStart(2,"0")+']</span>'+
  '<span class="nm8">'+FASES[i][0]+'</span>'+
  '<span class="en8">'+FASES[i][2]+'</span>'+
  '<span class="ds">'+(i===4&&S.falsos>0?"travada por queima seca":FASES[i][1])+'</span></div>';
 el("arco").innerHTML=h;
 var E=equil(), base=faseBase(), t=teto(E.v), preso=(t<base), C=[
  ["conten\u00e7\u00e3o",E.c,"30%"],["ru\u00eddo sob controle",E.s,"20%"],
  ["carga est\u00e1vel",E.e,"15%"],["frentes vivas",E.f,"15%"],["sem queima",E.l,"20%"]],k,g="";
 for(k=0;k<C.length;k++) g+='<div class="eqi"><span class="eqn">'+C[k][0]+'<i>'+C[k][2]+'</i></span>'+
  '<div class="eqb2"><i style="width:'+C[k][1]+'%"></i></div><span class="eqv">'+C[k][1]+'</span></div>';
 el("eqb").innerHTML='<div class="eqtop"><span class="k9">Equil\u00edbrio do registro</span>'+
  '<span class="eqg">'+E.v+'<small>/100</small></span>'+
  '<span class="eqs'+(preso?" preso":"")+'">'+
   (preso?("manto retido em "+FASES[t][0]+" \u2014 o dom\u00ednio j\u00e1 d\u00e1 "+FASES[base][0])
         :("manto liberado at\u00e9 "+FASES[t][0]))+'</span></div><div class="eqgrid">'+g+'</div>'+
  '<p class="eqp">A fase n\u00e3o sobe s\u00f3 por dom\u00ednio acumulado. O dom\u00ednio diz at\u00e9 onde voc\u00ea pode ir; '+
  'o equil\u00edbrio dos registradores diz at\u00e9 onde o portador aguenta ficar. Vale o menor dos dois.</p>';
}
function dias7ok(f){ var n=0,i; for(i=0;i<7;i++){ var d=diaStr(hojeN()-i); if(f(d)) n++; } return n; }
function contencao(){
 var a=dias7ok(function(d){ return ((S.sono&&S.sono[d])||0)>=7; });
 var b=dias7ok(function(d){ return ((S.agua&&S.agua[d])||0)>=8; });
 var c=dias7ok(function(d){ return ((S.ativ&&S.ativ[d])||0)>=20; });
 var e=dias7ok(function(d){ var q=(S.refs&&S.refs[d])||{}; return (q.m?1:0)+(q.t?1:0)+(q.n?1:0)>=3; });
 return {v:Math.round((a+b+c+e)/28*100),a:a,b:b,c:c,e:e};
}
function limComb(){ return 50+Math.round(contencao().v/100*30)+(temAr("reg")?10:0); }
function pintaCtn(){
 var C=contencao(), L=limComb();
 el("ct-v").textContent=C.v; el("ct-b").style.width=C.v+"%"; el("ct-l").textContent=L;
 var st=el("ct-s");
 if(C.v>=70){ st.textContent="continente firme"; st.style.cssText="background:var(--line2);color:var(--bone)"; }
 else if(C.v>=35){ st.textContent="continente parcial"; st.style.cssText="background:var(--redd);color:var(--bone)"; }
 else { st.textContent="sem continente"; st.style.cssText="background:var(--red);color:#150a04"; }
 var Q=[["P\u00b701","sono \u2265 7h",C.a],["P\u00b702","meta de \u00e1gua",C.b],["P\u00b703","movimento \u2265 20min",C.c],["P\u00b704","tr\u00eas refei\u00e7\u00f5es",C.e]],h="",i;
 for(i=0;i<Q.length;i++) h+='<div><span class="c2">['+Q[i][0]+']</span><span class="n9">'+Q[i][2]+'<span style="font-size:12px;color:var(--dim)">/7</span></span><span class="l9">'+Q[i][1]+'</span></div>';
 el("ct-q").innerHTML=h;
}
function agDef(n){ var hoy=hoje(); S.agua=S.agua||{};
 var a=S.agua[hoy]||0; n=clamp(n,0,12); S.agua[hoy]=n;
 if(a<8&&n>=8) move(4,3,"\u00c1gua: meta de 8 copos cumprida. Mat\u00e9ria atravessou o corpo o dia inteiro.",false,-3,0,0);
 else pinta();
}
function pintaCorpo(){
 var i,hoy=hoje(),S7=[],A7=[];
 for(i=6;i>=0;i--){ var d=diaStr(hojeN()-i);
  S7.push([d,(S.sono&&S.sono[d])||0]); A7.push([d,(S.agua&&S.agua[d])||0]); }
 var hj=(S.sono&&S.sono[hoy])||0;
 el("sn-h").textContent=hj?hj:"\u2014";
 var som=0,q=0; for(i=0;i<7;i++) if(S7[i][1]){som+=S7[i][1];q++;}
 var med=q?(som/q).toFixed(1):null;
 el("sn-m").innerHTML=med?("m\u00e9dia de 7 dias <b>"+med+" h</b>"+(hj&&hj<5?" &middot; <b>d\u00e9ficit</b>":"")):"sem registro nesta semana";
 var g="";
 for(i=0;i<7;i++){ var v=S7[i][1], alt=Math.round(Math.min(1,v/9)*48);
  g+='<div class="'+(v>=7?"ok3":(v?"bx":""))+'" style="height:'+Math.max(2,alt)+'px"><span>'+S7[i][0].slice(8)+'</span></div>'; }
 el("sn-g").innerHTML=g;
 var an=(S.agua&&S.agua[hoy])||0;
 el("ag-n").textContent=an;
 el("ag-m").innerHTML=an>=8?"meta cumprida &middot; <b>pouso parcial</b>":("faltam <b>"+(8-an)+"</b> para a meta");
 g="";
 for(i=0;i<7;i++){ var w=Math.min(1,A7[i][1]/8);
  g+='<div><i style="height:'+Math.round(w*28)+'px"></i><span>'+A7[i][0].slice(8)+'</span></div>'; }
 el("ag-g").innerHTML=g;
 var hm=(S.sonoHM&&S.sonoHM[hoy])||{};
 if(el("sn-d").value==="" && hm.d) el("sn-d").value=hm.d;
 if(el("sn-a").value==="" && hm.a) el("sn-a").value=hm.a;
 lig("b-sonoh",function(){
  var d=el("sn-d").value, a=el("sn-a").value;
  if(!d||!a){ el("msg").textContent="preencha dormi e acordei"; return; }
  var dm=+d.slice(0,2)*60+ +d.slice(3,5), am=+a.slice(0,2)*60+ +a.slice(3,5);
  var min=am-dm; if(min<=0) min+=1440;
  S.sonoHM=S.sonoHM||{}; S.sonoHM[hoy]={d:d,a:a};
  el("sn-in").value=(Math.round(min/3)/20).toFixed(1);
  el("msg").textContent="dormiu "+(min/60).toFixed(1)+" h \u2014 confirme em registrar sono";
  grava();
 });
 lig("b-sono",function(){
  if(S.sono&&S.sono[hoy]!==undefined){ el("msg").textContent="sono do ciclo j\u00e1 registrado"; return; }
  var v=parseFloat(el("sn-in").value)||0; if(v<=0)return;
  S.sono=S.sono||{}; S.sono[hoy]=v;
  if(v>=7){ S.ultAter=hoy;
   move(6,2,"Sono de "+v+" h. O corpo pousou sozinho \u2014 vale como aterramento.",false,-4,0,0); }
  else if(v<5) move(-6,1,"Sono de "+v+" h. D\u00e9ficit: o ciclo come\u00e7a devendo.",true,6,0,0);
  else move(0,1,"Sono de "+v+" h. Abaixo do ideal, acima do cr\u00edtico.",false,0,0,0);
 });
 var cp="",ci,an2=(S.agua&&S.agua[hoy])||0;
 for(ci=1;ci<=8;ci++) cp+='<button data-cp="'+ci+'" class="'+(ci<=an2?"on":"")+'" aria-label="copo '+ci+'"></button>';
 el("ag-c").innerHTML=cp;
 var nc=document.querySelectorAll("[data-cp]");
 for(ci=0;ci<nc.length;ci++) nc[ci].addEventListener("click",function(){
  var v=+this.getAttribute("data-cp"), a=(S.agua&&S.agua[hoy])||0; agDef(v===a?v-1:v); });
 lig("b-ag-p",function(){ agDef(((S.agua&&S.agua[hoy])||0)+1); });
 lig("b-ag-m",function(){ agDef(((S.agua&&S.agua[hoy])||0)-1); });
}
function pintaCorpo2(){
 var i,hoy=hoje();
 var hj=(S.ativ&&S.ativ[hoy])||0, sem=0;
 for(i=0;i<7;i++){ var d=diaStr(hojeN()-i); sem+=(S.ativ&&S.ativ[d])||0; }
 el("at-n").textContent=hj;
 el("at-m").innerHTML="semana <b>"+sem+" min</b>"+(hj>=20?" &middot; pouso carimbado":"");
 var g="";
 for(i=6;i>=0;i--){ var d2=diaStr(hojeN()-i), v=(S.ativ&&S.ativ[d2])||0, alt=Math.round(Math.min(1,v/60)*48);
  g+='<div class="'+(v>=20?"ok3":(v?"bx":""))+'" style="height:'+Math.max(2,alt)+'px"><span>'+d2.slice(8)+'</span></div>'; }
 el("at-g").innerHTML=g;
 lig("b-ativ",function(){ var v=parseInt(el("at-in").value,10)||0; if(v<=0)return;
  S.ativ=S.ativ||{}; var antes=(S.ativ[hoy]||0); S.ativ[hoy]=antes+v;
  if(antes<20 && S.ativ[hoy]>=20){ S.ultAter=hoy;
   move(8,Math.round(v/5),"Atividade f\u00edsica: "+v+" min. Corpo em uso \u2014 pouso carimbado.",false,-5,0,0); }
  else move(0,Math.round(v/6),"Atividade f\u00edsica: "+v+" min.",false,-2,0,0);
 });

 var R=(S.refs&&S.refs[hoy])||{}, n=(R.m?1:0)+(R.t?1:0)+(R.n?1:0);
 el("rf-n").textContent=n;
 el("rf-m").innerHTML=n>=3?"dia completo &middot; <b>sem buraco</b>":(n===0?"nenhuma registrada":("falta <b>"+(3-n)+"</b>"));
 var b=document.querySelectorAll("[data-rf2]");
 for(i=0;i<b.length;i++){ var k=b[i].getAttribute("data-rf2");
  b[i].setAttribute("aria-pressed", R[k]?"true":"false");
  b[i].addEventListener("click",function(){
   var kk=this.getAttribute("data-rf2");
   S.refs=S.refs||{}; S.refs[hoy]=S.refs[hoy]||{};
   S.refs[hoy][kk]=!S.refs[hoy][kk];
   var q=S.refs[hoy], t=(q.m?1:0)+(q.t?1:0)+(q.n?1:0);
   if(q[kk]&&t===3) move(3,2,"Tr\u00eas refei\u00e7\u00f5es no ciclo. O corpo n\u00e3o foi esquecido.",false,-2,0,0);
   else pinta();
  });
 }
 g="";
 for(i=6;i>=0;i--){ var d3=diaStr(hojeN()-i), q2=(S.refs&&S.refs[d3])||{}, c="";
  ["m","t","n"].forEach(function(z){ c+='<i class="'+(q2[z]?"on4":"")+'"></i>'; });
  g+='<div>'+c+'<span>'+d3.slice(8)+'</span></div>'; }
 el("rf-g").innerHTML=g;
}

