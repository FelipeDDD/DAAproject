import { objectsIn, propertiesOf } from './tiledObjects.js';

export function drawTiledTextObjects(scene,source,layerName='Entities') {
  return objectsIn(source,layerName).filter(object=>object.text&&object.visible!==false).map(object=>{
    const definition=object.text,props=propertiesOf(object);
    const text=scene.add.text(object.x,object.y,definition.text??'',{
      fontFamily:definition.fontfamily??'system-ui, sans-serif',fontSize:`${definition.pixelsize??14}px`,
      fontStyle:definition.bold?'bold':'normal',color:definition.color??'#334550',
      align:definition.halign??'left',wordWrap:{width:object.width,useAdvancedWrap:true},
      backgroundColor:props.backgroundColor,
    });
    text.setDepth(props.depth??object.y).setAlpha(object.opacity??1);
    return text;
  });
}
