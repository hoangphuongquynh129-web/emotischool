'use strict';
const el=id=>document.getElementById(id);let busy=false,verified=false;
function sync(){if(!auth.active()){auth.clear();verified=false;}el('loginForm').hidden=verified;el('session').hidden=!verified;for(const id of ['ping','login','me','logout'])el(id).disabled=busy;}
async function run(fn){if(busy)return;busy=true;sync();el('status').textContent='Đang xử lý…';try{await fn();}catch(e){el('status').textContent='Không thành công: '+e.message;}finally{busy=false;sync();}}
el('ping').onclick=()=>run(async()=>{const r=await apiRequest();if(!r.ok||r.environment!=='TEST'||r.app!=='EmotiSchool')throw Error('API không ở chế độ TEST');el('status').textContent='Kết nối API thành công · '+r.version+' · TEST';});
el('loginForm').onsubmit=e=>{e.preventDefault();const key=el('key').value.trim();el('key').value='';if(!key)return;run(async()=>{try{const u=await auth.login(key);verified=true;el('identity').textContent=u.id+' · '+u.role;el('status').textContent='Đăng nhập và xác thực thành công.';}catch(e){auth.clear();throw e;}});};
el('me').onclick=()=>run(async()=>{await auth.me();el('status').textContent='Phiên hợp lệ.';});
el('logout').onclick=()=>run(async()=>{await auth.logout();verified=false;el('identity').textContent='';el('status').textContent='Đã đăng xuất.';});
setInterval(()=>{if(!busy&&verified&&!auth.active()){sync();el('status').textContent='Phiên đã hết hạn.';}},1000);sync();
