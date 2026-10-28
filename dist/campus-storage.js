/* Browser-only storage. Permanent rosters and payroll drafts have separate keys. */
const CampusStorage=(()=>{
 const registryKey='mentor-payroll-campus-registry-v2',legacyKey='mentor-payroll-v1';
 const staffKey=id=>'mentor-payroll-campus-staff-v2:'+id,draftKey=id=>'mentor-payroll-campus-draft-v2:'+id;
 const copy=x=>JSON.parse(JSON.stringify(x)),empty=()=>({entries:[],staff:{},salary:{}});
 function open(storage,options={}){
  const now=options.now||(()=>new Date().toISOString()),uuid=options.uuid||(()=>crypto.randomUUID());
  function read(key,fallback){const raw=storage.getItem(key);if(raw===null)return copy(fallback);try{return JSON.parse(raw)}catch{throw Error('本地数据读取失败，请保留浏览器数据并恢复备份。')}}
  function transact(pairs){const originals=pairs.map(([k])=>[k,storage.getItem(k)]);try{for(const [k,v]of pairs)storage.setItem(k,JSON.stringify(v))}catch(err){for(const [k,v]of originals){try{if(v===null)storage.removeItem(k);else storage.setItem(k,v)}catch{}}throw Error('本地保存失败，请检查浏览器是否允许本地存储，或先导出备份。')}}
  let registry=read(registryKey,null);
  if(!registry){const legacy=read(legacyKey,empty()),id='default-campus';registry={schema:2,activeId:id,campuses:[{id,name:'本校区',createdAt:now()}]};transact([[staffKey(id),{staff:legacy.staff||{},meta:{}}],[draftKey(id),{entries:legacy.entries||[],salary:legacy.salary||{},period:'',updatedAt:now()}],[registryKey,registry]]);storage.removeItem(legacyKey)}
  if(!Array.isArray(registry.campuses)||!registry.campuses.some(x=>x.id===registry.activeId))throw Error('本地校区设置异常，请恢复备份。');
  function staffData(){return read(staffKey(registry.activeId),{staff:{},meta:{}})}
  function draftData(){return read(draftKey(registry.activeId),{entries:[],salary:{},period:''})}
  function load(){const s=staffData(),d=draftData();return {staff:copy(s.staff),staffRules:copy(s.rules||{}),entries:copy(d.entries),salary:copy(d.salary)}}
  function save(state,period){const before=staffData(),meta=copy(before.meta||{}),stamp=now();for(const [name,version]of Object.entries(state.staff)){if(before.staff[name]!==version||JSON.stringify((before.rules||{})[name]||null)!==JSON.stringify((state.staffRules||{})[name]||null)){const old=meta[name]||{history:[]};meta[name]={updatedAt:stamp,history:[...(old.history||[]),{at:stamp,from:before.staff[name]||'',to:version,fromRule:copy((before.rules||{})[name]||null),toRule:copy((state.staffRules||{})[name]||null)}]}}}for(const name of Object.keys(meta))if(!Object.hasOwn(state.staff,name))delete meta[name];transact([[staffKey(registry.activeId),{staff:state.staff,rules:state.staffRules||{},meta}],[draftKey(registry.activeId),{entries:state.entries,salary:state.salary,period:period||draftData().period||'',updatedAt:stamp}]])}
  function list(){return copy(registry.campuses)}
  function active(){return copy(registry.campuses.find(x=>x.id===registry.activeId))}
  function switchTo(id){if(!registry.campuses.some(x=>x.id===id))throw Error('未找到校区');const next={...registry,activeId:id};transact([[registryKey,next]]);registry=next;return load()}
  function create(name){name=String(name||'').trim();if(!name)throw Error('请填写校区名称');if(registry.campuses.some(x=>x.name===name))throw Error('这个校区已存在，请直接选择');const id=uuid(),next={...registry,activeId:id,campuses:[...registry.campuses,{id,name,createdAt:now()}]};transact([[staffKey(id),{staff:{},meta:{}}],[draftKey(id),{entries:[],salary:{},period:''}],[registryKey,next]]);registry=next;return load()}
  function rename(name){name=String(name||'').trim();if(!name)throw Error('请填写校区名称');if(registry.campuses.some(x=>x.id!==registry.activeId&&x.name===name))throw Error('这个校区名称已存在');const next={...registry,campuses:registry.campuses.map(x=>x.id===registry.activeId?{...x,name}:x)};transact([[registryKey,next]]);registry=next}
  function clearDraft(period){transact([[draftKey(registry.activeId),{entries:[],salary:{},period:period||'',updatedAt:now()}]]);return load()}
  return {load,save,list,active,switchTo,create,rename,clearDraft,period:()=>draftData().period||'',staffMeta:()=>copy(staffData().meta||{})};
 }
 return {open,registryKey,staffKey,draftKey};
})();
