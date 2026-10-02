import test from 'node:test';
import assert from 'node:assert/strict';
import { PhotoAlbumViewer } from '../src/ui/PhotoAlbumViewer.js';

function fakeDocument(){
  const doc={baseURI:'https://example.test/game/',activeElement:null,requests:[]};
  doc.createElement=tag=>({tag,children:[],events:{},hidden:false,disabled:false,inert:false,
    append(...nodes){this.children.push(...nodes);for(const node of nodes)node.parent=this;},
    replaceChildren(...nodes){this.children=[];this.append(...nodes);},
    setAttribute(name,value){this[name]=value;},dataset:{},
    addEventListener(name,callback){this.events[name]=callback;},
    focus(){doc.activeElement=this;},remove(){if(this.parent)this.parent.children=this.parent.children.filter(node=>node!==this);},
    set src(value){this.url=value;doc.requests.push(value);},get src(){return this.url;},
  });
  doc.body=doc.createElement('body');return doc;
}
const album={title:'Vacation',photos:[
  {src:'assets/one.png',caption:'First photo'},{src:'assets/two.png',caption:'Second photo'},
]};
const key=value=>({type:'keydown',key:value,preventDefault(){this.prevented=true;}});

test('gallery loads only the selected photo, preserves boundaries and supports buttons/arrows',()=>{
  const doc=fakeDocument(),viewer=new PhotoAlbumViewer({documentRef:doc,baseUrl:'/game/'});
  viewer.open(album);
  assert.equal(viewer.counter.textContent,'1 / 2');assert.equal(viewer.previous.disabled,true);
  assert.equal(viewer.caption.textContent,'First photo');assert.equal(viewer.filename.textContent,'');
  assert.equal(viewer.filename.hidden,true);
  assert.deepEqual(doc.requests,['https://example.test/game/assets/one.png']);
  viewer.navigate(-1);assert.equal(doc.requests.length,1);
  viewer.image.events.load();assert.equal(viewer.image.hidden,false);
  viewer.next.events.click();assert.equal(viewer.index,1);assert.equal(viewer.next.disabled,true);
  assert.equal(viewer.counter.textContent,'2 / 2');assert.equal(doc.requests.length,2);
  viewer.handleKey(key('ArrowRight'));assert.equal(viewer.index,1);assert.equal(doc.requests.length,2);
  viewer.handleKey(key('ArrowLeft'));assert.equal(viewer.index,0);
});

test('missing photos show a fallback, obsolete image callbacks cannot corrupt a new photo',()=>{
  const doc=fakeDocument(),viewer=new PhotoAlbumViewer({documentRef:doc});viewer.open(album);
  const old=viewer.image;viewer.navigate(1);
  old.events.error();assert.equal(viewer.stage.children[0].textContent,'Loading photo...');
  viewer.image.events.error();assert.match(viewer.stage.children[0].textContent,/Photo not available/);
  assert.equal(viewer.image.hidden,true);assert.equal(viewer.active,true);
  viewer.open({photos:[]});assert.equal(viewer.counter.textContent,'0 / 0');
  assert.equal(viewer.previous.disabled,true);assert.equal(viewer.next.disabled,true);
});

test('modal disables the underlay, traps focus and Escape/close restore the terminal',()=>{
  const doc=fakeDocument(),underlay=doc.createElement('section'),input=doc.createElement('input');input.focus();
  const viewer=new PhotoAlbumViewer({documentRef:doc});viewer.open(album,{underlay});
  assert.equal(underlay.inert,true);assert.equal(doc.activeElement,viewer.closeButton);
  viewer.handleKey(key('Tab'));assert.equal(doc.activeElement,viewer.next);
  const escape=key('Escape');viewer.handleKey(escape);
  assert.equal(escape.prevented,true);assert.equal(viewer.active,false);
  assert.equal(underlay.inert,false);assert.equal(doc.activeElement,input);
  viewer.open(album,{underlay});viewer.closeButton.events.click();assert.equal(underlay.inert,false);
  viewer.open(album,{underlay});viewer.destroy();assert.equal(doc.body.children.length,0);assert.equal(underlay.inert,false);
});
