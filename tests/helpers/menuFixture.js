export function menuFixture(Menu,options={}){
  const listeners=new Map(),frames=[];
  const doc={baseURI:'https://game.test/',activeElement:null,querySelector:()=>null,addEventListener(){},removeEventListener(){}};
  const create=tag=>({tag,children:[],events:{},dataset:{},style:{},hidden:false,
    append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},
    setAttribute(key,value){this[key]=value;},addEventListener(key,fn){this.events[key]=fn;},removeEventListener(key){delete this.events[key];},
    querySelectorAll(tag){return this.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...child.querySelectorAll(tag)]);},
    querySelector(tag){return this.querySelectorAll(tag)[0];},focus(){doc.activeElement=this;},
    showModal(){this.open=true;},show(){this.open=true;},close(){this.open=false;},remove(){this.removed=true;},
    contains(target){return target===this||this.children.some(child=>child.contains(target));},
    getBoundingClientRect(){return {x:100,top:500,width:285,height:200};},
  });
  doc.createElement=create;doc.createElementNS=(_ns,tag)=>create(tag);doc.body=create('body');
  const game=create('div');doc.getElementById=()=>game;
  const win={innerWidth:800,innerHeight:600,focus(){},addEventListener(key,fn){listeners.set(key,fn);},removeEventListener(key){listeners.delete(key);},requestAnimationFrame(fn){frames.push(fn);}};
  let resets=0,stops=0;
  const scene={input:{enabled:true,keyboard:{enabled:true,resetKeys(){resets++;}}},player:{setVelocity(){stops++;}},scene:{isActive:()=>true}};
  const menu=new Menu({scene,documentRef:doc,windowRef:win,...options});
  return {menu,scene,doc,game,listeners,frames,get resets(){return resets;},get stops(){return stops;}};
}
