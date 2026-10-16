import { QUESTION_REPORT_MESSAGES } from '../quiz/questionReportConfig.js';

export async function handleTerminalQuestionReport({event,frame,controller,origin=location.origin}){
  if(event.origin!==origin||event.source!==frame.contentWindow||event.data?.type!==QUESTION_REPORT_MESSAGES.request)return false;
  const {requestId,...payload}=event.data.payload??{};
  if(typeof requestId!=='string'||requestId.length>100)return false;
  let result;
  try{
    const response=await controller.reportTerminalQuestion(payload);
    result={ok:true,alreadyReported:Boolean(response.alreadyReported)};
  }catch(error){result={ok:false,error:error instanceof Error?error.message:'Could not send feedback. Please try again.'};}
  frame.contentWindow?.postMessage({type:QUESTION_REPORT_MESSAGES.result,requestId,...result},origin);
  return true;
}
