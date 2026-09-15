export const DEFAULT_QUIZ_OPTIONS = Object.freeze({
  categories:[],topicsByCategory:[],difficulties:['medium','hard'],quantities:[5,10,15],
});

export function topicsForQuizCategory(options=DEFAULT_QUIZ_OPTIONS,category=null) {
  if(!category)return [];
  const groups=options.topicsByCategory;
  const topics=Array.isArray(groups)
    ?groups.find(group=>group?.category===category)?.topics
    :groups?.[category];
  return [...(topics??[])]
    .filter(topic=>typeof topic==='string'&&topic)
    .sort((left,right)=>left.localeCompare(right,'de'));
}

export function validTopicForCategory(options,category,topic) {
  return topicsForQuizCategory(options,category).includes(topic)?topic:null;
}

function setOptions(select,options) {
  const key=JSON.stringify(options);
  if(select.dataset.options===key)return;
  select.dataset.options=key;
  select.replaceChildren(...options.map(({value,label})=>{
    const option=document.createElement('option');option.value=value;option.textContent=label;return option;
  }));
}

export function renderQuizSettingsControls(controls,options=DEFAULT_QUIZ_OPTIONS,settings={category:null,topic:null,difficulty:null,count:5},editable=true) {
  const {categorySelect,topicField,topicSelect,difficultySelect,quantitySelect}=controls;
  const topics=topicsForQuizCategory(options,settings.category);
  setOptions(categorySelect,[{value:'',label:'All'},...options.categories.map(value=>({value,label:value}))]);
  if(topicSelect){
    setOptions(topicSelect,[{value:'',label:'All'},...topics.map(value=>({value,label:value}))]);
    topicSelect.value=validTopicForCategory(options,settings.category,settings.topic)??'';
    topicSelect.disabled=!editable;
  }
  if(topicField){
    topicField.hidden=topics.length===0;
    topicField.parentElement?.classList.toggle('has-topic',topics.length>0);
  }
  setOptions(difficultySelect,[{value:'',label:'All'},...options.difficulties.map(value=>({value,label:value}))]);
  setOptions(quantitySelect,[...options.quantities.map(value=>({value:String(value),label:String(value)})),{value:'all',label:'All'}]);
  categorySelect.value=settings.category??'';
  difficultySelect.value=settings.difficulty??'';
  quantitySelect.value=settings.count===null?'all':String(settings.count);
  for(const select of [categorySelect,difficultySelect,quantitySelect])select.disabled=!editable;
}

export function readQuizSettingsControls(controls,options=DEFAULT_QUIZ_OPTIONS) {
  const {categorySelect,difficultySelect,quantitySelect}=controls;
  const category=categorySelect.value||null;
  return {
    category,
    topic:validTopicForCategory(options,category,controls.topicSelect?.value)||null,
    difficulty:difficultySelect.value||null,
    count:quantitySelect.value==='all'?null:Number(quantitySelect.value),
  };
}
