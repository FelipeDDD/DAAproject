# Player appearance and emotes

Character identity is `profile.selectedCharacterId` -> authenticated claim ->
`players.characterBaseId` / `Presence.identity.characterBaseId`. The base identifies
the class, not its skin. Live `playerId` identifies a session, never a skin.

The persistent skin choice is `bossProgress.equippedSkin` for the profile:
`classic` or `remastered`, with the existing reward validation. Claim returns it
before Phaser starts. Equip/dev preset transactions mirror it into live `players`.
Movement updates resolve the profile's saved choice on the server; stale client
defaults cannot overwrite it. Presence watches the existing bossProgress query
throughout the session, retaining its cache across scene sleep/wake and Retry.
Guests retain their choice for their live session; they have no persisted profile.

Experimental skins use `players.previewSkin`, an optional session override holding
a registered sprite ID. This replaces the network ambiguity of `level3Preview`,
which could mean V3 on one page and V5 on another. Normal and test pages preload
registered variants for remote rendering. Preview access/menu options are unchanged;
choosing a normal skin clears the override. Experimental selection is session-only,
not a new permanent reward or bossProgress skin type. The existing Felipe DEV color
editor remains a local palette preview, separate from the synchronized skin ID.

All MapScene maps, solo/co-op arena, Payload inspection, and live PvP resolve the
same cached identity through `applyLocalAppearance`. The map chooses position and
physics, not the skin. Wardrobe UI reads and reward responses cannot reset a newer
appearance. Item deactivation resolves the current skin rather than a stale
pre-transformation value. PvP does not enable inventory items or change combat.

RemotePlayers reapplies base/skin metadata on every roster update, independently of
movement interpolation. A sprite created before metadata is corrected on arrival.
PvpMovementClient retains appearance metadata for current participants through
temporary roster gaps and round changes. Movement, life, HP, team, and authority
still follow their existing paths.

To compare browsers, append `?playerSkinDebug=1` to each page URL, or run:

```js
localStorage.setItem('daa-player-skin-debug', 'true');
```

Re-enter a map or change skin. `[PLAYER SKIN]` logs contain map/scene, playerId,
local/remote role, characterBaseId, equippedSkin, previewSkin, source,
requestedTexture, and the applied texture. Compare the same player's IDs and
texture in both browsers. No session tokens are logged. Disable with:

```js
localStorage.removeItem('daa-player-skin-debug');
```

`startSceneEmotes`/`stopSceneEmotes` are shared by ordinary maps and PvP. They
recreate the bar with saved character slots and subscribe to the actual room.
PvP updates the renderer and keeps the bar through Retry; old round bubbles clear.
EmoteBar owns the shared DOM while active: late cleanup of a previous scene cannot
hide the new bar. Scene cleanup removes subscriptions and input listeners.

Focused validation covers appearance publication and restoration, late metadata,
normal/test preview IDs, persistence transactions, respawn/Retry, emote recreation,
and PvP emote room isolation. Both clients must load the updated frontend; old
static builds do not know the synchronized preview ID field.
