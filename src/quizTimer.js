export const QUIZ_QUESTION_DURATION_MS = 60_000;

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
  participants, answeredPlayerIds, deadline, timedOutPlayerIds=[], now=Date.now(),
) {
  if (!participants.length) return false;
  const answered=new Set(answeredPlayerIds);
  if (participants.every(playerId=>answered.has(playerId))) return true;
  if (!quizQuestionExpired(deadline,now)) return false;
  const resolved=new Set([...answered,...timedOutPlayerIds]);
  return participants.every(playerId=>resolved.has(playerId));
}
