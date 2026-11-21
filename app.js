/* ===== Desafíos del Bohemio · lógica de la página =====
   Los datos NO están en este archivo: vienen de datos.js (generado desde los CSV por herramientas/generar.py). */
const S=DATOS;
const SQN=z=>z.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const FU={};S.fuentes.forEach(f=>FU[f.id]=f.nombre);
const srcName=k=>FU[k]||(/^https?:/.test(k)?k.replace(/^https?:\/\/(www\.)?/,"").split("/")[0]:k);
const GAMES=[["g","¿Cuántos goles?","Adiviná cuántos goles de liga hizo un jugador en una temporada."],["t","Goleadores por temporada","Nombrá al goleador de Atlanta que te piden."],["a","Adiviná la temporada","Descubrí el año: cada error revela una pista más."],["c","Completá la plantilla","Completá los nombres que faltan de una lista."],["w","¿Quién jugó con quién?","Nombrá a otro compañero de plantel."],["i","Futbolista intruso","Encontrá al que no cumple lo que comparten los demás."],["o","Orden cronológico","Ordená hitos del club del más antiguo al más reciente."],["r","Resultados","Adiviná cómo salió un partido de Atlanta."],["m","¿Quién la metió?","Nombrá a uno de los goleadores de Atlanta en ese partido."],["k","Camiseta misteriosa","Mirá la camiseta y adiviná de qué temporada es."]];
const WAIT=[["Su trayectoria"],["Pirámide"]];
const POOL=[],cnt={};
const PISTA=new Set(S.fuentes.filter(f=>f.conf=="pista").map(f=>f.id));
const add=o=>{if(!o.id){cnt[o.type]=(cnt[o.type]||0);o.id=o.type+(cnt[o.type]++)}if(typeof o.src=="string")o.src=o.src.split(",");o.src=[...new Set((o.src||[]).filter(Boolean))];if(o.src.some(k=>PISTA.has(k)))o.st="u";POOL.push(o)};
const stOf=e=>e=="VERIFICADO"?"v":"u",sl=(...a)=>a.filter(Boolean);
function rngS(sd){let h=7;for(const c of sd)h=(Math.imul(31,h)+c.charCodeAt(0))|0;return()=>{h=(h+1831565813)|0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const MESN="enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split(" ");
const dtx=f=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(f||"");return m?`${+m[3]} de ${MESN[+m[2]-1]} de ${m[1]}`:""};
function aliasMap(names,extra){const T=names.map(n=>SQN(n).split(" ")),cl={},cf={};T.forEach(t=>{const l=t[t.length-1];cl[l]=(cl[l]||0)+1;cf[t[0]]=(cf[t[0]]||0)+1});const out={};names.forEach((n,i)=>{const t=T[i],a=new Set([t.join(" ")]);if(t.length>1)a.add(t[0]+" "+t[t.length-1]);if(cl[t[t.length-1]]==1)a.add(t[t.length-1]);if(t.length>1&&cf[t[0]]==1)a.add(t[0]);if(t.length>2)a.add(t.slice(-2).join(" "));((extra&&extra[n])||[]).forEach(z=>a.add(z));out[n]=[...a]});return out}
const F={};S.temporadas.forEach(t=>{F[t.t]=t.dato||""});
const bySeason={};S.goleadores.forEach(r=>(bySeason[r.t]=bySeason[r.t]||[]).push(r));
const topOf=s=>(bySeason[s]||[]).slice().sort((a,b)=>b.g-a.g);
/* g: ¿Cuántos goles? */
S.goleadores.forEach(r=>add({id:`g-${r.t}-${SQN(r.j).replace(/ /g,"")}`,type:"g",lvl:r.g>=14?"n":"d",p:r.j,s:r.t,g:r.g,st:stOf(r.estado),src:sl(r.f1,r.f2)}));
/* t: máximo goleador (solo si la lista permite afirmarlo) */
S.temporadas.forEach(t=>{const L=topOf(t.t);if(!L.length||!["COMPLETO","LIDER"].includes(t.gol))return;const AL=aliasMap(L.slice(0,3).map(x=>x.j));
 if(L.length==1||L[0].g>L[1].g)add({id:`t-${t.t}-1`,type:"t",lvl:t.nivel,q:`¿Quién fue el máximo goleador de Atlanta en la liga ${t.t}?`,ans:AL[L[0].j],p:L[0].j,s:t.t,g:L[0].g,src:sl(L[0].f1,L[0].f2),st:stOf(L[0].estado)});
 if(t.gol=="COMPLETO"&&L.length>2&&L[1].g!==L[0].g&&L[1].g!==L[2].g)add({id:`t-${t.t}-2`,type:"t",lvl:t.nivel,q:`¿Quién fue el segundo máximo goleador de Atlanta en la liga ${t.t}?`,ans:AL[L[1].j],p:L[1].j,s:t.t,g:L[1].g,src:sl(L[1].f1,L[1].f2),st:stOf(L[1].estado)})});
/* a: Adiviná la temporada (pistas generadas desde la tabla de temporadas) */
S.temporadas.forEach(t=>{const cl=[],z=t.zona&&t.zona!="Única"?t.zona:"";
 cl.push(/transici/i.test(t.torneo)?"Fue un torneo de transición de la Primera Nacional, de temporada corta.":`Atlanta jugaba en la ${t.torneo}${z?", "+z:""}.`);
 if(t.pj!==""&&t.pg!=="")cl.push(`Jugó ${t.pj} partidos: ganó ${t.pg}, empató ${t.pe} y perdió ${t.pp}.`);
 if(t.gf!=="")cl.push(`Hizo ${t.gf} goles y recibió ${t.gc}.`);
 const L=topOf(t.t);if(L.length&&["COMPLETO","LIDER"].includes(t.gol)&&(L.length==1||L[0].g>L[1].g))cl.push(`${L[0].j} fue su goleador, con ${L[0].g} goles de liga.`);
 if(t.dato)cl.push(t.dato);
 if(t.pos!==""&&t.pts!==""&&t.posdef!="NO")cl.push(`Terminó ${t.pos}.º${z?" de su zona":""} con ${t.pts} puntos.`);
 if(cl.length>=4)add({id:"a-"+t.t,type:"a",lvl:t.nivel,s:t.t,cl,src:sl(t.f1,t.f2),st:stOf(t.estado)})});
/* r y m: partidos y goleadores */
const gBy={};S.goles.forEach(g=>(gBy[g.p]=gBy[g.p]||[]).push(g));
const venue=m=>m.es||(m.lo=="Atlanta"?"Don León Kolbowsky":"");
const tlabel=m=>/^(Reducido|Copa)/.test(m.torneo)?`${m.torneo} ${m.t}`:`${m.torneo} ${m.t}${m.zona&&m.zona!="Única"&&m.zona!="No aplica"?" · "+m.zona:""}`;
S.partidos.forEach(m=>{const es=venue(m);if(!es)return;const fo=/^\d+$/.test(m.fo)?`, fecha ${m.fo}`:"";
 add({id:"r-"+m.id,type:"r",lvl:(+m.t.slice(0,4)>=2025||Math.abs(m.gl-m.gv)>=2)?"n":"d",s:m.t,t:tlabel(m),lo:m.lo,a:m.gl,b:m.gv,vi:m.vi,es,src:sl(m.f1,m.f2),st:stOf(m.estado),ex:`${dtx(m.f)||"Fecha no confirmada"}${fo}. ${tlabel(m)}.`});
 const gs=(gBy[m.id]||[]).filter(g=>g.e=="ATL"),ag=m.lo=="Atlanta"?m.gl:m.gv;
 if(m.gk&&gs.length&&gs.length==ag){const by={};gs.forEach(g=>(by[g.j]=by[g.j]||[]).push(g.m+(g.tp=="penal"?" penal":"")));const names=Object.keys(by),AL=aliasMap(names),sc=names.map(n=>by[n].filter(Boolean).length?`${n} (${by[n].filter(Boolean).join(" y ")})`:n),riv=(gBy[m.id]||[]).filter(g=>g.e=="RIVAL").map(g=>g.j+(g.m?` (${g.m})`:""));
  add({id:"m-"+m.id,type:"m",lvl:+m.t.slice(0,4)>=2025?"n":"d",s:m.t,t:tlabel(m),lo:m.lo,a:m.gl,b:m.gv,vi:m.vi,es,d:dtx(m.f),sc,ans:[...new Set(names.flatMap(n=>AL[n]))],src:sl(m.f1,m.f2),st:stOf(m.estado),ex:`Goles de Atlanta: ${sc.join(", ")}.${riv.length?` Goles del rival: ${riv.join(", ")}.`:""} ${dtx(m.f)?dtx(m.f)+". ":""}${tlabel(m)}.`})}});
/* c: completá (formaciones, goleadores, plantel) */
S.alineaciones.forEach(a=>["n","d"].forEach(lv=>{const bl=a.js.map((x,i)=>x.c==lv?i:-1).filter(i=>i>=0);if(!bl.length)return;add({id:`c-${a.id}-${lv}`,type:"c",lvl:lv,title:`Formación de Atlanta ante ${a.rival} (${dtx(a.fecha)}). Completá los ${bl.length} nombres que faltan.`,items:a.js.map(x=>({n:x.j,al:x.al.map(SQN)})),bl,src:sl(a.f),st:"v",ex:`Formación publicada para ese partido (${srcName(a.f)}).`})}));
S.temporadas.filter(t=>t.gol=="COMPLETO").forEach(t=>{const L=topOf(t.t);if(L.length<6)return;const AL=aliasMap(L.map(x=>x.j)),uq=i=>L.filter(x=>x.g==L[i].g).length==1,nb=[],db=[],seen=new Set();
 for(let i=0;i<Math.min(L.length,8)&&nb.length<3;i++)if(uq(i))nb.push(i);
 for(let i=2;i<L.length&&db.length<4;i++)if(!seen.has(L[i].g)){seen.add(L[i].g);db.push(i)}
 [["n",nb,Math.min(L.length,8)],["d",db,L.length]].forEach(([lv,bl,len])=>{if(bl.length<2)return;add({id:`c-gol-${t.t}-${lv}`,type:"c",lvl:lv,title:`Goleadores de liga de Atlanta en ${t.t}. Completá los que faltan (se indican sus goles).`,items:L.slice(0,len).map(x=>({n:x.j,al:AL[x.j],h:x.g+" goles"})),bl,src:sl(L[0].f1,L[0].f2),st:"v",ex:"Los goles en contra de rivales no cuentan."})})});
const PC={"2018/19":{n:["Ignacio Colombini","Horacio Martínez","Fabricio Pedrozo","Milton Giménez"],d:["Diego Nakache","Lucas Colitto","Gabriel Seijas","Mariano Bettini"]}};
Object.keys(PC).forEach(s=>{const pl=S.planteles[s];if(!pl)return;const names=pl.map(x=>x.j),AL=aliasMap(names,Object.fromEntries(pl.map(x=>[x.j,x.al])));["n","d"].forEach(lv=>{const bl=PC[s][lv].map(n=>names.indexOf(n));if(bl.some(i=>i<0))return;add({id:`c-pl-${s}-${lv}`,type:"c",lvl:lv,title:`Plantel de Atlanta ${s}. Completá los ${bl.length} nombres que faltan.`,items:names.map(n=>({n,al:AL[n]})),bl,src:"xl",st:"u",ex:"Lista de plantel de esa temporada."})})});
/* w e i: planteles */
const rW=rngS("w"),shufS=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
Object.keys(S.planteles).forEach(s=>{const pl=S.planteles[s];if(pl.length<5)return;const names=pl.map(x=>x.j),AL=aliasMap(names,Object.fromEntries(pl.map(x=>[x.j,x.al]))),sc=new Set((bySeason[s]||[]).map(x=>x.j)),unk=pl.some(x=>x.s!="SI"),fu=[...new Set(pl.map(x=>x.f))];
 for(let k=0;k<2;k++){const pool=names.slice(),a=pool.splice(Math.floor(rW()*pool.length),1)[0],b=pool[Math.floor(rW()*pool.length)];add({id:`w-${s}-${k}`,type:"w",lvl:(sc.has(a)&&sc.has(b))?"n":"d",shn:[a,b],s,pl:pl.map(x=>({j:x.j,al:AL[x.j]})),src:fu,st:unk?"u":"v"})}});
S.temporadas.filter(t=>t.gol=="COMPLETO").forEach(t=>{const L=topOf(t.t),pl=S.planteles[t.t]||[],scN=new Set(L.map(x=>x.j)),non=pl.filter(x=>x.s=="SI"&&!scN.has(x.j)).map(x=>x.j);if(!non.length||L.length<4)return;const r2=rngS("i"+t.t);
 for(let k=0;k<Math.min(3,non.length);k++){const ch=shufS(L,r2).slice(0,4),it=shufS([...ch.map(x=>x.j),non[k]],r2);add({id:`i-${t.t}-${k}`,type:"i",lvl:Math.min(...ch.map(x=>x.g))>=3?"n":"d",it,x:non[k],q:`Cuatro de estos jugadores marcaron al menos un gol de liga en ${t.t}. Uno jugó ese año pero no marcó. ¿Quién es el intruso?`,src:sl(L[0].f1,L[0].f2,...new Set(pl.map(x=>x.f))),st:"v",ex:`La lista de goleadores de ${t.t} suma los goles del equipo (los goles en contra de rivales no cuentan) y ${non[k]} no figura entre ellos.`})}});
/* o: orden cronológico (hitos) */
const HS=S.hitos.slice().sort((a,b)=>a.k-b.k);
if(HS.length>=4){const ro=rngS("o"),seen=new Set();for(let n=0;n<80&&seen.size<10;n++){const size=n%3==2?5:4,idx=new Set();while(idx.size<Math.min(size,HS.length))idx.add(Math.floor(ro()*HS.length));const a=[...idx].sort((x,y)=>x-y),key=a.join("-");if(seen.has(key))continue;seen.add(key);add({id:"o-"+key,type:"o",lvl:size==4?"n":"d",it:a.map(i=>({k:HS[i].k,d:HS[i].f,t:HS[i].h})),src:a.flatMap(i=>[HS[i].f1,HS[i].f2]),st:"v"})}}
/* k: Camiseta misteriosa (valen los dos años de una temporada) */
(S.camisetas||[]).forEach(c=>{const y1=c.y[0],h=[...c.id].reduce((a,ch)=>a+ch.charCodeAt(0),0),lo=y1-(h%2),p2=n=>String(n%100).padStart(2,"0"),ok=(c.y.length>1?[...c.y,`${c.y[0]}/${p2(c.y[1])}`,`${p2(c.y[0])}/${p2(c.y[1])}`,`${c.y[0]}/${c.y[1]}`]:c.y).map(String),vis=[c.fab&&"marca "+c.fab,c.sp&&"sponsor "+c.sp].filter(Boolean).join(", ");
 add({id:"k-"+c.id,type:"k",lvl:c.lvl,s:c.t,img:c.img,og:c.og,cr:c.cr,ok,hints:[`Es de la década de ${Math.floor(y1/10)*10}.`,`Es de entre ${lo} y ${lo+3}.`],fu:c.fu,perm:c.perm,src:["usuario"],st:"u",ex:`Camiseta ${c.t}${c.y.length>1?` (valen ${c.y.join(" y ")})`:""}${c.v?`, versión ${c.v}`:""}. ${vis?"Marca y sponsor: "+vis+".":""} ${F[c.t]||""}`})});
const capK=q=>`<p class="mut" style="text-align:center;margin:0 0 6px;font-size:12px">${q.og=="RECREACION_IA"?"Imagen recreada con IA a partir de una foto: puede tener diferencias con la camiseta real.":q.cr||""}</p>`;
const AV=GAMES.filter(g=>POOL.some(q=>q.type==g[0]));

/* ===== UTILIDADES ===== */
const app=document.getElementById("app"),MEM={};
const ls={g(k){try{return localStorage.getItem(k)}catch(e){return MEM[k]||null}},s(k,v){try{localStorage.setItem(k,v)}catch(e){MEM[k]=v}}};
const load=k=>{try{return JSON.parse(ls.g(k)||(k=="db7_res"?"{}":"[]"))}catch(e){return k=="db7_res"?{}:[]}};
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Argentina/Buenos_Aires"}).format(new Date());
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
function rng(seed){let h=7;for(const c of seed)h=(Math.imul(31,h)+c.charCodeAt(0))|0;return()=>{h=(h+1831565813)|0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const shuf=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const INICIO="2026-10-15";
const PBY=new Map(POOL.map(q=>[q.id,q]));
function dailyFresh(d){const r=rng("bohemio-v7-"+d);return shuf(AV.map(x=>x[0]),r).slice(0,7).map(t=>{const p=POOL.filter(q=>q.type==t);return p[Math.floor(r()*p.length)]})}
function daily(d){const j=typeof JORNADAS!="undefined"&&JORNADAS[d];if(j){const q=j.map(id=>PBY.get(id));if(q.every(Boolean))return q}return dailyFresh(d)}
const NAP=m=>`<svg viewBox="0 0 80 80" width="${m=="big"?84:56}" height="${m=="big"?84:56}" role="img" aria-label="Napoleón"><ellipse cx="18" cy="30" rx="10" ry="18" fill="#0b3a8f" stroke="#fff" stroke-width="1.5" transform="rotate(20 18 30)"/><ellipse cx="62" cy="30" rx="10" ry="18" fill="#0b3a8f" stroke="#fff" stroke-width="1.5" transform="rotate(-20 62 30)"/><circle cx="40" cy="42" r="26" fill="#ffd100"/><circle cx="31" cy="38" r="4" fill="#111"/><circle cx="49" cy="38" r="4" fill="#111"/><ellipse cx="40" cy="50" rx="7" ry="5" fill="#111"/>${m=="sad"?'<path d="M32 63q8-7 16 0" stroke="#111" stroke-width="3" fill="none"/>':'<path d="M32 58q8 8 16 0" stroke="#111" stroke-width="3" fill="none"/>'}</svg>`;
const JER=n=>`<svg viewBox="0 0 48 48" width="54" height="54" aria-hidden="true" style="flex:none"><g clip-path="url(#sh)"><rect width="48" height="48" fill="#ffd100"/><g fill="#0b3a8f"><rect x="12" width="5" height="48"/><rect x="22" width="5" height="48"/><rect x="32" width="5" height="48"/></g></g><path d="M15 4 4 10l4 11 6-3v27h20V18l6 3 4-11L33 4q-3 5-9 5t-9-5z" fill="none" stroke="#071d4d" stroke-width="1.6"/><text x="24" y="34" text-anchor="middle" font-family="Oswald,Impact,sans-serif" font-weight="700" font-size="16" fill="#fff" stroke="#071d4d" stroke-width="2.4" paint-order="stroke">${n}</text></svg>`;
const REDC=`<svg width="42" height="58" viewBox="0 0 46 64" aria-hidden="true"><rect x="5" y="5" width="36" height="54" rx="6" fill="#e5242a" stroke="#fff" stroke-width="3" transform="rotate(-8 23 32)"/></svg>`;
const ini=n=>n.split(" ").map(w=>w[0]).slice(0,2).join(""),av=n=>`<div class="av" aria-hidden="true">${ini(n)}</div>`;
const gm=t=>GAMES.find(x=>x[0]==t),val=()=>document.getElementById("in").value.trim();
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
const inp=n=>`<input id="in" ${n?'type="number" inputmode="numeric" min="0"':'type="text" autocomplete="off"'} placeholder="Tu respuesta" onkeydown="if(event.key==='Enter')ans()">`;
const pad=n=>String(n%100).padStart(2,"0");
/* ===== MECÁNICAS POR MINIJUEGO ===== */
const H={
g:{b:q=>`<div class="row">${av(q.p)}<h3 class="grow">¿Cuántos goles de liga marcó ${q.p} en ${q.s}?</h3></div>${inp(1)}`,
ck:q=>{const v=val();if(v==="")return;const n=Number(v);return n==q.g?{ok:1}:{msg:n<q.g?"Más goles que eso.":"Menos goles que eso."}},
sol:q=>q.g+" goles",ex:q=>`${q.p}: ${q.g} gol${q.g==1?"":"es"} de liga en ${q.s}. ${F[q.s]||""}`},
t:{b:q=>`<div class="row">${NAP("")}<h3 class="grow">${q.q}</h3></div>${inp()}`,
ck:q=>{const v=val();if(!v)return;return q.ans.includes(norm(v))?{ok:1}:{msg:"No es esa persona."}},
sol:q=>q.p,ex:q=>`${q.p}: ${q.g} goles de liga en ${q.s}. ${F[q.s]||""}`},
a:{b:(q,g)=>`<h3>¿De qué temporada se trata?</h3><ol>${q.cl.slice(0,(g.clue||0)+1).map(c=>`<li>${c}</li>`).join("")}</ol><p class="mut">Cada error revela otra pista. Escribí el año o la temporada (ej. 2005/06).</p>${inp()}`,
ck:q=>{const v=val();if(!v)return;const y=+q.s.slice(0,4),a=norm(v).replace(/ /g,"/");let ok=[String(y)];if(q.s.length>4){const o=POOL.filter(x=>x.type=="a"&&x!==q),has=z=>o.some(x=>x.s==String(z)||x.s.startsWith(z+"/"));ok=[`${y}/${pad(y+1)}`,`${pad(y)}/${pad(y+1)}`,`${y}/${y+1}`];if(!has(y))ok.push(String(y));if(!has(y+1))ok.push(String(y+1))}return ok.includes(a)?{ok:1}:{msg:"No es esa temporada."}},
sol:q=>q.s,ex:q=>q.cl.join(" ")},
c:{b:(q,g)=>`<h3>${q.title}</h3>${q.items.map((it,i)=>q.bl.includes(i)?((g.lock||{})[i]?`<div class="card">✅ ${it.n}</div>`:`<input id="b${i}" value="${(g.vals||{})[i]||""}" placeholder="${it.h||"¿Quién falta?"}" style="margin:4px 0">`):`<div class="card">${it.n}${it.h?` <span class="mut">(${it.h})</span>`:""}</div>`).join("")}`,
ck:(q,g)=>{g.lock=g.lock||{};g.vals=g.vals||{};let all=1,c=0,any=0;q.bl.forEach(i=>{if(g.lock[i]){c++;return}const e=document.getElementById("b"+i),v=e?e.value.trim():"";g.vals[i]=v;if(v)any=1;if(v&&q.items[i].al.includes(norm(v))){g.lock[i]=1;c++}else all=0});if(!all&&!any&&!c)return;return all?{ok:1}:{msg:`${c} de ${q.bl.length} correctas.`}},
sol:q=>q.bl.map(i=>q.items[i].n).join(", "),ex:q=>q.ex},
w:{b:q=>`<div class="row">${q.shn.map(av).join("")}<h3 class="grow">${q.shn.join(" y ")} compartieron plantel en ${q.s}. Nombrá a otro compañero.</h3></div>${inp()}`,
ck:q=>{const v=val();if(!v)return;const k=q.pl.find(o=>o.al.includes(norm(v)));if(!k)return{msg:"No figura en la lista de plantel que tengo de esa temporada."};if(q.shn.includes(k.j))return{msg:"Ese ya está en la pregunta."};return{ok:1}},
sol:q=>q.pl.filter(o=>!q.shn.includes(o.j)).map(o=>o.j).join(", "),ex:q=>`Compañeros según la lista de plantel ${q.s}; cualquier jugador de esa lista es válido.`},
i:{b:(q,g)=>`<h3>${q.q}</h3><div class="grid" style="grid-template-columns:1fr 1fr;margin-top:10px">${q.it.map((n,k)=>`<button class="card row" style="text-align:left;font:inherit;color:inherit" onclick="pick(${k})" ${(g.bad||[]).includes(k)?"disabled":""}>${av(n)}<span>${n}</span></button>`).join("")}</div>`,
ck:(q,g)=>{const k=g.pick;g.pick=null;if(k==null)return;if(q.it[k]==q.x)return{ok:1};(g.bad=g.bad||[]).push(k);return{msg:`${q.it[k]} sí marcó al menos un gol de liga en esa temporada.`}},
sol:q=>q.x,ex:q=>q.ex},
o:{b:(q,g)=>`<h3>Ordená del más antiguo (arriba) al más reciente (abajo).</h3>${g.ord.map((k,i)=>`<div class="card row" style="margin-top:8px"><span class="grow">${q.it[k].t}</span><button class="btn o" onclick="mv(${i},-1)" aria-label="Subir">▲</button><button class="btn o" onclick="mv(${i},1)" aria-label="Bajar">▼</button></div>`).join("")}`,
ck:(q,g)=>{const n=g.ord.filter((k,i)=>k==i).length;return n==q.it.length?{ok:1}:{msg:`${n} de ${q.it.length} en su lugar.`}},
sol:q=>q.it.map(x=>`${x.d}: ${x.t}`).join("<br>"),ex:q=>"Orden de los hitos según las fuentes indicadas."}};
H.k={b:(q,g)=>{const c=g.clue||0,bl=q.lvl=="d"?[8,4,0][Math.min(c,2)]:0,hs=q.hints.slice(0,c).map(x=>`<p class="mut" style="margin:6px 0">💡 ${x}</p>`).join("");return`<h3>¿De qué temporada es esta camiseta?</h3><img src="${q.img}" alt="Camiseta de Atlanta" style="display:block;margin:10px auto;max-width:100%;max-height:340px;filter:blur(${bl}px)">${capK(q)}${hs}<p class="mut" style="margin:6px 0">Valen los dos años de una temporada (por ejemplo, 2000 o 2001 para la 2000/01).</p>${inp()}`},
ck:q=>{const v=val();if(!v)return;return q.ok.includes(norm(v).replace(/ /g,"/"))?{ok:1}:{msg:"No es esa temporada."}},
sol:q=>`<img src="${q.img}" alt="Camiseta" style="display:block;margin:0 auto 4px;max-height:200px">${capK(q)}${q.s}${q.ok.length>1?` (valen ${q.ok.slice(0,2).join(" y ")})`:""}`,ex:q=>q.ex};
H.r={b:q=>`<span class="tag">${q.t}</span><h3 style="margin:8px 0">${q.lo} vs ${q.vi}</h3><p class="mut">🏟 Cancha: ${q.es}</p><div class="row" style="justify-content:center;margin:14px 0"><div style="text-align:center;flex:1"><b>${q.lo}</b><input id="r1" type="number" inputmode="numeric" min="0" style="text-align:center;margin-top:6px" onkeydown="if(event.key==='Enter')ans()"></div><b style="font-size:26px">–</b><div style="text-align:center;flex:1"><b>${q.vi}</b><input id="r2" type="number" inputmode="numeric" min="0" style="text-align:center;margin-top:6px" onkeydown="if(event.key==='Enter')ans()"></div></div>`,
ck:q=>{const a=document.getElementById("r1").value,b=document.getElementById("r2").value;if(a===""||b==="")return;const x=+a,y=+b;if(x==q.a&&y==q.b)return{ok:1};return{msg:Math.sign(x-y)==Math.sign(q.a-q.b)?"Acertaste quién ganó (o el empate), pero no el marcador.":"Ese no fue el resultado."}},
sol:q=>`${q.lo} ${q.a} - ${q.b} ${q.vi}`,ex:q=>q.ex};
H.m={b:q=>`<span class="tag">${q.t}</span><h3 style="margin:8px 0">${q.lo} ${q.a} - ${q.b} ${q.vi}</h3><p class="mut">🏟 ${q.es}${q.d?" · "+q.d:""}</p><p>¿Quién marcó para Atlanta? Nombrá a uno.</p>${inp()}`,
ck:q=>{const v=val();if(!v)return;return q.ans.includes(norm(v))?{ok:1}:{msg:"Ese no marcó para Atlanta en ese partido."}},
sol:q=>q.sc.join(", "),ex:q=>q.ex};
const PUBLICAS=new Set(S.fuentes.filter(f=>f.tipo!="aporte").map(f=>f.id));
const srcs=q=>{if(q.type=="k")return q.og=="FOTO_TERCEROS"&&q.cr?q.cr:"";const l=[...new Set(q.src.filter(k=>PUBLICAS.has(k)||/^https?:/.test(k)).map(srcName))];return l.length?"Fuentes: "+l.join(", "):""};
/* ===== ESTADO Y NAVEGACIÓN ===== */
let page="home",arch=today(),calM=today().slice(0,7),G0=null,tm=null;
function nav(p){if(p=="arc")calM=arch.slice(0,7);page=p;clearInterval(tm);G0=null;draw()}
function draw(){document.getElementById("tabs").innerHTML=[["home","⚽","Hoy"],["cat","🎯","Juegos"],["arc","📅","Archivo"],["sta","📊","Stats"]].map(([k,i,l])=>`<button class="${page==k?"on":""}" onclick="nav('${k}')"><b>${i}</b>${l}</button>`).join("");({home:vHome,cat:vCat,arc:vArc,sta:vSta,play:vPlay,res:()=>{}}[page])();window.scrollTo(0,0)}
function record(date,idx,o){const r=load("db7_res");r[date]=r[date]||{};if(!r[date][idx]){o.pd=today();r[date][idx]=o;ls.s("db7_res",JSON.stringify(r))}}
function streak(){const r=load("db7_res");let d=new Date(today()+"T12:00:00"),n=0;const k=x=>x.toISOString().slice(0,10);if(!r[k(d)])d.setDate(d.getDate()-1);while(r[k(d)]&&Object.values(r[k(d)]).some(x=>x.pd===undefined||x.pd===k(d))){n++;d.setDate(d.getDate()-1)}return n}
/* ===== VISTAS ===== */
function cards(date){const r=load("db7_res")[date]||{};return daily(date).map((q,i)=>{const s=r[i],x=gm(q.type);
return`<div class="card ${s?s.r:""}"><div class="row">${JER(i+1)}<div class="grow"><h3>${x[1]}</h3><div class="mut">${x[2]}</div><span class="tag">${q.lvl=="n"?"Normal":"Difícil"}</span></div>${s?`<div class="big2 ${s.r}"><i>${s.r=="w"?"⚽":"🟥"}</i>${s.r=="w"?"Victoria":"Fail"}</div>`:`<div style="text-align:center"><span class="st">PENDIENTE</span><br><button class="btn" style="margin-top:6px" onclick="openQ('${date}',${i})">Jugar</button></div>`}</div>${s?`<button class="btn o" style="margin-top:10px;width:100%" onclick="openQ('${date}',${i})">Ver respuesta y explicación</button>`:""}</div>`}).join("")}
function vHome(){const d=today(),r=load("db7_res")[d]||{},v=Object.values(r),n=v.length,w=v.filter(x=>x.r=="w").length,f=n-w;const fe=new Intl.DateTimeFormat("es-AR",{timeZone:"America/Argentina/Buenos_Aires",dateStyle:"full"}).format(new Date());
app.innerHTML=`<div class="hero"><div class="row">${NAP("big")}<div class="grow"><h2 style="color:#fff">¡Hola, bohemio!</h2><div class="mut">${fe}</div><div class="mut">Hoy juega Atlanta… de memoria.</div></div></div><div class="sb"><div><small>VICTORIAS</small><b>${w}</b></div><div class="m">–</div><div><small>FAIL</small><b>${f}</b></div><div><small>JUGADOS</small><b>${n}/7</b></div><div><small>RACHA</small><b>${streak()}</b></div></div></div>${cards(d)}<div class="row"><button class="btn y grow" onclick="share('${d}')">Compartir resultados</button></div><p class="mut" id="msg"></p><p class="foot">Proyecto de hinchas, no es la web oficial del club.<br>Villa Crespo · Humboldt 340 · desde 1904 · Cobertura 2010 en adelante<br>Cada desafío se juega una sola vez por fecha.</p>`}
function vCat(){app.innerHTML=`<h2>Todos los minijuegos</h2><p class="mut">Cada pregunta se juega una sola vez por día.</p>`+AV.map(g=>`<div class="card"><div class="row">${JER(AV.indexOf(g)+1)}<div class="grow"><h3>${g[1]}</h3><p class="mut" style="margin:2px 0">${g[2]}</p></div></div><div class="row" style="margin-top:10px"><select id="lv-${g[0]}" style="font:inherit;padding:10px;border-radius:10px"><option value="n">Normal</option><option value="d">Difícil</option></select><button class="btn grow" onclick="freePlay('${g[0]}')">Jugar</button></div><p class="mut" id="fm-${g[0]}"></p></div>`).join("")+`<h3>Próximamente</h3>`+WAIT.map(w=>`<div class="card row"><span class="grow">${w[0]}</span><button class="btn" disabled>Muy pronto</button></div>`).join("")}
const pad2=n=>String(n).padStart(2,"0");
function calMove(d){const[y,m]=calM.split("-").map(Number),dt=new Date(Date.UTC(y,m-1+d,1)),n=dt.getUTCFullYear()+"-"+pad2(dt.getUTCMonth()+1);if(n<INICIO.slice(0,7)||n>today().slice(0,7))return;calM=n;vArc()}
function pickDay(d){arch=d;vArc()}
function vArc(){const t=today(),[y,m]=calM.split("-").map(Number),first=new Date(Date.UTC(y,m-1,1)),dim=new Date(Date.UTC(y,m,0)).getUTCDate(),off=(first.getUTCDay()+6)%7,res=load("db7_res");let cells="";for(let i=0;i<off;i++)cells+="<div></div>";
for(let d=1;d<=dim;d++){const iso=`${calM}-${pad2(d)}`,ok=iso>=INICIO&&iso<=t,v=Object.values(res[iso]||{}),n=v.length,w=v.filter(x=>x.r=="w").length,st=!ok||!n?"":n<7?"p":w==7?"g":"c";
cells+=`<button class="cal ${ok?"":"x"} ${iso==arch?"sel":""} ${st} ${iso==t?"hoy":""}" ${ok?`onclick="pickDay('${iso}')"`:"disabled"} aria-label="${d}"><b>${d}</b><small>${ok&&n?w+"/"+n:"&nbsp;"}</small></button>`}
const mn=new Intl.DateTimeFormat("es-AR",{month:"long",year:"numeric",timeZone:"UTC"}).format(first),dl=new Intl.DateTimeFormat("es-AR",{dateStyle:"full",timeZone:"UTC"}).format(new Date(arch+"T12:00:00Z"));
app.innerHTML=`<h2>Archivo histórico</h2><div class="card"><div class="row"><button class="btn o" onclick="calMove(-1)" aria-label="Mes anterior">◀</button><b class="grow" style="text-align:center;text-transform:capitalize">${mn}</b><button class="btn o" onclick="calMove(1)" aria-label="Mes siguiente">▶</button></div><div class="calg" style="margin-top:8px">${["L","M","M","J","V","S","D"].map(x=>`<div class="mut" style="text-align:center">${x}</div>`).join("")}${cells}</div><p class="mut" style="margin:8px 0 0">Cada día muestra victorias/desafíos jugados. <b style="color:var(--ok)">Verde</b>: 7 victorias · <b style="color:var(--bl)">azul</b>: día completo · <b style="color:#b58900">amarillo</b>: día a medias.</p></div><h3 style="margin:10px 0 6px;text-transform:capitalize">${dl}</h3>${cards(arch)}`}
function vSta(){const r=load("db7_res"),fr=load("db7_free"),all=[];Object.values(r).forEach(o=>Object.values(o).forEach(x=>all.push(x)));fr.forEach(x=>all.push(x));const w=all.filter(x=>x.r=="w").length,f=all.length-w,pc=all.length?Math.round(w/all.length*100):0;
const by=GAMES.map(g=>{const a=all.filter(x=>x.t==g[0]),ww=a.filter(x=>x.r=="w").length;return`<div class="card row"><span class="grow">${g[1]}</span><b>${ww}/${a.length}</b></div>`}).join("");
app.innerHTML=`<h2>Mis estadísticas</h2><div class="grid"><div class="card"><div class="n">${streak()}</div>Racha</div><div class="card"><div class="n">${Object.keys(r).length}</div>Días jugados</div><div class="card"><div class="n">${w}</div>Victorias</div><div class="card"><div class="n">${f}</div>FAIL</div></div><div class="card"><div class="n">${pc}%</div>de aciertos (${all.length} desafíos)</div><h3>Por minijuego</h3>${by}<div class="card mut" style="margin-top:12px">Tus estadísticas se guardan solo en este dispositivo.</div>`}
function share(d){const r=load("db7_res")[d]||{},s=daily(d).map((q,i)=>r[i]?(r[i].r=="w"?"🟩":"🟥"):"⬜").join(""),w=Object.values(r).filter(x=>x.r=="w").length,t=`Desafíos del Bohemio 💛💙\n${d}\n${s}\n${w}/7 victorias 🐕`,mm=document.getElementById("msg");
if(navigator.share)navigator.share({text:t}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>mm.textContent="Resultado copiado.",()=>mm.textContent=t);else mm.textContent=t}
/* ===== JUEGO ===== */
function freePlay(t){const lv=document.getElementById("lv-"+t).value,d=today(),done=load("db7_free").filter(x=>x.d==d).map(x=>x.id),p=POOL.filter(q=>q.type==t&&q.lvl==lv&&!done.includes(q.id));
if(!p.length){document.getElementById("fm-"+t).textContent="Ya jugaste todas las preguntas de este nivel hoy. Volvé mañana.";return}start(p[Math.floor(Math.random()*p.length)],null,null)}
function openQ(d,i){const q=daily(d)[i],s=(load("db7_res")[d]||{})[i];s?showRes(q,s):start(q,d,i)}
function start(q,d,i){page="play";G0={q,d,i,mode:null,tries:3,over:false};if(q.type=="o"){let o;do{o=shuf(q.it.map((_,k)=>k),Math.random)}while(o.every((k,j)=>k==j));G0.ord=o}draw()}
function vPlay(){const g=G0,q=g.q,x=gm(q.type);
if(!g.mode){app.innerHTML=`<div class="card"><span class="tag">${q.lvl=="n"?"Normal":"Difícil"}</span><h2>${x[1]}</h2><p>${x[2]}</p><p class="mut">3 intentos. Elegí la modalidad: la pregunta aparece al empezar.</p><div class="row"><button class="btn grow" onclick="go('u')">Ilimitado</button><button class="btn y grow" onclick="go('c')">Contrarreloj ${q.lvl=="n"?90:60} s</button></div></div>`;return}
app.innerHTML=`<div class="row" style="margin-bottom:10px"><div class="clock grow" id="clk" style="text-align:center">${g.mode=="c"?fmt(g.lim):"∞"}</div><span class="mut" id="tr">Intentos: ${g.tries}</span></div><div class="card" id="bd">${H[q.type].b(q,g)}</div><p class="mut" id="fb"></p><div class="row">${q.type=="i"?"":`<button class="btn grow" onclick="ans()">Responder</button>`}<button class="btn o ${q.type=="i"?"grow":""}" onclick="askGive()">Rendirse</button></div><div id="cf"></div>`;const e=document.getElementById("in");if(e)e.focus()}
function go(m){const g=G0;g.mode=m;g.lim=g.q.lvl=="n"?90:60;g.t0=Date.now();if(m=="c")tm=setInterval(()=>{const left=g.lim-(Date.now()-g.t0)/1000,e=document.getElementById("clk");if(e){e.textContent=fmt(Math.max(0,Math.ceil(left)));e.className="clock grow"+(left<=10?" low":"")}if(left<=0)end("f","Tiempo agotado")},250);draw()}
function pick(id){G0.pick=id;ans()}
function mv(i,d){const o=G0.ord;if(G0.over||i+d<0||i+d>=o.length)return;[o[i],o[i+d]]=[o[i+d],o[i]];document.getElementById("bd").innerHTML=H.o.b(G0.q,G0)}
function ans(){const g=G0;if(!g||g.over)return;const q=g.q,h=H[q.type],r=h.ck(q,g);if(!r)return;if(r.ok)return end("w","");if(r.part){document.getElementById("bd").innerHTML=h.b(q,g);document.getElementById("fb").textContent=r.msg;const e2=document.getElementById("in");if(e2)e2.focus();return}g.tries--;if(g.tries<=0)return end("f","Sin intentos");g.clue=(g.clue||0)+1;document.getElementById("bd").innerHTML=h.b(q,g);document.getElementById("fb").textContent=r.msg;document.getElementById("tr").textContent="Intentos: "+g.tries;const e=document.getElementById("in");if(e)e.focus()}
function askGive(){if(G0.over)return;document.getElementById("cf").innerHTML=`<div class="card" style="margin-top:10px"><b>¿Seguro que querés rendirte?</b><div class="row" style="margin-top:8px"><button class="btn grow" onclick="end('f','Te rendiste')">Sí, rendirme</button><button class="btn o grow" onclick="document.getElementById('cf').innerHTML=''">Seguir</button></div></div>`}
function end(r,why){const g=G0;if(!g||g.over)return;g.over=true;clearInterval(tm);const t=Math.round((Date.now()-g.t0)/1000),rec={r,why,id:g.q.id,time:g.mode=="c"?t:null,t:g.q.type};
if(g.d)record(g.d,g.i,rec);else{const f=load("db7_free");f.push({r,t:g.q.type,id:g.q.id,d:today()});ls.s("db7_free",JSON.stringify(f))}showRes(g.q,rec)}
function showRes(q,s){const w=s.r=="w",h=H[q.type];page="res";draw();
app.innerHTML=`<div class="res ${s.r}">${w?`<div class="goal">¡GOOOL!</div>`:`${REDC}<div class="goal" style="color:#fff">TARJETA ROJA</div>`}${NAP(w?"":"sad")}<h2>${w?"VICTORIA":"FAIL"}</h2><div>${w?"¡Grande, bohemio!":(s.why||"")+". Napoleón te mira con cara de cancha pesada."}</div>${s.time!=null?`<div>Tiempo: ${fmt(s.time)}</div>`:""}</div><div class="card" style="margin-top:10px"><h3>Respuesta correcta</h3><p>${h.sol(q)}</p><p>${h.ex(q)}</p>${srcs(q)?`<small class="src">${srcs(q)}</small>`:""}</div><button class="btn grow" style="width:100%" onclick="nav('home')">Volver al inicio</button>`}
draw();
