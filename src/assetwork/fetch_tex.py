import json,urllib.request,os,sys,io
from PIL import Image
T={'asphalt':'asphalt_02','sidewalk':'concrete_pavement','concrete':'concrete_floor_02','brick':'red_brick_03','plaster':'painted_plaster_wall','planks':'oak_wood_planks','darkwood':'dark_wooden_planks','forest':'forest_leaves_02','grass':'leafy_grass','rock':'gray_rocks','sand':'coast_sand_01','bark':'pine_bark','marble':'marble_01','tiles':'floor_tiles_06','metal':'metal_plate','roof':'clay_roof_tiles','cobble':'cobblestone_floor_01','mud':'brown_mud_leaves_01','stonewall':'japanese_stone_wall','bamboo':'bamboo_wall','carpet':'dirty_carpet','facade':'rectangular_facade_tiles','castle':'castle_brick_07','gravel':'gravel_floor'}
BIG={'asphalt','sidewalk','forest','grass','cobble','marble','planks','sand'}
os.makedirs('out/tex',exist_ok=True)
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'curl/8.0'}),timeout=60).read()
for k,id in T.items():
  try:
    f=json.loads(get('https://api.polyhaven.com/files/'+id))
    for m,key in [('col','Diffuse'),('nor','nor_gl'),('rgh','Rough')]:
      if key not in f: print('missing',id,key);continue
      im=Image.open(io.BytesIO(get(f[key]['1k']['jpg']['url']))).convert('RGB')
      sz=1024 if k in BIG else 512
      if im.size[0]!=sz: im=im.resize((sz,sz),Image.LANCZOS)
      im.save(f'out/tex/{k}_{m}.jpg',quality=82 if m=='col' else 78)
    print('ok',k)
  except Exception as e: print('ERR',k,e)
