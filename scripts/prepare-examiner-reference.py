"""Prepare only the supplied idol PLY. Fixed bounds/eye regions are specific to this asset.
Requires NumPy. Never modifies the original upload or reads it as executable code.
"""
import numpy as np,json
from pathlib import Path
import argparse,hashlib
parser=argparse.ArgumentParser(description='Prepare the supplied idol PLY reference for this app');parser.add_argument('input');parser.add_argument('output');args=parser.parse_args()
p=Path(args.input);output=Path(args.output);b=p.read_bytes();off=b.index(b'end_header\n')+11;v=np.frombuffer(b,dtype='<f4',offset=off).reshape(-1,17).copy();rgb=np.clip(v[:,6:9]*.28209479177387814+.5,0,1);a=1/(1+np.exp(-v[:,9]));scales=np.exp(v[:,10:13]);valid=(a>.04)&np.isfinite(v).all(axis=1)&(scales.max(axis=1)<.06)
brown=(rgb[:,0]>rgb[:,1]*1.10)&(rgb[:,1]>rgb[:,2]*1.08)&((rgb.max(1)-rgb.min(1))>.03)
bodybounds=(abs(v[:,2])<.225)&(v[:,0]>-.22)&(v[:,0]<.36)&(v[:,1]<.392)
keep=valid&((v[:,1]<.005)|(brown&bodybounds))
# Remove isolated white/black background points beyond the upper body's silhouette.
keep&=(np.abs(v[:,2])<.27)
# Preserve the supplied face/eyes exactly. Reconstruct continuous fine Gaussian wire rims,
# rather than painting over the source's skin or using aliased triangle-line glasses.
frames=[]
def point(x,y,z):
 q=np.zeros(17,dtype=np.float32);q[:3]=[x,y,z];q[6:9]=(np.array([.28,.22,.16])-.5)/.28209479177387814;q[9]=4.;q[10:13]=np.log(.00035);q[13]=1.;frames.append(q)
for side in [-1,1]:
 cy=-.315 if side<0 else -.312
 for angle in np.linspace(0,2*np.pi,200,endpoint=False):
  z=side*.029+np.cos(angle)*.024;y=cy+np.sin(angle)*.0175
  x=.142-.008*(abs(z)/.055)**2
  point(x,y,z)
for z in np.linspace(-.006,.006,28):point(.144,-.322-.002*(1-(z/.006)**2),z)
for side in [-1,1]:
 for t in np.linspace(0,1,100):point(.134*(1-t)+.061*t,-.315-.002*np.sin(t*np.pi),side*(.053+.018*t))
# Fit the lower legs to the room floor without moving the head/hands; the transition is behind the desk.
t=np.clip((v[:,1]-.04)/.14,0,1);v[:,1]+=.06*t*t*(3-2*t)
vv=np.concatenate([v[keep],np.stack(frames)]);head=b[:off].decode().replace('element vertex 262144',f'element vertex {len(vv)}');output.write_bytes(head.encode()+vv.tobytes());Path(str(output)+'.json').write_text(json.dumps({'sourceFile':p.name,'sourceSha256':hashlib.sha256(b).hexdigest(),'splats':len(vv),'source':'User-provided Gaussian Splat model','processing':'Character background isolation; continuous fine Gaussian spectacle rims preserving original face; lower-leg floor fitting; SPZ compression','version':'provided-stable-rims-1'},indent=2)+'\n');print('cropped',len(vv),'bytes',len(head)+vv.nbytes,'bounds',vv[:,:3].min(0),vv[:,:3].max(0))
