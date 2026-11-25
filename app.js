'use strict';
const el=id=>document.getElementById(id);let busy=false,verified=false,directoryData=null;
function sync(){if(!auth.active()){auth.clear();verified=false;}el('loginForm').hidden=verified;el('session').hidden=!verified;el('admin').hidden=!verified;document.querySelector('.login-layout').hidden=verified;if(!verified){directoryData=null;el('directory').replaceChildren();}for(const id of ['ping','login','me','logout','adminMe','adminLogout','refreshAdmin'])el(id).disabled=busy;}
async function run(fn){if(busy)return;busy=true;sync();el('status').textContent='Đang xử lý…';try{await fn();}catch(e){el('status').textContent='Không thành công: '+e.message;}finally{busy=false;sync();}}
el('ping').onclick=()=>run(async()=>{const r=await apiRequest();if(!r.ok||r.environment!=='TEST'||r.app!=='EmotiSchool')throw Error('API không ở chế độ TEST');el('status').textContent='Kết nối API thành công · '+r.version+' · TEST';});
el('loginForm').onsubmit=e=>{e.preventDefault();const key=el('key').value.trim();el('key').value='';if(!key)return;run(async()=>{try{const u=await auth.login(key);verified=true;el('identity').textContent=u.id+' · '+u.role;el('status').textContent='Đăng nhập và xác thực thành công.';window.scrollTo(0,0);}catch(e){auth.clear();throw e;}});};
el('me').onclick=()=>run(async()=>{await auth.me();el('status').textContent='Phiên hợp lệ.';});
el('logout').onclick=()=>run(async()=>{await auth.logout();verified=false;el('identity').textContent='';el('status').textContent='Đã đăng xuất.';});
setInterval(()=>{if(!busy&&verified&&!auth.active()){sync();el('status').textContent='Phiên đã hết hạn.';}},1000);sync();

function renderDirectory(){const root=el('directory');root.replaceChildren();if(!directoryData)return;const f=el('campusFilter').value;const cs=directoryData.campuses.filter(c=>!f||c.id===f),ls=directoryData.classes.filter(c=>!f||c.campus===f),ss=directoryData.students.filter(s=>ls.some(c=>c.id===s.classId));for(const [title,rows] of [['Cơ sở',cs.map(c=>[c.id,c.name])],['Lớp',ls.map(c=>[c.id,c.name,'Khối '+c.grade,c.campus])],['Học sinh mẫu',ss.map(s=>[s.id,s.name,s.classId])],['Tài khoản thử nghiệm',directoryData.accounts.map(a=>[a.id,a.role])]]){const h=document.createElement('h3');h.textContent=title+' ('+rows.length+')';root.append(h);const table=document.createElement('table');for(const row of rows){const tr=table.insertRow();for(const v of row)tr.insertCell().textContent=v;}root.append(table);}}
el('campusFilter').onchange=renderDirectory;el('refreshAdmin').onclick=()=>run(async()=>{directoryData=null;renderDirectory();el('adminStatus').textContent='Đang tải…';try{directoryData=await auth.overview();renderDirectory();el('adminStatus').textContent='Đã tải dữ liệu từ Google Sheets.';}catch(e){el('adminStatus').textContent='Lỗi: '+e.message;throw e;}});

el('adminMe').onclick=()=>run(async()=>{await auth.me();el('adminStatus').textContent='Phiên hợp lệ.';});
el('adminLogout').onclick=()=>el('logout').click();
