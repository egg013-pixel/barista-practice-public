"""Build the seated examiner GLB in Blender 4.3. Anatomical source: MakeHuman CC0.
Run: blender -b -t 4 --python scripts/build-examiner-model.py
This produces real geometry, not camera-facing image planes.
"""
import bpy, math, json, gzip, os, hashlib, tempfile
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/models/examiner';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.materials):bpy.data.materials.remove(m)
def mat(name,color,rough=.65,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m
skin=mat('Warm natural skin',(.43,.235,.135),.62)
p=skin.node_tree.nodes.get('Principled BSDF');p.inputs['Subsurface Weight'].default_value=.085;p.inputs['Subsurface Radius'].default_value=(1,.45,.25)
blazer=mat('Greige wool',(.09,.085,.070),.86);lapel=mat('Folded wool lapels',(.12,.113,.093),.83)
shirt=mat('Ivory cotton',(.84,.78,.65),.86);pants=mat('Charcoal tailored trousers',(.13,.125,.105),.91)
hair=mat('Chestnut sculpted hair',(.036,.022,.015),.78);hairline=mat('Hair strand highlights',(.049,.030,.020),.78)
frame=mat('Bronze charcoal wire frame',(.075,.068,.047),.34,.65)
white=mat('Sclera',(.83,.81,.75),.28);iris=mat('Brown iris',(.065,.032,.015),.33);pupil=mat('Pupil',(.004,.006,.004),.22)
handskin=mat('Hands natural skin',(.43,.235,.135),.62)
lips=mat('Natural lips',(.49,.255,.205),.78);seam=mat('Cloth seam',(.125,.12,.10),.92);leather=mat('Brown leather',(.035,.026,.020),.43)
models=[]
def mesh(name,verts,faces,m,sub=0):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(m)
 for f in me.polygons:f.use_smooth=True
 if sub:
  mod=ob.modifiers.new('Smooth sculpted surface','SUBSURF');mod.levels=sub;mod.render_levels=sub
 models.append(ob);return ob

def sphere(name,loc,scale,m,segments=32):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=20,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
 for f in o.data.polygons:f.use_smooth=True
 models.append(o);return o

def curve(name,points,radius,m,radii=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=10;c.bevel_depth=radius;c.bevel_resolution=2
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for i,(p,co) in enumerate(zip(sp.bezier_points,points)):
  p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO';p.radius=radii[i] if radii else 1
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);models.append(o);return o

def rings(name,rows,m,segments=48,sub=2):
 # rows: (height, width, front depth, back depth, y offset)
 vs=[]
 for j,(z,w,front,back,cy) in enumerate(rows):
  for i in range(segments):
   a=i/segments*2*math.pi;si=math.sin(a)
   # Restrained irregularity gives real tailoring around the waist and ribs.
   fold=.0015*math.sin(a*9+z*17)*math.sin(j/(len(rows)-1)*math.pi)
   vs.append((math.cos(a)*(w+fold),cy+si*(back if si>0 else front),z))
 fs=[]
 for j in range(len(rows)-1):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
 fs.extend([tuple(reversed(range(segments))),tuple((len(rows)-1)*segments+i for i in range(segments))])
 o=mesh(name,vs,fs,m,sub);return o

# Smooth, true anatomical face and hands, derived from the CC0 MakeHuman basemesh.
with gzip.open(ROOT/'scripts/assets/examiner-anatomy.json.gz','rt') as f:anatomy=json.load(f)
V=[Vector(v) for v in anatomy['vertices']];F=anatomy['faces']
headscale=1.64
zeye=anatomy['eyes'][0][2]
def headpoint(v):
 p=Vector((v.x*headscale*1.1,v.y*headscale+.05,(v.z-zeye)*headscale+1.77))
 # Widen the anatomically sculpted eye region slightly for a warm stylized face.
 for cx in [-.053,.053]:
  w=math.exp(-((p.x-cx)/.037)**4-((p.z-1.77)/.032)**4)*max(0,min(1,(-p.y-.04)/.08))
  p.z+=(p.z-1.77)*w*.28
 if p.y<-.12:p.z+=.005*math.exp(-((abs(p.x)-.035)/.023)**2-((p.z-1.67)/.021)**2)
 return p
def extract(name,predicate,transform,m,sub):
 selected={i for i,v in enumerate(V) if predicate(v)};fs=[f for f in F if all(i in selected for i in f)];used=sorted(set(i for f in fs for i in f));mapping={v:i for i,v in enumerate(used)}
 return mesh(name,[transform(V[i]) for i in used],[[mapping[i] for i in f] for f in fs],m,sub)
head=extract('Anatomical face, eyelids, lips, ears and neck',lambda v:v.z>1.435,headpoint,skin,2)
sphere('Neck inside open shirt',(0,-.004,1.562),(.068,.066,.103),handskin)
# Per-vertex natural lip color and warm cheeks are embedded in GLB, not live shaders.
colors=head.data.color_attributes.new(name='SkinTint',type='FLOAT_COLOR',domain='POINT')
for i,v in enumerate(head.data.vertices):
 x,y,z=v.co;col=Vector((.43,.235,.135))
 blush=math.exp(-((abs(x)-.087)/.043)**2-((z-1.70)/.052)**2)*max(0,min(1,(-y-.06)/.06))*.14
 col=col.lerp(Vector((.73,.33,.25)),blush)
 # Lips follow actual facial topology and retain volume under changing camera angles.
 if abs(x)<.050 and 1.650<z<1.685 and y<-.165:
  lipw=math.exp(-((z-1.668)/.009)**4)*math.exp(-(x/.043)**6)*.7;col=col.lerp(Vector((.49,.255,.205)),lipw)
 colors.data[i].color=(*col,1)
attr=skin.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='SkinTint';skin.node_tree.links.new(attr.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
# Eye spheres sit exactly inside sculpted sockets; small irises avoid a startled gaze.
for i,center in enumerate(anatomy['eyes']):
 e=headpoint(Vector(center));e.y-=.001
 sphere('Eyeball '+str(i),e,(.023,.023,.023),white,40)
 sphere('Iris '+str(i),(e.x,e.y-.022,e.z),(.0105,.0019,.0105),iris,40)
 sphere('Pupil '+str(i),(e.x,e.y-.0228,e.z),(.0046,.001,.0046),pupil)
 sphere('Eye catchlight '+str(i),(e.x-.0028,e.y-.024,e.z+.003),(.0017,.0006,.0017),white,16)
 # Individual eyebrow shapes follow the forehead rather than floating rectangular bars.
 x=e.x
 curve('Soft sculpted brow '+str(i),[(x-.032,-.170,1.812),(x-.016,-.180,1.825),(x+.009,-.181,1.825),(x+.031,-.166,1.816)],.0055,hair,[.12,.9,1,.1])
 # Thin, rounded rectangular glasses, leaving eyebrows visible.
 pts=[]
 for j in range(17):
  a=j/16*2*math.pi;xx=math.copysign(abs(math.cos(a))**.8,math.cos(a))*.040;zz=math.copysign(abs(math.sin(a))**.9,math.sin(a))*.029
  pts.append((x+xx,-.196+(xx*xx)*4,1.77+zz))
 curve('Wire glasses rim '+str(i),pts,.002,frame)
curve('Glasses bridge',[(-.010,-.198,1.778),(0,-.206,1.784),(.010,-.198,1.778)],.0019,frame)
for s in [-1,1]:curve('Glasses temple '+str(s),[(s*.091,-.192,1.778),(s*.132,-.10,1.783),(s*.137,-.014,1.751)],.0019,frame)

# CC0 sculpted swept hair by culturalibre, original by swift502, fitted to the head.
with gzip.open(ROOT/'scripts/assets/examiner-hair.json.gz','rt') as f:hairsource=json.load(f)
hairObject=mesh('Sculpted layered swept hair',[headpoint(Vector(v)) for v in hairsource['vertices']],hairsource['faces'],hair,1)
solid=hairObject.modifiers.new('Fine hair clump thickness','SOLIDIFY');solid.thickness=.0015
# A modest stylized head proportion, applied as a true 3D transform.
head_center=Vector((0,0,1.73));head_transform=Matrix.Translation(head_center)@Matrix.Scale(1.07,4)@Matrix.Translation(-head_center)
for ob in models:ob.matrix_world=head_transform@ob.matrix_world
# Artist-authored CC0 jacket and shirt (MRT / Margaret Toigo), fitted and posed in MPFB.
# Keep the tailored topology; a tie is intentionally omitted for the approved open-collar design.
with gzip.open(ROOT/'scripts/assets/examiner-tailoring.json.gz','rt') as f:tailoring=json.load(f)
T=[Vector(v) for v in tailoring['vertices']];TF=tailoring['faces'];C=tailoring['components']
def suited(name,ids,m,sub=1):
 fs=[f for f in TF if C[f[0]] in ids]
 if ids=={7}:fs=[f for f in fs if not all(abs(T[i].x)<.022 and T[i].y<-.08 and T[i].z>1.41+abs(T[i].x)*.9 for i in f)]
 used=sorted(set(i for f in fs for i in f));mapping={v:i for i,v in enumerate(used)}
 ob=mesh(name,[(T[i].x*headscale+(math.copysign(.008,T[i].x)*min(1,max(0,(T[i].z-1.39)/.04)) if ids=={7} and abs(T[i].x)<.04 else 0),T[i].y*headscale+.05,(T[i].z-zeye)*headscale+1.77) for i in used],[[mapping[i] for i in f] for f in fs],m,sub)
 return ob
suited('Authored tailored jacket',{8},blazer,1)
suited('Authored ivory shirt and open collar',{7},shirt,1)
suited('Authored shirt cuffs',{13,14},shirt,1)
# Trouser legs are modeled in a relaxed parallel seated pose below the desk.
for side in [-1,1]:
 o=rings('Seated tailored trouser '+str(side),[(.10,.065,.065,.065,-.39),(.3,.071,.071,.071,-.40),(.53,.083,.090,.09,-.40),(.61,.099,.13,.13,-.19),(.72,.105,.15,.15,.01)],pants,32,1);o.location.x=side*.19
button=mat('Corozo jacket buttons',(.08,.07,.05),.54)
suited('Authored jacket and sleeve buttons',{0,1,2,3,4,5,9,10,11},button,1)
for s in [-1,1]:
 joint=anatomy['hand_joints'];center=Vector(joint['joint-l-hand']);center.x*=s;tip=Vector(joint['joint-l-finger-2-2']);tip.x*=s;axis=(tip-center).normalized();thumb=Vector(joint['joint-l-finger-1-2']);thumb.x*=s;thumb-=center;thumb=(thumb-axis*thumb.dot(axis)).normalized();normal=thumb.cross(axis).normalized()
 source=Matrix((thumb,axis,normal)).transposed();destaxis=Vector((-s*.04,-1,-.07)).normalized();destthumb=Vector((-s,0,0));destthumb=(destthumb-destaxis*destthumb.dot(destaxis)).normalized();destnormal=destthumb.cross(destaxis).normalized();dest=Matrix((destthumb,destaxis,destnormal)).transposed();rot=dest@source.inverted()
 def handpoint(v):
  out=rot@(v-center)*1.4;out.x*=1.0;out.y*=.82;out.z*=.8
  reach=max(0,-out.y-.05)
  if reach>0:
   angle=min(1.5,reach/.065*1.5);out.y=-.05-.043*math.sin(angle);out.z+=.010*math.sin(angle)-.018*(1-math.cos(angle))
  return out+Vector((s*.237,-.608,1.056))
 sphere('Wrist inside cuff '+str(s),(s*.237,-.588,1.055),(.033,.047,.044),handskin)
 extract('Anatomical relaxed hand '+str(s),lambda v,s=s:s*v.x>.405 and v.z<1.11 and (v-center).dot(axis)>-.018,handpoint,handskin,1)
 sphere('Leather shoe '+str(s),(s*.19,-.445,.078),(.083,.15,.059),leather)
 sphere('Shoe sole '+str(s),(s*.19,-.448,.038),(.085,.151,.018),button)
# Apply modifiers for a compact static GLB and remove any hidden source geometry.
for ob in list(models):
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 if ob.type=='CURVE':bpy.ops.object.convert(target='MESH')
 for mod in list(ob.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=mod.name)
  except RuntimeError:pass
 if ob.type=='MESH':
  for f in ob.data.polygons:f.use_smooth=True
  if ob==head:
   d=ob.modifiers.new('Preserve face detail with fewer triangles','DECIMATE');d.ratio=.66;bpy.ops.object.modifier_apply(modifier=d.name)
  # Keep UVs for future cloth/skin texture authoring and correct normal generation.
  if not ob.data.uv_layers:
   uv=ob.data.uv_layers.new(name='UVMap')
   for poly in ob.data.polygons:
    for li in poly.loop_indices:
     v=ob.data.vertices[ob.data.loops[li].vertex_index].co;uv.data[li].uv=(v.x*2,v.z*2)
import bmesh
for ob in models:
 if ob.type=='MESH':
  bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free()
# Export asset only. The web app supplies lighting, room, desk, shadows and interactions.
bpy.ops.object.select_all(action='DESELECT')
for ob in models:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'examiner-v3.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_yup=True,export_extras=False)
asset=OUT/'examiner-v3.glb'
(OUT/'manifest.json').write_text(json.dumps({'file':asset.name,'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'bytes':asset.stat().st_size,'source':'MakeHuman/MPFB anatomy; MRT suit; culturalibre/swift502 hair; CC0 source assets','format':'glTF 2.0 binary','version':'anatomical-1'},indent=2)+'\n')
# Save a transparent 3D inspection render (not used as an app background).
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False
scene.world.color=(.20,.20,.20)
def area(name,pos,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-2,-3,4),450,3,(1,.87,.72));area('Soft neutral fill',(2,-1,2.5),160,2,(.82,.9,1));area('Hair rim',(0,1,3),250,2,(1,.87,.7))
bpy.ops.object.camera_add(location=(.08,-3.8,1.88));cam=bpy.context.object;cam.rotation_euler=(Vector((0,-.08,1.19))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.15;scene.camera=cam
scene.render.resolution_x=850;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.filepath=os.environ.get('BARISTA_EXAMINER_PREVIEW',str(Path(tempfile.gettempdir())/'barista-examiner-inspection.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(Path(tempfile.gettempdir())/'barista-examiner-v3.blend'));bpy.ops.render.render(write_still=True)
print('ASSET_POLYGONS',sum(len(o.data.polygons) for o in models if o.type=='MESH'))
