#!/usr/bin/env python3
"""Optimiza fotos de camisetas: recorta el fondo transparente, achica a 420 px y guarda WebP.
Uso:  python herramientas/optimizar_imagenes.py CARPETA_CON_PNG   (requiere:  pip install pillow)
El nombre del archivo da el id: 2000-01.png -> assets/camisetas/2000-01.webp (V2 -> -v2).
"""
import os,re,sys,glob
from PIL import Image
def idde(nombre):
    n=os.path.splitext(os.path.basename(nombre))[0].lower()
    n=re.sub(r'(\d{4}-\d{2})(v\d)',r'\1-\2',n);n=re.sub(r'(\d{4})([a-z]+)$',r'\1-\2',n);return n
def main(origen,destino=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','camisetas')):
    os.makedirs(destino,exist_ok=True);tot=0
    for f in sorted(glob.glob(os.path.join(origen,'*.png'))+glob.glob(os.path.join(origen,'*.jpg'))):
        im=Image.open(f).convert('RGBA');bb=im.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox()
        if bb: im=im.crop(bb)
        s=min(1,420/max(im.size));im=im.resize((max(1,round(im.size[0]*s)),max(1,round(im.size[1]*s))),Image.LANCZOS)
        out=os.path.join(destino,idde(f)+'.webp');im.save(out,'WEBP',quality=82,method=6);tot+=os.path.getsize(out)
        print(f"{os.path.basename(f):18} -> {os.path.basename(out):18} {im.size[0]}x{im.size[1]} {os.path.getsize(out)//1024} KB")
    print("total",tot//1024,"KB")
if __name__=='__main__': main(sys.argv[1] if len(sys.argv)>1 else '.')
