from PIL import Image,ImageDraw,ImageEnhance
import random,math
random.seed(7)
def leaves(setid,grid):
  col=Image.open(f'leaf/{setid}/{setid}_1K-JPG_Color.jpg').convert('RGB');op=Image.open(f'leaf/{setid}/{setid}_1K-JPG_Opacity.jpg').convert('L')
  W,H=col.size;gx,gy=grid;out=[]
  for j in range(gy):
    for i in range(gx):
      box=(i*W//gx,j*H//gy,(i+1)*W//gx,(j+1)*H//gy);c=col.crop(box);a=op.crop(box)
      bb=a.point(lambda v:255 if v>60 else 0).getbbox()
      if not bb:continue
      c=c.crop(bb);a=a.crop(bb);c.putalpha(a);out.append(c)
  return out
def cluster(L,name,n,size=512,tint=(1,1,1),needle=False):
  img=Image.new('RGBA',(size,size),(0,0,0,0));d=ImageDraw.Draw(img)
  cx=size/2
  # twig
  d.line([(cx,size*.98),(cx+random.uniform(-20,20),size*.15)],fill=(70,50,30,255),width=6)
  for k in range(n):
    lf=random.choice(L)
    t=random.random();y=size*(.95-.8*t);x=cx+random.gauss(0,1)*size*.22*(0.5+math.sin(t*math.pi))
    s=random.uniform(.18,.3)*size/max(lf.size)*(0.55 if needle else 1)
    im=lf.resize((max(1,int(lf.size[0]*s)),max(1,int(lf.size[1]*s))),Image.LANCZOS)
    ang=math.degrees(math.atan2(x-cx,1))*0+random.uniform(-70,70)+(180 if y<size*.3 and random.random()<.3 else 0)
    im=im.rotate(ang,expand=True,resample=Image.BICUBIC)
    r,g,b,a=im.split();f=random.uniform(.75,1.1)
    im=Image.merge('RGBA',(r.point(lambda v:min(255,int(v*f*tint[0]))),g.point(lambda v:min(255,int(v*f*tint[1]))),b.point(lambda v:min(255,int(v*f*tint[2]))),a))
    img.alpha_composite(im,(int(x-im.size[0]/2),int(y-im.size[1]/2)))
  img.save('out/tex/'+name+'.png',optimize=True)
broad=leaves('LeafSet024',(3,3));maple=leaves('LeafSet027',(3,3));narrow=leaves('LeafSet013',(6,1))
cluster(broad,'fol_broad',140,tint=(.85,.95,.8))
cluster(narrow,'fol_pine',260,tint=(.55,.75,.55),needle=True)
cluster(maple,'fol_maple',120)
cluster(narrow,'fol_bamboo',90,tint=(.9,1.05,.7))
print('ok')
