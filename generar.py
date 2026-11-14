#!/usr/bin/env python3
"""Generador: lee los CSV de datos/, corre el validador y escribe datos.js (lo que lee la página).

Uso:  python herramientas/generar.py
Solo entran a datos.js los datos APTOS (ver reglas en validar.py). Solo usa la librería estándar.
"""
import csv,os,re,sys,json,datetime,unicodedata,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import validar as V
def L(n): return V.leer(n)
def toks(x): return V.nrm(x).split()
def main():
    r=V.validar();print(r['texto'].split('RESUMEN:')[1].split('\n')[0].strip() and 'RESUMEN:'+r['texto'].split('RESUMEN:')[1].split('\n\n')[0])
    open(os.path.join(V.BASE,'informe_validacion.txt'),'w',encoding='utf-8').write(r['texto']+"\n")
    if r['errores']:
        print("HAY ERRORES: no se generó datos.js. Corregilos y volvé a correr.");return 1
    T=L('temporadas.csv');P=L('partidos.csv');G=L('goles.csv');GT=L('goleadores_temporada.csv')
    PL=L('planteles.csv');JU=L('jugadores.csv');FU=L('fuentes.csv');AL=L('alineaciones.csv');HI=L('hitos.csv')
    aptos=r['aptos'];apt=V.APTO
    # canon de jugadores (variantes de nombre)
    canon={}
    for j in JU:
        canon[V.nrm(j['nombre'])]=(j['nombre'],set(j['variantes'].split('|'))|{V.nrm(j['nombre'])})
        for v in j['variantes'].split('|'): canon.setdefault(v,(j['nombre'],set(j['variantes'].split('|'))|{V.nrm(j['nombre'])}))
    planteles=collections.defaultdict(dict)
    for p in PL:
        k=V.nrm(p['jugador']);nom,var=canon.get(k,(p['jugador'],{k}))
        e=planteles[p['temporada']].setdefault(nom,dict(j=nom,s=p['jugo_partidos'],f=p['fuente'],al=set()))
        e['al']|=var|{k}
        if p['jugo_partidos']=='SI': e['s']='SI'
    for s,d in planteles.items():            # fusión extra: mismo apellido y nombres incluidos
        nombres=list(d)
        for a in nombres:
            for b in nombres:
                if a!=b and a in d and b in d:
                    ta,tb=toks(a),toks(b)
                    if ta[-1]==tb[-1] and set(ta)<set(tb):
                        d[b]['al']|=d[a]['al']|{V.nrm(a)};d[b]['s']='SI' if 'SI' in(d[a]['s'],d[b]['s']) else d[b]['s'];del d[a]
    plan={s:[dict(j=e['j'],s=e['s'],f=e['f'],al=sorted(e['al'])) for e in d.values()] for s,d in planteles.items()}
    gol_ok=r['gol_ok']
    D=dict(generado=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
      fuentes=[dict(id=f['id'],nombre=f['nombre'],tipo=f['tipo'],conf=f['confianza']) for f in FU],
      temporadas=[dict(t=t['temporada'],torneo=t['torneo'],zona=t['zona'],pos=t['posicion'],pts=t['puntos'],pj=t['pj'],pg=t['pg'],pe=t['pe'],pp=t['pp'],gf=t['gf'],gc=t['gc'],gol=t['goleadores'],dato=t['dato_clave'],nivel=t['nivel'],f1=t['fuente_1'],f2=t['fuente_2'],estado=t['estado'],posdef=t.get('pos_definitiva','SI')) for t in T if t['estado'] in apt],
      partidos=[dict(id=p['id'],t=p['temporada'],torneo=p['torneo'],zona=p['zona'],fo=p['fecha_oficial'],f=p['fecha'],lo=p['local'],gl=int(p['goles_local']),gv=int(p['goles_visitante']),vi=p['visitante'],es=p['estadio'],estado=p['estado'],f1=p['fuente_1'],f2=p['fuente_2'],gk=1 if p['id'] in gol_ok else 0) for p in P if p['id'] in aptos],
      goles=[dict(p=g['partido_id'],e=g['equipo'],j=g['jugador'],m=g['minuto'],tp=g['tipo']) for g in G if g['partido_id'] in aptos],
      goleadores=[dict(t=g['temporada'],j=g['jugador'],g=int(g['goles_liga']),estado=g['estado'],f1=g['fuente_1'],f2=g['fuente_2']) for g in GT if g['estado'] in apt and g['temporada'] in r['gol_temp_ok']],
      planteles=plan,
      alineaciones=[],
      hitos=[dict(k=float(h['orden']),f=h['fecha'],h=h['hecho'],f1=h['fuente_1'],f2=h['fuente_2'],estado=h['estado']) for h in HI if h['estado'] in apt])
    grp=collections.OrderedDict()
    for a in AL: grp.setdefault(a['id'],dict(id=a['id'],t=a['temporada'],rival=a['rival'],fecha=a['fecha'],f=a['fuente'],js=[]))['js'].append(dict(j=a['jugador'],al=[x for x in a['alias'].split('|') if x],c=a['ciego']))
    D['alineaciones']=list(grp.values())
    txt="/* ARCHIVO GENERADO por herramientas/generar.py. No editar a mano: editá los CSV de datos/ y volvé a generar. */\nconst DATOS="+json.dumps(D,ensure_ascii=False,separators=(',',':'))+";\n"
    open(os.path.join(V.BASE,'datos.js'),'w',encoding='utf-8').write(txt)
    print(f"datos.js escrito: {len(D['partidos'])} partidos, {len(D['goles'])} goles, {len(D['goleadores'])} filas de goleadores, {len(D['temporadas'])} temporadas, {sum(len(v) for v in plan.values())} jugadores en planteles ({len(txt)//1024} KB)")
    return 0
if __name__=='__main__': sys.exit(main())
