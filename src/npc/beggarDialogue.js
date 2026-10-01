export const BEGGAR_PROXIMITY = Object.freeze({
  interactionTiles: 2, nearTiles: 3, farTiles: 6, checkMs: 750,
  nearCooldownMs: [8000, 12000], farCooldownMs: [12000, 20000],
  nearChance: .25, farChance: .15, speechMs: 6000,
});

export const BEGGAR_LINES = Object.freeze({
  near: ['Hast du vielleicht eine Zigarette für mich?',
    'Nur eine Zigarette? Ach was. Bring mir gleich eine ganze Schachtel.',
    'Du siehst aus, als hättest du irgendwo Zigaretten versteckt.',
    'Eine ganze Schule und niemand hat eine Zigarette. Unglaublich.',
    'Ich frage ja nur ganz höflich. Also... fast höflich.'],
  far: ['Heeey! Hast du Zigaretten?!', 'Ich kann dich sehen! Und ich sehe keine Zigaretten!',
    'Lauf ruhig weiter. Ich warte hier. Leider.', 'Irgendwo hier muss doch jemand rauchen!',
    'Schüler! Ihr habt doch immer irgendwas Verbotenes dabei!'],
  owned: ['Ohhh... was für eine schöne Zigarettenschachtel du da hast.',
    'Ist das etwa eine ganze Schachtel? Die würde ich sehr gerne... testen. Komplett.',
    'Die passt perfekt zu meiner heutigen Ernährung.'],
  handed: ['Perfekt. Die kommt heute in die Suppe.', 'Sehr gut. Frühstück ist gerettet.',
    'Ausgezeichnet. Meine Lunge bedankt sich... vermutlich nicht.', 'Endlich etwas Gesundes.'],
  completed: ['Vier Schachteln. Jetzt wird es langsam professionell.',
    'Du bist erstaunlich gut darin, fragwürdige Dinge zu finden.', 'Na gut... vielleicht habe ich etwas für dich.'],
});

export function proximityBand(distance, tileSize, config = BEGGAR_PROXIMITY) {
  if (distance <= tileSize * config.interactionTiles) return 'interaction';
  if (distance <= tileSize * config.nearTiles) return 'near';
  if (distance <= tileSize * config.farTiles) return 'far';
  return 'outside';
}

export class NpcProximityDialogue {
  constructor({config = BEGGAR_PROXIMITY, lines = BEGGAR_LINES, random = Math.random} = {}) {
    Object.assign(this, {config, lines, random});
    this.nextCheck = 0; this.ready = {near: 0, far: 0}; this.speechUntil = 0; this.lastLine = null;
  }
  line(pool) {
    const options = this.lines[pool].filter(line => line !== this.lastLine);
    const choices = options.length ? options : this.lines[pool];
    this.lastLine = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    return this.lastLine;
  }
  say(pool, now) {
    this.speechUntil = now + this.config.speechMs;
    // Explicit dialogue also prevents an ambient line immediately afterwards.
    for (const band of ['near', 'far']) this.ready[band] = Math.max(this.ready[band], now + this.config[`${band}CooldownMs`][0]);
    return this.line(pool);
  }
  update(now, distance, tileSize, {hasPack = false, completed = false, enabled = true} = {}) {
    if (now < this.nextCheck) return null;
    this.nextCheck = now + this.config.checkMs;
    const band = proximityBand(distance, tileSize, this.config);
    // The closest band is reserved for explicit interaction, not automatic speech.
    if (!enabled || now < this.speechUntil || !['near', 'far'].includes(band) || now < this.ready[band]) return null;
    const [min, max] = this.config[`${band}CooldownMs`];
    // Even a failed random roll consumes a cooldown; never roll every 750ms until it succeeds.
    this.ready[band] = now + min + this.random() * (max - min);
    if (this.random() >= this.config[`${band}Chance`]) return null;
    return this.say(band === 'far' ? 'far' : completed ? 'completed' : hasPack ? 'owned' : 'near', now);
  }
}
