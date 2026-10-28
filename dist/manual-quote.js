/* One matching path for automatic manual quotes and imported records. */
const ManualQuote=(()=>{
 function evaluate(data,staff,policies,options={}){
  const previous=options.previous||{},roster={...staff};if(previous.teacher===data.teacher&&!roster[data.teacher]&&previous.version)roster[data.teacher]=previous.version;
  const selection=StaffVersionPolicy.resolve(data.teacher,data.signDate,roster,policies||{}),raw={...data,version:selection.version},v=selection.version;
  const referral=/自产转介绍/.test(raw.type),signup=/辅助签约/.test(raw.type),source=signup?'signup':raw.type==='项目'?'project':'settlement';
  if(!signup&&!referral){if(['22版','22版2D','24版'].includes(v)&&/软件.*基础课|软件课/.test(raw.type))raw.type='基础课';else if(v==='常规版'&&raw.type==='基础课')raw.type='软件基础课'}
  let entry=PayrollMatch.match(raw,source,roster,policies||{});
  if(referral&&!selection.issue&&raw.teacher&&raw.student&&raw.nature==='全职'){
   const r=RULES.find(r=>r.version===v&&r.item==='自产转介绍');if(r)entry={...entry,rule:r.id,importIssue:'',qty:Number(raw.quantity),ratio:Number(raw.progress)};
  }
  const forced=options.ruleOverride&&RULES.find(r=>r.id===options.ruleOverride&&r.version===v);
  if(forced){entry.rule=forced.id;const protectedIssue=selection.issue||(!raw.teacher||!raw.student?'缺少负责老师或学生姓名':'');entry.importIssue=protectedIssue;entry.qty=Number(raw.quantity);entry.ratio=Number(raw.progress)}
  return {...previous,...entry,id:previous.id,month:options.month||previous.month,sourceKind:source,sourceLabel:'手动补录',manualEntry:true,manualResolved:true,manualRule:!!forced,manualSchemeReason:options.manualReason||'',manualInputType:data.type,manualInputPackage:data.package,raw,fullPaid:raw.fullPaid,signupHours:raw.signupHours,signupProjects:raw.signupProjects,advisor:raw.advisor||'',trialDate:raw.trialDate||'',enrolledCourse:raw.enrolledCourse||[raw.country,raw.package].filter(Boolean).join(' '),paid:Number(options.paid||0),override:options.override??null,reason:options.reason||'',condition:options.condition||'yes'};
 }
 return {evaluate};
})();
