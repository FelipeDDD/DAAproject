"use strict";

const FIELDS = ["id","source_id","category","topic","difficulty","question","answer1","answer2","answer3","answer4","correctAnswer","explanation","media","curriculum_level","prerequisites","difficulty_after_learning"];
const TRACKED = ["question","answers","correctAnswer","explanation","difficulty"];
const RANK = { medium: 1, hard: 2 };
const STATES = new Set(["unchecked","agree","question","review"]);
const VERDICTS = new Set(["APPROVE","REVISE","REJECT","PASS","KEEP_AND_ADD","REVISE_AND_ADD","REVISE_ORIGINAL"]);
const app = { state:null, validation:null, records:[], filtered:[], selected:null, personal:{}, storageKey:"" };
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
  return new Set(report.questions.map((x) => x && x.original && x.original.category).filter(Boolean));
}
function validationCategories(report) {
  return new Set(report.validations.flatMap((x) => x ? [
    x.original_question, x.recommended_final_question, x.corrected_question,
    x.reviewed_proposal, x.original_revision, x.addition_candidate
  ] : []).map((q) => q && q.category).filter(Boolean));
}
function duplicates(items) {
  const seen = new Set(), dup = new Set();
  items.forEach((x) => {
    const id = x && typeof x.id === "string" ? x.id.trim() : "";
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
    if (!x || typeof x.id !== "string" || !x.id.trim()) throw new Error("Pergunta sem ID válido na posição " + (i+1) + ".");
    if (!x.original || typeof x.original !== "object") throw new Error("A pergunta " + x.id + " não possui o objeto original.");
    if (!["PASS","REWRITE","OTHER_ISSUE"].includes(x.status)) throw new Error("Status inicial não reconhecido em " + x.id + ".");
  });
  const sc = stateCategories(state);
  if (sc.size !== 1) throw new Error("O relatório de estado deve representar exatamente uma categoria.");
  if (!validation) return;
  const vd = duplicates(validation.validations);
  if (vd.length) throw new Error("IDs duplicados no relatório de validação: " + vd.join(", ") + ".");
  const ids = new Set(state.questions.map((x) => x.id)), foreign = [];
  validation.validations.forEach((x,i) => {
    if (!x || typeof x.id !== "string" || !x.id.trim()) throw new Error("Validação sem ID válido na posição " + (i+1) + ".");
    if (!VERDICTS.has(x.verdict)) throw new Error("Veredito não reconhecido em " + x.id + ".");
    if (!ids.has(x.id)) foreign.push(x.id);
  });
  if (foreign.length) throw new Error("A validação contém IDs ausentes no estado: " + foreign.slice(0,12).join(", ") + (foreign.length>12 ? "…" : "") + ".");
  const vc = validationCategories(validation);
  if (vc.size > 1) throw new Error("O relatório de validação contém categorias diferentes.");
  const a = Array.from(sc)[0], b = Array.from(vc)[0];
  if (b && a !== b) throw new Error("Categorias incompatíveis: estado “" + a + "” e validação “" + b + "”.");
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
  const byId = new Map((validation ? validation.validations : []).map((x) => [x.id,x]));
  return state.questions.map((s) => {
    const original=s.original, proposal=s.proposed_question || original, v=byId.get(s.id)||null;
    const final=finalQuestion(original,proposal,v);
    const issues=Array.from(new Set([].concat(s.tags||[],v&&v.issue_types||[]).filter(Boolean)));
    const changes={}; TRACKED.forEach((f) => changes[f]=changed(original,final,f));
    return { id:s.id, state:s, validation:v, original:original, proposal:proposal, final:final,
      addition:v&&v.addition_candidate||null, issues:issues, changes:changes, repetition:repetition(s,v) };
  });
}
function identity(report) {
  const cat=Array.from(stateCategories(report))[0]||"unknown";
  return (cat+":"+(report.source_sha256||report.source_file||report.review_date||"report")).replace(/s+/g,"_").slice(0,180);
}
function loadPersonal() {
  app.storageKey="quiz-review-viewer:v1:"+identity(app.state);
  try {
    const parsed=JSON.parse(localStorage.getItem(app.storageKey)||"{}");
    app.personal=parsed && typeof parsed==="object" && !Array.isArray(parsed) ? parsed : {};
  } catch { app.personal={}; }
}
function personal(id) {
  const p=app.personal[id]||{};
  return { state:STATES.has(p.state)?p.state:"unchecked", note:typeof p.note==="string"?p.note:"" };
}
function savePersonal(id,patch) {
  if (!id) return;
  app.personal[id]=Object.assign({},personal(id),patch);
  try { localStorage.setItem(app.storageKey,JSON.stringify(app.personal)); }
  catch(e) { showError("Não foi possível salvar no localStorage: "+e.message); }
  updateProgress(); renderIds();
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
    app.selected=app.records.length?app.records[0].id:null;
    loadPersonal(); resetFilters(); populateFilters(); renderReport();
    $("file-status").textContent="Carregado: "+names.join(" + ")+".";
    $("clear-report").hidden=false; $("workspace").hidden=false;
  } catch(e) { showError(e instanceof Error?e.message:String(e)); }
  finally { $("file-input").value=""; }
}
function closeReport() {
  Object.assign(app,{state:null,validation:null,records:[],filtered:[],selected:null,personal:{},storageKey:""});
  $("workspace").hidden=true; $("clear-report").hidden=true;
  $("file-status").textContent="Nenhum relatório carregado."; clearError();
}
const filterIds=["filter-search","filter-status","filter-verdict","filter-batch","filter-original-difficulty",
  "filter-final-difficulty","filter-issue","filter-direction","filter-changed-field","filter-personal"];
function resetFilters() {
  filterIds.forEach((id)=>$(id).value="");
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
  fill("filter-status",unique(app.records.map((r)=>r.state.status)));
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
function direction(r) {
  return directionBetween(r.original,r.final);
}
function directionBetween(original,final) {
  const a=RANK[original&&original.difficulty],b=RANK[final&&final.difficulty];
  return !a||!b||a===b?"same":b>a?"increased":"decreased";
}
function searchable(r) {
  return [r.id,questionText(r.original),questionText(r.proposal),questionText(r.final),questionText(r.addition),r.state.problem,
    r.state.justification,r.validation&&r.validation.reason].concat(r.issues).map(asText).join(" ").toLocaleLowerCase("de-DE");
}
function matches(r,f) {
  if(f.search&&!searchable(r).includes(f.search))return false;
  if(f.status&&r.state.status!==f.status)return false;
  if(f.verdict&&(!r.validation||r.validation.verdict!==f.verdict))return false;
  if(f.batch&&String(r.validation?validationBatch(r.validation):r.state.batch)!==f.batch)return false;
  if(f.od&&r.original.difficulty!==f.od)return false;
  if(f.fd&&r.final.difficulty!==f.fd)return false;
  if(f.issue&&!r.issues.includes(f.issue))return false;
  const d=direction(r);
  if(f.direction==="changed"&&d==="same")return false;
  if(f.direction&&f.direction!=="changed"&&d!==f.direction)return false;
  if(f.field==="any"&&!Object.values(r.changes).some(Boolean))return false;
  if(f.field&&f.field!=="any"&&!r.changes[f.field])return false;
  if(f.personal&&personal(r.id).state!==f.personal)return false;
  if(f.repetition&&!r.repetition)return false;
  if(f.addition&&!r.addition)return false;
  return true;
}
function applyFilters() {
  const f=filters(); app.filtered=app.records.filter((r)=>matches(r,f));
  if(!app.filtered.some((r)=>r.id===app.selected))app.selected=app.filtered.length?app.filtered[0].id:null;
  renderIds(); renderSelected();
  $("filter-count").textContent=app.filtered.length+" de "+app.records.length+" perguntas visíveis.";
}
function cssStatus(v){return String(v||"neutral").toLowerCase().replace(/[^a-z0-9_]+/g,"_");}
function summaryCount(value){return app.records.filter((r)=>r.state.status===value||(r.validation&&r.validation.verdict===value)).length;}
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
  const missing=app.records.filter((r)=>r.state.status!=="PASS"&&!r.validation).length;
  const additions=app.records.filter((r)=>r.addition).length;
  const validated=app.records.filter((r)=>r.validation).length;
  const corpus=(app.validation&&app.validation.corpus)||(app.state&&app.state.corpus);
  const cards=[["Questões existentes",app.records.length,""],["Propostas validadas",validated,"approve"],
    ["PASS",summaryCount("PASS"),"pass"],["Candidatas novas",additions,"addition"],
    ["Categoria projetada",app.records.length+additions,"addition"]];
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
    ["medium → hard",app.records.filter((r)=>r.original.difficulty==="medium"&&r.final.difficulty==="hard").length],
    ["hard → medium",app.records.filter((r)=>r.original.difficulty==="hard"&&r.final.difficulty==="medium").length],
    ["Dificuldade alterada",app.records.filter((r)=>direction(r)!=="same").length]],["Mudança","Total"]);
  metricTable(area,"Campos alterados no resultado final",TRACKED.map((f)=>[f,app.records.filter((r)=>r.changes[f]).length]),["Campo","Total"]);
  metricTable(area,"Revisão pessoal local",[
    ["Revisados",app.records.filter((r)=>personal(r.id).state!=="unchecked").length],
    ["Concordo",app.records.filter((r)=>personal(r.id).state==="agree").length],
    ["Tenho dúvida",app.records.filter((r)=>personal(r.id).state==="question").length],
    ["Revisar",app.records.filter((r)=>personal(r.id).state==="review").length]],["Estado","Total"]);
}
function updateProgress(){
  if(app.records.length)$("review-progress").textContent=app.records.filter((r)=>personal(r.id).state!=="unchecked").length+" / "+app.records.length+" revisados";
}
function renderIds(){
  const list=$("id-list");list.replaceChildren();
  app.filtered.forEach((r)=>{
    const b=node("button","", "id-button"+(r.id===app.selected?" active":""));b.type="button";
    const dot=node("span","", "dot"+(personal(r.id).state!=="unchecked"?" reviewed":""));
    dot.setAttribute("aria-label",personal(r.id).state==="unchecked"?"Não revisado":"Revisado");
    b.append(node("span",r.id),dot);b.addEventListener("click",()=>select(r.id));list.append(b);
  });
  if(!app.filtered.length)list.append(node("p","Nenhum ID corresponde aos filtros.","empty-value"));
}
function badge(label,value,cls){return node("span",label+": "+value,"badge "+(cls||"neutral"));}
function display(value){const t=asText(value);return t===""?"(vazio)":t;}
function versions(r){
  const verdict=r.validation&&r.validation.verdict;
  const finalAssessment=r.validation&&Object.assign({
    curriculum_level:r.validation.curriculum_level,
    prerequisites:r.validation.prerequisites,
    difficulty_after_learning:r.validation.difficulty_after_learning
  },r.validation.final_question_assessment||{});
  const additionAssessment=r.validation&&Object.assign({},r.addition||{},r.validation.addition_candidate_assessment||{});
  if(verdict==="KEEP_AND_ADD")return [
    {key:"original",title:"Original preservada",q:r.original,note:"A questão existente permanece no banco",assessment:finalAssessment},
    {key:"addition",title:"Nova questão candidata",q:r.addition,note:"Candidata adicional · ainda sem ID próprio",assessment:additionAssessment,cardClass:"candidate"}
  ];
  if(verdict==="REVISE_AND_ADD")return [
    {key:"original",title:"Original",q:r.original,note:"Conteúdo atual no banco"},
    {key:"revised",title:"Revisão da questão existente",q:r.final,note:"REVISE_AND_ADD · substitui a versão existente",assessment:finalAssessment,base:r.original},
    {key:"addition",title:"Nova questão candidata",q:r.addition,note:"Candidata adicional · ainda sem ID próprio",assessment:additionAssessment,cardClass:"candidate"}
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
  const correct=Number(q&&q.correctAnswer);
  answers(q).forEach((a,i)=>{const item=node("div",display(a),"answer"+(i===correct?" correct":""));item.dataset.index=String(i+1);list.append(item);});
  b.append(list);return b;
}
function versionCard(r,v,vs,hide){
  const discard=r.validation&&r.validation.verdict==="REJECT"&&v.key==="proposal";
  const card=node("article","", "version-card"+(discard?" discarded":"")+(v.cardClass?" "+v.cardClass:"")),head=document.createElement("header");
  const shownId=v.q&&v.q.id||(v.q&&v.q.source_id?"candidata de "+v.q.source_id:r.id);
  head.append(node("h3",v.title),node("p",v.note,"version-note"));card.append(head,fieldBlock(v.key==="addition"?"Origem":"ID",shownId,"field"));
  [["category","Categoria"],["topic","Topic"],["difficulty","Dificuldade"],["question","Pergunta"]].forEach((pair)=>{
    const d=pair[0]==="difficulty"&&v.base?directionBetween(v.base,v.q):"";
    if(!hide||!identical(vs,pair[0]))card.append(fieldBlock(pair[1],v.q&&v.q[pair[0]],fieldClass(r,v,pair[0]),d));
  });
  if(!hide||!identical(vs,"answers"))card.append(answerBlock(v.q,fieldClass(r,v,"answers")));
  if(!hide||!identical(vs,"correctAnswer")){
    const x=Number(v.q&&v.q.correctAnswer),value=Number.isInteger(x)?x+" (alternativa "+(x+1)+")":v.q&&v.q.correctAnswer;
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
  const p=personal(r.id),radio=document.querySelector('input[name="personal-state"][value="'+p.state+'"]');
  if(radio)radio.checked=true;$("personal-note").value=p.note;
}
function renderSelected(){
  const r=app.filtered.find((x)=>x.id===app.selected),prev=$("previous-question"),next=$("next-question");
  if(!r){
    $("question-title").textContent="Nenhuma pergunta selecionada";$("question-position").textContent=app.filtered.length?"":"Ajuste ou limpe os filtros.";
    $("status-strip").replaceChildren();$("comparison").replaceChildren();$("review-details").replaceChildren();$("personal-note").value="";
    prev.disabled=true;next.disabled=true;return;
  }
  const index=app.filtered.findIndex((x)=>x.id===r.id);
  $("question-title").textContent=r.id;$("question-position").textContent=(index+1)+" de "+app.filtered.length+" no filtro atual";
  prev.disabled=index<=0;next.disabled=index<0||index>=app.filtered.length-1;
  $("status-strip").replaceChildren(
    badge("Status inicial",r.state.status,cssStatus(r.state.status)),
    badge("Veredito",r.validation?r.validation.verdict:r.state.status==="PASS"?"não necessário":"ausente",cssStatus(r.validation&&r.validation.verdict)),
    badge("Batch",r.validation?validationBatch(r.validation):(r.state.batch||"(vazio)"),"neutral"),
    badge("Revisão pessoal",personal(r.id).state,"neutral"));
  const vs=versions(r),box=$("comparison");box.className="comparison-grid"+(vs.length===2?" two-columns":"");box.replaceChildren();
  vs.forEach((v)=>box.append(versionCard(r,v,vs,$("hide-identical").checked)));
  renderDetails(r);renderPersonal(r);
}
function select(id){app.selected=id;renderIds();renderSelected();}
function move(offset){const i=app.filtered.findIndex((r)=>r.id===app.selected),target=app.filtered[i+offset];if(target)select(target.id);}
function renderReport(){
  const category=Array.from(stateCategories(app.state))[0]||"Categoria desconhecida";
  $("report-title").textContent=category;$("report-source").textContent=asText(app.state.source_file||"Relatório de revisão");
  renderSummary();updateProgress();applyFilters();
}
function exportNotes(){
  if(!app.state)return;
  const notes=Object.entries(app.personal).filter((x)=>x[1]&&(x[1].state!=="unchecked"||x[1].note)).map((x)=>({id:x[0],state:x[1].state,note:x[1].note}));
  const category=Array.from(stateCategories(app.state))[0]||"quiz";
  const payload={schema_version:1,exported_at:new Date().toISOString(),category:category,source_file:app.state.source_file||null,storage_key:app.storageKey,notes:notes};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=category.toLowerCase().replace(/[^a-z0-9_-]+/g,"-")+"-review-notes.json";document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}

$("file-input").addEventListener("change",()=>openFiles(Array.from($("file-input").files)));
$("clear-report").addEventListener("click",closeReport);
$("clear-filters").addEventListener("click",()=>{resetFilters();applyFilters();});
$("previous-question").addEventListener("click",()=>move(-1));
$("next-question").addEventListener("click",()=>move(1));
$("hide-identical").addEventListener("change",renderSelected);
$("export-notes").addEventListener("click",exportNotes);
$("clear-note").addEventListener("click",()=>{if(app.selected){$("personal-note").value="";savePersonal(app.selected,{note:""});}});
$("personal-state").addEventListener("change",(e)=>{if(app.selected&&e.target.name==="personal-state"){savePersonal(app.selected,{state:e.target.value});renderSelected();}});
$("personal-note").addEventListener("input",(e)=>{if(app.selected)savePersonal(app.selected,{note:e.target.value});});
filterIds.concat(["filter-repetition","filter-addition"]).forEach((id)=>$(id).addEventListener(id==="filter-search"?"input":"change",applyFilters));
