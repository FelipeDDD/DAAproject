import { GameMenuModal,node } from '../ui/GameMenuModal.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import { ROULETTE_COST,ROULETTE_REWARDS } from '../economy/config.js';
import { getCurrentCurrencyClient } from '../economy/CurrencyClient.js';
import { GAMBLE_MACHINE } from './config.js';
import { GAMBLE_MACHINE_VISUAL,GAMBLE_REWARD_LABELS,GAMBLE_UI_TEXT } from './visualConfig.js';
import { machineDisplaySize,nearMachineBase } from './placement.js';
import { COIN_BRACKETS,CIGARETTE_REWARDS,CIGARETTE_VOUCHER,RARE_CIGARETTE,SPECIAL_REWARDS,rouletteCategoryId } from './rewardCatalog.js';
import { characterById } from '../characters.js';
import { ItemRewardOverlay } from '../inventory/ItemRewardOverlay.js';
import { isRewardDismissKey } from '../boss/BossRewardOverlay.js';

const totalRewardWeight=(rewards=ROULETTE_REWARDS)=>rewards.reduce((total,reward)=>total+reward.weight,0);
export function rewardChancePercent(reward,total=totalRewardWeight()){
  return total>0?reward.weight/total*100:0;
}

export function isRareReward(reward,rewards=ROULETTE_REWARDS){
  return rewardChancePercent(reward,totalRewardWeight(rewards))<=GAMBLE_MACHINE_VISUAL.rarePercent;
}

export function createWheelSegments(rewards=ROULETTE_REWARDS,maxSegments=GAMBLE_MACHINE_VISUAL.maxSegments){
  if(!rewards.length||!Number.isInteger(maxSegments)||maxSegments<1)throw new Error('Invalid wheel segments.');
  if(rewards.some(reward=>!reward.id)||new Set(rewards.map(reward=>reward.id)).size!==rewards.length)
    throw new Error('Wheel rewards need unique IDs.');
  const count=Math.min(rewards.length,maxSegments),segments=Array.from({length:count},(_,index)=>({
    index,rewardIds:[],rewards:[],id:`wheel-segment-${index}`,
  }));
  rewards.forEach((reward,index)=>{
    const segmentIndex=Math.floor(index*count/rewards.length),segment=segments[segmentIndex];
    segment.rewardIds.push(reward.id);segment.rewards.push(reward);
  });
  const visualSegments=segments.map(segment=>({...segment,label:segment.rewards.map(rewardName).join(' / '),rare:segment.rewards.every(reward=>isRareReward(reward,rewards)),
    icon:segment.rewards.every(reward=>isRareReward(reward,rewards))?GAMBLE_MACHINE_VISUAL.rareReward.icon:segment.rewards.reduce((icon,reward)=>
    reward.icon??GAMBLE_MACHINE_VISUAL.rewardIconsById[reward.id]??icon,
    segment.rewards.map(reward=>GAMBLE_MACHINE_VISUAL.rewardIconsByType[reward.reward?.type]
      ??GAMBLE_MACHINE_VISUAL.rewardIconsByType.default)[0]),
  }));
  while(visualSegments.length<maxSegments){
    const index=visualSegments.length,categoryId=GAMBLE_MACHINE_VISUAL.extraSegmentCategories[(index-count)%GAMBLE_MACHINE_VISUAL.extraSegmentCategories.length];
    const original=visualSegments.find(segment=>segment.rewardIds.includes(categoryId))??visualSegments[0];
    visualSegments.push({...original,index,visualId:`${original.rewardIds[0]}-extra`,id:`repeat-${index}`});
  }
  const order=GAMBLE_MACHINE_VISUAL.segmentOrder;
  const rank=segment=>{const index=order.indexOf(segment.visualId??segment.rewardIds[0]);return index<0?order.length:index;};
  return visualSegments.sort((a,b)=>rank(a)-rank(b)).map((segment,index)=>({...segment,index}));
}

export function wheelSegmentIndexForReward(rewardId,segments){
  const segmentIndex=segments.findIndex(segment=>segment.rewardIds.includes(rouletteCategoryId(rewardId)));
  if(segmentIndex<0)throw new Error(`Unknown wheel reward: ${rewardId}`);
  return segmentIndex;
}

const normalizeDegrees=degrees=>((degrees%360)+360)%360;
export function wheelTargetRotation(segmentIndex,segmentCount,currentRotation=0,fullRotations=5,jitterDegrees=0){
  if(!Number.isInteger(segmentIndex)||!Number.isInteger(segmentCount)||segmentCount<1
    ||segmentIndex<0||segmentIndex>=segmentCount||!Number.isFinite(currentRotation)
    ||!Number.isFinite(fullRotations)||fullRotations<0||!Number.isFinite(jitterDegrees))
    throw new Error('Invalid wheel rotation target.');
  const segmentAngle=360/segmentCount,centerOffset=(segmentIndex+.5)*segmentAngle;
  const desiredOrientation=normalizeDegrees(-centerOffset+jitterDegrees);
  const turn=normalizeDegrees(desiredOrientation-normalizeDegrees(currentRotation));
  return currentRotation+fullRotations*360+turn;
}

export function landingJitterDegrees(segmentCount,random=Math.random,fraction=GAMBLE_MACHINE_VISUAL.landingJitterFraction){
  const segmentAngle=360/segmentCount,maximum=Math.min(segmentAngle*fraction,segmentAngle*.4);
  return (random()*2-1)*maximum;
}

function svgElement(doc,tag,className){
  const element=doc.createElementNS('http://www.w3.org/2000/svg',tag);
  if(className)element.setAttribute('class',className);
  return element;
}
function createFrameOrnaments(doc){
  const frame=node(doc,'div','gamble-frame-ornaments');frame.setAttribute('aria-hidden','true');
  for(const corner of ['tl','tr','bl','br']){
    const svg=svgElement(doc,'svg',`gamble-frame-corner gamble-frame-corner--${corner}`);svg.setAttribute('viewBox','0 0 64 64');
    const path=svgElement(doc,'path');
    path.setAttribute('d','M4 60V22Q4 4 22 4H60 M12 44V24Q12 12 24 12H44 M12 34Q24 34 24 22Q34 24 34 12 M19 18L24 13L29 18L24 23Z');
    svg.append(path);frame.append(svg);
  }
  const crest=svgElement(doc,'svg','gamble-frame-crest');crest.setAttribute('viewBox','0 0 160 44');
  const path=svgElement(doc,'path');
  path.setAttribute('d','M80 2L91 22L80 39L69 22Z M80 11L85 22L80 30L75 22Z M4 23H43Q55 23 59 14Q62 8 67 14Q70 23 58 26 M48 23Q55 33 69 24 M156 23H117Q105 23 101 14Q98 8 93 14Q90 23 102 26 M112 23Q105 33 91 24');
  crest.append(path);frame.append(crest);return frame;
}
function wheelIcon(doc,kind,x,y){
  const group=svgElement(doc,'g',`gamble-wheel__icon gamble-wheel__icon--${kind}`);
  group.setAttribute('transform',`translate(${x} ${y})`);
  if(kind==='coin'){
    const coin=svgElement(doc,'circle');coin.setAttribute('r','21');coin.setAttribute('class','gamble-wheel__coin');group.append(coin);
    const inner=svgElement(doc,'circle');inner.setAttribute('r','15');inner.setAttribute('class','gamble-wheel__coin-inner');group.append(inner);
    const mark=svgElement(doc,'path');mark.setAttribute('d','M 1 -10 V 10 M 7 -7 C 5 -10 -5 -10 -6 -5 C -8 0 7 -1 6 5 C 5 10 -5 10 -7 7');mark.setAttribute('class','gamble-wheel__coin-mark');group.append(mark);
  }else if(kind==='sad'){
    const face=svgElement(doc,'circle','gamble-wheel__sad-face');face.setAttribute('r','20');
    const expression=svgElement(doc,'path','gamble-wheel__sad-expression');
    expression.setAttribute('d','M -7 -7 V -4 M 7 -7 V -4 M -9 10 Q 0 -1 9 10');
    group.append(face,expression);
  }else if(kind==='star'){
    const points=Array.from({length:10},(_,index)=>{const radius=index%2?9:21,angle=-Math.PI/2+index*Math.PI/5;return `${Math.cos(angle)*radius},${Math.sin(angle)*radius}`;}).join(' ');
    const star=svgElement(doc,'polygon');star.setAttribute('points',points);star.setAttribute('class','gamble-wheel__star');group.append(star);
  }else if(['pack','ticket','gift'].includes(kind)){
    const paths={pack:['M -16 -5 L -14 20 H 16 L 18 -5 Z','M -12 -5 V -20 H -5 V -5 M 0 -5 V -23 H 7 V -5 M 11 -5 V -17 H 17 V -5'],
      ticket:['M -22 -12 H 22 V -4 Q 14 0 22 4 V 12 H -22 V 4 Q -14 0 -22 -4 Z','M -8 -7 V 7 M 8 -7 V 7'],
      gift:['M -19 -3 H 19 V 20 H -19 Z M -22 -10 H 22 V -3 H -22 Z','M 0 -10 V 20 M 0 -10 C -25 -25 -25 -2 0 -10 C 25 -25 25 -2 0 -10']};
    paths[kind].forEach((d,index)=>{const path=svgElement(doc,'path',`gamble-wheel__object${index?' gamble-wheel__object-detail':''}`);path.setAttribute('d',d);group.append(path);});
  }else{
    const mark=svgElement(doc,'text','gamble-wheel__question');mark.setAttribute('x','0');mark.setAttribute('y','1');mark.setAttribute('text-anchor','middle');mark.setAttribute('dominant-baseline','central');mark.textContent='?';group.append(mark);
  }
  return group;
}

function prizeIcon(doc,kind){
  const holder=node(doc,'span','gamble-reward__icon');holder.setAttribute('aria-hidden','true');
  const svg=svgElement(doc,'svg','gamble-reward__list-icon');svg.setAttribute('viewBox','-24 -24 48 48');
  svg.append(wheelIcon(doc,kind,0,0));holder.append(svg);return holder;
}

export function createPrizeWheel(documentRef=document,rewards=ROULETTE_REWARDS,{segments=createWheelSegments(rewards)}={}){
  const wrapper=documentRef.createElement('div');wrapper.className='gamble-wheel-wrap';
  const svg=svgElement(documentRef,'svg','gamble-wheel');svg.setAttribute('viewBox','0 0 400 400');
  svg.setAttribute('role','img');svg.setAttribute('aria-label',GAMBLE_UI_TEXT.wheel);
  const center=200,radius=171,angle=360/segments.length;
  const segmentPaths=[];
  segments.forEach((segment,index)=>{
    const start=-Math.PI/2+index*Math.PI*2/segments.length,end=-Math.PI/2+(index+1)*Math.PI*2/segments.length;
    const point=rotation=>({x:center+radius*Math.cos(rotation),y:center+radius*Math.sin(rotation)});
    const a=point(start),b=point(end),path=svgElement(documentRef,'path',`gamble-wheel__segment${segment.rare?' is-rare':''}`);
    path.setAttribute('d',`M ${center} ${center} L ${a.x} ${a.y} A ${radius} ${radius} 0 0 1 ${b.x} ${b.y} Z`);
    path.style.fill=segment.rare?GAMBLE_MACHINE_VISUAL.rareReward.background
      :GAMBLE_MACHINE_VISUAL.segmentColors[index%GAMBLE_MACHINE_VISUAL.segmentColors.length];
    const title=svgElement(documentRef,'title');title.textContent=segment.label;path.append(title);
    segmentPaths.push(path);
    path.setAttribute('data-segment-index',String(index));path.setAttribute('data-reward-ids',segment.rewardIds.join(','));svg.append(path);
    const midpoint=(start+end)/2,iconX=center+112*Math.cos(midpoint),iconY=center+112*Math.sin(midpoint);
    svg.append(wheelIcon(documentRef,segment.icon,iconX,iconY));
  });
  const lights=svgElement(documentRef,'circle','gamble-wheel__lights');lights.setAttribute('cx','200');lights.setAttribute('cy','200');lights.setAttribute('r','187');svg.append(lights);
  const hub=svgElement(documentRef,'circle','gamble-wheel__hub');hub.setAttribute('cx','200');hub.setAttribute('cy','200');hub.setAttribute('r','31');svg.append(hub);
  svg.append(wheelIcon(documentRef,'star',200,200));
  const pointer=svgElement(documentRef,'svg','gamble-wheel-pointer');pointer.setAttribute('viewBox','0 0 40 45');pointer.setAttribute('aria-hidden','true');
  const pointerPath=svgElement(documentRef,'path','gamble-wheel__pointer');pointerPath.setAttribute('d','M 2 2 L 38 2 L 20 40 Z');pointer.append(pointerPath);
  wrapper.append(svg,pointer);
  wrapper.wheel=svg;wrapper.segments=segments;wrapper.segmentAngle=angle;wrapper.segmentPaths=segmentPaths;
  return wrapper;
}

export async function animateWheelTo(wheel,{from,to,durationMs=GAMBLE_MACHINE_VISUAL.spinDurationMs,easing=GAMBLE_MACHINE_VISUAL.easing}){
  if(typeof wheel.animate==='function'){
    const animation=wheel.animate([{transform:`rotate(${from}deg)`},{transform:`rotate(${to}deg)`}],
      {duration:durationMs,easing,fill:'forwards'});
    await animation.finished;
    wheel.style.transform=`rotate(${to}deg)`;animation.cancel();return;
  }
  wheel.style.transition=`transform ${durationMs}ms ${easing}`;
  wheel.style.transform=`rotate(${to}deg)`;
  await new Promise(resolve=>{
    let done=false;const finish=()=>{if(done)return;done=true;wheel.removeEventListener('transitionend',onEnd);resolve();};
    const onEnd=event=>{if(event.target===wheel)finish();};
    wheel.addEventListener('transitionend',onEnd);setTimeout(finish,durationMs+100);
  });
}

function rewardName(reward){
  if(GAMBLE_REWARD_LABELS[reward.id])return GAMBLE_REWARD_LABELS[reward.id];
  if(reward.name)return reward.name;
  if(reward.reward?.type==='coins'&&Number.isSafeInteger(reward.reward.amount))return `Coins ×${reward.reward.amount}`;
  return reward.id.replaceAll(/[-_]+/g,' ').replace(/\b\w/g,char=>char.toUpperCase());
}

export class GambleMachinePanel extends GameMenuModal {
  constructor(options={}){
    const {spinRequest=null,onAward=null,animateWheel=animateWheelTo,spinIdFactory=()=>globalThis.crypto?.randomUUID?.()
      ??`spin-${Date.now()}-${Math.random().toString(36).slice(2)}`,random=Math.random}=options;
    super({...options,title:GAMBLE_UI_TEXT.title,eyebrow:GAMBLE_UI_TEXT.eyebrow,footerText:'ESC TO CLOSE'});
    Object.assign(this,{spinRequest,onAward,animateWheel,spinIdFactory,random,spinning:false,rotation:0,resultId:null});
    this.root.className+=' gamble-machine-modal';
    this.closeButton.remove();
    this.panel.append(createFrameOrnaments(this.doc));
    for(const [key,value] of Object.entries({
      '--gm-width':`${GAMBLE_MACHINE_VISUAL.modalWidthPx}px`,'--gm-max-height':`${GAMBLE_MACHINE_VISUAL.modalMaxHeightPx}px`,
      '--gm-details-height':`${GAMBLE_MACHINE_VISUAL.detailsHeightPx}px`,
      '--gm-burgundy':GAMBLE_MACHINE_VISUAL.burgundy,'--gm-burgundy-light':GAMBLE_MACHINE_VISUAL.burgundyLight,
      '--gm-burgundy-dark':GAMBLE_MACHINE_VISUAL.burgundyDark,'--gm-gold':GAMBLE_MACHINE_VISUAL.gold,
      '--gm-gold-light':GAMBLE_MACHINE_VISUAL.goldLight,'--gm-gold-dim':GAMBLE_MACHINE_VISUAL.goldDim,
      '--gm-text':GAMBLE_MACHINE_VISUAL.text,'--gm-muted':GAMBLE_MACHINE_VISUAL.muted,
      '--gm-gap':`${GAMBLE_MACHINE_VISUAL.columnGapPx}px`,'--gm-space':`${GAMBLE_MACHINE_VISUAL.spacingPx}px`,
      '--gm-wheel-size':`${GAMBLE_MACHINE_VISUAL.wheelSizePx}px`,'--gm-open-ms':`${GAMBLE_MACHINE_VISUAL.openAnimationMs}ms`,
      '--gm-rare-percent':String(GAMBLE_MACHINE_VISUAL.rarePercent),'--gm-inset':`${GAMBLE_MACHINE_VISUAL.sectionInsetPx}px`,
      '--gm-rare-bg':GAMBLE_MACHINE_VISUAL.rareReward.background,
      '--gm-rare-bg-light':GAMBLE_MACHINE_VISUAL.rareReward.backgroundLight,
      '--gm-rare-border':GAMBLE_MACHINE_VISUAL.rareReward.border,
      '--gm-rare-text':GAMBLE_MACHINE_VISUAL.rareReward.text,
      '--gm-rare-glow':GAMBLE_MACHINE_VISUAL.rareReward.glow,
      '--gm-rare-win-glow':GAMBLE_MACHINE_VISUAL.rareReward.winGlow,
      '--gm-rare-pulse-ms':`${GAMBLE_MACHINE_VISUAL.rareReward.winPulseMs}ms`,
      '--gm-stats-font':`${GAMBLE_MACHINE_VISUAL.statsFontSizePx}px`,
      '--gm-result-font':`${GAMBLE_MACHINE_VISUAL.resultFontSizePx}px`,
    }))this.root.style.setProperty?.(key,value);
    this.balanceState={coins:null,available:false};
    this.itemPresentation=new ItemRewardOverlay({documentRef:this.doc,baseUrl:this.baseUrl});
    this.spinHandler=()=>this.spin();
  }

  showOverview(){
    this.spinning=false;this.rotation=0;this.resultId=null;
    const layout=node(this.doc,'div','gamble-layout');
    const wheelColumn=node(this.doc,'section','gamble-wheel-column');
    this.wheelView=createPrizeWheel(this.doc,ROULETTE_REWARDS);
    this.wheel=this.wheelView.wheel;this.wheelSegments=this.wheelView.segments;
    wheelColumn.append(this.wheelView);
    this.resultMessage=node(this.doc,'p','gamble-result','');this.resultMessage.hidden=true;wheelColumn.append(this.resultMessage);

    const prizeColumn=node(this.doc,'section','gamble-prize-column');
    const groups=node(this.doc,'div','gamble-prize-groups');
    groups.append(node(this.doc,'p','gamble-category-hint',GAMBLE_UI_TEXT.categories));
    const total=totalRewardWeight(),list=node(this.doc,'ul','gamble-reward-list');this.rewardRows=new Map();this.rewardRowClasses=new Map();
    this.categoryButtons=new Map();
    for(const reward of ROULETTE_REWARDS){
      const chance=rewardChancePercent(reward,total),rare=chance<=GAMBLE_MACHINE_VISUAL.rarePercent;
      const row=node(this.doc,'li',`gamble-reward${rare?' is-rare':''}${reward.id==='lung_crusher_rare'?' is-featured':''}`);row.setAttribute('data-reward-id',reward.id);this.rewardRows.set(reward.id,row);
      this.rewardRowClasses.set(reward.id,row.className);
      const segment=this.wheelSegments[wheelSegmentIndexForReward(reward.id,this.wheelSegments)];
      const icon=prizeIcon(this.doc,segment.icon);
      const button=this.button('','gamble-category-button',()=>this.selectCategory(reward.id));
      this.categoryButtons.set(reward.id,button);
      icon.setAttribute('aria-hidden','true');button.append(icon,node(this.doc,'span','gamble-reward__name',rewardName(reward)),
        node(this.doc,'span','gamble-reward__chance',`${Number(chance.toFixed(2))}%`));row.append(button);list.append(row);
    }
    groups.append(list);
    this.detailsPanel=node(this.doc,'section','gamble-details');this.detailsPanel.setAttribute('aria-live','polite');
    prizeColumn.append(groups,this.detailsPanel);layout.append(wheelColumn,prizeColumn);

    const controls=node(this.doc,'section','gamble-controls'),stats=node(this.doc,'div','gamble-stats');
    const balance=node(this.doc,'p','gamble-balance');balance.append(node(this.doc,'span','',`${GAMBLE_UI_TEXT.balance}: `));
    this.balanceValue=node(this.doc,'strong','','— Coins');balance.append(this.balanceValue);
    stats.append(balance);
    this.spinStatus=node(this.doc,'p','gamble-spin-status','');const actions=node(this.doc,'div','gamble-actions');
    this.spinButton=node(this.doc,'button','gamble-spin-button',`SPIN FOR ${ROULETTE_COST} COINS`);
    this.spinButton.type='button';this.spinButton.addEventListener('click',this.spinHandler);
    this.closeActionButton=this.button(GAMBLE_UI_TEXT.close,'gamble-close-button',()=>this.requestClose());
    this.closeButton=this.closeActionButton;
    actions.append(this.spinButton,this.closeActionButton);controls.append(stats,this.spinStatus,actions);
    this.body.replaceChildren(layout,controls);this.selectCategory('tier3_skin');this.setBalance(this.balanceState);
  }

  previewImage({src,label,frame},className='',showCaption=true){
    const figure=node(this.doc,'figure',`gamble-preview ${className}`),holder=node(this.doc,'div','gamble-preview__art');
    if(frame){
      const svg=svgElement(this.doc,'svg','gamble-preview__image');
      svg.setAttribute('viewBox',`${frame.x} ${frame.y} ${frame.width} ${frame.height}`);
      svg.setAttribute('role','img');svg.setAttribute('aria-label',label);
      const image=svgElement(this.doc,'image');image.setAttribute('href',new URL(`${this.baseUrl}${src}`,this.doc.baseURI).href);
      image.setAttribute('width',frame.sourceWidth);image.setAttribute('height',frame.sourceHeight);svg.append(image);holder.append(svg);
    }else{
      const image=node(this.doc,'img','gamble-preview__image');image.src=new URL(`${this.baseUrl}${src}`,this.doc.baseURI).href;
      image.alt=label;holder.append(image);
    }
    figure.append(holder);if(showCaption)figure.append(node(this.doc,'figcaption','',label));return figure;
  }

  selectCategory(id){
    const category=ROULETTE_REWARDS.find(reward=>reward.id===id);if(!category)return;
    this.selectedCategoryId=id;
    for(const [key,button] of this.categoryButtons){button.setAttribute('aria-pressed',String(key===id));
      const winner=this.resultId&&rouletteCategoryId(this.resultId)===key;
      this.rewardRows.get(key).setAttribute('class',`${this.rewardRowClasses.get(key)}${key===id?' is-selected':''}${winner?' is-winner':''}`);
    }
    this.detailsPanel.className=`gamble-details${category.premium?' is-rare':''}${id==='lung_crusher_rare'?' is-featured':''}${id==='tier3_skin'?' is-skin-preview':''}`;
    const heading=node(this.doc,'div','gamble-details__heading');
    heading.append(node(this.doc,'h3','',category.name),node(this.doc,'span','gamble-details__chance',`${rewardChancePercent(category)}% chance`));
    const content=node(this.doc,'div','gamble-details__content');
    if(id==='coins'){
      const table=node(this.doc,'table','gamble-brackets');
      for(const bracket of COIN_BRACKETS){const row=node(this.doc,'tr','');row.append(node(this.doc,'td','',`${bracket.min}\u2013${bracket.max} Coins`),node(this.doc,'td','',`${bracket.weight}%`));table.append(row);}
      content.append(table);
    }else if(id==='special'){
      const list=node(this.doc,'ul','gamble-special-list');for(const item of SPECIAL_REWARDS)list.append(node(this.doc,'li','',item.name));content.append(list);
    }else if(id==='tier3_skin'){
      const character=characterById(this.scene?.presence?.identity?.characterBaseId)??characterById('michael');
      content.append(this.previewImage({src:character.experimentalVisual.previewAsset,label:`${character.name} \u2014 Tier 3`},'gamble-preview--skin',false));
    }else{
      const previews=node(this.doc,'div','gamble-preview-grid');
      const images=category.previewImages??(category.previewImage?[{src:category.previewImage,label:category.name,frame:category.previewFrame}]:[]);
      for(const image of images){
        if(id==='cigarette_collection'&&image.src===RARE_CIGARETTE.icon)continue;
        previews.append(this.previewImage(image));
      }
      if(id==='cigarette_collection')previews.append(this.previewImage({src:CIGARETTE_VOUCHER.icon,label:'Collection complete: Voucher',frame:CIGARETTE_VOUCHER.iconFrame},'gamble-preview--voucher'));
      content.append(previews);
    }
    if(!['coins','tier3_skin','cigarette_collection'].includes(id))content.append(node(this.doc,'p','gamble-details__description',category.description));
    this.detailsPanel.replaceChildren(...(id==='tier3_skin'?[content]:[heading,content]));
  }

  setBalance(state){
    this.balanceState=state??{coins:null,available:false};
    if(!this.balanceValue||this.spinning)return;
    const {coins,available}=this.balanceState;this.balanceValue.textContent=available?`${coins} Coins`:'— Coins';
    if(!available){this.spinButton.disabled=true;this.spinButton.textContent='BALANCE UNAVAILABLE';this.spinStatus.textContent='Reconnect to load your saved balance.';}
    else if(coins<ROULETTE_COST){this.spinButton.disabled=true;this.spinButton.textContent='NOT ENOUGH COINS';this.spinStatus.textContent=`You need ${ROULETTE_COST-coins} more coins.`;}
    else if(!this.spinRequest){this.spinButton.disabled=true;this.spinButton.textContent=`SPIN FOR ${ROULETTE_COST} COINS`;this.spinStatus.textContent='Spin service is unavailable.';}
    else{this.spinButton.disabled=false;this.spinButton.textContent=`SPIN FOR ${ROULETTE_COST} COINS`;this.spinStatus.textContent='';}
  }

  handleKey(event){
    if(this.active&&this.itemPresentation?.active){
      event.stopImmediatePropagation();event.preventDefault();
      if(event.type==='keydown'){
        if(event.key==='Escape'||isRewardDismissKey(event))this.itemPresentation.dismiss();
        else if(event.key==='Tab')this.itemPresentation.backButton?.focus();
      }
      return;
    }
    super.handleKey(event);
  }
  requestClose(){if(this.spinning)return false;if(this.itemPresentation?.active)return this.itemPresentation.dismiss();return super.requestClose();}
  handleBackdrop(){if(!this.spinning)super.handleBackdrop();}
  close(options){this.itemPresentation?.close(true);super.close(options);}
  destroy(){super.destroy();this.itemPresentation?.destroy();}

  async spin(){
    if(this.spinning||this.itemPresentation?.active||this.spinButton?.disabled||!this.active)return false;
    if(!this.spinRequest){this.spinStatus.textContent='Spin service is unavailable.';return false;}
    this.resultId=null;this.resultMessage.hidden=true;this.resultMessage.textContent='';
    this.resultMessage.className='gamble-result';
    this.wheelView.segmentPaths.forEach((path,index)=>path.setAttribute('class',
      `gamble-wheel__segment${this.wheelSegments[index].rare?' is-rare':''}`));
    for(const [id,row] of this.rewardRows)row.setAttribute('class',this.rewardRowClasses.get(id));
    this.spinning=true;this.spinButton.disabled=true;this.spinButton.textContent=GAMBLE_UI_TEXT.spinning;
    this.closeActionButton.disabled=true;this.spinStatus.textContent=GAMBLE_UI_TEXT.spinning;
    try{
      const result=await this.spinRequest(this.spinIdFactory());
      const categoryId=result.categoryId??rouletteCategoryId(result.rewardId);
      const segmentIndex=wheelSegmentIndexForReward(categoryId,this.wheelSegments);
      const reward=ROULETTE_REWARDS.find(item=>item.id===categoryId);
      const jitter=landingJitterDegrees(this.wheelSegments.length,this.random);
      const target=wheelTargetRotation(segmentIndex,this.wheelSegments.length,this.rotation,
        GAMBLE_MACHINE_VISUAL.fullRotations,jitter);
      await this.animateWheel(this.wheel,{from:this.rotation,to:target,durationMs:GAMBLE_MACHINE_VISUAL.spinDurationMs,
        easing:GAMBLE_MACHINE_VISUAL.easing});
      this.rotation=target;this.resultId=result.rewardId;
      this.selectCategory(categoryId);
      const rare=isRareReward(reward);
      this.wheelView.segmentPaths[segmentIndex].setAttribute('class',
        `gamble-wheel__segment${this.wheelSegments[segmentIndex].rare?' is-rare':''} is-winner${rare?' is-rare-win':''}`);
      this.rewardRows.get(categoryId)?.setAttribute('class',
        `${this.rewardRowClasses.get(categoryId)} is-selected is-winner${rare?' is-rare-win':''}`);
      this.resultMessage.className=`gamble-result${rare?' is-rare-win':''}`;
      const label=result.outcome?.label??GAMBLE_REWARD_LABELS[result.rewardId]??rewardName(reward);
      this.resultMessage.textContent=`${rare?GAMBLE_MACHINE_VISUAL.rareReward.resultPrefix+' -':GAMBLE_UI_TEXT.won} ${label.toUpperCase()}`;this.resultMessage.hidden=false;
      Promise.resolve().then(()=>this.onAward?.(result)).catch(error=>console.warn('[LUCKY MACHINE] Inventory refresh failed:',error));
      if(Number.isSafeInteger(result.coins))this.balanceState={coins:result.coins,available:true};
      this.spinning=false;this.closeActionButton.disabled=false;
      this.setBalance(this.balanceState);
      const obtainedPack=!result.duplicate&&CIGARETTE_REWARDS.find(item=>item.itemId===result.outcome?.itemId);
      if(obtainedPack&&this.active&&!this.destroyed)this.itemPresentation.show(obtainedPack,{
        source:'roulette',mount:this.root,onReturn:()=>{
          if(this.active)(this.spinButton.disabled?this.closeActionButton:this.spinButton).focus({preventScroll:true});
        },
      });
      return true;
    }catch(error){
      this.spinning=false;this.closeActionButton.disabled=false;
      this.setBalance(this.balanceState);this.spinStatus.textContent=error.message??'The spin failed. Try again.';return false;
    }
  }
}

export class GambleMachineController {
  constructor(scene,placement,{config=GAMBLE_MACHINE}={}){
    Object.assign(this,{scene,placement,config,destroyed:false,suspended:false});
    this.currencyClient=getCurrentCurrencyClient();
    this.dialog=new GambleMachinePanel({scene,spinRequest:spinId=>this.currencyClient?.spinRoulette(spinId),
      onAward:()=>scene.characterItems?.restore()});
    this.unsubscribeBalance=this.currencyClient?.subscribe(state=>this.dialog?.setBalance(state));
    const frame=scene.textures.get(config.textureKey).get(),size=machineDisplaySize(frame,placement);
    this.visual=scene.add.container(placement.x,placement.y).setDepth(placement.y+config.depthOffset);
    this.art=scene.add.image(config.offsetX,config.offsetY,config.textureKey).setOrigin(config.originX,config.originY).setDisplaySize(size.width,size.height);
    this.visual.add(this.art);const base=placement.base;
    this.base=scene.add.zone(base.x,base.y,base.width,base.height).setOrigin(0);scene.physics.add.existing(this.base,true);
    this.collider=scene.physics.add.collider(scene.player,this.base);
    this.prompt=new WorldPrompt(scene,'Press E · Lucky Machine',{className:'terminal-world-prompt'});
    this.prompt.setPosition(placement.x,placement.y-size.height-config.promptGap);
  }
  get active(){return this.dialog.active;}
  canInteract(){
    const s=this.scene;
    return !this.destroyed&&!this.suspended&&!this.active&&!s.arenaEntry?.active
      &&!s.terminal?.active&&!s.puzzleTerminal?.active&&!s.networkTerminal?.active&&!s.chat?.isInputActive
      &&!s.quiz?.seated&&!s.soloStudy?.active&&!s.wardrobe?.active&&!s.characterItems?.transforming
      &&!this.dialog.doc.querySelector('[data-block-game-shortcuts]:not([hidden]),.boss-reward-overlay:not([hidden])')
      &&nearMachineBase(s.player?.body,this.placement);
  }
  update(){this.prompt.setVisible(this.canInteract());}
  open(){if(!this.canInteract())return false;const opened=this.dialog.open();if(opened)this.prompt.setVisible(false);return opened;}
  suspend(){this.suspended=true;this.prompt.setVisible(false);this.dialog.close({restoreFocus:false});}
  resume(){this.suspended=false;}
  destroy(){
    if(this.destroyed)return;this.destroyed=true;this.unsubscribeBalance?.();this.dialog.destroy();this.prompt.destroy();
    this.collider.destroy();this.base.destroy();this.visual.destroy(true);
  }
}
