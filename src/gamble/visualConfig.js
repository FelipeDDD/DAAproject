import { CURRENCY_UI_TEXT } from '../economy/uiText.js';

export const GAMBLE_MACHINE_VISUAL=Object.freeze({
  modalWidthPx:1200,modalMaxHeightPx:920,detailsHeightPx:300,
  statsFontSizePx:24,resultFontSizePx:25,
  burgundy:'#26070f',burgundyLight:'#49101b',burgundyDark:'#17040a',
  gold:'#d5b25f',goldLight:'#f0d589',goldDim:'#806034',text:'#f2e6cc',muted:'#baa58d',
  columnGapPx:18,spacingPx:18,wheelSizePx:520,openAnimationMs:210,
  maxSegments:8,spinDurationMs:3600,fullRotations:5,landingJitterFraction:.16,
  segmentOrder:['coins','nothing','cigarette_collection','special','tier3_skin','nothing-extra','lung_crusher_rare','coins-extra'],
  extraSegmentCategories:['nothing','coins'],
  easing:'cubic-bezier(.12,.8,.2,1)',
  segmentColors:['#781c2c','#39101c','#642033','#471321'],
  rewardIconsByType:{coins:'coin',none:'question',default:'question'},
  rewardIconsById:{coins_20:'star'},
  rareReward:{
    background:'#291034',backgroundLight:'#421b4d',border:'#e5c16b',
    text:'#fff0ce',glow:'#e7bd5830',winGlow:'#e5c16b75',icon:'star',resultPrefix:'JACKPOT',winPulseMs:800,
  },
  rarePercent:1,sectionInsetPx:14,
});

// Labels only for historical spin receipts; current labels come from the server outcome.
export const GAMBLE_REWARD_LABELS=Object.freeze({
  nothing:'Nothing',coins_2:'Coins \u00d72',coins_5:'Coins \u00d75',coins_20:'Coins \u00d720',
});
export const GAMBLE_UI_TEXT=Object.freeze({
  title:'LUCKY MACHINE',eyebrow:'TRY YOUR LUCK',wheel:'FORTUNE WHEEL',prizes:'PRIZES',
  categories:'Select a category to view details',
  balance:'Balance',cost:'Cost',close:'Close',won:'YOU WON',spinning:'SPINNING...',
  coinInfoLabel:CURRENCY_UI_TEXT.earningHintLabel,coinInfo:CURRENCY_UI_TEXT.earningHint,
});
