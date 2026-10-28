let reviewSelectionIds=new Set();
function updateReviewSelection(){const visible=new Set(reviewVisibleEntries().map(e=>e.id));reviewSelectionIds=new Set([...reviewSelectionIds].filter(id=>visible.has(id)));for(const el of $('reviewBody').querySelectorAll('[data-review-select]'))el.checked=reviewSelectionIds.has(el.dataset.reviewSelect);$('reviewSelectionCount').textContent='已选'+reviewSelectionIds.size+'条 / 筛选结果'+visible.size+'条';$('reviewDeleteSelected').disabled=!reviewSelectionIds.size;$('reviewClearFiltered').disabled=!visible.size;$('reviewSelectAll').checked=!!visible.size&&reviewSelectionIds.size===visible.size;$('reviewSelectAll').indeterminate=!!reviewSelectionIds.size&&reviewSelectionIds.size<visible.size;$('reviewSelectAll').disabled=!visible.size;$('reviewUndoDelete').classList.toggle('hidden',!lastPerformanceDeletion)}
function removeReviewBatch(ids){const visible=new Set(reviewVisibleEntries().map(e=>e.id)),wanted=new Set(ids),month=$('month').value,targets=state.entries.filter(e=>e.month===month&&visible.has(e.id)&&wanted.has(e.id));if(!targets.length)return false;
 if(!confirm('删除当前筛选中的'+targets.length+'条记录？包含所选的待确认及无绩效记录，对应工资和报表同步更新。员工名单及其他月份保留，可撤销最近一次删除。'))return false;
 const targetIds=new Set(targets.map(e=>e.id)),sources=new Set(targets.map(e=>e.sourceKey).filter(Boolean)),savedBefore=state.entries,previewBefore=importPreview.slice(),savedRemoved=[],previewRemoved=[];
 state.entries=state.entries.filter((e,index)=>{if(e.month===month&&targetIds.has(e.id)){savedRemoved.push({entry:e,index});return false}return true});
 for(let i=importPreview.length-1;i>=0;i--){const e=importPreview[i];if(e.month===month&&(targetIds.has(e.id)||(e.sourceKey&&sources.has(e.sourceKey))))previewRemoved.unshift({entry:importPreview.splice(i,1)[0],index:i})}
 try{save()}catch(err){state.entries=savedBefore;importPreview.splice(0,importPreview.length,...previewBefore);toast('删除未保存：'+err.message);return false}
 lastPerformanceDeletion={campus:campusStore.active().id,month,savedRemoved,previewRemoved,previewRef:importPreview};reviewSelectionIds.clear();deletionRender();$('deleteUndo').classList.remove('hidden');$('reportUndoDelete').classList.remove('hidden');$('deleteUndoText').textContent='已删除'+targets.length+'条记录。';toast('已删除'+targets.length+'条记录，可撤销最近一次操作');return true;
}
const renderReviewBeforeBatch=renderReview;renderReview=function(){renderReviewBeforeBatch();updateReviewSelection()};
$('reviewBody').addEventListener('change',event=>{const id=event.target.dataset.reviewSelect;if(!id)return;if(event.target.checked)reviewSelectionIds.add(id);else reviewSelectionIds.delete(id);updateReviewSelection()});
$('reviewTypeFilter').onchange=()=>{reviewSelectionIds.clear();renderReview()};
$('reviewSelectAll').onchange=event=>{reviewSelectionIds=event.target.checked?new Set(reviewVisibleEntries().map(e=>e.id)):new Set();updateReviewSelection()};
$('reviewDeleteSelected').onclick=()=>removeReviewBatch([...reviewSelectionIds]);$('reviewClearFiltered').onclick=()=>removeReviewBatch(reviewVisibleEntries().map(e=>e.id));$('reviewUndoDelete').onclick=undoPerformanceDeletion;
$('month').addEventListener('change',()=>{reviewSelectionIds.clear();renderReview()});
renderReview();
$('reviewFilter').onchange=()=>{reviewSelectionIds.clear();renderReview()};
