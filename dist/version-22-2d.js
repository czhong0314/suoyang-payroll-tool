/* 22版2D绩效.docx: source rates verified from its three embedded tables.
   Individual rows coincide with 22版; keep separate IDs and employee version.
   Referral follows the user's unified 3% / 3000 rule; group classes stay disabled. */
for(const r of RULES.filter(r=>r.version==='22版'))RULES.push({...r,id:'22-2d-'+r.id,version:'22版2D',group:/^(非)?VIP辅助签约$/.test(r.item)?'签约激励':r.group});

// Shared institute signing incentives, confirmed for all four versions.
for(const version of ['22版','22版2D','24版','常规版'])for(const [key,item,rate,unit]of [['research','保研全线产品',300,'人'],['competition','竞赛制/求职产品A',200,'人'],['project','单项目/求职产品B',100,'项目']]){
 const existing=RULES.find(r=>r.version===version&&r.group==='汉艺签约激励'&&r.item===item);
 if(existing)Object.assign(existing,{rate,unit});else RULES.push({id:'institute-signup-'+version+'-'+key,version,group:'汉艺签约激励',item,tier:'通用',rate,unit,note:'保研A/B/C/D及basic/max/promax/ultra统一；须已全款，多位老师按各自标准均分。'});
}
