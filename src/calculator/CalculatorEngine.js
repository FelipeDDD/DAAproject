const OPERATIONS=Object.freeze({
  '+':(left,right)=>left+right,
  '-':(left,right)=>left-right,
  '*':(left,right)=>left*right,
  '/':(left,right)=>right===0?null:left/right,
});

function formatNumber(value){
  if(!Number.isFinite(value))return 'Error';
  const rounded=Number.parseFloat(value.toPrecision(12));
  return String(Object.is(rounded,-0)?0:rounded);
}

export class CalculatorEngine {
  constructor(){this.clear();}

  clear(){
    this.display='0';this.accumulator=null;this.operator=null;
    this.waitingForOperand=false;this.justEvaluated=false;this.error=false;
    return this.display;
  }

  inputDigit(digit){
    if(!/^\d$/.test(String(digit)))return this.display;
    if(this.error||this.waitingForOperand||this.justEvaluated){
      this.display=String(digit);this.error=false;this.waitingForOperand=false;this.justEvaluated=false;
    }else this.display=this.display==='0'?String(digit):`${this.display}${digit}`;
    return this.display;
  }

  inputDecimal(){
    if(this.error||this.waitingForOperand||this.justEvaluated){
      this.display='0.';this.error=false;this.waitingForOperand=false;this.justEvaluated=false;
    }else if(!this.display.includes('.'))this.display+='.';
    return this.display;
  }

  setOperator(operator){
    const normalized=operator==='×'?'*':operator==='÷'?'/':operator;
    if(!OPERATIONS[normalized]||this.error)return this.display;
    if(this.operator&&!this.waitingForOperand){
      if(!this.calculate(this.accumulator,Number(this.display),this.operator))return this.display;
    }else this.accumulator=Number(this.display);
    this.operator=normalized;this.waitingForOperand=true;this.justEvaluated=false;
    return this.display;
  }

  equals(){
    if(this.error||!this.operator||this.waitingForOperand)return this.display;
    const left=this.accumulator,right=Number(this.display),operator=this.operator;
    if(!this.calculate(left,right,operator))return this.display;
    this.accumulator=null;this.operator=null;this.justEvaluated=true;
    return this.display;
  }

  percent(){
    if(this.error)return this.display;
    this.display=formatNumber(Number(this.display)/100);
    this.waitingForOperand=false;this.justEvaluated=false;
    return this.display;
  }

  backspace(){
    if(this.error)return this.clear();
    if(this.waitingForOperand||this.justEvaluated){
      this.display='0';this.waitingForOperand=false;this.justEvaluated=false;return this.display;
    }
    this.display=this.display.length<=1||(/^-.?$/.test(this.display.slice(0,-1)))?'0':this.display.slice(0,-1);
    return this.display;
  }

  calculate(left,right,operator){
    const result=OPERATIONS[operator]?.(left,right);
    if(result===null||!Number.isFinite(result)){
      this.display='Error';this.accumulator=null;this.operator=null;
      this.error=true;this.waitingForOperand=false;this.justEvaluated=false;return false;
    }
    this.display=formatNumber(result);this.accumulator=result;this.waitingForOperand=false;return true;
  }
}
