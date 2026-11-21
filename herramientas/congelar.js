#!/usr/bin/env node
// Congela los 7 desafíos de cada fecha en jornadas.js, para que una jornada ya publicada
// no cambie cuando se agregan preguntas nuevas (el archivo histórico no se regenera).
// Congela hasta 28 días hacia adelante y solo extiende el horizonte cuando quedan menos de 14 días congelados.
// Uso:  node herramientas/congelar.js      (necesita Node 18 o más nuevo; sin dependencias)
const fs=require('fs'),path=require('path'),vm=require('vm');
const base=path.join(__dirname,'..'),rd=f=>fs.readFileSync(path.join(base,f),'utf8');
const els={},el=id=>els[id]||(els[id]={innerHTML:"",value:"",textContent:"",className:"",focus(){}});
const ctx=vm.createContext({document:{getElementById:el},window:{scrollTo(){}},navigator:{},localStorage:{getItem(){return null},setItem(){}},console});
let previo={};
try{previo=vm.runInContext(rd('jornadas.js').replace(/^const JORNADAS=/m,'var __J=')+';__J',ctx)||{}}catch(e){previo={}}
vm.runInContext(rd('datos.js')+'\n'+rd('app.js').replace(/draw\(\);\s*$/,''),ctx);
const hoy=vm.runInContext('today()',ctx),inicio=vm.runInContext('INICIO',ctx),ids=new Set(vm.runInContext('POOL.map(q=>q.id)',ctx));
const out={...previo};let nuevas=0;
const ADELANTE=28,MINIMO=14,dias=(f)=>Math.round((new Date(f+'T12:00:00Z')-new Date(hoy+'T12:00:00Z'))/86400000);
const ultima=Object.keys(out).sort().pop();
// solo se extiende el horizonte cuando quedan menos de MINIMO días congelados (así se hacen pocos commits)
const hasta=(!ultima||dias(ultima)<MINIMO)?new Date(new Date(hoy+'T12:00:00Z').getTime()+ADELANTE*86400000).toISOString().slice(0,10):ultima;
for(let d=new Date(inicio+'T12:00:00Z');d.toISOString().slice(0,10)<=hasta;d.setUTCDate(d.getUTCDate()+1)){
  const f=d.toISOString().slice(0,10);
  if(out[f]){const perdidos=out[f].filter(i=>!ids.has(i));if(perdidos.length)console.warn(`AVISO ${f}: ya no existen estas preguntas: ${perdidos.join(', ')} (la jornada vuelve a calcularse)`);continue}
  out[f]=vm.runInContext(`dailyFresh("${f}").map(q=>q.id)`,ctx);nuevas++;
}
const orden=Object.keys(out).sort(),o={};orden.forEach(k=>o[k]=out[k]);
if(nuevas||!fs.existsSync(path.join(base,'jornadas.js')))fs.writeFileSync(path.join(base,'jornadas.js'),'/* ARCHIVO GENERADO por herramientas/congelar.js. No editar a mano. */\nconst JORNADAS='+JSON.stringify(o)+';\n');
const antes=(()=>{try{return fs.readFileSync(path.join(base,'jornadas.js'),'utf8')}catch(e){return''}})();
console.log(`jornadas.js: ${orden.length} jornadas congeladas (${nuevas} nuevas), hasta ${orden[orden.length-1]}`);
