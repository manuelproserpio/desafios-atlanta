# Migración inicial: arma los CSV de datos/ a partir de lo que estaba dentro del código del prototipo,
# del Excel de planteles/tablas y del CSV de partidos 2016-2018 / 2025-2026 aportados.
# Se usa una sola vez; después los CSV se editan a mano o con las herramientas.
import json,re,csv,unicodedata
import pandas as pd,openpyxl
D=json.load(open('/tmp/dump.json'))
OUT='datos/'
MES={m:i+1 for i,m in enumerate("enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split())}
def w(name,header,rows):
    with open(OUT+name,'w',newline='',encoding='utf-8') as f:
        c=csv.writer(f);c.writerow(header);c.writerows(rows)
SYN={'ferro':'ferrocarriloeste','guemes':'guemessde','gimnasiaytiro':'gimnasiaytiros','racingcordoba':'racingc','sanmartintucuman':'sanmartint','sanmartinsanjuan':'sanmartinsj','gimnasiadejujuy':'gimnasiaj','chacarita':'chacaritajuniors','atleticorafaela':'atleticoderafaela','estudiantesriocuarto':'estudiantesrc'}
def nrm(x):
    x=unicodedata.normalize('NFD',str(x).lower());x=''.join(c for c in x if not unicodedata.combining(c));x=re.sub(r'[^a-z0-9]','',x)
    return SYN.get(x,x)
FU=[("oficial","Sitio oficial del club (caatlanta.com.ar)","oficial","alta",""),("cl","Sitio oficial del club","oficial","alta","Alias de oficial"),("afa","AFA","oficial","alta",""),("wiki","Wikipedia","enciclopedia","media-alta","Cruzar siempre con otra fuente"),("espn","ESPN","estadísticas","alta",""),("uf","UniversoFútbol","estadísticas","alta",""),("bd","BDFA","estadísticas","alta",""),("lan","La Nación","prensa","alta",""),("inf","Infobae","prensa","alta",""),("na","Noticias Argentinas","prensa","alta",""),("fm","FotMob","estadísticas","media-alta",""),("tm","Transfermarkt","estadísticas","media-alta",""),("rss","RSSSF","estadísticas","alta",""),("ca","CeroACero","estadísticas","media",""),("dep","Deportv","prensa","alta",""),("gra","El Gráfico","prensa","alta",""),("jc","José Carluccio (periodista)","prensa","media",""),("xl","Excel aportado por el usuario","aporte","media","Validar contra tablas"),("csv","CSV aportado por el usuario","aporte","media","Cada fila trae sus URLs"),("man","Manicomio Bohemio","hincha","pista","Solo como pista: tiene errores"),("sb","Sentimiento Bohemio","hincha","pista","Solo como pista: tiene errores")]
w('fuentes.csv',["id","nombre","tipo","confianza","notas"],FU)
def tl(t):
    t=str(t);return t.replace('-','/') if re.match(r'^20\d\d-\d\d$',t) else t
wb=openpyxl.load_workbook('/mnt/user-data/uploads/90107a141e2e44ce8423dccdf1e39701__1_.xlsx',data_only=True)
T={}
for r in wb['Temporadas'].iter_rows(min_row=2,values_only=True):
    if not r[0]: continue
    T[tl(r[0])]=dict(torneo=r[1],pos=r[3],pts=r[5],pj=r[4],pg=r[6],pe=r[7],pp=r[8],gf=r[9],gc=r[10],dt=r[13] or "",f1="xl",est="FUENTE_UNICA")
ADD={"2019/20":dict(torneo="Primera B Nacional",zona="Zona A",pos=1,pts=41,pj=21,pg=12,pe=5,pp=4,gf=34,gc=20,f1="wiki",est="FUENTE_UNICA"),
"2020":dict(torneo="Primera Nacional (transición)",zona="Zona A",pos=5,pts=8,pj=7,pg=2,pe=2,pp=3,gf=12,gc=12,f1="wiki",est="VERIFICADO"),
"2021":dict(torneo="Primera Nacional",zona="",pos="",pts=39,pj=32,pg=9,pe=12,pp=11,gf=27,gc=34,f1="wiki",est="FUENTE_UNICA"),
"2022":dict(torneo="Primera Nacional",zona="Única",pos=18,pts=46,pj=36,pg=11,pe=13,pp=12,gf=33,gc=32,f1="wiki",est="VERIFICADO"),
"2023":dict(torneo="Primera Nacional",zona="Zona B",pos=15,pts=35,pj=34,pg=8,pe=11,pp=15,gf=33,gc=41,f1="wiki",est="VERIFICADO"),
"2024":dict(torneo="Primera Nacional",zona="Zona B",pos=12,pts=51,pj=38,pg=13,pe=12,pp=13,gf=30,gc=34,f1="wiki",est="VERIFICADO"),
"2025":dict(torneo="Primera Nacional",zona="Zona A",pos=2,pts=55,pj=34,pg=14,pe=13,pp=7,gf=31,gc=28,f1="wiki",est="VERIFICADO")}
for k,v in ADD.items(): T[k]={**dict(dt=""),**v}
T["2026"].update(zona="Zona B",torneo="Primera Nacional",f1="xl",est="VERIFICADO")
DATO={"2010/11":"Salió campeón y volvió a la B Nacional después de 12 años.","2011/12":"El 5 de octubre de 2011 perdió 7 a 1 con River Plate y terminó descendiendo.","2012/13":"Cayó ante Almagro en el Reducido.","2013/14":"Cayó ante Platense en el Reducido.","2015":"Cayó ante Almagro en el Reducido.","2016":"Flandria se consagró campeón en la cancha de Atlanta tras un 0 a 0.","2018/19":"Ascendió a la B Nacional como subcampeón, detrás de Barracas Central.","2019/20":"El torneo se suspendió por la pandemia con Atlanta puntero de la Zona A.","2020":"Sarmiento de Junín salió campeón del torneo de transición.","2021":"Tigre salió campeón y ascendió.","2023":"El 30 de julio goleó 4-0 a Chaco For Ever, su mayor goleada en la categoría.","2024":"Aldosivi salió campeón y ascendió a Primera.","2025":"En el Reducido le ganó 3-0 a Chaco For Ever y cayó con Deportivo Morón.","2026":"Clasificó al Reducido y en la Copa Argentina cayó 2-0 con Instituto."}
GOL={"2010/11":"COMPLETO","2016":"COMPLETO","2026":"COMPLETO","2012/13":"LIDER","2018/19":"LIDER","2019/20":"LIDER","2025":"LIDER","2016/17":"LIDER"}
NIV={"2010/11":"n","2018/19":"n","2023":"n","2025":"n","2026":"n"}
rows=[]
for t in sorted(T,key=lambda x:x.replace('/','')):
    v=T[t];z=v.get("zona") or ("Zona A" if t=="2014" else "Única" if "Metropolitana" in str(v['torneo']) else "")
    rows.append([t,v['torneo'],z,v['pos'],v['pts'],v['pj'],v['pg'],v['pe'],v['pp'],v['gf'],v['gc'],GOL.get(t,"PARCIAL"),DATO.get(t,""),NIV.get(t,"d"),v['f1'],"",v['est'],v.get('dt',''),"NO" if t=="2019/20" else "SI"])
w('temporadas.csv',["temporada","torneo","zona","posicion","puntos","pj","pg","pe","pp","gf","gc","goleadores","dato_clave","nivel","fuente_1","fuente_2","estado","entrenador","pos_definitiva"],rows)
def season_of(torneo,year):
    m=re.findall(r'20\d\d/\d\d|20\d\d',torneo);return m[-1] if m else str(year)
def torneo_name(tn):
    x=re.sub(r'\s*·.*$','',tn);return re.sub(r'\s*20\d\d(/\d\d)?\s*$','',x).strip()
def zona_of(tn):
    m=re.search(r'·\s*(.*)$',tn);return m.group(1) if m else ""
def iso(txt,year):
    if not txt: return ""
    m=re.match(r'^(\d+) de (\w+)(?: de (\d{4}))?$',txt.strip())
    return f"{int(m.group(3) or year):04d}-{MES[m.group(2)]:02d}-{int(m.group(1)):02d}" if m else ""
P=[];key2id={};cnt={}
def addp(temp,torneo,zona,fo,fecha,lo,a,b,vi,es,est,f1,f2,obs):
    cnt[temp]=cnt.get(temp,0)+1
    pid=f"{temp.replace('/','-')}-{cnt[temp]:03d}";P.append([pid,temp,torneo,zona,fo,fecha,lo,a,b,vi,es,est,f1,f2,obs]);return pid
for e in D['RS']:
    y,tn,fo,lo,a,b,vi,es,dt,src=e[:10];st=e[10] if len(e)>10 else "v"
    if y in (2025,2026): continue
    temp=season_of(tn,y);pid=addp(temp,torneo_name(tn),zona_of(tn),fo,iso(dt,y),lo,a,b,vi,es,"VERIFICADO" if st=="v" else "FUENTE_UNICA",src,"","")
    key2id[(temp,nrm(lo),nrm(vi),a,b)]=pid
c=pd.read_csv('/mnt/user-data/uploads/atlanta_partidos_2016-17_2017-18_2025_2026.csv')
print("columnas CSV:",list(c.columns))
cm=c[(c.tipo_registro=='PARTIDO')&c.goles_local.notna()]
KNOWN={f[0] for f in FU}
def S(x): return "" if pd.isna(x) or x=='PENDIENTE' else x
def SF(x):
    x=S(x)
    return x if (not x or x.startswith('http') or x in KNOWN) else 'csv'
csvid={}
for r in cm.itertuples():
    temp=str(r.temporada);fo=S(r.fecha_oficial)
    pid=addp(temp,r.torneo,S(r.zona),fo,S(r.fecha_calendario),r.local,int(r.goles_local),int(r.goles_visitante),r.visitante,S(r.estadio),r.estado if r.estado in("VERIFICADO","FUENTE_UNICA","PENDIENTE","CONFLICTO") else "PENDIENTE",SF(r.fuente_1),SF(r.fuente_2),S(r.observaciones))
    key2id[(temp,nrm(r.local),nrm(r.visitante),int(r.goles_local),int(r.goles_visitante))]=pid;csvid[pid]=r
GO=[]
def parse(txt):
    out=[]
    if not isinstance(txt,str) or txt in('PENDIENTE','SIN_GOLES') or not txt.strip(): return out
    parts=[];dep=0;cur=''
    for ch in txt:
        if ch=='(': dep+=1
        if ch==')': dep-=1
        if ch==';' and dep==0: parts.append(cur);cur=''
        else: cur+=ch
    parts.append(cur)
    for part in parts:
        part=part.strip()
        if not part or re.search(r'RESULTADO|ADMINISTRATIV',part,re.I): continue
        m=re.match(r'^(.*?)\s*\((.*)\)\s*$',part);name,par=(m.group(1).strip(),m.group(2)) if m else (part,"")
        pen='penal' in par.lower();mins=re.findall(r"(\d+(?:\+\d+)?)'\s*(PT|ST)?",par)
        if mins:
            for mi,pt in mins: out.append((name,(mi+"' "+pt).strip(),"penal" if pen else "normal"))
        else: out.append((name,"","penal" if pen else "normal"))
    return out
for pid,r in csvid.items():
    for n,mi,tp in parse(r.goleadores_atlanta): GO.append([pid,"ATL",n,mi,tp,"csv"])
    for n,mi,tp in parse(r.goleadores_rival): GO.append([pid,"RIVAL",n,mi,tp,"csv"])
have={g[0] for g in GO if g[1]=="ATL"}
for e in D['MS']:
    y,tn,fo,lo,a,b,vi,es,dt,sc,riv,src=e[:12];temp=season_of(tn,y)
    pid=key2id.get((temp,nrm(lo),nrm(vi),a,b))
    if not pid or pid in have: continue
    for x in sc:
        mins=x[1] if len(x)>1 else ""
        for t in ([t for t in re.split(r"\s+y\s+|,\s*",mins) if t.strip()] or [""]):
            pen='penal' in t.lower();GO.append([pid,"ATL",x[0],re.sub(r'\s*\(?penal\)?','',t).strip(),"penal" if pen else "normal",src])
    for t in ([s.strip() for s in re.split(r",|\sy\s",riv) if s.strip()] if riv else []): GO.append([pid,"RIVAL",t,"","normal",src])
w('partidos.csv',["id","temporada","torneo","zona","fecha_oficial","fecha","local","goles_local","goles_visitante","visitante","estadio","estado","fuente_1","fuente_2","observaciones"],P)
w('goles.csv',["partido_id","equipo","jugador","minuto","tipo","fuente"],GO)
NOTA={("Lucas Sparapani","2010/11"):"Sentimiento Bohemio indica 4 (pista, no usada): con 4 la suma superaría los 68 goles del equipo.",("Abel Soriano","2011/12"):"Manicomio Bohemio indica 6 (pista, no usada). La lista fuente suma 25 de 28 goles.",("Juan Pablo Segovia","2010/11"):"Manicomio Bohemio indica 6 (pista, no usada).",("Daniel Carou","2010/11"):"Manicomio Bohemio indica 3 (pista, no usada)."}
gr=[]
for n,s,g,st,src in D['G']:
    ss=src.split(",");gr.append([s,n,g,"VERIFICADO" if st=="v" else "FUENTE_UNICA",ss[0],ss[1] if len(ss)>1 else "",NOTA.get((n,s),"")])
w('goleadores_temporada.csv',["temporada","jugador","goles_liga","estado","fuente_1","fuente_2","observaciones"],gr)
JU={v[0]:set(v[1]) for v in D['P'].values()}
GRUPOS={"Nicolás Previtali":"martin previtali|martin nicolas previtali|nicolas previtali|previtali","Rago":"francisco rago|juan rago|rago","Javier Osatchuk":"patricio ostachuk|javier osatchuk|osatchuk|ostachuk","Cristian Bernardi":"christian bernardi|cristian bernardi|bernardi","Jere Rodríguez":"jeremias rodriguez puch|jere rodriguez|jeremias rodriguez","José Gómez":"jose amado gomez|jose gomez|gomez"}
for n,v in GRUPOS.items(): JU.setdefault(n,set()).update(v.split("|"))
conoc={nrm_ for vs in JU.values() for nrm_ in vs}|{re.sub(r'[^a-z0-9 ]',' ',unicodedata.normalize('NFD',n.lower())).encode('ascii','ignore').decode().strip() for n in JU}
def nn(x): return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9 ]',' ',''.join(c for c in unicodedata.normalize('NFD',x.lower()) if not unicodedata.combining(c)))).strip()
for g in GO:
    if g[1]=="ATL" and nn(g[2]) not in {nn(z) for z in conoc}:
        JU.setdefault(g[2],set()).add(nn(g[2]));conoc.add(nn(g[2]))
for r in gr:
    if nn(r[1]) not in {nn(z) for z in conoc}: JU.setdefault(r[1],set()).add(nn(r[1]));conoc.add(nn(r[1]))
w('jugadores.csv',["id","nombre","variantes"],[[f"j{i+1:03d}",n,"|".join(sorted(v))] for i,(n,v) in enumerate(JU.items())])
PL=set();pl=[]
def addpl(t,n,j,f):
    if (t,n) in PL: return
    PL.add((t,n));pl.append([t,n,j,f])
for t,ids in D['TM'].items():
    for i in ids: addpl(t,D['P'][i][0],"SI","uf")
for t,ns in D['SQ'].items():
    for n in ns: addpl(t,n,"DESCONOCIDO","xl")
for n in D['ESP26']: addpl("2026",n,"SI","espn")
for g in gr:
    if g[2]>0: addpl(g[0],g[1],"SI",g[4])
w('planteles.csv',["temporada","jugador","jugo_partidos","fuente"],pl)
ids=["ll","ma","va","ar","se","pq","al","pl","as","bs","bi"]
LT=[("Rago","rago"),("Molina","molina"),("Cherro","cherro"),("Pérez","alan perez|perez"),("A. Ochoa","ochoa|axel ochoa"),("Enrique","enrique"),("Previtali","previtali"),("Colitto","colitto"),("Colombini","colombini"),("H. Martínez","martinez|horacio martinez"),("Pedrozo","pedrozo")]
al=[]
for i,k in enumerate(ids): al.append(["alin-2010-11-almagro","2010/11","Almagro","2011-06-02",D['P'][k][0],i+1,"|".join(D['P'][k][1]),"n" if i in(0,1,8,9) else "d" if i in(2,3,6,7) else "","uf"])
for i,(n,a) in enumerate(LT): al.append(["alin-2018-19-talleres","2018/19","Talleres","2019-05-19",n,i+1,a,"n" if i in(0,8,9,10) else "d" if i in(2,5,6,7) else "","cl"])
w('alineaciones.csv',["id","temporada","rival","fecha","jugador","orden","alias","ciego","fuente"],al)
SRCH={0:"inf,wiki",1:"wiki",2:"wiki",3:"wiki",4:"wiki,afa",5:"wiki,lan",6:"wiki",7:"wiki",8:"lan",9:"na",10:"lan",11:"lan"}
hi=[]
for i,h in enumerate(sorted(D['HI'],key=lambda x:x['k'])):
    ss=SRCH.get(i,"wiki").split(",");hi.append([h['k'],h['d'],h['t'],ss[0],ss[1] if len(ss)>1 else "","VERIFICADO" if len(ss)>1 else "FUENTE_UNICA"])
w('hitos.csv',["orden","fecha","hecho","fuente_1","fuente_2","estado"],hi)
print("partidos",len(P),"goles",len(GO),"goleadores",len(gr),"planteles",len(pl),"hitos",len(hi))
