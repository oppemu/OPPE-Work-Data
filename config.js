// ==========================================
// การตั้งค่าระบบ (Configuration)
// ==========================================
const CONFIG = {
  APP_TITLE: "OPPE Work data - กองกายภาพและสิ่งแวดล้อม",
  USE_MOCK_DATA: true, // ตั้งเป็น true เมื่อเทสใน VS Code | ตั้งเป็น false เมื่อเอาโค้ดขึ้น Google Apps Script
  MOCK_DELAY_MS: 500   // ความหน่วงเวลาจำลองการโหลดข้อมูลจากเซิร์ฟเวอร์ (มิลลิวินาที)
};

// ==========================================
// จำลองการทำงานของ google.script.run สำหรับรันบน VS Code
// ==========================================
if (typeof google === 'undefined' && CONFIG.USE_MOCK_DATA) {
  console.warn("Local Environment Detected: Mocking google.script.run is active.");
  
  window.google = {
    script: {
      run: {
        withSuccessHandler: function(callback) {
          this.successHandler = callback;
          return this;
        },
        withFailureHandler: function(callback) {
          this.failureHandler = callback;
          return this;
        },
        
        // -----------------------------------------
        // Mock ข้อมูลสำหรับแต่ละฟังก์ชันที่เรียกใช้
        // -----------------------------------------
        getStructuredData: function() {
          const mockData = {
            allowed: true, // หากต้องการทดสอบหน้า "ไม่มีสิทธิ์เข้าถึง" ให้เปลี่ยนเป็น false
            userEmail: "test.local@example.com",
            treeData: [
              {
                title: "หมวดหมู่ทดสอบ 1",
                subs: [
                  {
                    title: "ย่อย 1.1",
                    topics: [
                      {
                        title: "หัวข้อ 1.1.1",
                        tasks: [{ title: "เอกสาร A", link: "https://example.com" }]
                      }
                    ]
                  }
                ]
              },
              { title: "หมวดหมู่ทดสอบ 2 (ไม่มีข้อมูลย่อย)" }
            ]
          };
          setTimeout(() => this.successHandler(mockData), CONFIG.MOCK_DELAY_MS);
        },

        getDataInputReports: function() {
          setTimeout(() => this.successHandler([
            { title: "ฟอร์มบันทึกข้อมูล A", link: "#" },
            { title: "ฟอร์มบันทึกข้อมูล B", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },

        getOrgDataReports: function() {
          setTimeout(() => this.successHandler([
            { title: "ข้อมูลองค์กร ปี 2567", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },

        getReportDataReports: function() {
          setTimeout(() => this.successHandler([
            { title: "สรุปรายงานเดือนนี้", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        }
      }
    }
  };
}
