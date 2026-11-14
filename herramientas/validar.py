#!/usr/bin/env python3
"""Validador de la base de datos de Desafíos del Bohemio.

Uso:  python herramientas/validar.py            (desde la carpeta del sitio)
Revisa los CSV de datos/ y escribe informe_validacion.txt.
Código de salida 1 si hay ERRORES. Solo usa la librería estándar de Python 3.

Reglas (decididas con el dueño del proyecto):
 - Un dato de FUENTE_UNICA entra a los juegos solo si su temporada pasa el control de sumas contra la tabla.
 - PENDIENTE y CONFLICTO nunca entran a los juegos.
 - Manicomio Bohemio y Sentimiento Bohemio son solo pistas (confianza 'pista'): no se usan como fuente de un dato.
"""
import csv,os,re,sys,unicodedata,collections
BASE=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
DATOS=os.path.join(BASE,'datos')
def leer(n):
    with open(os.path.join(DATOS,n),encoding='utf-8',newline='') as f: return list(csv.DictReader(f))
def nrm(x):
    x=unicodedata.normalize('NFD',str(x).lower());x=''.join(c for c in x if not unicodedata.combining(c))
    return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9 ]',' ',x)).strip()
def num(x):
    try: return int(float(x))
    except: return None
def es_liga(torneo): return not (torneo.startswith('Reducido') or torneo.startswith('Copa'))
APTO={'VERIFICADO','FUENTE_UNICA'}
def validar():
    L=[];ERR=[];WARN=[]
    T=leer('temporadas.csv');P=leer('partidos.csv');G=leer('goles.csv');GT=leer('goleadores_temporada.csv')
    PL=leer('planteles.csv');JU=leer('jugadores.csv');FU={f['id']:f for f in leer('fuentes.csv')}
    ids=set();tabla={t['temporada']:t for t in T}
    # integridad básica
    for p in P:
        if p['id'] in ids: ERR.append(f"ID de partido repetido: {p['id']}")
        ids.add(p['id'])
        if p['estado'] not in APTO|{'PENDIENTE','CONFLICTO'}: ERR.append(f"{p['id']}: estado desconocido '{p['estado']}'")
        for k in ('fuente_1','fuente_2'):
            v=p[k]
            if v and not v.startswith('http') and v not in FU: WARN.append(f"{p['id']}: fuente '{v}' no está en fuentes.csv")
    for g in G:
        if g['partido_id'] not in ids: ERR.append(f"gol con partido inexistente: {g['partido_id']}")
    # duplicados
    vistos=collections.defaultdict(list)
    for p in P:
        if p['fecha'] and es_liga(p['torneo']): vistos[(p['fecha'])].append(p['id'])
        vistos[(p['temporada'],p['torneo'],nrm(p['local']),nrm(p['visitante']),p['goles_local'],p['goles_visitante'],p['fecha'])].append(p['id'])
    for k,v in vistos.items():
        if len(v)>1:
            (ERR if isinstance(k,tuple) else WARN).append(f"posible duplicado ({', '.join(v)})")
    # control de sumas por temporada
    estado_temp={};GF_T={}
    L.append("CONTROL DE SUMAS POR TEMPORADA (partidos de liga contra la tabla final)")
    for t in T:
        s=t['temporada'];lig=[p for p in P if p['temporada']==s and es_liga(p['torneo'])]
        usados=[p for p in lig if p['estado']!='PENDIENTE']
        def tot(ps):
            W=D=Lo=gf=gc=0
            for p in ps:
                a,b=(int(p['goles_local']),int(p['goles_visitante']))
                x,y=(a,b) if p['local']=='Atlanta' else (b,a)
                gf+=x;gc+=y;W+=x>y;D+=x==y;Lo+=x<y
            return len(ps),W,D,Lo,gf,gc
        tt=[num(t[k]) for k in('pj','pg','pe','pp','gf','gc')];GF_T[s]=tt[4]
        if not usados:
            est='SIN_PARTIDOS' if not lig else 'CUARENTENA'
            extra=''
            if lig:
                c=tot(lig);extra=f" (calculado con los {len(lig)} pendientes: PJ/G/E/P/GF/GC={c}; tabla={tuple(tt)})"
            L.append(f"  {s}: {est}{extra}")
        else:
            c=tot(usados)
            if None in tt: est='SIN_TABLA'
            elif c[0]==tt[0] and tuple(c)==tuple(tt): est='COMPLETA_OK'
            elif c[0]<tt[0] and all(c[i]<=tt[i] for i in range(6)): est='PARCIAL_OK'
            else: est='ERROR'
            L.append(f"  {s}: {est}  partidos {c[0]}/{tt[0]}  calculado G-E-P {c[1]}-{c[2]}-{c[3]} GF-GC {c[4]}-{c[5]}  |  tabla G-E-P {tt[1]}-{tt[2]}-{tt[3]} GF-GC {tt[4]}-{tt[5]}")
            if est=='ERROR': ERR.append(f"{s}: los partidos cargados no coinciden con la tabla final")
            pend=[p for p in lig if p['estado']=='PENDIENTE']
            if pend: WARN.append(f"{s}: {len(pend)} partidos PENDIENTES excluidos de los juegos")
        estado_temp[s]=est
    # goles por partido
    L.append("");L.append("GOLES POR PARTIDO (filas de goles.csv contra el marcador)")
    por=collections.defaultdict(list)
    for g in G:
        if g['equipo']=='ATL': por[g['partido_id']].append(g)
    gol_ok=set();faltan=sobran=0
    for p in P:
        if p['id'] not in por: continue
        ag=int(p['goles_local']) if p['local']=='Atlanta' else int(p['goles_visitante'])
        n=len(por[p['id']])
        if n==ag: gol_ok.add(p['id'])
        else:
            if n<ag: faltan+=1
            else: sobran+=1
            WARN.append(f"{p['id']} {p['local']} {p['goles_local']}-{p['goles_visitante']} {p['visitante']}: {n} goles de Atlanta cargados para {ag} del marcador")
    L.append(f"  partidos con goleadores coherentes: {len(gol_ok)}; incompletos: {faltan}; con filas de más: {sobran}")
    # goleadores por temporada
    L.append("");L.append("GOLEADORES POR TEMPORADA")
    suma=collections.defaultdict(int);lista=collections.defaultdict(list)
    for r in GT:
        if r['estado'] in APTO: suma[r['temporada']]+=int(r['goles_liga']);lista[r['temporada']].append(r)
    gol_temp_ok=set()
    for t in T:
        s=t['temporada'];gf=GF_T[s]
        if s not in lista: continue
        flag=t['goleadores'];ss=suma[s];ok=True
        if ss>gf: ERR.append(f"{s}: los goleadores suman {ss} y el equipo hizo {gf}");ok=False
        elif flag=='COMPLETO' and gf-ss>1: WARN.append(f"{s}: marcada COMPLETO pero suma {ss} de {gf} goles")
        top=sorted((int(r['goles_liga']) for r in lista[s]),reverse=True)
        if flag in('COMPLETO','LIDER') and len(top)>1 and top[0]==top[1]: WARN.append(f"{s}: empate en el primer puesto de goleadores")
        L.append(f"  {s}: {len(lista[s])} jugadores, suman {ss} de {gf} goles ({flag}) {'OK' if ok else 'ERROR'}")
        if ok: gol_temp_ok.add(s)
    # nombres
    conocidos=set()
    for j in JU:
        conocidos.add(nrm(j['nombre']))
        for v in j['variantes'].split('|'): conocidos.add(nrm(v))
    for r in PL+GT: conocidos.add(nrm(r['jugador']))
    desconocidos=sorted({g['jugador'] for g in G if g['equipo']=='ATL' and nrm(g['jugador']) not in conocidos})
    L.append("");L.append(f"NOMBRES DE GOLEADORES NO RECONOCIDOS ({len(desconocidos)}): "+("; ".join(desconocidos) if desconocidos else "ninguno"))
    for n in desconocidos: WARN.append(f"goleador '{n}' no figura en jugadores/planteles/goleadores (¿jugador nuevo o variante del nombre?)")
    # aptos
    ok_temp={s for s,e in estado_temp.items() if e in('COMPLETA_OK','PARCIAL_OK')}
    aptos=set()
    for p in P:
        if p['estado'] in APTO and p['temporada'] in ok_temp: aptos.add(p['id'])
    L.append("");L.append(f"RESUMEN: {len(P)} partidos en la base; {len(aptos)} aptos para los juegos; {len(gol_ok&aptos)} con goleadores coherentes.")
    L.append(f"         {len(ERR)} errores, {len(WARN)} avisos.")
    if ERR: L.append("");L.append("ERRORES:");L+=["  - "+e for e in ERR]
    if WARN: L.append("");L.append("AVISOS:");L+=["  - "+e for e in WARN[:80]]+([f"  ... y {len(WARN)-80} más"] if len(WARN)>80 else [])
    return dict(texto="\n".join(L),errores=ERR,avisos=WARN,estado_temp=estado_temp,aptos=aptos,gol_ok=gol_ok,gol_temp_ok=gol_temp_ok)
if __name__=='__main__':
    r=validar();print(r['texto'])
    open(os.path.join(BASE,'informe_validacion.txt'),'w',encoding='utf-8').write(r['texto']+"\n")
    sys.exit(1 if r['errores'] else 0)
