// Arcade Physics has no polygon body. One-pixel scanlines keep authored polygon
// edges close to the Tiled shape and avoid the visible four-pixel stair-step.
const POLYGON_STRIP_HEIGHT=1;

function polygonStrips(area){
  const points=(area.polygon??[]).map(point=>({x:area.x+point.x,y:area.y+point.y}));
  if(points.length<3)return [];
  const minY=Math.min(...points.map(point=>point.y));
  const maxY=Math.max(...points.map(point=>point.y));
  const strips=[];
  for(let top=minY;top<maxY;top+=POLYGON_STRIP_HEIGHT){
    const height=Math.min(POLYGON_STRIP_HEIGHT,maxY-top);
    const scanY=top+height/2;
    const intersections=[];
    for(let index=0;index<points.length;index++){
      const a=points[index],b=points[(index+1)%points.length];
      if((a.y<=scanY&&b.y>scanY)||(b.y<=scanY&&a.y>scanY)){
        intersections.push(a.x+(scanY-a.y)*(b.x-a.x)/(b.y-a.y));
      }
    }
    intersections.sort((a,b)=>a-b);
    for(let index=0;index+1<intersections.length;index+=2){
      const x=intersections[index],width=intersections[index+1]-x;
      if(width>.5)strips.push({shape:'rectangle',x,y:top,width,height});
    }
  }
  return strips;
}

export function collisionAreas(objects){
  return objects.flatMap(area=>{
    if(area.rotation)throw new Error('Collision: rotated objects are not supported.');
    if(area.polygon)return polygonStrips(area);
    if(area.ellipse&&area.width>0&&area.height>0){
      const diameter=Math.min(area.width,area.height);
      return [{
        shape:'circle',radius:diameter/2,
        x:area.x+(area.width-diameter)/2,y:area.y+(area.height-diameter)/2,
        width:diameter,height:diameter,
      }];
    }
    if(area.width>0&&area.height>0&&!area.polyline&&!area.gid&&!area.point){
      return [{shape:'rectangle',x:area.x,y:area.y,width:area.width,height:area.height}];
    }
    // Tiled can leave zero-sized points while drawing polygons; they have no area.
    if(area.width===0&&area.height===0)return [];
    throw new Error('Collision: use unrotated rectangles or polygons.');
  });
}

// Only a layer named Collision creates map collision. Visual layers are ignored.
export function addMapCollision(scene, map, player,{excludeNames=[]}={}) {
  const objects = map.getObjectLayer('Collision');
  if (!objects) return null;
  const rectangles = scene.physics.add.staticGroup();
  const excluded=new Set(excludeNames);
  for (const area of collisionAreas(objects.objects.filter(object=>!excluded.has(object.name)))) {
    const zone = scene.add.zone(area.x, area.y, area.width, area.height).setOrigin(0);
    rectangles.add(zone);
    if(area.shape==='circle')zone.body.setCircle(area.radius);
  }
  scene.physics.add.collider(player, rectangles);
  return rectangles;
}
