export const DIRECTOR_SECURITY_FAILURES_REQUIRED=2;

export function directorSecurityState(hasKey,progress=null){
  const failedAttempts=Math.min(DIRECTOR_SECURITY_FAILURES_REQUIRED,
    Math.max(0,Number(progress?.failedAttempts)||0));
  const compromised=Boolean(progress?.compromisedAt)||failedAttempts>=DIRECTOR_SECURITY_FAILURES_REQUIRED;
  const factor1Verified=Boolean(hasKey&&progress?.physicalKeyVerifiedAt);
  const recoveryComplete=Boolean(factor1Verified&&compromised&&progress?.recoveryCompletedAt);
  return {
    stage:!factor1Verified?'locked':recoveryComplete?'recovered':compromised?'compromised':'question',
    factor1Verified,
    compromised,
    recoveryComplete,
    failedAttempts,
  };
}
