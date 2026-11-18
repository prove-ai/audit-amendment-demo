/* Audit – schedule proposals (v1 vs each proposed v2), the "Ask Audit" box (scripted answers),
   and the site Transition Plan (maps the new schema onto each participant already in the trial). Loaded before app.js. */

/* ================= Pros / cons, derived from the comparison map ================= */
const prosCons=k=>({pros:MATRIX.filter(r=>r[1][k][0]==='ok').map(r=>[r[0],r[1][k][1]]),cons:MATRIX.filter(r=>r[1][k][0]!=='ok').map(r=>[r[0],r[1][k][1],r[1][k][0]])});

/* ================= Schedule: current vs each proposal ================= */
function vSchedule(){
  const k=S.schedK||S.design||'A', D=DESIGNS[k], v1=S.view==='v1', pc=prosCons(k), v=VERD[D.verdict], lock=!!S.signed, chosen=S.design===k;
  const seg=`<div class="seg"><button class="${v1?'on':''}" ${h(()=>{S.view='v1'})}>Version 1 (current)</button>${Object.keys(DESIGNS).map(o=>`<button class="${!v1&&k===o?'on':''}" ${h(()=>{S.view='v2';S.schedK=o})}>Proposal ${o}${S.design===o?' (chosen)':''}</button>`).join('')}</div>`;
  const panel=v1?`<div class="note blue"><div>This is the schedule sites are collecting on today. Pick a proposal above to see how the amendment would change it.</div></div>`
   :`<div class="card prop v-${D.verdict}"><h2>Proposal ${k} · ${D.name} <span class="pill ${v[0]}">${v[1]}</span>${chosen?'<span class="dstat accepted" style="margin-left:auto">Chosen for version 2</span>':''}</h2><div class="bd">
      <p style="margin:0 0 10px">${D.verdictWhy}</p>
      <div class="pc2"><div><label>In its favour</label><ul>${pc.pros.map(p=>`<li>${icon('ok')}<span><b>${p[0]}.</b> ${p[1]}</span></li>`).join('')||'<li class="muted">Nothing stands out.</li>'}</ul></div>
        <div><label>Against it</label><ul>${pc.cons.map(p=>`<li>${icon(p[2]==='bad'?'bad':'warn')}<span><b>${p[0]}.</b> ${p[1]}</span></li>`).join('')||'<li class="muted">No drawbacks identified.</li>'}</ul></div></div>
      <div class="decide" style="margin-top:10px">${chosen?`<button class="btn pri" ${go('sponsor','assist',{sTab:'changes'})}>Review its ${SUG.length} detailed changes</button>`:`<button class="btn ${D.verdict==='rec'?'pri':''}" ${lock?'disabled':h(()=>{applyDesign(k)})}>Choose Proposal ${k} for version 2</button>`}
        <a ${go('sponsor','assist',{sTab:'options'})}>Compare all four side by side</a>
        <span class="legend" style="margin-left:auto"><span><span class="chk">●</span> Unchanged</span><span><span class="plus">+</span> Accepted</span><span><span class="plus pending">+</span> Proposed</span><span><b>PK</b> = created for the PK subgroup only</span><span><b style="color:#c0392b">?</b> Needs a decision</span></span></div></div></div>`;
  return `<div class="ph"><h1>Schedule</h1>${seg}</div>${panel}${scheduleGrid(k)}<div style="margin-top:16px">${askBox('sponsor')}</div>`;
}

/* ================= Ask Audit (scripted in this demo) ================= */
const ASK_CHIPS={sponsor:['Why is Proposal A recommended?','Our sites cannot schedule a Day 2 visit','What happens to data already entered?','Which sites are affected?','Why is the Day 76 window undecided?'],
  site:['Which of my participants are affected?','A new sample falls on a weekend','A participant has not re-consented','Do I enter data for visits already passed?','Who do I ask about this?']};
function askAnswer(q,ctx){ const t=q.toLowerCase(), has=(...w)=>w.some(x=>t.includes(x)), act=x=>x.d!=='DONE';
  const nPk=total(s=>s.subs.filter(x=>x.pk===true&&act(x)).length), nAll=total(s=>s.subs.filter(act).length), cn=SITES.filter(s=>s.cn).length, btn=(l,fn)=>({l,fn});
  if(ctx==='site'){ const s=site(S.mySite), x=stats(s), pl=sitePlan(s);
    if(has('weekend','saturday','sunday')) return {a:`${pl.weekend} of your upcoming samples fall on a weekend. The 144 h, 240 h and 480 h samples have a ±24 hour window (protocol 6.2.5), so the plan moves them to the nearest weekday. A 48 h sample only has ±1 hour and cannot move; those are flagged so you can arrange cover.`,src:51,b:[btn('Open the transition plan',()=>nav('site','plan'))]};
    if(has('consent','re-consent','reconsent','icf')) return {a:`${x.rc} of your affected participants have not signed the PK substudy consent form (v2.0). No new PK sample may be taken for them until they do. The plan shows the date each of them needs to sign by, which is their next new sample.`,src:78,b:[btn('Open the transition plan',()=>nav('site','plan'))]};
    if(has('passed','already','retro','missed','back')) return {a:'No. The amendment applies from the day version 2 becomes active at your site. Samples whose day has already passed are not expected, no query is raised, and nothing needs to be back-filled. The plan lists them so you can file a note if your SOP asks for one.',b:[btn('Open the transition plan',()=>nav('site','plan'))]};
    if(has('who','ask','contact','cra','help')) return {a:`For this change: ${s.cra} (your CRA) for site questions, Jordan Morgan at the CRO for timing of the rollout, and the sponsor medical monitor for anything about PK sampling itself.`,b:[btn('Open Study Contacts',()=>nav('site','contacts'))]};
    if(has('which','affected','my participants','how many','patients','subjects')) return {a:s.cn||!pkOnly()?`${x.aff} of your ${s.subs.length} participants gain new PK samples, ${pl.visits} samples in total still to schedule. ${x.maybe?x.maybe+' participant(s) in screening are affected only if assigned to the PK subgroup at randomisation. ':''}Everyone else is unchanged.`:'None. The new PK samples apply only to the Mainland China PK subgroup, so nothing changes in data entry at your site.',b:[btn('Open the transition plan',()=>nav('site','plan'))]};
    if(has('edc','enter','where','form')) return {a:{events:'Each new sample is its own visit in EDC (V2.1 to V8.1), with the usual PK form.',rows:'There are no new visits. Each new sample is an extra row on the PK form at Visit 2, Visit 7 or Visit 8.',unsch:'Add a “PK Sampling” visit in EDC each time you take one of the extra samples, then complete the PK form on it.'}[DES().kind],b:[btn('Open Data Entry',()=>nav('edc',null,{edc:{site:s.id,sub:null,ev:null,prev:true}}))]};
    return {a:'I can answer from the protocol and your site’s transition plan: which participants are affected, weekend conflicts, consent, where to enter data, and who to ask. If the change does not work at your site, report a problem so the CRO and sponsor see it.',b:[btn('Report a problem…',()=>crModal({about:`Casebook v2 at ${s.id}`,site:s.id,title:'Report a problem with this change',intro:'Say what does not work and what you would need instead.',to:['CRO clinical site manager','Sponsor study build team']}))]};
  }
  if(has('why a','recommend','best','which option','which proposal','prefer')) return {a:`Proposal A is recommended because it mirrors Table 1 visit for visit, creates the new visits only for the ${nPk} PK-subgroup participants, and keeps both day windows and overdue-visit alerts. Its cost is two extra rules to maintain. B is simpler but puts seven empty visits on every other participant; C and D avoid new scheduled visits but lose either clarity for sites or missed-sample detection.`,src:45,b:[btn('Show Proposal A',()=>{S.view='v2';S.schedK='A';nav('sponsor','schedule')}),btn('Compare all four',()=>nav('sponsor','assist',{sTab:'options'}))]};
  if(has('day 2','overnight','cannot schedule',"can't schedule",'too many visits','burden','extra visit','fewer visits','no new visit')) return {a:'If extra scheduled visits are the problem, look at Proposal C: the samples become extra rows on the PK form at Visits 2, 7 and 8, so the schedule does not change. The trade-off is that a Day 6 or Day 10 sample is filed under the Day 0 visit, and the PK form at those visits changes layout. A middle path is to fold only the 48 h samples into Visits 2 and 7 and keep the other five as visits; I can raise that as a variant for the build team.',src:51,b:[btn('Show Proposal C',()=>{S.view='v2';S.schedK='C';nav('sponsor','schedule')}),btn('Request the hybrid variant…',()=>crModal({about:'Schema options: hybrid variant',title:'Request a variant',intro:'This sends the hybrid to the study build team as a change request. Edit the wording if needed.',to:['Audit: redraft with this feedback','Sponsor study build team']}))]};
  if(has('already entered','existing data','retro','migrat','data already','reopen')) return {a:'Proposals A, B and D are additive: nothing already entered is touched and no forms are reopened. Proposal C changes the layout of the PK form at Visits 2, 7 and 8, so submitted PK forms at those visits are migrated; values are kept. In every proposal, samples whose day has already passed are not expected and raise no query.',b:[btn('Show Proposal C',()=>{S.view='v2';S.schedK='C';nav('sponsor','schedule')})]};
  if(has('which sites','sites affected','how many','who is affected','subjects','participants','korea','taiwan','outside')) return {a:`With A, C or D: ${nPk} PK-subgroup participants at ${cn} sites in China see a change; the ${SITES.length-cn} sites in South Korea and Taiwan see none. With B: all ${nAll} active participants at all ${SITES.length} sites would show the seven visits.`,src:45,b:[btn('Open the CRO site list',()=>nav('cro','rollout'))]};
  if(has('76','window','v7.2','undecided','disagree','conflict')) return {a:'Table 1 gives Day 6 (V2.2) a ±1 day window but leaves Day 76 (V7.2) blank, although both are 144 h samples. Section 6.2.5 gives every 144 h sample ±24 hours. That looks like an omission in the table, but it is a judgement, so it is left for you to decide rather than guessed. Proposals C and D avoid the question by checking sample time instead of visit day.',src:51,b:S.design==='A'||S.design==='B'?[btn('Decide it now',()=>nav('sponsor','assist',{sTab:'changes',sel:r1('winGap')}))]:[btn('Show Proposal A',()=>{S.view='v2';S.schedK='A';nav('sponsor','schedule')})]};
  if(has('missed','overdue','forgot','skip')) return {a:'A and B create expected visits, so a missed sample shows as overdue. C only expects a number of rows. D expects nothing, because the site adds each visit itself, so omissions are caught only by monitoring.',b:[btn('Compare all four',()=>nav('sponsor','assist',{sTab:'options'}))]};
  if(has('simple','fast','quick','effort','build','cheap','least work')) return {a:'Smallest build: D (one event group, three rules), then B (seven events, one rule). B is not advised because it ignores the PK-subgroup footnote. D is workable if monitoring can cover missed samples. A is more work (seven events, two rules) but needs the least explaining to sites.',b:[btn('Show Proposal D',()=>{S.view='v2';S.schedK='D';nav('sponsor','schedule')})]};
  if(has('consent','icf')) return {a:'The extra samples need the PK substudy consent form (v2.0). The casebook does not block entry, but each site gets a readiness task to re-consent its PK participants before their next new sample, and the site transition plan shows the date each participant must sign by.',src:78};
  if(has('sdv','monitor','review plan')) return {a:'The protocol does not say. PK is 100% SDV at every existing visit, so the same is proposed for the new samples and marked Medium confidence because it is inferred. Reject it if the monitoring plan says otherwise.'};
  return {a:'I can answer from the protocol and the four proposals: why one is recommended, who is affected, windows, existing data, build effort, consent. If none of the proposals fit, tell the build team what to try instead.',b:[btn('Request changes…',()=>crModal({about:'Schema options',title:'Request changes',intro:'Say what does not work and what should be tried.'}))]};
}
function ask(q,ctx){ q=q.trim(); if(!q) return false; const r=askAnswer(q,ctx); S.chat[ctx].push({q:esc(q),r}); log(`Question to Audit: “${q.slice(0,90)}”`,ctx==='site'?S.mySite:''); aiLog(`Answered a question (AI-10). Advice only, not reviewed by a person: “${String(r.a).replace(/<[^>]+>/g,'').slice(0,110)}…”`,ctx==='site'?S.mySite:'',r.src?{p:r.src}:null); }
function askBox(ctx){ const l=S.chat[ctx];
  return `<div class="card askbox"><h2><span class="assist">Ask Audit</span> <span class="muted" style="font-weight:400;font-size:12px">Type a doubt in your own words. Answers come from the protocol and this study’s data.</span></h2><div class="bd">
    ${l.map((m,i)=>`<div class="aq">${m.q}</div><div class="aa"><div class="aprov">${kindPill('ai')} Advice only. It changes nothing and no person has reviewed it${m.r.src?'; check the cited page':''}.</div>${m.r.a}${m.r.src?` <a ${h(()=>openPdf(m.r.src))}>Protocol p. ${m.r.src}</a>`:''}${m.r.b?`<div class="ab">${m.r.b.map(b=>`<button class="btn sm" ${h(()=>b.fn())}>${b.l}</button>`).join('')}</div>`:''}</div>`).join('')}
    <div class="chips">${ASK_CHIPS[ctx].map(c=>`<a ${h(()=>ask(c,ctx))}>${c}</a>`).join('')}</div>
    <div style="display:flex;gap:8px"><input id="askin_${ctx}" class="askin" placeholder="${ctx==='site'?'e.g. What do I do if a sample falls on Sunday?':'e.g. Our sites cannot add a Day 2 visit. What are the alternatives?'}">
      <button class="btn pri" ${h(()=>ask($('askin_'+ctx).value,ctx))}>Ask</button></div>
    <div class="muted" style="font-size:12px;margin-top:8px">Scripted in this demo: it recognises a set of common questions. In the product this would be answered by the assistant with the same citations.</div></div></div>`; }
document.addEventListener('keydown',e=>{ const m=/^askin_(\w+)$/.exec(e.target.id||''); if(m&&e.key==='Enter'){ ask(e.target.value,m[1]); render(); const n=$('askin_'+m[1]); if(n) n.focus(); } });

/* ================= Site Transition Plan ================= */
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function partPlan(st,x){ const im=impact(st,x), D=DES(), rows=[];
  if(im.sc!=='yes'||x.d==='SCR') return {x,rows,sc:im.sc,next:null,blocked:false};
  const rand=addDays(TODAY,-x.d);
  TPS.filter(t=>S.dec[t.sug]!=='rejected').forEach(t=>{ const r=pkRef(t,rand), past=t.d<=x.d, dow=r.nom.getDay(), wk=dow===0||dow===6;
    let book=r.nom, note='';
    if(!past&&wk){ if(t.h48) note='Weekend, cannot move (±1 h). Arrange cover.'; else { book=addDays(r.nom,dow===6?-1:1); note=`Moved from ${DOW[dow]} to stay within ±24 h`; } }
    rows.push({t,past,nom:r.nom,book,wk:!past&&wk,fixed:!past&&wk&&t.h48,note,hrs:r.hrs,win:t.h48?'± 1 h':'± 24 h',
      edc:{events:`Visit ${t.id}`,rows:`Row on PK form, Visit ${CONT(t).slice(1)}`,unsch:'Add “PK Sampling” visit'}[D.kind]}); });
  const up=rows.filter(r=>!r.past); return {x,rows,sc:'yes',up,next:up[0]||null,blocked:x.rc===false&&up.length>0};
}
function sitePlan(st){ const ps=st.subs.map(x=>partPlan(st,x)), aff=ps.filter(p=>p.up&&p.up.length);
  return {ps,aff,visits:aff.reduce((n,p)=>n+p.up.length,0),weekend:aff.reduce((n,p)=>n+p.up.filter(r=>r.wk).length,0),fixed:aff.reduce((n,p)=>n+p.up.filter(r=>r.fixed).length,0),
    blocked:aff.filter(p=>p.blocked).length,done:aff.filter(p=>S.plan[p.x.id]).length,maybe:ps.filter(p=>p.sc==='maybe').length}; }
const planDone=st=>{const p=sitePlan(st);return p.done>=p.aff.length;};
const fdt=d=>`${DOW[d.getDay()]} ${fd(d)}`;
function handling(p){ const d=p.x.d, n=p.up.length, past=p.rows.length-n;
  return past===0?`Dosed on Day 0; all ${n} new samples still lie ahead. Follow the full new schedule.`
    :d<70?`Already past ${past} of the first-dose samples. Do not back-fill them. Collect the ${n} that remain, starting ${fdt(p.next.book)}.`
    :`Past the first-dose samples and ${past-3>0?(past-3)+' of the last-dose samples':'into the last-dose period'}. Collect the ${n} that remain, starting ${fdt(p.next.book)}.`; }
const tm=d=>`${fdt(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
const whyRow=(n,what,val,src)=>`<tr><td class="n">${n}</td><td class="w">${what}</td><td>${val}</td><td class="s">${src}</td></tr>`;
const chgLink=(id,l)=>id&&sug(id)?`<a ${h(()=>changeCard(id))}>${l||id}</a>`:'the approved casebook';
/* Level 2: why one sample has this date. Four short steps, each with where it comes from. */
function sampleWhy(st,p,r){ const x=p.x, rand=addDays(TODAY,-x.d), ref=pkRef(r.t,rand), last=r.t.d>=70, rec=x.d>=(last?70:0), dow=r.nom.getDay(), wk=dow===0||dow===6, dn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const cal=r.past?`This time was before today (study day ${x.d}), so the sample is not asked for and no query is raised.`
    :!wk?`${dn[dow]} is a working day. Booked as calculated.`
    :r.fixed?`${dn[dow]}. The window is only ±1 hour, so the sample cannot move to a weekday. Booked as calculated and flagged so the site can arrange cover.`
    :`${dn[dow]}. Moved to ${dn[r.book.getDay()]} at the same time, which is 24 hours ${dow===6?'earlier':'later'} and still inside the ±24 hour window.`;
  return `<table class="why">
    ${whyRow(1,'What the protocol asks',`A PK blood sample <b>${r.hrs} hours</b> after the ${last?'6th (last)':'1st'} dose, allowed window <b>${r.win}</b>.`,`<a ${h(()=>openPdf(51))}>Protocol p. 51, Section 6.2.5</a>`)}
    ${whyRow(2,'This participant’s dose',`${last?'6th':'1st'} dose ${rec?'started':'is planned for'} <b>${tm(ref.dose)}</b>.${rec?'':' The plan updates to the actual time once dosing is recorded.'}`,rec?`Recorded by the site · IMP Administration form, Visit ${last?7:2}`:`Calculated · 1st dose date + 70 days`)}
    ${whyRow(3,'Adding the hours',`${tm(ref.dose)} + ${r.hrs} h = <b>${tm(r.nom)}</b>`,'Calculated · same result every time')}
    ${whyRow(4,r.past?'Why it is not requested':'Checking the calendar',cal,r.past?`Rule · no data is asked for in retrospect`:`Rule · move only if the window allows it`)}
    ${r.past?'':whyRow(5,'Where to enter it',`${r.edc} in Data Entry.`,`From ${chgLink(rid('events')||rid('cont'),'the approved change')}, signed by the sponsor`)}</table>`; }
/* Level 1: what the plan for one participant rests on. */
function planWhy(st,p){ const x=p.x, rand=addDays(TODAY,-x.d), d1=pkRef(TPS[0],rand).dose, c=S.plan[x.id];
  return `<div class="whybox"><table class="why">
    ${whyRow('','In the PK subgroup','<b>Yes</b>',`Recorded by the site · Randomisation form, PK substudy = Yes`)}
    ${whyRow('','1st dose',`<b>${tm(d1)}</b>, so today is study day ${x.d}`,`Recorded by the site · IMP Administration form, Visit 2`)}
    ${whyRow('','Samples asked for',`${p.up.length} of ${p.rows.length}. ${p.rows.length-p.up.length?`The other ${p.rows.length-p.up.length} fell before today and are not asked for.`:'None has passed yet.'}`,'Rule · no data is asked for in retrospect')}
    ${whyRow('','PK consent form v2.0',x.rc?'<b>Signed</b>':'<b>Not signed yet</b>. No sample may be taken until it is.',`Recorded by the site · Document Exchange`)}
    ${whyRow('','Rules applied',`Casebook version 2${S.design?', option '+S.design:''}: who gets the samples (${chgLink(rid('scope'))}), the ±1 hour check (${chgLink(rid('win48'))}) and the ±24 hour check (${chgLink(rid('winTime')||rid('winDay'))}).`,S.signed?`Signed by ${S.signed.by}, sponsor · ${S.signed.at}`:'Not yet signed by the sponsor')}
    ${whyRow('','Confirmed at the site',c?`<b>${c.by}</b> · ${c.at}`:'Not yet. Until then this is a proposal.',c?'Recorded by the site':'Waiting for the site coordinator')}</table>
    <div class="muted" style="margin-top:6px">Nothing here was written by the AI. Every date is calculated from the dose time, so you can redo it by hand. Click a sample row to see the steps for that date.</div></div>`; }
function planTable(st,edit){ const pl=sitePlan(st);
  if(!pl.aff.length) return `<div class="note blue"><div>${pl.maybe?`No participant at this site needs a new plan today. ${pl.maybe} participant(s) in screening will get one automatically if they are assigned to the PK subgroup at randomisation.`:'No participant at this site is affected, so there is nothing to re-plan.'}</div></div>`;
  return pl.aff.map(p=>{ const x=p.x, open=S.open['pl'+x.id]!==false, ok=S.plan[x.id];
    return `<div class="card plan"><h2 style="cursor:pointer" ${h(()=>{S.open['pl'+x.id]=!open})}>${open?'▾':'▸'} ${x.id} <span class="muted" style="font-weight:400">Study day ${x.d} · ${p.up.length} new sample(s) to schedule · next ${fdt(p.next.book)}</span>
        ${p.blocked?'<span class="pill dec">Blocked: consent v2.0 not signed</span>':''}${p.up.some(r=>r.fixed)?'<span class="pill med">Weekend sample</span>':''}
        <span style="margin-left:auto">${ok?`<span class="dstat accepted">Plan confirmed</span>`:edit?`<button class="btn sm pri" ${h(e=>{e.stopPropagation&&e.stopPropagation();S.plan[x.id]={by:me().n,at:now()};log(`Transition plan confirmed for ${x.id}: ${p.up.length} new sample(s), first ${fd(p.next.book)}`,st.id);})}>Confirm plan</button>`:'<span class="muted">Not yet confirmed by the site</span>'}</span></h2>
      ${open?`<div class="bd"><p style="margin:0 0 10px"><b>Recommended handling.</b> ${handling(p)}${p.blocked?` <b>Consent first:</b> the PK substudy consent form (v2.0) must be signed before ${fdt(p.next.book)}.`:''}
          <a style="margin-left:8px;white-space:nowrap" ${h(()=>{S.open['pw'+x.id]=!S.open['pw'+x.id]})}>${S.open['pw'+x.id]?'▾ Hide what this plan is based on':'▸ What is this plan based on?'}</a></p>${S.open['pw'+x.id]?planWhy(st,p):''}
        <table class="v"><tr><th>Sample</th><th>Was in version 1</th><th>Now in version 2</th><th>Nominal date and time</th><th>Window</th><th>Suggested booking</th><th>Enter in EDC as</th><th>Status</th></tr>
        ${p.rows.map(r=>{const k='pr'+x.id+r.t.id, on=S.open[k]; return `<tr class="click ${r.past?'dim':''} ${on?'sel':''}" title="Click to see how this date was worked out" ${h(()=>{S.open[k]=!on})}><td class="nw">${on?'▾':'▸'} <b>Day ${r.t.day}</b> · ${r.hrs} h after ${r.t.d>=70?'6th':'1st'} dose</td><td class="muted">Not collected</td><td>PK blood sample</td>
          <td class="nw">${fdt(r.nom)} ${String(r.nom.getHours()).padStart(2,'0')}:00</td><td class="nw">${r.win}</td>
          <td>${r.past?'<span class="muted">—</span>':`<b>${fdt(r.book)}</b>${r.note?`<div style="font-size:12px;color:${r.fixed?'var(--red)':'var(--amber)'}">${r.note}</div>`:''}`}</td>
          <td class="nw">${r.past?'<span class="muted">—</span>':r.edc}</td>
          <td>${r.past?'<span class="muted">Passed before version 2. Not expected, no query.</span>':p.blocked?'<span class="pill dec">Needs consent</span>':'<span class="pill blue">To schedule</span>'}</td></tr>${on?`<tr class="exp"><td colspan="8">${sampleWhy(st,p,r)}</td></tr>`:''}`;}).join('')}</table></div>`:''}</div>`; }).join(''); }
function planExport(st,kind){ const pl=sitePlan(st), rows=pl.aff.flatMap(p=>p.up.map(r=>({id:p.x.id,r,blocked:p.blocked})));
  if(kind==='csv') return download(`${st.id}_transition_plan.csv`,['Participant,Sample day,Hours after dose,Nominal date,Suggested booking,Window,Enter in EDC as,Note,Consent'].concat(rows.map(o=>[o.id,o.r.t.day,o.r.hrs,fd(o.r.nom),fd(o.r.book),o.r.win,o.r.edc,o.r.note,o.blocked?'Not signed':'OK'].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n'),'text/csv');
  const z=d=>`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T090000`;
  return download(`${st.id}_pk_samples.ics`,['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Audit demo//EN'].concat(rows.flatMap((o,i)=>['BEGIN:VEVENT',`UID:${st.id}-${o.id}-${o.r.t.id}@amendment-assist.demo`,`DTSTART:${z(o.r.book)}`,`SUMMARY:PK sample ${o.r.hrs} h - ${o.id} (CTJ301UC201)`,`DESCRIPTION:Day ${o.r.t.day}. Window ${o.r.win}. ${o.r.edc}.${o.blocked?' CONSENT v2.0 NOT YET SIGNED.':''}`,'END:VEVENT'])).concat(['END:VCALENDAR']).join('\r\n'),'text/calendar'); }
function planSummary(st){ const pl=sitePlan(st); return `<div class="tiles4">
  <div><b>${pl.aff.length}</b><span>participant(s) need a new plan</span></div><div><b>${pl.visits}</b><span>new samples to schedule</span></div>
  <div class="${pl.weekend?'w':''}"><b>${pl.weekend}</b><span>fall on a weekend${pl.fixed?` · ${pl.fixed} cannot move`:''}</span></div><div class="${pl.blocked?'b':''}"><b>${pl.blocked}</b><span>blocked until consent v2.0 is signed</span></div>
  <div><b>${pl.done} of ${pl.aff.length}</b><span>plans confirmed</span></div></div>`; }
function vSitePlan(){ const st=site(S.mySite), pl=sitePlan(st), live=!!S.dep[st.id];
  return scPage([['Transition Plan',null,1]],`
    <div class="card"><h2>How version 2 maps onto your participants already in the trial</h2><div class="bd">
      ${live?'':'<p style="margin:0 0 12px">Version 2 is not active at your site yet, so this is a preview.</p>'}
      ${planSummary(st)}
      <p style="margin:12px 0 0"><a ${h(()=>{S.open.plhow=!S.open.plhow})}>${S.open.plhow?'▾ Hide how this plan is worked out':'▸ How is this plan worked out, and why can I rely on it?'}</a></p>
      ${S.open.plhow?`<div class="whybox"><table class="why">
        ${whyRow(1,'It starts from the protocol','Samples are due 48, 144 and 240 hours after the 1st and the 6th dose, and 480 hours after the 6th. Windows: ±1 hour at 48 hours, ±24 hours for the rest.',`<a ${h(()=>openPdf(51))}>Protocol p. 51</a>`)}
        ${whyRow(2,'It uses each participant’s own dose time','Taken from the dosing form your site entered. Nothing is estimated for doses already given.','Recorded by the site')}
        ${whyRow(3,'It adds the hours','Dose time plus the protocol hours gives the date and time. No AI judgement is involved.','Calculated · same result every time')}
        ${whyRow(4,'It checks the calendar','A weekend sample moves to the nearest weekday only when the window allows it. Otherwise it is flagged, not hidden.','Rule')}
        ${whyRow(5,'A person confirms it','The plan is a proposal until your coordinator confirms each participant. Confirmations are in the audit trail.','Recorded by the site')}</table>
        <div class="muted" style="margin-top:6px">Open a participant below for what their plan is based on, then click any sample for the steps behind its date. <a ${h(()=>actModal(aiActs().find(a=>a.id==='AI-09')))}>See this step in the AI Record</a></div></div>`:''}
      <div class="decide" style="margin-top:12px"><button class="btn" ${pl.aff.length?h(()=>planExport(st,'ics')):'disabled'}>Add to calendar (.ics)</button><button class="btn" ${pl.aff.length?h(()=>planExport(st,'csv')):'disabled'}>Export plan (CSV)</button>
        ${pl.aff.length&&pl.done<pl.aff.length?`<button class="btn org" ${h(()=>{pl.aff.forEach(p=>{ if(!S.plan[p.x.id]) S.plan[p.x.id]={by:me().n,at:now()}; });log(`Transition plan confirmed for all ${pl.aff.length} affected participants`,st.id);})}>Confirm all plans</button>`:''}
        <a style="margin-left:auto" ${go('site','changes')}>Back to Amendment Changes</a></div></div></div>
    ${planTable(st,true)}${askBox('site')}`); }
