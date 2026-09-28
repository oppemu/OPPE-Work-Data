function switchTab(tabName) {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById('searchWrapper').style.display = 'none';

  if (tabName === 'overview') {
    document.getElementById('menuOverview').classList.add('active');
    document.getElementById('headerSubtitle').innerText = "ศูนย์รวมการจัดการเอกสาร ";
    renderMainPage();
  } else if (tabName === 'carpar') { // เพิ่มการรองรับ carpar
    document.getElementById('menuCarPar').classList.add('active');
    updateHeader("ติดตามสถานะ", false);
    document.getElementById('headerSubtitle').innerText = "";
    document.getElementById('contentArea').innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="material-icons fs-1">assignment_late</i>
        <p class="mt-2">ส่วนติดตามสถานะอยู่ระหว่างการพัฒนา</p>
      </div>
    `;
  } else if (tabName === 'kpi') { // เพิ่มการรองรับ kpi
    document.getElementById('menuKpi').classList.add('active');
    updateHeader("ตัวชี้วัด", false);
    document.getElementById('headerSubtitle').innerText = "";
    document.getElementById('contentArea').innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="material-icons fs-1">bar_chart</i>
        <p class="mt-2">ส่วนตัวชี้วัดอยู่ระหว่างการพัฒนา</p>
      </div>
    `;
  } else if (tabName === 'datainput') {
    document.getElementById('menuDataInput').classList.add('active');
    updateHeader("บันทึกข้อมูล ", false);
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
