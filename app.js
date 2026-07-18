import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x91bdd5, 150, 360);

const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 1000);
camera.position.set(90,74,110);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0,48,0);
controls.minDistance = 45;
controls.maxDistance = 220;
controls.maxPolarAngle = Math.PI/2.02;
controls.enablePan = false;
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

const hemi = new THREE.HemisphereLight(0xd7efff,0x4e5a5c,2.4);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,3.1);
sun.position.set(90,140,65);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-120;sun.shadow.camera.right=120;sun.shadow.camera.top=160;sun.shadow.camera.bottom=-80;
scene.add(sun);

const floorsData = [
  {label:'B2',name:'Basement 2',h:4.5,use:'Parking · Plant rooms · Water tanks',area:'5,000 m²'},
  {label:'B1',name:'Basement 1',h:4.5,use:'Parking · Staff · Maintenance',area:'5,000 m²'},
  {label:'G',name:'Ground Floor',h:8,use:'Lobby · Reception · Retail · Lounge',area:'2,400 m²'},
  ...Array.from({length:17},(_,i)=>({label:String(i+2),name:'Office Floor '+(i+2),h:4,use:'Corporate offices · Meeting rooms',area:'2,200 m²'})),
  {label:'19',name:'Executive Floor 19',h:4,use:'Executive suites · Boardrooms',area:'2,200 m²'},
  {label:'20',name:'Executive Floor 20',h:4,use:'Executive suites · VIP lounge',area:'2,200 m²'},
  {label:'21',name:'Executive Floor 21',h:4,use:'Executive suites · Terrace',area:'2,200 m²'},
  {label:'22',name:'Sky Lounge 22',h:6,use:'Restaurant · Terrace · Infinity pool',area:'2,000 m²'},
  {label:'23',name:'Wellness 23',h:4.5,use:'Gym · Spa · Indoor garden',area:'2,000 m²'},
  {label:'24',name:'Observation 24',h:4.5,use:'Viewing deck · Roof garden',area:'1,850 m²'}
];

const glass = new THREE.MeshPhysicalMaterial({color:0x5da9ca,roughness:.12,metalness:.05,transmission:.18,transparent:true,opacity:.8,clearcoat:1});
const glassDark = glass.clone(); glassDark.color.set(0x326c8a);
const slabMat = new THREE.MeshStandardMaterial({color:0xe8ecee,roughness:.75});
const metal = new THREE.MeshStandardMaterial({color:0x82735d,metalness:.75,roughness:.28});
const stone = new THREE.MeshStandardMaterial({color:0xb9b1a4,roughness:.7});
const coreMat = new THREE.MeshStandardMaterial({color:0x687078,roughness:.85});
const highlightMat = new THREE.MeshPhysicalMaterial({color:0x62cdf9,roughness:.12,metalness:.04,transmission:.12,transparent:true,opacity:.95,clearcoat:1});

function box(w,h,d,mat,x=0,y=0,z=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;
}

const tower = new THREE.Group();
scene.add(tower);
const floorGroups=[];
let y=-9;

floorsData.forEach((f,i)=>{
  const g=new THREE.Group();
  const taper=i>18?(i-18)*1.12:0;
  const w=60-taper,d=40-taper*.55,h=f.h;
  g.userData={index:i,baseY:y,height:h};

  g.add(box(w,.48,d,slabMat,0,0,0));
  g.add(box(w,.22,d,slabMat,0,h-.18,0));
  g.add(box(12.5,h-.4,9.5,coreMat,0,h/2,0));

  if(i<2){
    g.add(box(w,h-.5,.35,stone,0,h/2,d/2));
    g.add(box(w,h-.5,.35,stone,0,h/2,-d/2));
    g.add(box(.35,h-.5,d,stone,w/2,h/2,0));
    g.add(box(.35,h-.5,d,stone,-w/2,h/2,0));
  }else{
    g.add(box(w-.7,h-.65,.32,glass,0,h/2,d/2-.16));
    g.add(box(w-.7,h-.65,.32,glassDark,0,h/2,-d/2+.16));
    g.add(box(.32,h-.65,d-.7,glass,-w/2+.16,h/2,0));
    g.add(box(.32,h-.65,d-.7,glassDark,w/2-.16,h/2,0));

    for(let x=-w/2+3;x<w/2-1;x+=4) g.add(box(.13,h-.2,.46,metal,x,h/2,d/2+.12));
    if(i>2){
      for(let x=-w/2+7;x<w/2-5;x+=11) g.add(box(.15,h-.55,d-1.5,slabMat,x,h/2,0));
    }
  }

  g.position.y=y;
  tower.add(g);floorGroups.push(g);
  y+=h;
});

tower.position.y=9;

const crown = new THREE.Group();
crown.add(box(40,2.2,25,metal));
crown.add(box(33,1.3,20,glass,0,1.7,0));
crown.position.y=y+10;
scene.add(crown);

const podium=box(78,7,54,stone,0,3.5,0);
scene.add(podium);
scene.add(box(42,.6,12,metal,0,7.3,31));

const ground=box(260,.4,220,new THREE.MeshStandardMaterial({color:0x697875,roughness:1}),0,-.2,0);
scene.add(ground);
const plaza=box(118,.25,82,new THREE.MeshStandardMaterial({color:0xc7c0b4,roughness:.85}),0,.05,0);
scene.add(plaza);

const waterMat=new THREE.MeshPhysicalMaterial({color:0x3f9fbe,roughness:.12,transmission:.25,transparent:true,opacity:.82});
scene.add(box(36,.2,9,waterMat,-31,.3,43));
scene.add(box(36,.2,9,waterMat,31,.3,43));

for(const x of [-48,-38,-28,28,38,48]){
  scene.add(box(.65,5.5,.65,new THREE.MeshStandardMaterial({color:0x71533a}),x,2.75,51));
  const crownTree=new THREE.Mesh(new THREE.SphereGeometry(3,14,10),new THREE.MeshStandardMaterial({color:0x2f7148,roughness:.9}));
  crownTree.position.set(x,6.8,51);crownTree.castShadow=true;scene.add(crownTree);
}

let selected=2, mode='all', exploded=false, night=false;

const rail=document.getElementById('floorRail');
floorsData.slice().reverse().forEach((f,rev)=>{
  const i=floorsData.length-1-rev;
  const b=document.createElement('button');
  b.className='floor-btn'+(i===selected?' active':'');
  b.textContent=f.label;
  b.addEventListener('click',()=>selectFloor(i,true));
  rail.appendChild(b);
});

function updateRail(){
  [...rail.children].forEach((b,idx)=>{
    const actual=floorsData.length-1-idx;
    b.classList.toggle('active',actual===selected);
  });
}
function updateCard(){
  const f=floorsData[selected];
  document.getElementById('floorName').textContent=f.name;
  document.getElementById('floorUse').textContent=f.use;
  document.getElementById('floorHeight').textContent=f.h.toFixed(1)+' m high';
  document.getElementById('floorArea').textContent=f.area;
}
function setFloorMaterials(){
  floorGroups.forEach((g,i)=>{
    g.traverse(o=>{
      if(!o.isMesh)return;
      if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;
      o.material=(i===selected && mode!=='all')?highlightMat:o.userData.originalMaterial;
    });
  });
}
function selectFloor(i,focus=false){
  selected=i;updateRail();updateCard();setFloorMaterials();
  if(focus){
    const g=floorGroups[i];
    const wy=tower.position.y+g.position.y+g.userData.height/2;
    controls.target.set(0,wy,0);
  }
}

function applyMode(){
  floorGroups.forEach((g,i)=>{
    g.visible=mode==='all'||(mode==='hide'&&i<=selected)||(mode==='isolate'&&i===selected);
  });
  crown.visible=mode==='all';
  setFloorMaterials();
}
function setTool(activeId){
  ['showAll','hideAbove','isolate'].forEach(id=>document.getElementById(id).classList.toggle('active',id===activeId));
}

document.getElementById('showAll').onclick=()=>{mode='all';setTool('showAll');applyMode()};
document.getElementById('hideAbove').onclick=()=>{mode='hide';setTool('hideAbove');applyMode()};
document.getElementById('isolate').onclick=()=>{mode='isolate';setTool('isolate');applyMode()};
document.getElementById('explode').onclick=e=>{
  exploded=!exploded;e.currentTarget.classList.toggle('active',exploded);
  floorGroups.forEach((g,i)=>g.position.y=g.userData.baseY+(exploded?i*2.2:0));
  crown.position.y=y+10+(exploded?floorGroups.length*2.2:0);
};
document.getElementById('night').onclick=e=>{
  night=!night;e.currentTarget.classList.toggle('active',night);
  document.getElementById('app').style.background=night?'linear-gradient(180deg,#06101d,#0b1826 64%,#14202a 64%,#07111b)':'linear-gradient(180deg,#244f73 0%,#9fc8df 64%,#647373 64%,#08121d 100%)';
  scene.fog.color.set(night?0x07111d:0x91bdd5);
  hemi.intensity=night?.45:2.4;sun.intensity=night?.18:3.1;
  glass.emissive.set(night?0x174c68:0x000000);glass.emissiveIntensity=night?.75:0;
  glassDark.emissive.set(night?0x123b55:0x000000);glassDark.emissiveIntensity=night?.65:0;
};
document.getElementById('resetCamera').onclick=()=>{
  camera.position.set(90,74,110);controls.target.set(0,48,0);controls.update();
};

const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
let pointerDown={x:0,y:0};

canvas.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{
  if(Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>8)return;
  pointer.x=e.clientX/innerWidth*2-1;
  pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(floorGroups,true);
  if(!hits.length)return;
  let p=hits[0].object;
  while(p.parent&&!floorGroups.includes(p))p=p.parent;
  if(floorGroups.includes(p))selectFloor(p.userData.index,true);
});

function buildInterior(){
  const panel=document.getElementById('floorPlan');
  const f=floorsData[selected];
  document.getElementById('interiorTitle').textContent=f.name;
  let rooms;
  if(selected===2){
    rooms=[['Main Lobby','large blue'],['Reception','gold'],['Retail 01',''],['Business Lounge','green'],['Café','gold'],['Security',''],['Lift Lobby','tall blue']];
  }else if(selected>=23){
    rooms=[['Sky Lounge','large blue'],['Private Dining','gold'],['Terrace','green'],['Kitchen',''],['VIP Lounge','blue'],['Lift Lobby','tall']];
  }else{
    rooms=[['Open Office','large blue'],['Meeting Room','gold'],['Executive Offices','green'],['Pantry',''],['Server Room',''],['Toilets',''],['Lift Lobby','tall blue']];
  }
  panel.innerHTML='';
  rooms.forEach(([name,cls])=>{
    const d=document.createElement('div');d.className='room '+cls;d.textContent=name;panel.appendChild(d);
  });
}
document.getElementById('exploreFloor').onclick=()=>{
  buildInterior();document.getElementById('interiorPanel').classList.remove('hidden');
};
document.getElementById('closeInterior').onclick=()=>document.getElementById('interiorPanel').classList.add('hidden');

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

selectFloor(2);
document.getElementById('loading').style.display='none';
