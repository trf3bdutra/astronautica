/* Cabeçalho: modo claro/escuro e controles do topo */
"use strict";
/* Tema claro/escuro sempre à mão no cabeçalho; usa o mesmo botão da barra antiga. */
function vxTema(){var top=VX&&VX.querySelector('.vx-top'),orig=document.getElementById('b-tema');if(!top||!orig)return;
 var b=document.getElementById('vx-tema');
 if(!b){b=document.createElement('button');b.id='vx-tema';b.type='button';b.className='vx-tema';
  b.onclick=function(){orig.click();setTimeout(vxTema,0);};top.appendChild(b);}
 var claro=document.body.classList.contains('claro');
 b.innerHTML='<i aria-hidden="true">'+(claro?'\u263E':'\u2600')+'</i>'+(claro?'modo escuro':'modo claro');
 b.setAttribute('aria-label',claro?'Mudar para o modo escuro':'Mudar para o modo claro');}

function nvChip(){var top=VX&&VX.querySelector('.vx-top');if(!top||!nvAtivo())return;
 var c=document.getElementById('nv-chip');
 if(!c){c=document.createElement('button');c.id='nv-chip';c.type='button';c.onclick=nvPainel;top.appendChild(c);}
 var hm=nv.quando?String(nv.quando.getHours()).padStart(2,'0')+':'+String(nv.quando.getMinutes()).padStart(2,'0'):'';
 var T={off:['só neste aparelho','entrar para sincronizar'],ok:['sincronizado',hm],env:['enviando…',''],
  baixa:['atualizando…',''],erro:['sem conexão','tenta de novo sozinho'],carregando:['nuvem','carregando…']}[nv.est]||['nuvem',''];
 c.className='nv-chip nv-'+nv.est;c.innerHTML='<i></i><b>'+T[0]+'</b>'+(T[1]?'<span>'+T[1]+'</span>':'');
 c.setAttribute('aria-label','Sincronização: '+T[0]+(T[1]?', '+T[1]:''));}
function nvEstado(e){nv.est=e;if(e==='ok')nv.quando=new Date();nvChip();}

function nvInicia(){nv.pronto=true;if(!nvAtivo())return;nvEstado('carregando');
 var s=document.createElement('script');s.src=NUVEM.lib;s.async=true;
 s.onload=function(){try{nv.cli=window.supabase.createClient(NUVEM.url,NUVEM.chave,{auth:{persistSession:true,autoRefreshToken:true}});}catch(e){nvEstado('erro');return;}
  nv.cli.auth.getSession().then(function(r){nv.user=r.data&&r.data.session?r.data.session.user:null;
   if(nv.user)nvPuxa(true);else nvEstado('off');});
  nv.cli.auth.onAuthStateChange(function(ev,ses){var u=ses?ses.user:null;var mudou=(u&&u.id)!==(nv.user&&nv.user.id);nv.user=u;
   if(!u){nvEstado('off');return;} if(mudou)nvPuxa(true);});};
 s.onerror=function(){nvEstado('erro');};
 document.head.appendChild(s);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&nv.user)nvPuxa(false);});
 window.addEventListener('online',function(){if(nv.user)nvPuxa(false);});}

function nvAgenda(){if(!nv.user||!nv.cli)return;clearTimeout(nv.t);nv.t=setTimeout(nvEnvia,2500);}
function nvEnvia(){if(!nv.user||!nv.cli||nv.ocupado)return;nv.ocupado=true;nvEstado('env');
 var ts=S._ts||Date.now(),dados=JSON.parse(JSON.stringify(S)),fin=nvFinLer(),fts=nvFinTs();
 var row={user_id:nv.user.id,dados:dados,atualizado:new Date(ts).toISOString()};if(fin){row.financas=fin;row.fin_ts=fts||Date.now();}
 nv.cli.from(NUVEM.tabela).upsert(row,{onConflict:'user_id'})
  .then(function(r){nv.ocupado=false;if(r.error){nvEstado('erro');return;}nvBaseSet(fin?{ts:ts,fts:row.fin_ts}:{ts:ts});nvEstado('ok');
   if((S._ts||0)>ts)nvAgenda();},function(){nv.ocupado=false;nvEstado('erro');});}
function nvAplica(dados,ts){S=normaliza(dados);S._ts=ts;
 try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
 nvBaseSet({ts:ts});try{pinta();}catch(e){} nvEstado('ok');}
function nvPuxa(primeira){if(!nv.user||!nv.cli||nv.ocupado)return;nvEstado('baixa');
 nv.cli.from(NUVEM.tabela).select('dados,atualizado,financas,fin_ts').eq('user_id',nv.user.id).maybeSingle().then(function(r){
  if(r.error){nvEstado('erro');return;}
  var base=nvBase(),meu=(base&&base.u===nv.user.id&&base.ts!=null)?base.ts:null,loc=S._ts||0;
  if(!r.data){nvEnvia();return;}
  var finSobe=nvFinResolve(r.data);
  if(!r.data.dados){nvEnvia();return;}
  var rts=+(r.data.dados&&r.data.dados._ts)||Date.parse(r.data.atualizado)||0;
  if(meu===null){ /* primeiro encontro deste aparelho com esta conta */
   nvEscolhe(r.data.dados,rts);return;}
  var nuvemMudou=rts>meu,aquiMudou=loc>meu;
  if(nuvemMudou&&!aquiMudou){nvAplica(r.data.dados,rts);if(finSobe)nvEnvia();return;}
  if(aquiMudou&&!nuvemMudou){nvEnvia();return;}
  if(nuvemMudou&&aquiMudou){
   if(rts>=loc){nvPor(NV_COPIA,JSON.stringify(S));nvAplica(r.data.dados,rts);vxMsg('Havia mudanças nos dois lados. Ficou a versão mais recente, da nuvem; a deste aparelho foi guardada como cópia.');}
   else{nvPor(NV_COPIA,JSON.stringify(r.data.dados));nvEnvia();vxMsg('Havia mudanças nos dois lados. Ficou a versão mais recente, deste aparelho; a da nuvem foi guardada como cópia.');}
   return;}
  if(finSobe){nvEnvia();return;}
  nvEstado('ok');},function(){nvEstado('erro');});}

function nvDlg(titulo,texto,corpo,botoes){var w=document.getElementById('vx-dlg');if(w)w.remove();
 w=document.createElement('div');w.id='vx-dlg';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML='<div class="vxd-bk"></div><div class="vxd-bx nv-dlg"><p class="vxd-t">'+titulo+'</p>'+(texto?'<p class="vxd-d">'+texto+'</p>':'')+(corpo||'')+
  '<p class="nv-erro" role="alert"></p><div class="vxd-bt">'+botoes.map(function(b,i){return '<button data-nvb="'+i+'"'+(b.forte?' data-dlg-ok':'')+'>'+b.t+'</button>';}).join('')+'</div></div>';
 document.body.appendChild(w);
 function fecha(){w.remove();}
 w.querySelector('.vxd-bk').onclick=fecha;
 w.addEventListener('keydown',function(e){if(e.key==='Escape')fecha();});
 botoes.forEach(function(b,i){w.querySelector('[data-nvb="'+i+'"]').onclick=function(){b.f?b.f(w,fecha):fecha();};});
 var f=w.querySelector('input');if(f)try{f.focus();}catch(e){}
 return w;}
function nvErro(w,t){var e=w.querySelector('.nv-erro');if(e)e.textContent=t;}
function nvCampos(w){return{email:(w.querySelector('#nv-email')||{}).value.trim(),senha:(w.querySelector('#nv-senha')||{}).value};}
function nvPainel(){if(!nv.cli){vxMsg(nvAtivo()?'A nuvem ainda está carregando.':'Nuvem não configurada.');return;}
 if(nv.user){var hm=nv.quando?nv.quando.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'ainda não';
  nvDlg('Sincronização','Conectado como <b>'+esc(nv.user.email||'')+'</b>. Última sincronização: '+hm+'.','',
   [{t:'fechar'},{t:'sair da conta',f:function(w,fecha){nv.cli.auth.signOut().then(function(){fecha();vxMsg('Saiu da conta. O registro continua neste aparelho.');});}},
    {t:'sincronizar agora',forte:true,f:function(w,fecha){fecha();nvPuxa(false);}}]);return;}
 var corpo='<label>E-mail<input id="nv-email" type="email" autocomplete="email" maxlength="200"></label>'+
  '<label>Senha<input id="nv-senha" type="password" autocomplete="current-password" minlength="8" maxlength="200"></label>';
 nvDlg('Entrar para sincronizar','Com login, o registro fica igual no celular, no computador e na extensão. Sem login, ele continua só neste aparelho.',corpo,
  [{t:'cancelar'},
   {t:'criar conta',f:function(w){var c=nvCampos(w);if(!c.email||c.senha.length<8)return nvErro(w,'Informe o e-mail e uma senha de 8 caracteres ou mais.');
    nvErro(w,'Criando…');nv.cli.auth.signUp({email:c.email,password:c.senha,options:{emailRedirectTo:location.origin+location.pathname}}).then(function(r){
     if(r.error)return nvErro(w,r.error.message);
     if(r.data&&r.data.session){w.remove();vxMsg('Conta criada. Sincronizando.');}
     else nvErro(w,'Conta criada. Confirme pelo link enviado ao seu e-mail e depois entre aqui.');});}},
   {t:'entrar',forte:true,f:function(w,fecha){var c=nvCampos(w);if(!c.email||!c.senha)return nvErro(w,'Informe e-mail e senha.');
    nvErro(w,'Entrando…');nv.cli.auth.signInWithPassword({email:c.email,password:c.senha}).then(function(r){
     if(r.error)return nvErro(w,r.error.message==='Invalid login credentials'?'E-mail ou senha não conferem.':r.error.message);
     fecha();vxMsg('Conectado. Sincronizando.');});}}]);
 var w=document.getElementById('vx-dlg');w.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();w.querySelector('[data-dlg-ok]').click();}});}
function nvEscolhe(dadosNuvem,rts){
 var dn=new Date(rts),dl=new Date(S._ts||Date.now());
 function f(d){return d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
 nvDlg('Qual registro vale?','Já existe um registro na nuvem (gravado em '+f(dn)+') e outro neste aparelho (gravado em '+f(dl)+'). O que não for escolhido fica guardado como cópia neste aparelho.','',
  [{t:'usar o deste aparelho',f:function(w,fecha){fecha();nvPor(NV_COPIA,JSON.stringify(dadosNuvem));S._ts=Date.now();nvEnvia();}},
   {t:'usar o da nuvem',forte:true,f:function(w,fecha){fecha();nvPor(NV_COPIA,JSON.stringify(S));nvAplica(dadosNuvem,rts);}}]);
 nvEstado('ok');}
aoIniciar(function(){

setTimeout(function(){try{nvInicia();}catch(e){console.error('nuvem:',e);}},0);
});


