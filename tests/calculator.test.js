import test from 'node:test';
import assert from 'node:assert/strict';
import { CalculatorEngine } from '../src/calculator/CalculatorEngine.js';
import { CalculatorWidget } from '../src/calculator/CalculatorWidget.js';

function enter(engine,value){for(const character of String(value))character==='.'?engine.inputDecimal():engine.inputDigit(character);}
function calculate(left,operator,right){
  const engine=new CalculatorEngine();enter(engine,left);engine.setOperator(operator);enter(engine,right);engine.equals();return engine.display;
}

test('calculator adds, subtracts, multiplies and divides without eval',()=>{
  assert.equal(calculate(12,'+',7),'19');assert.equal(calculate(12,'-',7),'5');
  assert.equal(calculate(12,'*',7),'84');assert.equal(calculate(12,'/',4),'3');
});

test('calculator supports decimal values and percentage',()=>{
  assert.equal(calculate('1.5','+','2.25'),'3.75');
  const engine=new CalculatorEngine();enter(engine,25);engine.percent();assert.equal(engine.display,'0.25');
});

test('calculator clear and backspace update the current value',()=>{
  const engine=new CalculatorEngine();enter(engine,123);engine.backspace();assert.equal(engine.display,'12');
  engine.clear();assert.equal(engine.display,'0');
});

test('calculator division by zero reports an error and remains usable',()=>{
  const engine=new CalculatorEngine();enter(engine,8);engine.setOperator('/');enter(engine,0);engine.equals();
  assert.equal(engine.display,'Error');
  enter(engine,7);assert.equal(engine.display,'7');
});

test('calculator widget opens, closes, blocks game input and resets on quiz exit',()=>{
  let focused=false,resets=0,stops=0;
  const widget=Object.assign(Object.create(CalculatorWidget.prototype),{
    openState:false,positioned:true,engine:new CalculatorEngine(),
    panel:{hidden:true,focus:()=>{focused=true;}},
    launcher:{setAttribute:()=>{}},
    scene:{input:{keyboard:{enabled:true,resetKeys:()=>{resets++;}}},player:{setVelocity:()=>{stops++;}}},
    documentRef:{getElementById:()=>({focus:()=>{}})},
    clampToViewport:()=>{},renderDisplay:()=>{},
  });
  widget.open();assert.equal(widget.isOpen,true);assert.equal(widget.panel.hidden,false);assert.equal(widget.scene.input.keyboard.enabled,false);
  assert.equal(focused,true);assert.equal(stops,1);
  widget.engine.inputDigit(8);widget.close({reset:true});assert.equal(widget.isOpen,false);assert.equal(widget.panel.hidden,true);
  assert.equal(widget.scene.input.keyboard.enabled,true);assert.equal(widget.engine.display,'0');assert.equal(resets,2);
});
