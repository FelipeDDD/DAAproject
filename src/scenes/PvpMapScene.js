import { MapScene } from './MapScene.js';
import { PVP_MAP_FILE,PVP_MAP_DEFINITION } from '../pvp/config.js';
import { readPvpTeleportAreas,PvpTeleportController,pvpTeleportArrival } from '../pvp/teleports.js';

// Both live combat and the DEV walking inspection use the same physical map,
// cache policy and triggers. A slept arena never resurrects an old map snapshot.
export class PvpMapScene extends MapScene{
  constructor(key){
    super(key,PVP_MAP_FILE);
    this.sourceKey=`${key}-${PVP_MAP_DEFINITION.id}-${PVP_MAP_DEFINITION.revision}-source`;
    this.reloadMapOnEntry=true;
  }
  preload(){
    this.cache.json.remove(this.sourceKey);
    this.cache.tilemap.remove(this.mapKey);
    for(const key of this.cache.xml.getKeys())if(key.startsWith(`${this.mapKey}-tileset-`))this.cache.xml.remove(key);
    for(const key of this.textures.getTextureKeys())
      if(key.startsWith(`${this.mapKey}-tileset-`)||key.startsWith(`${this.mapKey}-image-layer-`))this.textures.remove(key);
    this.mapLoadVersion=import.meta.env.DEV?Date.now():PVP_MAP_DEFINITION.revision;
    super.preload();
  }
  initializePvpTeleports(){
    this.teleports?.reset();
    this.teleports=new PvpTeleportController(readPvpTeleportAreas(this.source));
  }
  updatePvpTeleports(now){
    const teleport=this.teleports?.update(this.player.body,now);
    if(!teleport)return null;
    const arrival=pvpTeleportArrival(teleport,this.teleports.areas,this.player.body,this.player);
    const body=this.player.body;
    body.reset(arrival.x,arrival.y);
    // Arcade reset initially uses the sprite's top-left, even for an offset foot
    // body. Synchronize that offset and the step baselines before postUpdate so
    // the old sprite/body delta cannot drag the avatar away from its landing.
    body.updateFromGameObject();
    body.prev.copy(body.position);body.prevFrame.copy(body.position);body.autoFrame.copy(body.position);
    this.player.setVelocity(0,0).setDepth(arrival.y);
    this.movementState={moving:false,velocityX:0,velocityY:0};
    this.movementClient?.markTeleport();
    this.onPvpTeleport?.(teleport);
    return arrival;
  }
}
