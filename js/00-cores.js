/* Cores de destaque lidas do tema (fora do modo estrito, como no original) */
function ACC(){try{return getComputedStyle(document.body).getPropertyValue('--red').trim()||'#3d9bff';}catch(e){return '#3d9bff';}}
function ACCA(a){var c=ACC(),m=/^#([0-9a-f]{6})$/i.exec(c);if(!m)return c;var n=parseInt(m[1],16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
