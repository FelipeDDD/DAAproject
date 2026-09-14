export const QUIZ_QUESTION_DURATION_MS = 30_000;

export function remainingQuizSeconds(deadline, now=Date.now()) {
  if (!Number.isFinite(deadline)) return null;
  return Math.max(0, Math.ceil((deadline-now)/1000));
}

export function quizQuestionExpired(deadline, now=Date.now()) {
  return Number.isFinite(deadline) && now>=deadline;
}

export function shouldEndQuizForParticipants(status, participantCount) {
  return status==='starting'&&participantCount<2;
}

export function quizQuestionComplete(
  participants, answeredCharacterIds, deadline, timedOutCharacterIds=[], now=Date.now(),
) {
  if (!participants.length) return false;
  const answered=new Set(answeredCharacterIds);
  if (participants.every(characterId=>answered.has(characterId))) return true;
  if (!quizQuestionExpired(deadline,now)) return false;
  const resolved=new Set([...answered,...timedOutCharacterIds]);
  return participants.every(characterId=>resolved.has(characterId));
}
