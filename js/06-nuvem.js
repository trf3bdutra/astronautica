/* Nuvem: sincronização com o Supabase (registro e finanças) */
"use strict";
/* ---------- Nuvem: sincronização do registro com o Supabase ----------
   O registro continua salvo no navegador. Com login, cada gravação também
   sobe para a tabela vertice_estado (uma linha por usuário, protegida por RLS).
   Regra: compara o _ts do registro com a última versão sincronizada (base).
   Só a nuvem mudou -> baixa. Só o aparelho mudou -> envia. Os dois -> fica o
   mais recente e o outro vai para uma cópia de segurança local. */
var NUVEM={url:"https://gubpygurtxadsncthttg.supabase.co",chave:"sb_publishable_O9whelpXkVZ8tvgD_8t2EA_LPaeDcmy",tabela:"vertice_estado",
 lib:"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"};
var nv={cli:null,user:null,est:"off",quando:null,t:null,pronto:false,ocupado:false};var NV_BASE, NV_COPIA;
aoIniciar(function(){
NV_BASE=KEY+"-nuvem-base";
NV_COPIA=KEY+"-conflito";
});

function nvAtivo(){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(NUVEM.url)&&NUVEM.chave.length>20;}
function nvLer(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function nvPor(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function nvBase(){var b=nvLer(NV_BASE);if(!b)return null;try{return JSON.parse(b);}catch(e){return null;}}
function nvBaseSet(p){var b=nvBase()||{};if(!nv.user)return;if(b.u!==nv.user.id)b={u:nv.user.id};for(var k in p)b[k]=p[k];nvPor(NV_BASE,JSON.stringify(b));}/* Finanças (AxisHub, aba Tesouro): mesma origem, chave própria e relógio próprio. */
var FIN_KEY, FIN_TS;
aoIniciar(function(){
FIN_KEY='sfp_bruno_v4';
FIN_TS=FIN_KEY+'__ts';
});

function nvFinLer(){var v=nvLer(FIN_KEY);if(!v)return null;try{return JSON.parse(v);}catch(e){return null;}}
function nvFinTs(){return +(nvLer(FIN_TS)||0);}
aoIniciar(function(){

window.addEventListener('storage',function(e){if(e.key===FIN_KEY){nvPor(FIN_TS,String(Date.now()));nvAgenda();}});
});

function nvFinAplica(obj,ts){try{localStorage.setItem(FIN_KEY,JSON.stringify(obj));}catch(e){}nvPor(FIN_TS,String(ts));nvBaseSet({fts:ts});
 try{if(window.AX&&AX.recarrega)AX.recarrega();}catch(e){}}
/* devolve true quando as finanças deste aparelho precisam subir */
function nvFinResolve(row){var rf=+row.fin_ts||0,lf=nvFinTs(),R=row.financas,L=nvFinLer(),b=nvBase(),bf=(b&&nv.user&&b.u===nv.user.id&&b.fts!=null)?b.fts:null;
 if(!R&&!L)return false; if(!R)return true; if(!L){nvFinAplica(R,rf);return false;}
 if(bf===null){if(rf>=lf){nvPor(FIN_KEY+'-conflito',JSON.stringify(L));nvFinAplica(R,rf);return false;}return true;}
 var rc=rf>bf,lc=lf>bf; if(rc&&!lc){nvFinAplica(R,rf);return false;} if(lc&&!rc)return true;
 if(rc&&lc){if(rf>=lf){nvPor(FIN_KEY+'-conflito',JSON.stringify(L));nvFinAplica(R,rf);return false;}nvPor(FIN_KEY+'-conflito',JSON.stringify(R));return true;}
 return false;}
aoIniciar(function(){

(function(){var g0=grava;grava=function(){if(nv.pronto)S._ts=Date.now();g0();if(nv.pronto)nvAgenda();};})();
(function(){var n0=normaliza;normaliza=function(p){var b=n0(p);b._ts=+(p&&p._ts)||0;return b;};})();
(function(){var r0=vxRender;vxRender=function(){r0();vxTema();nvChip();};})();
});

