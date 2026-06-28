/* ============================================================
   editor.js — logic for the visual site editor.
   Reads /data.js (window.SITE), renders forms, uploads media
   into assets/, and saves back to data.js via the local server.
   ============================================================ */

/* ---------- tiny DOM helper ---------- */
function h(tag, props, ...kids){
  const e = document.createElement(tag);
  if(props) for(const k in props){
    if(k === 'class') e.className = props[k];
    else if(k === 'html') e.innerHTML = props[k];
    else if(k.slice(0,2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), props[k]);
    else if(props[k] != null) e.setAttribute(k, props[k]);
  }
  kids.flat().forEach(k => { if(k==null||k===false) return; e.append(k.nodeType ? k : document.createTextNode(k)); });
  return e;
}
const input = (val,on,ph)=>h('input',{class:'in',type:'text',placeholder:ph||'',value:val==null?'':val,oninput:e=>on(e.target.value)});
const area  = (val,on,ph)=>{ const t=h('textarea',{class:'in',placeholder:ph||'',oninput:e=>on(e.target.value)}); t.value=val==null?'':val; return t; };
const field = (lab,node,hint)=>h('label',{class:'f'},h('span',{class:'lab'},lab),node,hint?h('div',{class:'hint'},hint):null);
function rowctl(arr,i,rerender){
  return h('div',{class:'rowctl'},
    h('button',{class:'mini',title:'Move up',onclick:()=>{if(i>0){[arr[i-1],arr[i]]=[arr[i],arr[i-1]];rerender();}}},'↑'),
    h('button',{class:'mini',title:'Move down',onclick:()=>{if(i<arr.length-1){[arr[i+1],arr[i]]=[arr[i],arr[i+1]];rerender();}}},'↓'),
    h('button',{class:'mini del',title:'Delete',onclick:()=>{if(confirm('Delete this item?')){arr.splice(i,1);rerender();}}},'✕')
  );
}
function toast(msg, err){ const t=document.getElementById('toast'); t.textContent=msg; t.className='toast show'+(err?' err':''); clearTimeout(toast._t); toast._t=setTimeout(()=>t.className='toast',2200); }

/* ---------- state ---------- */
const SRC = (window.SITE && JSON.parse(JSON.stringify(window.SITE))) || {};
SRC.projects=SRC.projects||[]; SRC.skills=SRC.skills||[]; SRC.roadmaps=SRC.roadmaps||[]; SRC.links=SRC.links||[];
const state = SRC;

/* ---------- media preview + upload ---------- */
function previewEl(path){
  const box = h('div',{class:'preview'});
  function fill(p){
    box.innerHTML='';
    if(!p){ box.classList.remove('on'); return; }
    const clean = p.trim().replace(/\\/g,'/');
    box.classList.add('on');
    if(/\.gif(\?|$)/i.test(clean)) box.append(h('img',{src:'/'+clean}));
    else box.append(h('video',{src:'/'+clean,muted:'',loop:'',autoplay:'',playsinline:''}));
  }
  fill(path);
  box.fill = fill;
  return box;
}
function uploadRow(obj, folder, accept, hint){
  const stat = h('div',{class:'upstat'});
  const box = previewEl(obj.video);
  const tx = input(obj.video, v=>{ obj.video=v; box.fill(v); });
  const file = h('input',{type:'file',accept:accept,style:'display:none',
    onchange:async e=>{
      const f=e.target.files[0]; if(!f) return;
      stat.className='upstat busy'; stat.textContent='Uploading '+f.name+' …';
      try{
        const buf=await f.arrayBuffer();
        const r=await fetch('/api/upload?folder='+folder+'&name='+encodeURIComponent(f.name),{method:'POST',body:buf});
        if(!r.ok) throw new Error('HTTP '+r.status);
        const j=await r.json();
        obj.video=j.path; tx.value=j.path; box.fill(j.path);
        stat.className='upstat ok'; stat.textContent='Saved → '+j.path+'  ('+Math.round(j.bytes/1024)+' KB)';
      }catch(err){
        stat.className='upstat busy'; stat.textContent='Upload needs the editor server (open-editor.bat). '+err.message;
      }
      e.target.value='';
    }});
  const btn = h('button',{class:'btn upbtn',type:'button',onclick:()=>file.click()},'⤓ Browse / Upload');
  return h('div',{},
    h('div',{class:'uprow'}, tx, btn),
    hint?h('div',{class:'hint'},hint):null,
    file, stat, box
  );
}

/* ---------- PROJECTS ---------- */
function renderProjects(){
  const root=document.getElementById('sec-projects'); root.innerHTML='';
  const arr=state.projects;
  root.append(h('div',{class:'sec-title'},'Projects ',h('span',{class:'ct'},'('+arr.length+')')));
  arr.forEach((p,i)=>{
    p.tech=p.tech||[];
    root.append(h('div',{class:'card'},
      rowctl(arr,i,renderProjects),
      h('div',{class:'cardhead'}, p.title||'Untitled project'),
      h('div',{class:'grid2'},
        field('Confidence chip', input(p.confidence,v=>p.confidence=v,'0.99')),
        field('Tag', input(p.tag,v=>p.tag=v,'flower-yolo · detection'))
      ),
      field('Title', input(p.title,v=>{p.title=v;const c=root.querySelectorAll('.card')[i];if(c)c.querySelector('.cardhead').textContent=v||'Untitled project';})),
      field('Description', area(p.description,v=>p.description=v)),
      field('Tech tags (comma-separated)', input(p.tech.join(', '),v=>p.tech=v.split(',').map(s=>s.trim()).filter(Boolean),'YOLOv11, OpenCV, Detection')),
      field('Demo video / gif', uploadRow(p,'videos','video/mp4,video/*,image/gif','Click Browse to upload an .mp4 or .gif — it saves into assets/videos/ and fills the path for you.')),
      h('div',{class:'grid2'},
        field('Code link (URL)', input(p.code,v=>p.code=v,'https://github.com/...'),'Leave blank to hide the code button'),
        field('Code button label', input(p.codeLabel,v=>p.codeLabel=v,'View code'))
      )
    ));
  });
  root.append(h('button',{class:'btn add',onclick:()=>{arr.push({confidence:'0.95',tag:'',title:'New project',description:'',tech:[],video:'',code:'',codeLabel:'View code'});renderProjects();}},'+ Add project'));
}

/* ---------- SKILLS ---------- */
function renderSkills(){
  const root=document.getElementById('sec-skills'); root.innerHTML='';
  const groups=state.skills;
  root.append(h('div',{class:'sec-title'},'Skills ',h('span',{class:'ct'},'('+groups.length+' groups)')));
  groups.forEach((g,gi)=>{
    g.items=g.items||[];
    const wrap=h('div',{class:'items'}, h('div',{class:'itemhead'},h('span',{},'Name'),h('span',{},'Logo slug'),h('span',{},'Badge'),h('span',{},'')));
    g.items.forEach((it,ii)=>{
      wrap.append(h('div',{class:'itemrow'},
        input(it.name,v=>it.name=v,'Python'),
        input(it.icon,v=>it.icon=v,'python'),
        input(it.mono,v=>it.mono=v,'PY'),
        h('button',{class:'mini del',title:'Remove',onclick:()=>{g.items.splice(ii,1);renderSkills();}},'✕')
      ));
    });
    wrap.append(h('button',{class:'btn add',onclick:()=>{g.items.push({name:'',icon:'',mono:''});renderSkills();}},'+ Add skill'));
    root.append(h('div',{class:'card group'},
      rowctl(groups,gi,renderSkills),
      h('div',{class:'cardhead'}, g.group||'Untitled group'),
      field('Group name', input(g.group,v=>g.group=v,'Computer Vision')),
      wrap
    ));
  });
  root.append(h('button',{class:'btn add',onclick:()=>{groups.push({group:'New group',items:[]});renderSkills();}},'+ Add skill group'));
}

/* ---------- ROADMAPS ---------- */
function renderRoadmaps(){
  const root=document.getElementById('sec-roadmaps'); root.innerHTML='';
  const arr=state.roadmaps;
  root.append(h('div',{class:'sec-title'},'Writing / Roadmaps ',h('span',{class:'ct'},'('+arr.length+')')));
  arr.forEach((r,i)=>{
    root.append(h('div',{class:'card'},
      rowctl(arr,i,renderRoadmaps),
      h('div',{class:'cardhead'}, r.title||'Untitled article'),
      h('div',{class:'grid3'},
        field('Number', input(r.num,v=>r.num=v,'01')),
        field('Badge', input(r.badge,v=>r.badge=v,'roadmap · 4 months')),
        field('Read time', input(r.readTime,v=>r.readTime=v,'~9 min'))
      ),
      field('Title', input(r.title,v=>r.title=v)),
      field('Blurb', area(r.blurb,v=>r.blurb=v)),
      h('div',{class:'grid2'},
        field('Source label', input(r.source,v=>r.source=v,'Medium /h7w')),
        field('Link (URL)', input(r.link,v=>r.link=v,'https://medium.com/...'))
      )
    ));
  });
  root.append(h('button',{class:'btn add',onclick:()=>{arr.push({num:String(arr.length+1).padStart(2,'0'),badge:'roadmap',title:'New article',blurb:'',source:'Medium /h7w',readTime:'~10 min',link:''});renderRoadmaps();}},'+ Add article'));
}

/* ---------- META + LINKS ---------- */
function renderMeta(){
  const root=document.getElementById('sec-meta'); root.innerHTML='';
  root.append(h('div',{class:'sec-title'},'Medium profile link'));
  root.append(h('div',{class:'card'},
    h('div',{class:'grid2'},
      field('Profile URL', input(state.mediumProfileUrl,v=>state.mediumProfileUrl=v,'https://medium.com/@rashesh369')),
      field('Shown text', input(state.mediumProfileLabel,v=>state.mediumProfileLabel=v,'medium.com/@rashesh369'))
    )
  ));
}
function renderLinks(){
  const root=document.getElementById('sec-links'); root.innerHTML='';
  const arr=state.links;
  root.append(h('div',{class:'sec-title'},'Contact links ',h('span',{class:'ct'},'('+arr.length+')')));
  arr.forEach((l,i)=>{
    root.append(h('div',{class:'card'},
      rowctl(arr,i,renderLinks),
      h('div',{class:'grid3'},
        field('Label', input(l.lk,v=>l.lk=v,'GitHub')),
        field('Shown text', input(l.lv,v=>l.lv=v,'@Rishabh-creator601')),
        field('URL', input(l.href,v=>l.href=v,'https://...  or  mailto:you@email.com'))
      )
    ));
  });
  root.append(h('button',{class:'btn add',onclick:()=>{arr.push({lk:'',lv:'',href:''});renderLinks();}},'+ Add link'));
}

function renderAll(){ renderProjects(); renderSkills(); renderRoadmaps(); renderMeta(); renderLinks(); }
renderAll();

/* ---------- build + save ---------- */
function build(){
  const header="/* =============================================================\n"+
    "   data.js — generated by the visual editor (editor/admin.html).\n"+
    "   ============================================================= */\n\n";
  return header + "window.SITE = " + JSON.stringify(state, null, 2) + ";\n";
}
async function saveToSite(){
  const text=build();
  try{
    const r=await fetch('/api/save',{method:'POST',body:text});
    if(!r.ok) throw new Error('HTTP '+r.status);
    toast('Saved to data.js ✓  — now commit & push to deploy');
  }catch(err){
    // fallback: download
    const blob=new Blob([text],{type:'text/javascript'});
    const a=h('a',{href:URL.createObjectURL(blob),download:'data.js'}); document.body.append(a); a.click(); a.remove();
    toast('No editor server — downloaded data.js instead', true);
  }
}
document.getElementById('save').onclick=saveToSite;
document.getElementById('download').onclick=()=>{
  const blob=new Blob([build()],{type:'text/javascript'});
  const a=h('a',{href:URL.createObjectURL(blob),download:'data.js'}); document.body.append(a); a.click(); a.remove();
  toast('data.js downloaded');
};
document.getElementById('reload').onclick=()=>{ if(confirm('Discard changes and reload from data.js?')) location.reload(); };
