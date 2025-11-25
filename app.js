/* app.js: وظائف تسجيل الدخول، عرض الحساب، بحث المشرف، مبادرات، حفظ جلسة */

let currentCode = null;
let currentRole = null; // "student" | "admin"

/* تسجيل الدخول */
function login(){
  const code = document.getElementById("code").value.trim();
  const pass = document.getElementById("password").value;

  if(!code || !pass){ alert("من فضلك أدخل الكود وكلمة السر"); return; }

  // طالب؟
  if(students[code] && students[code].password === pass){
    currentCode = code; currentRole = "student";
    localStorage.setItem("loggedInUser", code);
    localStorage.setItem("loggedInRole", "student");
    showHome();
    return;
  }

  // مشرف؟
  if(admins[code] && admins[code].password === pass){
    currentCode = code; currentRole = "admin";
    localStorage.setItem("loggedInUser", code);
    localStorage.setItem("loggedInRole", "admin");
    showHome();
    return;
  }

  alert("الكود أو كلمة السر غير صحيحة");
}

/* تحقّق الجلسة عند تحميل الصفحة */
window.addEventListener("load", ()=>{
  const savedCode = localStorage.getItem("loggedInUser");
  const savedRole = localStorage.getItem("loggedInRole");
  if(savedCode && savedRole){
    if(savedRole === "student" && students[savedCode]){ currentCode = savedCode; currentRole = "student"; showHome(); return; }
    if(savedRole === "admin" && admins[savedCode]){ currentCode = savedCode; currentRole = "admin"; showHome(); return; }
    // غير صالح → امسح الجلسة
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInRole");
  }
});

/* إظهار الشاشة الرئيسية */
function showHome(){
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("account-screen").classList.add("hidden");
  document.getElementById("initiatives-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");

  const welcome = document.getElementById("welcome-name");
  if(currentRole === "admin"){
    const admin = admins[currentCode];
    welcome.innerText = `أهلاً ${admin.name} — ${admin.role}`;
    document.getElementById("admin-search").classList.remove("hidden");
    document.getElementById("student-search").value = "";
    document.getElementById("search-results").innerHTML = "";
  } else {
    const st = students[currentCode];
    welcome.innerText = `أهلاً ${st.name}`;
    document.getElementById("admin-search").classList.add("hidden");
  }
}

/* الذهاب للشاشة الرئيسية من صفحات أخرى */
function goHome(){
  showHome();
}

/* عرض حساب (الحالي أو طالب محدد) */
function showAccount(codeToShow = null){
  // إن لم يتم تمرير كود → نعرض حساب المستخدم الحالي
  const code = codeToShow || currentCode;
  if(!code){ alert("لا يوجد حساب لعرضه"); return; }

  // هل هو طالب؟
  if(students[code]){
    const s = students[code];
    let html = `<div class="user-card">
      <h3>${s.name}</h3>
      <p><strong>الفرقة:</strong> ${s.grade}</p>
      <p><strong>الفصل:</strong> ${s.section}</p>
      <p><strong>الحالة الصحية:</strong> ${s.health}</p>
      <p><strong>التقييم:</strong> ${s.rating}</p>
      ${s.absent ? `<p><strong>أيام الغياب:</strong> ${s.absent}</p>` : ``}
      <h4>الإنجازات:</h4>
      <ul>${(s.achievements||[]).map(it=>`<li>${it}</li>`).join("")}</ul>
    </div>`;
    document.getElementById("account-content").innerHTML = html;
    document.getElementById("account-title").innerText = "حالة الحساب";
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("initiatives-screen").classList.add("hidden");
    document.getElementById("account-screen").classList.remove("hidden");
    return;
  }

  // هل هو مشرف؟
  if(admins[code]){
    const a = admins[code];
    let html = `<div class="user-card">
      <h3>${a.name}</h3>
      <p><strong>المنصب:</strong> ${a.role}</p>
      <p>صلاحيات: بحث عن الطلاب وعرض بياناتهم</p>
    </div>`;
    document.getElementById("account-content").innerHTML = html;
    document.getElementById("account-title").innerText = "حالة الحساب (المشرف)";
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("initiatives-screen").classList.add("hidden");
    document.getElementById("account-screen").classList.remove("hidden");
    return;
  }

  alert("الحساب غير موجود");
}

/* البحث المباشر للمشرف */
function searchStudent(){
  const q = document.getElementById("student-search").value.trim().toLowerCase();
  const results = document.getElementById("search-results");
  results.innerHTML = "";
  if(!q) return;
  Object.keys(students).forEach(code=>{
    const s = students[code];
    if(s.name.toLowerCase().includes(q)){
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `<strong>${s.name}</strong><br>
        الفرقة: ${s.grade} — الفصل: ${s.section}<br>
        التقييم: ${s.rating}<br>
        <div style="margin-top:8px;">
          <button class="menu-btn" style="width:auto;display:inline-block;padding:8px 12px;margin:6px 6px 0 0;" onclick="showAccount('${code}')">عرض الحساب</button>
        </div>`;
      results.appendChild(card);
    }
  });
}

/* صفحة المبادرات: عرض القائمة */
function openPage(name){
  if(name === "حالة"){
    // عند الضغط على حالة الحساب -> نعرض حساب المستخدم الحالي
    if(!currentCode){ alert("من فضلك سجّل الدخول أولاً"); return; }
    showAccount(currentCode);
    return;
  }

  if(name === "مبادرتنا" || name === "مبادراتنا" || name === "مبادرتنا" ){
    showInitiatives();
    return;
  }

  const links = {
    "وزارة":"https://ellibrary.moe.gov.eg/books/",
    "مسابقات":"https://ellibrary.moe.gov.eg/books/",
    "اراء":"https://t.me/nasr_military_students_bot",
    "بوت":"https://t.me/nasr_military_students_bot",
    "اعلانات":"https://whatsapp.com/channel/0029VbBX4wo1SWstPmiejS0F"
  };

  if(links[name]) window.open(links[name], "_blank");
  else alert("الرابط غير موجود");
}

/* عرض قائمة المبادرات (الأزرار) */
function showInitiatives(){
  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("account-screen").classList.add("hidden");
  document.getElementById("initiatives-screen").classList.remove("hidden");

  const listDiv = document.getElementById("initiatives-list");
  listDiv.innerHTML = "";
  Object.keys(initiatives).forEach(key=>{
    const btn = document.createElement("div");
    btn.className = "menu-btn";
    btn.style.cursor = "pointer";
    btn.innerText = key;
    btn.onclick = ()=> showInitiative(key);
    listDiv.appendChild(btn);
  });

  // تأكد أن منطقة المقال مخفية
  document.getElementById("initiative-article").classList.add("hidden");
}

/* عند اختيار مبادرة: عرض المقال */
function showInitiative(key){
  document.getElementById("initiatives-list").classList.add("hidden");
  document.getElementById("initiative-article").classList.remove("hidden");
  document.getElementById("initiative-title").innerText = key;
  document.getElementById("initiative-body").innerText = initiatives[key];
}

/* العودة لقائمة المبادرات */
function backToInitiatives(){
  document.getElementById("initiative-article").classList.add("hidden");
  document.getElementById("initiatives-list").classList.remove("hidden");
}

/* افتح بوت التليجرام للمشاركة */
function openTelegram(){
  window.open("https://t.me/nasr_military_students_bot", "_blank");
}

/* تسجيل خروج */
function logout(){
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("loggedInRole");
  currentCode = null; currentRole = null;
  // إعادة تحميل أو إعادة الشاشة لتظهر login
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("account-screen").classList.add("hidden");
  document.getElementById("initiatives-screen").classList.add("hidden");
  // تنظيف حقول
  document.getElementById("code").value = "";
  document.getElementById("password").value = "";
      }
