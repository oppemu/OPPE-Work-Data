let rawData = [];
let currentLevel = 1;
let selectedMain = null;
let selectedSub = null;
let selectedTopic = null;
let currentUserEmail = "";
let currentReportList = [];

// โหลดข้อมูลอีเมลที่เคยบันทึกไว้ใน LocalStorage (ถ้ามี)
window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('oppe_user_email');
  if (savedEmail) {
    document.getElementById('userEmailInput').value = savedEmail;
  }
});

/**
 * ฟังก์ชันช่วยเรียกใช้งาน API ผ่าน JSONP (แก้ปัญหา CORS เมื่อรันบน GitHub Pages)
 */
function callApi(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.set(key, params[key]);
    });

    const script = document.createElement('script');
    script.src = url.toString();
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('ไม่สามารถเชื่อมต่อกับเครื่องข่าย API ได้'));
    };
    
    document.body.appendChild(script);
  });
}

/**
 * กดปุ่มเข้าสู่ระบบ
 */
async function triggerLogin() {
  const emailInput = document.getElementById('userEmailInput').value.trim();
  currentUserEmail = emailInput || CONFIG.DEFAULT_EMAIL;

  if (emailInput) {
    localStorage.setItem('oppe_user_email', emailInput);
  }

  document.getElementById('btnText').innerText = "กำลังตรวจสอบ...";
  document.getElementById('btnSpinner').classList.remove('d-none');
  document.getElementById('loginBtn').disabled = true;

  try {
    const response = await callApi('getStructuredData', { email: currentUserEmail });
    
    if (!response || !response.allowed) {
      showAccessDenied(response ? response.userEmail : currentUserEmail);
      return;
    }

    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainSystem').style.display = 'block';

    rawData = response.treeData || [];
    switchTab('overview');
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ: " + err.message);
  } finally {
    document.getElementById('btnText').innerHTML = "เข้าสู่ระบบ &rarr;";
    document.getElementById('btnSpinner').classList.add('d-none');
    document.getElementById('loginBtn').disabled = false;
  }
}

function goToLandingPage() {
  document.getElementById('mainSystem').style.display = 'none';
  document.getElementById('landingPage').style.display = 'block';
}

function showAccessDenied(email) {
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('mainSystem').style.display = 'block';
  
  let html = `
    <div class="access-denied-box">
      <i class="material-icons text-danger" style="font-size: 64px;">lock_person</i>
      <h4 class="fw-bold text-danger mt-3 mb-2">ไม่มีสิทธิ์เข้าถึงระบบ</h4>
      <p class="text-muted mb-3">บัญชีของคุณไม่อยู่ในรายชื่อผู้มีสิทธิ์ใช้งานระบบนี้</p>
      <div class="p-2 bg-light rounded-3 mb-3 border fs-14 text-secondary">
        <strong>อีเมลปัจจุบัน:</strong> ${email || 'ไม่พบบัญชีผู้ใช้'}
      </div>
      <button class="btn btn-secondary btn-sm mb-2" onclick="goToLandingPage()">กลับไปเปลี่ยนอีเมล</button>
      <div><small class="text-muted">หากต้องการใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มรายชื่อ</small></div>
    </div>
  `;
  document.getElementById('contentArea').innerHTML = html;
}

function switchTab(tabName) {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById('searchWrapper').style.display = 'none';

  if (tabName === 'overview') {
    document.getElementById('menuOverview').classList.add('active');
    document.getElementById('headerSubtitle').innerText = "ศูนย์รวมการจัดการเอกสาร";
    renderMainPage();
  } else if (tabName === 'datainput') {
    document.getElementById('menuDataInput').classList.add('active');
    updateHeader("บันทึกข้อมูล", false);
    document.getElementById('headerSubtitle').innerText = "";
    loadDataList('getDataInputReports');
  } else if (tabName === 'orgdata') {
    document.getElementById('menuOrgData').classList.add('active');
    updateHeader("ข้อมูลหน่วยงาน", false);
    document.getElementById('headerSubtitle').innerText = "";
    loadDataList('getOrgDataReports');
  } else if (tabName === 'report') {
    document.getElementById('menuReport').classList.add('active');
    updateHeader("รายงาน", false);
    document.getElementById('headerSubtitle').innerText = "";
    loadDataList('getReportDataReports');
  }
}

async function loadDataList(actionName) {
  document.getElementById('contentArea').innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">กำลังดึงข้อมูล...</p>
    </div>
  `;

  try {
    const reports = await callApi(actionName, { email: currentUserEmail });
    currentReportList = reports || [];
    document.getElementById('searchWrapper').style.display = 'block';
    document.getElementById('searchInput').value = '';
    renderSheetView(currentReportList);
  } catch (err) {
    document.getElementById('contentArea').innerHTML = `
      <div class="alert alert-danger text-center">
        เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}
      </div>
    `;
  }
}

function renderSheetView(list) {
  if (!list || list.length === 0) {
    document.getElementById('contentArea').innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="material-icons fs-1">find_in_page</i>
        <p class="mt-2">ไม่พบรายการข้อมูลที่ค้นหา หรือคุณไม่มีสิทธิ์เข้าถึงรายการในส่วนนี้</p>
      </div>
    `;
    return;
  }

  let html = '<div class="app-horizontal-list">';
  list.forEach(item => {
    html += `
      <div class="app-card-horizontal" onclick="openLink('${item.link}')">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-box bg-report">
            <i class="material-icons text-primary">assignment</i>
          </div>
          <div class="fw-medium fs-14 text-dark">${item.title}</div>
        </div>
        <i class="material-icons text-muted fs-5">chevron_right</i>
      </div>
    `;
  });
  html += '</div>';

  document.getElementById('contentArea').innerHTML = html;
}

function filterReports() {
  let query = document.getElementById('searchInput').value.toLowerCase().trim();
  let filtered = currentReportList.filter(item => item.title.toLowerCase().includes(query));
  renderSheetView(filtered);
}

function renderMainPage() {
  currentLevel = 1;
  updateHeader("หมวดหมู่หลัก", false);
  
  if (!rawData || rawData.length === 0) {
    document.getElementById('contentArea').innerHTML = '<div class="text-center py-5 text-muted">ไม่พบข้อมูลหมวดหมู่</div>';
    return;
  }

  let html = '<div class="app-grid">';
  rawData.forEach((main, index) => {
    html += `
      <div class="app-card" onclick="selectMain(${index})">
        <div class="icon-box bg-lvl-1 mb-2">
          <i class="material-icons">grid_view</i>
        </div>
        <div class="fw-medium fs-14 text-dark">${main.title}</div>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('contentArea').innerHTML = html;
}

function selectMain(index) {
  selectedMain = rawData[index];
  if (!selectedMain.subs || selectedMain.subs.length === 0) {
    openLink(selectedMain.link);
    return;
  }
  currentLevel = 2;
  updateHeader(selectedMain.title, true);

  let html = '<div class="app-grid">';
  selectedMain.subs.forEach((sub, subIdx) => {
    html += `
      <div class="app-card" onclick="selectSub(${subIdx})">
        <div class="icon-box bg-lvl-2 mb-2">
          <i class="material-icons">folder_special</i>
        </div>
        <div class="fw-medium fs-14 text-dark">${sub.title}</div>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('contentArea').innerHTML = html;
}

function selectSub(subIdx) {
  selectedSub = selectedMain.subs[subIdx];
  if (!selectedSub.topics || selectedSub.topics.length === 0) {
    openLink(selectedSub.link);
    return;
  }
  currentLevel = 3;
  updateHeader(selectedSub.title, true);

  let html = '<div class="app-grid">';
  selectedSub.topics.forEach((topic, topicIdx) => {
    html += `
      <div class="app-card" onclick="selectTopic(${topicIdx})">
        <div class="icon-box bg-lvl-3 mb-2">
          <i class="material-icons">folder</i>
        </div>
        <div class="fw-medium fs-14 text-dark">${topic.title}</div>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('contentArea').innerHTML = html;
}

function selectTopic(topicIdx) {
  selectedTopic = selectedSub.topics[topicIdx];
  if (!selectedTopic.tasks || selectedTopic.tasks.length === 0) {
    openLink(selectedTopic.link);
    return;
  }
  currentLevel = 4;
  updateHeader(selectedTopic.title, true);

  let html = '<div class="app-grid">';
  selectedTopic.tasks.forEach(task => {
    html += `
      <div class="app-card" onclick="openLink('${task.link}')">
        <div class="icon-box bg-lvl-4 mb-2">
          <i class="material-icons">folder_open</i>
        </div>
        <div class="fw-medium fs-14 text-dark">${task.title}</div>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('contentArea').innerHTML = html;
}

function openLink(url) {
  if (url && url !== "") {
    window.open(url, '_blank');
  } else {
    alert("ไม่พบลิงก์สำหรับรายการนี้");
  }
}

function goBack() {
  if (currentLevel === 4) selectSub(selectedMain.subs.indexOf(selectedSub));
  else if (currentLevel === 3) selectMain(rawData.indexOf(selectedMain));
  else if (currentLevel === 2) renderMainPage();
}

function updateHeader(title, showBack) {
  document.getElementById('headerTitle').innerText = title;
  document.getElementById('backBtn').style.display = showBack ? 'inline-flex' : 'none';
}