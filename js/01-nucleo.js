/* Núcleo: estado (S), constantes, limpeza, normalização e gravação */
"use strict";
var KEY="arquivo-sigma-vertice-v2", LIMIAR=60, LASTRO_T=0.6;
var ARS=[
 ["reg","Regulador de amplitude","AMPLITUDE GOVERNOR",60,300,
  "O continente que o mapa n\u00e3o deu, em hardware: a corrente aceita mais antes de virar fogo.",
  "limiar de combust\u00e3o +10"],
 ["ant","Antena filtrada","FILTERED ANTENNA",90,300,
  "N\u00e3o desliga a varredura \u2014 p\u00f5e peneira nela. O ciclo abre com menos ru\u00eddo herdado.",
  "satura\u00e7\u00e3o de abertura de ciclo: +4 em vez de +6"],
 ["rees","Reentrada assistida","ASSISTED RE-ENTRY",120,700,
  "A queda continua, mas com freio: o ciclo seguinte nasce devendo menos do que gastou.",
  "rebote cobra 18 em vez de 24"],
 ["cam","C\u00e2mara ampliada","EXPANDED CHAMBER",150,700,
  "A porta fechada passa a caber mais: a mesma travessia converte mais ru\u00eddo em dom\u00ednio.",
  "travessia: +9 dom\u00ednio e \u221218 de satura\u00e7\u00e3o"],
 ["rup2","Segundo colapso","SECOND COLLAPSE",240,1500,
  "Duas rupturas no mesmo ciclo. Potente e caro: o gasto dobra junto.",
  "duas rupturas por ciclo"],
 ["cond","Condutor de lastro","BALLAST CONDUIT",180,700,
  "Nada muda no poder: muda o quanto cada avan\u00e7o deixa guardado.",
  "lastro cunhado por dom\u00ednio: 0,85 em vez de 0,6"]
];
function temAr(k){ return (S.ars||[]).indexOf(k)>=0; }
function arsItem(k){ for(var i=0;i<ARS.length;i++) if(ARS[i][0]===k) return ARS[i]; return null; }
var PATENTES=[{min:1500,n:"Alfa est&aacute;vel",d:"dom&iacute;nio do limiar"},{min:700,n:"Alfa",d:"pleno"},
  {min:300,n:"Beta",d:"operacional"},{min:100,n:"Delta",d:"intermitente"},{min:0,n:"Epsilon",d:"inst&aacute;vel"}];
var EN={baixa:{carga:3,dom:2,min:0,rot:"energia baixa"},media:{carga:8,dom:5,min:35,rot:"energia m&eacute;dia"},alta:{carga:15,dom:10,min:60,rot:"energia alta"}};
var CANAIS=[
 {id:"cor",n:"Correspond&ecirc;ncia",cor:"#d9a13b"},{id:"din",n:"Dinheiro",cor:"#5f9e6a"},
 {id:"lig",n:"Liga&ccedil;&otilde;es",cor:"#c43a33"},{id:"des",n:"Deslocamento",cor:"#56a6bd"},
 {id:"pes",n:"Pessoas",cor:"#8f7fc4"},{id:"dig",n:"Digital",cor:"#6e7a8c"}];
var DECK=[
 {id:"cor1",c:"cor",e:"baixa",t:6,h:"A pilha de papel",p:"A mesa volta a ser mesa.",s:["Separe em tr&ecirc;s montes: pagar, guardar, lixo.","Jogue o monte do lixo fora agora.","Fotografe s&oacute; o que exige a&ccedil;&atilde;o."],d:"N&atilde;o leia nada por inteiro. Triagem n&atilde;o &eacute; leitura."},
 {id:"cor2",c:"cor",e:"media",t:15,h:"Caixa de entrada at&eacute; o fundo",p:"O n&uacute;mero vermelho some.",s:["Arquive tudo que n&atilde;o pede resposta.","Marque os tr&ecirc;s que pedem.","Responda o mais curto agora."],d:"Arquivar n&atilde;o &eacute; ler. O bot&atilde;o existe para isso."},
 {id:"cor3",c:"cor",e:"baixa",t:4,h:"O e-mail de duas semanas",p:"Aquele peso espec&iacute;fico acaba.",s:["Abra.","Escreva tr&ecirc;s linhas.","Envie sem reler duas vezes."],d:"Atraso n&atilde;o precisa de desculpa, s&oacute; de resposta."},
 {id:"cor4",c:"cor",e:"baixa",t:5,h:"Comprovantes do m&ecirc;s",p:"A gaveta para de acumular.",s:["Junte os papéis do m&ecirc;s.","Fotografe e salve na pasta.","Descarte o papel."],d:"Comprovante digital conta. Papel &eacute; opcional."},
 {id:"din1",c:"din",e:"baixa",t:8,h:"Boletos da semana",p:"Nenhum vencimento te pega de surpresa.",s:["Abra o app do banco.","Pague um por um.","Arquive os comprovantes."],d:"Conferir or&ccedil;amento &eacute; outra ficha. Esta s&oacute; paga."},
 {id:"din2",c:"din",e:"media",t:12,h:"Fatura sob suspeita",p:"Voc&ecirc; passa a saber para onde foi.",s:["Abra a fatura fechada.","Marque o que n&atilde;o reconhece.","Conteste ou aceite, sem terceira op&ccedil;&atilde;o."],d:"Tr&ecirc;s minutos por linha desconhecida, no m&aacute;ximo."},
 {id:"din3",c:"din",e:"baixa",t:5,h:"Uma assinatura a menos",p:"Sai dinheiro do piloto autom&aacute;tico.",s:["Escolha uma que voc&ecirc; n&atilde;o usou este m&ecirc;s.","Ache o bot&atilde;o de cancelar.","Confirme."],d:"Uma por ficha. Cancelar tudo de uma vez nunca acontece."},
 {id:"din4",c:"din",e:"media",t:15,h:"Lan&ccedil;ar o que faltou",p:"A planilha para de mentir.",s:["Abra a planilha.","Lance s&oacute; o m&ecirc;s corrente.","Feche sem arrumar o resto."],d:"M&ecirc;s corrente. O passado fica no passado."},
 {id:"lig1",c:"lig",e:"media",t:10,h:"A liga&ccedil;&atilde;o que voc&ecirc; evita",p:"O assunto sai da sua cabe&ccedil;a.",s:["Escreva em uma linha o que vai pedir.","Ligue.","Anote o que ficou combinado."],d:"A linha escrita antes elimina metade do travamento."},
 {id:"lig2",c:"lig",e:"media",t:20,h:"Protocolo com a operadora",p:"Existe protocolo, existe prova.",s:["Deixe CPF e n&uacute;mero do contrato &agrave; m&atilde;o.","Ligue e explique uma vez s&oacute;.","Anote o protocolo antes de desligar."],d:"Sem protocolo anotado, a liga&ccedil;&atilde;o n&atilde;o aconteceu."},
 {id:"lig3",c:"lig",e:"baixa",t:3,h:"Confirmar o agendamento",p:"A data vira certeza.",s:["Ligue.","Confirme data e hora.","Lance no calend&aacute;rio na hora."],d:"Confirmar custa tr&ecirc;s minutos; remarcar custa uma semana."},
 {id:"lig4",c:"lig",e:"baixa",t:4,h:"Cobrar a resposta",p:"A bola sai do seu lado.",s:["Ligue.","Pergunte o prazo.","Anote a data do retorno."],d:"Cobrar n&atilde;o &eacute; incomodar. &Eacute; devolver a bola."},
 {id:"des1",c:"des",e:"baixa",t:6,h:"Lista do balc&atilde;o",p:"Uma sa&iacute;da resolve cinco pend&ecirc;ncias.",s:["Liste o que s&oacute; resolve presencialmente.","Agrupe por bairro.","Marque um dia no calend&aacute;rio."],d:"Agrupar por bairro transforma cinco sa&iacute;das em uma."},
 {id:"des2",c:"des",e:"baixa",t:5,h:"Documentos antes de sair",p:"Voc&ecirc; n&atilde;o volta sem resolver.",s:["Confira a lista de documentos exigidos.","Separe originais e c&oacute;pias.","Ponha na pasta hoje, n&atilde;o amanh&atilde;."],d:"Viagem perdida por documento faltando &eacute; a pior moeda."},
 {id:"des3",c:"des",e:"media",t:10,h:"Compra &uacute;nica",p:"A casa para de faltar coisa pela metade.",s:["Fotografe geladeira e arm&aacute;rio.","Monte a lista pela foto.","V&aacute; uma vez s&oacute;."],d:"A foto decide por voc&ecirc; no corredor."},
 {id:"des4",c:"des",e:"baixa",t:6,h:"Devolver o que est&aacute; parado",p:"O canto da sala se recupera.",s:["Ache a nota fiscal.","Embale.","Leve na pr&oacute;xima sa&iacute;da."],d:"Prazo de troca corre mesmo quando voc&ecirc; n&atilde;o olha."},
 {id:"pes1",c:"pes",e:"baixa",t:8,h:"Mensagens acumuladas",p:"O vermelho do aplicativo zera.",s:["Abra.","Responda uma linha em cada.","N&atilde;o se desculpe pelo atraso."],d:"Resposta curta hoje vale mais que resposta completa nunca."},
 {id:"pes2",c:"pes",e:"baixa",t:5,h:"Quem est&aacute; esperando voc&ecirc;",p:"Ningu&eacute;m fica no escuro.",s:["Liste quem aguarda retorno.","Mande um prazo realista.","Cumpra o prazo mandado."],d:"Prazo realista &eacute; o dobro do que voc&ecirc; quer prometer."},
 {id:"pes3",c:"pes",e:"media",t:5,h:"O n&atilde;o que j&aacute; est&aacute; decidido",p:"O compromisso para de pesar.",s:["Escolha o compromisso que voc&ecirc; j&aacute; sabe que n&atilde;o vai cumprir.","Recuse em duas linhas.","N&atilde;o justifique."],d:"Justificativa abre negocia&ccedil;&atilde;o. Duas linhas fecham."},
 {id:"pes4",c:"pes",e:"baixa",t:3,h:"Agradecer pendente",p:"A d&iacute;vida social fecha.",s:["Escolha uma pessoa.","Mande a mensagem.","Encerre o assunto."],d:"Tarde e sincero vence impec&aacute;vel e inexistente."},
 {id:"dig1",c:"dig",e:"baixa",t:5,h:"Backup atrasado",p:"O risco silencioso acaba.",s:["Conecte o disco ou abra a nuvem.","Rode.","Confira que terminou."],d:"Backup que voc&ecirc; nunca verificou n&atilde;o &eacute; backup."},
 {id:"dig2",c:"dig",e:"baixa",t:6,h:"Cadastro vencido",p:"O acesso para de travar na hora errada.",s:["Identifique qual est&aacute; vencido.","Atualize.","Salve o comprovante."],d:"Cadastro trava sempre no dia do prazo."},
 {id:"dig3",c:"dig",e:"baixa",t:4,h:"&Aacute;rea de trabalho",p:"A tela deixa de gritar.",s:["Crie uma pasta com o nome do m&ecirc;s.","Arraste tudo para dentro.","Apague s&oacute; o obviamente descart&aacute;vel."],d:"Arquivar em bloco vence organizar arquivo por arquivo."},
 {id:"dig4",c:"dig",e:"media",t:8,h:"A senha repetida",p:"Uma brecha a menos.",s:["Escolha a conta mais cr&iacute;tica.","Gere senha nova.","Salve no gerenciador."],d:"Uma conta por ficha. Trocar todas de uma vez nunca acontece."}];
var RECOMPENSAS=[
 {min:0,c:40,h:"L\u00e2mina livre",p:"Uma tarde sem abrir o acervo, sem culpa e sem compensar depois."},
 {min:100,c:120,h:"Noite sem pauta",p:"Um ciclo inteiro sem abrir nada de trabalho."},
 {min:300,c:300,h:"Compra adiada",p:"Aquilo que voc&ecirc; vem empurrando h&aacute; meses."},
 {min:700,c:700,h:"Dia de projeto pr&oacute;prio",p:"Um dia inteiro no que ningu&eacute;m pediu."},
 {min:1500,c:1500,h:"Viagem curta",p:"Casa 9 cobrando o que lhe &eacute; devido."}];
var PROVAS=[
 {id:"pv1",n:"Mesa limpa",d:"Liquidar 20 fichas do baralho.",alvo:20,pg:80,f:function(){var k,n=0;for(k in S.fichas)n++;return n;}},
 {id:"pv2",n:"Continente firme",d:"Sete dias com \u00edndice de conten\u00e7\u00e3o em 70 ou mais.",alvo:7,pg:120,f:function(){return contencao().v>=70?7:Math.round(contencao().v/10);}},
 {id:"pv3",n:"Rota declarada",d:"Declarar a rota em 10 ciclos.",alvo:10,pg:90,f:function(){var k,n=0;for(k=0;k<S.log.length;k++) if((S.log[k].d||"").indexOf("Declara")===0)n++;return n;}},
 {id:"pv4",n:"Banco vivo",d:"Levar 30 termos ao est\u00e1gio dominado.",alvo:30,pg:140,f:function(){var k,n=0;for(k=0;k<S.voc.length;k++) if(etapa(S.voc[k].lvl|0)===3)n++;return n;}},
 {id:"pv5",n:"Volta fechada",d:"Fechar 3 voltas da roda de estudos.",alvo:3,pg:150,f:function(){return Math.max(0,((S.est&&S.est.volta)|0)-1);}},
 {id:"pv6",n:"Sem queima",d:"Dez ciclos sem combust\u00e3o nem queima seca.",alvo:10,pg:200,f:function(){return Math.max(0,10-((S.queimas|0)+(S.falsos|0))*3);}}
];var el;
aoIniciar(function(){
el=function(i){return document.getElementById(i);};
});

var filtro="todos", soDisp=false;
function hoje(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function hora(){var d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function clamp(v,a,b){v=Number(v)||0;return v<a?a:(v>b?b:v);}
function SEED(){return{at:0,decl:null,
 af:["[exemplo \u2014 troque pelo seu] Meu motor n\u00e3o roda a disciplina. Roda a sentido, e o sentido eu doso.",
     "[exemplo] O que eu descarto n\u00e3o se perde. Fica guardado e volta como dado.",
     "[exemplo] N\u00e3o preciso de energia alta para avan\u00e7ar. Preciso de uma carta por vez."],
 vi:["[exemplo \u2014 troque pelo seu] O acervo zerado e a mesa limpa antes do fim do ciclo.",
     "[exemplo] A aprova\u00e7\u00e3o saindo, e o nome lido em voz alta."]};}
function LANGS(){return[
 {id:"l-en",nome:"Ingl\u00eas",atual:"B2",alvo:"C1",meta:120,exame:null,melhor:null,tipo:"idioma"},
 {id:"l-it",nome:"Italiano",atual:"A1",alvo:"B1",meta:120,exame:null,melhor:null,tipo:"idioma"},
 {id:"l-gr",nome:"Grego",atual:"alfabeto",alvo:"leitura",meta:90,exame:null,melhor:null,tipo:"idioma"},
 {id:"l-ru",nome:"Runas",atual:"24 signos",alvo:"leitura combinada",meta:60,exame:null,melhor:null,tipo:"sistema"},
 {id:"l-nu",nome:"Numerologia",atual:"1\u20139 e mestres",alvo:"leitura de mapa",meta:60,exame:null,melhor:null,tipo:"sistema"},
 {id:"l-hi",nome:"Hier\u00f3glifos",atual:"unil\u00edteros",alvo:"leitura de cartela",meta:60,exame:null,melhor:null,tipo:"sistema"}
];}
function limpo(){return{carga:60,dominio:0,falsos:0,sat:0,ciclo:hoje(),usos:{rup:0,rede:0,ater:0,desc:0,menu:0,pomo:0,trav:0},hist:[60],log:[],fichas:{},extras:[],premios:{},eco:{r:0,c:0},puxada:null,ign:SEED(),langs:LANGS(),lsem:LANGS().map(function(x){return x.id;}),sess:[],voc:[],gram:[],rec:[],conv:[],test:[],sem:[],cod:'ASTROMANTE',modo:'fixo',idi:'en',mis:null,anim:true,tema:'escuro',duo:true,est:{disc:[],ordem:[],at:0,volta:1,blocos:[],mapas:[],vis:''},kr:{exp:[],r1:0,r2:0,r3:0},nasc:null,par:null,pc:{ret:[],plat:[],cred:[],qr:[],reg:[]},atu:{},sonoHM:{},wp:[],rev:{},retrato:null,faixa:null,placas:{},cap:[],hab:[],proj:[],menu:[],notas:[],diario:{},sono:{},agua:{},ativ:{},refs:{},estado:{},run:{lv:{},tir:[],aberta:null,q:''},rel:[],apt:[{id:'a1',nome:'Arco e flecha',cat:'corpo',min:0,marco:'Agrupar tr\u00eas flechas no mesmo ponto a 18 m.'},{id:'a2',nome:'Violino',cat:'instrumento',min:0,marco:'Uma pe\u00e7a inteira de cor, sem parar.'}],drenos:[],aguaH:[],inicio:hoje(),ultAter:null,ultCont:null,gasto:0,queimas:0,lastro:0,provas:{},tb:{},livro:[],lic:[],ars:[]};}var S;
aoIniciar(function(){
S=limpo();
});


function normaliza(p){var b=limpo();
 b.carga=clamp(p.carga,0,100); b.dominio=Math.max(0,p.dominio|0); b.falsos=Math.max(0,p.falsos|0);
 b.ciclo=typeof p.ciclo==="string"?p.ciclo:hoje();
 b.sat=clamp(p.sat,0,100);
 if(typeof p.cod==="string"&&p.cod) b.cod=p.cod;
 if(p.modo==="fase"||p.modo==="fixo") b.modo=p.modo;
 if(p.sono&&typeof p.sono==="object") b.sono=p.sono;
 if(p.agua&&typeof p.agua==="object") b.agua=p.agua;
 if(p.ativ&&typeof p.ativ==="object") b.ativ=p.ativ;
 if(p.refs&&typeof p.refs==="object") b.refs=p.refs;
 if(p.estado&&typeof p.estado==="object") b.estado=p.estado;
 if(p.diario&&typeof p.diario==="object") b.diario=p.diario;
 if(typeof p.retrato==="string") b.retrato=p.retrato;
 if(typeof p.faixa==="string") b.faixa=p.faixa;
 if(b.cod==="V\u00c9RTICE") b.cod="ASTROMANTE";
 if(p.idi==="pt"||p.idi==="en") b.idi=p.idi;
 if(p.placas&&typeof p.placas==="object") b.placas=p.placas;
 if(p.mis&&typeof p.mis==="object") b.mis=p.mis;
 if(p.anim===false) b.anim=false;
 b.lastro=p.lastro|0;
 if(p.tb&&typeof p.tb==="object") b.tb=p.tb;
 if(Array.isArray(p.livro)) b.livro=p.livro;
 if(Array.isArray(p.lic)) b.lic=p.lic;
 if(Array.isArray(p.ars)) b.ars=p.ars.filter(function(k){return ARS.some(function(a){return a[0]===k;});});
 if(p.provas&&typeof p.provas==="object") b.provas=p.provas;
 if(p.tema==="claro"||p.tema==="escuro") b.tema=p.tema;
 if(p.duo===false) b.duo=false;
 if(Array.isArray(p.langs)) b.langs=p.langs;
 b.lsem=Array.isArray(p.lsem)?p.lsem.slice():[];
 (function(){ var SE=LANGS(),i,k,tem;
  for(i=0;i<SE.length;i++){ if(b.lsem.indexOf(SE[i].id)>=0) continue;
   tem=false; for(k=0;k<b.langs.length;k++) if(b.langs[k].id===SE[i].id) tem=true;
   if(!tem) b.langs.push(SE[i]);
   b.lsem.push(SE[i].id); } })();
 if(p.est&&typeof p.est==="object"){ var E=b.est;
  if(Array.isArray(p.est.disc)) E.disc=p.est.disc;
  if(Array.isArray(p.est.ordem)) E.ordem=p.est.ordem;
  if(Array.isArray(p.est.blocos)) E.blocos=p.est.blocos;
  if(Array.isArray(p.est.mapas)) E.mapas=p.est.mapas;
  E.at=p.est.at|0; E.volta=(p.est.volta|0)||1;
  if(typeof p.est.vis==="string") E.vis=p.est.vis; }
 if(p.nasc&&typeof p.nasc==="object") b.nasc=p.nasc;
 if(p.par&&typeof p.par==="object") b.par=p.par;
 if(p.kr&&typeof p.kr==="object"){ b.kr.r1=p.kr.r1|0; b.kr.r2=p.kr.r2|0; b.kr.r3=p.kr.r3|0;
  if(Array.isArray(p.kr.exp)) b.kr.exp=p.kr.exp; }
 if(p.pc&&typeof p.pc==="object"){ var PK=["ret","plat","cred","qr","reg"],pi;
  for(pi=0;pi<PK.length;pi++) if(Array.isArray(p.pc[PK[pi]])) b.pc[PK[pi]]=p.pc[PK[pi]]; }
 if(p.atu&&typeof p.atu==="object") b.atu=p.atu;
 if(p.sonoHM&&typeof p.sonoHM==="object") b.sonoHM=p.sonoHM;
 if(p.rev&&typeof p.rev==="object") b.rev=p.rev;
 if(Array.isArray(p.wp)) b.wp=p.wp;
 if(typeof p.inicio==="string") b.inicio=p.inicio;
 b.gasto=Math.max(0,p.gasto|0); b.queimas=Math.max(0,p.queimas|0);
 if(typeof p.ultAter==="string") b.ultAter=p.ultAter;
 if(typeof p.ultCont==="string") b.ultCont=p.ultCont;
 if(p.eco){b.eco.r=Math.max(0,p.eco.r|0);b.eco.c=Math.max(0,p.eco.c|0);}
 if(typeof p.puxada==="string")b.puxada=p.puxada;
 if(p.ign){ b.ign.af=Array.isArray(p.ign.af)?p.ign.af.slice(0,30):[];
  b.ign.vi=Array.isArray(p.ign.vi)?p.ign.vi.slice(0,30):[];
  b.ign.at=p.ign.at|0; b.ign.decl=typeof p.ign.decl==="string"?p.ign.decl:null;
  b.ign.fo=Array.isArray(p.ign.fo)?p.ign.fo.slice(0,12):[]; b.ign.foAt=p.ign.foAt|0; }
 else { b.ign=SEED(); }
 var LS=["langs","sess","voc","gram","rec","conv","test","sem","rel","apt","drenos","aguaH","cap","hab","proj","menu","notas"];
 for(var q=0;q<LS.length;q++) if(Array.isArray(p[LS[q]])) b[LS[q]]=p[LS[q]].slice(0,600);
 b.langs=b.langs.filter(function(l){return l&&l.id!=="l-ta";});
 ["sess","voc","gram","rec","conv","test"].forEach(function(k){b[k]=b[k].filter(function(x){return !x||x.lang!=="l-ta";});});
 if(p.usos){b.usos.rup=p.usos.rup|0;b.usos.rede=p.usos.rede|0;b.usos.ater=p.usos.ater|0;b.usos.desc=p.usos.desc|0; b.usos.menu=p.usos.menu|0; b.usos.pomo=p.usos.pomo|0; b.usos.trav=p.usos.trav|0;}
 b.hist=Array.isArray(p.hist)?p.hist.slice(-28).map(function(v){return clamp(v,0,100);}):[b.carga];
 b.log=Array.isArray(p.log)?p.log.slice(0,40):[];
 if(p.fichas&&typeof p.fichas==="object") b.fichas=p.fichas;
 if(Array.isArray(p.extras)) b.extras=p.extras.slice(0,40);
 if(p.premios&&typeof p.premios==="object") b.premios=p.premios;
 return b;}
function ler(){try{var r=localStorage.getItem(KEY);if(r){var p=JSON.parse(r);if(p&&typeof p.carga==="number")S=normaliza(p);}}catch(e){}}
function grava(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){ var m=el("msg"); if(m) m.textContent="armazenamento cheio \u2014 remova uma imagem"; } el("dump").value=JSON.stringify(S);}
function anota(t,v,b,man){S.log.unshift({t:hora(),d:t,v:v,bad:!!b,dia:hoje(),man:!!man}); if(S.log.length>40)S.log.length=40;}
function todas(){return DECK.concat(S.extras);}
function canal(id){for(var i=0;i<CANAIS.length;i++) if(CANAIS[i].id===id) return CANAIS[i]; return CANAIS[0];}

function cicloNovo(){ if(S.ciclo===hoje())return;
 S.ciclo=hoje(); S.usos={rup:0,rede:0,ater:0,desc:0,menu:0,pomo:0,trav:0}; S.mis=null; S.sat=clamp(S.sat+(temAr("ant")?4:6),0,100);
 var LC=limComb(), queimou=(S.gasto|0)>=LC, dec=queimou?(temAr("rees")?18:24):12;
 if(queimou) S.queimas=(S.queimas|0)+1;
 S.gasto=0;
 var a=S.carga; S.carga=clamp(S.carga-dec,0,100);
 S.hist.push(S.carga); if(S.hist.length>28)S.hist.shift();
 anota(queimou?"Rebote de combust&atilde;o. O ciclo anterior queimou tudo &mdash; este nasce devendo o dobro."
              :"Ciclo novo. Entusiasmo decai sozinho &mdash; nenhum sistema mant&eacute;m voltagem parado.",S.carga-a,queimou);}

var PROT={
 obs:{n:"OBSERVAT\u00d3RIO",g:"leitura",
  d:"Decodifica\u00e7\u00e3o em primeiro plano. Sess\u00e3o de estudo custa metade da carga e satura mais r\u00e1pido.",
  m:["sess\u00e3o de estudo: custo \u00d7\u00bd","satura\u00e7\u00e3o da sess\u00e3o: +6","ruptura rende 34 de dom\u00ednio"]},
 pres:{n:"C\u00c2MARA DE PRESS\u00c3O",g:"opera\u00e7\u00e3o",
  d:"Modo padr\u00e3o. Ruptura liberada no limiar, com b\u00f4nus m\u00e1ximo de dom\u00ednio para o n\u00f3 mais denso do dia.",
  m:["ruptura rende 45 de dom\u00ednio","sess\u00e3o de estudo: custo integral","aterramento: retorno normal"]},
 solo:{n:"SOLO",g:"repouso",
  d:"Entra sozinho abaixo de 40 de carga, ou por designa\u00e7\u00e3o. Interven\u00e7\u00e3o pesada travada; recarga dobrada.",
  m:["ruptura travada","aterramento: retorno \u00d72","l\u00e2mina do baralho: custo \u00d7\u00bd"]}
};
function prot(){
 var c=(S.modo==="fase")?FASES[faseIdx()][0]:(S.cod||"ASTROMANTE");
 if(c==="PERIGEU"||c==="PERIGEE") return "solo";
 if(S.carga<40) return "solo";
 if(c==="ASTROMANTE"||c==="ASTROMANCER"||c==="SONDA"||c==="PROBE") return "obs";
 return "pres";
}
function pm(){ var k=prot();
 if(k==="obs")  return {k:k,sess:.5,satSess:6,rup:true,rupDom:34,ater:1,ficha:1};
 if(k==="solo") return {k:k,sess:1,satSess:0,rup:false,rupDom:45,ater:2,ficha:.5};
 return {k:k,sess:1,satSess:0,rup:true,rupDom:45,ater:1,ficha:1};
}
function pintaProt(){
 var k=prot(),P=PROT[k],i,h="";
 for(i=0;i<P.m.length;i++) h+='<li>'+P.m[i]+'</li>';
 var auto=(k==="solo"&&S.carga<40);
 el("prot").innerHTML='<div class="pcab"><span class="k6">Protocolo de campo</span>'+
  '<span class="pnm">'+P.n+'</span><span class="pg">'+P.g+'</span>'+
  (auto?'<span class="pauto">entrou sozinho &middot; carga abaixo de 40</span>'
       :'<span class="pauto fix">pela designa\u00e7\u00e3o em vigor</span>')+'</div>'+
  '<p class="pds">'+P.d+'</p><ul class="pmods">'+h+'</ul>'+
  '<div class="pbar">'+
   '<button data-pk="obs" class="'+(k==="obs"?"at":"")+'">Observat\u00f3rio <i>astromante &middot; sonda</i></button>'+
   '<button data-pk="pres" class="'+(k==="pres"?"at":"")+'">C\u00e2mara de press\u00e3o <i>zênite &middot; apogeu</i></button>'+
   '<button data-pk="solo" class="'+(k==="solo"?"at":"")+'">Solo <i>perigeu &middot; carga &lt; 40</i></button>'+
  '</div>';
 var n=document.querySelectorAll("[data-pk]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var d={obs:"ASTROMANTE",pres:"APOGEU",solo:"PERIGEU"}[this.getAttribute("data-pk")];
  S.modo="fixo"; S.cod=d;
  anota("Protocolo de campo alterado por designa\u00e7\u00e3o: "+d+".",0,false); pinta(); });
}
function patente(){for(var i=0;i<PATENTES.length;i++){ if(S.dominio>=PATENTES[i].min){
  if(i===0&&S.falsos>0) return{n:"Alfa",d:"teto travado por queima seca"}; return PATENTES[i];}}
 return PATENTES[PATENTES.length-1];}
function proximo(){for(var i=PATENTES.length-1;i>=0;i--) if(PATENTES[i].min>S.dominio) return PATENTES[i].min-S.dominio; return 0;}

function spark(){var c=el("spark");if(!c||!c.getContext)return;
 var x=c.getContext("2d"); if(!x) return;
 var W=c.width,H=c.height,h=S.hist.slice(-28);
 x.clearRect(0,0,W,H); if(h.length<2)h=[S.carga,S.carga];
 var st=W/(h.length-1),y=function(v){return H-6-(v/100)*(H-14);};
 x.strokeStyle="#272b35";x.lineWidth=1;x.beginPath();x.moveTo(0,y(LIMIAR)+.5);x.lineTo(W,y(LIMIAR)+.5);x.stroke();
 x.beginPath();x.moveTo(0,y(h[0]));for(var i=1;i<h.length;i++)x.lineTo(i*st,y(h[i]));
 x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fillStyle="rgba(86,166,189,.14)";x.fill();
 x.beginPath();x.moveTo(0,y(h[0]));for(var j=1;j<h.length;j++)x.lineTo(j*st,y(h[j]));
 x.strokeStyle="#56a6bd";x.lineWidth=1.8;x.stroke();
 x.beginPath();x.arc(W-1.5,y(h[h.length-1]),3.4,0,6.3);x.fillStyle="#56a6bd";x.fill();}

function move(dc,dd,txt,ruim,ds,dr,dcor){var a=S.carga;
 if(dc<0) S.gasto=(S.gasto|0)+(-dc);
 if(dd>0) S.lastro=(S.lastro|0)+Math.max(1,Math.round(dd*(temAr("cond")?0.85:LASTRO_T)));
 S.carga=clamp(S.carga+dc,0,100); S.dominio=Math.max(0,S.dominio+dd);
 S.sat=clamp(S.sat+(ds||0),0,100);
 S.eco.r=Math.max(0,S.eco.r+(dr||0)); S.eco.c=Math.max(0,S.eco.c+(dcor||0));
 S.hist.push(S.carga); if(S.hist.length>28)S.hist.shift();
 anota(txt,S.carga-a,ruim);
 if(S.sat>=100){ var b=S.carga; S.carga=clamp(S.carga-15,0,100); S.sat=50;
  S.aguaH=(S.aguaH||[]).concat(hoje());
  anota("Satura&ccedil;&atilde;o no teto: descarga involunt&aacute;ria. O ru&iacute;do saiu sozinho, antes da decis&atilde;o.",S.carga-b,true);
  S.hist.push(S.carga); if(S.hist.length>28)S.hist.shift(); }
 pinta();}

function rom(n){ var M=[[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],r="",i;
 for(i=0;i<M.length;i++) while(n>=M[i][0]){ r+=M[i][1]; n-=M[i][0]; } return r||"\u2014"; }
function glif(c,cor){
 var P={cor:'<path d="M6 13h36v24H6z"/><path d="M6 13l18 14 18-14"/>',
  din:'<circle cx="24" cy="25" r="14"/><path d="M24 11v28M18 19h12M18 31h12"/>',
  lig:'<path d="M24 38v-6"/><path d="M15 30a12 12 0 0 1 18 0"/><path d="M9 23a21 21 0 0 1 30 0"/><circle cx="24" cy="39" r="2.5"/>',
  des:'<path d="M24 10v28"/><path d="M14 28l10 10 10-10"/><path d="M10 42h28"/>',
  pes:'<circle cx="18" cy="22" r="7"/><circle cx="30" cy="22" r="7"/><path d="M8 40c2-7 7-10 10-10M40 40c-2-7-7-10-10-10"/>',
  dig:'<path d="M10 12h8M10 12v8M38 12h-8M38 12v8M10 36h8M10 36v-8M38 36h-8M38 36v-8"/><circle cx="24" cy="24" r="4"/>'};
 return '<svg class="sig" viewBox="0 0 48 48" fill="none" style="stroke:'+cor+'" stroke-width="1.6" stroke-linecap="square" aria-hidden="true">'+(P[c]||P.dig)+'</svg>';
}
function cartaHTML(f,full){
 var cn=canal(f.c), en=EN[f.e]||EN.baixa, ok=!!S.fichas[f.id], bloq=S.carga<en.min;
 var lista=todas(), ord=0;
 for(var z=0;z<lista.length;z++) if(lista[z].id===f.id) ord=z+1;
 var h='<article class="fx'+(ok?" ok":"")+(bloq&&!ok?" block":"")+'" id="fx-'+f.id+'" style="--ch:'+cn.cor+'">';
 h+='<div class="hd"><span class="c">'+cn.n+'</span><span class="p">'+en.dom+' pts</span></div>';
 h+='<div class="rn">'+rom(ord)+'</div>';
 h+=glif(f.c,cn.cor);
 h+='<div class="meta"><span class="en '+f.e+'">'+en.rot+'</span><span class="tm">'+f.t+' min</span></div>';
 h+='<h4>'+f.h+'</h4>';
 if(f.p) h+='<p class="pr">'+f.p+'</p>';
 h+='<ol>'; for(var k=0;k<f.s.length;k++) h+='<li>'+f.s[k]+'</li>'; h+='</ol>';
 if(f.d) h+='<p class="tip"><b>DICA</b> &middot; '+f.d+'</p>';
 h+='<div class="act"><button data-f="'+f.id+'"'+(ok?" disabled":"")+'><strong>'+
    (ok?"Liquidada":(bloq?"Exige carga "+en.min:"Liquidar"))+'</strong><span class="cost">'+
    (ok?"":"&minus;"+en.carga+" carga &middot; +"+en.dom+" dom")+'</span></button>';
 if(full&&!ok) h+='<button data-dev="1" style="margin-top:6px"><strong>Devolver ao baralho</strong></button>';
 h+='</div></article>';
 return h;}

function acha(id){var l=todas();for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null;}

function pintaDeck(){
 var lista=todas(), feitas=0, rest=0, i;
 for(i=0;i<lista.length;i++){ if(S.fichas[lista[i].id]) feitas++; else rest++; }
 var mz=document.querySelector(".mesa");
 if(mz) mz.className="mesa"+((S.puxada&&!S.fichas[S.puxada])?" aberta":"");
 el("d-done").textContent=feitas; el("d-tot").textContent=lista.length;
 el("stack").innerHTML='<div class="verso">'+glif("des","var(--red)")+'<span class="n">'+rest+'</span><span class="l">no baralho</span></div>';

 var slot=el("slot"), f=S.puxada?acha(S.puxada):null;
 if(f&&!S.fichas[f.id]){ slot.innerHTML=cartaHTML(f,true);
  var db=slot.querySelector("button[data-dev]");
  if(db) db.addEventListener("click",function(){S.puxada=null;pinta();});
 } else {
  S.puxada=null;
  slot.innerHTML='<div class="vazio"><p>Baralho fechado</p><small>Escolher qual l&acirc;mina virar custa exatamente a energia que voc&ecirc; n&atilde;o tem. Puxe uma e fa&ccedil;a o que estiver escrito nela.</small><button id="b-draw" class="key" style="width:auto"><strong>Puxar l&acirc;mina</strong><span class="cost">o baralho decide</span></button></div>';
  var bd=el("b-draw"); if(bd) bd.addEventListener("click",puxar);
 }

 var box=el("grade"), h="";
 for(i=0;i<lista.length;i++){ var g=lista[i];
  if(filtro!=="todos"&&g.c!==filtro) continue;
  if(soDisp&&(S.fichas[g.id]||S.carga<(EN[g.e]||EN.baixa).min)) continue;
  h+=cartaHTML(g,false); }
 box.innerHTML=h||'<p style="color:var(--dim);font-family:var(--mono);font-size:12px;padding:14px">Nenhuma ficha neste recorte.</p>';
 var bs=document.querySelectorAll("button[data-f]");
 for(i=0;i<bs.length;i++) bs[i].addEventListener("click",function(){liquida(this.getAttribute("data-f"));});
}

function puxar(){
 var lista=todas(),pool=[];
 for(var i=0;i<lista.length;i++){var g=lista[i],en=EN[g.e]||EN.baixa;
  if(!S.fichas[g.id]&&S.carga>=en.min) pool.push(g);}
 if(!pool.length){el("msg").textContent="nenhuma ficha dispon&iacute;vel nesta carga";return;}
 var alvo=pool[Math.floor(Math.random()*pool.length)].id;
 var n=el("slot");
 var reduz=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
 if(n&&!reduz){ n.innerHTML='<div class="beat"><svg viewBox="0 0 100 100" aria-hidden="true">  <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--red)" stop-opacity=".3"/><stop offset="1" style="stop-color:var(--red)"/></linearGradient></defs>  <circle cx="50" cy="50" r="47" fill="none" stroke="#23232a" stroke-width="1.2"/>  <path class="fan" d="M8.6 58.7 L50 66 M13.6 45.0 L50 66 M23.0 33.8 L50 66 M35.6 26.5 L50 66 M50.0 24.0 L50 66 M64.4 26.5 L50 66 M77.0 33.8 L50 66 M86.4 45.0 L50 66 M91.4 58.7 L50 66" fill="none" stroke="url(#gb)" stroke-width="1.25"/>  <path class="haste" d="M50 66 L50 95" style="stroke:var(--red)" stroke-width="2.6"/>  <path class="haste" d="M43 86 L50 95 L57 86" fill="none" style="stroke:var(--red)" stroke-width="2.2"/>  <circle class="nuc" cx="50" cy="66" r="4.4" fill="#08080a" stroke="#eae8e3" stroke-width="2"/></svg><span>colapsando rotas</span></div>';
  if(n.scrollIntoView) n.scrollIntoView({block:"center",behavior:"smooth"});
  setTimeout(function(){ S.puxada=alvo; pinta(); },620); return; }
 S.puxada=alvo; pinta();
 if(n) n.scrollIntoView({block:"center",behavior:"smooth"});
}

function liquida(id){
 var lista=todas(),f=null;
 for(var i=0;i<lista.length;i++) if(lista[i].id===id) f=lista[i];
 if(!f||S.fichas[id]) return;
 var en=EN[f.e]||EN.baixa;
 if(S.carga<Math.round(en.min*pm().ficha)) return;
 S.fichas[id]=hoje(); if(S.puxada===id) S.puxada=null;
 var cst=Math.round(en.carga*pm().ficha);
 move(-cst,en.dom,"Ficha liquidada &mdash; "+canal(f.c).n+": "+f.h+
  (cst<en.carga?" Protocolo SOLO: l\u00e2mina sai pela metade do custo.":""),false,(f.c==="pes"?4:0),1,0);
}

var TBF=[["06","06\u201309"],["09","09\u201312"],["12","12\u201315"],["15","15\u201318"],["18","18\u201321"],["21","21\u201300"]];
var TBD=["seg","ter","qua","qui","sex","s\u00e1b","dom"];
function tbSemana(){ var d=new Date(), dw=(d.getDay()+6)%7, ini=new Date(d.getTime()-dw*864e5),r=[],i;
 for(i=0;i<7;i++) r.push(diaStr(Math.floor(ini.getTime()/864e5)+i)); return r; }
function pintaTb(){
 var dias=tbSemana(), hoy=hoje(), h="",i,k;
 h+='<div class="tbh"></div>';
 for(i=0;i<7;i++) h+='<div class="tbh'+(dias[i]===hoy?" hoje":"")+'">'+TBD[i]+'<i>'+dias[i].slice(8)+'</i></div>';
 for(k=0;k<TBF.length;k++){
  h+='<div class="tbf fx-'+TBF[k][0]+'">'+TBF[k][1]+'</div>';
  for(i=0;i<7;i++){ var id=dias[i]+"|"+TBF[k][0], v=(S.tb||{})[id]||"";
   h+='<div class="tbc fx-'+TBF[k][0]+(v?" ok":"")+(dias[i]===hoy?" hj":"")+'"><textarea data-tb="'+id+'" maxlength="28" rows="2" placeholder="\u2014">'+esc(v)+'</textarea></div>'; }
 }
 el("tb-g").innerHTML=h;
 var n=document.querySelectorAll("[data-tb]");
 for(i=0;i<n.length;i++) n[i].addEventListener("change",function(){
  S.tb=S.tb||{}; var id=this.getAttribute("data-tb"), v=this.value.trim();
  if(v) S.tb[id]=v; else delete S.tb[id];
  grava(); pinta(); });
 var ch=0; for(k in (S.tb||{})) if(dias.indexOf(k.split("|")[0])>=0) ch++;
 el("tb-sub").innerHTML=ch?("<b>"+ch+"</b> blocos ocupados nesta semana"):"toque num bloco para escrever o que ocupa a faixa";
 lig("b-tb-lp",function(){ var kk,dd=tbSemana();
  for(kk in (S.tb||{})) if(dd.indexOf(kk.split("|")[0])>=0) delete S.tb[kk];
  anota("Grade semanal limpa.",0,false); pinta(); });
}
function pintaAlerta(){
 var e=el("alerta"); if(!e) return;
 var LC=limComb(), g=S.gasto|0, C=contencao().v, L=[];
 if(S.sat>=80) L.push(["satura\u00e7\u00e3o cr\u00edtica","antena entupida \u2014 descarga controlada antes de qualquer ruptura","b-desc"]);
 if(g>=LC) L.push(["limiar de combust\u00e3o ultrapassado","o ciclo fecha em rebote; o seguinte nasce devendo o dobro","h-cript"]);
 else if(g>=LC*0.85) L.push(["queima pr\u00f3xima do limiar","restam "+(LC-g)+" de proje\u00e7\u00e3o neste ciclo","h-cript"]);
 if(S.carga<=20) L.push(["corrente no ch\u00e3o","dia de l\u00e2mina: uma carta por vez, nenhuma decis\u00e3o","h-deck"]);
 if(C<30) L.push(["continente comprometido","\u00edndice em "+C+" \u2014 o limiar de combust\u00e3o cai junto","h-ctn"]);
 if(desde(S.ultAter)>=3) L.push(["sem pouso h\u00e1 "+desde(S.ultAter)+" ciclos","corpo fora da conta h\u00e1 tempo demais","h-ctn"]);
 if(!L.length){ e.hidden=true; e.innerHTML=""; return; }
 var h='<div class="alfx"></div><div class="alcon"><span class="altag">aten\u00e7\u00e3o do portador</span><div class="allist">',i;
 for(i=0;i<L.length;i++) h+='<div class="alit"><b>'+L[i][0]+'</b><span>'+L[i][1]+'</span>'+
  '<button data-ir="'+L[i][2]+'">ir</button></div>';
 e.innerHTML=h+'</div></div>'; e.hidden=false;
}
var KITD=[
 ["Principal","h-pp",[["Manipula\u00e7\u00e3o de Probabilidade Precognitiva","v\u00ea as ramifica\u00e7\u00f5es e colapsa uma","h-pp"]]],
 ["Secund\u00e1rios","h-sec",[
  ["Decodifica\u00e7\u00e3o Estrutural","sistema fechado vira regra","h-lp"],
  ["Empatia Sensorial de Campo","l\u00ea o ambiente antes da fala","h-mc"],
  ["Resson\u00e2ncia Coletiva","move o grupo sem comand\u00e1-lo","h-sec"]]],
 ["Derivados","h-cam",[
  ["Arquivo de ramifica\u00e7\u00e3o","o ramo descartado fica registrado","h-diag"],
  ["Leitura de sistema fechado","idiomas, gram\u00e1ticas, runas","h-lp"],
  ["Voo por combust\u00e3o dirigida","empuxo, leme e casco","h-voo"],
  ["Travessia para a C\u00e2mara","olhar sem despejar","h-cam"]]],
 ["Kit","h-deck",[
  ["Saco de runas","24 signos","h-lp"],["Baralho de tar\u00f4","arcanos 20 e 12","h-cam"],
  ["Arco e flecha","o signo virado of\u00edcio","h-apt"],["Violino","disciplina sem plateia","h-apt"],
  ["Tablet","onde o arquivo vive","h-cup"],["Fichas de varredura","tr\u00eas passos cada","h-deck"],
  ["Caderno do ciclo","a ordem \u00e0 m\u00e3o","h-ciclo"],["Garrafa marcada","oito marcas","h-ctn"],
  ["Limitador","o freio de fora","h-lim"]]],
 ["Limites","h-cript",[
  ["Criptonita","a energia errada","h-cript"],["Combust\u00e3o","o modo de falha","h-cript"]]]
];
var kitAb=-1;
function pintaKitc(){
 var h="",i,k;
 for(i=0;i<KITD.length;i++) h+='<button data-kt="'+i+'" class="'+(kitAb===i?"at":"")+'">'+KITD[i][0]+
  '<i>'+KITD[i][2].length+'</i></button>';
 var det="";
 if(kitAb>=0&&KITD[kitAb]){ det='<div class="kitd">';
  for(k=0;k<KITD[kitAb][2].length;k++) det+='<button data-ir="'+KITD[kitAb][2][k][2]+'"><b>'+KITD[kitAb][2][k][0]+
   '</b><span>'+KITD[kitAb][2][k][1]+'</span></button>';
  det+='</div>'; }
 el("kitc").innerHTML='<div class="kitt">'+h+'</div>'+det;
 var n=document.querySelectorAll("[data-kt]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k2=+this.getAttribute("data-kt"); kitAb=(kitAb===k2)?-1:k2; pintaKitc(); irPara(); });
}
function statVals(){
 var i,C=contencao().v, E=equil(), sem=0, met=0;
 for(i=0;i<S.langs.length;i++){ met+=S.langs[i].meta|0; sem+=semanaMin(S.langs[i].id); }
 var est=met?Math.min(100,Math.round(sem/met*100)):(sem?60:0);
 var hrs=0; for(i=0;i<S.apt.length;i++) hrs+=S.apt[i].min|0;
 var ofi=Math.min(100,Math.round(hrs/1800*100));
 var dren=0,rest=0;
 for(i=0;i<S.rel.length;i++){ if(S.rel[i].ef==="drena") dren++; if(S.rel[i].ef==="recarrega") rest++; }
 var campo=(dren+rest)?Math.round(rest/(dren+rest)*100):50;
 return [["corrente",S.carga],["dom\u00ednio",Math.min(100,Math.round(S.dominio/15))],
  ["conten\u00e7\u00e3o",C],["clareza",100-S.sat],["estudo",est],["of\u00edcio",ofi],["campo",campo],
  ["equil\u00edbrio",E.v]];
}
function pintaRadar(){
 var sv=el("radar"); if(!sv) return;
 var V=statVals(), n=V.length, cx=100, cy=100, R=74, i, p="", g="", a;
 for(i=1;i<=4;i++){ var r=R*i/4, q="";
  for(a=0;a<n;a++){ var A2=-Math.PI/2+a*2*Math.PI/n;
   q+=(a?"L":"M")+(cx+Math.cos(A2)*r).toFixed(1)+" "+(cy+Math.sin(A2)*r).toFixed(1)+" "; }
  g+='<path d="'+q+'Z" fill="none" stroke="var(--line2)" stroke-width="'+(i===4?1:.5)+'" opacity="'+(i===4?.9:.45)+'"/>'; }
 for(a=0;a<n;a++){ var A3=-Math.PI/2+a*2*Math.PI/n;
  g+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.cos(A3)*R).toFixed(1)+'" y2="'+(cy+Math.sin(A3)*R).toFixed(1)+
     '" stroke="var(--line2)" stroke-width=".5" opacity=".5"/>';
  var rr=R*clamp(V[a][1],0,100)/100;
  p+=(a?"L":"M")+(cx+Math.cos(A3)*rr).toFixed(1)+" "+(cy+Math.sin(A3)*rr).toFixed(1)+" "; }
 sv.innerHTML=g+'<path d="'+p+'Z" fill="var(--red)" fill-opacity=".2" stroke="var(--red)" stroke-width="1.6" stroke-linejoin="round"/>';
 var h="",k;
 for(k=0;k<V.length;k++) h+='<div class="sti"><span>'+V[k][0]+'</span><div class="stb"><i style="width:'+
  clamp(V[k][1],0,100)+'%"></i></div><b>'+Math.round(V[k][1])+'</b></div>';
 el("statl").innerHTML=h;
}
function pintaRail(){
 var r=el("rail"); if(!r) return;
 var E=equil(), M=pm(), V=vooEst(), C=contencao(), mis=misEstado(), P=patente(), i;
 function mini(k,v,cl){ return '<div class="rm'+(cl?" "+cl:"")+'"><span>'+k+'</span><b>'+v+'</b></div>'; }
 var h='<div class="rcab"><span class="k9">\u03a3 leitura</span><i>'+S.ciclo+'</i></div>'+
  '<div class="rgrid">'+
   mini("carga",S.carga,S.carga>=LIMIAR?"on":"off")+
   mini("dom",S.dominio,"")+
   mini("lastro",S.lastro|0,"")+
   mini("sat",S.sat,S.sat>=60?"off":"")+
   mini("cont",C.v,C.v>=50?"":"off")+
   mini("equil",E.v,E.v>=50?"":"off")+
  '</div>'+
  '<div class="rbl"><span>patente &middot; fase</span><b>'+P.n+' &middot; '+FASES[faseIdx()][(S.idi==="en"?2:0)]+'</b></div>'+
  '<div class="rbl '+(V.k==="voo"?"alt":"")+'"><span>protocolo &middot; altitude</span><b>'+PROT[M.k].n+' &middot; '+V.n+'</b></div>'+
  '<div class="rmis"><span>diretivas</span><b>'+mis.n+'/3</b>'+
   '<div class="rdots">'+(mis.a?'<i class="on"></i>':'<i></i>')+(mis.b?'<i class="on"></i>':'<i></i>')+(mis.c?'<i class="on"></i>':'<i></i>')+'</div></div>';

 h+='<div class="rcab cer"><span class="k9">C\u00e9rebro</span><i>'+S.cap.length+' na caixa</i></div>'+
  '<div class="rcap"><input id="r-cap" maxlength="140" placeholder="despeje antes de perder">'+
  '<button id="b-rcap">capturar</button></div><ul class="rlist">';
 for(i=0;i<Math.min(S.cap.length,7);i++)
  h+='<li><span>'+esc(S.cap[i].t)+'</span>'+
     '<button data-rcn="'+i+'" title="arquivar como nota">nota</button>'+
     '<button data-rcl="'+i+'" title="virar l\u00e2mina">l\u00e2m</button>'+
     '<button class="rx" data-rcx="'+i+'" aria-label="remover">\u2715</button></li>';
 if(!S.cap.length) h+='<li class="rvz">caixa vazia</li>';
 h+='</ul>'+
  '<div class="rbt"><button id="b-rcer">abrir c\u00e9rebro</button>'+
  '<button id="b-rtopo">topo</button></div>';
 r.innerHTML=h;
 lig("b-rcap",function(){ var v=el("r-cap").value.trim(); if(!v)return;
  S.cap.unshift({t:v,d:hoje()}); if(S.cap.length>60) S.cap.length=60;
  el("r-cap").value=""; move(0,1,"Captura: "+esc(v),false,-2,0,0); });
 var ri=el("r-cap");
 if(ri) ri.addEventListener("keydown",function(e){ if(e.key==="Enter"){ var b=el("b-rcap"); if(b) b.click(); }});
 var n=document.querySelectorAll("[data-rcx]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  S.cap.splice(+this.getAttribute("data-rcx"),1); pinta(); });
 n=document.querySelectorAll("[data-rcn]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-rcn"), it=S.cap[k];
  S.notas.unshift({t:it.t.slice(0,60),b:it.t,tags:["captura"],d:hoje()});
  S.cap.splice(k,1); move(0,2,"Captura arquivada como nota.",false,-2,1,0); });
 n=document.querySelectorAll("[data-rcl]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var k=+this.getAttribute("data-rcl"), it=S.cap[k];
  S.extras.push({id:"x"+Date.now(),c:"dig",e:"baixa",t:5,h:it.t,p:"",s:["Fa\u00e7a a coisa."],d:""});
  S.cap.splice(k,1); move(0,2,"Captura triada: \u201c"+esc(it.t)+"\u201d virou l\u00e2mina.",false,-2,0,0); });
 lig("b-rcer",function(){ cerAbre(true); });
 lig("b-rtopo",function(){ window.scrollTo({top:0,behavior:"smooth"}); });
}
function pintaProvas(){
 var h="",i,feitas=0;
 for(i=0;i<PROVAS.length;i++){ var P=PROVAS[i], v=0;
  try{ v=P.f()|0; }catch(e){ v=0; }
  v=Math.max(0,Math.min(P.alvo,v));
  var pc=Math.round(v/P.alvo*100), paga=!!S.provas[P.id], pronta=(v>=P.alvo);
  if(paga) feitas++;
  h+='<div class="pv'+(paga?" paga":(pronta?" pronta":""))+'">'+
   '<div class="pvt"><b>'+P.n+'</b><span class="pvp">'+P.pg+' <i>lastro</i></span></div>'+
   '<p>'+P.d+'</p>'+
   '<div class="pvb"><i style="width:'+pc+'%"></i></div>'+
   '<div class="pvf"><span>'+v+' / '+P.alvo+'</span>'+
    (paga?'<span class="pvok">paga em '+S.provas[P.id]+'</span>'
         :'<button data-pv="'+P.id+'"'+(pronta?'':' disabled')+'>'+(pronta?"receber":"em curso")+'</button>')+
   '</div></div>';
 }
 el("prov").innerHTML=h;
 var n=document.querySelectorAll("[data-pv]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  var id=this.getAttribute("data-pv"),k;
  for(k=0;k<PROVAS.length;k++) if(PROVAS[k].id===id){ var P2=PROVAS[k];
   if(S.provas[id]) return;
   var v2=0; try{ v2=P2.f()|0; }catch(e){ v2=0; }
   if(v2<P2.alvo) return;
   S.provas[id]=hoje(); S.lastro=(S.lastro|0)+P2.pg;
   move(0,8,"Prova cumprida: "+P2.n+". "+P2.pg+" de lastro cunhados.",false,0,1,0); return; } });
}
function pintaRw(){
 var h="",p=patente();
 for(var i=0;i<RECOMPENSAS.length;i++){
  var r=RECOMPENSAS[i], got=!!S.premios[i], pat=S.dominio>=r.min, paga=(S.lastro|0)>=r.c, lib=pat&&paga;
  h+='<div class="rwc'+(got?" got":(lib?"":" lock"))+'"><span class="lv">'+(r.min?("patente a partir de "+r.min+" dom"):"sem exig\u00eancia de patente")+'</span>';
  h+='<h4>'+r.h+'</h4><p>'+r.p+'</p>';
  h+='<span class="preco">'+r.c+' <i>lastro</i></span>';
  h+='<button data-r="'+i+'"'+((!lib||got)?" disabled":"")+'><strong>'+
     (got?"Resgatada":(!pat?"Patente insuficiente":(!paga?("faltam "+(r.c-(S.lastro|0))+" de lastro"):"Resgatar")))+'</strong></button></div>';
 }
 el("rw").innerHTML=h;
 var bs=el("rw").querySelectorAll("button[data-r]");
 for(var j=0;j<bs.length;j++) bs[j].addEventListener("click",function(){
  var k=this.getAttribute("data-r");
  if(S.premios[k]) return;
  var rr=RECOMPENSAS[k]; if((S.lastro|0)<rr.c||S.dominio<rr.min) return;
  S.premios[k]=hoje(); S.lastro=(S.lastro|0)-rr.c;
  anota("Recompensa resgatada: "+rr.h+" \u2014 "+rr.c+" de lastro gastos. Dom&iacute;nio n&atilde;o cai: patente &eacute; permanente.",0,false);
  pinta();});
}

function ecoFala(){
 var r=S.eco.r,c=S.eco.c;
 if(c>0) return "Guardo "+c+(c===1?" ramo corrompido":" ramos corrompidos")+". N&atilde;o devolvo nenhum deles.";
 if(S.sat>=60) return "H&aacute; ru&iacute;do guardado. Em quase todas as rotas descartadas hoje, voc&ecirc; ainda n&atilde;o decidia nada.";
 if(S.carga<35) return "Havia um ramo em que hoje era dia de baralho. Voc&ecirc; n&atilde;o o tomou ainda.";
 if(S.carga<LIMIAR) return "Nenhuma das rotas que guardei hoje passava por uma ruptura.";
 if(r===0) return "N&atilde;o guardo nada. Voc&ecirc; ainda n&atilde;o descartou nenhum caminho.";
 if(r<10) return "Guardo "+r+(r===1?" ramo":" ramos")+". Nenhum deles aconteceu.";
 return "Guardo "+r+" ramos. Em dezenas deles voc&ecirc; fazia menos e terminava antes.";
}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){
 return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function fpAbre(x){
 var e=el("h-sec"), k=el("cerbk");
 if(e) e.classList.toggle("on",!!x);
 if(k) k.classList.toggle("on",!!x||cerAb||tirAb);
 document.body.style.overflow=(!!x||cerAb||tirAb)?"hidden":"";
 var b=el("b-fichap"); if(b) b.setAttribute("aria-expanded", x?"true":"false");
}

function irPara(){
 var n=document.querySelectorAll("[data-ir]:not([data-irl])");
 for(var i=0;i<n.length;i++){ n[i].setAttribute("data-irl","1");
  n[i].addEventListener("click",function(){
   var t=el(this.getAttribute("data-ir"));
   if(t&&(t.id==="h-sec"||(t.closest&&t.closest(".fichap")))) fpAbre(true);
   if(t) t.scrollIntoView({block:"start",behavior:"smooth"}); }); }
}
function pintaEM(){
 var i,dren=0,rest=0;
 for(i=0;i<S.rel.length;i++){ if(S.rel[i].ef==="drena") dren++; if(S.rel[i].ef==="recarrega") rest++; }
 var dc=desde(S.ultCont);
 el("em-pw").innerHTML=
  '<span class="n">N&oacute;s mapeados<small>pessoas no campo</small></span><span class="s '+(S.rel.length?"on":"off")+'">'+S.rel.length+'</span>'+
  '<span class="n">Fontes de ru&iacute;do<small>contatos que drenam</small></span><span class="s '+(dren?"off":"on")+'">'+dren+'</span>'+
  '<span class="n">Satura&ccedil;&atilde;o acumulada<small>antena sem filtro</small></span><span class="s '+(S.sat>=60?"off":"on")+'">'+S.sat+'</span>'+
  '<span class="n">Dias sem contato<small>desde a &uacute;ltima convoca&ccedil;&atilde;o</small></span><span class="s '+(dc>=2?"off":"on")+'">'+dc+'</span>';
}
function pintaRS(){
 var i,rest=0; for(i=0;i<S.rel.length;i++) if(S.rel[i].ef==="recarrega") rest++;
 var sobra=Math.max(0,2-(S.usos.rede|0));
 el("rs-pw").innerHTML=
  '<span class="n">Convoca&ccedil;&otilde;es no ciclo<small>restituem carga e baixam satura&ccedil;&atilde;o</small></span>'+
   '<span class="s '+(sobra?"on":"off")+'">'+sobra+' de 2</span>'+
  '<span class="n">N&oacute;s que restituem<small>mapeados como fonte</small></span><span class="s '+(rest?"on":"off")+'">'+rest+'</span>';
}
var SUG=[
 ["Z\u00caNITE","o ponto onde as rotas convergem","ZENITH"],
 ["REENTRADA","a queima que acontece justamente ao voltar","VOIDWALKER"],
 ["APOGEU","o ponto de dist\u00e2ncia m\u00e1xima do ch\u00e3o","APOGEE"],
 ["ARREMETIDA","a aterrissagem abortada no \u00faltimo instante","WAVE-OFF"],
 ["ASTRONAUTA","o t\u00edtulo do pr\u00f3prio relat\u00f3rio","ASTRONAUT"],
 ["SONDA","enviada longe, l\u00ea, transmite, n\u00e3o retorna","PROBE"],
 ["PERIGEU","a aproxima\u00e7\u00e3o m\u00e1xima \u2014 o que falta","PERIGEE"],
 ["ARCANO 12","o n\u00famero que a matriz deu ao poder","ARCANUM XII"],
 ["ASTROMANTE","quem l\u00ea por astros \u2014 a origem real desta ficha","ASTROMANCER"],
 ["COSMONAUTA","o registro pesado e ret\u00f3 da mesma ideia","COSMONAUT"],
 ["\u00d3RBITA","o estado permanente, dito em uma palavra","ORBIT"],
 ["DERIVA","deslocamento sem propuls\u00e3o pr\u00f3pria","DRIFTER"],
 ["ERMO","o vazio atravessado, em portugu\u00eas","VOID"]
];
var PAD={retrato:"assets/img/retrato-aa4d0360.jpg",faixa:"assets/img/faixa-94924416.jpg",
 contencao:"assets/img/contencao-c82f8dc3.jpg",rota:"assets/img/rota-b3da2e13.jpg",campo:"assets/img/campo-6d289dcf.jpg",krypt:"assets/img/krypt-9d4a5e21.jpg",voo:"assets/img/voo-fd52e809.jpg"};
function imgDe(k,v){ return v||PAD[k]||null; }
function frameHTML(src,tag,cap,alvo,semTroca){
 var h='';
 if(src) h+='<img src="'+src+'" alt=""><div class="duo"></div><div class="gr2"></div>'+
   '<button class="rmf" data-rf="'+alvo+'" aria-label="remover">\u2715</button>';
 else h+='<div class="vazf"><span>'+tag+'</span><span style="color:var(--line2)">sem registro visual</span></div>';
 h+='<div class="scan"></div><i class="ct2"></i><i class="ct3"></i><i class="ct4"></i><i class="ct5"></i>';
 h+='<span class="tagf">'+tag+'</span>';
 if(src) h+='<div class="capf"><span>'+cap[0]+'</span><b>'+cap[1]+'</b></div>';
 if(!semTroca) h+='<label><span>'+(src?"trocar":"importar imagem")+'</span><input type="file" accept="image/*" data-fi="'+alvo+'" style="position:absolute;width:1px;height:1px;opacity:0"></label>';
 return h;
}
function importar(file,maxW,cb){
 var fr=new FileReader();
 fr.onload=function(ev){ var im=new Image();
  im.onload=function(){ var r=Math.min(1,maxW/im.width), w=Math.round(im.width*r), h=Math.round(im.height*r);
   var cv=document.createElement("canvas"); cv.width=w; cv.height=h;
   var cx2=cv.getContext("2d"); if(!cx2) return;
   cx2.drawImage(im,0,0,w,h);
   try{ cb(cv.toDataURL("image/jpeg",0.72)); }catch(e){}
  };
  im.onerror=function(){ var m=el("msg"); if(m) m.textContent="imagem ileg\u00edvel"; };
  im.src=ev.target.result; };
 fr.readAsDataURL(file);
}
function pintaPlacas(){
 var n=document.querySelectorAll("[data-pl]"),i;
 for(i=0;i<n.length;i++){ var k=n[i].getAttribute("data-pl"), src=imgDe(k,(S.placas||{})[k]);
  n[i].innerHTML=(src?'<img src="'+src+'" alt=""><div class="duo2"></div><button class="rmp" data-pr2="'+k+'">\u2715</button>'
                     :'<div class="vz7">sem placa</div>')+
   '<div class="sc2"></div><i class="cx a"></i><i class="cx b"></i>'+
   '<label><span>'+(src?"trocar":"placa")+'</span><input type="file" accept="image/*" data-pi="'+k+'" data-w="'+(n[i].getAttribute("data-w")||300)+'"></label>';
 }
 n=document.querySelectorAll("[data-pi]");
 for(i=0;i<n.length;i++) n[i].addEventListener("change",function(){
  var k=this.getAttribute("data-pi"), f=this.files&&this.files[0]; if(!f) return;
  var w=+(this.getAttribute("data-w")||0)||300;
  importar(f,w,function(d){ S.placas=S.placas||{}; S.placas[k]=d; pinta(); }); });
 n=document.querySelectorAll("[data-pr2]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){
  S.placas=S.placas||{}; S.placas[this.getAttribute("data-pr2")]=null; pinta(); });
}
function pintaFrames(){
 var c=(S.modo==="fase")?FASES[faseIdx()][0]:(S.cod||"ASTROMANTE");
 if(S.idi==="en"&&ingles(c)) c=ingles(c);
 el("fr-ret").innerHTML=frameHTML(imgDe("retrato",S.retrato),"[subj_01]",["registro visual do sujeito",c],"retrato");
 el("fr-fx").innerHTML=frameHTML(imgDe("faixa",S.faixa),"[camp_00]",["faixa de campo \u00b7 arquivo \u03a3",S.ciclo],"faixa",true);
 var n=document.querySelectorAll("[data-fi]"),i;
 for(i=0;i<n.length;i++) n[i].addEventListener("change",function(){
  var k=this.getAttribute("data-fi"), f=this.files&&this.files[0]; if(!f) return;
  importar(f, k==="faixa"?880:420, function(d){ S[k]=d; pinta(); });
 });
 n=document.querySelectorAll("[data-rf]");
 for(i=0;i<n.length;i++) n[i].addEventListener("click",function(){ S[this.getAttribute("data-rf")]=null; pinta(); });
}

