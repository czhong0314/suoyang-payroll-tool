let reviewMode='saved';
function activeReview(){return (reviewMode==='preview'?importPreview:state.entries).find(x=>x.id===reviewSelection)}
function openCorrection(id,mode){const entry=(mode==='preview'?importPreview:state.entries).find(x=>x.id===id);if(!entry||entry.duplicate)return;reviewSelection=id;reviewMode=mode;$('fix-teacher').value=entry.teacher;$('fix-fullPaid').value=({paid:'是',unpaid:'否'})[PayrollMatch.paymentStatus(entry.fullPaid??entry.raw?.fullPaid)]||'';$('reviewPanel').classList.remove('hidden');$('reviewHeading').textContent=(mode==='preview'?'导入前修正：':'已导入记录：')+entry.teacher+' / '+entry.student;$('reviewOriginal').textContent=(entry.sourceLabel||'手动记录')+' ｜ 原始数据：'+Object.entries(entry.originalRaw||entry.raw||{}).filter(([,v])=>v).map(([k,v])=>(PayrollMatch.labels[k]||k)+': '+v).join(' ｜ ');$('reviewVersion').value=entry.version;reviewOptions(entry.version);$('reviewRule').value=entry.rule;for(const [id,k]of [['reviewQty','qty'],['reviewRatio','ratio'],['reviewProject','project'],['reviewNature','nature'],['reviewOverride','override'],['reviewReason','reason']])$(id).value=entry[k]??'';for(const k of ['country','package','degree','discipline','major','product','signDate','signupHours','signupProjects'])$('fix-'+k).value=entry.raw?.[k]||'';const p=entry.raw?.progress;$('fix-progress').value=p&&String(p).endsWith('%')?Number(String(p).slice(0,-1))/100:(p||entry.ratio);$('reviewExclude').checked=!!entry.excludedReason;$('saveTeacherVersion').checked=false;$('correctionResult').textContent=calculate(entry).status;$('reviewRuleSearch').value='';correctionHints();$('reviewPanel').scrollIntoView({behavior:'smooth',block:'center'})}
$('reviewBody').onclick=e=>{if(e.target.dataset.review){const entry=state.entries.find(x=>x.id===e.target.dataset.review);if(entry&&(entry.manualEntry||!entry.raw)){$('reviewPanel').classList.add('hidden');editManualEntry(entry.id)}else openCorrection(e.target.dataset.review,'saved')}};
$('previewBody').onclick=e=>{if(e.target.dataset.previewEdit)openCorrection(e.target.dataset.previewEdit,'preview')};
function correctedRaw(){const old=activeReview();const d={...(old.raw||{})};for(const k of ['country','package','degree','discipline','major','product','signDate','signupHours','signupProjects'])d[k]=$('fix-'+k).value.trim();d.teacher=$('fix-teacher').value.trim();d.fullPaid=$('fix-fullPaid').value;d.student=old.student;d.nature=$('reviewNature').value;d.version=$('reviewVersion').value;d.project=$('reviewProject').value;d.progress=$('fix-progress').value;return d}
$('tryMatch').onclick=()=>{const old=activeReview();if(!old)return;const d=correctedRaw(),p=Number(d.progress);if(d.progress!==''&&(!Number.isFinite(p)||p<0||p>1))return toast('项目进度应在0到1之间；2是录入错误，请先修正');const next=PayrollMatch.match(d,old.sourceKind||'settlement',state.staff,state.staffRules||{});$('reviewVersion').value=next.version;reviewOptions(next.version);$('reviewRule').value=next.rule;$('reviewQty').value=next.qty;$('reviewRatio').value=next.ratio;$('reviewExclude').checked=!!next.excludedReason;$('correctionResult').textContent=calculate(next).status+(next.rule?' ｜ '+ruleBy(next.rule).item:'');correctionHints(next);toast(next.importIssue?'仍需核对，请查看上方具体提示':'已按修正资料重新匹配，点击确认保存')};
$('reviewVersion').onchange=()=>{reviewOptions($('reviewVersion').value);$('correctionResult').textContent='版本已变化，请点击“按修正资料重新匹配”。'};
$('reviewRatio').onchange=()=>$('fix-progress').value=$('reviewRatio').value;
$('reviewRuleSearch').oninput=()=>{const q=PayrollMatch.norm($('reviewRuleSearch').value);for(const o of $('reviewRule').options)o.hidden=!!o.value&&!o.selected&&!PayrollMatch.norm(o.textContent).includes(q)};
$('reviewForm').onsubmit=e=>{e.preventDefault();const old=activeReview();if(!old)return;const d=correctedRaw(),p=Number(d.progress);if(d.progress!==''&&(!Number.isFinite(p)||p<0||p>1))return toast('项目进度最高为1，请先修正录入错误');const automatic=PayrollMatch.match(d,old.sourceKind||'settlement',state.staff,state.staffRules||{}),rule=$('reviewRule').value,excluded=$('reviewExclude').checked||!!automatic.excludedReason;if(!excluded&&!rule){correctionHints(automatic,true);return toast(automatic.importIssue||'尚未选择计费规则，请查看核对提示')}if(rule&&ruleBy(rule)?.version!==d.version)return toast('请选择当前绩效版本的规则');const override=$('reviewOverride').value===''?null:Number($('reviewOverride').value),reason=$('reviewReason').value.trim();if(override!==null&&!reason)return toast('人工调整金额时请填写原因');
 const updated={...old,raw:d,teacher:d.teacher,fullPaid:d.fullPaid,signDate:d.signDate||'',versionReason:automatic.versionReason||'',originalRaw:old.originalRaw||old.raw,version:d.version,rule:rule||automatic.rule,qty:Number($('reviewQty').value),ratio:d.progress!==''?p:Number($('reviewRatio').value),project:d.project,nature:d.nature,override,reason,manualResolved:true,versionDefault:false,importIssue:'',excludedReason:automatic.excludedReason||(excluded?'人工排除':''),condition:'yes',correctedAt:new Date().toISOString()};if(d.version==='老汉艺版本'&&automatic.excludedReason){updated.rule=automatic.rule;updated.override=null}
 if(reviewMode==='preview'){const at=importPreview.findIndex(x=>x.id===old.id);importPreview[at]=updated;if($('saveTeacherVersion').checked){importPreview.staffChanges||=[];importPreview.staffChanges=importPreview.staffChanges.filter(x=>x.teacher!==old.teacher);importPreview.staffChanges.push({teacher:d.teacher,version:d.version});for(let i=0;i<importPreview.length;i++){let item=importPreview[i];if(item.teacher===old.teacher&&item.id!==old.id&&!item.manualResolved&&!item.duplicate&&!item.raw.version)importPreview[i]={...item,...PayrollMatch.match(item.raw,item.sourceKind,{...state.staff,[old.teacher]:d.version},state.staffRules||{})}}}drawPreview();}
 else{state.entries=state.entries.map(x=>x.id===old.id?updated:x);if($('saveTeacherVersion').checked){state.staff[d.teacher]=d.version;state.entries=state.entries.map(x=>x.teacher===old.teacher&&x.month===old.month&&x.id!==old.id&&x.raw&&!x.manualResolved&&!x.duplicate&&!x.raw.version?{...x,...PayrollMatch.match(x.raw,x.sourceKind,state.staff,state.staffRules||{})}:x)}render();renderReview()}
 $('reviewPanel').classList.add('hidden');toast(reviewMode==='preview'?'预览已修正，确认导入后计入工资':'已修正并更新工资')};

$('fix-teacher').onchange=()=>{const old=activeReview();if(!old||$('fix-teacher').value.trim()===old.teacher)return;const selected=StaffVersionPolicy.resolve($('fix-teacher').value.trim(),$('fix-signDate').value,state.staff,state.staffRules||{});$('reviewVersion').value=selected.version;reviewOptions(selected.version);$('saveTeacherVersion').checked=false;$('correctionResult').textContent=selected.issue||'领取老师已修改，请重新匹配并核对金额。'};

function correctionHints(matched,focus=false){
 const old=activeReview();if(!old)return;const d=correctedRaw(),next=matched||PayrollMatch.match(d,old.sourceKind||'settlement',state.staff,state.staffRules||{}),issue=next.importIssue||'',items=[];
 const add=(id,text)=>items.push({id,text});
 if(!$('reviewExclude').checked&&!next.excludedReason){
 if(!d.teacher)add('fix-teacher','领取老师：请填写领取绩效的老师。');
 if(!d.nature)add('reviewNature','老师性质：请选择全职或实际性质。');
 if(/英美|跨.*地区|国家/.test(issue))add('fix-country','国家／产品类别：'+(d.country?'“'+d.country+'”目前无法唯一匹配。':'尚未填写。')+'请填写具体国家（如英国、法国）；辅助签约也可明确填写“英美”或“非英美”。跨地区时请明确本条采用的产品类别。');
 if(/套餐|VIP|产品无法|项目类型/.test(issue))add('fix-package','套餐／报名形式：请补充明确套餐，如Top3、VIP5、单作品集或保研basic；仍无法匹配时可手动选择下方计费规则。');
 if(/学历/.test(issue))add('fix-degree','学历／学位：请明确填写本科或研究生。');
 if(/科系/.test(issue))add('fix-discipline','科系／专业：请补充科系或专业，以确定对应项目标准。');
 if(/全款/.test(issue))add('fix-fullPaid','是否已全款：请选择已全款或未全款；未全款不发放辅助签约奖励。');
 if(/签约日期|签约时间|日期/.test(issue))add('fix-signDate','学生签约日期：请填写完整年月日，用于判断新旧绩效版本。');
 if(/课时/.test(issue))add('fix-signupHours','报名课时／套餐：请补充实际购买课时，明确课时制套餐；这里不是当月授课时长。');
 if(/项目数|个项目/.test(issue))add('fix-signupProjects','报名项目数：请补充学生签约购买的项目数量。');
 if(/进度|比例/.test(issue))add('fix-progress','项目进度：请填写0到1之间的结算比例，例如0.2表示20%。');
 if(issue&&!items.length)add('reviewRule',issue+'。请核对原始资料；必要时手动选择准确的计费规则。');
 if(!$('reviewRule').value&&!issue)add('reviewRule',next.rule?'资料已能匹配，请点击“按修正资料重新匹配”以填入计费规则。':'匹配规则：请重新匹配，或手动选择正确的计费规则。');
 if($('reviewOverride').value!==''&&!$('reviewReason').value.trim())add('reviewReason','调整原因：人工修改金额时必须填写。');
 }
 for(const el of $('reviewForm').querySelectorAll('[aria-invalid]'))el.removeAttribute('aria-invalid');
 for(const el of $('reviewForm').querySelectorAll('.correction-field-hint'))el.remove();
 for(const item of items){const el=$(item.id);if(!el)continue;el.setAttribute('aria-invalid','true');const hint=document.createElement('small');hint.className='correction-field-hint';hint.textContent=item.text;el.parentElement.appendChild(hint)}
 $('correctionHints').classList.toggle('hidden',!items.length);$('correctionHints').textContent=items.length?'需要核对：'+items.map(x=>x.text).join(' '):'';
 if(focus&&items.length){const target=$(items[0].id),details=target?.closest('details');if(details)details.open=true;target?.focus();}return items;
}
$('reviewForm').addEventListener('input',()=>correctionHints());$('reviewForm').addEventListener('change',()=>correctionHints());

// Requote edited source fields immediately; persistence still requires confirmation.
function autoCorrectionQuote(){
 const old=activeReview();if(!old)return;
 const d=correctedRaw(),next=PayrollMatch.match(d,old.sourceKind||'settlement',state.staff,state.staffRules||{});
 $('reviewVersion').value=next.version;reviewOptions(next.version);$('reviewRule').value=next.rule||'';
 $('reviewQty').value=next.qty;$('reviewRatio').value=next.ratio;$('reviewExclude').checked=!!next.excludedReason;
 const result=calculate(next),r=ruleBy(next.rule),override=$('reviewOverride').value;
 $('correctionResult').textContent=result.status+(r?' ｜ '+r.group+' / '+r.item+' / '+(r.tier||''):'')+(result.status==='可结算'?' ｜ 自动金额 ¥'+money(result.amount):'')+(override!==''?' ｜ 人工调整金额 ¥'+money(Number(override))+'（保留）':'');
 correctionHints(next);return next;
}
const correctionAutoFields=new Set(['fix-teacher','fix-signDate','fix-country','fix-package','fix-degree','fix-discipline','fix-major','fix-product','fix-progress','fix-signupHours','fix-signupProjects','fix-fullPaid','reviewVersion','reviewNature']);
for(const event of ['input','change'])$('reviewForm').addEventListener(event,e=>{if(correctionAutoFields.has(e.target.id))autoCorrectionQuote()});
$('tryMatch').onclick=()=>{autoCorrectionQuote();toast('已更新自动计费方案，请核对后确认保存')};
const openCorrectionBeforeAuto=openCorrection;openCorrection=function(id,mode){openCorrectionBeforeAuto(id,mode);const e=activeReview();if(e&&!e.manualResolved)autoCorrectionQuote()};
{
 const advanced=document.createElement('details');advanced.className='wide';const summary=document.createElement('summary');summary.textContent='手动选择计费规则（自动匹配不适用时展开）';advanced.appendChild(summary);
 const form=$('reviewForm').querySelector('.form');form.appendChild(advanced);
 for(const id of ['reviewRuleSearch','reviewRule'])advanced.appendChild($(id).parentElement);
 $('tryMatch').textContent='刷新自动计费';
}
