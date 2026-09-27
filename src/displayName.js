export const DISPLAY_NAME_MAX_LENGTH = 32;

export function normalizeDisplayName(value) {
  if (typeof value !== 'string') throw new Error('INVALID_DISPLAY_NAME');
  const displayName = value.trim();
  if (!displayName || displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    throw new Error('INVALID_DISPLAY_NAME');
  }
  return displayName;
}
