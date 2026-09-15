import { duplicateQuizIds, validateQuizQuestion } from '../quizValidation.js';

export function createQuizReviewRecords(staticQuestions,generatedQuestions,materialize,random=Math.random) {
  const templates=[...staticQuestions,...generatedQuestions];
  const duplicates=duplicateQuizIds(templates);
  return templates.map((template,index)=>{
    const generated=template.type==='generated';
    const record={
      key:`${generated?'generated':'static'}:${template.id}:${index}`,
      template,generated,source:generated?'quizGeneratedQuestions.js':(template.source??'CSV'),
      preview:template,errors:validateQuizQuestion(template,{allowGenerated:generated}),
    };
    if(generated)regenerateQuizRecord(record,materialize,random);
    if(duplicates.has(template.id))record.errors.push(`duplicate id: ${template.id}`);
    return record;
  });
}

export function regenerateQuizRecord(record,materialize,random=Math.random) {
  const metadataErrors=validateQuizQuestion(record.template,{allowGenerated:true});
  try{
    record.preview=materialize(record.template,random);
    record.errors=[...metadataErrors,...validateQuizQuestion(record.preview)];
  }catch(error){
    record.preview=record.template;
    record.errors=[...metadataErrors,`generation failed: ${error.message}`];
  }
  return record;
}

export function filterQuizReviewRecords(records,{category='',topic='',difficulty='',search='',sort='id'}={}) {
  const needle=search.trim().toLocaleLowerCase('de');
  const filtered=records.filter(record=>{
    const question=record.preview;
    const haystack=[record.template.id,record.template.topic,question.question,question.explanation]
      .filter(value=>typeof value==='string').join('\n').toLocaleLowerCase('de');
    return (!category||record.template.category===category)
      &&(!topic||record.template.topic===topic)
      &&(!difficulty||record.template.difficulty===difficulty)
      &&(!needle||haystack.includes(needle));
  });
  const compareId=(left,right)=>left.template.id.localeCompare(right.template.id,'de');
  return filtered.sort(sort==='category'
    ?(left,right)=>left.template.category.localeCompare(right.template.category,'de')||compareId(left,right)
    :compareId);
}

export function summarizeQuizReviewRecords(records) {
  const categories={},difficulties={};
  for(const record of records){
    categories[record.template.category]=(categories[record.template.category]??0)+1;
    difficulties[record.template.difficulty]=(difficulties[record.template.difficulty]??0)+1;
  }
  return {
    total:records.length,
    generated:records.filter(record=>record.generated).length,
    invalid:records.filter(record=>record.errors.length).length,
    categories,difficulties,
  };
}
