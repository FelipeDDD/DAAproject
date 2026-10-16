export const QUESTION_REPORT_REASONS=Object.freeze([
  {id:'unclear',label:'Unclear or incoherent question'},
  {id:'wrong_answer',label:'Wrong answer or explanation'},
  {id:'missing_context',label:'Missing context or material'},
  {id:'typo',label:'Wording, translation or typo'},
  {id:'other',label:'Other quality issue'},
]);
export const QUESTION_REPORT_COMMENT_LIMIT=1000;
export const QUESTION_REPORT_MESSAGES=Object.freeze({request:'daa-terminal-question-report',result:'daa-terminal-question-report-result'});
