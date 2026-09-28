import json,urllib.request,os,io,sys
from PIL import Image
M=dict(x.split(':') for x in sys.argv[1:])
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'curl/8.0'}),timeout=120).read()
for k,id in M.items():
  try:
    f=json.loads(get('https://api.polyhaven.com/files/'+id))['gltf']['1k']['gltf']
    d=f'raw/{k}';os.makedirs(d,exist_ok=True)
    open(f'{d}/model.gltf','wb').write(get(f['url']))
    for rel,v in f['include'].items():
      p=os.path.join(d,rel);os.makedirs(os.path.dirname(p),exist_ok=True);b=get(v['url'])
      if rel.lower().endswith(('.jpg','.png')):
        im=Image.open(io.BytesIO(b));sz=512
        if max(im.size)>sz:im=im.resize((sz,sz),Image.LANCZOS)
        if rel.lower().endswith('.jpg'):im.convert('RGB').save(p,quality=80)
        else:im.save(p,optimize=True)
      else:open(p,'wb').write(b)
    print('ok',k)
  except Exception as e:print('ERR',k,id,e)
