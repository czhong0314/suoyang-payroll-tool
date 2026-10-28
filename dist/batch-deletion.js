let reportSelection=new Set();
function removePerformanceBatch(ids){
 const month=$('month').value,requested=new Set(ids),eligible=new Set(reportSheets().flatMap(s=>s.recordIds||[])),targets=reportEntries().filter(e=>e.month===month&&requested.has(e.id)&&eligible.has(e.id));
 if(!targets.length){toast('请先选择报表中的绩效记录');return false}
 if(!confirm('删除当月报表中的'+targets.length+'条绩效？对应金额将从工资合计和导出报表中移除，员工名单、待确认记录和其他月份保留。当前页面可撤销最近一次删除。'))return false;
 const targetIds=new Set(targets.map(e=>e.id)),savedIds=new Set(state.entries.filter(e=>e.month===month&&targetIds.has(e.id)).map(e=>e.id)),sources=new Set(state.entries.filter(e=>savedIds.has(e.id)).map(e=>e.sourceKey).filter(Boolean));
 const savedBefore=state.entries,previewBefore=importPreview.slice(),savedRemoved=[],previewRemoved=[];
 state.entries=state.entries.filter((e,i)=>{if(savedIds.has(e.id)&&e.month===month){savedRemoved.push({entry:e,index:i});return false}return true});
 for(let i=importPreview.length-1;i>=0;i--){const e=importPreview[i];if(e.month===month&&(targetIds.has(e.id)||(e.sourceKey&&sources.has(e.sourceKey))))previewRemoved.unshift({entry:importPreview.splice(i,1)[0],index:i})}
 try{if(savedRemoved.length)save()}catch(err){state.entries=savedBefore;importPreview.splice(0,importPreview.length,...previewBefore);toast('删除未保存：'+err.message);return false}
 lastPerformanceDeletion={campus:campusStore.active().id,month,savedRemoved,previewRemoved,previewRef:importPreview};reportSelection.clear();deletionRender();$('deleteUndo').classList.remove('hidden');$('reportUndoDelete').classList.remove('hidden');$('deleteUndoText').textContent='已删除'+targets.length+'条绩效。';toast('已删除'+targets.length+'条，报表和工资合计已更新');return true
}
function updateReportSelection(){const available=new Set(reportSheets().flatMap(s=>s.recordIds||[]));reportSelection=new Set([...reportSelection].filter(id=>available.has(id)));for(const checkbox of document.querySelectorAll('[data-report-select]'))checkbox.checked=reportSelection.has(checkbox.dataset.reportSelect);$('reportSelectionCount').textContent='已选'+reportSelection.size+'条';$('reportDeleteSelected').disabled=!reportSelection.size;$('reportClear').disabled=!available.size;$('reportSelectAll').checked=available.size>0&&reportSelection.size===available.size;$('reportSelectAll').indeterminate=reportSelection.size>0&&reportSelection.size<available.size;$('reportSelectAll').disabled=!available.size}
const reportBeforeSelection=renderReport;renderReport=function(){reportBeforeSelection();updateReportSelection()};
for(const id of ['feeReport','signReport'])$(id).addEventListener('change',e=>{const key=e.target.dataset.reportSelect;if(!key)return;if(e.target.checked)reportSelection.add(key);else reportSelection.delete(key);updateReportSelection()});
$('reportSelectAll').onchange=e=>{reportSelection=e.target.checked?new Set(reportSheets().flatMap(s=>s.recordIds||[])):new Set();updateReportSelection()};
$('reportDeleteSelected').onclick=()=>removePerformanceBatch([...reportSelection]);$('reportClear').onclick=()=>removePerformanceBatch(reportSheets().flatMap(s=>s.recordIds||[]));
$('month').addEventListener('change',()=>{reportSelection.clear();updateReportSelection()});
const refreshBeforeBatch=refreshCampusState;refreshCampusState=function(){reportSelection.clear();refreshBeforeBatch();updateReportSelection()};updateReportSelection();
