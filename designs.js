/* PSYNC – schema options (four alternative casebook designs for the same amendment),
   the comparison map, and change requests (reject + say what to try). Loaded before app.js; initDesigns() is called from app.js. */

let TPS=[], A_SUG=[], C_SUG=[], D_SUG=[];
const PKU={id:'PKU',label:'PK Sampling ↻ (unscheduled)',grp:'Unscheduled',day:'',win:'',ps:1};
const CONT=t=>t.d<70?'V2':t.d<84?'V7':'V8';
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;');

function initDesigns(){
  [['SC-001','events'],['SC-002','events'],['SC-003','events'],['SC-004','scope'],['SC-005','form'],['SC-006','winDay'],['SC-007','win48'],['SC-008','winGap'],['SC-009','codelist'],['SC-010','cmp'],['SC-011','sdv']]
    .forEach(([id,r])=>SUG.find(s=>s.id===id).role=r);
  TPS=EV.filter(e=>e.sug); TPS.forEach(e=>{e.tp=1;e.sugA=e.sug;}); A_SUG=SUG.slice();
  const A=id=>A_SUG.find(s=>s.id===id), cl=(id,o)=>Object.assign({},A(id),o);
  const ctx=['V2','V2.1','V2.2','V2.3','V3','V7','V7.1','V7.2','V7.3','V8','V8.1','V9'];
  const scopeEv=[Q.fnE,Q.sub,Q.strat];
  const winTime=id=>({id,role:'winTime',cat:'Timing checks',type:'Time check',conf:'high',title:'144 h, 240 h and 480 h samples: check sample time ±24 hours',
    before:'—',after:'Sample time = dose start + nominal hours <b>± 24 h</b>',ev:[Q.w144],
    rule:'Rule:    PK_TIME_WINDOW\nIf       abs( PK.PKDTC − $EX.EXSTDTC − nominal hours ) > 24h   (144 h, 240 h, 480 h samples)\nThen     Open query "PK sample is outside the ± 24 h window (protocol 6.2.5)."',
    diff:[['Rule','PK_TIME_WINDOW','Added','—','Query when a 144 h, 240 h or 480 h sample is outside ±24 h']],
    why:'This option has no separate visit per sample, so there are no day windows to set. Every sample is checked against the sample-time windows in Section 6.2.5 instead. That also sidesteps the blank Day 76 cell in Table 1.'});
  C_SUG=[
   {id:'SC-C1',role:'cont',cat:'Forms',type:'Form change',conf:'high',title:'Make form PK repeating at Visits 2, 7 and 8, with one row per sample',
    before:'PK at V2, V7, V8: one sample each',after:'V2: <b>+ 48 h, 144 h, 240 h</b> · V7: <b>+ 48 h, 144 h, 240 h</b> · V8: <b>+ 480 h</b>',
    ev:[T(ctx,NEWV,{row:'PK'}),Q.tp],evs:NEWV,
    diff:[['Form','PK @ V2, V7, V8','Modified','Single form','Repeating form, up to 4 rows'],['Schedule','Events','Unchanged','11 events','11 events']],
    why:'Instead of adding visits, the extra samples are recorded as extra rows on the dosing visit they follow: Days 2, 6 and 10 under Visit 2, Days 72, 76 and 80 under Visit 7, Day 90 under Visit 8. The schedule itself does not change. The cost is that a form already holding data changes layout.'},
   {id:'SC-C2',role:'scope',cat:'Forms',type:'Rule',conf:'high',title:'Expect the extra rows only for the Mainland China PK subgroup',
    before:'—',after:'Extra PK rows are expected only when <b>RAND.PKSUB = Yes</b>',ev:scopeEv,
    rule:'Rule:    PK_ROWS_EXPECTED\nIf       $V2.RAND.PKSUB = "Yes"\nThen     Expected PK rows:  V2 = 4,  V7 = 4,  V8 = 2\nElse     Expected PK rows:  1 per visit',
    diff:[['Rule','PK_ROWS_EXPECTED','Added','—','Expect extra PK rows only when RAND.PKSUB = Yes']],
    why:'The footnote on the PK row limits these samples to the Mainland China PK subgroup. Without this rule the repeating form would ask every participant for rows they will never have.'},
   cl('SC-009',{id:'SC-C3'}),
   cl('SC-007',{id:'SC-C4',title:'48 h samples: check sample time ±1 hour',after:'48 h rows: <b>sample time = dose start + 48 h ± 1 h</b>',ev:[Q.w48],
     why:'Section 6.2.5 gives the 48 h sample a window in hours. The check is built on the actual sampling time, which the PK form already records.'}),
   winTime('SC-C5'),
   cl('SC-011',{id:'SC-C6',title:'Include the new PK rows in review plan "Critical Data – 100% SDV"',before:'PK @ 8 events: SDV required',after:'PK incl. <b>7 new rows</b>: SDV required',
     diff:[['Review plan','Critical Data – 100% SDV','Modified','PK @ 8 events','PK @ 8 events incl. new rows']]}),
  ];
  D_SUG=[
   {id:'SC-D1',role:'cont',cat:'Schedule',type:'New event group',conf:'high',title:'Add repeating event group “PK Sampling” (unscheduled), added by the site for each extra sample',
    before:'11 scheduled events',after:'11 scheduled events + <b>PK Sampling ↻</b> (site adds one per sample, up to 7)',
    ev:[T(ctx,NEWV),Q.tp],evs:NEWV,
    diff:[['Event group','PK Sampling (unscheduled, repeating)','Added','—','Repeat maximum 7']],
    why:'One reusable unscheduled visit instead of seven fixed ones. The site adds a PK Sampling visit each time it takes an extra sample. The build is small, but nothing is “expected”, so a missed sample does not show as overdue.'},
   {id:'SC-D2',role:'scope',cat:'Schedule',type:'Rule',conf:'high',title:'Allow PK Sampling visits only for the Mainland China PK subgroup',
    before:'—',after:'“Add PK Sampling” is offered only when <b>RAND.PKSUB = Yes</b>',ev:scopeEv,
    rule:'Rule:    PK_UNSCHED_ALLOWED\nIf       $V2.RAND.PKSUB = "Yes"\nThen     Enable unscheduled event group  PK Sampling\nElse     (not offered)',
    diff:[['Rule','PK_UNSCHED_ALLOWED','Added','—','Offer PK Sampling only when RAND.PKSUB = Yes']],
    why:'The footnote on the PK row limits these samples to the Mainland China PK subgroup, so other participants should not be offered the visit at all.'},
   cl('SC-005',{id:'SC-D3',title:'Assign form PK (Blood Sampling for PK) to the PK Sampling visit',before:'PK collected at 8 events',after:'PK collected at 8 events + <b>each PK Sampling visit</b>',
     diff:[['Schedule','PK @ PK Sampling','Added','—','PK form on each unscheduled PK visit']],
     why:'The existing PK form is reused unchanged on the new unscheduled visit.'}),
   cl('SC-009',{id:'SC-D4'}),
   cl('SC-007',{id:'SC-D5',title:'48 h samples: check sample time ±1 hour',after:'48 h samples: <b>sample time = dose start + 48 h ± 1 h</b>',ev:[Q.w48],
     why:'Section 6.2.5 gives the 48 h sample a window in hours. The check is built on the actual sampling time, which the PK form already records.'}),
   winTime('SC-D6'),
   cl('SC-011',{id:'SC-D7',title:'Include PK Sampling visits in review plan "Critical Data – 100% SDV"',after:'PK @ 8 events + <b>PK Sampling visits</b>: SDV required',
     diff:[['Review plan','Critical Data – 100% SDV','Modified','PK @ 8 events','PK @ 8 events + PK Sampling']]}),
  ];
}
const DESIGNS={
  A:{k:'A',name:'Separate PK visits, PK subgroup only',kind:'events',verdict:'rec',list:()=>A_SUG,
     short:'Seven new visits, one per sample day, created only for participants in the PK subgroup.',
     verdictWhy:'Mirrors Table 1 visit for visit, leaves every other participant and site untouched, and keeps windows and missed samples visible. It costs two extra rules.'},
  B:{k:'B',name:'Separate PK visits for every participant',kind:'events',all:true,verdict:'no',list:()=>A_SUG.filter(s=>s.role!=='scope'),
     short:'The same seven visits, but created for all participants at all sites. Simplest to build.',
     verdictWhy:'Goes against footnote e. Every participant outside the PK subgroup would show seven visits with nothing to collect, which means missing-data queries at every site.'},
  C:{k:'C',name:'Repeating PK form on existing visits',kind:'rows',retro:true,verdict:'ok',list:()=>C_SUG,
     short:'No new visits. Extra samples become extra rows on the PK form at Visits 2, 7 and 8.',
     verdictWhy:'Keeps the schedule unchanged, but a Day 10 sample is entered under the Day 0 visit, and a form that already holds data changes layout. Workable if avoiding new visits matters most.'},
  D:{k:'D',name:'Unscheduled PK visits added by the site',kind:'unsch',verdict:'ok',list:()=>D_SUG,
     short:'One reusable “PK Sampling” visit. The site adds one each time it takes an extra sample.',
     verdictWhy:'Smallest build, but nothing is expected in advance, so a missed sample never shows as overdue. Workable only with close monitoring.'},
};
const VERD={rec:['high','Recommended'],ok:['med','Workable, with trade-offs'],no:['dec','Not advised']};
const MATRIX=[
  ['Follows the protocol as written',{A:['ok','One visit per Table 1 column, subgroup only'],B:['bad','Ignores the PK-subgroup footnote'],C:['mid','Samples kept; visits not modelled'],D:['mid','Samples kept; schedule not enforced']}],
  ['Participants and sites outside the PK subgroup',{A:['ok','No change'],B:['bad','7 empty visits per participant'],C:['ok','No change'],D:['ok','No change']}],
  ['Clear for site staff entering data',{A:['ok','Visit list matches the visit calendar'],B:['mid','Extra visits to mark “did not occur”'],C:['bad','Day 6 and 10 samples sit under the Day 0 visit'],D:['mid','Site must add each visit itself']}],
  ['A missed sample is noticed',{A:['ok','Expected visit shows as overdue'],B:['ok','Expected visit shows as overdue'],C:['mid','Only a row count is expected'],D:['bad','Nothing is expected, so nothing is overdue']}],
  ['Timing checks',{A:['ok','Day windows, plus ±1 h on 48 h samples'],B:['ok','Day windows, plus ±1 h on 48 h samples'],C:['ok','Sample-time checks, ±1 h and ±24 h'],D:['ok','Sample-time checks, ±1 h and ±24 h']}],
  ['Data already entered',{A:['ok','Untouched; change is additive'],B:['ok','Untouched; change is additive'],C:['bad','PK form at V2, V7, V8 changes layout'],D:['ok','Untouched; change is additive']}],
  ['Build and upkeep',{A:['mid','7 events, 2 new rules'],B:['ok','7 events, 1 new rule'],C:['mid','1 form change, 3 new rules'],D:['ok','1 event group, 3 new rules']}],
];
const DES=()=>DESIGNS[S.design||'A'];
const rid=r=>{const s=SUG.find(x=>x.role===r);return s?s.id:null;};
const st=r=>{const i=rid(r);return i?S.dec[i]:'none';};
const okR=r=>st(r)==='accepted';
const r1=(...rs)=>rs.map(rid).find(Boolean)||SUG[0].id;
function applyDesign(k,quiet){ const d=DESIGNS[k]; S.design=k; S.schedK=k; SUG.length=0; d.list().forEach(s=>SUG.push(s));
  S.dec={}; S.opt={}; S.why={}; SUG.forEach(s=>S.dec[s.id]='pending'); S.val=null; S.sel=SUG[0].id;
  TPS.forEach(e=>e.sug=d.kind==='events'?e.sugA:rid('cont'));
  log(`Schema option ${k} chosen: ${d.name}`,'',quiet?ME.sponsor:null); aiLog(`Drafted ${SUG.length} schema changes for Option ${k} (AI-03). Draft only: each one waits for a person’s decision`,'',{p:44}); }

/* ---------- option cards, map ---------- */
function dia(k){ const n=(t,c)=>`<span class="${c||''}">${t}</span>`, g='new', d=DESIGNS[k];
  const body=d.kind==='events'?`${n('V2')}${n('V2.1',g)}${n('V2.2',g)}${n('V2.3',g)}${n('V3–V6')}${n('V7')}${n('V7.1',g)}${n('V7.2',g)}${n('V7.3',g)}${n('V8')}${n('V8.1',g)}${n('V9')}`
    :d.kind==='rows'?`${n('V2 <b>+3 rows</b>',g)}${n('V3–V6')}${n('V7 <b>+3 rows</b>',g)}${n('V8 <b>+1 row</b>',g)}${n('V9')}`
    :`${n('V2')}${n('V3–V6')}${n('V7')}${n('V8')}${n('V9')}${n('PK Sampling ↻ ×7',g)}`;
  return `<div class="muted" style="font-size:12px;margin-top:4px">${d.all?'Created for <b>every</b> participant':'For PK-subgroup participants only'}</div>`; }
function optNums(k){ const d=DESIGNS[k], act=x=>x.d!=='DONE', nPk=total(s=>s.subs.filter(x=>x.pk===true&&act(x)).length), nAll=total(s=>s.subs.filter(act).length), cn=SITES.filter(s=>s.cn).length;
  return [['New visits in the schedule',d.kind==='events'?7:d.kind==='rows'?0:'1 (repeating)'],['Participants who see a change',d.all?`${nAll} (all)`:`${nPk} (PK subgroup)`],['Sites with a change in data entry',d.all?`${SITES.length} of ${SITES.length}`:`${cn} of ${SITES.length}`]]; }
function fold(key,title,body,pad){ const o=S.open[key];
  return `<div class="card fold ${o?'open':''}"><h2 ${h(()=>{S.open[key]=!o})}><span class="tw">${o?'▾':'▸'}</span>${title}</h2>${o?`<div class="bd"${pad===0?' style="padding:0"':''}>${body}</div>`:''}</div>`; }
function vOptions(){ const lock=!!S.signed, cur=S.design, mk={ok:'ok',mid:'warn',bad:'bad'};
  const card=k=>{const d=DESIGNS[k],v=VERD[d.verdict],on=cur===k;return `<div class="opt ${on?'on':''}">
    <div class="oh"><h3>${d.name}</h3><span class="pill ${v[0]}">${on?'Chosen · ':''}${v[1]}</span></div>
    <p>${d.short}</p>${dia(k)}
    <table class="mini">${optNums(k).map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
    <div class="of">${on?`<span class="dstat accepted">Chosen</span> <a ${h(()=>{S.sTab='changes'})}>Review its ${SUG.length} changes</a>`
      :`<button class="btn ${d.verdict==='rec'?'pri':''}" ${lock?'disabled':h(()=>{applyDesign(k)})}>Choose option ${k}</button>`}</div></div>`;};
  return `${lock?`<div class="note green">${icon('ok')}<div>Casebook version 2 was approved with <b>Option ${cur}</b>. The choice is locked.</div></div>`:''}
  ${fold('fopt','Schema options'+(cur?` <span class="muted">· Option ${cur} chosen</span>`:''),`<div class="opts4">${Object.keys(DESIGNS).map(card).join('')}</div>
  ${lock?'':`<div class="decide" style="border-top:0;padding-top:0;margin:0">
    ${cur?`<button class="btn pri" ${h(()=>{S.sTab='changes'})}>Continue with Option ${cur}: review ${SUG.length} changes</button>`:`<button class="btn pri" ${h(()=>{applyDesign('A');S.sTab='changes'})}>Accept the recommendation (Option A) and continue</button>`}
    <button class="btn" ${h(()=>crModal({about:'Schema options',title:'None of these fit: request changes',intro:'Say what does not work and what should be tried. The request goes to the study build team and is recorded in the audit trail.',ret:true}))}>None of these fit: request changes…</button></div>`}`)}
  ${fold('fcmp','How the options compare',`<table class="v map"><tr><th style="width:21%">What matters</th>${Object.keys(DESIGNS).map(k=>`<th class="${cur===k?'cur':''}">Option ${k}</th>`).join('')}</tr>
    ${MATRIX.map(r=>`<tr><td>${r[0]}</td>${Object.keys(DESIGNS).map(k=>`<td class="${cur===k?'cur':''}">${r[1][k][1]}</td>`).join('')}</tr>`).join('')}</table>
    <div class="whyopt"><h3>Why Option A, and why not the others</h3><ul class="clean plain">${Object.keys(DESIGNS).map(k=>`<li><div><b>Option ${k} · ${VERD[DESIGNS[k].verdict][1]}.</b> ${DESIGNS[k].verdictWhy}</div></li>`).join('')}</ul></div>`,0)}`; }

/* ---------- change requests ---------- */
function addCR(o){ const m=me(), c=Object.assign({id:'CR-'+String(S.cr.length+1).padStart(3,'0'),at:now(),u:m.n,o:m.o,status:'Open'},o); S.cr.unshift(c);
  log(`Change request ${c.id} about ${c.about}: “${c.problem.slice(0,90)}”${c.ask?' · Asked for: “'+c.ask.slice(0,70)+'”':''}`,c.site||'',null,c.sug?{sug:c.sug}:null); return c; }
function crModal(o){
  $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:600px"><h2>${o.title}</h2><div class="bd"><p style="margin-top:0">${o.intro}</p>
    <div class="fld"><label>What does not work?</label><textarea id="crp" class="req" rows="3" placeholder="e.g. Our sites cannot schedule a Day 2 visit; participants stay overnight after the first dose."></textarea></div>
    <div class="fld"><label>What should be changed or tried instead?</label><textarea id="cra" rows="3" placeholder="e.g. Record the 48 h sample as part of Visit 2 and keep separate visits for Day 6 and Day 10."></textarea></div>
    <div class="fld"><label>Send to</label><select id="crt">${(o.to||['Sponsor study build team','PSYNC: redraft with this feedback','CRO clinical site manager']).map(x=>`<option>${x}</option>`).join('')}</select></div></div>
    <div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" ${h(()=>{const p=$('crp').value.trim(); if(!p) return toast('Say what does not work so the next person can act on it');
      const c=addCR({about:o.about,problem:esc(p),ask:esc($('cra').value.trim()),to:$('crt').value,site:o.site,sug:o.sug}); if(o.ret) S.ret=c.id; if(o.after) o.after(c); closeM(); toast(`${c.id} sent to ${c.to}`);})}>Send request</button></div></div></div>`;
  $('crp').focus(); return false; }
function replyModal(c){ $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:560px"><h2>Reply to ${c.id}</h2><div class="bd"><p style="margin-top:0"><b>${c.u} (${c.o}):</b> ${c.problem}${c.ask?`<br><span class="muted">Asked for:</span> ${c.ask}`:''}</p>
    <div class="fld"><label>Your reply</label><textarea id="crr" class="req" rows="3" placeholder="What was changed, or why it stays as it is."></textarea></div></div>
    <div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" ${h(()=>{const v=$('crr').value.trim(); if(!v) return toast('Write a reply before resolving');
      c.status='Resolved'; c.reply=esc(v); c.rby=me().n; c.rat=now(); if(S.ret===c.id) S.ret=null; log(`Change request ${c.id} resolved: “${v.slice(0,90)}”`,c.site||''); closeM();})}>Reply and resolve</button></div></div></div>`; $('crr').focus(); return false; }
function crTable(f){ const l=S.cr.filter(f||(()=>true));
  return `<table class="v"><tr><th>ID</th><th>Raised by</th><th>About</th><th>What does not work</th><th>What to try instead</th><th>Sent to</th><th>Status</th><th></th></tr>
  ${l.map(c=>`<tr><td class="nw"><b>${c.id}</b><div class="muted" style="font-size:12px">${c.at}</div></td><td class="nw">${c.u}<div class="muted" style="font-size:12px">${c.o}${c.site?' · '+c.site:''}</div></td>
    <td>${c.sug&&sug(c.sug)?`<a ${h(()=>changeCard(c.sug))}>${c.about}</a>`:c.about}</td><td>${c.problem}</td><td>${c.ask||'<span class="muted">—</span>'}</td><td>${c.to}</td>
    <td>${c.status==='Open'?'<span class="pill med">Open</span>':`<span class="pill solid">Resolved</span><div style="margin-top:4px">${c.reply}</div><div class="muted" style="font-size:12px">${c.rby}, ${c.rat}</div>`}</td>
    <td class="nw">${c.status==='Open'&&S.role!=='site'?`<button class="btn sm" ${h(()=>replyModal(c))}>Reply and resolve…</button>`:''}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">No change requests yet. Anyone reviewing the amendment can raise one when something does not work.</td></tr>'}</table>`; }
const openCR=()=>S.cr.filter(c=>c.status==='Open').length;
const vFeedback=()=>`<div class="ph"><div><h1>Change Requests</h1><div class="sub">Where sponsor, CRO and site reviewers say what does not work and what should be tried instead. Every request and reply is in the audit trail.</div></div>
  <div class="acts"><button class="btn pri" ${h(()=>crModal({about:'Amendment 1 (general)',title:'Raise a change request',intro:'Describe the problem and what you would like tried instead.'}))}>+ New change request</button></div></div>${crTable()}`;
