"use strict";

const FIELDS = ["id","source_id","category","topic","difficulty","question","answer1","answer2","answer3","answer4","correctAnswer","explanation","media","curriculum_level","prerequisites","difficulty_after_learning"];
const TRACKED = ["question","answers","correctAnswer","explanation","difficulty"];
const RANK = { medium: 1, hard: 2 };
const EXISTING_DECISIONS = [
  ["ACCEPT_RECOMMENDATION","Aceitar recomendação"],["KEEP_CURRENT","Manter questão original"],
  ["NEEDS_ADJUSTMENT","Precisa ajustar"],["UNSURE","Dúvida"]
];
const NEW_DECISIONS = [
  ["APPROVE_NEW","Aprovar nova"],["REJECT_NEW","Rejeitar inclusão da nova questão"],
  ["NEEDS_ADJUSTMENT","Precisa ajustar"],["UNSURE","Dúvida"]
];
const DECISIONS = new Set(EXISTING_DECISIONS.concat(NEW_DECISIONS).map((x)=>x[0]));
const VERDICTS = new Set(["APPROVE","REVISE","REJECT","PASS","KEEP_AND_ADD","REVISE_AND_ADD","REVISE_ORIGINAL"]);
const app = { state:null, validation:null, records:[], filtered:[], selected:null, personal:{}, storageKey:"",viewKey:"",history:[],navHistory:[] };
const $ = (id) => document.getElementById(id);

function node(tag, text, cls) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.textContent = text == null ? "" : String(text);
  return n;
}
function asText(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}
function key(value) {
  if (value == null || value === "") return "";
  try { return typeof value === "object" ? JSON.stringify(value) : String(value); }
  catch { return String(value); }
}
function same(a,b) { return key(a) === key(b); }
function answers(q) { return [1,2,3,4].map((i) => q ? q["answer"+i] : ""); }
function changed(a,b,field) {
  if (field === "answers") return answers(a).some((v,i) => !same(v, answers(b)[i]));
  return !same(a && a[field], b && b[field]);
}
function questionText(q) { return q ? FIELDS.map((f) => asText(q[f])).join(" ") : ""; }
function stateCategories(report) {
  return new Set(report.questions.flatMap((x) => x ? [x.original,x.new_question,x.addition_candidate,x.candidate,
    x.item_type==="new_question"?x:null] : [])
    .map((q)=>q&&q.category).filter(Boolean));
}
function validationCategories(report) {
  return new Set(report.validations.flatMap((x) => x ? [
    x.original_question, x.recommended_final_question, x.corrected_question,
    x.reviewed_proposal, x.original_revision, x.addition_candidate, x.new_question, x.candidate,
    x.item_type==="new_question"?x:null
  ] : []).map((q) => q && q.category).filter(Boolean));
}
function duplicates(items) {
  const seen = new Set(), dup = new Set();
  items.forEach((x) => {
    const id = x && typeof (x.id||x.candidate_key) === "string" ? (x.id||x.candidate_key).trim() : "";
    if (id && seen.has(id)) dup.add(id);
    if (id) seen.add(id);
  });
  return Array.from(dup);
}
function classify(data) {
  const state = data && typeof data === "object" && Array.isArray(data.questions);
  const validation = data && typeof data === "object" && Array.isArray(data.validations);
  return state !== validation ? (state ? "state" : "validation") : null;
}
function validate(state, validation) {
  if (!state) throw new Error("Selecione um relatório de estado que contenha a lista “questions”.");
  const sd = duplicates(state.questions);
  if (sd.length) throw new Error("IDs duplicados no relatório de estado: " + sd.join(", ") + ".");
  state.questions.forEach((x,i) => {
    const identifier=x&&(x.id||x.candidate_key),candidate=x&&(x.new_question||x.addition_candidate||x.candidate||
      (x.item_type==="new_question"?x:null));
    if (typeof identifier !== "string" || !identifier.trim()) throw new Error("Item sem id ou candidate_key válido na posição " + (i+1) + ".");
    if ((!x.original||typeof x.original!=="object")&&(!candidate||typeof candidate!=="object"))
      throw new Error("O item " + identifier + " não possui original nem questão candidata.");
    if (x.status&&!['PASS','REWRITE','OTHER_ISSUE','NEW_QUESTION'].includes(x.status)) throw new Error("Status inicial não reconhecido em " + identifier + ".");
  });
  const sc = stateCategories(state);
  if (sc.size > 1) throw new Error("O relatório de estado deve representar no máximo uma categoria.");
  if (!validation) return;
  const vd = duplicates(validation.validations);
  if (vd.length) throw new Error("IDs duplicados no relatório de validação: " + vd.join(", ") + ".");
  const ids = new Set(state.questions.map((x) => x.id||x.candidate_key)), foreign = [];
  validation.validations.forEach((x,i) => {
    const identifier=x&&(x.id||x.candidate_key),isNew=Boolean(x&&(x.new_question||x.addition_candidate||x.candidate||x.item_type==="new_question"));
    if (typeof identifier !== "string" || !identifier.trim()) throw new Error("Validação sem id ou candidate_key válido na posição " + (i+1) + ".");
    if (x.verdict&&!VERDICTS.has(x.verdict)) throw new Error("Veredito não reconhecido em " + identifier + ".");
    if (!ids.has(identifier)&&!isNew) foreign.push(identifier);
  });
  if (foreign.length) throw new Error("A validação contém IDs ausentes no estado: " + foreign.slice(0,12).join(", ") + (foreign.length>12 ? "…" : "") + ".");
  const vc = validationCategories(validation);
  if (vc.size > 1) throw new Error("O relatório de validação contém categorias diferentes.");
  const a = Array.from(sc)[0], b = Array.from(vc)[0];
  if (b && a && a !== b) throw new Error("Categorias incompatíveis: estado “" + a + "” e validação “" + b + "”.");
}
function finalQuestion(original, proposal, validation) {
  if (!validation) return proposal || original;
  if (["REJECT","PASS","KEEP_AND_ADD"].includes(validation.verdict)) return original;
  if (["REVISE_AND_ADD","REVISE_ORIGINAL"].includes(validation.verdict) && validation.original_revision) return validation.original_revision;
  return validation.recommended_final_question || validation.corrected_question ||
    validation.reviewed_proposal || proposal || original;
}
function validationBatch(validation) {
  return validation && (validation.batch ?? validation.validation_batch);
}
function repetition(state, validation) {
  const text = [
    state.problem,state.justification
  ].concat(state.tags || [], validation && validation.repetition_assessment,
    validation && validation.repetition_check && validation.repetition_check.assessment,
    validation && validation.issue_types || []).map(asText).join(" ").toLocaleLowerCase("pt-BR");
  return Boolean(validation && validation.repetition_check && validation.repetition_check.required_by_original_proposal) ||
    Boolean(validation && validation.related_ids && validation.related_ids.length) ||
    text.includes("repet") || text.includes("redundan") || text.includes("duplicate");
}
function recordsFrom(state, validation) {
  const validations=validation?validation.validations:[],byId=new Map(validations.map((x)=>[x.id||x.candidate_key,x]));
  const records=[];
  state.questions.forEach((s) => {
    const identifier=s.id||s.candidate_key,standalone=s.new_question||s.addition_candidate||s.candidate||
      (s.item_type==="new_question"?s:null);
    const v=byId.get(identifier)||null;
    if(!s.original&&standalone){
      records.push(newQuestionRecord({candidate:standalone,state:s,validation:v,candidateKey:s.candidate_key||identifier,
        id:s.id||null,sourceId:s.source_id||standalone.source_id,addition:Boolean(s.addition_candidate)}));return;
    }
    const original=s.original, proposal=s.proposed_question || original;
    const final=finalQuestion(original,proposal,v);
    const issues=Array.from(new Set([].concat(s.tags||[],v&&v.issue_types||[]).filter(Boolean)));
    const changes={}; TRACKED.forEach((f) => changes[f]=changed(original,final,f));
    records.push({ key:"existing:"+identifier,id:identifier,itemType:"existing_change",sourceId:s.source_id||original&&original.source_id||null,
      state:s,validation:v,original,proposal,final,addition:null,issues,changes,repetition:repetition(s,v) });
    const addition=v&&v.addition_candidate||s.addition_candidate;
    if(addition)records.push(newQuestionRecord({candidate:addition,state:s,validation:v,
      candidateKey:addition.candidate_key||identifier+"::addition",sourceId:identifier,addition:true}));
  });
  validations.forEach((v)=>{
    const identifier=v.id||v.candidate_key,candidate=v.new_question||v.candidate||
      (v.item_type==="new_question"?v:null);
    if(candidate&&!records.some((r)=>r.key==="new:"+(v.candidate_key||identifier)))records.push(newQuestionRecord({candidate,state:{status:"NEW_QUESTION"},validation:v,
      candidateKey:v.candidate_key||identifier,id:v.id||null,sourceId:v.source_id}));
  });
  return records;
}
function newQuestionRecord({candidate,state,validation,candidateKey,id=null,sourceId,addition=false}){
  const key="new:"+candidateKey,issues=Array.from(new Set([].concat(state&&state.tags||[],validation&&validation.issue_types||[]).filter(Boolean)));
  return {key,id:id||candidateKey,candidateKey,idForExport:id,itemType:"new_question",sourceId:sourceId||candidate&&candidate.source_id||null,
    state:state||{status:"NEW_QUESTION"},validation:validation||null,original:null,proposal:candidate,final:candidate,
    addition:candidate,isAddition:addition,issues,changes:Object.fromEntries(TRACKED.map((f)=>[f,false])),repetition:false};
}
function identity(report) {
  const cat=Array.from(stateCategories(report))[0]||"unknown";
  // Keep the original storage key format so existing local notes remain available.
  return (cat+":"+(report.source_sha256||report.source_file||report.review_date||"report")).replace(/s+/g,"_").slice(0,180);
}
function loadPersonal() {
  app.storageKey="quiz-review-viewer:v1:"+identity(app.state);
  try {
    const parsed=JSON.parse(localStorage.getItem(app.storageKey)||"{}");
    app.personal=parsed && typeof parsed==="object" && !Array.isArray(parsed) ? parsed : {};
  } catch { app.personal={}; }
}
function viewStorageKey(){
  return app.storageKey+":view:"+(app.validation&&(app.validation.source_sha256||app.validation.source_file||app.validation.dataset_sha256)||"state-only");
}
function saveView(){
  if(!app.state||!app.viewKey)return;
  const values=Object.fromEntries(filterIds.map((id)=>[id,$(id).value]));
  try{localStorage.setItem(app.viewKey,JSON.stringify({selected:app.selected,filters:values,
    repetition:$("filter-repetition").checked,addition:$("filter-addition").checked,
    hideIdentical:$("hide-identical").checked,autoAdvance:$("auto-advance").checked}));}
  catch(e){showError("Não foi possível salvar a posição: "+e.message);}
}
function restoreView(){
  app.viewKey=viewStorageKey();
  let view;
  try{view=JSON.parse(localStorage.getItem(app.viewKey)||"null");}catch{return;}
  if(!view||typeof view!=="object")return false;
  for(const id of filterIds){
    const value=view.filters&&view.filters[id];
    if(typeof value!=="string")continue;
    if(id==="filter-search"||Array.from($(id).options||[]).some((option)=>option.value===value))$(id).value=value;
  }
  $("filter-repetition").checked=Boolean(view.repetition);
  $("filter-addition").checked=Boolean(view.addition);
  $("hide-identical").checked=Boolean(view.hideIdentical);
  if(typeof view.autoAdvance==="boolean")$("auto-advance").checked=view.autoAdvance;
  if(app.records.some((r)=>r.key===view.selected))app.selected=view.selected;
  return true;
}
function personal(id) {
  const p=app.personal[id]||((id.startsWith("existing:")&&app.personal[id.slice(9)])||{});
  const legacy={agree:"ACCEPT_RECOMMENDATION",review:"NEEDS_ADJUSTMENT",question:"UNSURE"}[p.state];
  return {decision:DECISIONS.has(p.decision)?p.decision:(legacy||null),note:typeof (p.notes??p.note)==="string"?(p.notes??p.note):"",
    reviewedAt:p.reviewedAt||p.reviewed_at||null,alsoAddVersion:p.alsoAddVersion||p.also_add_version||null};
}
function savePersonal(id,patch) {
  if (!id) return;
  app.personal[id]=Object.assign({},personal(id),patch);
  try { localStorage.setItem(app.storageKey,JSON.stringify(app.personal)); }
  catch(e) { showError("Não foi possível salvar no localStorage: "+e.message); }
  updateProgress();renderSummary();renderIds();
}
function persistPersonal(){
  try{localStorage.setItem(app.storageKey,JSON.stringify(app.personal));}
  catch(e){showError("Não foi possível salvar no localStorage: "+e.message);}
}
function showError(message) { $("error-box").textContent=message; $("error-box").hidden=false; }
function clearError() { $("error-box").textContent=""; $("error-box").hidden=true; }

async function openFiles(files) {
  if (!files.length) return;
  clearError();
  try {
    if (files.length>2) throw new Error("Selecione no máximo dois arquivos: um estado e uma validação opcional.");
    let state=null, validation=null; const names=[];
    for (const file of files) {
      let data;
      try { data=JSON.parse(await file.text()); }
      catch(e) { throw new Error("JSON inválido em “"+file.name+"”: "+e.message); }
      const type=classify(data);
      if (!type) throw new Error("Formato não reconhecido em “"+file.name+"”. Esperava “questions” ou “validations”.");
      if (type==="state") {
        if (state) throw new Error("Foram selecionados dois relatórios de estado.");
        state=data;
      } else {
        if (validation) throw new Error("Foram selecionados dois relatórios de validação.");
        validation=data;
      }
      names.push(file.name+" ("+(type==="state"?"estado":"validação")+")");
    }
    validate(state,validation);
    app.state=state; app.validation=validation; app.records=recordsFrom(state,validation);
    app.selected=app.records.length?app.records[0].key:null;app.history=[];app.navHistory=[];
    loadPersonal(); resetFilters({pendingByDefault:true}); populateFilters(); renderReport({keepSelected:restoreView()});
    $("file-status").textContent="Carregado: "+names.join(" + ")+".";
    $("clear-report").hidden=false; $("workspace").hidden=false;
  } catch(e) { showError(e instanceof Error?e.message:String(e)); }
  finally { $("file-input").value=""; }
}
function closeReport() {
  Object.assign(app,{state:null,validation:null,records:[],filtered:[],selected:null,personal:{},storageKey:"",viewKey:"",history:[],navHistory:[]});
  $("workspace").hidden=true; $("clear-report").hidden=true;
  $("file-status").textContent="Nenhum relatório carregado."; clearError();
}
const filterIds=["filter-search","filter-status","filter-verdict","filter-batch","filter-original-difficulty",
  "filter-final-difficulty","filter-issue","filter-direction","filter-changed-field","filter-personal"];
function resetFilters({pendingByDefault=false}={}) {
  filterIds.forEach((id)=>$(id).value="");
  if(pendingByDefault)$("filter-personal").value="unchecked";
  $("filter-repetition").checked=false; $("filter-addition").checked=false; $("hide-identical").checked=false;
}
function unique(values,numeric) {
  return Array.from(new Set(values.filter((v)=>v!==null&&v!==undefined&&v!==""))).sort(
    numeric ? (a,b)=>Number(a)-Number(b) : (a,b)=>String(a).localeCompare(String(b),"de",{sensitivity:"base"})
  );
}
function fill(id,values) {
  const s=$(id); while(s.options.length>1)s.remove(1);
  values.forEach((v)=>{const o=document.createElement("option");o.value=String(v);o.textContent=String(v);s.append(o);});
}
function populateFilters() {
  fill("filter-status",unique(app.records.map((r)=>r.state&&r.state.status)));
  fill("filter-verdict",unique(app.records.map((r)=>r.validation&&r.validation.verdict)));
  fill("filter-batch",unique(app.records.map((r)=>r.validation?validationBatch(r.validation):r.state.batch),true));
  fill("filter-original-difficulty",unique(app.records.map((r)=>r.original&&r.original.difficulty)));
  fill("filter-final-difficulty",unique(app.records.map((r)=>r.final&&r.final.difficulty)));
  fill("filter-issue",unique(app.records.flatMap((r)=>r.issues)));
}
function filters() {
  return { search:$("filter-search").value.trim().toLocaleLowerCase("de-DE"),status:$("filter-status").value,
    verdict:$("filter-verdict").value,batch:$("filter-batch").value,od:$("filter-original-difficulty").value,
    fd:$("filter-final-difficulty").value,issue:$("filter-issue").value,direction:$("filter-direction").value,
    field:$("filter-changed-field").value,personal:$("filter-personal").value,repetition:$("filter-repetition").checked,
    addition:$("filter-addition").checked };
}
function completed(id){const decision=personal(id).decision;return Boolean(decision&&decision!=="UNSURE");}
function direction(r) {
  return directionBetween(r.original,r.final);
}
function directionBetween(original,final) {
  const a=RANK[original&&original.difficulty],b=RANK[final&&final.difficulty];
  return !a||!b||a===b?"same":b>a?"increased":"decreased";
}
function searchable(r) {
  return [r.id,r.candidateKey,r.sourceId,questionText(r.original),questionText(r.proposal),questionText(r.final),questionText(r.addition),r.state.problem,
    r.state.justification,r.validation&&r.validation.reason].concat(r.issues).map(asText).join(" ").toLocaleLowerCase("de-DE");
}
function matches(r,f) {
  if(f.search&&!searchable(r).includes(f.search))return false;
  if(f.status&&(!r.state||r.state.status!==f.status))return false;
  if(f.verdict&&(!r.validation||r.validation.verdict!==f.verdict))return false;
  if(f.batch&&String(r.validation?validationBatch(r.validation):r.state.batch)!==f.batch)return false;
  if(f.od&&(!r.original||r.original.difficulty!==f.od))return false;
  if(f.fd&&(!r.final||r.final.difficulty!==f.fd))return false;
  if(f.issue&&!r.issues.includes(f.issue))return false;
  const d=direction(r);
  if(f.direction==="changed"&&d==="same")return false;
  if(f.direction&&f.direction!=="changed"&&d!==f.direction)return false;
  if(f.field==="any"&&!Object.values(r.changes).some(Boolean))return false;
  if(f.field&&f.field!=="any"&&!r.changes[f.field])return false;
  if(f.personal==="unchecked"&&completed(r.key))return false;
  if(f.personal==="reviewed"&&!completed(r.key))return false;
  if(f.repetition&&!r.repetition)return false;
  if(f.addition&&r.itemType!=="new_question")return false;
  return true;
}
function applyFilters({keepSelected=false}={}) {
  const f=filters(); app.filtered=app.records.filter((r)=>matches(r,f));
  if(!keepSelected&&!app.filtered.some((r)=>r.key===app.selected))app.selected=app.filtered.length?app.filtered[0].key:null;
  renderIds(); renderSelected();
  $("filter-count").textContent=app.filtered.length+" de "+app.records.length+" perguntas visíveis.";
  saveView();
}
function cssStatus(v){return String(v||"neutral").toLowerCase().replace(/[^a-z0-9_]+/g,"_");}
function summaryCount(value){return app.records.filter((r)=>r.state&&r.state.status===value||(r.validation&&r.validation.verdict===value)).length;}
function summaryCard(label,value,cls){
  const c=node("div","",("summary-card "+(cls||"")).trim());c.append(node("strong",value),node("span",label));return c;
}
function difficultyCounts(getter){
  const out={};app.records.forEach((r)=>{const v=(getter(r)&&getter(r).difficulty)||"(vazio)";out[v]=(out[v]||0)+1;});return out;
}
function metricTable(parent,title,rows,headers){
  const card=node("article","", "analysis-card");card.append(node("h3",title));
  const table=node("table","", "metric-table"),thead=document.createElement("thead"),hr=document.createElement("tr");
  headers.forEach((h)=>hr.append(node("th",h)));thead.append(hr);
  const tbody=document.createElement("tbody");
  rows.forEach((row)=>{const tr=document.createElement("tr");row.forEach((v)=>tr.append(node("td",v)));tbody.append(tr);});
  table.append(thead,tbody);card.append(table);parent.append(card);
}
function renderSummary(){
  const box=$("summary-cards");box.replaceChildren();
  const missing=app.records.filter((r)=>r.itemType==="existing_change"&&r.state.status!=="PASS"&&!r.validation).length;
  const additions=app.records.filter((r)=>r.itemType==="new_question").length;
  const validated=app.records.filter((r)=>r.itemType==="existing_change"&&r.validation).length;
  const corpus=(app.validation&&app.validation.corpus)||(app.state&&app.state.corpus);
  const existing=app.records.filter((r)=>r.itemType==="existing_change").length;
  const cards=[["Questões existentes",existing,""],["Propostas validadas",validated,"approve"],
    ["PASS",summaryCount("PASS"),"pass"],["Candidatas novas",additions,"addition"],
    ["Itens para revisar",app.records.length,"addition"]];
  if(corpus&&Number.isFinite(Number(corpus.total_questions)))cards.push(["Banco projetado",Number(corpus.total_questions)+additions,"addition"]);
  [["REWRITE",summaryCount("REWRITE"),"rewrite"],["OTHER_ISSUE",summaryCount("OTHER_ISSUE"),"other_issue"],
   ["APPROVE",summaryCount("APPROVE"),"approve"],["REVISE",summaryCount("REVISE"),"revise"],
   ["REJECT",summaryCount("REJECT"),"reject"],["KEEP_AND_ADD",summaryCount("KEEP_AND_ADD"),"keep_and_add"],
   ["REVISE_AND_ADD",summaryCount("REVISE_AND_ADD"),"revise_and_add"],
   ["REVISE_ORIGINAL",summaryCount("REVISE_ORIGINAL"),"revise_original"],
   ["Sem 2ª validação",missing,"missing"]].forEach((x)=>cards.push(x));
  cards.forEach((x)=>box.append(summaryCard(x[0],x[1],x[2])));
  const area=$("analysis-panels");area.replaceChildren();
  const oc=difficultyCounts((r)=>r.original),pc=difficultyCounts((r)=>r.proposal),fc=difficultyCounts((r)=>r.final);
  const ds=unique(Object.keys(oc).concat(Object.keys(pc),Object.keys(fc)));
  metricTable(area,"Distribuição de dificuldade",ds.map((d)=>[d,oc[d]||0,pc[d]||0,fc[d]||0]),["Dificuldade","Original","Proposta","Final"]);
  metricTable(area,"Mudanças de dificuldade",[
    ["medium → hard",app.records.filter((r)=>r.original&&r.original.difficulty==="medium"&&r.final&&r.final.difficulty==="hard").length],
    ["hard → medium",app.records.filter((r)=>r.original&&r.original.difficulty==="hard"&&r.final&&r.final.difficulty==="medium").length],
    ["Dificuldade alterada",app.records.filter((r)=>direction(r)!=="same").length]],["Mudança","Total"]);
  metricTable(area,"Campos alterados no resultado final",TRACKED.map((f)=>[f,app.records.filter((r)=>r.changes[f]).length]),["Campo","Total"]);
  metricTable(area,"Revisão pessoal local",[
    ["Revisados",app.records.filter((r)=>completed(r.key)).length],
    ["Não revisados",app.records.filter((r)=>!completed(r.key)).length],
    ["Dúvida",app.records.filter((r)=>personal(r.key).decision==="UNSURE").length],
    ["Precisa ajustar",app.records.filter((r)=>personal(r.key).decision==="NEEDS_ADJUSTMENT").length]],["Estado","Total"]);
}
function updateProgress(){
  if(app.records.length)$("review-progress").textContent=app.records.filter((r)=>completed(r.key)).length+" / "+app.records.length+" revisados";
}
function renderIds(){
  const list=$("id-list");list.replaceChildren();
  app.filtered.forEach((r)=>{
    const b=node("button","", "id-button"+(r.key===app.selected?" active":""));b.type="button";
    const dot=node("span","", "dot"+(completed(r.key)?" reviewed":""));
    dot.setAttribute("aria-label",completed(r.key)?"Revisado":"Não revisado");
    b.append(node("span",r.itemType==="new_question"?"+ "+r.id:r.id),dot);b.addEventListener("click",()=>select(r.key));list.append(b);
  });
  if(!app.filtered.length)list.append(node("p","Nenhum ID corresponde aos filtros.","empty-value"));
}
function badge(label,value,cls){return node("span",label+": "+value,"badge "+(cls||"neutral"));}
function display(value){const t=asText(value);return t===""?"(vazio)":t;}
function versions(r){
  if(r.itemType==="new_question")return [{key:"addition",title:r.isAddition?"Candidata adicional":"Questão nova candidata",
    q:r.final,note:r.sourceId?"Origem: "+r.sourceId:"Sem versão original",cardClass:"candidate",
    assessment:r.validation&&(r.validation.addition_candidate_assessment||r.validation.final_question_assessment)}];
  const verdict=r.validation&&r.validation.verdict;
  const finalAssessment=r.validation&&Object.assign({
    curriculum_level:r.validation.curriculum_level,
    prerequisites:r.validation.prerequisites,
    difficulty_after_learning:r.validation.difficulty_after_learning
  },r.validation.final_question_assessment||{});
  if(verdict==="KEEP_AND_ADD")return [
    {key:"original",title:"Original preservada",q:r.original,note:"A candidata adicional tem decisão própria",assessment:finalAssessment},
    ...(TRACKED.some((field)=>changed(r.original,r.proposal,field))?
      [{key:"proposal",title:"Primeira proposta",q:r.proposal,note:"Não escolhida na validação; pode ser adicionada separadamente",base:r.original}]:[])
  ];
  if(verdict==="REVISE_AND_ADD")return [
    {key:"original",title:"Original",q:r.original,note:"Conteúdo atual no banco"},
    {key:"revised",title:"Revisão da questão existente",q:r.final,note:"A candidata adicional tem decisão própria",assessment:finalAssessment,base:r.original}
  ];
  if(verdict==="REVISE_ORIGINAL")return [
    {key:"original",title:"Original",q:r.original,note:"Conteúdo atual no banco"},
    {key:"revised",title:"Versão revisada",q:r.final,note:"REVISE_ORIGINAL · substitui a versão existente",assessment:finalAssessment,base:r.original}
  ];
  const out=[
    {key:"original",title:"Original",q:r.original,note:"Conteúdo no início da revisão"},
    {key:"proposal",title:"Primeira proposta",q:r.proposal,note:r.state.status==="PASS"?"PASS · sem reescrita proposta":"Proposta do primeiro relatório",base:r.original}
  ];
  if(app.validation)out.push({key:"final",title:"Final validado",q:r.final,note:r.validation?r.validation.verdict+" · resultado recomendado":r.state.status==="PASS"?"PASS · segunda validação não necessária":"Sem segunda validação",assessment:r.validation?finalAssessment:null,base:r.proposal});
  return out;
}
function identical(vs,field){
  const values=vs.map((v)=>field==="answers"?answers(v.q):v.q&&v.q[field]);
  return values.slice(1).every((v)=>same(v,values[0]));
}
function fieldClass(r,v,field){
  let cls="field";
  if(v.key==="proposal"&&changed(r.original,r.proposal,field))cls+=" changed";
  if(["final","revised"].includes(v.key)&&changed(v.base,r.final,field))cls+=" corrected";
  if(v.key==="addition")cls+=" candidate";
  return cls;
}
function fieldBlock(label,value,cls,dir){
  const b=node("section","",cls),head=node("div",label,"field-label");
  if(dir&&dir!=="same")head.append(node("span",dir==="increased"?"↑ aumentou":"↓ diminuiu",dir==="increased"?"direction-up":"direction-down"));
  const val=display(value);b.append(head,node("p",val,"field-value"+(val==="(vazio)"?" empty-value":"")));return b;
}
function answerBlock(q,cls){
  const b=node("section","",cls),list=node("div","", "answer-list");b.append(node("div","Respostas","field-label"));
  const correct=q?.correctAnswer==null?NaN:Number(q.correctAnswer);
  answers(q).forEach((a,i)=>{const item=node("div",display(a),"answer"+(i===correct?" correct":""));item.dataset.index=String(i+1);list.append(item);});
  b.append(list);return b;
}
function cardActions(r,v){
  const p=personal(r.key),actions=node("div","","card-actions");
  let options=[];
  if(r.itemType==="new_question")options=[
    {decision:"APPROVE_NEW",label:"Adicionar esta pergunta"},{decision:"REJECT_NEW",label:"Não adicionar"}];
  else if(v.key==="original")options=[{decision:"KEEP_CURRENT",label:"Manter esta versão"}];
  else if(["final","revised"].includes(v.key)||v.key==="proposal"&&!app.validation)
    options.push({decision:"ACCEPT_RECOMMENDATION",label:"Usar esta versão"});
  if(r.itemType==="existing_change"&&v.key!=="original"&&
    TRACKED.some((field)=>changed(r.original,v.q,field))&&
    (v.key!=="proposal"||!app.validation||r.validation?.verdict==="KEEP_AND_ADD"))
    options.push({decision:"KEEP_CURRENT",addVersion:v.key,label:"Manter a original e adicionar esta"});
  if(!options.length)return null;
  for(const option of options){
    const chosen=p.decision===option.decision&&
      (v.key==="original"||p.alsoAddVersion===(option.addVersion||null));
    const button=node("button",option.label,"button card-decision"+(chosen?" chosen":""));
    button.type="button";button.setAttribute("aria-pressed",String(chosen));
    button.addEventListener("click",()=>decide(option.decision,{addVersion:option.addVersion||null}));actions.append(button);
  }
  if(r.itemType==="new_question"&&p.decision==="REJECT_NEW")actions.prepend(node("span","Não adicionada","rejected-seal"));
  else if(r.itemType==="existing_change"&&v.key==="original"&&p.decision==="KEEP_CURRENT"||
    p.decision==="ACCEPT_RECOMMENDATION"&&options.some((option)=>option.decision==="ACCEPT_RECOMMENDATION")||
    p.alsoAddVersion===v.key&&p.decision==="KEEP_CURRENT"||
    r.itemType==="new_question"&&p.decision==="APPROVE_NEW")actions.prepend(node("span","Selecionada","selected-seal"));
  return actions;
}
function addedVersionLabel(version){return {proposal:"a primeira proposta",revised:"a versão revisada",final:"a versão final"}[version]||version;}
function versionCard(r,v,vs,hide){
  const discard=r.validation&&r.validation.verdict==="REJECT"&&v.key==="proposal";
  const actions=cardActions(r,v),selected=actions&&actions.querySelector(".selected-seal"),rejected=actions&&actions.querySelector(".rejected-seal");
  const card=node("article","", "version-card"+(discard?" discarded":"")+(v.cardClass?" "+v.cardClass:"")+(selected?" selected":"")+(rejected?" rejected":"")),head=document.createElement("header");
  const shownId=v.q&&v.q.id||(v.key==="addition"?r.candidateKey:(v.q&&v.q.source_id?"candidata de "+v.q.source_id:r.id));
  head.append(node("h3",v.title),node("p",v.note,"version-note"));card.append(head,fieldBlock(v.key==="addition"?"Origem":"ID",shownId,"field"));
  [["category","Categoria"],["topic","Topic"],["difficulty","Dificuldade"],["question","Pergunta"]].forEach((pair)=>{
    const d=pair[0]==="difficulty"&&v.base?directionBetween(v.base,v.q):"";
    if(pair[0]==="question"||!hide||!identical(vs,pair[0]))card.append(fieldBlock(pair[1],v.q&&v.q[pair[0]],
      fieldClass(r,v,pair[0])+(pair[0]==="question"?" question-field":""),d));
  });
  if(!hide||!identical(vs,"answers"))card.append(answerBlock(v.q,fieldClass(r,v,"answers")));
  if(!hide||!identical(vs,"correctAnswer")){
    const x=v.q?.correctAnswer==null?NaN:Number(v.q.correctAnswer);
    const value=Number.isInteger(x)?x+" (alternativa "+(x+1)+")":v.q&&v.q.correctAnswer;
    card.append(fieldBlock("correctAnswer",value,fieldClass(r,v,"correctAnswer")));
  }
  if(!hide||!identical(vs,"explanation"))card.append(fieldBlock("Explicação",v.q&&v.q.explanation,fieldClass(r,v,"explanation")));
  if(!hide||!identical(vs,"media"))card.append(fieldBlock("Media",v.q&&v.q.media,fieldClass(r,v,"media")));
  const assessment=Object.assign({},v.q||{},v.assessment||{});
  if(assessment.curriculum_level)card.append(fieldBlock("Nível curricular",assessment.curriculum_level,"field assessment"));
  if(assessment.prerequisites&&assessment.prerequisites.length){
    const prerequisites=Array.isArray(assessment.prerequisites)?assessment.prerequisites.join("\n"):assessment.prerequisites;
    card.append(fieldBlock("Pré-requisitos",prerequisites,"field assessment"));
  }
  if(assessment.difficulty_after_learning)card.append(fieldBlock("Dificuldade após aprendizagem",assessment.difficulty_after_learning,"field assessment"));
  if(actions)card.append(actions);
  return card;
}
function detail(parent,title,fn){const c=node("article","", "detail-card");c.append(node("h3",title));fn(c);parent.append(c);}
function paragraph(card,label,value){const p=document.createElement("p");p.append(node("strong",label+": "),document.createTextNode(display(value)));card.append(p);}
function definitions(card,entries){
  const dl=document.createElement("dl");entries.forEach((x)=>dl.append(node("dt",x[0]),node("dd",display(x[1]))));card.append(dl);
}
function tokens(card,values){
  const list=node("ul","", "token-list"),clean=(values||[]).filter(Boolean);
  if(!clean.length)list.append(node("li","(nenhum)","empty-value"));else clean.forEach((v)=>list.append(node("li",asText(v))));
  card.append(list);
}
function sourcesFor(r){
  const direct=r.validation&&r.validation.technical_sources||[];if(direct.length)return direct;
  const related=new Set(r.validation&&r.validation.related_ids||[]);
  return (app.validation&&app.validation.technical_sources||[]).filter((s)=>s&&((s.related_ids||[]).includes(r.id)||s.id===r.id||related.has(s.id)));
}
function renderDetails(r){
  const box=$("review-details");box.replaceChildren();
  if(r.itemType==="new_question"){
    detail(box,"Origem da candidata",(c)=>definitions(c,[["candidate_key",r.candidateKey],["source_id",r.sourceId],
      ["Batch",r.validation?validationBatch(r.validation):r.state.batch]]));
    detail(box,"Validação",(c)=>{paragraph(c,"Motivo",r.validation&&r.validation.reason);c.append(node("p","Tags / issue_types","field-label"));tokens(c,r.issues);});
    return;
  }
  detail(box,"Primeira revisão",(c)=>{paragraph(c,"Problema",r.state.problem);paragraph(c,"Justificativa / motivo",r.state.justification);paragraph(c,"Alterações propostas",r.state.proposed_changes);});
  detail(box,"Segunda validação",(c)=>{
    if(!r.validation){paragraph(c,"Resultado",r.state.status==="PASS"?"PASS — ausente da validação por não exigir segunda revisão.":"Não existe validação para este ID.");return;}
    paragraph(c,"Motivo",r.validation.reason);paragraph(c,"Correção da proposta",r.validation.correction_to_proposal);
  });
  detail(box,"Classificação e origem",(c)=>{
    definitions(c,[["Batch",r.validation?validationBatch(r.validation):r.state.batch],["Fase de origem",r.validation&&(r.validation.source_review_phase??r.validation.source_review_batch)],
      ["Related IDs",r.validation&&r.validation.related_ids],["Repetição",r.validation&&(r.validation.repetition_assessment||(r.validation.repetition_check&&r.validation.repetition_check.assessment))],
      ["Exigiu checagem",r.validation&&r.validation.repetition_check&&r.validation.repetition_check.required_by_original_proposal]]);
    c.append(node("p","Tags / issue_types","field-label"));tokens(c,r.issues);
  });
  detail(box,"Alterações em relação ao CSV atual",(c)=>{
    const changes=r.validation&&r.validation.changes_from_current_csv;
    if(!changes||(typeof changes==="object"&&!Object.keys(changes).length))paragraph(c,"Campos","(nenhuma alteração registrada)");
    else definitions(c,Object.entries(changes));
  });
  detail(box,"Fontes técnicas (texto informativo)",(c)=>{
    const sources=sourcesFor(r);if(!sources.length)paragraph(c,"Fontes","(nenhuma registrada)");
    else sources.forEach((s,i)=>paragraph(c,"Fonte "+(i+1),s));
  });
}
function renderPersonal(r){
  const p=personal(r.key),field=$("personal-state");
  const labels=Object.fromEntries(r.itemType==="new_question"?NEW_DECISIONS:EXISTING_DECISIONS);
  field.replaceChildren(node("strong","Decisão: "+(p.alsoAddVersion?"Manter original + adicionar "+addedVersionLabel(p.alsoAddVersion):labels[p.decision]||"pendente")));
  $("request-adjustment").classList.toggle("chosen",p.decision==="NEEDS_ADJUSTMENT");
  $("decide-later").classList.toggle("chosen",p.decision==="UNSURE");
  $("personal-note").value=p.note;
}
function shortcutLabels(record){
  const choices=record?.itemType==="new_question"?NEW_DECISIONS:EXISTING_DECISIONS;
  return choices.map(([decision,label],index)=>[String(index+1),label]);
}
function renderShortcutLegend(record){
  const legend=$("shortcut-legend");legend.replaceChildren();
  if(!record){legend.textContent="Selecione uma questão para ver os atalhos.";return;}
  shortcutLabels(record).forEach(([key,label],index)=>{
    if(index)legend.append(document.createTextNode(" · "));
    legend.append(node("kbd",key),document.createTextNode(" "+label));
  });
  legend.append(document.createTextNode(" · "),node("kbd","←"),document.createTextNode("/"),node("kbd","→"),document.createTextNode(" navegar"));
}
function renderSelected(){
  const r=app.records.find((x)=>x.key===app.selected),prev=$("previous-question"),next=$("next-question");
  renderShortcutLegend(r);
  if(!r){
    $("question-title").textContent="Nenhuma pergunta selecionada";$("question-position").textContent=app.filtered.length?"":"Ajuste ou limpe os filtros.";
    $("status-strip").replaceChildren();$("comparison").replaceChildren();$("review-details").replaceChildren();$("personal-note").value="";
    $("personal-state").replaceChildren();prev.disabled=!app.navHistory.length;next.disabled=!app.filtered.length;$("undo-decision").disabled=!app.history.length;return;
  }
  const index=app.filtered.findIndex((x)=>x.key===r.key);
  $("question-title").textContent=r.itemType==="new_question"?"Nova questão · "+r.id:r.id;
  $("question-position").textContent=index>=0?(index+1)+" de "+app.filtered.length+" filtradas":
    "Fora do filtro atual · "+app.filtered.length+" filtradas";
  prev.disabled=index<=0&&!app.navHistory.length;
  next.disabled=index>=0?index>=app.filtered.length-1:!app.filtered.length;
  $("undo-decision").disabled=!app.history.length;
  $("status-strip").replaceChildren(
    badge("Tipo",r.itemType==="new_question"?"Questão nova":"Questão existente","neutral"),
    badge("Status inicial",r.state.status||"NEW_QUESTION",cssStatus(r.state.status)),
    badge("Veredito",r.validation?r.validation.verdict||"não informado":r.state.status==="PASS"?"não necessário":"ausente",cssStatus(r.validation&&r.validation.verdict)),
    badge("Batch",r.validation?validationBatch(r.validation):(r.state.batch||"(vazio)"),"neutral"),
    badge("Minha decisão",personal(r.key).alsoAddVersion?"Manter + adicionar "+addedVersionLabel(personal(r.key).alsoAddVersion):personal(r.key).decision||"pendente","neutral"));
  const vs=versions(r),box=$("comparison");box.className="comparison-grid"+(vs.length===1?" single-column":vs.length===2?" two-columns":"");box.replaceChildren();
  vs.forEach((v)=>box.append(versionCard(r,v,vs,$("hide-identical").checked)));
  renderDetails(r);renderPersonal(r);
}
function select(id,{remember=true}={}){
  if(id===app.selected)return;
  if(remember&&app.selected)app.navHistory.push(app.selected);
  app.selected=id;renderIds();renderSelected();saveView();
}
function nextFilteredAfter(key){
  const order=app.records.findIndex((r)=>r.key===key);
  return app.filtered.find((r)=>app.records.indexOf(r)>order)||null;
}
function move(offset){
  const i=app.filtered.findIndex((r)=>r.key===app.selected);
  if(offset<0&&app.navHistory.length){select(app.navHistory.pop(),{remember:false});return;}
  const target=i<0?(offset>0?(app.selected?nextFilteredAfter(app.selected)||app.filtered[0]:app.filtered[0]):null):app.filtered[i+offset];
  if(target)select(target.key);
}
function decide(value,{addVersion=null}={}){
  const record=app.records.find((r)=>r.key===app.selected);
  if(!record)return;
  const choices=record.itemType==="new_question"?NEW_DECISIONS:EXISTING_DECISIONS;
  if(!choices.some(([decision])=>decision===value))return;
  if(addVersion&&!(value==="KEEP_CURRENT"&&versions(record).some((v)=>v.key===addVersion&&v.key!=="original")))return;
  if(value==="NEEDS_ADJUSTMENT"&&!personal(record.key).note.trim()){
    $("personal-note").focus();showError("Escreva uma observação antes de pedir ajuste.");return;
  }
  clearError();
  const before=Object.hasOwn(app.personal,record.key)?structuredClone(app.personal[record.key]):null;
  const previousFiltered=app.filtered.map((r)=>r.key),previousIndex=previousFiltered.indexOf(record.key);
  app.history.push({key:record.key,before});
  savePersonal(record.key,{decision:value,alsoAddVersion:addVersion,reviewedAt:new Date().toISOString()});
  const shouldAdvance=$("auto-advance").checked&&value!=="UNSURE";
  applyFilters({keepSelected:true});
  if(shouldAdvance){
    const upcoming=previousFiltered.slice(Math.max(0,previousIndex+1)).find((key)=>app.filtered.some((r)=>r.key===key));
    const next=app.filtered.find((r)=>r.key===upcoming)||nextFilteredAfter(record.key)||
      ($("filter-personal").value==="unchecked"?app.filtered[0]:null);
    if(next&&next.key!==record.key){app.navHistory.push(record.key);app.selected=next.key;}
  }
  renderIds();renderSelected();saveView();
}
function undoDecision(){
  const last=app.history.pop();if(!last)return;
  if(last.before===null)delete app.personal[last.key];else app.personal[last.key]=last.before;
  persistPersonal();app.selected=last.key;
  if(app.navHistory.at(-1)===last.key)app.navHistory.pop();
  renderSummary();updateProgress();applyFilters({keepSelected:true});
  saveView();
}
function renderReport({keepSelected=false}={}){
  const category=Array.from(stateCategories(app.state))[0]||Array.from(validationCategories(app.validation||{validations:[]}))[0]||"Categoria desconhecida";
  $("report-title").textContent=category;$("report-source").textContent=asText(app.state.source_file||"Relatório de revisão");
  renderSummary();updateProgress();applyFilters({keepSelected});
}
function decisionsPayload(){
  const datasetSha=app.state.dataset_sha256||app.validation&&app.validation.dataset_sha256||null;
  const sourceSha=app.state.source_sha256||app.validation&&app.validation.source_sha256||null;
  const decisions=app.records.filter((r)=>personal(r.key).decision||personal(r.key).note).map((r)=>{
    const p=personal(r.key);
    return {item_type:r.itemType,...(r.itemType==="existing_change"?{id:r.id}:
      {candidate_key:r.candidateKey,...(r.idForExport?{id:r.idForExport}:{})}),
      source_id:r.sourceId||null,decision:p.decision,
      ...(r.itemType==="existing_change"&&p.alsoAddVersion?{also_add_version:p.alsoAddVersion}:{}),
      ...(r.itemType==="new_question"?{addition_decision:p.decision}:{}),
      notes:p.note,reviewed_at:p.reviewedAt,
      dataset_sha256:r.state.dataset_sha256||r.validation&&r.validation.dataset_sha256||datasetSha,
      source_sha256:r.state.source_sha256||r.validation&&r.validation.source_sha256||sourceSha};
  });
  const category=Array.from(stateCategories(app.state))[0]||Array.from(validationCategories(app.validation||{validations:[]}))[0]||"quiz";
  return {schema_version:2,exported_at:new Date().toISOString(),category,
    source_file:app.state.source_file||null,dataset_sha256:datasetSha,source_sha256:sourceSha,decisions};
}
function exportNotes(){
  if(!app.state)return;
  const payload=decisionsPayload(),category=payload.category;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=category.toLowerCase().replace(/[^a-z0-9_-]+/g,"-")+"-review-decisions.json";document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}
async function importDecisions(file){
  if(!file||!app.state)return;
  clearError();
  try{
    const data=JSON.parse(await file.text()),current=decisionsPayload();
    if(data.schema_version!==2||!Array.isArray(data.decisions))throw new Error("O arquivo não contém decisões exportadas na versão 2.");
    if(data.category!==current.category||data.dataset_sha256&&current.dataset_sha256&&data.dataset_sha256!==current.dataset_sha256||
      data.source_sha256&&current.source_sha256&&data.source_sha256!==current.source_sha256)
      throw new Error("As decisões pertencem a outro relatório ou dataset.");
    const records=new Map(app.records.map((r)=>[r.key,r]));let imported=0,skipped=0;
    for(const row of data.decisions){
      if(!row||typeof row!=="object"){skipped++;continue;}
      const id=row.item_type==="new_question"?"new:"+row.candidate_key:row.item_type==="existing_change"?"existing:"+row.id:null;
      const record=records.get(id),decision=row.decision||row.addition_decision||null;
      const allowed=record&&(record.itemType==="new_question"?NEW_DECISIONS:EXISTING_DECISIONS).some(([value])=>value===decision);
      const addVersion=record?.itemType==="existing_change"&&decision==="KEEP_CURRENT"&&
        versions(record).some((v)=>v.key===row.also_add_version&&v.key!=="original")?row.also_add_version:null;
      if(!record||record.itemType!==row.item_type||decision&&!allowed||
        row.also_add_version&&!addVersion||
        row.dataset_sha256&&current.dataset_sha256&&row.dataset_sha256!==current.dataset_sha256||
        row.source_sha256&&current.source_sha256&&row.source_sha256!==current.source_sha256){skipped++;continue;}
      const saved=personal(id);
      if(saved.decision||saved.note){skipped++;continue;}
      app.personal[id]={decision,alsoAddVersion:addVersion,note:typeof row.notes==="string"?row.notes:"",reviewedAt:row.reviewed_at||null};
      imported++;
    }
    persistPersonal();renderSummary();updateProgress();applyFilters({keepSelected:true});
    $("file-status").textContent=`${imported} decisões importadas; ${skipped} ignoradas (incompatíveis ou já salvas).`;
  }catch(e){showError("Não foi possível importar decisões: "+e.message);}
  finally{$("import-decisions").value="";}
}

$("file-input").addEventListener("change",()=>openFiles(Array.from($("file-input").files)));
$("clear-report").addEventListener("click",closeReport);
$("clear-filters").addEventListener("click",()=>{resetFilters();applyFilters();});
$("previous-question").addEventListener("click",()=>move(-1));
$("next-question").addEventListener("click",()=>move(1));
$("hide-identical").addEventListener("change",renderSelected);
$("export-notes").addEventListener("click",exportNotes);
$("import-decisions").addEventListener("change",()=>importDecisions($("import-decisions").files[0]));
$("undo-decision").addEventListener("click",undoDecision);
$("request-adjustment").addEventListener("click",()=>decide("NEEDS_ADJUSTMENT"));
$("decide-later").addEventListener("click",()=>decide("UNSURE"));
$("clear-note").addEventListener("click",()=>{if(app.selected){$("personal-note").value="";savePersonal(app.selected,{note:""});}});
$("personal-note").addEventListener("input",(e)=>{if(app.selected)savePersonal(app.selected,{note:e.target.value});});
$("auto-advance").addEventListener("change",saveView);
$("hide-identical").addEventListener("change",saveView);
filterIds.concat(["filter-repetition","filter-addition"]).forEach((id)=>$(id).addEventListener(id==="filter-search"?"input":"change",applyFilters));
function handleReviewShortcut(event){
  if(!app.state||$("workspace").hidden||event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
  const target=event.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable="true"]'))return;
  const record=app.records.find((r)=>r.key===app.selected),choices=record?.itemType==="new_question"?NEW_DECISIONS:EXISTING_DECISIONS;
  if(/^[1-4]$/.test(event.key)&&record){event.preventDefault();decide(choices[Number(event.key)-1][0]);}
  else if(event.key==="ArrowRight"){event.preventDefault();move(1);}
  else if(event.key==="ArrowLeft"){event.preventDefault();move(-1);}
}
document.addEventListener("keydown",handleReviewShortcut);
