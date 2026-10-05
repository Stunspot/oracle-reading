import {catalog,planets,signs,houses,positions,randomInt,sample,decode,newRecord,validate,symbolFor,brief} from './engine.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const key='oracle-reading.journal.v1';
let method='tarot',active=null,undo=null;
const labels={tarot:'TAROT · RIDER–WAITE–SMITH STYLE',runes:'RUNES · MODERN ELDER FUTHARK PRACTICE',iching:'I CHING · THREE-COIN METHOD',astrology:'ASTROLOGY · YOUR KNOWN PLACEMENTS'};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function say(s){$('#status').textContent=s;}
function button(text,fn,cls=''){const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
function option(value,name){return '<option value="'+value+'">'+name+'</option>';}
function view(name){
 for(const v of ['studio','library','journal'])$('#'+v+'-view').hidden=v!==name;
 for(const b of $$('nav button')){if(b.dataset.view===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 if(name==='library')renderLibrary();
 if(name==='journal')renderJournal();
}
$$('nav button').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
function settings(){
 $('#method-label').textContent=labels[method];
 $('#form-error').hidden=true;
 const root=$('#settings');
 if(method==='astrology'){
  root.innerHTML='<label for="chart-system">Chart system <span class="optional">(if known)</span></label><input id="chart-system" maxlength="200" placeholder="For example, tropical zodiac / Whole Sign houses"><label for="chart-source">Placement source <span class="optional">(optional)</span></label><input id="chart-source" maxlength="200" placeholder="My chart, calculator, or supplied chart text"><p class="hint">Use known placements. No birth details needed here. Leave houses unknown if birth time or house placement is uncertain.</p><div id="placements"></div><button type="button" id="add-placement">Add a placement</button>';
  $('#add-placement').addEventListener('click',()=>{if($$('.placement').length<10)addPlacement();else say('You can read up to ten known placements.');});
  addPlacement();$('#cast').textContent='Read these placements ☉';$('#basis-help').textContent='Symbolic interpretation of the placements you supply. This studio does not calculate a birth chart or current sky.';
  return;
 }
 root.innerHTML='<label for="mode">Reading basis</label><select id="mode"><option value="digital">Cast here</option><option value="physical">Enter my physical cast</option></select>'+
 (method!=='iching'?'<label for="spread">Spread</label><select id="spread"><option value="three">Situation · tension · helpful response</option><option value="focus">One-symbol focus</option><option value="choice">Path A · path B · what helps you choose</option></select>':'')+
 (method==='tarot'?'<label class="check"><input type="checkbox" id="reversals">Include reversed cards</label>':'')+
 '<div id="manual"></div>';
 $('#mode').addEventListener('change',manual);
 if($('#spread'))$('#spread').addEventListener('change',manual);
 manual();
}
function manual(){
 const physical=$('#mode').value==='physical';const place=positions[$('#spread')?.value||'three'];const root=$('#manual');root.replaceChildren();
 if(physical){
  const wrap=el('div','manual-block');root.append(wrap);
  if(method==='iching'){
   wrap.append(el('p','hint','Enter the total from each three-coin throw: bottom line first. Heads=3, tails=2.'));
   for(let i=0;i<6;i++){
    const id='line-'+i;const label=el('label','',i===0?'Line 1 · bottom':i===5?'Line 6 · top':'Line '+(i+1));label.htmlFor=id;const s=el('select');s.id=id;s.className='line-input';
    for(const x of [6,7,8,9])s.add(new Option(x+' · '+({6:'changing yin',7:'stable yang',8:'stable yin',9:'changing yang'})[x],String(x)));
    s.value='7';wrap.append(label,s);
   }
  }else{
   for(let i=0;i<place.length;i++){
    const id='symbol-'+i;const l=el('label','',place[i]);l.htmlFor=id;const s=el('select');s.id=id;s.className='symbol-input';s.add(new Option('Choose '+(method==='tarot'?'a card':'a rune'),''));
    for(const x of catalog[method])s.add(new Option(x.name,x.id));wrap.append(l,s);
    if(method==='tarot'){const check=el('label','check');const c=el('input');c.type='checkbox';c.className='physical-reversed';check.append(c,document.createTextNode('Reversed'));wrap.append(check);}
   }
  }
 }
 $('#cast').textContent=physical?'Read my cast':method==='tarot'?'Draw the cards ✦':method==='runes'?'Cast the runes ᚷ':'Cast six lines ䷊';
 $('#basis-help').textContent=physical?'Your physical cast is preserved exactly as entered.':method==='iching'?'Three fair digital coins per line, cast from bottom to top. Changing lines and related figure are computed.':'A random digital draw, without replacement. Or enter your own physical cast.';
}
function addPlacement(){
 const n=$$('.placement').length;const id='placement-'+n+'-'+Date.now();const wrap=el('div','placement');
 const head=el('div','placement-head');head.append(el('span','','Known placement'),button('Remove',()=>{wrap.remove();if(!$$('.placement').length)addPlacement();}));
 wrap.append(head);
 const row=el('div','row');
 for(const [kind,values]of [['planet',Object.keys(planets)],['sign',Object.keys(signs)]]){
  const box=el('div');const label=el('label','',kind==='planet'?'Planet':'Sign');label.htmlFor=id+'-'+kind;const s=el('select');s.id=label.htmlFor;s.className=kind;s.add(new Option('Choose '+kind,''));for(const x of values)s.add(new Option(x,x));box.append(label,s);row.append(box);
 }
 const label=el('label','','House');label.htmlFor=id+'-house';const h=el('select');h.id=label.htmlFor;h.className='house';h.add(new Option('Unknown / not supplied',''));
 houses.forEach((x,i)=>h.add(new Option((i+1)+' · '+x,String(i+1))));wrap.append(row,label,h);$('#placements').append(wrap);
}
$$('[data-method]').forEach(b=>b.addEventListener('click',()=>{
 method=b.dataset.method;$$('[data-method]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));settings();
 if(active)say('Your previous reading stays on the table until you create another.');
}));
$('#reading-form').addEventListener('submit',e=>{
 e.preventDefault();$('#form-error').hidden=true;
 try{
  const question=$('#question').value.trim()||'What deserves my attention now?';let r;
  if(method==='astrology'){
   const results=$$('.placement').map(w=>({planet:w.querySelector('.planet').value,sign:w.querySelector('.sign').value,houseKnown:!!w.querySelector('.house').value,house:w.querySelector('.house').value?Number(w.querySelector('.house').value):null,system:$('#chart-system').value.trim(),source:$('#chart-source').value.trim()}));
   r=newRecord(method,question,'user-supplied','known-placements',results);
  }else{
   const physical=$('#mode').value==='physical',basis=physical?'user-supplied':'digital-random';
   if(method==='iching'){
    const lines=physical?$$('.line-input').map(x=>Number(x.value)):Array.from({length:6},()=>6+randomInt(2)+randomInt(2)+randomInt(2));
    decode(lines);r=newRecord(method,question,basis,'six-lines',lines);
   }else{
    const spread=$('#spread').value,pos=positions[spread];let results;
    if(physical)results=$$('.symbol-input').map((s,i)=>({id:s.value,position:pos[i],reversed:method==='tarot'?$$('.physical-reversed')[i].checked:false}));
    else results=sample(catalog[method],pos.length).map((x,i)=>({id:x.id,position:pos[i],reversed:method==='tarot'&&$('#reversals').checked?!!randomInt(2):false}));
    r=newRecord(method,question,basis,spread,results);
   }
  }
  active=validate(r);renderReading();say('Your reading is on the table. It has not been saved.');$('#reading-title').focus();
 }catch(err){$('#form-error').textContent=err.message;$('#form-error').hidden=false;$('#form-error').tabIndex=-1;$('#form-error').focus();}
});
function symbols(r){
 return r.results.map(x=>({entry:symbolFor(r.tradition,x),...x}));
}
function glyphLines(lines){
 const root=el('div','hex-lines');root.setAttribute('aria-hidden','true');
 for(const x of lines){const l=el('div','hex-line'+(x%2?' yang':'')+([6,9].includes(x)?' changing':''));l.append(el('span'));if(!(x%2))l.append(el('span'));root.append(l);}
 return root;
}
function hexPanel(entry,lines,label){
 const n=el('div','hex-panel');n.append(el('p','eyebrow',label),glyphLines(lines),el('h4','',entry.number+' · '+entry.name),el('p','hint',entry.meaning),el('p','hint',entry.reflection));return n;
}
function renderReading(){
 const r=active;const root=$('#reading');root.replaceChildren();
 root.append(el('p','eyebrow','YOUR '+r.tradition.toUpperCase()+' READING'));
 const title=el('h3','reading-title',r.question);title.id='reading-title';title.tabIndex=-1;root.append(title);
 const basis={'digital-random':'Random digital cast','user-supplied':'User-supplied cast or placements',illustrative:'Deliberate illustration'}[r.basis];
 root.append(el('p','reading-meta',basis+' · '+new Date(r.createdAt).toLocaleString()+' · Not saved automatically'));
 let thread='',prompt='';
 if(['tarot','runes'].includes(r.tradition)){
  const list=symbols(r),grid=el('div','spread'+(list.length===1?' one':''));root.append(grid);
  for(const x of list){
   const c=el('article','symbol-card'),face=el('div','symbol-face'),body=el('div','symbol-body');
   face.append(el('span','symbol-position',x.position),el('span','symbol-glyph',x.entry.glyph),el('strong','symbol-name',x.entry.name),el('span','orientation',r.tradition==='tarot'?(x.reversed?'Reversed':'Upright'):''));
   body.append(el('p','keywords',x.entry.keywords),el('p','',x.entry.meaning));
   if(x.reversed)body.append(el('p','hint','Reversed lens: consider where this theme may be blocked or turned inward.'));
   body.append(el('p','',x.reversed?'What would help this theme find a more workable expression?':x.entry.reflection));c.append(face,body);grid.append(c);
  }
  if(list.length===1){thread='Hold '+list[0].entry.name+' as a lens for your question. Notice one concrete place where its theme fits, and one where it does not.';prompt=list[0].entry.reflection;}
  else if(list.length!==3||!positions[r.spread]||list.some((x,i)=>x.position!==positions[r.spread][i])){thread=list.map(x=>x.entry.name+' at '+x.position+' invites attention to '+x.entry.keywords+'.').join(' ')+' Hold these as connected lenses for your question.';prompt='Which position offers the clearest next reflection?';}
  else if(r.spread==='choice'){thread='Read '+list[0].entry.name+' as the invitation and demands of Path A, and '+list[1].entry.name+' as those of Path B. '+list[2].entry.name+' asks what would support an informed choice. The cards offer perspectives, not a verdict on which future must happen.';prompt='Which path is more consistent with your values—and what could you learn before choosing?';}
  else{thread=list[0].entry.name+' sets the scene through '+list[0].entry.keywords+'. '+list[1].entry.name+' in tension asks where '+list[1].entry.keywords+' needs attention. '+list[2].entry.name+' offers a response: '+list[2].entry.meaning+' Let each position inform the others rather than treating them as separate predictions.';prompt='What small, reversible step would let you explore this pattern?';}
 }else if(r.tradition==='iching'){
  const d=decode(r.results),grid=el('div','hex-layout');grid.append(hexPanel(d.primary,d.lines,'PRIMARY FIGURE'));
  grid.append(hexPanel(d.related,d.lines.map(x=>x===6?7:x===9?8:x),d.changing.length?'RELATED FIGURE':'SAME FIGURE · NO CHANGES'));root.append(grid);
  root.append(el('p','hex-label','Bottom → top: '+d.lines.join(', ')+' · Changing lines: '+(d.changing.join(', ')||'none')));
  thread=d.changing.length?'The reading moves from '+d.primary.name+' toward the perspective of '+d.related.name+'. Attend to how '+d.primary.keywords+' may meet '+d.related.keywords+'. This is a view of movement, not a guaranteed outcome.':'With no changing lines, stay with '+d.primary.name+' and its question of '+d.primary.keywords+'.';
  prompt=d.primary.reflection;root.append(el('p','footnote','Original thematic commentary. For a classical changing-line reading, bring your preferred translation to your reader.'));
 }else{
  const list=el('div');root.append(list);
  for(const x of r.results){
   const n=el('article','library-entry');
   n.append(el('h4','',x.planet+' in '+x.sign+(x.houseKnown?' · House '+x.house:'')),el('p','',x.planet+' symbolises '+planets[x.planet]+'. '+x.sign+' offers a '+signs[x.sign]+' style'+(x.houseKnown?' in the arena of '+houses[x.house-1]:'. Its house remains unknown')+'.'),el('p','hint','System: '+(x.system||'not supplied')+' · Source: '+(x.source||'user-provided placement')));
   list.append(n);
  }
  thread='Use these supplied placements as a language for reflection. Notice where their styles cooperate and where they pull in different directions. The studio has not independently verified or calculated this chart.';
  prompt='How do these themes show up in your lived experience—and where do they fail to fit?';
 }
 const lens=el('div','reading-thread');lens.append(el('h4','','Hold the pattern'),el('p','',thread),el('p','',prompt));root.append(lens);
 const label=el('label','','Your reflection');label.htmlFor='notes';const notes=el('textarea');notes.id='notes';notes.rows=3;notes.maxLength=4000;notes.value=r.notes;notes.placeholder='What resonated? What would you like to revisit?';
 notes.addEventListener('input',()=>{active.notes=notes.value;});root.append(label,notes);
 const actions=el('div','actions');actions.append(button('Save to journal',save,'accent'),button('Deepen with AI',copyBrief),button('Export reading',()=>download(JSON.stringify(active,null,2),'oracle-reading-'+active.id+'.json','application/json')),button('Download AI brief',()=>download(brief(active),'oracle-reading-brief.txt','text/plain')),button('Print',()=>window.print()));root.append(actions);
 root.append(el('p','footnote','Saving keeps this reading in this browser. Export and AI brief include the question and reflection shown above; review them before sharing.'));
}
function download(text,name,type){
 const u=URL.createObjectURL(new Blob([text],{type}));const a=el('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);say('Export prepared. Your browser controls where the file is saved.');
}
async function copyBrief(){
 try{await navigator.clipboard.writeText(brief(active));say('Reading brief copied. Paste it into Nova or your chosen assistant to deepen this same reading.');}
 catch{say('Clipboard access is unavailable. Use Download AI brief, then open or attach that text in your assistant.');}
}
function readJournal(){
 const raw=localStorage.getItem(key);if(!raw)return [];
 const list=JSON.parse(raw);if(!Array.isArray(list)||list.length>100)throw Error('This journal could not be read. Export your active reading; existing stored data has been left untouched.');
 return list.map(validate);
}
function writeJournal(list){if(list.length>100)throw Error('The journal holds up to 100 readings. Export or remove an entry before saving another.');localStorage.setItem(key,JSON.stringify(list));}
function save(){
 try{const r=validate(active),list=readJournal();const i=list.findIndex(x=>x.id===r.id);if(i>=0)list[i]=r;else list.unshift(r);writeJournal(list);say('Saved in this browser journal. No automatic sharing.');}
 catch(e){say('Could not save: '+e.message+' Your active reading is still here and can be exported.');}
}
function renderJournal(){
 const root=$('#journal-list');root.replaceChildren();let list;
 try{list=readJournal();}catch(e){root.append(el('p','error','The saved journal is unavailable. Stored data has been left untouched. '+e.message));return;}
 if(!list.length){root.append(el('div','panel','Your journal is waiting for its first reading. Save a reading from the table when you want to return to it.'));return;}
 for(const r of list){
  const item=el('article','journal-entry');item.append(el('p','eyebrow',r.tradition.toUpperCase()+' · '+new Date(r.createdAt).toLocaleDateString()),el('h3','',r.question),el('p','',r.notes||'No reflection added yet.'));
  const actions=el('div','actions');actions.append(button('Return to this reading',()=>{active=validate(r);view('studio');renderReading();$('#reading-title').focus();say('Saved reading reopened. The cast has been preserved.');}),button('Export',()=>download(JSON.stringify(r,null,2),'oracle-reading-'+r.id+'.json','application/json')),button('Delete',()=>{
   try{const current=readJournal(),index=current.findIndex(x=>x.id===r.id);if(index<0)return;const deletion={record:current[index],index};current.splice(index,1);writeJournal(current);undo=deletion;$('#undo').hidden=false;renderJournal();say('Reading deleted from this journal. Undo is available.');}catch(e){say('Could not delete: '+e.message);}
  }));item.append(actions);root.append(item);
 }
}
$('#undo').addEventListener('click',()=>{
 if(!undo)return;try{const list=readJournal();if(!list.some(x=>x.id===undo.record.id))list.splice(Math.min(undo.index,list.length),0,undo.record);writeJournal(list);undo=null;$('#undo').hidden=true;renderJournal();say('Reading restored to your journal.');}catch(e){say('Could not restore: '+e.message);}
});
$('#import').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;try{
  if(f.size>100000)throw Error('Choose a single reading JSON file smaller than 100 KB.');
  const r=validate(JSON.parse(await f.text()));active=r;view('studio');renderReading();$('#reading-title').focus();say('Reading imported without saving. Its recorded basis has been preserved.');
 }catch(err){say('Import failed: '+err.message+' Your previous reading stays on the table.');}finally{e.target.value='';}
});
function renderLibrary(){
 const t=$('#library-method').value,q=$('#search').value.trim().toLocaleLowerCase();let entries;
 if(t==='astrology')entries=[...Object.entries(planets).map(([name,meaning])=>({name,meaning,glyph:'☉',keywords:'planet'})),...Object.entries(signs).map(([name,meaning])=>({name,meaning,glyph:'✧',keywords:'sign'}))];
 else entries=catalog[t];
 const visible=entries.filter(x=>(x.name+' '+x.keywords+' '+x.meaning).toLocaleLowerCase().includes(q)),root=$('#library-list');root.replaceChildren();
 $('#library-count').textContent=visible.length+' symbols'+(q?' matching your search':'');
 if(!visible.length)root.append(el('p','hint','No symbols match. Try another name or theme.'));
 for(const x of visible){const item=el('article','library-entry');item.append(el('span','symbol-glyph',x.glyph),el('h3','',x.name),el('p','keywords',x.keywords),el('p','',x.meaning));if(x.reflection)item.append(el('p','',x.reflection));root.append(item);}
}
$('#library-method').addEventListener('change',renderLibrary);$('#search').addEventListener('input',renderLibrary);
settings();
