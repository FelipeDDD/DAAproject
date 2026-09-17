import STATIC_QUIZ_QUESTIONS from '../../convex/quizStaticQuestions.generated.js';
import { GENERATED_QUIZ_QUESTIONS } from '../../convex/quizGeneratedQuestions.js';
import { materializeQuizQuestion } from '../../convex/quizQuestions.js';
import {
  createQuizReviewRecords,filterQuizReviewRecords,regenerateQuizRecord,
} from '../quiz-database/model.js';

const REQUEST_TYPE='daa-terminal-database-request';
const STATE_TYPE='daa-terminal-database-state';
const DEFAULT_PAGE_SIZE=60;
const MAX_PAGE_SIZE=100;

function unique(values){
  return [...new Set(values.filter(value=>typeof value==='string'&&value))]
    .sort((left,right)=>left.localeCompare(right,'de'));
}

function normalizedFilters(value={}){
  return {
    category:typeof value.category==='string'?value.category:'',
    topic:typeof value.topic==='string'?value.topic:'',
    difficulty:typeof value.difficulty==='string'?value.difficulty:'',
    search:typeof value.search==='string'?value.search.slice(0,200):'',
    sort:'id',
  };
}

function listItem(record){
  return {
    key:record.key,id:record.template.id,category:record.template.category,
    topic:record.template.topic??null,difficulty:record.template.difficulty,
    question:record.preview.question??'Question preview unavailable',
    generated:record.generated,warningCount:record.errors.length,
  };
}

function detailItem(record){
  const question=record.preview;
  return {
    ...listItem(record),source:record.source,answers:Array.isArray(question.answers)?question.answers:[],
    correctAnswer:question.correctAnswer,explanation:question.explanation??'',media:question.media??null,
    errors:[...record.errors],
  };
}

export class TerminalQuestionDatabaseBridge {
  constructor({frame,origin=location.origin,records}={}){
    this.frame=frame;this.origin=origin;this.disposed=false;
    this.records=records??createQuizReviewRecords(
      STATIC_QUIZ_QUESTIONS,GENERATED_QUIZ_QUESTIONS,materializeQuizQuestion,
    );
    const categories=unique(this.records.map(record=>record.template.category));
    this.options={
      categories,difficulties:unique(this.records.map(record=>record.template.difficulty)),
      topicsByCategory:categories.map(category=>({
        category,topics:unique(this.records.filter(record=>record.template.category===category)
          .map(record=>record.template.topic)),
      })).filter(group=>group.topics.length),
    };
  }

  accepts(event){
    return !this.disposed&&event.origin===this.origin&&event.source===this.frame.contentWindow
      &&event.data?.type===REQUEST_TYPE;
  }

  post(action,state,requestId){
    this.frame.contentWindow?.postMessage({type:STATE_TYPE,action,state,requestId},this.origin);
  }

  handle(event){
    if(!this.accepts(event))return false;
    const {action,payload={},requestId}=event.data;
    if(action==='list'){
      const filters=normalizedFilters(payload.filters);
      const visible=filterQuizReviewRecords(this.records,filters);
      const offset=Math.max(0,Number.isInteger(payload.offset)?payload.offset:0);
      const limit=Math.min(MAX_PAGE_SIZE,Math.max(1,Number.isInteger(payload.limit)?payload.limit:DEFAULT_PAGE_SIZE));
      const items=visible.slice(offset,offset+limit).map(listItem);
      this.post(action,{
        options:this.options,filters,items,total:visible.length,bankTotal:this.records.length,
        offset,nextOffset:offset+items.length,hasMore:offset+items.length<visible.length,
      },requestId);
      return true;
    }
    if(action==='detail'||action==='regenerate'){
      const record=this.records.find(item=>item.key===payload.key);
      if(!record){this.post(action,{detail:null,error:'Question not found.'},requestId);return true;}
      if(action==='regenerate'&&record.generated)regenerateQuizRecord(record,materializeQuizQuestion);
      this.post(action,{detail:detailItem(record)},requestId);return true;
    }
    return false;
  }

  destroy(){this.disposed=true;}
}

export const TERMINAL_DATABASE_MESSAGES=Object.freeze({request:REQUEST_TYPE,state:STATE_TYPE});
export const TERMINAL_DATABASE_PAGE_SIZE=DEFAULT_PAGE_SIZE;
