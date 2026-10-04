export function validPayloadState(p){
  return p!==null&&typeof p==='object'&&['x','y','distance','routeLength','radius'].every(k=>Number.isFinite(p[k]))
    &&Math.abs(p.x)<=100000&&Math.abs(p.y)<=100000&&p.routeLength>0&&p.distance>=0&&p.distance<=p.routeLength
    &&p.radius>0&&p.radius<=1000&&[null,'A','B'].includes(p.control)&&typeof p.contested==='boolean'&&typeof p.moving==='boolean'
    &&(!p.contested||p.control===null)&&(!p.moving||p.control!==null);
}
