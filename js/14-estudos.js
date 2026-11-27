/* Laptop: painel de estudos e Eumátheia */
"use strict";
aoIniciar(function(){
/* ===== Laptop: painel geral de estudos, com a Eumátheia (leitura) ===== */
(function(){var n0=normaliza;normaliza=function(p){var b=n0(p);b.fr=(p&&Array.isArray(p.fr))?p.fr:[];b.ler=(p&&Array.isArray(p.ler))?p.ler:[];return b;};})();
});

var EU_ABAS=[['geral','Painel geral'],['tatica','Tática'],['conc','Concurso'],['inst','Instruções'],['ler','Eumátheia']];
var EU_CARD={tatica:['c-h-ciclo','c-h-mapas'],conc:['c-h-conc'],inst:['c-h-lp']};
var EU_AB='geral';
function euEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function euDias(a,b){return Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);}
function euBr(d){var p=d.split('-');return p[2]+'/'+p[1];}
function euMonta(){var pane=document.querySelector('#painel-dir [data-pane="lap"]');if(!pane)return null;var eu=document.getElementById('eum');
 if(!eu){eu=document.createElement('section');eu.id='eum';eu.className='eum';
  eu.innerHTML='<header class="eu-cab"><div><span class="eu-k">painel de estudos</span><h2>Laptop</h2><p>tática, concurso, instruções e a Eumátheia, a estante de leitura</p></div>'+
   '<a class="eu-nova" href="?laptop" target="_blank" rel="noopener">abrir em nova aba ↗</a></header>'+
   '<nav class="eu-nav" role="tablist">'+EU_ABAS.map(function(a){return '<button type="button" role="tab" data-eu="'+a[0]+'">'+a[1]+'</button>';}).join('')+'</nav>'+
   '<div class="eu-pg" data-eupg="geral"></div><div class="eu-pg" data-eupg="tatica"><div id="eu-fichas"></div></div><div class="eu-pg" data-eupg="conc"></div><div class="eu-pg" data-eupg="inst"></div><div class="eu-pg" data-eupg="ler"></div>';
  pane.insertBefore(eu,pane.firstChild);
  eu.addEventListener('click',function(e){var t=e.target.closest('[data-eu]');if(t){euAba(t.getAttribute('data-eu'));return;}
   var g=e.target.closest('[data-eugo]');if(g){euAba(g.getAttribute('data-eugo'));}});}
 Object.keys(EU_CARD).forEach(function(k){var pg=eu.querySelector('[data-eupg="'+k+'"]');EU_CARD[k].forEach(function(id){var c=document.getElementById(id);if(c&&c.parentNode!==pg){if(k==='tatica')pg.insertBefore(c,document.getElementById('eu-fichas'));else pg.appendChild(c);}});});
 return eu;}
function euAba(k){var eu=euMonta();if(!eu)return;EU_AB=k;
 Array.prototype.forEach.call(eu.querySelectorAll('[data-eu]'),function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-eu')===k));});
 Array.prototype.forEach.call(eu.querySelectorAll('[data-eupg]'),function(p){p.hidden=p.getAttribute('data-eupg')!==k;});
 if(k==='geral')euGeral();if(k==='tatica')euFichas();if(k==='ler')lerPinta();
 var c=document.querySelector('#painel-dir .pd-corpo');if(c&&!document.body.classList.contains('eu-solo'))c.scrollTop=0;else window.scrollTo(0,0);}
/* ---- painel geral ---- */
function euGeral(){var pg=document.querySelector('[data-eupg="geral"]');if(!pg)return;var h=hoje();
 var dias=euDias(h,CONC.prova),g=ccGeral(),sem=ccSemanaMin(),hj=ccHojeMin();
 var M=(S.est&&S.est.mapas)||[],rev=M.filter(function(m){return !m.next||diaN(m.next)<=hojeN();});
 var at=blocoAtual(),F=S.fr||[],fh=F.filter(function(f){return f.prox&&f.prox<=h;});
 var stat=function(k,v,s,cor,go){return '<button type="button" class="eu-st" style="--c:'+cor+'"'+(go?' data-eugo="'+go+'"':'')+'><small>'+k+'</small><b>'+v+'</b><span>'+s+'</span></button>';};
 var prox=CONC.marcos.filter(function(m){return m.d>=h;}).map(function(m){var n=euDias(h,m.d);return '<div class="eu-dl'+(n<=7?' perto':'')+'"><b>'+euEsc(m.t)+'</b><span>'+euBr(m.d)+' &middot; '+(n===0?'hoje':'em '+n+' dia'+(n>1?'s':''))+'</span></div>';}).join('');
 var mats=CONC.mat.slice().sort(function(a,b){return (b.p-a.p)||(a.c<b.c?-1:1);}).map(function(m){var p=ccProg(m);return '<div class="eu-mat" data-eugo="conc"><b>'+euEsc(m.c)+'</b><small>'+euEsc(m.n)+'</small><i><em style="width:'+Math.round(p.f*100)+'%"></em></i><span>'+p.v+'/'+p.t+' &middot; peso '+m.p+'</span></div>';}).join('');
 pg.innerHTML='<div class="eu-stats">'+
   stat('até a prova',dias>0?dias:'—',dias>0?'dias · '+euBr(CONC.prova):'prova realizada','var(--a-est)','conc')+
   stat('hoje',hj+' min','meta '+CONC.minDia+' min','var(--red)','tatica')+
   stat('semana',(Math.round(sem/6)/10).toString().replace('.',',')+' h','meta '+String(CONC.metaHoras).replace('.',',')+' h','var(--a-camp)','tatica')+
   stat('edital visto',g.pct+'%',g.v+' de '+g.t+' tópicos','var(--a-dos)','conc')+
   stat('revisões hoje',rev.length+fh.length,rev.length+' mapas · '+fh.length+' fichas','var(--a-fin)','tatica')+'</div>'+
  '<div class="eu-duo"><div class="eu-box"><h3>Próximo bloco</h3>'+(at?'<p class="eu-bloco">'+euEsc(discNome(at))+'</p><p class="eu-mut">volta '+S.est.volta+' do ciclo</p><button type="button" class="eu-bt" data-eugo="tatica">ir para a tática</button>':'<p class="eu-mut">monte a roda na Tática</p>')+'</div>'+
   '<div class="eu-box"><h3>Prazos</h3>'+(prox||'<p class="eu-mut">nenhum prazo à frente</p>')+'</div></div>'+
  '<div class="eu-box"><h3>Disciplinas do edital</h3><div class="eu-mats">'+mats+'</div></div>'+
  '<div class="eu-box"><h3>Rotina de estudo</h3><ul class="eu-rot">'+CONC.rotina.map(function(r){return '<li>'+euEsc(r)+'</li>';}).join('')+'</ul></div>';}
/* ---- fichas de revisão (Tática) ---- */
var EU_FED=null;
function euFichas(){var box=document.getElementById('eu-fichas');if(!box)return;var h=hoje(),F=(S.fr=S.fr||[]);
 var D=(S.est&&S.est.disc)||[];var opt=D.map(function(d){return '<option value="'+d.id+'">'+euEsc(d.nome)+'</option>';}).join('');
 var lista=F.slice().sort(function(a,b){return (a.prox||'9')<(b.prox||'9')?-1:1;}).map(function(f){var i=F.indexOf(f),due=f.prox&&f.prox<=h;
  var ck=[['rev','revisado'],['rec','recordado'],['ent','entendido']].map(function(c){return '<label><input type="checkbox" data-frck="'+i+'|'+c[0]+'"'+(f[c[0]]?' checked':'')+'> '+c[1]+'</label>';}).join('');
  return '<article class="eu-fr'+(due?' due':'')+'"><header><b>'+euEsc(f.top)+'</b><span>'+euEsc(discNome(f.disc))+(f.prox?' &middot; '+(due?'revisar hoje':'revisar em '+euBr(f.prox)):'')+'</span></header>'+
   (f.vis?'<p>'+euEsc(f.vis)+'</p>':'')+(f.pts?'<ul>'+f.pts.split('\n').filter(Boolean).map(function(p){return '<li>'+euEsc(p)+'</li>';}).join('')+'</ul>':'')+
   (f.res?'<p class="eu-res">'+euEsc(f.res)+'</p>':'')+'<div class="eu-ck">'+ck+'<span class="eu-nota">'+[1,2,3,4,5].map(function(n){return '<button type="button" data-frn="'+i+'|'+n+'" aria-pressed="'+((f.nota|0)>=n)+'">★</button>';}).join('')+'</span>'+
   '<button type="button" data-frr="'+i+'">revisei · próxima</button><button type="button" class="eu-x" data-frx="'+i+'" aria-label="Apagar ficha">✕</button></div></article>';}).join('');
 box.innerHTML='<div class="sec-card eu-frc"><h2 class="sec">Fichas de revisão <span>// estude para entender, não para decorar</span></h2>'+
  '<form class="eu-frf" data-frform><select name="disc" required>'+(opt||'<option value="">inclua disciplinas na roda</option>')+'</select><input name="top" maxlength="90" placeholder="tópico" required>'+
  '<textarea name="vis" rows="2" maxlength="400" placeholder="visão geral em 3 linhas"></textarea><textarea name="pts" rows="3" maxlength="600" placeholder="pontos-chave (um por linha)"></textarea>'+
  '<textarea name="res" rows="2" maxlength="400" placeholder="resumo com as suas palavras"></textarea><label class="eu-q">próxima revisão <input type="date" name="prox"></label><button>Guardar ficha</button></form>'+
  '<div class="eu-frl">'+(lista||'<p class="eu-mut">nenhuma ficha ainda</p>')+'</div></div>';}
function euFrSalva(){try{grava();}catch(e){}euFichas();}
aoIniciar(function(){

document.addEventListener('submit',function(e){var f=e.target;if(!f.matches||!f.matches('[data-frform]'))return;e.preventDefault();var t=f.top.value.trim();if(!t)return;
 var p=f.prox.value;if(!p){var d=new Date();d.setDate(d.getDate()+1);p=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 (S.fr=S.fr||[]).unshift({id:'fr'+Date.now(),disc:f.disc.value,top:t,vis:f.vis.value.trim(),pts:f.pts.value.trim(),res:f.res.value.trim(),prox:p,n:0,d:hoje()});euFrSalva();});
document.addEventListener('change',function(e){var c=e.target.closest&&e.target.closest('[data-frck]');if(!c)return;var a=c.getAttribute('data-frck').split('|'),f=S.fr[+a[0]];if(f){f[a[1]]=c.checked;euFrSalva();}});
});

var EU_PASSO=[1,3,7,15,30,60];
aoIniciar(function(){

document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-frn],[data-frr],[data-frx]');if(!t)return;
 if(t.hasAttribute('data-frn')){var a=t.getAttribute('data-frn').split('|'),f=S.fr[+a[0]];if(f){f.nota=+a[1];euFrSalva();}return;}
 if(t.hasAttribute('data-frr')){var f2=S.fr[+t.getAttribute('data-frr')];if(f2){f2.n=(f2.n|0)+1;var d=new Date();d.setDate(d.getDate()+EU_PASSO[Math.min(f2.n,EU_PASSO.length-1)]);f2.prox=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');f2.rev=true;euFrSalva();}return;}
 if(t.hasAttribute('data-frx')){S.fr.splice(+t.getAttribute('data-frx'),1);euFrSalva();}});
/* ---- liga ao painel direito e ao modo "nova aba" ---- */
(function(){var a0=pdAbre;pdAbre=function(k){var r=a0.apply(this,arguments);if(k==='lap'){try{euAba(EU_AB);}catch(e){console.error(e);}}return r;};})();
(function(){var p0=pinta;pinta=function(){var r=p0.apply(this,arguments);try{var eu=document.getElementById('eum');if(eu&&EU_AB==='geral'&&!eu.contains(document.activeElement))euGeral();}catch(e){}return r;};})();
});

function euSolo(){if(!/[?&](laptop|eumatheia)\b/.test(location.search))return;document.body.classList.add('eu-solo');document.title='Laptop · Astronáutica';if(/eumatheia/.test(location.search))EU_AB='ler';
 try{pdAbre('lap');}catch(e){}var a=document.querySelector('.eu-nova');if(a){a.textContent='voltar ao Astronáutica';a.href='./';a.removeAttribute('target');}}
aoIniciar(function(){

setTimeout(euSolo,0);
});


/* ---------------- Eumátheia: a estante de leitura ---------------- */
var LER_ST=[['pilha','Na pilha'],['lendo','Lendo'],['lido','Lido'],['desejo','Desejo']];
var LER_FMT=['Físico','E-book','Audiobook'];
var LER_FILTRO='lendo';
function lerAno(){return String(new Date().getFullYear());}
function lerBarras(itens,chave,ops){var tot=itens.length||1;return ops.map(function(o){var n=itens.filter(function(x){return (x[chave]||'')===o;}).length;return '<div class="ler-bar"><span>'+euEsc(o)+'</span><i><em style="width:'+Math.round(n/tot*100)+'%"></em></i><b>'+n+'</b></div>';}).join('');}
function lerPinta(){var pg=document.querySelector('[data-eupg="ler"]');if(!pg)return;var L=(S.ler=S.ler||[]),a=lerAno();
 var lendo=L.filter(function(x){return x.st==='lendo';}),pilha=L.filter(function(x){return x.st==='pilha';}),lidos=L.filter(function(x){return x.st==='lido'&&(x.fim||'').slice(0,4)===a;}),des=L.filter(function(x){return x.st==='desejo';});
 var pgs=pilha.reduce(function(s,x){return s+(x.pag|0);},0);
 var gens=[];L.forEach(function(x){if(x.gen&&gens.indexOf(x.gen)<0)gens.push(x.gen);});
 var escolha=pilha.length?pilha[(new Date().getDate())%pilha.length]:null;
 var st=function(k,v,s,c){return '<div class="eu-st" style="--c:'+c+'"><small>'+k+'</small><b>'+v+'</b><span>'+s+'</span></div>';};
 var vis=L.map(function(x,i){return {x:x,i:i};}).filter(function(o){return LER_FILTRO==='todos'||o.x.st===LER_FILTRO;});
 var linhas=vis.map(function(o){var x=o.x,i=o.i,pct=x.pag?Math.min(100,Math.round((x.at|0)/x.pag*100)):0;
  return '<article class="ler-it st-'+x.st+'"><div class="ler-capa" style="--h:'+((x.tit||'').length*37%360)+'">'+euEsc((x.tit||'?').slice(0,1))+'</div><div class="ler-tx"><b>'+euEsc(x.tit)+'</b><span>'+euEsc([x.aut,x.gen,x.fmt].filter(Boolean).join(' · '))+'</span>'+
   (x.st==='lendo'&&x.pag?'<div class="ler-pr"><i><em style="width:'+pct+'%"></em></i><label>pág. <input type="number" min="0" max="'+x.pag+'" value="'+(x.at|0)+'" data-lerpg="'+i+'"> de '+x.pag+'</label></div>':x.pag?'<span>'+x.pag+' páginas</span>':'')+
   (x.st==='desejo'&&x.preco?'<span>'+euEsc(x.preco)+'</span>':'')+'</div>'+
   '<div class="ler-ac"><select data-lerst="'+i+'">'+LER_ST.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===x.st?' selected':'')+'>'+s[1]+'</option>';}).join('')+'</select><button type="button" class="eu-x" data-lerx="'+i+'" aria-label="Remover">✕</button></div></article>';}).join('');
 pg.innerHTML='<div class="eu-box ler-cab"><span class="eu-k">a estante</span><h3 class="ler-h">Eumátheia</h3><p class="eu-mut">a facilidade de aprender &middot; o que está na pilha, o que você está lendo e o que já leu</p></div>'+
  '<div class="eu-stats">'+st('lendo',lendo.length,lendo.length?euEsc(lendo[0].tit):'nada aberto','var(--a-est)')+st('na pilha',pilha.length,pgs+' páginas esperando','var(--a-dos)')+st('lidos em '+a,lidos.length,'livros terminados','var(--a-camp)')+st('desejo',des.length,'para comprar','var(--a-fin)')+
   '<div class="eu-st" style="--c:var(--red)"><small>leitura do dia</small><b class="ler-pick">'+(escolha?euEsc(escolha.tit):'—')+'</b><span>'+(escolha?'sorteado da pilha':'a pilha está vazia')+'</span></div></div>'+
  '<div class="eu-duo"><div class="eu-box"><h3>Por formato</h3>'+lerBarras(L.filter(function(x){return x.st!=='desejo';}),'fmt',LER_FMT)+'</div><div class="eu-box"><h3>Por gênero</h3>'+(gens.length?lerBarras(L.filter(function(x){return x.st!=='desejo';}),'gen',gens):'<p class="eu-mut">os gêneros aparecem quando você cadastrar livros</p>')+'</div></div>'+
  '<div class="eu-box"><h3>Acrescentar livro</h3><form class="ler-f" data-lerform><input name="tit" placeholder="título" maxlength="90" required><input name="aut" placeholder="autor" maxlength="60"><input name="gen" placeholder="gênero" maxlength="30" list="ler-gens"><datalist id="ler-gens">'+gens.map(function(g){return '<option value="'+euEsc(g)+'">';}).join('')+'</datalist>'+
   '<select name="fmt">'+LER_FMT.map(function(f){return '<option>'+f+'</option>';}).join('')+'</select><input name="pag" type="number" min="0" placeholder="páginas"><select name="st">'+LER_ST.map(function(s){return '<option value="'+s[0]+'">'+s[1]+'</option>';}).join('')+'</select><input name="preco" placeholder="preço (desejo)" maxlength="20"><button>Guardar</button></form></div>'+
  '<div class="eu-box"><div class="ler-fl">'+[['lendo','Lendo'],['pilha','Na pilha'],['lido','Lidos'],['desejo','Desejo'],['todos','Todos']].map(function(f){return '<button type="button" data-lerf="'+f[0]+'" aria-pressed="'+(LER_FILTRO===f[0])+'">'+f[1]+' <small>'+(f[0]==='todos'?L.length:L.filter(function(x){return x.st===f[0];}).length)+'</small></button>';}).join('')+'</div>'+
   '<div class="ler-l">'+(linhas||'<p class="eu-mut">nada aqui ainda</p>')+'</div></div>';}
function lerSalva(){try{grava();}catch(e){}lerPinta();}
aoIniciar(function(){

document.addEventListener('submit',function(e){var f=e.target;if(!f.matches||!f.matches('[data-lerform]'))return;e.preventDefault();var t=f.tit.value.trim();if(!t)return;
 var o={id:'l'+Date.now(),tit:t,aut:f.aut.value.trim(),gen:f.gen.value.trim(),fmt:f.fmt.value,pag:+f.pag.value||0,st:f.st.value,preco:f.preco.value.trim(),d:hoje(),at:0};if(o.st==='lendo')o.ini=hoje();if(o.st==='lido')o.fim=hoje();
 (S.ler=S.ler||[]).unshift(o);LER_FILTRO=o.st;lerSalva();});
document.addEventListener('change',function(e){var s=e.target.closest&&e.target.closest('[data-lerst],[data-lerpg]');if(!s)return;
 if(s.hasAttribute('data-lerst')){var x=S.ler[+s.getAttribute('data-lerst')];if(!x)return;x.st=s.value;if(x.st==='lendo'&&!x.ini)x.ini=hoje();if(x.st==='lido'){x.fim=hoje();if(x.pag)x.at=x.pag;try{nvMove(0,2,'Leitura concluída: “'+euEsc(x.tit)+'”.',false,0,0,0);}catch(z){}}lerSalva();return;}
 var y=S.ler[+s.getAttribute('data-lerpg')];if(!y)return;y.at=Math.max(0,+s.value||0);if(y.pag&&y.at>=y.pag){y.st='lido';y.fim=hoje();try{nvMove(0,2,'Leitura concluída: “'+euEsc(y.tit)+'”.',false,0,0,0);}catch(z){}}lerSalva();});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-lerf],[data-lerx]');if(!t)return;
 if(t.hasAttribute('data-lerf')){LER_FILTRO=t.getAttribute('data-lerf');lerPinta();return;}
 S.ler.splice(+t.getAttribute('data-lerx'),1);lerSalva();});
});


/* ---------------- seletor de aba e de instrução no topo do Laptop ---------------- */
var EU_INST=[['pn','Painel de línguas'],['ru','Runas'],['se','Sessões'],['vo','Vocabulário'],['gr','Gramática'],['re','Recursos'],['cv','Conversação'],['te','Testes'],['sm','Semana']];
function euSel(){var cab=document.querySelector('#eum .eu-cab');if(!cab)return;var s=document.getElementById('eu-sel');
 if(!s){var w=document.createElement('label');w.className='eu-selw';w.innerHTML='<span>ir para</span><select id="eu-sel" aria-label="Escolher aba ou instrução"></select>';
  var nova=cab.querySelector('.eu-nova');var box=document.createElement('div');box.className='eu-cab-ac';cab.appendChild(box);box.appendChild(w);if(nova)box.appendChild(nova);
  s=w.querySelector('select');
  s.addEventListener('change',function(){var v=s.value.split(':');if(v[0]==='inst'&&v[1]){try{lpTab=v[1];}catch(e){}euAba('inst');try{pintaLP();}catch(e){}}else euAba(v[0]);});}
 var cur=EU_AB==='inst'?'inst:'+(typeof lpTab!=='undefined'?lpTab:'pn'):EU_AB;
 s.innerHTML=EU_ABAS.filter(function(a){return a[0]!=='inst';}).slice(0,3).map(function(a){return '<option value="'+a[0]+'">'+a[1]+'</option>';}).join('')+
  '<optgroup label="Instruções">'+EU_INST.map(function(t){return '<option value="inst:'+t[0]+'">'+t[1]+'</option>';}).join('')+'</optgroup>'+
  '<option value="ler">Eumátheia · leitura</option>';
 s.value=cur;}
aoIniciar(function(){

(function(){var a0=euAba;euAba=function(k){var r=a0.apply(this,arguments);try{euSel();}catch(e){}return r;};})();
(function(){var p0=pintaLP;pintaLP=function(){var r=p0.apply(this,arguments);try{if(EU_AB==='inst')euSel();}catch(e){}return r;};})();
});


