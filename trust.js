/* PAMIS – AI Record. For everything the assistant drafted or a fixed rule calculated in this amendment:
   what it was based on, how it was tested, what the assistant was unsure of, and which named person reviewed it.
   Loaded before app.js. Test results are simulated in this demo; the rules they describe run live in Data Entry. */

const AI={n:'PAMIS assistant',o:'AI'};
const aiLog=(x,sid,ref)=>log(x,sid,AI,ref);
const KIND={ai:['AI draft','Written by the assistant after reading the documents. It can be wrong, so a named person has to review it.'],
  calc:['Calculated','Worked out by a fixed rule from recorded data. The same inputs always give the same result, and the rule is shown.']};
const kindPill=k=>`<span class="kind ${k}" title="${KIND[k][1]}">${KIND[k][0]}</span>`;
const pgs=l=>l.map(p=>`<a ${h(()=>openPdf(p))}>p. ${p}</a>`).join(', ');
const srcPages=s=>s.ev?[...new Set(s.ev.map(b=>b.p))]:[];

/* ---------- one schema change ---------- */
function basis(s){
  if(s.conf==='dec') return ['dec','Protocol is unclear','The protocol gives two different answers. The assistant did not choose between them; a person decides.'];
  if(!s.ev) return ['med','Inferred, not in the protocol','This is not written in the protocol. It copies how the study already treats the same data. Reject it if that is not wanted.'];
  if(s.rule) return ['blue','Interpreted from the protocol','The rule wording is the assistant’s reading of the protocol text. Compare it with the cited page.'];
  return ['high','Copied from the protocol','Nothing flagged. The values are taken as written from the cited page.'];
}
const TESTS={
  events:[['Test participant in the PK subgroup, at Day 0','The new visits appear on the protocol days'],['Test participant already past the sample day','No visit is created in the past'],['Existing visits V0 to V9','Days and windows unchanged']],
  scope:[['Randomisation form: PK substudy = Yes','The new PK samples are added'],['PK substudy = No','Nothing is added'],['Still in screening, not yet answered','Nothing is added until randomisation']],
  form:[['Open one of the new PK samples','Only the PK form is shown'],['PK form at an existing visit','Same items as before']],
  winDay:[['Visit dated on the planned day','No query'],['Visit dated 1 day late','No query'],['Visit dated 3 days late','Query: outside the visit window']],
  win48:[['Sample taken 48 h 30 min after the dose','No query'],['Sample taken 50 h after the dose','Query PK_48H_WINDOW'],['Sample taken 46 h after the dose','Query PK_48H_WINDOW']],
  winTime:[['Sample taken 20 h later than planned','No query'],['Sample taken 30 h later than planned','Query PK_TIME_WINDOW']],
  codelist:[['Pick 48 h, 144 h, 240 h or 480 h on the PK form','Each can be selected'],['The seven existing timepoints','Unchanged and still selectable']],
  cmp:[['Sample dated before the first dose','Query CMP_PK_01'],['Sample dated after the first dose','No query']],
  sdv:[['PK form at a new sample','Listed for source data verification'],['All other forms','Review plan unchanged']],
  cont:[['Test participant in the PK subgroup','There is a place to enter each new sample'],['Participant outside the PK subgroup','Nothing new to enter']] };
const GAPT={pm1:[['Day 76 visit dated 1 day late','No query'],['Day 76 visit dated 3 days late','Query: outside the visit window']],
  exact:[['Day 76 visit dated on Day 76','No query'],['Day 76 visit dated 1 day late','Query: outside the visit window']],
  open:[['Day 76 visit on any date','No query, because no window is set'],['Protocol clarification','Request is logged']]};
function tests(s){
  const wait=s.opts&&!S.opt[s.id], l=s.role==='winGap'?(GAPT[S.opt[s.id]]||GAPT.pm1):TESTS[s.role]||[['Build in a test copy of the study','Builds without errors']];
  return {l,st:S.dec[s.id]==='rejected'?'off':wait?'wait':'pass'};
}
const testLine=s=>{const t=tests(s);return t.st==='pass'?`${t.l.length} of ${t.l.length} test cases pass`:t.st==='wait'?'Not run yet: waits for your decision':'Not built: change rejected';};
const revs=s=>S.log.filter(e=>e.o!=='AI'&&((e.ref&&e.ref.sug===s.id)||e.x.includes(s.id))).slice().reverse();
function decidedBy(s){ const d=S.dec[s.id]; if(d==='pending') return null; const e=revs(s).filter(x=>/accept|reject/i.test(x.x)).pop(); return e?`${e.u}, ${e.o} · ${e.t}`:S.signed?`${S.signed.by}, Sponsor · ${S.signed.at}`:'Recorded in the audit trail'; }
function custody(s){ const d=S.dec[s.id], t=tests(s).st, el=SITES.filter(eligible).length, nd=Object.keys(S.dep).length, na=Object.keys(S.ack).length;
  const steps=[['Protocol',s.ev?'ok':'warn',s.ev?'p. '+srcPages(s).join(', '):'Not in protocol'],['AI draft','ok','18 May 2017'],['Tests',t==='pass'?'ok':'wait',t==='pass'?'Passed':t==='wait'?'Waiting':'Not built'],
    ['Sponsor decision',d==='accepted'?'ok':d==='rejected'?'bad':'wait',d==='pending'?'Waiting':d[0].toUpperCase()+d.slice(1)],['Sponsor signature',S.signed?'ok':'wait',S.signed?S.signed.at:'Waiting'],
    ['CRO activation',nd?'ok':'wait',`${nd} of ${el} sites`],['Site sign-off',na?'ok':'wait',`${na} of ${nd||el} sites`]];
  return `<div class="cust">${steps.map(x=>`<div class="${x[1]}"><i></i><b>${x[0]}</b><span>${x[2]}</span></div>`).join('')}</div>`; }
function trustBrief(s){ const b=basis(s), by=decidedBy(s);
  return `<div class="sec trust"><label>Can I trust this? <a ${h(()=>changeCard(s.id))}>See the full record</a></label><table class="tb">
    <tr><td>Based on</td><td><span class="pill ${b[0]}">${b[1]}</span> ${s.ev?pgs(srcPages(s)):''}</td></tr>
    <tr><td>Tested</td><td>${testLine(s)}</td></tr>
    <tr><td>The assistant’s doubt</td><td>${b[2]}</td></tr>
    <tr><td>Reviewed by a person</td><td>${by?`${icon(S.dec[s.id]==='accepted'?'ok':'bad')} ${by}`:`${icon('wait')} Nobody yet. It stays a draft until you decide.`}</td></tr></table></div>`; }
function trustRecord(s){ const b=basis(s), t=tests(s), r=revs(s), res={pass:`${icon('ok')} Pass`,wait:`${icon('wait')} Not run`,off:'<span class="muted">Not built</span>'}[t.st];
  const step=(n,l,body)=>`<div class="tstep"><u>${n}</u><div><label>${l}</label>${body}</div></div>`;
  return `${custody(s)}
    ${step(1,'Where it came from',`<p><span class="pill ${b[0]}">${b[1]}</span></p>${evidence(s)}`)}
    ${step(2,'What the assistant did, in plain words',`<p>${s.why}</p><div class="ba"><div><small>Casebook v1 (current)</small>${s.before||'—'}</div><i>→</i><div class="after"><small>Casebook v2 (proposed)</small>${s.after||'—'}</div></div>${s.rule?`<pre class="rule">${s.rule}</pre>`:''}`)}
    ${step(3,'How it was tested',`<table class="v"><tr><th>Test data entered</th><th>What should happen</th><th>Result</th></tr>${t.l.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td class="nw">${res}</td></tr>`).join('')}</table>
      <p class="muted" style="margin:6px 0 0">Run on made-up participants in a test copy, never on real data. <a ${h(()=>{closeM();nav('edc',null,{edc:{site:'CN-101',sub:'CN101-002',ev:null,prev:true}});})}>Try it yourself in Data Entry</a></p>`)}
    ${step(4,'What the assistant is not sure about',`<p>${b[2]}</p>${S.why[s.id]?`<div class="note">${icon('bad')}<div><b>Reviewer’s reason for rejecting:</b> ${S.why[s.id]}</div></div>`:''}`)}
    ${step(5,'Who reviewed it',r.length?`<table class="v"><tr><th>When</th><th>Who</th><th>What they did</th></tr>${r.map(e=>`<tr><td class="nw muted">${e.t}</td><td class="nw">${e.u} · ${e.o}${e.s?' · '+e.s:''}</td><td>${e.x}</td></tr>`).join('')}</table>`
      :`<p>${icon('wait')} No person has reviewed this yet. It is a draft and changes nothing until the sponsor decides and signs.</p>`)}`; }

/* ---------- everything automated, across sponsor, CRO and site ---------- */
function aiActs(){
  const D=DES(), el=SITES.filter(eligible), nd=Object.keys(S.dep).length, na=Object.keys(S.ack).length, opt=S.log.find(e=>/^Schema option/.test(e.x));
  const nAff=total(s=>stats(s).aff), sAff=SITES.filter(s=>stats(s).aff).length, scr=total(s=>s.subs.filter(x=>x.pk===null).length);
  const tk=SITES.flatMap(siteTasks), tkd=tk.filter(t=>t.st==='done').length, pl=SITES.map(sitePlan), pa=pl.reduce((n,p)=>n+p.aff.length,0), pd=pl.reduce((n,p)=>n+p.done,0), wk=pl.reduce((n,p)=>n+p.weekend,0), bl=pl.reduce((n,p)=>n+p.blocked,0);
  const nq=S.chat.sponsor.length+S.chat.site.length, sign=S.signed?`${S.signed.by}, Sponsor · ${S.signed.at}`:null, optBy=opt?`${opt.u}, ${opt.o} · ${opt.t}`:null;
  const toOpt=()=>nav('sponsor','assist',{sTab:'options'}), toChg=()=>nav('sponsor','assist',{sTab:S.design?'changes':'options'}), toApp=()=>nav('sponsor','assist',{sTab:S.design?'approve':'options'});
  return [
   {id:'AI-01',st:'sponsor',k:'ai',t:'Read Protocol Ver. 1.1 and found what differs from casebook version 1',out:'7 new PK blood samples (Days 2, 6, 10, 72, 76, 80, 90), for the Mainland China PK subgroup only.',src:[44,45,51],
    checks:[['ok','Every finding points to a protocol page','Table 1 (p. 44), footnote e (p. 45) and Section 6.2.5 (p. 51).'],['ok','The rest of the schedule was compared too','Visits V0 to V9 match casebook version 1.'],['warn','The protocol disagrees with itself in one place','Day 76: Table 1 gives no window, Section 6.2.5 says ±24 hours.']],
    unsure:['The Day 76 window. It is left for the sponsor to decide.','Protocol Ver. 1.0 is not on file, so the comparison is against the casebook, not against the earlier protocol text.'],
    rev:{ok:!!S.design,txt:optBy||'Sponsor data manager: confirm by choosing a schema option'},go:toOpt},
   {id:'AI-02',st:'sponsor',k:'ai',t:'Drafted four ways to build the change, with pros, cons and a recommendation',out:'Options A to D. Option A is recommended; the reasons against B, C and D are written out.',src:[44,45],
    checks:[['ok','The numbers on each option are calculated, not estimated','Visits, participants and sites are counted from the study data.'],['ok','The recommendation gives its reasons','And the reasons against each other option.']],
    unsure:['Which trade-off matters most at your sites is a judgement. The comparison shows the trade-offs; it does not weigh them for you.'],
    rev:{ok:!!S.design,txt:S.design?`Option ${S.design} chosen · ${optBy||'recorded in the audit trail'}`:'Sponsor data manager: choose an option, or say why none fit'},go:toOpt},
   {id:'AI-03',st:'sponsor',k:'ai',t:`Drafted ${SUG.length} schema changes${S.design?' for Option '+S.design:''}`,out:'Each change shows the protocol page it came from, its test results and the assistant’s doubt.',src:[44,45,51],kids:1,
    checks:[[SUG.every(s=>s.ev)?'ok':'warn',`${SUG.filter(s=>s.ev).length} of ${SUG.length} cite the protocol`,SUG.some(s=>!s.ev)?`${SUG.filter(s=>!s.ev).map(s=>s.id).join(', ')} are inferred from the existing build and are marked as such.`:'Each has a page reference.'],
      ['ok','Each was tested on made-up participants','In a test copy of the study, never on real data.'],[SUG.some(s=>s.conf==='dec')?'warn':'ok',`${SUG.filter(s=>s.conf==='dec').length} left for a person to decide`,'Where the protocol is unclear the assistant does not choose.']],
    unsure:SUG.filter(s=>s.conf!=='high').map(s=>`${s.id}: ${basis(s)[1].toLowerCase()}.`),
    rev:{ok:!!S.design&&reviewed()===SUG.length,txt:S.design?`${reviewed()} of ${SUG.length} decided by the sponsor`:'Sponsor data manager: accept or reject each one'},go:toChg},
   {id:'AI-04',st:'sponsor',k:'calc',t:'Checked what does not change',out:`${NOCHANGE.length} areas compared between version 1 and version 2 with no difference.`,rule:'Every event, form, item, codelist and rule in version 2 is compared with version 1. Anything not listed as a change is identical.',
    checks:NOCHANGE.map(n=>['ok',n[0],n[1]]),unsure:[],rev:{ok:!!S.signed,txt:sign||'Sponsor signature on casebook version 2'},go:()=>nav('sponsor','compare')},
   {id:'AI-05',st:'sponsor',k:'calc',t:'Validated the casebook that results from the sponsor’s decisions',out:Array.isArray(S.val)?`${S.val.filter(c=>c[0]==='ok').length} checks passed, ${S.val.filter(c=>c[0]==='warn').length} warning(s), ${S.val.filter(c=>c[0]==='bad').length} failed.`:'Not run yet.',
    rule:'The casebook is built from the accepted changes only, then every rule is compiled against it and existing data is checked for anything that would be altered.',
    checks:Array.isArray(S.val)?S.val:[['wait','Validation has not been run','It runs once every change has a decision.']],unsure:[],rev:{ok:!!S.signed,txt:sign||'Sponsor signature on casebook version 2'},go:toApp},
   {id:'AI-06',st:'cro',k:'calc',t:'Worked out which sites and participants are affected',out:`${nAff} participant(s) at ${sAff} site(s) get new samples. ${SITES.length-sAff} site(s) see no change in data entry.`,
    rule:`A participant is affected when ${pkOnly()?'they are in the PK subgroup and ':''}they have not yet passed the study day of a new sample. Participants already past it are not asked for data in retrospect.`,
    checks:[['ok','Counted from each participant’s study day','Open any site to see the count per participant.'],[scr?'warn':'ok',`${scr} participant(s) still in screening`,'Their PK subgroup is not known until randomisation, so they are shown as “to be confirmed”.']],
    unsure:scr?['Participants in screening: the count can rise when they are randomised.']:[],rev:{ok:nd>0&&nd>=el.length,txt:`CRO activated ${nd} of ${el.length} ready sites`},go:()=>nav('cro','rollout')},
   {id:'AI-07',st:'cro',k:'calc',t:'Held back sites that are not ready',out:`${el.length} site(s) can be activated. ${SITES.length-el.length} held: ${SITES.filter(s=>!s.irb).map(s=>s.id).join(', ')||'none'}.`,
    rule:'A site can be moved to version 2 only when its ethics committee approval of Protocol Ver. 1.1 is recorded. The system blocks activation otherwise.',
    checks:[['ok','Approval dates come from the site record','Entered by the CRA, not by the assistant.'],['ok','Held sites stay on version 1','Nothing changes for them until approval is recorded.']],unsure:[],
    rev:{ok:S.jobs.length>0,txt:S.jobs.length?`${S.jobs[0].by}, CRO · ${S.jobs[0].at}`:'CRO site manager signs each activation'},go:()=>nav('cro','rollout')},
   {id:'AI-08',st:'cro',k:'ai',t:'Drafted the readiness tasks for each site',out:`${tk.length} tasks across ${SITES.length} sites, such as re-consent, staff briefing and sample kits.`,src:[51],
    checks:[['ok','Each task names the change that caused it','If the sponsor rejects that change, the task disappears.'],['ok','A task is closed only with proof','A document reference or a note, entered by the site.']],
    unsure:['Whether a site needs extra local steps. Sites can report that through a change request.'],rev:{ok:tkd===tk.length,txt:`Sites closed ${tkd} of ${tk.length} with proof`},go:()=>nav('cro','site',{siteTab:'tasks'})},
   {id:'AI-09',st:'site',k:'calc',t:'Mapped the new schedule onto each participant already in the trial',out:`${pa} participant plan(s). ${wk} sample(s) fall on a weekend; ${bl} participant(s) cannot be sampled until they re-consent.`,
    rule:'Planned date = the participant’s dose date plus the protocol’s hours (48, 144, 240 or 480). A weekend sample moves to the nearest weekday only when the ±24 hour window allows it; 48 hour samples (±1 hour) are never moved.',
    checks:[['ok','Dates can be redone by hand','Each row shows the dose date and the hours added.'],['ok','Problems are flagged, not hidden','Weekend samples and missing re-consent are marked on the plan.']],
    unsure:[],rev:{ok:pa>0&&pd>=pa,txt:`Site coordinators confirmed ${pd} of ${pa} plans`},go:()=>nav('site','plan')},
   {id:'AI-10',st:'site',k:'ai',t:'Answered questions typed to the assistant',out:`${nq} answer(s) so far, for sponsor and site users.`,src:[51],
    checks:[['ok','An answer never changes anything','It is advice. Changes go through decisions and signatures.'],['ok','Each question and answer is in the audit trail','Marked as written by AI.']],
    unsure:['Answers are not reviewed by a person. Check the cited page before acting on one.'],rev:{ok:null,txt:'No sign-off: advice only'},go:()=>nav(S.role==='site'?'site':'sponsor',S.role==='site'?'plan':'schedule')}];
}
function trustNums(){ const a=aiActs(), need=a.filter(x=>x.rev.ok!==null), ch=SUG.filter(s=>S.dec[s.id]!=='pending').length;
  return {a,ai:a.filter(x=>x.k==='ai').length-1+SUG.length,calc:a.filter(x=>x.k==='calc').length,done:need.filter(x=>x.rev.ok).length,need:need.length,wait:need.filter(x=>!x.rev.ok).length,
    doubt:SUG.filter(s=>s.conf!=='high').length+1,ch}; }
function trustBar(){ const n=trustNums();
  return `<div class="trustbar"><span class="assist">AI Record</span><span>${n.ai} items drafted by AI · ${n.calc} calculated by rule · <b>${n.done} of ${n.need}</b> automated steps reviewed by a named person${n.wait?` · ${n.wait} waiting`:''}</span><a ${go(S.role,'trust')}>PAMIS</a></div>`; }
function actModal(a){ const sec=(l,b)=>`<details class="dsec"><summary>${l}</summary><div>${b}</div></details>`;
  $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:720px"><h2>${a.id} ${kindPill(a.k)}<a ${h(closeM)}>Close ✕</a></h2><div class="bd detail">
    <h3>${a.t}</h3><div class="muted">${KIND[a.k][1]}</div>
    ${sec('What it produced',a.out)}
    ${sec(a.k==='ai'?'What it read':'The rule it follows',a.k==='ai'?`Protocol Ver. 1.1, ${pgs(a.src)} and the current casebook. Open the page to check the source yourself.`:a.rule)}
    ${sec('How it was checked',`<ul class="clean">${a.checks.map(c=>`<li>${icon(c[0])}<div><b>${c[1]}</b><br><span class="muted">${c[2]}</span></div></li>`).join('')}</ul>`)}
    ${sec(a.k==='ai'?'What the assistant is not sure about':'What it cannot know',a.unsure.length?`<ul style="margin:0;padding-left:18px">${a.unsure.map(u=>`<li>${u}</li>`).join('')}</ul>`:'Nothing flagged.')}
    ${sec('Reviewed by a person',`${a.rev.ok===null?'':icon(a.rev.ok?'ok':'wait')} ${a.rev.txt}`)}</div>
    <div class="ft"><a ${h(closeM)}>Close</a><button class="btn pri" ${h(()=>{closeM();a.go();})}>Open it</button></div></div></div>`; return false; }
function vTrust(){ const n=trustNums(), f=S.tf||'all', sc=S.role==='site', kids=S.tk!==false;
  const G={sponsor:'Sponsor · building the casebook update',cro:'CRO · rolling it out to sites',site:'Site · applying it to participants'};
  const show=a=>f==='all'||(f==='wait'&&a.rev.ok===false)||(f==='ai'&&a.k==='ai'), rv=r=>r.ok===null?`<span class="muted">${r.txt}</span>`:`${icon(r.ok?'ok':'wait')} ${r.txt}`;
  let rows='',g=''; n.a.filter(show).forEach(a=>{ if(a.st!==g){g=a.st;rows+=`<tr class="grp"><td colspan="5">${G[g]}${g===S.role?' <span class="pill blue">YOUR PART</span>':''}</td></tr>`;}
    const bad=a.checks.filter(c=>c[0]==='warn'||c[0]==='bad').length;
    rows+=`<tr class="click" ${h(()=>actModal(a))}><td class="nw"><a>${a.id}</a></td><td><b>${a.t}</b><div class="muted">${a.out}</div></td><td class="nw">${kindPill(a.k)}</td>
      <td>${a.k==='ai'?'Protocol '+a.src.map(p=>'p. '+p).join(', '):'Fixed rule, shown in the record'}<div class="muted">${a.checks.length-bad} check(s) passed${bad?`, <b style="color:var(--amber)">${bad} flagged</b>`:''}</div></td><td>${rv(a.rev)}</td></tr>`;
    if(a.kids) rows+=`<tr class="kidh"><td></td><td colspan="4"><a ${h(()=>{S.tk=!kids})}>${kids?'▾ Hide':'▸ Show'} the ${SUG.length} changes</a></td></tr>`+(kids?SUG.filter(s=>f!=='wait'||S.dec[s.id]==='pending').map(s=>{const b=basis(s),by=decidedBy(s);
      return `<tr class="click kid" ${h(()=>changeCard(s.id))}><td></td><td><a>${s.id}</a> ${s.title}</td><td class="nw"><span class="pill ${b[0]}">${b[1]}</span></td><td>${s.ev?'Protocol '+srcPages(s).map(p=>'p. '+p).join(', '):'No protocol text'}<div class="muted">${testLine(s)}</div></td>
        <td>${by?`${icon(S.dec[s.id]==='accepted'?'ok':'bad')} ${decTxt(S.dec[s.id])} · ${by}`:`${icon('wait')} Waiting for the sponsor`}</td></tr>`;}).join(''):''); });
  const body=`<div class="tiles4">
      <div><b>${n.ai}</b><span>items drafted by AI</span></div><div><b>${n.calc}</b><span>calculated by a fixed rule</span></div>
      <div><b>${n.done} of ${n.need}</b><span>automated steps reviewed by a named person</span></div><div class="${n.wait?'w':''}"><b>${n.wait}</b><span>waiting for a person</span></div>
      <div class="${n.doubt?'w':''}"><b>${n.doubt}</b><span>doubts the assistant raised itself</span></div></div>
    <div class="bar" style="margin-top:14px"><div class="seg">${[['all','Everything automated'],['wait','Waiting for a person'],['ai','AI drafts only']].map(x=>`<button class="${f===x[0]?'on':''}" ${h(()=>{S.tf=x[0]})}>${x[1]}</button>`).join('')}</div>
      <span class="sp"></span><button class="btn" ${h(()=>{S.af={q:'',org:'AI',site:''};nav(S.role,sc?'admin':'audit');})}>AI entries in the audit trail</button><button class="btn" ${h(openPacket)}>Inspection Packet</button></div>
    <table class="v tr"><tr><th>ID</th><th>What was produced</th><th>How</th><th>Based on · checks</th><th>Reviewed by a person</th></tr>${rows||'<tr><td colspan="5" class="muted">Nothing matches this filter.</td></tr>'}</table>`;
  return sc?scPage([['AI Record',null,1]],body):`<div class="ph"><div><h1>AI Record</h1></div></div>${body}`;
}
