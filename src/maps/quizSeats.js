import { objectsIn, propertiesOf } from './tiledObjects.js';

export const QUIZ_SEAT_DISTANCE = 48;

export function readQuizSeats(source) {
  return objectsIn(source, 'Entities')
    .filter(object => (object.class || object.type) === 'quizSeat')
    .map(object => {
      const props = propertiesOf(object);
      if (!props.characterId) throw new Error(`Cadeira ${object.name}: informe characterId.`);
      return {
        id: String(object.id), characterId: props.characterId,
        x: object.x, y: object.y - object.height, width: object.width, height: object.height,
        seatX: props.seatX ?? object.x + object.width / 2,
        seatY: props.seatY ?? object.y,
        direction: props.direction ?? 'down',
      };
    });
}

export function distanceToSeat(seat, body) {
  const dx = Math.max(seat.x - body.right, body.x - seat.x - seat.width, 0);
  const dy = Math.max(seat.y - body.bottom, body.y - seat.y - seat.height, 0);
  return Math.hypot(dx, dy);
}
