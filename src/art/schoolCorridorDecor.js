const TEXTURE_KEY='school-corridor-wall-decor';
const FRAMES={
  noticeboard:[0,0,64,32], clock:[64,0,32,32], landscape:[96,0,32,32],
  poster:[128,0,32,32], sign:[160,0,64,32],
};

// First sample along the north-facing corridor wall (y=224..256).
// Coordinates are top-left world pixels; no bodies, interactions or animations.
export const SCHOOL_CORRIDOR_DECOR=[
  {frame:'noticeboard',x:108,y:225},
  {frame:'landscape',x:208,y:225},
  {frame:'clock',x:288,y:225},
  {frame:'poster',x:464,y:225},
  {frame:'sign',x:520,y:225},
];

export function preloadSchoolCorridorDecor(scene){
  scene.load.svg(TEXTURE_KEY,`${import.meta.env.BASE_URL}assets/campus/corridor-wall-decor.svg`);
}

export function drawSchoolCorridorDecor(scene){
  const texture=scene.textures.get(TEXTURE_KEY);
  for(const [name,rect] of Object.entries(FRAMES)){
    if(!texture.has(name))texture.add(name,0,...rect);
  }
  // Authored wall strips are at depth 0; players still render in front.
  for(const {frame,x,y} of SCHOOL_CORRIDOR_DECOR){
    scene.add.image(x,y,TEXTURE_KEY,frame).setOrigin(0).setDepth(1);
  }
}
