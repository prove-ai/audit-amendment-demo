/* Audit – feature modules: dates, site tasks, messages, Data Entry preview with live rules,
   study-object browser, audit chain + export, inspection packet, guided walkthrough. Loaded after app.js. */

/* ================= Dates ================= */
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pd=s=>{const p=s.split(' ');return new Date(+p[2],MON.indexOf(p[1]),+p[0]);};
const fd=d=>`${String(d.getDate()).padStart(2,'0')} ${MON[d.getMonth()]} ${d.getFullYear()}`;
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isoT=d=>`${iso(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const addBD=(s,n)=>{const d=pd(s);while(n>0){d.setDate(d.getDate()+1);if(d.getDay()%6)n--;}return fd(d);};
const TODAY=pd('16 Jun 2017');

/* ================= Site readiness tasks ================= */
function siteTasks(s){
  const due=n=>s.irb?addBD(s.irb,n):`EC approval + ${n} business days`, x=stats(s);
  const T=s.cn?[
    ['rc','Study Coordinator',`Re-consent ${x.aff} PK-subgroup participant(s) on ICF v2.0`,'Before each participant’s next PK sample',r1('scope')],
    ['trn','Study Coordinator','Brief site staff on the 7 new PK samples and their sampling windows (protocol 6.2.5)',due(5),r1('win48')],
    ['kit','Laboratory','Confirm PK sample kits for 7 extra timepoints per PK participant',due(5),r1('form','cont')],
    ['src','Study Coordinator','Update source worksheets and visit checklists for Days 2, 6, 10, 72, 76, 80, 90',due(5),r1('events','cont')],
    ['pi','Principal Investigator','PI review of the amended visit schedule',due(2),r1('events','cont')]]
   :[['inf','Study Coordinator','Inform site staff that Protocol Ver. 1.1 does not change data entry at this site',due(5),r1('scope')]];
  return T.map(t=>Object.assign({k:t[0],role:t[1],title:t[2],due:t[3],sug:t[4],st:'todo'},S.task[s.id+t[0]]||{}));
}
const tasksDone=s=>siteTasks(s).every(t=>t.st==='done');
function proofModal(s,t){
  $('layer').innerHTML=`<div class="ovl"><div class="modal"><h2>Mark task as done</h2><div class="bd"><p style="margin-top:0"><b>${t.title}</b></p>
    <div class="fld"><label>Proof note (required)</label><input id="proof" class="req" placeholder="e.g. Training log signed by 4 staff, filed in ISF section 8"></div>
    <div class="fld"><label>Attach evidence (optional)</label><input id="pfile" type="file"></div></div>
    <div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" ${h(()=>{const v=$('proof').value.trim(); if(!v) return toast('A proof note is required to close a task');
      const f=$('pfile').files[0]; S.task[s.id+t.k]={st:'done',proof:v+(f?` · 📎 ${f.name}`:''),by:me().n,at:now()}; log(`Task done: ${t.title}. Proof: ${v}`,s.id,null,{sug:t.sug}); closeM();})}>Mark done</button></div></div></div>`;
  $('proof').focus(); return false; }
function tasksTable(s,edit){
  const lab={todo:'<span class="pill gray">Not started</span>',prog:'<span class="pill blue">In progress</span>',done:'<span class="pill solid">Done</span>'};
  return `<table class="v"><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Proof</th><th>Caused by</th><th></th></tr>${siteTasks(s).map(t=>`<tr>
    <td>${t.title}</td><td class="nw">${t.role}</td><td class="nw">${t.due}</td><td class="nw">${lab[t.st]}</td>
    <td>${t.proof?`${t.proof}<div class="muted" style="font-size:12px">${t.by}, ${t.at}</div>`:'<span class="muted">—</span>'}</td>
    <td class="nw"><a ${h(()=>changeCard(t.sug))}>${t.sug}</a></td>
    <td class="nw">${edit?(t.st==='todo'?`<button class="btn sm" ${h(()=>{S.task[s.id+t.k]={st:'prog'};log(`Task started: ${t.title}`,s.id);})}>Start</button> `:'')+(t.st!=='done'?`<button class="btn sm pri" ${h(()=>proofModal(s,t))}>Mark done…</button>`:`<a ${h(()=>{S.task[s.id+t.k]={st:'prog'};log(`Task reopened: ${t.title}`,s.id);})}>Reopen</a>`)
      :t.st!=='done'?`<a ${h(()=>{log(`Reminder sent to site: ${t.title}`,s.id);return toast('Reminder sent to '+s.coord);})}>Send reminder</a>`:''}</td></tr>`).join('')}</table>`;
}
/* read-only card for a change, usable from any role */
function changeCard(id){ const s=sug(id); if(!s) return toast(id+' belonged to a schema option that is no longer selected');
  $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:860px"><h2>${s.id} ${confPill(s.conf)} <span class="dstat ${S.dec[s.id]}">${decTxt(S.dec[s.id])}</span><a ${h(closeM)}>Close ✕</a></h2><div class="bd detail">
    <h3>${s.title}</h3><div class="muted">${s.cat} · ${s.type} · <span class="assist">Drafted by AI</span></div>
    ${trustRecord(s)}</div></div></div>`; return false; }

/* ================= Messages (site ⇄ CRO) ================= */
function thread(s){ const l=S.msg[s.id]||[], site=S.role==='site';
  if(site) l.forEach(m=>{ if(m.o==='CRO') m.seen=1; }); else l.forEach(m=>{ if(m.o!=='CRO') m.seen=1; });
  return `<div class="card"><h2>${site?'Ask the CRO about this change':'Messages with '+s.id}</h2><div class="bd">
    ${l.length?l.map(m=>`<div style="margin-bottom:9px"><b>${m.u}</b> <span class="muted">· ${m.o} · ${m.at}</span><div>${m.x}</div></div>`).join(''):`<div class="muted" style="margin-bottom:9px">No messages yet.</div>`}
    <div style="display:flex;gap:8px"><input id="msgin" style="flex:1;padding:6px 8px;border:1px solid #bbb;border-radius:2px" placeholder="${site?'e.g. Participant CN101-003 has not re-consented. Can we still take the Day 10 sample?':'Reply to the site…'}">
    <button class="btn pri" ${h(()=>{const v=$('msgin').value.trim(); if(!v) return false; (S.msg[s.id]=S.msg[s.id]||[]).push({u:me().n,o:me().o,at:now(),x:v.replace(/</g,'&lt;')}); log(`Message ${site?'to CRO':'to site'}: “${v.slice(0,80)}”`,s.id);})}>Send</button></div></div></div>`; }
const unseen=(s,forSite)=>(S.msg[s.id]||[]).filter(m=>!m.seen&&(forSite?m.o==='CRO':m.o!=='CRO')).length;

/* ================= Data Entry preview (live rules) ================= */
const PKTPT=[['Pre-dose',0],['0.5 h',0.5],['1 h',1],['2 h (end of infusion)',2],['6 h',6],['48 h',48,1],['144 h',144,1],['240 h',240,1],['336 h',336],['480 h',480,1],['840 h',840]];
function edcCtx(){ const s=site(S.edc.site), x=s.subs.find(q=>q.id===S.edc.sub)||s.subs.find(q=>q.pk===true)||s.subs[0], D=DES();
  const v2=S.edc.prev||!!S.dep[s.id], day=x.d==='SCR'?null:x.d==='DONE'?110:x.d, rand=day===null?null:addDays(TODAY,-day), mine=pkOnly()?x.pk===true:true;
  const live=t=>v2&&mine&&S.dec[t.sug]!=='rejected';
  const evs=EV.filter(e=>!e.tp||(D.kind==='events'&&live(e))); if(D.kind==='unsch'&&v2&&mine&&rand&&st('cont')!=='rejected') evs.push(PKU);
  const rows=e=>D.kind==='rows'?TPS.filter(t=>live(t)&&CONT(t)===e.id):D.kind==='unsch'&&e.ps?TPS.filter(live):[];
  return {s,x,v2,day,rand,evs,rows}; }
function pkRef(e,rand){ const last=e.d>=70, dose=addDays(rand,last?70:0); dose.setHours(9,0,0,0); const hrs=(e.d-(last?70:0))*24;
  return {dose,hrs,label:last?'6th dose (Visit 7, Day 70)':'1st dose (Visit 2, Day 0)',nom:new Date(dose.getTime()+hrs*36e5)}; }
function evWindow(e){ if(e.ps) return null; if(!e.tp) return e.win?+e.win.slice(1):null; if(DES().kind!=='events'||e.h48) return null;
  if(e.gap) return okR('winGap')?({pm1:1,exact:0}[S.opt[rid('winGap')]]??null):null; return st('winDay')==='rejected'?null:+e.win.slice(1); }
const fkey=(x,e,t)=>x.id+'|'+e.id+'|'+(t===e?'':t.id);
function savePk(c,e,t){ const r=pkRef(t,c.rand), ed=new Date($('f_ed').value+'T00:00'), sdt=new Date($('f_sdt').value), tp=$('f_tp').value, q=[];
  const w=t===e?evWindow(e):null, planned=addDays(c.rand,t.d), off=Math.round((ed-planned)/864e5), dh=(sdt-r.dose)/36e5-r.hrs;
  if(!tp) q.push(['Required','Nominal timepoint is required.',null]);
  if(w!==null&&Math.abs(off)>w) q.push(['Event date window',`Event date is ${Math.abs(off)} day(s) ${off>0?'after':'before'} Day ${t.d}; allowed window is ${w?'±'+w+' day(s)':'the exact day'}.`,t.gap?rid('winGap'):t.tp?rid('winDay'):null]);
  if(t.tp&&t.h48&&rid('win48')&&st('win48')!=='rejected'&&Math.abs(dh)>1) q.push(['PK_48H_WINDOW',`PK sample is outside the 48 h ± 1 h window (protocol 6.2.5): taken ${Math.abs(dh).toFixed(1)} h ${dh>0?'late':'early'}.`,rid('win48')]);
  if(t.tp&&!t.h48&&rid('winTime')&&st('winTime')!=='rejected'&&Math.abs(dh)>24) q.push(['PK_TIME_WINDOW',`PK sample is outside the ${r.hrs} h ± 24 h window (protocol 6.2.5): taken ${Math.abs(dh).toFixed(0)} h ${dh>0?'late':'early'}.`,rid('winTime')]);
  const first=pkRef(EV[3],c.rand).dose; if(sdt<first&&(!t.tp||st('cmp')!=='rejected')&&t.d>0) q.push(['CMP_PK_01','PK sample date is before the first dose date.',t.tp?rid('cmp'):null]);
  S.form[fkey(c.x,e,t)]={ed:$('f_ed').value,sdt:$('f_sdt').value,tp,q,at:now()};
  log(`PK form submitted at ${e.ps?'PK Sampling':e.id}${t===e?'':' (Day '+t.day+' sample)'} for ${c.x.id}: ${q.length?q.length+' query(ies) opened ('+q.map(z=>z[0]).join(', ')+')':'no queries'}`,c.s.id,{n:c.s.coord,o:'Site '+c.s.id},q[0]&&q[0][2]?{sug:q[0][2]}:null);
}
function vEdc(){
  const c=edcCtx(), {s,x}=c, D=DES(); S.edc.sub=x.id;
  if(!c.evs.some(e=>e.id===S.edc.ev)) S.edc.ev=(c.evs.find(e=>e.tp||e.ps)||c.evs.find(e=>c.rows(e).length)||c.evs.find(e=>e.d!==undefined&&e.d>=(c.day||0))||c.evs[0]).id;
  const e=c.evs.find(q=>q.id===S.edc.ev), rows=c.rows(e), t=rows.find(r=>r.id===S.edc.row)||(e.ps?rows[0]:e)||e, nw=q=>q.tp||q.ps;
  const forms=e.ps?FORMS.filter(f=>f[0]==='PK'):FORMS.filter(f=>f[2].includes(e.id)), past=c.day!==null&&e.d!==undefined&&e.d<=c.day;
  const evRow=q=>{ const done=c.day===null?q.d===undefined&&x.d!=='SCR'&&!q.ps:(!q.ps&&(q.d===undefined||q.d<=c.day)), sv=Object.keys(S.form).filter(k=>k.startsWith(x.id+'|'+q.id+'|')).map(k=>S.form[k]);
    return `<tr class="click ${q.id===e.id?'sel':''}" ${h(()=>{S.edc.ev=q.id;S.edc.row=null})}><td class="nw">${sv.length?(sv.some(v=>v.q.length)?icon('bad'):icon('ok')):done&&!nw(q)?'<span class="chk">●</span>':'○'} <b>${q.ps?'PK':q.id}</b>${nw(q)?' <span class="new">NEW</span>':c.rows(q).length?` <span class="new" style="background:var(--green)">+${c.rows(q).length} rows</span>`:''}</td><td>${q.label}</td><td class="nw muted">${q.ps?'as needed':c.rand&&q.d!==undefined?fd(addDays(c.rand,q.d)):q.day||'—'}</td></tr>`; };
  let formBody;
  if(c.rand===null) formBody=`<div class="note blue"><div>This participant is in screening and not yet randomised. The new PK samples apply from randomisation, and only if they are assigned to the PK subgroup.</div></div>`;
  else if(!forms.some(f=>f[0]==='PK')) formBody=`<div class="muted">Forms at this event are unchanged by the amendment: ${forms.map(f=>f[1]).join(', ')}.</div>`;
  else { const r=pkRef(t,c.rand), sv=S.form[fkey(x,e,t)], w=t===e?evWindow(e):null, newTp=st('codelist')!=='rejected';
    const tps=PKTPT.filter(p=>!p[2]||(c.v2&&newTp)), def=(PKTPT.find(p=>p[1]===r.hrs&&tps.includes(p))||[''])[0];
    const timeChk=t.tp&&(t.h48?rid('win48')&&st('win48')!=='rejected':rid('winTime')&&st('winTime')!=='rejected');
    formBody=`<div class="kv" style="grid-template-columns:230px 1fr;gap:9px 12px;align-items:center">
      ${rows.length?`<dt>Sample being recorded</dt><dd><select id="f_row" style="padding:4px">${e.ps?'':'<option value="">Scheduled sample at this visit</option>'}${rows.map(q=>`<option value="${q.id}" ${q===t?'selected':''}>Day ${q.day} · ${pkRef(q,c.rand).hrs} h after the ${q.d>=70?'6th':'1st'} dose</option>`).join('')}</select> <span class="pill high">${D.kind==='rows'?'new rows in v2':'unscheduled visit'}</span></dd>`:''}
      <dt>${e.ps?'Visit date':'Event date'}</dt><dd><input id="f_ed" type="date" value="${sv?sv.ed:iso(addDays(c.rand,t.d))}" style="padding:4px"> <span class="muted">planned Day ${t.d} = ${fd(addDays(c.rand,t.d))} · day window ${w===null?(timeChk?'none (sample-time check instead)':'not defined'):w?'±'+w+' day(s)':'exact day'}</span></dd>
      <dt>Reference dose start</dt><dd><b>${fd(r.dose)} 09:00</b> <span class="muted">${r.label}, from the IMP Administration form</span></dd>
      <dt>Nominal timepoint (PKTPT)</dt><dd><select id="f_tp" style="padding:4px"><option value="">— select —</option>${tps.map(p=>`<option ${(sv?sv.tp:def)===p[0]?'selected':''}>${p[0]}</option>`).join('')}</select>${t.tp&&!def?' <span class="pill dec">codelist has no entry for this timepoint</span>':''}</dd>
      <dt>Actual sample date and time</dt><dd><input id="f_sdt" type="datetime-local" value="${sv?sv.sdt:isoT(r.nom)}" style="padding:4px"> <span class="muted">nominal = dose start + ${r.hrs} h${timeChk?' · allowed ± '+(t.h48?'1 h':'24 h'):''}</span></dd></div>
      <div class="decide"><button class="btn pri" ${h(()=>savePk(c,e,t))}>Save and Submit</button><span class="muted">${t.tp&&t.h48?'Try it: move the sample time two hours later and submit.':t.tp&&w!==null?'Try it: move the event date outside the window and submit.':t.tp&&timeChk?'Try it: move the sample time two days later and submit.':''}</span></div>
      ${sv?(sv.q.length?sv.q.map(z=>`<div class="note" style="background:var(--red-soft);border-color:#eab8b0;margin:10px 0 0">${icon('bad')}<div><b>Query opened · ${z[0]}</b><br>${z[1]} ${z[2]?`<a ${h(()=>changeCard(z[2]))}>Why this rule exists (${z[2]})</a>`:''}</div></div>`).join('')
        :`<div class="note green" style="margin:10px 0 0">${icon('ok')}<div><b>Submitted ${sv.at}.</b> No queries.</div></div>`):''}`; }
  return `<div class="ph"><div><div style="font-size:12px;margin-bottom:2px"><a ${go('cro','site',{croSite:s.id,siteTab:'subjects'})}>‹ ${s.id} · ${s.name}</a></div><h1>${x.id} <span class="muted" style="font-weight:normal;font-size:14px">${x.d==='SCR'?'Screening':x.d==='DONE'?'Completed':'Study day '+x.d}${x.pk===true?' · PK subgroup':''}</span></h1></div>
      <span class="pill ${c.v2?'solid':'gray'}">CASEBOOK VERSION ${c.v2?'2 · OPTION '+D.k:1}</span>
      <div class="acts">${S.dep[s.id]?'':`<div class="seg"><button class="${S.edc.prev?'':'on'}" ${h(()=>{S.edc.prev=false})}>Version 1 (live)</button><button class="${S.edc.prev?'on':''}" ${h(()=>{S.edc.prev=true})}>Preview version 2</button></div>`}
        <select id="edcsub" style="padding:4px">${s.subs.map(q=>`<option value="${q.id}" ${q.id===x.id?'selected':''}>${q.id}${q.pk===true?' (PK)':''}</option>`).join('')}</select></div></div>
    ${!S.dep[s.id]&&S.edc.prev?`<div class="note">${icon('warn')}<div>Preview only. Version 2 is not active at ${s.id}; nothing entered here would be saved in production.</div></div>`:''}
    ${c.v2&&x.pk!==true&&pkOnly()&&x.d!=='SCR'?`<div class="note blue"><div>This participant is not in the PK subgroup, so version 2 looks the same as version 1 for them.</div></div>`:''}
    <div class="split" style="grid-template-columns:minmax(340px,.8fr) 1.4fr"><div><table class="v"><tr><th>Event</th><th>Label</th><th>Planned</th></tr>${c.evs.map(evRow).join('')}</table></div>
    <div class="card"><h2>${e.ps?'PK Sampling (unscheduled)':e.id+' · '+e.label} ${nw(e)?'<span class="new">NEW IN V2</span>':rows.length?'<span class="new" style="background:var(--green)">PK FORM NOW REPEATING</span>':''}${past&&e.tp?'<span class="pill gray">Already passed · not expected</span>':''}</h2><div class="bd">
      <div class="tabs" style="margin-bottom:12px">${forms.map(f=>`<button class="${f[0]==='PK'||!forms.some(g=>g[0]==='PK')&&f===forms[0]?'on':''}">${f[1]}</button>`).join('')}</div>${formBody}</div></div></div>`;
}
document.addEventListener('change',e=>{ if(e.target.id==='f_row'){S.edc.row=e.target.value||null;render();} });
document.addEventListener('change',e=>{ if(e.target.id==='edcsub'){S.edc.sub=e.target.value;S.edc.ev=null;render();} });
const openEdc=(sid,sub)=>go('edc',null,{edc:{site:sid,sub:sub||null,ev:null,prev:false}});

/* ================= Study object browser (Studio left nav) ================= */
const stPill=v=>v==='base'||v==='none'?'<span class="muted">Unchanged</span>':v==='accepted'?'<span class="pill high">New in v2</span>':v==='rejected'?'<span class="pill gray">Rejected</span>':'<span class="pill med">Proposed</span>';
const modPill=r=>st(r)==='pending'?'<span class="pill med">Change proposed</span>':okR(r)?'<span class="pill blue">Modified in v2</span>':'<span class="muted">Unchanged</span>';
const evShown=()=>(DES().kind==='events'?EV:EV.filter(e=>!e.tp)).concat(DES().kind==='unsch'?[PKU]:[]);
const OBJ={
  groups:{t:'Event Groups',h:['Name','Events in v1','Events in v2','Change'],rows:()=>['Run-in','Screening','Treatment','Follow-up'].concat(DES().kind==='unsch'?['Unscheduled']:[]).map(g=>{const a=EV.filter(e=>e.grp===g&&!e.tp).length,l=evShown().filter(e=>e.grp===g&&(e.ps?st('cont'):evState(e))!=='rejected'),b=l.length,nw=l.find(e=>e.tp||e.ps);return [[g,a,b,b>a?`<span class="pill med">+${b-a}</span>`:'<span class="muted">Unchanged</span>'],nw?(nw.ps?rid('cont'):nw.sug):null];})},
  events:{t:'Events',h:['Name','Label','Event group','Study day','Window','Status'],rows:()=>evShown().map(e=>[[`<b>${e.id}</b>`,e.label,e.grp,e.day||'—',e.win||'—',stPill(e.ps?st('cont'):evState(e))],e.ps?rid('cont'):e.sug])},
  forms:{t:'Forms',h:['Name','Label','Events in v1','Events in v2','Status'],rows:()=>FORMS.map(f=>{const k=DES().kind,a=f[2].filter(i=>!evt(i).tp).length,b=k==='events'?f[2].filter(i=>evState(evt(i))!=='rejected'&&(!evt(i).tp||st('form')!=='rejected')).length:a+(k==='unsch'&&f[0]==='PK'&&st('form')!=='rejected'?1:0);
    return [[`<b>${f[0]}</b>`,f[1],a,k==='rows'&&f[0]==='PK'?a+' (repeating at V2, V7, V8)':b,f[0]!=='PK'?'<span class="muted">Unchanged</span>':k==='rows'?modPill('cont'):stPill(st('form'))],f[0]==='PK'?r1('form','cont'):null];})},
  codelists:{t:'Codelists',h:['Codelist','Entry','Decode','Status'],note:'Showing the codelist touched by this amendment (1 of 42).',rows:()=>PKTPT.map((t,i)=>[['<b>PKTPT</b>',i+1,t[0],t[2]?stPill(st('codelist')):'<span class="muted">Unchanged</span>'],t[2]?rid('codelist'):null])},
  crules:{t:'Comparison Rules',h:['Name','Item','Operator','Compare to','Scope','Status'],note:'Showing rules related to PK (1 of 7).',rows:()=>[[['<b>CMP_PK_01</b>','PK.PKDTC','cannot be before','$V2.EX.EXSTDTC',okR('cmp')?'PK @ V2.1 – V9':'PK @ V3 – V9',modPill('cmp')],rid('cmp')]]},
  urules:{t:'User Defined Rules',h:['Name','Type','Description','Status'],note:'Showing the rules this schema option adds.',rows:()=>SUG.filter(s=>s.diff.some(d=>d[0]==='Rule'&&d[2]==='Added')).map(s=>{const d=s.diff.find(d=>d[0]==='Rule');return [[`<b>${d[1]}</b>`,s.type,d[4],stPill(S.dec[s.id])],s.id];})},
  plans:{t:'Review Plans',h:['Plan','Form','Scope in v1','Scope in v2','Status'],rows:()=>[[['<b>Critical Data – 100% SDV</b>','PK','PK @ 8 events',okR('sdv')?sug(rid('sdv')).diff[0][4]:'PK @ 8 events',modPill('sdv')],rid('sdv')]]},
  settings:{t:'Settings',h:['Setting','Value','Relevant to this amendment'],rows:()=>[[['Standard Date Format','dd-MMM-yyyy',''],null],[['Open Query on Out of Range Event Dates','Yes','New events with a day window raise this query automatically'],rid('winDay')],[['Enable Protocol Deviations','Yes',''],null],[['Enable Veeva Randomization','Yes','PK subgroup is assigned at randomisation (RAND.PKSUB)'],rid('scope')]]},
};
function vObjects(k){ const o=OBJ[k];
  return `<div class="ph"><div><h1>${o.t}</h1><div class="sub">Version 1 objects with the changes proposed for version 2. Rows linked to a suggested change open it.</div></div><div class="acts"><button class="btn" ${go('sponsor','assist',{sTab:'changes'})}>Open Audit</button></div></div>
  ${o.note?`<div class="note blue"><div>${o.note}</div></div>`:''}
  <table class="v"><tr>${o.h.map(x=>`<th>${x}</th>`).join('')}<th>Suggested change</th></tr>${o.rows().map(r=>`<tr class="${r[1]?'click':''}" ${r[1]?go('sponsor','assist',{sTab:'changes',sel:r[1]}):''}>${r[0].map(c=>`<td>${c}</td>`).join('')}<td class="nw">${r[1]?`<a>${r[1]}</a>`:'<span class="muted">—</span>'}</td></tr>`).join('')}</table>`; }
const vCountries=()=>`<div class="ph"><h1>Study Countries</h1></div><table class="v"><tr><th>Country</th><th>Sites</th><th>EC approved Ver. 1.1</th><th>On version 2</th><th>PK subgroup</th></tr>
  ${[...new Set(SITES.map(s=>s.ctry))].map(c=>{const l=SITES.filter(s=>s.ctry===c);return `<tr><td><b>${c}</b></td><td>${l.map(s=>`<a ${go('cro','site',{croSite:s.id,siteTab:'overview'})}>${s.id}</a>`).join(', ')}</td><td>${l.filter(s=>s.irb).length} of ${l.length}</td><td>${l.filter(s=>S.dep[s.id]).length} of ${l.length}</td><td>${l[0].cn?'Yes – new PK visits apply':'No – data entry unchanged'}</td></tr>`}).join('')}</table>`;

/* ================= Audit: chain, filters, export ================= */
const fnv=s=>{let a=0x811c9dc5,b=0x1000193;for(let i=0;i<s.length;i++){a^=s.charCodeAt(i);a=Math.imul(a,16777619)>>>0;b=(Math.imul(b^s.charCodeAt(i),2246822519))>>>0;}return (a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0'));};
function chain(){ let prev='0'.repeat(16); const l=S.log.slice().reverse(); l.forEach((e,i)=>{e.seq=i+1;e.hash=fnv(prev+e.t+e.u+e.o+e.s+e.x);prev=e.hash;}); return l.reverse(); }
const STAGES=[['src','Protocol','The amended protocol is filed. Everything after it has to trace back to this document.'],
  ['ai','AI draft','The assistant reads the protocol and drafts the changes, and fixed rules calculate who is affected. Drafts change nothing in the casebook.'],
  ['rev','Sponsor review','The sponsor chooses a schema option, accepts or rejects each change, asks questions and runs validation.'],
  ['sign','Sponsor signature','A named sponsor user signs casebook version 2. Only after this can the CRO give it to sites.'],
  ['ec','Ethics approval','Each site’s ethics committee approves the amended protocol. A site cannot move to version 2 before its approval is recorded.'],
  ['roll','CRO rollout','The CRO makes version 2 the active version, site by site, and follows up readiness.'],
  ['site','Site','The site completes readiness tasks, confirms the plan for each participant, enters data and signs its acknowledgement.']];
function stageOf(e){ const x=e.x;
  if(/^Protocol CTJ|Casebook version 1 deployed/.test(x)) return 'src';
  if(/approved by electronic signature/.test(x)) return 'sign';
  if(/^EC approval|submitted to EC/.test(x)) return 'ec';
  if(/set as active version|Transition plan calculated|approval withdrawn|Reminder sent/.test(x)) return 'roll';
  if((e.o==='AI'&&!/^Answered/.test(x))||/Site impact calculated/.test(x)) return 'ai';
  if(e.o.startsWith('Site')||/acknowledged/.test(x)) return 'site';
  return e.o==='CRO'?'roll':'rev'; }
const madeBy=e=>e.o==='AI'?kindPill('ai'):e.u==='System'?kindPill('calc'):'<span class="kind person">Person</span>';
function auditList(f,noStage){ const a=S.af, q=a.q.toLowerCase();
  return chain().filter(f||(()=>true)).filter(e=>(!a.org||e.o.startsWith(a.org))&&(!a.site||e.s===a.site)&&(!q||(e.x+e.u+e.s).toLowerCase().includes(q))&&(noStage||!a.st||stageOf(e)===a.st)); }
function auditRows(f,plain){ const l=plain?chain().filter(f||(()=>true)):auditList(f), open=S.open, out=[];
  const link=e=>e.ref&&e.ref.sug?`<a>${e.ref.sug}</a>`:e.ref&&e.ref.p?`<a>p. ${e.ref.p}</a>`:'<span class="muted">—</span>';
  const row=(e,kid)=>`<tr class="${plain?'':'click'} ${kid?'kid':''}" ${plain?'':h(()=>auditEntry(e.seq))}><td class="r muted">${e.seq}</td><td class="nw muted">${e.t}</td><td class="nw">${madeBy(e)}</td><td class="nw">${e.u}<div class="muted">${e.o}</div></td><td class="nw">${e.s||'—'}</td><td>${e.x}</td>
    <td class="nw">${link(e)}</td><td class="nw"><code title="Chained to the previous entry">${e.hash.slice(0,10)}</code>${plain?'':' <span class="chev">›</span>'}</td></tr>`;
  const gk=e=>e.x.replace(/for \d+ participant\(s\)/,'for the site’s participants'), groups={}; if(!plain&&!S.af.flat) l.forEach(e=>{ if(e.s) (groups[gk(e)]=groups[gk(e)]||[]).push(e); });
  const seen={}; l.forEach(e=>{ const x0=gk(e), g=groups[x0]; if(!g||g.length<3||!e.s) return out.push(row(e));
    if(seen[x0]) return; seen[x0]=1; const k='aud:'+x0, on=open[k], who=[...new Set(g.map(x=>x.u))];
    out.push(`<tr class="click grow" ${h(()=>{S.open[k]=!on})}><td class="r muted">${on?'▾':'▸'}</td><td class="nw muted">${g[g.length-1].t.slice(0,11)} to ${g[0].t.slice(0,11)}</td><td class="nw">${madeBy(e)}</td><td class="nw">${who.length>2?who.length+' people':who.join(', ')}<div class="muted">${e.o.replace(/ .*/,'')}</div></td>
      <td class="nw"><span class="pill gray">${g.length} sites</span></td><td><b>${x0}</b><div class="muted">The same step at ${g.length} sites. Click to ${on?'hide':'list'} them.</div></td><td></td><td></td></tr>`);
    if(on) g.forEach(x=>out.push(row(x,1))); });
  return out.join('')||'<tr><td colspan="8" class="muted">No entries match.</td></tr>'; }
function auditMap(f){ const l=auditList(f,true), cur=S.af.st;
  return `<div class="amap">${STAGES.map((s,i)=>{const g=l.filter(e=>stageOf(e)===s[0]), last=g[0];
    return `<button class="${cur===s[0]?'on':''} ${g.length?'has':''}" ${h(()=>{S.af.st=cur===s[0]?'':s[0]})}><u>${i+1}</u><b>${s[1]}</b><span>${g.length?g.length+(g.length===1?' entry':' entries'):'Nothing yet'}</span><small>${last?'Latest '+last.t.slice(0,11):'&nbsp;'}</small></button>`;}).join('<i>→</i>')}</div>`; }
function auditEntry(seq){ const l=chain(), e=l.find(x=>x.seq===seq); if(!e) return false; const prev=l.find(x=>x.seq===seq-1), next=l.find(x=>x.seq===seq+1), st=STAGES.find(s=>s[0]===stageOf(e)), act=(/\((AI-\d+)\)/.exec(e.x)||[])[1];
  const rel=l.filter(x=>x!==e&&((e.ref&&e.ref.sug&&x.ref&&x.ref.sug===e.ref.sug)||(e.s&&x.s===e.s))).slice(0,8), mini=(x,lbl)=>x?`<tr class="click" ${h(()=>auditEntry(x.seq))}><td class="nw muted">${lbl||'#'+x.seq}</td><td class="nw muted">${x.t}</td><td class="nw">${x.u} · ${x.o}</td><td>${x.x}</td><td class="chev">›</td></tr>`:'';
  const sec=(t,b)=>`<div class="sec"><label>${t}</label>${b}</div>`, btns=[];
  if(e.ref&&e.ref.sug&&sug(e.ref.sug)) btns.push(`<button class="btn pri" ${h(()=>changeCard(e.ref.sug))}>Open change ${e.ref.sug}: source, tests, reviewers</button>`);
  if(act) btns.push(`<button class="btn pri" ${h(()=>actModal(aiActs().find(a=>a.id===act)))}>Open ${act}: how this was produced and checked</button>`);
  if(e.ref&&e.ref.p) btns.push(`<button class="btn" ${h(()=>openPdf(e.ref.p))}>Open protocol at p. ${e.ref.p}</button>`);
  if(e.s&&S.role!=='site') btns.push(`<button class="btn" ${h(()=>{closeM();nav('cro','site',{croSite:e.s,siteTab:'overview'});})}>Open site ${e.s}</button>`);
  if(/Change request (CR-\d+)/.test(e.x)&&S.role!=='site') btns.push(`<button class="btn" ${h(()=>{closeM();nav(S.role,'feedback');})}>Open change requests</button>`);
  $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:780px"><h2>Audit entry #${e.seq} ${madeBy(e)}<a ${h(closeM)}>Close ✕</a></h2><div class="bd detail">
    <h3>${e.x}</h3>
    <dl class="kv" style="margin-top:10px"><dt>When</dt><dd>${e.t}</dd><dt>Who</dt><dd>${e.u} · ${e.o}${e.o==='AI'?' <span class="muted">(the assistant; a draft or advice, never a decision)</span>':e.u==='System'?' <span class="muted">(a fixed rule, no judgement involved)</span>':''}</dd>
      <dt>Site</dt><dd>${e.s?`${e.s} · ${site(e.s).name}, ${site(e.s).city}`:'Whole study'}</dd><dt>Stage</dt><dd><b>${st[1]}</b> · ${st[2]}</dd></dl>
    ${btns.length?sec('Go to what this entry is about',`<div style="display:flex;gap:8px;flex-wrap:wrap">${btns.join('')}</div>`):''}
    ${sec('What came just before and after',`<table class="v">${mini(prev,'Before')}${mini(next,'After')}</table>`)}
    ${rel.length?sec(`Other entries about the same ${e.ref&&e.ref.sug?'change or ':''}site`,`<table class="v">${rel.map(x=>mini(x)).join('')}</table>`):''}
    ${sec('Has it been altered?',`<dl class="kv"><dt>This entry</dt><dd><code>${e.hash}</code></dd><dt>Entry before it</dt><dd><code>${prev?prev.hash:'0000000000000000 (first entry)'}</code></dd></dl>
      <p class="muted" style="margin:8px 0 0">Each code is calculated from the entry before it plus this entry’s time, user and text. Editing or deleting any earlier entry would change every code after it, which is how a reviewer can tell the list is complete.</p>`)}</div></div></div>`; return false; }
function auditTable(f,noFilter){ const a=S.af; window._af=f;
  if(noFilter) return `<table class="v"><tr><th>#</th><th>Timestamp</th><th>Made by</th><th>Who</th><th>Site</th><th>Event</th><th>Linked to</th><th>Check code</th></tr><tbody>${auditRows(f,true)}</tbody></table>`;
  return `${auditMap(f)}<div class="bar"><input id="afq" value="${a.q}" placeholder="Filter by text, user or subject…" style="padding:5px 8px;border:1px solid #bbb;border-radius:2px;width:240px">
    <select id="afo" style="padding:5px">${['','AI','Sponsor','CRO','Site','Vault'].map(o=>`<option value="${o}" ${a.org===o?'selected':''}>${o==='AI'?'AI (assistant)':o==='Vault'?'System (calculated)':o||'Everyone'}</option>`).join('')}</select>
    <select id="afs" style="padding:5px"><option value="">All sites</option>${SITES.map(s=>`<option ${a.site===s.id?'selected':''}>${s.id}</option>`).join('')}</select>
    <label style="display:flex;gap:5px;align-items:center;cursor:pointer" ${h(()=>{S.af.flat=!S.af.flat})}><input type="checkbox" ${a.flat?'':'checked'}>Group the same step across sites</label>
    <span class="sp"></span><button class="btn" ${h(()=>{chain();return toast(`Chain intact: ${S.log.length} entries, each code covers the entry before it`)})}>Verify chain</button>
    <button class="btn" ${h(exportAudit)}>Export CSV</button></div>
  <table class="v aud"><tr><th>#</th><th>Timestamp</th><th>Made by</th><th>Who</th><th>Site</th><th>Event <span class="muted" style="font-weight:normal">· click a row for details</span></th><th>Linked to</th><th>Check code</th></tr><tbody id="audbody">${auditRows(f)}</tbody></table>`; }
document.addEventListener('input',e=>{ if(e.target.id==='afq'){S.af.q=e.target.value;const b=$('audbody'); if(b) b.innerHTML=auditRows(window._af);} });
document.addEventListener('change',e=>{ if(e.target.id==='afo'){S.af.org=e.target.value;render();} if(e.target.id==='afs'){S.af.site=e.target.value;render();} });
function download(name,text,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); return false; }
function exportAudit(){ const esc=v=>`"${String(v).replace(/"/g,'""')}"`;
  download('CTJ301UC201_amendment1_audit_trail.csv',['seq,timestamp,made_by,user,organisation,site,event,source,hash'].concat(chain().slice().reverse().map(e=>[e.seq,e.t,e.o==='AI'?'AI':e.u==='System'?'System':'Person',e.u,e.o,e.s,e.x,e.ref?(e.ref.sug||'p.'+e.ref.p):'',e.hash].map(esc).join(','))).join('\n'),'text/csv');
  return toast('Audit trail downloaded as CSV'); }

/* ================= Inspection packet ================= */
function openPacket(){
  const el=SITES.filter(eligible), open=[];
  if(!S.signed) open.push('Sponsor approval of casebook version 2'); el.filter(s=>!S.dep[s.id]).forEach(s=>open.push(`${s.id}: version 2 not yet active`));
  el.filter(s=>S.dep[s.id]&&!S.ack[s.id]).forEach(s=>open.push(`${s.id}: site acknowledgement outstanding`)); SITES.filter(s=>!s.irb).forEach(s=>open.push(`${s.id}: EC approval pending`));
  SITES.forEach(s=>{const n=siteTasks(s).filter(t=>t.st!=='done').length; if(n&&S.dep[s.id]) open.push(`${s.id}: ${n} readiness task(s) open`);});
  const fin=!open.length, sec=(t,b)=>`<h3 style="font-size:15px;font-weight:bold;margin:18px 0 6px;border-bottom:1px solid var(--orange);padding-bottom:4px">${t}</h3>${b}`;
  $('layer').innerHTML=`<div class="ovl"><div class="modal wide" id="packet"><h2>Inspection Packet · Amendment 1 <span class="pill ${fin?'solid':'med'}">${fin?'FINAL':'DRAFT – '+open.length+' open item(s)'}</span>
    <a ${h(()=>{window.print();return false;})}>Print / Save as PDF</a><a style="margin-left:14px" ${h(closeM)}>Close ✕</a></h2><div class="bd">
    <dl class="kv"><dt>Study</dt><dd>CTJ301UC201</dd><dt>Source document</dt><dd>Protocol Ver. 1.1, 16 May 2017 (VV-TMF-00412), supersedes Ver. 1.0</dd><dt>Casebook</dt><dd>Version 1 → Version 2</dd><dt>Schema option</dt><dd>${S.design?`Option ${S.design} · ${DES().name} (${VERD[DES().verdict][1].toLowerCase()})`:'Not yet chosen'}</dd><dt>Change requests</dt><dd>${S.cr.length?S.cr.map(c=>`${c.id} ${c.status.toLowerCase()}`).join(', '):'None'}</dd><dt>Generated</dt><dd>${now()} from recorded facts only</dd></dl>
    ${sec('1. Changes and decisions',`<table class="v"><tr><th>ID</th><th>Change</th><th>Protocol source</th><th>Confidence</th><th>Decision</th><th>Reviewer note</th></tr>${SUG.map(s=>`<tr><td class="nw">${s.id}</td><td>${s.title}</td><td class="nw">${s.ev?s.ev.map(b=>'p. '+b.p).filter((v,i,a)=>a.indexOf(v)===i).join(', '):'Inferred'}</td><td>${confPill(s.conf)}</td><td><span class="dstat ${S.dec[s.id]}">${decTxt(S.dec[s.id])}</span>${s.opts&&acc(s.id)?'<br>'+s.opts.find(o=>o[0]===S.opt[s.id])[1]:''}</td><td>${S.why[s.id]||'—'}</td></tr>`).join('')}</table>`)}
    ${sec('2. Validation',Array.isArray(S.val)?`<ul class="clean">${S.val.map(c=>`<li>${icon(c[0])}<div><b>${c[1]}</b> – ${c[2]}</div></li>`).join('')}</ul>`:'<span class="muted">Not run.</span>')}
    ${sec('3. Signatures',`<table class="v"><tr><th>Step</th><th>Signer</th><th>Meaning</th><th>When</th></tr>
      <tr><td>Sponsor approval of casebook v2</td><td>${S.signed?S.signed.by:'—'}</td><td>${S.signed?S.signed.meaning:'—'}</td><td>${S.signed?S.signed.at:'<span class="muted">Outstanding</span>'}</td></tr>
      ${S.jobs.slice().reverse().map(j=>`<tr><td>CRO: Set Active Version 2 (${j.ids.join(', ')})</td><td>${j.by}</td><td>Approval</td><td>${j.at}</td></tr>`).join('')}
      ${SITES.filter(s=>S.ack[s.id]).map(s=>`<tr><td>${s.id}: site acknowledgement</td><td>${S.ack[s.id].by}</td><td>Acknowledgement</td><td>${S.ack[s.id].at}</td></tr>`).join('')}</table>`)}
    ${sec('4. Site status',`<table class="v"><tr><th>Site</th><th>EC approval</th><th>Active version</th><th>Subjects gaining PK visits</th><th>Tasks done</th><th>Acknowledged</th></tr>${SITES.map(s=>{const t=siteTasks(s);return `<tr><td>${s.id} · ${s.name}</td><td>${s.irb||'Pending'}</td><td>${S.dep[s.id]?2:1}</td><td>${stats(s).aff}</td><td>${t.filter(q=>q.st==='done').length} of ${t.length}</td><td>${S.ack[s.id]?S.ack[s.id].at:'—'}</td></tr>`}).join('')}</table>`)}
    ${sec('5. Open items',open.length?`<ul>${open.map(o=>`<li>${o}</li>`).join('')}</ul>`:'None.')}
    ${sec('6. What was automated, and who reviewed it',`<table class="v"><tr><th>ID</th><th>Automated step</th><th>How</th><th>Checks</th><th>Reviewed by a person</th></tr>${aiActs().map(a=>`<tr><td class="nw">${a.id}</td><td>${a.t}<div class="muted">${a.out}</div></td><td class="nw">${KIND[a.k][0]}</td><td>${a.checks.filter(c=>c[0]==='ok').length} of ${a.checks.length} passed</td><td>${a.rev.ok?'':a.rev.ok===false?'Outstanding: ':''}${a.rev.txt}</td></tr>`).join('')}</table>`)}
    ${sec('7. Audit trail',auditTable(null,true))}</div></div></div>`; return false; }

/* ================= Guided walkthrough ================= */
const needA=()=>{ if(!S.signed&&S.design!=='A') applyDesign('A',true); };
const TOUR=[
  ['Start as the sponsor, who owns the casebook design. Schema Options: four ways to build the amendment, compared side by side, with a recommendation and the reasons against the others. Choose one, or say why none fit.',()=>nav('sponsor','assist',{sTab:'options'})],
  ['Detailed changes for Option A. Here the assistant found the PK-subgroup restriction in a footnote. Click “Open protocol at p. 45” to check the source yourself.',()=>{needA();nav('sponsor','assist',{sTab:'changes',sel:r1('scope')});}],
  ['Table 1 and Section 6.2.5 disagree. The assistant does not guess; pick an option, then Accept. Reject… asks why and what to try instead.',()=>{needA();nav('sponsor','assist',{sTab:'changes',sel:r1('winGap')});}],
  ['AI Record: every automated step across sponsor, CRO and site, labelled as an AI draft or a fixed-rule calculation, with what it was based on, how it was checked and which person reviewed it. Click any row for the full record.',()=>{needA();nav('sponsor','trust');}],
  ['Schedule: the current version beside each proposed one, with what speaks for and against it. Type a doubt into Ask Audit at the bottom.',()=>nav('sponsor','schedule',{view:'v2'})],
  ['Accept the rest (“Accept all high-confidence”), run validation, then Approve and Sign, or Reject and return with a reason.',()=>{needA();nav('sponsor','assist',{sTab:'approve'});}],
  ['CRO: the study’s 27 real sites. Most are ready; three are held until their EC approves. Tick sites and Set Active Version, record an EC approval, or return the casebook to the sponsor.',()=>nav('cro','rollout')],
  ['Open a site: per-subject impact with visit timelines, readiness tasks, documents, contacts, messages and its own audit trail.',()=>nav('cro','site',{croSite:'CN-101',siteTab:'subjects'})],
  ['Site: the coordinator sees only what changes for their own participants, completes tasks with proof, and signs, or reports a problem.',()=>nav('site','changes',{mySite:'CN-101'})],
  ['Transition Plan: the new schema mapped onto each participant already in the trial, on real dates, with weekend and consent problems flagged. Confirm, or export to the site calendar.',()=>nav('site','plan',{mySite:'CN-101'})],
  ['Data Entry: the new samples exist only for PK-subgroup participants. Move the 48 h sample two hours late and submit to see the new rule open a query.',()=>nav('edc',null,{edc:{site:'CN-101',sub:'CN101-002',ev:S.design==='A'||S.design==='B'||!S.design?'V2.1':null,prev:true}})],
  ['Everything is in one chained audit trail, and each entry says whether a person, the AI or a fixed rule made it. Filter it, export it, or open the Inspection Packet (DRAFT until nothing is open).',()=>nav('cro','audit')],
];
function startTour(){ S.tour=0; TOUR[0][1](); }
function tourCtl(){ if(S.tour===null) return ''; const i=S.tour, mv=n=>h(()=>{S.tour=n;TOUR[n][1]();});
  return `<span class="tourctl" title="${TOUR[i][0].replace(/"/g,'&quot;')}"><button ${i?mv(i-1):'disabled'}>‹ Back</button><button class="nx" ${i<TOUR.length-1?mv(i+1):'disabled'}>Next ›</button><button ${h(()=>{S.tour=null})}>End walkthrough</button></span>`; }
