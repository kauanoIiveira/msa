from pathlib import Path
import json, hashlib, struct, math
from PIL import Image, ImageDraw
from pypdf import PdfReader
import pypdfium2 as pdfium

root=Path(r'C:\Users\Kauan\Documents\ChatGPT\Desafio de Ideias')
source=Path(r'C:\Users\Kauan\Desktop\Grupo Amarelo - MSA Brasil')
out=root/'tmp/continuidade-visuais'
out.mkdir(parents=True,exist_ok=True)
evid=root/'docs/continuidade/2026-10-06/evidencias'
pages=[]
links=[]
for path in sorted(source.rglob('*.pdf')):
    pdf=pdfium.PdfDocument(str(path))
    rendered=[]
    for i in range(len(pdf)):
        image=pdf[i].render(scale=1.25).to_pil().convert('RGB')
        target=out/(path.stem+f'-{i+1:02}.png')
        image.save(target)
        rendered.append(target)
    for start in range(0,len(rendered),6):
        sheet=Image.new('RGB',(1530,1540),'#dddddd')
        draw=ImageDraw.Draw(sheet)
        for index,pathpage in enumerate(rendered[start:start+6]):
            image=Image.open(pathpage)
            image.thumbnail((495,720))
            x=(index%3)*510+7;y=(index//3)*770+32
            sheet.paste(image,(x,y))
            draw.text((x,y-24),f'{path.stem} | p. {start+index+1}',fill='black')
        target=out/(path.stem+f'-contato-{start+1:02}.jpg')
        sheet.save(target)
        pages.append(str(target))
    reader=PdfReader(path)
    for i,page in enumerate(reader.pages):
        for ref in page.get('/Annots',[]):
            a=ref.get_object().get('/A',{})
            if a.get('/URI'):links.append(dict(file=str(path),page=i+1,url=str(a['/URI'])))

audio=[]
def atoms(data,start=0,end=None):
    end=len(data) if end is None else end
    while start+8<=end:
        length,kind=struct.unpack('>I4s',data[start:start+8])
        head=8
        if length==1:
            length=struct.unpack('>Q',data[start+8:start+16])[0];head=16
        if length==0:length=end-start
        if length<head:break
        yield kind,start+head,start+length
        start+=length
for path in sorted(source.rglob('*.m4a')):
    data=path.read_bytes();duration=None
    for kind,start,end in atoms(data):
        if kind==b'moov':
            for k,s,e in atoms(data,start,end):
                if k==b'mvhd':
                    version=data[s]
                    scale=struct.unpack('>I',data[s+(20 if version else 12):s+(24 if version else 16)])[0]
                    value=struct.unpack('>Q' if version else '>I',data[s+(24 if version else 16):s+(32 if version else 20)])[0]
                    duration=value/scale
    audio.append(dict(path=str(path),duration_seconds=duration,sha256=hashlib.sha256(data).hexdigest(),status='Não ouvido nem transcrito; sem ferramenta ASR disponível nesta sessão.'))
(evid/'audio_pendencia.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2),encoding='utf-8')
(evid/'links_originais_pdfs.json').write_text(json.dumps(links,ensure_ascii=False,indent=2),encoding='utf-8')
(evid/'indice_revisao_visual.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(contact_sheets=pages,audio=audio,links=len(links)),ensure_ascii=False))
