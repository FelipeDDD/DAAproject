export const DEFAULT_QUIZ_OPTIONS = Object.freeze({categories:[],difficulties:['medium','hard'],quantities:[5,10,15]});

function setOptions(select,options) {
  const key=JSON.stringify(options);
  if(select.dataset.options===key)return;
  select.dataset.options=key;
  select.replaceChildren(...options.map(({value,label})=>{
    const option=document.createElement('option');option.value=value;option.textContent=label;return option;
  }));
}

export function renderQuizSettingsControls(controls,options=DEFAULT_QUIZ_OPTIONS,settings={category:null,difficulty:null,count:5},editable=true) {
  const {categorySelect,difficultySelect,quantitySelect}=controls;
  setOptions(categorySelect,[{value:'',label:'All'},...options.categories.map(value=>({value,label:value}))]);
  setOptions(difficultySelect,[{value:'',label:'All'},...options.difficulties.map(value=>({value,label:value}))]);
  setOptions(quantitySelect,[...options.quantities.map(value=>({value:String(value),label:String(value)})),{value:'all',label:'All'}]);
  categorySelect.value=settings.category??'';
  difficultySelect.value=settings.difficulty??'';
  quantitySelect.value=settings.count===null?'all':String(settings.count);
  for(const select of [categorySelect,difficultySelect,quantitySelect])select.disabled=!editable;
}

export function readQuizSettingsControls({categorySelect,difficultySelect,quantitySelect}) {
  return {
    category:categorySelect.value||null,
    difficulty:difficultySelect.value||null,
    count:quantitySelect.value==='all'?null:Number(quantitySelect.value),
  };
}
