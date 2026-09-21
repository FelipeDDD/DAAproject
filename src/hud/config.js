export const HUD_THEME='gothic';

export const HUD_LAYOUT=Object.freeze({
  bottomHeight:200,
  rightPanelWidth:160,
  frameOverflow:18,
  floatingHotbars:false,
});

export const HUD_THEMES=Object.freeze({
  gothic:Object.freeze({
    className:'hud-theme-gothic',
    barAsset:'assets/hud/hud-bar-body.png',
    orbAsset:'assets/hud/orb-front.png',
    framePieces:'assets/hud/',
    rightPanelAsset:'assets/hud/stone-inscription.png',
  }),
});

export function normalizeHudTheme(theme){return HUD_THEMES[theme]?theme:HUD_THEME;}
export function hudThemeDefinition(theme=HUD_THEME){return HUD_THEMES[theme]??HUD_THEMES.gothic;}
export function fixedHudEnabled(layout=HUD_LAYOUT){return layout.floatingHotbars!==true;}

export function hudHealthPercent(current,max){
  if(!Number.isFinite(current)||!Number.isFinite(max)||max<=0)return 0;
  return Math.max(0,Math.min(100,current/max*100));
}
