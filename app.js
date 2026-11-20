/* RELAY – concept demo. All study-conduct data (sites, people, subjects, dates, rule names) is invented.
   Protocol facts (visit schedule, PK subgroup scope, sampling windows) are taken from the public protocol PDF in assets/. */

/* ================= Data ================= */
const EV = [
  {id:'V0',  label:'Visit 0 Stabilization', grp:'Run-in',    day:'',          win:''},
  {id:'V1',  label:'Visit 1 Screening',     grp:'Screening', day:'-28 to -6', win:''},
  {id:'V1.1',label:'Visit 1.1 Baseline',    grp:'Screening', day:'-5 to -1',  win:''},
  {id:'V2',  label:'Visit 2 Baseline',      grp:'Treatment', day:'0',  d:0,   win:''},
  {id:'V2.1',label:'V2.1 (PK 48 h)',        grp:'Treatment', day:'2',  d:2,   win:'', sug:'SC-001', h48:1},
  {id:'V2.2',label:'V2.2 (PK 144 h)',       grp:'Treatment', day:'6',  d:6,   win:'±1', sug:'SC-001'},
  {id:'V2.3',label:'V2.3 (PK 240 h)',       grp:'Treatment', day:'10', d:10,  win:'±1', sug:'SC-001'},
  {id:'V3',  label:'Visit 3',               grp:'Treatment', day:'14', d:14,  win:'±1'},
  {id:'V4',  label:'Visit 4',               grp:'Treatment', day:'28', d:28,  win:'±1'},
  {id:'V5',  label:'Visit 5',               grp:'Treatment', day:'42', d:42,  win:'±2'},
  {id:'V6',  label:'Visit 6',               grp:'Treatment', day:'56', d:56,  win:'±2'},
  {id:'V7',  label:'Visit 7',               grp:'Treatment', day:'70', d:70,  win:'±2'},
  {id:'V7.1',label:'V7.1 (PK 48 h)',        grp:'Treatment', day:'72', d:72,  win:'', sug:'SC-002', h48:1},
  {id:'V7.2',label:'V7.2 (PK 144 h)',       grp:'Treatment', day:'76', d:76,  win:'', sug:'SC-002', gap:1},
  {id:'V7.3',label:'V7.3 (PK 240 h)',       grp:'Treatment', day:'80', d:80,  win:'±1', sug:'SC-002'},
  {id:'V8',  label:'Visit 8 (EoT)',         grp:'Treatment', day:'84', d:84,  win:'±2'},
  {id:'V8.1',label:'V8.1 (PK 480 h)',       grp:'Follow-up', day:'90', d:90,  win:'±2', sug:'SC-003'},
  {id:'V9',  label:'Visit 9 Safety Follow-up', grp:'Follow-up', day:'105', d:105, win:'±2'},
];
const ALLV=['V0','V1','V1.1','V2','V3','V4','V5','V6','V7','V8','V9'], NEWV=['V2.1','V2.2','V2.3','V7.1','V7.2','V7.3','V8.1'];
const FORMS = [
  ['DSIC','Informed Consent',['V0','V1']], ['IE','Inclusion/Exclusion Criteria',['V1','V2']],
  ['CM_STAB','Stable Conventional Treatment',ALLV], ['VIRO','HIV, HBV, HCV, EBV, CMV Test',['V1']],
  ['TB','TB Test',['V1','V9']], ['RAND','Randomisation',['V2']], ['DM','Demographics',['V0','V1']],
  ['SU','Alcohol and Tobacco Habits',['V1']], ['MH','Medical and Surgical History',['V1']],
  ['UCHX','UC History and Previous Therapy',['V0','V1']], ['UDS','Urine Screening for Drugs of Abuse',['V1']],
  ['ENDO','Endoscopy incl. Biopsy Sampling',['V1','V8']],
  ['DIARYD','Diary Dispensing',['V1','V1.1','V2','V3','V4','V5','V6','V7']],
  ['DIARYR','Diary Review',['V1.1','V2','V3','V4','V5','V6','V7','V8']],
  ['MAYO','Efficacy – Full Mayo Score',['V2','V8']], ['PMAYO','Efficacy – 9-point Partial Mayo',['V2','V3','V4','V5','V6','V7','V8']],
  ['PK','Blood Sampling for PK',['V2','V3','V4','V5','V6','V7','V8','V9'].concat(NEWV)],
  ['FCP','Faeces Sampling for Calprotectin',['V2','V4','V6','V8']],
];
const TOC = [
  [1,'Title page','Protocol CTJ301UC201, Ver. 1.1, 16 May 2017'],
  [5,'Version of protocol or amendment','V1.0 22 Feb 2017 · V1.1 16 May 2017'],
  [8,'Synopsis – methodology','Randomisation stratified by PK substudy consent'],
  [9,'Synopsis – PK subgroup','Mainland China, 24 patients, sampling timepoints'],
  [44,'Table 1 Time and Events Schedule','Visits, days, allowed windows'],
  [45,'Table 1 (continued) and footnotes','Footnote e: PK subgroup only'],
  [51,'6.2.5 PK Visits','Sampling timepoints and acceptable time windows'],
  [75,'12.1 Protocol Amendments','How amendments are issued and agreed'],
  [78,'Informed consent – new information','Re-consent when new information arises'],
];
const Q = {
  fnE:{p:45,ref:'Table 1, footnote e',html:'e. <mark>For Mainland China PK subgroup only.</mark> At 1st dose: pre-dose and 0.5, 1, 2 (end of infusion), 6, 48, 144 (Day 6), and 240 (Day 10) h after the start of the 1st administration; … At 6th dose: pre-dose and 0.5, 1, 2 (end of infusion), 6, 48, 144 (Day 76), 240 (Day 80), 336 (Day 84), 480 (Day 90), and 840 h (Day 105) after the start of the 6th administration.'},
  sub:{p:51,ref:'Section 6.2.5 PK Visits',html:'TJ301 PK will be assessed in <mark>a subgroup of patients in Mainland China (24 patients, 8 per arm; electronically assigned at randomisation and consenting to the extra procedures)</mark>.'},
  strat:{p:8,ref:'Synopsis, Methodology',html:'Randomisation will be stratified by prior corticosteroids treatment (yes/no) and <mark>consent to participate in PK substudy (yes/no)</mark>.'},
  w48:{p:51,ref:'Section 6.2.5 PK Visits',html:'Acceptable time window of blood sampling for PK shows as below: … <mark>the time window of 48 h post dosing is ‘theoretical timepoint ±1 hour</mark>, …'},
  w144:{p:51,ref:'Section 6.2.5 PK Visits',html:'… <mark>the time window of 144 h post dosing is ‘theoretical timepoint ±24 hour</mark>, the time window of 240 h post dosing is ‘theoretical timepoint ±24 hour, …'},
  tp:{p:51,ref:'Section 6.2.5 PK Visits',html:'At 1st dose: pre-dose and 0.5, 1, 2 (end of infusion), 6, <mark>48, 144 (Day 6), and 240 (Day 10) h</mark> after the start of the 1st administration; … At 6th dose: … <mark>48, 144 (Day 76), 240 (Day 80)</mark>, 336 (Day 84), <mark>480 (Day 90)</mark>, and 840 h (Day 105) … The actual sampling time will be recorded.'},
};
const T=(ctx,hl,o={})=>Object.assign({t:1,p:44,ctx,hl},o);
const SUG = [
 {id:'SC-001',cat:'Schedule',type:'New events',conf:'high',title:'Add events V2.1, V2.2, V2.3 to Treatment Period',
  before:'V2 (Day 0) → V3 (Day 14)', after:'V2 → <b>V2.1 (Day 2)</b> → <b>V2.2 (Day 6)</b> → <b>V2.3 (Day 10)</b> → V3',
  ev:[T(['V2','V2.1','V2.2','V2.3','V3'],['V2.1','V2.2','V2.3']),Q.tp], evs:['V2.1','V2.2','V2.3'],
  diff:[['Event','V2.1','Added','—','Day 2 · Treatment Period'],['Event','V2.2','Added','—','Day 6 · Treatment Period'],['Event','V2.3','Added','—','Day 10 · Treatment Period']],
  why:'Table 1 has three visit columns between Visit 2 and Visit 3 that do not exist in casebook version 1. Section 6.2.5 confirms they are the 48 h, 144 h and 240 h PK samples after the first dose. Each falls on its own study day, so each is a separate event.'},
 {id:'SC-002',cat:'Schedule',type:'New events',conf:'high',title:'Add events V7.1, V7.2, V7.3 to Treatment Period',
  before:'V7 (Day 70) → V8 EoT (Day 84)', after:'V7 → <b>V7.1 (Day 72)</b> → <b>V7.2 (Day 76)</b> → <b>V7.3 (Day 80)</b> → V8',
  ev:[T(['V7','V7.1','V7.2','V7.3','V8'],['V7.1','V7.2','V7.3']),Q.tp], evs:['V7.1','V7.2','V7.3'],
  diff:[['Event','V7.1','Added','—','Day 72 · Treatment Period'],['Event','V7.2','Added','—','Day 76 · Treatment Period'],['Event','V7.3','Added','—','Day 80 · Treatment Period']],
  why:'Same pattern after the sixth (last) dose on Day 70: 48 h, 144 h and 240 h PK samples on Days 72, 76 and 80.'},
 {id:'SC-003',cat:'Schedule',type:'New event',conf:'high',title:'Add event V8.1 to Follow-up Period',
  before:'V8 EoT (Day 84) → V9 (Day 105)', after:'V8 → <b>V8.1 (Day 90)</b> → V9',
  ev:[T(['V8','V8.1','V9'],['V8.1']),Q.tp], evs:['V8.1'],
  diff:[['Event','V8.1','Added','—','Day 90 · Follow-up Period']],
  why:'Table 1 shows a Day 90 visit under the Follow-up Period header. It is the 480 h PK sample after the last dose. Placed in the Follow-up event group to match the header it sits under.'},
 {id:'SC-004',cat:'Schedule',type:'Dynamic rule',conf:'high',title:'Show the new events only for the Mainland China PK subgroup',
  before:'—', after:'New events are added to a casebook only when <b>RAND.PKSUB = Yes</b>',
  rule:'Rule:    DYN_PK_EVENTS\nIf       $V2.RAND.PKSUB = "Yes"\nThen     Add Events  V2.1, V2.2, V2.3, V7.1, V7.2, V7.3, V8.1\nElse     (events are not created)',
  ev:[Q.fnE,Q.sub,Q.strat], scope:1,
  diff:[['Rule','DYN_PK_EVENTS','Added','—','Add 7 PK events when RAND.PKSUB = Yes']],
  why:'The footnote on the PK row limits these samples to the Mainland China PK subgroup, and the subgroup is assigned at randomisation. Without this rule every subject at every site would get seven empty visits and missing-data queries. The existing randomisation item PKSUB already records the assignment, so no new field is needed.'},
 {id:'SC-005',cat:'Schedule',type:'Form assignment',conf:'high',title:'Assign form PK (Blood Sampling for PK) to the 7 new events',
  before:'PK collected at 8 events', after:'PK collected at <b>15 events</b> (+ V2.1, V2.2, V2.3, V7.1, V7.2, V7.3, V8.1)',
  ev:[T(['V2','V2.1','V2.2','V2.3','V3','V7','V7.1','V7.2','V7.3','V8','V8.1','V9'],NEWV,{row:'PK'})],
  diff:[['Schedule','PK @ 7 new events','Added','PK @ 8 events','PK @ 15 events']],
  why:'"Blood sampling for PK assessments" is the only activity marked at the new visits, so only PK is assigned. The existing PK form is reused unchanged.'},
 {id:'SC-006',cat:'Visit windows',type:'Event windows',conf:'high',title:'Set visit windows from Table 1: ±1 day for V2.2, V2.3, V7.3 and ±2 days for V8.1',
  before:'—', after:'V2.2 <b>±1</b> · V2.3 <b>±1</b> · V7.3 <b>±1</b> · V8.1 <b>±2</b>',
  ev:[T(['V2.2','V2.3','V7.3','V8.1'],['V2.2','V2.3','V7.3','V8.1'],{hlRow:'win'})],
  diff:[['Event window','V2.2, V2.3, V7.3','Added','—','±1 day'],['Event window','V8.1','Added','—','±2 days']],
  why:'Copied as written from the "Allowed window for visit (days)" row. For V8.1 the table says ±2 days while Section 6.2.5 gives the 480 h sample ±24 hours; the event window follows the table and the tighter sample window is left to the PK data review.'},
 {id:'SC-007',cat:'Visit windows',type:'Time check',conf:'high',title:'V2.1 and V7.1 (48 h samples): no day window, check sample time ±1 hour instead',
  before:'—', after:'V2.1, V7.1: <b>sample time = dose start + 48 h ± 1 h</b>',
  rule:'Rule:    PK_48H_WINDOW\nIf       abs( PK.PKDTC − $EX.EXSTDTC − 48h ) > 1h\nThen     Open query "PK sample is outside the 48 h ± 1 h window (protocol 6.2.5)."\nScope:   PK form @ V2.1 (vs. V2 dose), V7.1 (vs. V7 dose)',
  ev:[T(['V2','V2.1','V7','V7.1'],['V2.1','V7.1'],{hlRow:'win',gap:1}),Q.w48],
  diff:[['Rule','PK_48H_WINDOW','Added','—','Query when 48 h sample is outside ±1 h']],
  why:'Table 1 leaves the day window blank for Days 2 and 72. Section 6.2.5 explains why: the 48 h sample has a window in hours, not days. A day window would be too loose, so the check is built on the actual sampling time, which the PK form already records.'},
 {id:'SC-008',cat:'Visit windows',type:'Event window',conf:'dec',title:'V7.2 (Day 76): Table 1 gives no window, but Section 6.2.5 says ±24 hours',
  before:'—', after:'Depends on your selection below',
  ev:[T(['V2.2','V7.2'],['V7.2'],{hlRow:'win',gap:1}),Q.w144],
  diff:[['Event window','V7.2','Added','—','(your selection)']],
  why:'The protocol disagrees with itself here. V2.2 and V7.2 are both 144 h samples. Table 1 gives V2.2 a ±1 day window and leaves V7.2 blank, while Section 6.2.5 gives every 144 h sample ±24 hours. This looks like an omission in the table, but that is a judgement, so it is left to you.',
  opts:[['pm1','±1 day, per Section 6.2.5 and matching V2.2','Treats the blank cell in Table 1 as an omission.',true],
        ['exact','Exact day, per Table 1 as written','Any other date opens an out-of-range query.'],
        ['open','No window for now; raise a protocol clarification','V7.2 deploys without a window check and a clarification request is logged.']]},
 {id:'SC-009',cat:'Forms & codelists',type:'Codelist',conf:'high',title:'Add timepoints 48 h, 144 h, 240 h and 480 h to codelist PKTPT',
  before:'Pre-dose, 0.5 h, 1 h, 2 h (EOI), 6 h, 336 h, 840 h', after:'+ <b>48 h, 144 h, 240 h, 480 h</b>',
  ev:[Q.tp], diff:[['Codelist','PKTPT','Modified','7 entries','11 entries']],
  why:'The PK form takes its nominal timepoint from this codelist. Without the new entries the form at the new events could not be completed.'},
 {id:'SC-010',cat:'Rules',type:'Comparison rule',conf:'med',title:'Extend rule CMP_PK_01 to the new events (PK sample date cannot be before first dose)',
  before:'Applies to PK at V3 – V9', after:'Applies to PK at V2.1 – V9',
  rule:'PK.PKDTC  cannot be before  $V2.EX.EXSTDTC\nScope:  + PK form @ V2.1, V2.2, V2.3, V7.1, V7.2, V7.3, V8.1',
  diff:[['Rule','CMP_PK_01','Modified','Scope: V3 – V9','Scope: V2.1 – V9']],
  why:'Not stated in the protocol. Inferred from the existing rule, which already guards every post-baseline PK sample. Reject it if you want the new visits unchecked.'},
 {id:'SC-011',cat:'Review plan',type:'SDV plan',conf:'med',title:'Include PK at the new events in review plan "Critical Data – 100% SDV"',
  before:'PK @ 8 events: SDV required', after:'PK @ <b>15 events</b>: SDV required',
  diff:[['Review plan','Critical Data – 100% SDV','Modified','PK @ 8 events','PK @ 15 events']],
  why:'Not stated in the protocol. PK is 100% SDV at every existing event, so the same requirement is carried over. This adds monitoring work at Mainland China sites: up to 7 extra forms per PK subject.'},
];
initDesigns();
const NOCHANGE = [
  ['Existing events V0 – V9','Study days and windows match casebook version 1.'],
  ['All other forms (17)','None are marked at the new visits in Table 1, so none are added there.'],
  ['PK form items','Actual sampling date and time are already collected. No items added or re-typed.'],
  ['Randomisation form','PKSUB (PK substudy consent) already exists and is reused by the dynamic rule.'],
  ['Existing rules (46)','None reference an object that changes.'],
];
/* Sites: facility, city and country are the real registry locations (ctgov.js). Staff, EC dates and subjects are simulated. */
const HAND={'CN-101':[['SCR'],[1,1],[8,1],[30,0],[58,1],[74,1]],'CN-102':[['SCR'],[12,1],[44,0],[86,1]],'CN-103':[[3,1],[20,1],[61,0],[77,1],['DONE',0]],'CN-104':[['SCR'],['SCR'],[5,0],[15,1],[40,1],[69,1],[92,0]]};
const PEND={'CN-103':'22 May 2017','CN-117':'26 May 2017','TW-302':'30 May 2017'};
const NM={China:[['Lin','Zhao','Wang','Huang','Chen','Liu','Zhang','Yang','Wu','Xu','Sun','Zhou','Gao','Ma','Hu','Guo','He','Luo','Song','Tang','Feng','Deng'],['Meihua','Lei','Fang','Bo','Yu','Yang','Jia','Ning','Hong','Tao','Xia','Jun','Li','Min','Qiang','Yan','Ping','Hui','Wei','Jing','Rui','Lan']],
  'South Korea':[['Seo','Kim','Park','Lee'],['Min-jun','Da-eun','Ji-woo','Su-bin']],Taiwan:[['Tsai','Hsu','Chang','Lin','Wu','Chen'],['Yi-chen','Wei-ting','Chia-hao','Pei-shan','Ya-ting','Kuan-yu']]};
const SITES = CTG.sites.map((c,gi)=>{ const same=CTG.sites.filter(x=>x.ctry===c.ctry), i=same.indexOf(c), [sn,gn]=NM[c.ctry], k=sn.length, cn=c.ctry==='China';
  const pi=sn[i%k]+' '+gn[i%k], coord=sn[(i+Math.ceil(k/2))%k]+' '+gn[(i+Math.ceil(k/2)+1)%k], cra=cn?(i<11?'Grace Fong':'Leo Tan'):'Daniel Oh';
  const pkSite=cn&&i>=4&&i<16, gen=[37,53,71].map((m,j)=>{const v=(gi*m+11+j*18)%100; return v<8?['SCR']:v>96?['DONE',0]:[v,0];});
  if(pkSite){ if(typeof gen[0][0]!=='number') gen[0]=[20,0]; gen[0][1]=1; }
  const raw=HAND[c.id]||gen, irb=PEND[c.id]?null:fd(addDays(pd('01 Jun 2017'),(gi*5)%14));
  return {id:c.id,name:c.name,city:c.city,ctry:c.ctry,pi,coord,cra,irb,sub:PEND[c.id]||null,cn,
    subs:raw.map((x,j)=>({id:c.id.replace('-','')+'-'+String(j+1).padStart(3,'0'),d:x[0],pk:x[1]===undefined?(x[0]==='SCR'&&cn?null:false):!!x[1],rc:x[1]?j%3!==2:null}))}; });
const ME = {sponsor:{n:'Elena Marsh',t:'Clinical Data Manager',o:'Sponsor',u:'elena.marsh@sponsor.example',i:'EM'},
            cro:{n:'Jordan Morgan',t:'Clinical Site Manager',o:'CRO',u:'jordan.morgan@cro.example',i:'JM'}};

/* ================= State ================= */
const S = { role:'home', pg:{sponsor:'assist',cro:'rollout',site:'changes',edc:'main'}, sTab:'options', design:null, cr:[], ret:null, sel:'SC-001', view:'v2',
  dec:{}, opt:{}, val:null, signed:null, pick:{}, dep:{}, ack:{}, read:{}, brief:{}, jobs:[],
  task:{}, msg:{}, form:{}, why:{}, cm:{}, note:{}, af:{q:'',org:'',site:''}, tour:null, schedK:null, chat:{sponsor:[],site:[]}, plan:{}, user:{}, home:'landing', auth:{open:false,mode:'login',role:'sponsor',sid:'CN-101',name:'',org:'',email:'',pw:''}, cf:'', cmp:{}, vTab:'sites', dxTab:'actions', adTab:'audit', cq:'',
  edc:{site:'CN-101',sub:null,ev:null,prev:false}, croSite:'CN-101', siteTab:'overview', mySite:'CN-101', open:{}, docTab:'all', pdf:44, log:[], clock:40 };
SUG.forEach(s=>S.dec[s.id]='pending'); SITES.forEach(s=>S.pick[s.id]=!!s.irb);
const $=id=>document.getElementById(id), sug=id=>SUG.find(s=>s.id===id), evt=id=>EV.find(e=>e.id===id), site=id=>SITES.find(s=>s.id===id);
const now=()=>{const m=S.clock++;return `16 Jun 2017 ${String(10+Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;};
const meSite=()=>S.role==='edc'?S.edc.site:S.mySite;
const ini=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const me=()=>{ const b=me0(), k=S.role==='edc'?'site':S.role, u=S.user[k]; return u&&(k!=='site'||u.sid===meSite())?Object.assign({},b,{n:u.n,u:u.u,i:ini(u.n)}):b; };
const me0=()=>S.role==='site'||S.role==='edc'?{n:site(meSite()).coord,t:'Study Coordinator',o:'Site '+meSite(),u:site(meSite()).coord.toLowerCase().replace(/\W+/g,'.')+'@site.example',i:site(meSite()).coord.split(' ').map(w=>w[0]).join('')}:ME[S.role]||ME.sponsor;
function log(x,sid,who,ref){const m=who||me(); S.log.unshift({t:now(),u:m.n,o:m.o,s:sid||'',x,ref:ref||null});}
(function seed(){
  const sys={n:'System',o:'Vault'}, add=(at,x,sid,m)=>S.log.push({t:at,u:(m||sys).n,o:(m||sys).o,s:sid||'',x});
  add('16 Jun 2017 10:38','Amendment review opened');
  SITES.filter(s=>s.irb).reverse().forEach(s=>add(s.irb+' 09:00','EC approval of Protocol Ver. 1.1 recorded',s.id,{n:s.cra,o:'CRO'}));
  SITES.filter(s=>!s.irb).forEach(s=>add(s.sub+' 14:10','Protocol Ver. 1.1 submitted to EC',s.id,{n:s.coord,o:'Site '+s.id}));
  S.log.push({t:'18 May 2017 08:06',u:'System',o:'Vault',s:'',x:'Site impact calculated from participant study days: counts per site (AI-06)'});
  S.log.push({t:'18 May 2017 08:04',u:'RELAY assistant',o:'AI',s:'',ref:{p:44},x:'Drafted four schema options (A to D) with pros, cons and a recommendation (AI-02). Draft only: nothing changes until a person decides'});
  S.log.push({t:'18 May 2017 08:02',u:'RELAY assistant',o:'AI',s:'',ref:{p:44},x:'Read Protocol Ver. 1.1 and compared it with casebook version 1: 7 new PK samples found, 1 point left for a person to decide (AI-01)'});
  if(0) add('','RELAY compared Protocol Ver. 1.1 with casebook version 1 and drafted 11 suggested changes');
  add('18 May 2017 08:00','Protocol CTJ301UC201 Ver. 1.1 filed (VV-TMF-00412)','',{n:'Elena Marsh',o:'Sponsor'});
  add('06 Mar 2017 11:20','Casebook version 1 deployed to all sites','',{n:'Jordan Morgan',o:'CRO'});
})();

/* ================= Derived ================= */
const evState=e=>e.sug?S.dec[e.sug]:'base';
const liveNew=()=>EV.filter(e=>e.sug&&S.dec[e.sug]!=='rejected');
const pkOnly=()=>!(S.design&&DES().all)&&st('scope')!=='rejected';
function scope(st,x){ if(x.d==='DONE') return 'no'; if(!pkOnly()) return 'yes'; return x.pk===true?'yes':x.pk===null?'maybe':'no'; }
function impact(st,x,evs=liveNew()){
  const sc=scope(st,x), none={sc,add:[],past:[],soon:[]};
  if(sc==='no') return none; if(x.d==='SCR') return {sc,add:evs,past:[],soon:[]};
  const add=evs.filter(e=>e.d>x.d); return {sc,add,past:evs.filter(e=>e.d<=x.d),soon:add.filter(e=>e.d-x.d<=3)};
}
function stats(st,evs){const im=st.subs.map(x=>impact(st,x,evs));return{
  aff:im.filter(i=>i.sc==='yes'&&i.add.length).length, maybe:im.filter(i=>i.sc==='maybe').length,
  soon:im.filter(i=>i.sc==='yes'&&i.soon.length).length, rc:st.subs.filter((x,i)=>im[i].sc==='yes'&&im[i].add.length&&x.rc===false).length};}
const total=(f,l=SITES)=>l.reduce((n,s)=>n+f(s),0);
const reviewed=()=>SUG.filter(s=>S.dec[s.id]!=='pending').length;
const acc=id=>S.dec[id]==='accepted';
function validate(){
  const D=DES(), nTp=TPS.filter(e=>acc(e.sug)).length, c=[], nr=SUG.filter(s=>acc(s.id)&&s.diff.some(d=>d[0]==='Rule'&&d[2]==='Added')).length;
  const chk=(role,bad,good)=>{ if(!rid(role)||!nTp) return; c.push(okR(role)?good:bad); };
  c.push(['ok','Casebook definition v2 builds','No structural errors.']);
  c.push(['ok',`All ${46+nr} rules compile against v2`,'0 broken references.']);
  if(D.retro&&nTp){ const m=total(s=>s.subs.reduce((k,x)=>k+(x.d==='DONE'?3:x.d==='SCR'?0:[0,70,84].filter(v=>v<=x.d).length),0));
    c.push(['warn','An existing form changes layout',`PK at Visits 2, 7 and 8 becomes a repeating form. ${m} submitted PK forms at those visits are migrated to the new layout; values are kept and nothing is deleted.`]); }
  else c.push(['ok','Nothing removed','No existing event, form or item is deleted. 0 submitted data points are altered; no forms are reopened.']);
  chk('form',['bad','New visits have no form',`${nTp} accepted visit(s) would deploy empty because ${rid('form')} is rejected. Accept it or reject the visits.`],['ok','Every new visit has a form',`PK assigned to ${D.kind==='unsch'?'the PK Sampling visit':nTp+' new visit(s)'}.`]);
  if(D.all&&nTp){ const k=total(s=>s.subs.filter(x=>x.d!=='DONE'&&x.pk!==true).length);
    c.push(['warn','New visits are created for every participant',`${k} participant(s) outside the PK subgroup, at all ${SITES.length} sites, will each show ${nTp} visits with nothing to collect. This follows the option you chose; the protocol limits PK sampling to the Mainland China PK subgroup (footnote e).`]); }
  else chk('scope',['bad','New PK samples are not limited to the PK subgroup',`Every participant at all ${SITES.length} sites would be asked for them. The protocol limits them to the Mainland China PK subgroup (footnote e).`],['ok','Limited to the PK subgroup','Sites outside Mainland China see no change in data entry.']);
  const w=[]; [['winDay','V2.2, V2.3, V7.3, V8.1'],['win48','48 h samples'],['winGap','V7.2'],['winTime','144 h, 240 h and 480 h samples']].forEach(([r,t])=>{ if(rid(r)&&nTp&&(!okR(r)||(r==='winGap'&&S.opt[rid(r)]==='open'))) w.push(t); });
  c.push(w.length?['warn','Some new samples have no timing check',`${w.join('; ')} will not raise out-of-window queries.`]:['ok','Timing checks defined','Every new sample has a day window or a sample-time check.']);
  chk('codelist',['warn','PK timepoint codelist not extended','PK forms for the new samples cannot record their nominal timepoint.'],['ok','PK timepoint codelist extended','48 h, 144 h, 240 h and 480 h are available.']);
  if(D.kind==='unsch'&&nTp) c.push(['warn','Missed samples will not be flagged','PK Sampling visits are added by the site, so the system does not know a sample is due. Monitoring has to catch omissions.']);
  if(D.kind==='rows'&&nTp) c.push(['warn','Samples are filed under the dosing visit','Day 2, 6 and 10 samples are entered under Visit 2 (Day 0), and Days 72, 76, 80 under Visit 7. Site staff need to be told.']);
  return c;
}
const valOk=()=>Array.isArray(S.val)&&!S.val.some(c=>c[0]==='bad');
const eligible=s=>!!s.irb;
const siteDocs=s=>[
  {id:'prot',name:'Protocol CTJ301UC201_16 May 2017 (v1.1)',desc:'Clinical trial protocol, supersedes Ver. 1.0',type:'Protocol',num:'VV-TMF-00412',date:'18 May 2017',pdf:1},
  S.signed&&{id:'chg',name:'Casebook Version 2 – Change Report (v1.0)',desc:'What changes in EDC, old vs new',type:'EDC Change Report',num:'VV-TMF-00431',date:S.signed.at.slice(0,11),cmp:1},
  s.cn&&{id:'icf',name:'Informed Consent Form – PK Substudy (v2.0)',desc:'For PK subgroup participants',type:'Informed Consent Form',num:'VV-TMF-00418',date:'19 May 2017'},
  s.cn&&{id:'trn',name:'PK Sampling Windows – protocol section 6.2.5',desc:'Timepoints and acceptable windows',type:'Training Material',num:'VV-TMF-00420',date:'19 May 2017',pdf:51},
  s.irb&&{id:'ec',name:'EC Approval Letter – Protocol Ver. 1.1',desc:'Approval dated '+s.irb,type:'IRB/EC Approval',num:'VV-TMF-00'+(440+SITES.indexOf(s)),date:s.irb},
].filter(Boolean);
const unread=s=>siteDocs(s).filter(d=>!S.read[s.id+d.id]).length;
function ackItems(s){ const r=k=>!!S.read[s.id+k]; return [
  [!!s.irb,'EC approval of Protocol Ver. 1.1 is on file',s.irb?'Approved '+s.irb:'Submitted '+s.sub+' – awaiting decision'],
  [!!S.dep[s.id],'Casebook version 2 is active at your site',S.dep[s.id]?'Activated '+S.dep[s.id].at:'Not yet activated by the CRO'],
  [r('prot'),'Protocol Ver. 1.1 opened','Document Exchange, or Study Protocol in the left panel','docs'],
  [r('chg'),'Casebook change report opened',S.signed?'Document Exchange':'Available once the sponsor approves casebook v2','docs'],
  ...(s.cn?[[r('icf'),'PK substudy consent form (v2.0) received','Document Exchange','docs']]:[]),
  [tasksDone(s),'All document actions and readiness tasks are done',`${siteTasks(s).filter(t=>t.st==='done').length} of ${siteTasks(s).length} done`,'tasks'],
  ...(sitePlan(s).aff.length?[[planDone(s),'Transition plan confirmed for each affected participant',`${sitePlan(s).done} of ${sitePlan(s).aff.length} confirmed`,'plan']]:[]) ]; }

/* ================= Plumbing ================= */
let H=[]; const h=fn=>{H.push(fn);return `data-h="${H.length-1}"`};
const icon=k=>`<span class="ic ${k}">${{ok:'✓',wait:'',warn:'!',bad:'✕'}[k]}</span>`;
const confPill=c=>({high:'<span class="pill high">High</span>',med:'<span class="pill med">Medium</span>',dec:'<span class="pill dec">Needs decision</span>'}[c]);
const decTxt=d=>({accepted:'Accepted',rejected:'Rejected',pending:'Pending'}[d]);
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2400);return false;}
const na=()=>h(()=>toast('Not part of this demo'));
const go=(role,page,more)=>h(()=>{nav(role,page,more)});
function nav(role,page,more){S.role=role; if(role==='home'&&!(more&&more.home)) S.home='landing'; if(page)S.pg[role]=page; Object.assign(S,more||{}); window.scrollTo(0,0);}
const closeM=()=>{$('layer').innerHTML='';return false};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-h]');
  if(!el){ if(!e.target.closest('.search')&&$('res')) $('res').innerHTML=''; return; }
  if(H[+el.dataset.h](e,el)!==false) render();
});
document.addEventListener('change',e=>{ if(e.target.id==='mysite'){S.mySite=e.target.value;render();} });
document.addEventListener('input',e=>{ if(e.target.id==='q') search(e.target.value); if(e.target.id==='pw') $('doSign').disabled=!e.target.value; });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeM(); });

function signModal(o){ const m=me();
  $('layer').innerHTML=`<div class="ovl"><div class="modal"><h2>${o.title||'Electronic Signature'}</h2><div class="bd">
    <p style="margin-top:0">${o.text} This signature is the legally binding equivalent of a handwritten signature.</p>
    <div class="fld"><label>User Name</label><input value="${m.u}" readonly></div>
    <div class="fld"><label>Password</label><input id="pw" type="password" class="req" placeholder="Any value works in this demo"></div>
    <div class="fld"><label>Signature Meaning</label><select id="mean">${o.meanings.map(x=>`<option>${x}</option>`).join('')}</select></div>
    </div><div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" id="doSign" disabled ${h(()=>{const mean=$('mean').value;closeM();o.done(mean);})}>Sign</button></div></div></div>`;
  $('pw').focus(); return false; }
function infoModal(title,text,btns){ $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:400px"><h2>${title}</h2><div class="bd" style="display:flex;gap:12px"><span class="ic ok" style="width:26px;height:26px;background:var(--blue)">i</span><div>${text}</div></div><div class="ft">${btns||''}<button class="btn" ${h(closeM)}>Close</button></div></div></div>`; }
function pdfFrame(p){return `<iframe src="assets/protocol.pdf#page=${p}&zoom=page-width" title="Protocol PDF"></iframe>`}
function tocHtml(cur,fn){return TOC.map(t=>`<div class="${t[0]===cur?'on':''}" ${h(()=>fn(t[0]))}><b>${t[1]}</b> <span class="muted">p. ${t[0]}</span><small>${t[2]}</small></div>`).join('')}
function openPdf(p){ S.pdf=p;
  $('layer').innerHTML=`<div class="ovl"><div class="modal wide"><h2>Protocol CTJ301UC201 · Ver. 1.1 · 16 May 2017 <span class="pill gray">VV-TMF-00412</span><a href="assets/protocol.pdf#page=${p}" target="_blank">Open in new tab</a><a style="margin-left:14px" ${h(closeM)}>Close ✕</a></h2>
    <div class="pdf"><div class="toc">${tocHtml(p,q=>openPdf(q))}</div>${pdfFrame(p)}</div></div></div>`; return false; }
function openCompare(){ $('layer').innerHTML=`<div class="ovl"><div class="modal wide" style="height:auto"><h2>Casebook Version 1 → Version 2 · Change Report<a ${h(closeM)}>Close ✕</a></h2><div class="bd">${compareTable(true)}</div></div></div>`; return false; }
function openDoc(s,d){ const first=!S.read[s.id+d.id]; S.read[s.id+d.id]=1;
  if(first&&S.role==='site') log(`Document opened: ${d.name}`,s.id);
  if(d.pdf) openPdf(d.pdf); else if(d.cmp) openCompare(); else toast('Illustrative document – no file attached in this demo'); render(); return false; }

/* ---------- global search (resource lookup) ---------- */
function search(q){ q=q.trim().toLowerCase(); const out=$('res'); if(q.length<2){out.innerHTML='';return;}
  const hit=s=>s.toLowerCase().includes(q), G=[];
  const g=(title,rows)=>{ if(rows.length) G.push(`<h5>${title}</h5>`+rows.slice(0,6).map(r=>`<div class="r" ${h(r[2])}><b>${r[0]}</b><small>${r[1]}</small></div>`).join('')); };
  const toSite=(id,tab)=>()=>{ $('res').innerHTML=''; if(S.role==='site'){S.mySite=id; S.pg.site={subjects:'changes',documents:'docs',contacts:'contacts'}[tab]||'changes';} else nav('cro','site',{croSite:id,siteTab:tab||'overview'}); };
  g('Sites',SITES.filter(s=>hit(s.id+' '+s.name+' '+s.ctry+' '+s.pi)).map(s=>[`${s.id} · ${s.name}`,s.ctry,toSite(s.id)]));
  const subs=[]; SITES.forEach(s=>s.subs.forEach(x=>{ if(hit(x.id)) subs.push([x.id,`${s.id} · ${x.d==='SCR'?'Screening':x.d==='DONE'?'Completed':'Day '+x.d}`,()=>{S.open[x.id]=1;toSite(s.id,'subjects')();}]); })); g('Subjects',subs);
  const ppl=[]; SITES.forEach(s=>[[s.pi,'Principal Investigator'],[s.coord,'Study Coordinator'],[s.cra,'CRA']].forEach(p=>{ if(hit(p[0])&&!ppl.some(r=>r[0]===p[0]&&p[1]==='CRA')) ppl.push([p[0],`${p[1]} · ${s.id}`,toSite(s.id,'contacts')]); })); g('People',ppl);
  g('Suggested changes',SUG.filter(s=>hit(s.id+' '+s.title+' '+s.type)).map(s=>[`${s.id} · ${s.title}`,s.type,()=>{$('res').innerHTML='';nav('sponsor','assist',{sTab:'changes',sel:s.id});}]));
  g('Schedule',EV.filter(e=>hit(e.id+' '+e.label+' day '+e.day)).map(e=>[`${e.id} · ${e.label}`,e.day?'Day '+e.day:e.grp,()=>{$('res').innerHTML=''; if(e.sug) nav('sponsor','assist',{sTab:'changes',sel:e.sug}); else nav('sponsor','schedule');}])
     .concat(FORMS.filter(f=>hit(f[0]+' '+f[1])).map(f=>[`${f[0]} · ${f[1]}`,'Form',()=>{$('res').innerHTML='';nav('sponsor','schedule');}])));
  g('Protocol sections',TOC.filter(t=>hit(t[1]+' '+t[2]+' protocol')).map(t=>[t[1],'p. '+t[0],()=>{$('res').innerHTML='';return openPdf(t[0]);}]));
  out.innerHTML=G.length?`<div class="results">${G.join('')}</div>`:`<div class="results"><div class="r"><span class="muted">No matches for “${q}”</span></div></div>`;
}

/* ================= Chrome ================= */
function chrome(body){
  const r=S.role, m=me(), sc=r==='site';
  const demobar=`<div class="demobar">${[['home','⌂ Home'],['sponsor','1 Sponsor'],['cro','2 CRO'],['site','3 Site']].map(x=>`<button class="${r===x[0]&&!(r==='home'&&S.home==='signin')?'on':''}" ${go(x[0])}>${x[1]}</button>`).join('')}
    <button ${h(()=>{nav('home',null,{home:'signin'});})} class="${r==='home'&&S.home==='signin'?'on':''}">Log in</button>${tourCtl()}<span class="sp"></span><button ${h(openPacket)}>Inspection Packet</button><button ${h(()=>openPdf(44))}>Protocol PDF</button><button ${h(()=>{location.hash='';location.reload();return false;})}>Reset demo</button></div>`;
  if(r==='home') return demobar+body;
  const top=`<div class="topbar">${sc?'<div class="logo">Vault Clinical<i>|</i><small>Site Connect</small></div>':''}
    <div class="search${sc?'':' left'}"><div class="sel">${sc?'All':'Subjects'} <span>▾</span></div><input id="q" placeholder="Search sites, subjects, people, changes, protocol…" autocomplete="off"><span class="mag">⌕</span><div id="res"></div></div>
    <div class="who">${m.n} · ${m.o} <div class="avatar">${m.i}</div><a style="color:#b9c2d8;font-size:12px" ${h(()=>{log('User signed out');nav('home');})}>Log out</a></div></div>`;
  const items=sc?['Site Connect ▾']:['Data Entry','Review ▾','Assessments','Studio ▾','Coder','Reports','Dashboards','Loader','Labs','Randomization','Tools ▾','My Training','Workbench'];
  const on=sc||r==='edc'?0:r==='sponsor'?3:10, tabGo={0:()=>nav('edc'),3:()=>nav('sponsor'),10:()=>nav('cro')};
  const navb=`<div class="nav">${items.map((x,i)=>`<span style="cursor:pointer" class="${i===on?'on':''}" ${sc?'':h(tabGo[i]||(()=>toast(x.replace(' ▾','')+' is outside this demo. Data Entry, Studio and Tools are live.')))}>${x}</span>`).join('')}</div>`;
  const crumbs=sc?'':`<div class="crumbs"><a ${h(openStudies)}>⌂ My Studies</a><span class="sep">›</span><a ${h(openStudy)}>CTJ301UC201 ▾</a><span class="sep">›</span><span>${r==='sponsor'?'CTJ301UC201_DEV1':r==='edc'?S.edc.site+' · Data Entry':'CTJ301UC201'}</span>
    <div class="right">${r!=='edc'&&S.pg[r]!=='trust'?`<a ${go(r,'trust')}>Audit</a>`:''}</div></div>`;
  return `${demobar}<div class="ws ${sc?'sc':''}">${top}${navb}${crumbs}<div class="layout">${side()}<main>${body}</main></div></div>`;
}
function side(){
  const r=S.role, p=S.pg[r], it=(l,pg,extra='')=>`<div class="it ${pg?(p===pg||(pg==='rollout'&&p==='site')?'on':''):'off'}" ${pg?go(r,pg):''}>${l}${extra}</div>`;
  if(r==='sponsor') return `<aside><h4>Study Design</h4>${it('Schedule','schedule')}${it(`RELAY (${SUG.length-reviewed()})`,'assist')}${it(`AI Record${trustNums().wait?' ('+trustNums().wait+' waiting)':''}`,'trust')}${it('Compare Versions','compare')}${it(`Change Requests (${openCR()})`,'feedback')}${it('Settings','settings')}${it('Review Plans (4)','plans')}
    <hr><h4>Study Objects</h4>${it('Event Groups (4)','groups')}${it(`Events (${11+EV.filter(e=>e.sug&&acc(e.sug)).length})`,'events')}${it('Forms (18)','forms')}${it('Codelists (42)','codelists')}
    <hr><h4>Rules</h4>${it('Comparison Rules (7)','crules')}${it(`User Defined Rules (${39+SUG.filter(s=>acc(s.id)&&s.diff.some(d=>d[0]==='Rule'&&d[2]==='Added')).length})`,'urules')}
    <hr><h4>Reference</h4>${it('Protocol Ver. 1.1','protocol')}${it('Audit Trail','audit')}</aside>`;
  if(r==='cro') return `<aside><h3>EDC Tools</h3><h4>Setup</h4>${it(`Study Countries (${new Set(SITES.map(s=>s.ctry)).size})`,'countries')}${it(`Sites (${SITES.length})`,'rollout')}
    <hr><h4>Operations</h4>${it(`AI Record${trustNums().wait?' ('+trustNums().wait+' waiting)':''}`,'trust')}${it('Casebook Versions','versions')}${it(`Job History (${S.jobs.length})`,'jobs')}${it(`Change Requests (${openCR()})`,'feedback')}${it('Audit Trail','audit')}
    <hr><h4>Reference</h4>${it('Protocol Ver. 1.1','protocol')}</aside>`;
  if(r==='edc'){ const st=site(S.edc.site); return `<aside><h3>${st.id} Subjects</h3>${st.subs.map(x=>`<div class="it ${S.edc.sub===x.id?'on':''}" ${h(()=>{S.edc.sub=x.id;S.edc.ev=null})}>${x.id}${x.pk===true?' <span class="new" style="background:var(--blue)">PK</span>':''}</div>`).join('')}
    <hr><h4>Site</h4>${SITES.map(q=>`<div class="it ${q.id===st.id?'on':''}" ${h(()=>{S.edc={site:q.id,sub:null,ev:null,prev:S.edc.prev}})}>${q.id}</div>`).join('')}</aside>`; }
  const s=site(S.mySite), dot=n=>n?'<span class="dot"></span>':'', si=(g,l,pg,d)=>`<div class="it ${p===pg?'on':''}" ${go('site',pg)}><u>${g}</u>${l}${d||''}</div>`;
  return `<aside><label>Study</label><select id="mysite">${SITES.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>CTJ301UC201 &gt; Site ${x.id}</option>`).join('')}</select>
    <div class="proto"><a ${h(()=>openDoc(s,siteDocs(s)[0]))}>Study Protocol</a></div>
    ${si('','Study Information','info')}${si('','System Links','links')}${si('','Study Contacts','contacts')}${si('','Communications','comms',dot(!S.ack[s.id]||unseen(s,true)))}
    ${si('','Document Exchange','docs',dot(unread(s)||(S.dep[s.id]&&!tasksDone(s))))}${si('','Amendment Changes','changes',dot(!S.ack[s.id]))}${si('','Transition Plan','plan',dot(!planDone(s)))}${si('','AI Record','trust')}${si('','Study Admin','admin')}</aside>`;
}

/* ================= Shared pieces ================= */
function evidence(s){
  if(!s.ev) return `<div class="doc"><div class="cap"><span>No direct protocol text</span></div><span style="font-family:Arial;font-size:12px;color:#6b6b6b">This change is inferred from how the study is already built, not from the protocol.</span></div>`;
  return s.ev.map(b=>{ const link=`<a ${h(()=>openPdf(b.p))}>Open protocol at p. ${b.p}</a>`;
    if(!b.t) return `<div class="doc"><div class="cap"><span>Protocol Ver. 1.1 · p. ${b.p} · ${b.ref}</span>${link}</div>${b.html}</div>`;
    const row=(lbl,key,fn)=>`<tr><th>${lbl}</th>${b.ctx.map(id=>{const e=evt(id),hl=b.hl.includes(id);
      return `<td class="${hl&&(!b.hlRow||b.hlRow===key)?(b.gap&&key==='win'?'gap':'hl'):''} ${e.sug&&key==='id'?'it':''}">${fn(e)||'&nbsp;'}</td>`}).join('')}</tr>`;
    return `<div class="doc"><div class="cap"><span>Protocol Ver. 1.1 · p. 44 · Table 1 Time and Events Schedule</span>${link}</div>
      <table>${row('Day(s)','day',e=>e.day)}${row('Allowed window for visit (days)','win',e=>e.win)}${row('Visits','id',e=>e.id.replace('V','V '))}${b.row?row('Blood sampling for PK assessments <sup>e</sup>','pk',()=>'●'):''}</table></div>`; }).join('');
}
function compareSheet(){ const c=S.cmp, PL={'Event':'Events','Event window':'Event windows','Rule':'Rules','Schedule':'Schedule','Codelist':'Codelists','Review plan':'Review plans'};
  const all=SUG.flatMap(s=>s.diff.map(d=>({s,d}))).filter(x=>!c.acc||S.dec[x.s.id]==='accepted'), types=[...new Set(all.map(x=>x.d[0]))];
  const tab=types.includes(c.tab)?c.tab:'', list=all.filter(x=>!tab||x.d[0]===tab), H=['Object type','Name','Change','Version 1','Version 2','Source','Decision'];
  const rows=list.map((x,i)=>{ const s=x.s,d=x.d,st=S.dec[s.id]; let v2=d[4];
    if(s.role==='winGap') v2=acc(s.id)?{pm1:'±1 day',exact:'Exact day',open:'No window (clarification raised)'}[S.opt[s.id]]:'Undecided';
    return `<tr class="click ${st==='rejected'?'strike':''}" title="Open ${s.id}" ${go('sponsor','assist',{sTab:'changes',sel:s.id})}><th>${i+2}</th><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td><td>${v2}</td><td><a>${s.id}</a></td><td>${decTxt(st)}</td></tr>`; }).join('');
  return `<div class="sheet"><div class="sheetbar"><span>${list.length} row${list.length===1?'':'s'} · Removed: none · Existing data affected: none</span>
      <label ${h(()=>{c.acc=!c.acc})}><input type="checkbox" ${c.acc?'checked':''}>Accepted changes only</label></div>
    <div class="sheetgrid"><table><tr class="cols"><th></th>${H.map((x,i)=>`<th>${'ABCDEFG'[i]}</th>`).join('')}</tr>
      <tr class="hd"><th>1</th>${H.map(x=>`<td>${x}</td>`).join('')}</tr>${rows||'<tr><th>2</th><td colspan="7" class="muted">No rows on this sheet.</td></tr>'}</table></div>
    <div class="sheettabs"><button class="${tab?'':'on'}" ${h(()=>{c.tab=''})}>All changes (${all.length})</button>${types.map(t=>`<button class="${tab===t?'on':''}" ${h(()=>{c.tab=t})}>${PL[t]||t} (${all.filter(x=>x.d[0]===t).length})</button>`).join('')}</div></div>`; }
function compareTable(short){
  let rows=''; const c=S.cmp; SUG.forEach(s=>s.diff.forEach(d=>{ const st=S.dec[s.id]; let v2=d[4];
    if(!short&&((c.ev&&/^Event/.test(d[0]))||(c.rules&&d[0]==='Rule')||(c.plans&&d[0]==='Review plan')||(c.acc&&st!=='accepted'))) return;
    if(s.role==='winGap') v2=acc(s.id)?{pm1:'±1 day',exact:'Exact day',open:'No window (clarification raised)'}[S.opt[s.id]]:'Undecided';
    rows+=`<tr class="${st==='rejected'?'strike':''}"><td>${d[0]}</td><td><b>${d[1]}</b></td><td>${d[2]==='Added'?'<span class="pill high">Added</span>':'<span class="pill blue">Modified</span>'}</td><td>${d[3]}</td><td>${v2}</td>
      ${short?'':`<td class="nw"><a ${go('sponsor','assist',{sTab:'changes',sel:s.id})}>${s.id}</a></td><td><span class="dstat ${st}">${decTxt(st)}</span></td>`}</tr>`; }));
  return `<table class="v"><tr><th>Object type</th><th>Name</th><th>Change</th><th>Version 1</th><th>Version 2</th>${short?'':'<th>Source</th><th>Decision</th>'}</tr>${rows}
    <tr class="grp"><td colspan="7">Removed: none · Existing data affected: none</td></tr></table>`;
}
function scheduleGrid(kk){
  const k=kk||S.design||'A', D=DESIGNS[k], pv=k!==S.design, v2=S.view==='v2', nw=e=>e.tp||e.ps, has=r=>D.list().some(x=>x.role===r);
  const ST=r=>pv?(has(r)?'pending':'none'):st(r), OK=r=>!pv&&okR(r), stE=e=>pv?'pending':(e.ps?st('cont'):evState(e)), sid=e=>e.ps?rid('cont'):e.sug, pk=pv?!D.all:pkOnly();
  const open=e=>pv?h(()=>toast(`Choose Proposal ${k} to review its detailed changes`)):go('sponsor','assist',{sTab:'changes',sel:sid(e)});
  const cols=EV.filter(e=>!e.tp||(v2&&D.kind==='events')).concat(v2&&D.kind==='unsch'?[PKU]:[]), gs=(e,i)=>i>0&&cols[i-1].grp!==e.grp?' gs':'';
  const head=cols.map(e=>`<th class="rot ${nw(e)?stE(e):'base'}"><div><span style="cursor:pointer" ${nw(e)?open(e):h(()=>eventProps(e))} title="${nw(e)?(pv?'Proposed':'Open '+sid(e)):'Event properties'}">${e.label}${nw(e)?' ＋':''}</span></div></th>`).join('');
  const meta=(l,f)=>`<tr class="meta"><th class="l" colspan="2">${l}</th>${cols.map((e,i)=>`<td class="c ${nw(e)?stE(e):''}${gs(e,i)}">${f(e,i)}</td>`).join('')}</tr>`;
  const q='<b style="color:#c0392b">?</b>';
  const win=e=>e.ps?'<span title="Sample-time checks">⏱</span>':e.h48?(pv||OK('win48')?'±1h':ST('win48')==='pending'?q:'—'):e.gap?(pv?q:({pm1:'±1',exact:'0',open:'—'}[OK('winGap')&&S.opt[rid('winGap')]]||(ST('winGap')==='rejected'?'—':q))):e.tp&&ST('winDay')==='rejected'?'—':e.win;
  const rowsAt={V2:3,V7:3,V8:1}, plus=s2=>`<span class="plus ${s2==='rejected'?'rejected':s2==='accepted'?'':'pending'}">+</span>`;
  const body=FORMS.map(([c,l,evs])=>`<tr><td class="name"><a>${c}</a></td><td class="name">${l}</td>${cols.map((e,i)=>{ const on=e.ps?c==='PK':evs.includes(e.id), s1=stE(e), f=has('form')?ST('form'):s1;
    const cell=!on?'':nw(e)?plus(f==='rejected'||s1==='rejected'?'rejected':s1==='accepted'&&f==='accepted'?'accepted':'pending'):`<span class="chk">●</span>${v2&&D.kind==='rows'&&c==='PK'&&rowsAt[e.id]?` <a class="rp ${ST('cont')}" title="Repeating: ${rowsAt[e.id]} extra row(s)">+${rowsAt[e.id]}</a>`:''}`;
    return `<td class="c ${nw(e)?s1:''}${gs(e,i)}">${cell}</td>`}).join('')}</tr>`).join('');
  return `<div class="schedwrap"><table class="sched">
    <tr><th colspan="2" style="vertical-align:bottom;text-align:left;padding:0 0 6px;font-weight:normal" class="muted">${v2?(pv?`Proposal ${k}, shown as proposed.<br>Nothing here is decided yet.`:`Proposal ${k}, following your decisions.<br>Click a new item to open its change.`):'Casebook version 1, active in production.'}</th>${head}</tr>
    <tr><th class="l">Name</th><th class="l">Label</th>${cols.map((e,i)=>`<td class="c ${nw(e)?stE(e):''}${gs(e,i)}" style="${nw(e)?'':'background:#ededed'}"></td>`).join('')}</tr>
    ${meta('Event group',(e,i)=>i===0||cols[i-1].grp!==e.grp?`<span style="white-space:nowrap;position:relative;z-index:1">${e.grp}</span>`:'')}
    ${meta('Study day',e=>e.d!==undefined?e.day:'')}${meta('Window (days)',win)}
    ${v2&&D.kind!=='rows'?meta('Created for',e=>nw(e)?(pk?'<span title="Created for the PK subgroup only">PK</span>':'All'):''):''}
    ${body}</table></div>`;
}
function timeline(st,x){ const im=impact(st,x), addIds=im.add.map(e=>e.id), pastIds=im.past.map(e=>e.id), soonIds=im.soon.map(e=>e.id);
  const chips=EV.filter(e=>!e.sug||addIds.includes(e.id)||pastIds.includes(e.id)).map(e=>{
    const done=x.d==='DONE'||(x.d!=='SCR'&&(e.d===undefined||e.d<=x.d)), cls=e.sug?(pastIds.includes(e.id)?'skip':soonIds.includes(e.id)?'soon':'new'):done?'done':'';
    return `<span class="${cls}" title="${e.label}${e.day?' · Day '+e.day:''}">${e.id}${e.sug&&cls!=='skip'?' ＋':''}</span>`; }).join('');
  return `<div class="tl">${chips}</div><div class="muted" style="margin-top:6px;font-size:12px">Grey: completed · <b style="color:#2a6f2a">Green ＋</b>: new PK visit they will get · <b style="color:#b86e00">Amber ＋</b>: new visit due within 3 days · Struck through: new visit already passed, not expected and no query raised</div>`; }
function subjectsTable(st){
  const rows=st.subs.map(x=>{ const i=impact(st,x), o=S.open[x.id];
    return `<tr class="click ${o?'sel':''}" ${h(()=>{S.open[x.id]=!o})}><td class="nw">${o?'▾':'▸'} <a>${x.id}</a></td>
    <td class="nw">${x.d==='SCR'?'Screening':x.d==='DONE'?'Completed':'Study day '+x.d}</td>
    <td class="nw">${x.pk===true?'<span class="muted">PK subgroup</span>':x.pk===null?'<span class="muted">Assigned at randomisation</span>':'<span class="muted">No</span>'}</td>
    <td>${i.sc==='maybe'?'<span class="muted">All 7, only if assigned to the PK subgroup</span>':i.add.length?i.add.map(e=>e.id).join(', '):'<span class="muted">None</span>'}${i.soon.length?` <span class="pill med">${i.soon[0].id} due in ${i.soon[0].d-x.d} day(s)</span>`:''}</td>
    <td>${i.past.length?`<span class="muted">${i.past.map(e=>e.id).join(', ')}</span>`:'<span class="muted">—</span>'}</td>
    <td class="nw">${x.rc===null||i.sc!=='yes'?'<span class="muted">n/a</span>':x.rc?`${icon('ok')} Signed`:i.add.length?`${icon('warn')} Not yet`:'<span class="muted">Not yet</span>'}</td></tr>
    ${o?`<tr class="exp"><td colspan="6">${timeline(st,x)}<div style="margin-top:8px"><a ${openEdc(st.id,x.id)}>Open this casebook in Data Entry</a></div></td></tr>`:''}`; }).join('');
  return `<table class="v"><tr><th>Subject</th><th>Current status</th><th>PK subgroup</th><th>New PK timepoints they will get</th><th>New timepoints already passed</th><th>PK consent (ICF v2.0)</th></tr>${rows}</table>`;
}
function docsTable(st){ const sc=S.role==='site';
  return `<table class="v"><tr><th>Name</th><th>Description</th><th>Document Type</th><th>Sponsor/CRO Document Number</th><th>${sc?'Received':'Sent'} Date</th></tr>
  ${siteDocs(st).map(d=>`<tr class="click" ${h(()=>openDoc(st,d))}><td>${sc&&!S.read[st.id+d.id]?'<span class="udot"></span>':''}<a><b>${d.name}</b></a></td><td>${d.desc}</td><td>${d.type}</td><td>${d.num}</td><td class="nw">${d.date}</td></tr>`).join('')}</table>`; }
function contactRows(st){ const mail=n=>n.toLowerCase().replace(/[^a-z]+/g,'.'), q=S.cq.toLowerCase();
  const rows=[[st.pi,'Principal Investigator','Medical decisions for participants','Site '+st.id,mail(st.pi)+'@site.example'],[st.coord,'Study Coordinator','Visits, consent, data entry','Site '+st.id,mail(st.coord)+'@site.example'],
    [st.cra,'Clinical Research Associate','Monitoring, site questions about the amendment','CRO',mail(st.cra)+'@cro.example'],['Jordan Morgan','Clinical Site Manager','Casebook version rollout and timing','CRO','jordan.morgan@cro.example'],
    ['Elena Marsh','Clinical Data Manager','Casebook design, rules and queries','Sponsor','elena.marsh@sponsor.example'],['Medical Monitor on call','Medical Monitor','Protocol interpretation, PK sampling, safety','Sponsor','medical.monitor@sponsor.example']];
  return rows.filter(r=>!q||r.join(' ').toLowerCase().includes(q)).map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><a ${h(()=>toast('Would open an email to '+r[4]))}>${r[4]}</a></td></tr>`).join('')||'<tr><td colspan="5" class="muted">No contacts match.</td></tr>'; }
function contactsTable(st){ window._cst=st; return `<div class="bar"><input id="cq" value="${S.cq}" placeholder="Search by name, role or topic, e.g. PK…" style="padding:5px 8px;border:1px solid #bbb;border-radius:2px;width:300px"></div>
  <table class="v"><tr><th>Name</th><th>Role</th><th>Contact For</th><th>Organisation</th><th>Email Address</th></tr><tbody id="ctb">${contactRows(st)}</tbody></table>`; }
document.addEventListener('input',e=>{ if(e.target.id==='cq'){S.cq=e.target.value; H.length&&($('ctb').innerHTML=contactRows(window._cst));} });
function eventProps(e){ $('layer').innerHTML=`<div class="ovl"><div class="modal"><h2>${e.id} <span class="muted" style="font-size:12px">PROPERTIES</span><a ${h(closeM)}>✕</a></h2><div class="bd"><dl class="kv">
  <dt>Name</dt><dd>${e.id.replace('.','_')}</dd><dt>Label</dt><dd>${e.label}</dd><dt>Event Group</dt><dd>${e.grp}</dd><dt>Offset Days</dt><dd>${e.day||'—'}</dd><dt>Day Range Early / Late</dt><dd>${e.win?e.win.slice(1)+' / '+e.win.slice(1):'— / —'}</dd>
  <dt>Forms</dt><dd>${FORMS.filter(f=>f[2].includes(e.id)).map(f=>f[1]).join(', ')}</dd><dt>Amendment 1</dt><dd>Unchanged in version 2</dd></dl></div></div></div>`; return false; }
function rejectModal(s){ $('layer').innerHTML=`<div class="ovl"><div class="modal"><h2>Reject ${s.id}</h2><div class="bd"><p style="margin-top:0">${s.title}</p>
  <div class="fld"><label>Reason</label><select id="rr"><option>Not supported by the protocol</option><option>Will be handled outside EDC</option><option>Needs protocol clarification first</option><option>Different implementation preferred</option></select></div>
  <div class="fld"><label>Why does this change not work? (recorded in the audit trail)</label><textarea id="rn" class="req" rows="2" placeholder="e.g. Monitoring plan already defines SDV scope; this would duplicate it."></textarea></div>
  <div class="fld"><label>What should be changed or tried instead? (optional; raises a change request)</label><textarea id="rt" rows="2" placeholder="e.g. Limit SDV to the 48 h samples."></textarea></div></div>
  <div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" ${h(()=>{const v=$('rn').value.trim(); if(!v) return toast('A note is required when rejecting a change');
    const t=$('rt').value.trim(); S.dec[s.id]='rejected'; S.why[s.id]=$('rr').value+': '+esc(v)+(t?' <b>Try instead:</b> '+esc(t):''); S.val=null; log(`${s.id} rejected. ${$('rr').value}: ${v}`,'',null,{sug:s.id}); if(t) addCR({about:s.id+' · '+s.title,problem:esc(v),ask:esc(t),to:'RELAY: redraft with this feedback',sug:s.id}); closeM(); const nx=SUG.find(x=>S.dec[x.id]==='pending'); if(nx) S.sel=nx.id;})}>Reject change</button></div></div></div>`; $('rn').focus(); return false; }
function ecModal(s){ $('layer').innerHTML=`<div class="ovl"><div class="modal"><h2>Record EC Approval · ${s.id}</h2><div class="bd"><p style="margin-top:0">Protocol Ver. 1.1 was submitted to the EC on ${s.sub}. Recording the approval makes the site eligible for casebook version 2.</p>
  <div class="fld"><label>EC approval date</label><input id="ecd" type="date" class="req" value="2017-06-16"></div><div class="fld"><label>Approval letter (optional)</label><input type="file"></div></div>
  <div class="ft"><a ${h(closeM)}>Cancel</a><button class="btn pri" ${h(()=>{ if(!$('ecd').value) return toast('Enter the approval date'); s.irb=fd(new Date($('ecd').value+'T00:00')); S.pick[s.id]=true; log(`EC approval of Protocol Ver. 1.1 recorded (${s.irb}); site is now eligible for version 2`,s.id); closeM(); })}>Record approval</button></div></div></div>`; return false; }
function protocolPage(){ return `<div class="ph"><div><h1>Protocol Ver. 1.1</h1><div class="sub">CTJ301UC201 · 16 May 2017 · supersedes Ver. 1.0 (22 Feb 2017) · VV-TMF-00412 · 97 pages</div></div>
  <div class="acts"><a href="assets/protocol.pdf" target="_blank">Open in new tab</a></div></div>
  <div class="pdf pdfpage"><div class="toc">${tocHtml(S.pdf,p=>{S.pdf=p})}</div>${pdfFrame(S.pdf)}</div>`; }

/* ================= Sponsor (Studio) ================= */
function fastSponsor(){ if(!S.design) applyDesign('A',true); S.ret=null; SUG.forEach(s=>{ if(S.dec[s.id]==='pending'){ if(s.opts&&!S.opt[s.id]) S.opt[s.id]=s.opts[0][0]; S.dec[s.id]='accepted'; } });
  S.val=validate(); const m={n:'Elena Marsh',o:'Sponsor'}; log('Remaining suggested changes accepted; validation passed','',m);
  S.signed={by:'Elena Marsh',at:now(),meaning:'Approval'}; log('Casebook version 2 approved by electronic signature (Approval)','',m); }
function vAssist(){
  const s=sug(S.sel), d=S.dec[s.id], hi=SUG.filter(x=>x.conf==='high'&&S.dec[x.id]==='pending').length, lock=!!S.signed, all=reviewed()===SUG.length;
  const head=`<div class="ph"><div><h1>RELAY</h1><div class="sub">Protocol Ver. 1.1 compared with casebook version 1 · ${SUG.length} suggested changes</div></div>
    ${lock?'<span class="pill solid">CASEBOOK V2 APPROVED</span>':'<span class="pill blue">IN REVIEW</span>'}
    <div class="acts"><button class="btn" ${h(()=>openPdf(44))}>View Protocol</button>${lock?'':`<button class="btn pri" ${h(()=>{S.sTab='approve'})}>Approve Casebook v2…</button>`}</div></div>
    ${S.ret?`<div class="note" style="background:var(--red-soft);border-color:#eab8b0">${icon('bad')}<div><b>Returned for rework (${S.ret}).</b> ${(S.cr.find(c=>c.id===S.ret)||{}).problem||''} Approval is blocked until the request is resolved. <a ${go('sponsor','feedback')}>Open change requests</a></div></div>`:''}
    <div class="tabs"><button class="${S.sTab==='options'?'on':''}" ${h(()=>{S.sTab='options'})}>1 · Schema Options ${S.design?`<span class="n">(${S.design} chosen)</span>`:''}</button>
      <button class="${S.sTab==='changes'?'on':''}" ${h(()=>{S.sTab='changes'})}>2 · Detailed Changes <span class="n">(${S.design?reviewed()+'/'+SUG.length:'—'})</span></button>
      <button class="${S.sTab==='approve'?'on':''}" ${h(()=>{S.sTab='approve'})}>3 · Validation &amp; Approval</button></div>`;
  if(S.sTab==='options') return head+vOptions()+askBox('sponsor');
  if(!S.design) return head+`<div class="note">${icon('warn')}<div>Choose a schema option first. The detailed changes depend on which way the amendment is built. <a ${h(()=>{S.sTab='options'})}>Go to Schema Options</a></div></div>`;
  if(S.sTab==='approve') return head+vApprove();
  let rows='',cat=''; SUG.forEach(x=>{ if(x.cat!==cat){cat=x.cat;rows+=`<tr class="grp"><td colspan="4">${cat}</td></tr>`;}
    rows+=`<tr class="click ${x.id===S.sel?'sel':''}" ${h(()=>{S.sel=x.id})}><td class="nw"><a>${x.id}</a></td><td>${x.title}<div class="muted" style="font-size:12px">${x.type}</div></td><td>${confPill(x.conf)}</td><td><span class="dstat ${S.dec[x.id]}">${decTxt(S.dec[x.id])}</span></td></tr>`; });
  const evs=s.evs?s.evs.map(evt):s.role==='scope'?TPS:null;
  const who=evs?`<div class="sec"><label>Who it affects</label>${s.role==='scope'
      ?`With this rule: <b>${total(st=>stats(st).aff)}</b> PK-subgroup subject(s) at ${SITES.filter(st=>st.cn).length} Mainland China sites. Without it: all <b>${total(st=>st.subs.filter(x=>x.d!=='DONE').length)}</b> active subjects at all ${SITES.length} sites.`
      :`${total(st=>stats(st,evs).aff)} subject(s) at ${SITES.filter(st=>stats(st,evs).aff).length} site(s) have not yet passed these study days and would get the new event(s). Subjects already past them are not asked for retrospective data.`}</div>`:'';
  const opts=s.opts?`<div class="sec"><label>Your decision</label><div class="opts">${s.opts.map(o=>`<label class="${S.opt[s.id]===o[0]?'on':''}" ${lock?'':h(()=>{S.opt[s.id]=o[0]; if(acc(s.id)){S.val=null;log(`${s.id} option changed: ${o[1]}`);}})}>
      <input type="radio" ${S.opt[s.id]===o[0]?'checked':''} ${lock?'disabled':''}><div><b>${o[1]}</b>${o[3]?'<span class="rec">SUGGESTED</span>':''}<small>${o[2]}</small></div></label>`).join('')}</div></div>`:'';
  const need=s.opts&&!S.opt[s.id];
  const decide=v=>h(()=>{ S.dec[s.id]=v; S.val=null; delete S.why[s.id]; log(`${s.id} ${v==='pending'?'decision cleared':v}${v==='accepted'&&s.opts?` (${s.opts.find(o=>o[0]===S.opt[s.id])[1]})`:''}`,'',null,{sug:s.id});
    if(v!=='pending'){const nx=SUG.find(x=>S.dec[x.id]==='pending'); if(nx) S.sel=nx.id;} });
  return head+`${lock?`<div class="note green">${icon('ok')}<div>Casebook version 2 is approved. Decisions are locked. <a ${go('cro','rollout')}>Continue as CRO</a></div></div>`:''}
  <div class="split"><div>
    <div class="bar"><span class="muted">${reviewed()} of ${SUG.length} reviewed</span>
      <button class="btn sp" ${hi&&!lock?h(()=>{const l=SUG.filter(x=>x.conf==='high'&&S.dec[x.id]==='pending');l.forEach(x=>S.dec[x.id]='accepted');S.val=null;log(`Accepted ${l.length} high-confidence changes in bulk (${l.map(x=>x.id).join(', ')})`);const nx=SUG.find(x=>S.dec[x.id]==='pending');if(nx)S.sel=nx.id;}):'disabled'}>Accept all high-confidence (${hi})</button></div>
    <table class="v"><tr><th>ID</th><th>Suggested change</th><th>Confidence</th><th>Decision</th></tr>${rows}</table>
    <div class="card" style="margin-top:14px"><h2>Checked, no change proposed</h2><div class="bd"><ul class="clean">${NOCHANGE.map(n=>`<li>${icon('ok')}<div><b>${n[0]}</b><br><span class="muted">${n[1]}</span></div></li>`).join('')}</ul></div></div>
  </div>
  <div class="card detail"><h2>${s.id} ${confPill(s.conf)} <span class="dstat ${d}" style="margin-left:auto">${decTxt(d)}</span></h2><div class="bd">
    <h3>${s.title}</h3><div class="muted">${s.cat} · ${s.type} · <span class="assist">Suggested by RELAY</span></div>
    <div class="sec"><label>Proposed change</label><div class="ba"><div><small>Casebook v1 (current)</small>${s.before}</div><i>→</i><div class="after"><small>Casebook v2 (proposed)</small>${s.after}</div></div>${s.rule?`<pre class="rule">${s.rule}</pre>`:''}</div>
    <div class="sec"><label>Protocol evidence</label>${evidence(s)}</div>
    <div class="sec"><label>Why this is suggested</label>${s.why}</div>${trustBrief(s)}${who}${opts}
    <div class="sec"><label>Reviewer notes</label>${S.why[s.id]?`<div class="note" style="margin-bottom:6px">${icon('bad')}<div>${S.why[s.id]}</div></div>`:''}
      ${(S.cm[s.id]||[]).map(c=>`<div style="margin-bottom:5px"><b>${c.u}</b> <span class="muted">${c.at}</span> · ${c.x}</div>`).join('')}
      <div style="display:flex;gap:8px"><input id="cmin" style="flex:1;padding:5px 8px;border:1px solid #bbb;border-radius:2px" placeholder="Add a note for other reviewers…"><button class="btn sm" ${h(()=>{const v=$('cmin').value.trim(); if(!v) return false; (S.cm[s.id]=S.cm[s.id]||[]).push({u:me().n,at:now(),x:v.replace(/</g,'&lt;')}); log(`Note on ${s.id}: “${v.slice(0,80)}”`,'',null,{sug:s.id});})}>Add note</button></div></div>
    ${lock?'':`<div class="decide"><button class="btn ${d==='accepted'?'ok':'pri'}" ${need?'disabled':decide('accepted')}>${d==='accepted'?'Accepted':'Accept'}</button>
      <button class="btn" ${h(()=>rejectModal(s))}>${d==='rejected'?'Rejected':'Reject…'}</button>${d!=='pending'?`<a ${decide('pending')}>Undo</a>`:''}
      ${need?'<span class="muted">Choose an option above to accept.</span>':''}
      <a style="margin-left:auto" ${h(()=>{S.sel=SUG[(SUG.indexOf(s)+1)%SUG.length].id})}>Next</a></div>`}
  </div></div></div>`;
}
function vApprove(){
  const v=S.val, all=reviewed()===SUG.length, a=SUG.filter(s=>acc(s.id)), rj=SUG.filter(s=>S.dec[s.id]==='rejected'), ready=all&&valOk()&&!S.ret, D=DES();
  const gate=(ok,bad,t,d,link)=>`<div class="gate">${icon(ok?'ok':bad?'bad':'wait')}<div><b>${t}</b><span class="muted">${d}</span></div>${ok||S.signed||!link?'':link}</div>`;
  const valBody=v==='running'?`<div class="muted"><span class="spin"></span> Building casebook v2 from your decisions and checking rules…</div>`
    :v?`<ul class="clean">${v.map(c=>`<li>${icon(c[0])}<div><b>${c[1]}</b><br><span class="muted">${c[2]}</span></div></li>`).join('')}</ul>`
    :`<span class="muted">${all?'Validation checks the casebook that results from your decisions.':'Available once every suggested change has a decision.'}</span>`;
  return `${S.signed?`<div class="note green">${icon('ok')}<div><b>Approved.</b> ${S.signed.by} · ${S.signed.at} · Meaning: ${S.signed.meaning}. Casebook version 2 is available to the CRO for site rollout. <a ${go('cro','rollout')}>Continue as CRO</a></div></div>`:''}
  <div class="grid2"><div>
    <div class="card"><h2>Before you approve</h2><div class="bd">
      ${gate(all,false,'Every suggested change reviewed',`${reviewed()} of ${SUG.length} decided`,`<a class="go" ${h(()=>{S.sTab='changes';const nx=SUG.find(x=>S.dec[x.id]==='pending');if(nx)S.sel=nx.id;})}>Review changes</a>`)}
      ${gate(valOk(),Array.isArray(v)&&!valOk(),'Validation passed on your decisions',!v?'Not run yet':v==='running'?'Running…':valOk()?`${v.filter(c=>c[0]==='ok').length} passed, ${v.filter(c=>c[0]==='warn').length} warning(s)`:'Failed – see results below')}
    </div></div>
    <div class="card"><h2>Validation <button class="btn sm" style="margin-left:auto" ${all&&v!=='running'&&!S.signed?h(()=>{S.val='running';setTimeout(()=>{S.val=validate();log(`Validation ${valOk()?'passed':'failed'} (${S.val.filter(c=>c[0]==='warn').length} warning(s))`);render();},1300);}):'disabled'}>${Array.isArray(v)?'Re-run':'Run validation'}</button></h2><div class="bd">${valBody}</div></div>
  </div>
  <div class="card"><h2>What you are approving</h2><div class="bd"><dl class="kv">
    <dt>Study</dt><dd>CTJ301UC201</dd><dt>Protocol</dt><dd>Ver. 1.1, 16 May 2017 <a ${h(()=>openPdf(1))}>view</a></dd>
    <dt>Casebook</dt><dd>Version 1 → <b>Version 2</b> <a ${go('sponsor','compare')}>compare</a></dd>
    <dt>Accepted (${a.length})</dt><dd>${a.map(s=>s.id).join(', ')||'—'}</dd><dt>Rejected (${rj.length})</dt><dd>${rj.map(s=>s.id).join(', ')||'—'}</dd>
    <dt>Schema option</dt><dd><b>Option ${D.k}</b> · ${D.name} <span class="pill ${VERD[D.verdict][0]}">${VERD[D.verdict][1]}</span> <a ${h(()=>{S.sTab='options'})}>compare options</a></dd>
    ${rid('winGap')?`<dt>V7.2 window</dt><dd>${okR('winGap')?sug(rid('winGap')).opts.find(o=>o[0]===S.opt[rid('winGap')])[1]:st('winGap')==='rejected'?'Rejected – no window set':'Undecided'}</dd>`:''}
    <dt>Applies to</dt><dd>${pkOnly()?'Mainland China PK subgroup only':'All randomised subjects'}</dd>
    <dt>Existing data</dt><dd>${D.retro?'PK form at Visits 2, 7, 8 changes layout; values kept':'0 data points altered · no forms reopened'}</dd><dt>Amendment type</dt><dd>${D.retro?'Prospective for new samples, with a form-layout migration':'Prospective – future events only'}</dd>
    <dt>Next step</dt><dd>CRO activates version 2 site by site after EC approval</dd></dl>
    ${S.signed?'':`<div class="decide"><button class="btn pri" ${ready?h(()=>signModal({text:'You are approving <b>casebook version 2</b> for <b>CTJ301UC201</b> and releasing it to the CRO for site rollout.',meanings:['Approval – reviewed and approved for release','Review – reviewed, approval by another signer required'],
        done:m=>{S.signed={by:me().n,at:now(),meaning:m.split(' – ')[0]};log(`Casebook version 2 approved by electronic signature (${S.signed.meaning})`);render();}})):'disabled'}>Approve and Sign…</button>
      <button class="btn" ${h(()=>crModal({about:`Casebook v2 draft (Option ${D.k})`,title:'Reject and return for rework',intro:'Use this when the draft should not go to sites as it stands. Say what does not work and what should be tried. Approval stays blocked until the request is resolved.',ret:true}))}>Reject and return…</button>
      <span class="muted">${S.ret?'Returned for rework: resolve '+S.ret+' first.':ready?'All checks complete. Your electronic signature is required.':'Complete the items under "Before you approve".'}</span></div>`}
  </div></div></div>`;
}
const vCompare=()=>`<div class="ph"><div><h1>Compare Versions</h1><div class="sub">Casebook version 1 (active in production) against version 2 (${S.signed?'approved':'draft'}). Click a row to open the change.</div></div>
  <div class="acts"><button class="btn" ${h(()=>{S.view='v2';nav('sponsor','schedule')})}>View as schedule</button><button class="btn" ${h(()=>download('Diff_CTJ301UC201_1_to_2.csv',['Object type,Name,Change,Version 1,Version 2,Source,Decision'].concat(SUG.flatMap(s=>s.diff.map(d=>[...d.slice(0,5),s.id,S.dec[s.id]].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')))).join('\n'),'text/csv')&&false)}>Export difference report</button></div></div>
  ${compareSheet()}`;
const vAudit=(f,sub)=>`<div class="ph"><div><h1>Audit Trail</h1><div class="sub">${sub||'Every decision, validation, signature, deployment, task and query for this amendment, across sponsor, CRO and sites. Each entry is chained to the one before it.'}</div></div><div class="acts"><button class="btn" ${h(openPacket)}>Inspection Packet</button></div></div>${auditTable(f)}`;

/* ================= CRO (EDC Tools) ================= */
function deploy(ids,m){ const at=now(); ids.forEach(id=>{S.dep[id]={at};S.pick[id]=false;log('Casebook version 2 set as active version (prospective amendment)',id,m); const k=sitePlan(site(id)).aff.length; if(k) log(`Transition plan calculated for ${k} participant(s) from their dose dates (AI-09)`,id,{n:'System',o:'Vault'});});
  S.jobs.unshift({at,ids,by:(m||me()).n}); }
function fastDeploy(){ if(!S.signed) fastSponsor(); deploy(SITES.filter(s=>eligible(s)&&!S.dep[s.id]).map(s=>s.id),{n:'Jordan Morgan',o:'CRO'}); }
const needSponsor=()=>S.signed?'':`<div class="note">${icon('warn')}<div>${S.ret?`<b>Returned to the sponsor (${S.ret}).</b> `:''}Casebook version 2 has not been approved by the sponsor yet, so it cannot be activated at sites. You can still review impact below. <a ${go('sponsor','assist')}>Open sponsor view</a> · <a ${h(fastSponsor)}>Demo shortcut: complete the sponsor step</a></div></div>`;
function vRollout(){
  const picked=SITES.filter(s=>S.pick[s.id]&&eligible(s)&&!S.dep[s.id]), can=S.signed&&picked.length, wait=SITES.filter(s=>S.dep[s.id]&&!S.ack[s.id]);
  const shown=SITES.filter(s=>!S.cf||s.ctry===S.cf||(S.cf==='held'&&!s.irb)||(S.cf==='wait'&&S.dep[s.id]&&!S.ack[s.id])), selAll=shown.filter(s=>eligible(s)&&!S.dep[s.id]);
  const rows=shown.map(s=>{const x=stats(s), dep=S.dep[s.id]; return `<tr class="click ${eligible(s)?'':'dim'}" ${go('cro','site',{croSite:s.id,siteTab:'overview'})}>
    <td ${h(()=>false)}><input type="checkbox" ${S.pick[s.id]&&!dep?'checked':''} ${eligible(s)&&!dep?h((e,el)=>{S.pick[s.id]=el.checked}):'disabled'}></td>
    <td class="nw"><a>${s.id}</a></td><td>${s.name}<div class="muted" style="font-size:12px">${s.city}</div></td><td class="nw">${s.ctry}</td><td class="nw">${s.pi}</td>
    <td class="nw" ${s.irb?'':h(()=>ecModal(s))}>${s.irb?`${icon('ok')} ${s.irb}`:`${icon('warn')} Pending · <a>Record…</a>`}</td><td class="r"><u>${dep?2:1}</u></td><td class="r">${s.subs.length}</td>
    <td class="r"><b>${x.aff||'—'}</b></td><td class="r">${x.soon||'—'}</td>
    <td class="nw">${S.ack[s.id]?`${icon('ok')} Acknowledged`:dep?'<span class="pill med">Awaiting site</span>':!eligible(s)?'<span class="pill gray">Held on v1</span>':'<span class="muted">—</span>'}</td></tr>`}).join('');
  return `<div class="ph"><div><h1>Sites</h1></div>
    <div class="acts"><span class="pill gray">Selected ${picked.length}</span>
      <button class="btn pri" ${can?h(()=>signModal({title:'Set Active Version',text:`You are setting <b>casebook version 2</b> as the active version at <b>${picked.length} site(s)</b>: ${picked.map(s=>s.id).join(', ')}. Amendment type: prospective.`,meanings:['Approval – site rollout authorised'],
        done:()=>{deploy(picked.map(s=>s.id));render();infoModal('Job Queued','An amendment job has been queued. Sites are notified in Site Connect and asked to acknowledge. Navigate to Job History to monitor status.',`<button class="btn" ${h(()=>{closeM();nav('cro','jobs');})}>Job History</button>`);}})):'disabled'}>Set Active Version…</button>
      ${S.signed?`<button class="btn" ${h(()=>crModal({about:`Casebook v2 (Option ${DES().k}) rollout`,title:'Return to sponsor',intro:Object.keys(S.dep).length?'Version 2 is already active at some sites, so this raises a change request without withdrawing the approval.':'Use this when version 2 should not go to sites as approved. The sponsor approval is withdrawn until the request is resolved.',to:['Sponsor study build team'],ret:!Object.keys(S.dep).length,after:()=>{ if(!Object.keys(S.dep).length){S.signed=null;S.val=null;log('Sponsor approval withdrawn: casebook version 2 returned by the CRO');} }}))}>Return to sponsor…</button>`:''}
      <button class="btn" ${wait.length?h(()=>{wait.forEach(s=>{S.note[s.id]=now();log('Reminder sent: please review and acknowledge casebook version 2',s.id);});return toast(`Reminder sent to ${wait.length} site(s) in Site Connect`)&&false;}):'disabled'}>Notify Site${wait.length?` (${wait.length})`:''}</button></div></div>
  ${needSponsor()}
  
  <div class="bar"><span class="muted">Status:</span><div class="seg">${[['','All ('+SITES.length+')'],['China','China'],['South Korea','South Korea'],['Taiwan','Taiwan'],['held','Held for EC'],['wait','Awaiting acknowledgement']].map(f=>`<button class="${S.cf===f[0]?'on':''}" ${h(()=>{S.cf=f[0]})}>${f[1]}</button>`).join('')}</div><span class="sp muted">${shown.length} of ${SITES.length} sites · ${total(s=>s.subs.length)} subjects</span></div>
  <table class="v"><tr><th><input type="checkbox" title="Select all eligible" ${selAll.length&&selAll.every(s=>S.pick[s.id])?'checked':''} ${selAll.length?h((e,el)=>{selAll.forEach(s=>S.pick[s.id]=el.checked)}):'disabled'}></th><th>Site Number</th><th style="min-width:260px">Site Name</th><th>Study Country</th><th>Principal Investigator</th><th>EC approval (Ver. 1.1)</th><th>Active Version</th><th>Subjects</th><th>Gain PK visits</th><th>Due ≤ 3 days</th><th>Site acknowledgement</th></tr>${rows}</table>`;
}
function siteFacts(s){ const x=stats(s), D=DES(), who=pkOnly()?'PK-subgroup participant(s)':'participant(s)';
  const what={events:'get up to 7 extra PK sampling visits (Days 2, 6, 10, 72, 76, 80, 90)',rows:'have up to 7 extra PK samples, entered as extra rows on the PK form at Visits 2, 7 and 8',unsch:'need up to 7 extra PK visits, which you add yourself in EDC as “PK Sampling”'}[D.kind];
  return s.cn||!pkOnly()?[[x.aff?'warn':'ok',`<b>${x.aff} ${who}</b> ${what}.`],
      ...(x.maybe?[['ok',`${x.maybe} participant(s) in screening get them only if assigned to the PK subgroup at randomisation.`]]:[]),
      ...(x.soon?[['warn',`<b>${x.soon} participant(s)</b> have a new PK sample due within 3 days.`]]:[]),
      ...(x.rc?[['warn',`<b>${x.rc} participant(s)</b> have not yet signed the PK substudy consent form (v2.0). Do not take PK samples for them until they do.`]]:[]),
      ...(D.all?[['warn','Participants outside the PK subgroup will also show the seven visits, with nothing to collect. Mark them as “did not occur”.']]:[['ok','Participants outside the PK subgroup see no change.']]),
      ['ok',D.retro?'The PK form at Visits 2, 7 and 8 changes layout. Values already entered are kept.':'Nothing already entered changes. No retrospective entry is asked for samples already passed.']]
    :[['ok','<b>No change in data entry at this site.</b> The new PK samples apply only to the Mainland China PK subgroup.'],['ok','Version 2 is activated so that all sites stay on the same casebook version.'],['ok','Nothing already entered changes.']];
}
function vCroSite(){
  const s=site(S.croSite), dep=S.dep[s.id], x=stats(s), tab=S.siteTab;
  const tabs=[['overview','Overview'],['subjects',`Subjects <span class="n">(${s.subs.length})</span>`],['documents',`Documents <span class="n">(${siteDocs(s).length})</span>`],['tasks',`Tasks <span class="n">(${siteTasks(s).filter(t=>t.st==='done').length}/${siteTasks(s).length})</span>`],['messages',`Messages <span class="n">(${(S.msg[s.id]||[]).length})</span>${unseen(s,false)?' <span class="udot"></span>':''}`],['plan','Transition Plan'],['contacts','Contacts'],['audit','Audit Trail']];
  const body={overview:()=>`<div class="grid2"><div class="card"><h2>Site details</h2><div class="bd"><dl class="kv">
      <dt>Study Country</dt><dd>${s.ctry}</dd><dt>Principal Investigator</dt><dd>${s.pi}</dd><dt>Study Coordinator</dt><dd>${s.coord}</dd><dt>CRA</dt><dd>${s.cra}</dd>
      <dt>EC approval (Ver. 1.1)</dt><dd>${s.irb?`${icon('ok')} Approved ${s.irb}`:`${icon('warn')} Pending, submitted ${s.sub}`}</dd>
      <dt>Active casebook</dt><dd>Version ${dep?`2 (since ${dep.at})`:'1'}</dd>
      <dt>Site acknowledgement</dt><dd>${S.ack[s.id]?`${icon('ok')} ${S.ack[s.id].by}, ${S.ack[s.id].at}`:dep?'Requested, not yet signed':'Not requested'}</dd>
      <dt>Subjects</dt><dd>${s.subs.length} · ${s.subs.filter(q=>q.pk===true).length} in PK subgroup</dd></dl>
      <div class="decide"><button class="btn" ${go('site','changes',{mySite:s.id})}>View as this site</button><button class="btn" ${openEdc(s.id)}>Open in Data Entry</button>${s.irb?'':`<button class="btn pri" ${h(()=>ecModal(s))}>Record EC Approval…</button>`}
        ${dep||!eligible(s)?'':`<button class="btn pri" ${S.signed?h(()=>signModal({title:'Set Active Version',text:`You are setting <b>casebook version 2</b> as the active version at <b>${s.id}</b>.`,meanings:['Approval – site rollout authorised'],done:()=>{deploy([s.id]);render();}})):'disabled'}>Set Active Version…</button>`}</div></div></div>
      <div class="card"><h2>What version 2 means for this site</h2><div class="bd"><ul class="clean">${siteFacts(s).map(f=>`<li>${icon(f[0])}<div>${f[1]}</div></li>`).join('')}</ul></div></div></div>`,
    subjects:()=>`<div class="bar"><span class="muted">Click a subject to see their visit timeline.</span></div>${subjectsTable(s)}`,
    documents:()=>docsTable(s), tasks:()=>`<div class="bar"><span class="muted">Readiness tasks are completed by the site in Site Connect. A task can only be closed with proof.</span></div>${tasksTable(s,false)}`, messages:()=>thread(s), plan:()=>`<div class="bar"><span class="muted">How version 2 maps onto each participant already in the trial at this site. The site confirms each plan in Site Connect.</span></div>${planSummary(s)}${planTable(s,false)}`, contacts:()=>contactsTable(s), audit:()=>auditTable(e=>e.s===s.id,true)}[tab]();
  return `<div class="ph"><div><div style="font-size:12px;margin-bottom:2px"><a ${go('cro','rollout')}>‹ Sites</a></div><h1>${s.id} · ${s.name}</h1></div>
      ${dep?'<span class="pill solid">VERSION 2 ACTIVE</span>':eligible(s)?'<span class="pill blue">READY FOR VERSION 2</span>':'<span class="pill gray">HELD ON VERSION 1 · EC PENDING</span>'}
      <div class="acts"><select style="padding:4px" id="crosite">${SITES.map(q=>`<option ${q.id===s.id?'selected':''}>${q.id}</option>`).join('')}</select></div></div>
    ${needSponsor()}
    <div class="tabs">${tabs.map(t=>`<button class="${tab===t[0]?'on':''}" ${h(()=>{S.siteTab=t[0]})}>${t[1]}</button>`).join('')}</div>${body}`;
}
document.addEventListener('change',e=>{ if(e.target.id==='crosite'){S.croSite=e.target.value;render();} });
function vVersions(){ const t=S.vTab, seg=[['all','All Versions'],['sites','Active Versions by Site'],['hist','Amendment History']];
  const body={all:()=>`<table class="v"><tr><th>Version</th><th>Name</th><th>Protocol</th><th>Status</th><th>Sites on this version</th><th>Created</th><th></th></tr>
    <tr><td>2</td><td><b>Amendment 1 – PK subgroup visits</b></td><td>Ver. 1.1, 16 May 2017</td><td>${S.signed?`<span class="pill high">PUBLISHED · approved ${S.signed.at}</span>`:'<span class="pill med">IN_PROGRESS · awaiting sponsor approval</span>'}</td><td>${Object.keys(S.dep).length} of ${SITES.length}</td><td>18 May 2017</td><td class="nw"><a ${h(openCompare)}>Compare with version 1</a></td></tr>
    <tr><td>1</td><td><b>InitialVersion</b></td><td>Ver. 1.0, 22 Feb 2017</td><td><span class="pill gray">PUBLISHED</span></td><td>${SITES.length-Object.keys(S.dep).length} of ${SITES.length}</td><td>06 Mar 2017</td><td></td></tr></table>`,
   sites:()=>`<table class="v"><tr><th>Site Number</th><th>Site Name</th><th>Study Country</th><th>Principal Investigator</th><th>Site Status</th><th>Active Version</th></tr>${SITES.map(s=>`<tr class="click" ${go('cro','site',{croSite:s.id,siteTab:'overview'})}><td><a>${s.id}</a></td><td>${s.name}</td><td>${s.ctry}</td><td>${s.pi}</td><td>Active</td><td><u>${S.dep[s.id]?2:1}</u></td></tr>`).join('')}</table>`,
   hist:()=>`<table class="v"><tr><th>Type</th><th>Target Version</th><th>Sites</th><th>Apply Amendment to</th><th>User</th><th>Run</th></tr>${S.jobs.map(j=>`<tr><td>Prospective Amendment</td><td>2</td><td>${j.ids.join(', ')}</td><td>All Subjects (future events only)</td><td>${j.by}</td><td class="nw">${j.at}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">No amendments have been run for version 2 yet.</td></tr>'}</table>`}[t]();
  return `<div class="ph"><h1>Casebook Versions</h1><div class="seg">${seg.map(x=>`<button class="${t===x[0]?'on':''}" ${h(()=>{S.vTab=x[0]})}>${x[1]}</button>`).join('')}</div></div>${needSponsor()}${body}`; }
const vJobs=()=>`<div class="ph"><h1>Job History</h1></div><table class="v"><tr><th>ID</th><th>Type</th><th>Status</th><th>User</th><th>Information</th><th>File and Log</th><th>Created</th></tr>
  ${S.jobs.map((j,i)=>`<tr><td>${4120+S.jobs.length-i}</td><td>Prospective Amendment</td><td>${icon('ok')} Completed</td><td>${j.by}</td><td>Version 2 → ${j.ids.join(', ')}</td><td><a ${h(()=>download('amendment_job_'+(4120+S.jobs.length-i)+'.log',`Prospective amendment to casebook version 2\nSites: ${j.ids.join(', ')}\nStarted by: ${j.by} at ${j.at}\nSubjects moved: ${j.ids.reduce((n,id)=>n+site(id).subs.length,0)}\nData points altered: 0\nStatus: Completed`,'text/plain'))}>Log</a></td><td class="nw">${j.at}</td></tr>`).join('')||'<tr><td colspan="7" class="muted">No amendment jobs yet. Use Set Active Version on the Sites page.</td></tr>'}
  <tr class="dim"><td>4120</td><td>Compare Single Casebook Versions</td><td>${icon('ok')} Completed</td><td>System</td><td>Version 1 vs 2</td><td><a ${h(openCompare)}>Open report</a></td><td class="nw">18 May 2017 08:02</td></tr></table>`;

/* ================= Site (Site Connect) ================= */
function scPage(tabs,body,right){ return `<div class="sctabs">${tabs.map(t=>`<button class="${t[2]?'on':''}" ${t[1]?h(t[1]):''}>${t[0]}</button>`).join('')}<span class="sp"></span>${right||''}</div><div class="wrap">${body}</div>`; }
function vSiteChanges(){
  const s=site(S.mySite), dep=S.dep[s.id], ackd=S.ack[s.id], items=ackItems(s), ok=items.every(i=>i[0]);
  const status=ackd?'<span class="pill solid">ACKNOWLEDGED</span>':dep?'<span class="pill med">ACTION NEEDED</span>':s.irb?'<span class="pill blue">COMING SOON</span>':'<span class="pill gray">ON HOLD · EC PENDING</span>';
  const short=!dep&&s.irb?`<div class="note">${icon('warn')}<div>Version 2 is not active at your site yet. ${S.signed?'The CRO has not activated it.':'The sponsor has not approved it.'} What you see below is a preview. <a ${h(fastDeploy)}>Demo shortcut: complete the sponsor and CRO steps</a></div></div>`:'';
  const hold=!s.irb?`<div class="note">${icon('warn')}<div>Your EC has not yet approved Protocol Ver. 1.1 (submitted ${s.sub}). Your site stays on casebook version 1 and nothing changes until approval is recorded.</div></div>`:'';
  return scPage([['Amendment Changes',null,1]],`
    ${ackd?`<div class="note green">${icon('ok')}<div><b>Acknowledged.</b> ${ackd.by} · ${ackd.at}. The CRO and sponsor can see your acknowledgement.</div></div>`:short+hold}
    ${fold('sc1',`Protocol Ver. 1.1: what changes at ${s.id} ${status}`,`
      <ul class="clean">${siteFacts(s).map(f=>`<li>${icon(f[0])}<div>${f[1]}</div></li>`).join('')}</ul>
      <p style="margin:10px 0 0"><a ${h(()=>openDoc(s,siteDocs(s)[0]))}>Read the protocol</a> &nbsp; ${S.signed?`<a ${h(()=>openDoc(s,siteDocs(s).find(d=>d.id==='chg')))}>See old vs new casebook</a> &nbsp; `:''}<a ${go('site','plan')}><b>See the plan for each participant</b></a> &nbsp; <a ${openEdc(s.id)}>Open EDC</a> &nbsp; <a ${go('site','contacts')}>Who to ask</a></p>
`)}
    ${s.cn?fold('sc2','Participants at '+s.id,subjectsTable(s),0):''}
    ${fold('sc3','Before you acknowledge',`
      ${items.map(i=>`<div class="gate">${i[3]==='tick'?`<input type="checkbox" style="margin:3px 2px 0 2px" ${i[0]?'checked':''} ${ackd?'disabled':h((e,el)=>{S.brief[s.id]=el.checked})}>`:icon(i[0]?'ok':'wait')}<div><b>${i[1]}</b><span class="muted">${i[2]}</span></div>${!i[0]&&i[3]?(i[3]==='plan'?`<a class="go" ${go('site','plan')}>Open Transition Plan</a>`:`<a class="go" ${go('site','docs',{dxTab:i[3]==='tasks'?'actions':'documents'})}>${i[3]==='tasks'?'Open Document Actions':'Open Documents'}</a>`):''}</div>`).join('')}
      ${ackd?'':`<div class="decide"><button class="btn org" ${ok?h(()=>signModal({title:'Acknowledge Casebook Update',text:`You confirm that <b>${s.id}</b> has reviewed the changes introduced by Protocol Ver. 1.1 and is ready to collect data on casebook version 2.`,meanings:['Acknowledgement – site has reviewed and is ready'],
          done:()=>{S.ack[s.id]={by:me().n,at:now()};log('Site acknowledged casebook version 2 by electronic signature',s.id);render();}})):'disabled'}>Acknowledge and Sign…</button>
        <button class="btn" ${h(()=>crModal({about:`Casebook v2 at ${s.id}`,site:s.id,title:'Report a problem with this change',intro:'Use this if the change does not work at your site as described. Say what does not work and what you would need instead. The CRO and sponsor see it straight away.',to:['CRO clinical site manager','Sponsor study build team']}))}>Cannot acknowledge: report a problem…</button>
        <span class="muted">${ok?'Everything is in place.':'Complete the open items above to enable.'}</span></div>`}
`)}${S.cr.some(c=>c.site===s.id)?`<div class="card"><h2>Your change requests</h2><div class="bd" style="padding:4px 12px 8px">${crTable(c=>c.site===s.id)}</div></div>`:''}${thread(s)}`);
}
function vSiteComms(){ const s=site(S.mySite), x=stats(s);
  const A=[[S.ack[s.id]?'':'<span class="udot"></span>','Protocol Ver. 1.1: casebook update for your site',s.cn?`${x.aff} of your participants gain new PK sampling visits. Review what changes and acknowledge.`:'No change in data entry at your site. Please review and acknowledge.','Today','changes'],
    ...(S.note[s.id]&&!S.ack[s.id]?[['<span class="udot"></span>','Reminder from the CRO: acknowledgement outstanding','Please review the amendment changes, complete your document actions and sign the acknowledgement.',S.note[s.id],'changes']]:[]),
    ...((S.msg[s.id]||[]).filter(m=>m.o==='CRO').slice(-1).map(m=>[m.seen?'':'<span class="udot"></span>','Reply from '+m.u+' (CRO)',m.x,m.at,'changes'])),
    ['','PK substudy consent form (v2.0) distributed','The updated consent form is available in Document Exchange for sites enrolling into the PK subgroup.','28 days ago','docs'],
    ['','Protocol Ver. 1.1 issued','The amended protocol is available in Document Exchange. Please submit it to your EC.','29 days ago','docs'],
    ['','Enrolment update','Thank you for your continued work on recruitment. Study-wide enrolment is on track.','44 days ago',null]];
  return scPage([['Study Announcements',null,1]],A.map(a=>`<div class="ann" ${a[4]?go('site',a[4]):na()}><div><b>${a[0]}${a[1]}</b>${a[2]}</div><small>${a[3]}</small></div>`).join('')); }
function vSiteDocs(){ const s=site(S.mySite), t=S.dxTab, ts=siteTasks(s);
  const actions=`<div class="card"><div class="bd" style="padding:4px 12px 8px"><table class="v"><tr><th>Action</th><th>Name</th><th>Description</th><th>Document Type</th><th>Due Date</th><th>Sponsor/CRO Comments</th></tr>
      <tr class="click" ${go('site','changes')}><td class="nw"><u style="text-decoration-style:dotted">Update &amp; Return</u></td><td><a><b>Casebook Version 2 – Site Acknowledgement</b></a></td><td>Confirms the site has reviewed the amendment changes</td><td>Acknowledgement</td><td class="nw">${s.irb?addBD(s.irb,10):'After EC approval'}</td><td>${S.ack[s.id]?`${icon('ok')} Signed ${S.ack[s.id].at}`:'Please eSign and return'}</td></tr></table></div></div>
    <div class="card"><h2>Readiness tasks <span class="muted" style="font-weight:normal">— ${ts.filter(x=>x.st==='done').length} of ${ts.length} done · a task closes only with proof</span></h2><div class="bd" style="padding:4px 12px 8px">${tasksTable(s,true)}</div></div>`;
  const docs=`<div class="card"><div class="bd" style="padding:4px 12px 8px"><div class="bar" style="margin:8px 0"><button class="btn org" ${unread(s)?h(()=>{siteDocs(s).forEach(d=>S.read[s.id+d.id]=1);log('All documents marked as read',s.id);}):'disabled'}>Mark as Read</button><span class="muted">${unread(s)} unread</span></div>${docsTable(s)}</div></div><p class="muted">Opening a document marks it as read and records it in the audit trail.</p>`;
  return scPage([['Document Actions',()=>{S.dxTab='actions'},t==='actions'],['Documents',()=>{S.dxTab='documents'},t!=='actions']],t==='actions'?actions:docs); }
const vSiteLinks=()=>{const s=site(S.mySite);return scPage([['System Links',null,1]],`<div class="card"><div class="bd" style="padding:4px 12px 8px"><table class="v"><tr><th>System Name</th><th>System Type</th><th>Description</th></tr>
  ${[['Veeva EDC','EDC','Enter casebook information here. New PK visits appear once version 2 is active.',openEdc(s.id)],['Study Training','Training','Protocol Ver. 1.1: PK visits and sampling windows (section 6.2.5).',h(()=>openPdf(51))],['Protocol Ver. 1.1','eTMF','The amended protocol, full text.',h(()=>openDoc(s,siteDocs(s)[0]))],['RTSM','RTSM / IRT','Randomisation and PK subgroup assignment.',h(()=>toast('RTSM is an external system and is not simulated in this demo'))]].map(r=>`<tr class="click" ${r[3]}><td><a>${r[0]}</a></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></div></div>`);};
const vSiteContacts=()=>scPage([['Sponsor/CRO Contacts',null,1]],`<div class="card"><div class="bd" style="padding:8px 12px">${contactsTable(site(S.mySite))}</div></div>`);
const vSiteInfo=()=>{const s=site(S.mySite), g=CTG.study;return scPage([['Study Information',null,1]],`<div class="card"><div class="bd"><dl class="kv">
  <dt>Study Number</dt><dd>${g.num} · <a href="https://clinicaltrials.gov/study/${g.nct}" target="_blank">${g.nct}</a></dd><dt>Protocol Title</dt><dd>${g.title}</dd>
  <dt>Sponsor</dt><dd>${g.sponsor}</dd><dt>Study Phase</dt><dd>${g.phase}</dd><dt>Masking</dt><dd>${g.mask}</dd><dt>Indication</dt><dd>${g.cond}</dd>
  <dt>Current protocol</dt><dd>Ver. 1.1, 16 May 2017 <a ${h(()=>openDoc(s,siteDocs(s)[0]))}>open</a></dd>
  <dt>Site</dt><dd>${s.id} · ${s.name}, ${s.city}, ${s.ctry}</dd><dt>Principal Investigator</dt><dd>${s.pi} <span class="muted">(simulated)</span></dd><dt>Active casebook</dt><dd>Version ${S.dep[s.id]?2:1} <a ${go('site','changes')}>what changes</a></dd></dl></div></div>
  <div class="card"><h2>Study Arms</h2><div class="bd" style="padding:4px 12px 8px"><table class="v"><tr><th>Arm</th><th>Role</th><th>Dosing</th></tr>${g.arms.map(a=>`<tr><td><b>${a.label}</b></td><td>${a.type}</td><td>Days 0, 14, 28, 42, 56 and 70</td></tr>`).join('')}</table></div></div>`);};
function vSiteAdmin(){ const s=site(S.mySite), t=S.adTab;
  const staff=`<table class="v"><tr><th>Name</th><th>Email</th><th>Study Role</th><th>Status</th></tr>${[[s.pi,'Principal Investigator','Active'],[s.coord,'Study Coordinator','Active'],['Pending VeevaID Registration','PK sampling nurse','Pending']].map(r=>`<tr><td>${r[2]==='Pending'?`<i>${r[0]}</i>`:`<b>${r[0]}</b> (VeevaID)`}</td><td>${r[2]==='Pending'?'pk.nurse':r[0].toLowerCase().replace(/[^a-z]+/g,'.')}@site.example</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`;
  return scPage([['Audit Trail',()=>{S.adTab='audit'},t==='audit'],['Site Staff Access',()=>{S.adTab='staff'},t!=='audit']],`<div class="card"><div class="bd" style="padding:8px 12px">${t==='audit'?auditTable(e=>e.s===S.mySite||(!e.s&&/approved|filed|deployed/i.test(e.x)),true):staff}</div></div>`); }

/* ================= Landing ================= */
const ROLES={sponsor:['Sponsor','Pharma or biotech','Studio','Approve the casebook change'],cro:['CRO','Clinical research organisation','EDC Tools','Roll out to sites'],site:['Site','Hospital or clinic','Vault Clinical Site Connect','Review and acknowledge']};
const demoAcct=r=>r==='site'?me0s(S.auth.sid):ME[r];
const me0s=sid=>{const st=site(sid);return {n:st.coord,u:st.coord.toLowerCase().replace(/\W+/g,'.')+'@site.example',o:'Site '+sid};};
function enter(role,u){ if(role==='site') S.mySite=S.auth.sid; if(u) S.user[role]=Object.assign({sid:S.auth.sid},u); else delete S.user[role];
  nav(role); log(`User signed in (${ROLES[role][0]})`,role==='site'?S.auth.sid:''); }
function doAuth(){ const a=S.auth, d=demoAcct(a.role), em=(a.email||'').trim(), nm=(a.name||'').trim();
  const fromMail=em.split('@')[0].split(/[._-]+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
  if(a.mode==='signup'){ const n=nm||fromMail; if(!n) return enter(a.role,null); enter(a.role,{n,u:em||d.u}); log(`Account created for ${n}${a.org?' ('+a.org+')':''}`,a.role==='site'?a.sid:''); return; }
  enter(a.role,!em||em===d.u||!fromMail?null:{n:fromMail,u:em}); }
document.addEventListener('input',e=>{ const m=/^a_(\w+)$/.exec(e.target.id||''); if(m) S.auth[m[1]]=e.target.value; });
document.addEventListener('change',e=>{ if(e.target.id==='a_sid'){S.auth.sid=e.target.value;render();} });
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&/^a_/.test(e.target.id||'')){ if(doAuth()!==false) render(); } });
function openStudy(){ const g=CTG.study, cs=[...new Set(SITES.map(s=>s.ctry))];
  $('layer').innerHTML=`<div class="ovl"><div class="modal" style="width:760px"><h2>Study: ${g.num} <span class="pill gray">${g.nct}</span><a ${h(closeM)}>Close ✕</a></h2><div class="bd">
    <div class="note blue"><div>Study record from ClinicalTrials.gov, fetched ${CTG.fetched}. The amendment rollout shown in this demo (dates, staff, subjects, statuses) is simulated.</div></div>
    <dl class="kv"><dt>Official title</dt><dd>${g.title}</dd><dt>Sponsor</dt><dd>${g.sponsor}</dd><dt>Phase</dt><dd>${g.phase}</dd><dt>Indication</dt><dd>${g.cond}</dd><dt>Design</dt><dd>${g.mask}</dd>
    <dt>Arms</dt><dd>${g.arms.map(a=>`${a.label} (${a.type})`).join(' · ')}</dd><dt>Primary outcome</dt><dd>${g.primary}</dd><dt>Secondary outcomes</dt><dd>${g.secondary.join('<br>')}</dd>
    <dt>Eligibility age</dt><dd>${g.age}</dd><dt>Enrollment</dt><dd>${g.enroll} (actual)</dd><dt>Locations</dt><dd>${SITES.length} sites: ${cs.map(c=>`${c} ${SITES.filter(s=>s.ctry===c).length}`).join(', ')}</dd>
    <dt>Registry status</dt><dd>${g.status} · started ${g.start} · completed ${g.end}</dd><dt>Study official</dt><dd>${g.official}</dd>
    <dt>Links</dt><dd><a href="https://clinicaltrials.gov/study/${g.nct}" target="_blank">ClinicalTrials.gov record</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/${g.pmid}/" target="_blank">Results publication (PMID ${g.pmid})</a> · <a ${h(()=>openPdf(1))}>Protocol Ver. 1.1</a></dd></dl></div></div></div>`; return false; }
function openStudies(){ const g=CTG.study;
  $('layer').innerHTML=`<div class="ovl"><div class="modal wide" style="height:auto"><h2>My Studies <span class="muted" style="font-size:12px">public registry records, ClinicalTrials.gov, fetched ${CTG.fetched}</span><a ${h(closeM)}>Close ✕</a></h2><div class="bd">
    <table class="v"><tr><th>Study Number</th><th>Study</th><th>Sponsor</th><th>Registry status</th><th>Enrolled</th><th>Sites</th><th>Countries</th><th>Protocol amendment</th></tr>
    <tr class="click sel" ${h(()=>{closeM();openStudy();return false;})}><td class="nw"><a><b>${g.num}</b></a><div class="muted" style="font-size:12px">${g.nct}</div></td><td>${g.brief}</td><td>${g.sponsor}</td><td>${g.status}</td><td class="r">${g.enroll}</td><td class="r">${SITES.length}</td><td class="r">3</td><td class="nw"><span class="pill med">Amendment 1 · ${S.signed?'rolling out':'in review'}</span></td></tr>
    ${CTG.others.map(o=>`<tr><td class="nw"><b>${o.num}</b><div class="muted" style="font-size:12px">${o.nct}</div></td><td>${o.brief}</td><td>${o.sponsor}</td><td>${o.status}</td><td class="r">${o.enroll}</td><td class="r">${o.sites}</td><td class="r">${o.countries}</td><td class="nw"><span class="muted">None open</span> · <a href="https://clinicaltrials.gov/study/${o.nct}" target="_blank">registry</a></td></tr>`).join('')}</table>
    <p class="muted" style="margin-bottom:0">Only ${g.num} is loaded with a casebook in this demo. The other rows are real phase 2 ulcerative colitis studies listed for context.</p></div></div></div>`; return false; }

const BRAND=n=>`<span class="brand" style="font-size:${n}px" aria-label="RELAY">REL<span class="ba">A<svg viewBox="0 0 44 22" aria-hidden="true"><path d="M4 9l7.5 9Q24 7 41 4.5" stroke="#141a33" stroke-width="8" fill="none" stroke-linejoin="miter"/><path d="M4 9l7.5 9Q24 7 41 4.5" stroke="#f5921b" stroke-width="4.6" fill="none" stroke-linejoin="miter"/></svg></span>Y</span>`;
const toSignIn=(role,mode)=>h(()=>{ if(role) S.auth.role=role; if(mode) S.auth.mode=mode; S.auth.email=''; S.home='signin'; window.scrollTo(0,0); });
const scrollTo=id=>`onclick="document.getElementById('${id}').scrollIntoView({behavior:'smooth'})"`;
function vSignIn(){ const a=S.auth, d=demoAcct(a.role);
  const fld=(id,label,type,ph)=>`<label class="sf">${label}<input id="a_${id}" type="${type||'text'}" value="${(a[id]||'').replace(/"/g,'&quot;')}" placeholder="${ph||''}" autocomplete="off"></label>`;
  return `<div class="welcome"><section class="w-story">
      <a class="w-brand" ${h(()=>{S.home='landing'})}>${BRAND(23)}</a>
      <div><span class="w-eye">PROTOCOL AMENDMENT HANDOFF</span>
        <h1>One amendment.<br>Three sign-offs.<br><em>Nothing dropped.</em></h1>
        <p>Every schema change comes with the protocol text behind it, so each party can approve what it is responsible for and pass it on.</p>
        <div class="w-flow"><span><b>Sponsor</b>approves the design</span><i>→</i><span><b>CRO</b>rolls out to sites</span><i>→</i><span><b>Site</b>acknowledges</span></div></div>
      <footer>Layouts follow Veeva products, so existing users can find their way.</footer></section>
    <section class="w-form"><div>
      <span class="w-eye">YOUR WORKSPACE</span><h2>${a.mode==='login'?'Welcome back.':'Create your account.'}</h2>
      <p>${a.mode==='login'?'Choose your role and open your workspace.':'Tell us who you are and we will take you to the right workspace.'}</p>
      <div class="roles">${Object.keys(ROLES).map(r=>`<div class="${a.role===r?'on':''}" ${h(()=>{a.role=r;a.email='';})}><b>${ROLES[r][0]}</b><small>${ROLES[r][1]}</small></div>`).join('')}</div>
      ${a.role==='site'?`<label class="sf">Your site<select id="a_sid">${SITES.map(x=>`<option value="${x.id}" ${x.id===a.sid?'selected':''}>${x.id} · ${x.name}</option>`).join('')}</select></label>`:''}
      ${a.mode==='signup'?fld('name','Full name','text','e.g. Alex Rivera')+(a.role==='site'?'':fld('org','Organisation','text',a.role==='cro'?'Your CRO':'Your company')):''}
      ${fld('email','Work email (optional in this demo)','email',d.u)}${fld('pw','Password','password','Optional in this demo')}
      <button class="btn org big" ${h(doAuth)}>${a.mode==='login'?'Open workspace':'Create account and open workspace'}</button>
      <button class="btn big" style="margin-top:10px" ${h(()=>enter(a.role,null))}>Continue as ${d.n} · demo ${ROLES[a.role][0].toLowerCase()}</button>
      <p class="w-switch">${a.mode==='login'?`New here? <a ${h(()=>{a.mode='signup'})}>Create an account</a>`:`Already have an account? <a ${h(()=>{a.mode='login'})}>Log in</a>`}</p>
      <div class="w-disc">You will land in ${ROLES[a.role][2]}. Demo identities only; no real authentication and nothing leaves this page.</div></div>
      <footer>${CTG.study.num} <span>·</span> ${CTG.study.nct}</footer></section></div>`; }
function vHome(){
  if(S.home==='signin') return vSignIn();
  const g=CTG.study, nAck=Object.keys(S.ack).length, nDep=Object.keys(S.dep).length, el=SITES.filter(eligible).length;
  const P=[['sponsor','1. Sponsor decides','Compare four ways to build the amendment, check each change against the protocol, then approve or send it back.',S.signed?`Approved ${S.signed.at}`:S.design?`Option ${S.design} chosen`:'4 schema options waiting'],
    ['cro','2. CRO rolls out','See which sites are ready, open any site, and activate the new casebook version as each ethics committee approves.',`${nDep} of ${el} ready sites live`],
    ['site','3. Site acknowledges','See what changes for your own participants, complete readiness tasks with proof, and sign, or report a problem.',`${nAck} site(s) acknowledged`]];
  const FAQ=[['Who is this for?','Sponsor data managers who own the casebook design, CRO site managers who roll changes out, and site coordinators who have to work with the result. Each gets a workspace that looks like the Veeva application they already use.'],
    ['What does the assistant actually do?','It compares the amended protocol with the current casebook, proposes several ways to build the change with pros and cons, drafts the detailed schema changes for the option you pick, and cites the protocol page behind each one. People make every decision; nothing changes until someone signs.'],
    ['Who makes the schema update?','The sponsor owns the casebook. Its data management team, or the CRO’s on its behalf, builds the new version, tests it and signs it off. The CRO moves each site onto it once that site’s ethics committee has approved the amended protocol. Sites do not build anything: they apply the new version to their own participants and confirm they are ready.'],
    ['How do I know the AI got it right?','Open the AI Record in any workspace. It lists every automated step and, for each schema change, the protocol page, the test cases, the assistant’s own doubt and the person who reviewed it. Steps that are plain calculations show their rule so you can redo them by hand.'],
    ['What if a proposed change is wrong?','Any reviewer can reject it. The sponsor can reject a single change, a whole option, or the draft; the CRO can return it to the sponsor; a site can report that it cannot work as described. Each rejection asks what does not work and what to try instead, and lands in a shared Change Requests list.'],
    ['What data is in the demo?',`The study record and all ${SITES.length} sites are real, from ClinicalTrials.gov (${g.nct}). The protocol is the real public PDF. Staff, participants, dates and the rollout are simulated, and the assistant’s suggestions are scripted.`],
    ['How do I present it quickly?',`Use the walkthrough for a guided tour, or skip ahead: <a ${h(()=>{fastSponsor();toast('Sponsor step completed')})}>complete the sponsor step</a> · <a ${h(()=>{fastDeploy();toast('Sponsor and CRO steps completed')})}>complete sponsor and CRO steps</a> · <a ${h(openPacket)}>open the inspection packet</a>. The three workspaces share one state, so what you do in one shows up in the others.`]];
  return `<div class="lp">
  <section class="lp-hero"><header class="lp-nav"><a class="lp-brand">${BRAND(25)}</a><nav><a ${scrollTo('trust')}>Why trust it</a><a ${scrollTo('how')}>How it works</a><a ${scrollTo('study')}>The study</a><a ${scrollTo('faq')}>FAQs</a><button class="btn org" ${toSignIn(null,'login')}>Open workspace</button></nav></header>
    <div class="lp-hero-in">
      <h1>From protocol amendment<br>to a clean handoff.</h1>
      <p>AI drafts the casebook update. Every change arrives with its source page, its test results, its doubts and the name of the person who signed for it.</p>
      <div class="lp-cta"><button class="btn org" ${toSignIn(null,'login')}>Open your workspace</button><button class="btn ghost" ${h(startTour)}>▶ Take the walkthrough <span>2 min</span></button></div>
      <span class="lp-aud">For sponsors, CROs and site teams.</span></div></section>
  <section class="lp-benefits"><div class="hw">
    <article><b>Nothing rests on the AI’s word</b><p>Each AI draft shows where it came from, how it was tested and what it is unsure of. It changes nothing until a named person accepts it.</p></article>
    <article><b>Options, not a single answer</b><p>Four ways to build the change, compared on what matters, with a recommendation and the reasons against the others.</p></article>
    <article><b>A handoff everyone can follow</b><p>Sponsor, CRO and site each sign for their part, and one audit trail shows who decided what, and why.</p></article></div></section>
  <section class="lp-sec alt" id="trust"><div class="hw"><span class="lp-eye">The AI Record</span><h2>How do I trust what the AI built?</h2><p class="lp-sub">Detailed auditing and consistency across sponsor, CRO and site.</p>
    <div class="lp-steps five">${[['1','Where it came from','The protocol page, opened beside the change. If it is not in the protocol, it says so.'],['2','What was done','A plain-language account of the change, with the casebook before and after.'],['3','How it was tested','Test cases on made-up participants. Try the same case yourself in Data Entry.'],['4','What it is unsure of','Where the protocol is unclear the assistant does not choose. A person does.'],['5','Who signed for it','Name, organisation and time for every accept, reject and signature.']].map(x=>`<article><i>${x[0]}</i><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div>
    <p class="lp-sub" style="margin:28px 0 0">AI drafts and fixed-rule calculations are labelled differently, because only one of them can be wrong in a way you cannot recompute. <a ${h(()=>nav('sponsor','trust'))}><b>Open the AI Record</b></a></p></div></section>
  <section class="lp-sec" id="how"><div class="hw"><span class="lp-eye">One amendment. Three sign-offs.</span><h2>How it works</h2><p class="lp-sub">Each role works in its own workspace. The amendment moves on only when the previous party has signed.</p>
    <div class="lp-steps">${P.map(p=>`<article><h3>${p[1]}</h3><p>${p[2]}</p><span class="lp-st">${p[3]}</span><a ${toSignIn(p[0],'login')}>Log in as ${ROLES[p[0]][0]}</a></article>`).join('')}</div></div></section>
  <section class="lp-sec alt" id="study"><div class="hw"><span class="lp-eye">Real public study data</span><h2>The study in this demo</h2>
    <div class="lp-study"><div><h3>${g.num} <span class="pill gray">${g.phase}</span></h3><p>${g.brief}</p>
        <dl class="kv"><dt>Sponsor</dt><dd>${g.sponsor}</dd><dt>Sites</dt><dd>${SITES.length} in China, South Korea and Taiwan · ${g.enroll} participants</dd>
        <dt>Amendment</dt><dd>Protocol Ver. 1.0 → Ver. 1.1: seven extra PK blood samples for the Mainland China PK subgroup</dd></dl></div>
      <div><h3>References</h3><ul><li><a href="https://clinicaltrials.gov/study/${g.nct}" target="_blank">ClinicalTrials.gov ${g.nct}</a></li><li><a href="https://cdn.clinicaltrials.gov/large-docs/52/${g.nct}/Prot_000.pdf" target="_blank">Protocol PDF, source file</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/${g.pmid}/" target="_blank">Results publication</a></li>
        <li><a ${h(openStudy)}>Full study record</a> · <a ${h(()=>openPdf(44))}>read the protocol here</a> · <a ${h(openStudies)}>other studies</a></li></ul></div></div></div></section>
  <section class="lp-sec" id="faq"><div class="hw narrow"><span class="lp-eye">Before you start</span><h2>Questions</h2>
    ${FAQ.map(q=>`<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('')}
    <div class="lp-end"><button class="btn org" ${toSignIn(null,'login')}>Open your workspace</button> <button class="btn" ${toSignIn(null,'signup')}>Create an account</button></div></div></section>
  <div class="foot">Concept demo. Not a Veeva product and not affiliated with Veeva Systems.</div></div>`;
}

/* ================= Router ================= */
const VIEWS={edc:{main:()=>vEdc()},sponsor:Object.assign({trust:()=>vTrust(),feedback:()=>vFeedback(),assist:vAssist,schedule:vSchedule,compare:vCompare,protocol:protocolPage,audit:()=>vAudit()},Object.fromEntries(['settings','plans','groups','events','forms','codelists','crules','urules'].map(k=>[k,()=>vObjects(k)]))),
  cro:{trust:()=>vTrust(),feedback:()=>vFeedback(),countries:()=>vCountries(),rollout:vRollout,site:vCroSite,versions:vVersions,jobs:vJobs,protocol:protocolPage,audit:()=>vAudit()},
  site:{trust:()=>vTrust(),plan:()=>vSitePlan(),changes:vSiteChanges,comms:vSiteComms,docs:vSiteDocs,links:vSiteLinks,contacts:vSiteContacts,info:vSiteInfo,admin:vSiteAdmin}};
function render(){ if(!$('layer').innerHTML) H=[]; const r=S.role;
  $('app').innerHTML=chrome(r==='home'?vHome():VIEWS[r][S.pg[r]]());
  try{ history.replaceState(null,'','#'+(r==='home'?(S.home==='signin'?'signin':''):[r,S.pg[r],r==='cro'?S.croSite:r==='site'?S.mySite:r==='edc'?S.edc.site:S.sTab,r==='cro'?S.siteTab:''].filter(Boolean).join('/'))); }catch(e){}
}
(function init(){ const p=location.hash.slice(1).split('/'); if(p[0]==='signin') S.home='signin'; if(VIEWS[p[0]]){ S.role=p[0]; if(VIEWS[p[0]][p[1]]) S.pg[p[0]]=p[1];
    if(p[0]==='cro'){ if(site(p[2]))S.croSite=p[2]; if(p[3])S.siteTab=p[3]; } if(p[0]==='site'&&site(p[2]))S.mySite=p[2]; if(p[0]==='edc'&&site(p[2]))S.edc.site=p[2]; if(p[0]==='sponsor'&&p[2])S.sTab=p[2]; }
  render(); })();
