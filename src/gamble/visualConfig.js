export const GAMBLE_MACHINE_VISUAL=Object.freeze({
  modalWidthPx:960,modalMaxHeightPx:800,
  statsFontSizePx:21,resultFontSizePx:22,
  burgundy:'#26070f',burgundyLight:'#49101b',burgundyDark:'#17040a',
  gold:'#d5b25f',goldLight:'#f0d589',goldDim:'#806034',text:'#f2e6cc',muted:'#baa58d',
  columnGapPx:22,spacingPx:16,wheelSizePx:320,openAnimationMs:210,
  maxSegments:8,spinDurationMs:3600,fullRotations:5,landingJitterFraction:.16,
  segmentOrder:['coins_2','exam-coupon','nothing','coins_5','broken-key','floppy-disk','coins_20','paperclip'],
  easing:'cubic-bezier(.12,.8,.2,1)',
  segmentColors:['#781c2c','#39101c','#642033','#471321'],
  rewardIconsByType:{coins:'coin',none:'question',default:'question'},
  rewardIconsById:{coins_20:'star'},
  rareReward:{
    background:'#291034',backgroundLight:'#421b4d',border:'#e5c16b',
    text:'#fff0ce',glow:'#e7bd5830',winGlow:'#e5c16b75',icon:'star',resultPrefix:'JACKPOT',winPulseMs:800,
  },
  rarePercent:2,sectionInsetPx:14,
});

// Presentation only: these entries never enter the server reward pool.
// Entries also accept optional previewImage / previewAsset for future hover media.
export const GAMBLE_VISUAL_PLACEHOLDERS=Object.freeze([
  {id:'exam-coupon',label:'50% discount coupon for a prostate exam',icon:'question'},
  {id:'broken-key',label:'One broken keyboard key',icon:'question'},
  {id:'floppy-disk',label:'A suspicious floppy disk',icon:'question'},
  {id:'paperclip',label:'A premium paperclip',icon:'question'},
]);
export const GAMBLE_REWARD_LABELS=Object.freeze({
  nothing:'Nothing',coins_2:'Coins \u00d72',coins_5:'Coins \u00d75',coins_20:'Coins \u00d720',
});
// Optional future media by reward ID: {coins_2:{previewImage:'/assets/...',previewAsset:null}}.
// Metadata only; no images are loaded or displayed yet.
export const GAMBLE_REWARD_PREVIEWS=Object.freeze({});
export const GAMBLE_UI_TEXT=Object.freeze({
  title:'LUCKY MACHINE',eyebrow:'TRY YOUR LUCK',wheel:'FORTUNE WHEEL',prizes:'PRIZES',
  mainRewards:'Main Rewards',fillers:'Joke / Filler Segments',
  balance:'Balance',cost:'Cost',close:'Close',won:'YOU WON',spinning:'SPINNING...',
});
