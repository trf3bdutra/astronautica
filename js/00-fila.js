/* Ordem de abertura.
   Cada módulo declara as suas funções e põe na fila o que precisa rodar ao abrir o app.
   O último arquivo (99-inicio.js) executa a fila na ordem original, quando todas as funções
   de todos os módulos já existem. Assim um módulo pode usar funções de outro, carregado depois. */
var ASTRO_FILA=[];
function aoIniciar(f){ASTRO_FILA.push(f);}
