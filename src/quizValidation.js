export const SUPPORTED_QUIZ_DIFFICULTIES = Object.freeze(['medium', 'hard']);
export const SUPPORTED_QUIZ_MEDIA_TYPES = Object.freeze(['image', 'table', 'text', 'code']);

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateQuizMedia(media) {
  const errors=[];
  if (!media || typeof media !== 'object' || Array.isArray(media)) return ['media must be a JSON object'];
  if (!SUPPORTED_QUIZ_MEDIA_TYPES.includes(media.type)) return ['media.type must be image, table, text, or code'];
  if (media.type === 'image') {
    if (!hasText(media.src)) errors.push('image.src is required');
    if (media.alt !== undefined && typeof media.alt !== 'string') errors.push('image.alt must be text');
  }
  if (media.type === 'text' && typeof media.content !== 'string') errors.push('text.content must be text');
  if (media.type === 'code') {
    if (typeof media.content !== 'string') errors.push('code.content must be text');
    if (media.language !== undefined && typeof media.language !== 'string') errors.push('code.language must be text');
  }
  if (media.type === 'table') {
    const columnsValid=Array.isArray(media.columns)&&media.columns.length>0&&media.columns.every(hasText);
    if (!columnsValid) errors.push('table.columns must contain at least one text column');
    if (!Array.isArray(media.rows)) errors.push('table.rows must be a list');
    else if (columnsValid) media.rows.forEach((row,index)=>{
      if (!Array.isArray(row)||row.length!==media.columns.length||row.some(cell=>typeof cell!=='string'))
        errors.push(`table.rows[${index}] must contain ${media.columns.length} text cells`);
    });
  }
  return errors;
}

export function validateQuizQuestion(question,{allowGenerated=false}={}) {
  const errors=[];
  if (!hasText(question?.id)) errors.push('id is required');
  if (!hasText(question?.category)) errors.push('category is required');
  if (!SUPPORTED_QUIZ_DIFFICULTIES.includes(question?.difficulty)) errors.push('difficulty must be medium or hard');
  if (allowGenerated&&question?.type==='generated') {
    if (typeof question.generate!=='function') errors.push('generated question must provide generate()');
  } else {
    if (!hasText(question?.question)) errors.push('question is required');
    if (!Array.isArray(question?.answers)||question.answers.length!==4)
      errors.push('question must have exactly 4 answers');
    else {
      if (question.answers.some(answer=>!hasText(answer))) errors.push('all 4 answers must be filled');
      if (new Set(question.answers).size!==4) errors.push('the 4 answers must be different');
    }
    if (!Number.isInteger(question?.correctAnswer)||question.correctAnswer<0||question.correctAnswer>3)
      errors.push('correctAnswer must be an integer from 0 to 3');
    if (question?.explanation!==undefined&&typeof question.explanation!=='string')
      errors.push('explanation must be text');
    if (question?.media!==undefined) errors.push(...validateQuizMedia(question.media));
  }
  return errors;
}

export function duplicateQuizIds(questions) {
  const counts=new Map();
  for(const question of questions)counts.set(question.id,(counts.get(question.id)??0)+1);
  return new Set([...counts].filter(([,count])=>count>1).map(([id])=>id));
}
