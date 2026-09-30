import { propertiesOf } from './tiledObjects.js';

function findNamedObjects(source,name){
  const expected=String(name).trim().toLowerCase(),matches=[];
  const visit=(layers,offsetX=0,offsetY=0,parentVisible=true)=>{
    for(const layer of layers??[]){
      const visible=parentVisible&&layer.visible!==false;
      if(!visible)continue;
      const x=offsetX+(layer.offsetx??0),y=offsetY+(layer.offsety??0);
      if(layer.type==='objectgroup')for(const object of layer.objects??[]){
        if(String(object.name??'').trim().toLowerCase()!==expected)continue;
        const objectX=object.x+x,objectY=object.y+y;
        matches.push({id:String(object.id),name:object.name,layer:layer.name,x:objectX,y:objectY,
          properties:propertiesOf(object),point:Boolean(object.point),width:object.width??0,height:object.height??0});
      }
      visit(layer.layers,x,y,visible);
    }
  };
  visit(source?.layers);
  return matches;
}

export function readNamedMapMarker(source,name){
  const matches=findNamedObjects(source,name);
  if(matches.length>1)throw new Error(`Multiple Tiled markers named ${name} were found.`);
  return matches[0]??null;
}
