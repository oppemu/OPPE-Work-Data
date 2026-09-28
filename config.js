const CONFIG = {
  APP_TITLE: "OPPE Work Data - กองกายภาพและสิ่งแวดล้อม",
  ENABLE_LOCAL_MOCK: true, // ตั้งเป็น true เมื่อรันใน VS Code | บน GAS ระบบจะสลับไปใช้ Code.gs อัตโนมัติ
  MOCK_DELAY_MS: 400
};

// จำลองระบบ google.script.run เมื่อทดสอบในเครื่อง local (VS Code)
if (typeof google === 'undefined' && CONFIG.ENABLE_LOCAL_MOCK) {
  window.google = {
    script: {
      run: {
        withSuccessHandler: function(callback) {
          this.successCallback = callback;
          return this;
        },
        withFailureHandler: function(callback) {
          this.failureCallback = callback;
          return this;
        },
        getStructuredData: function() {
          const mockData = {
            allowed: true,
            userEmail: "test.user@mahidol.ac.th",
            treeData: [
              {
                title: "1. ด้านการจัดการสิ่งแวดล้อม",
                subs: [
                  {
                    title: "1.1 สำนักงานสีเขียว (Green Office)",
                    topics: [
                      {
                        title: "หมวดที่ 1 การบริหารจัดการองค์การ",
                        tasks: [
                          { title: "นโยบายสิ่งแวดล้อม", link: "https://google.com" },
                          { title: "คู่มือการดำเนินงาน", link: "https://google.com" }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                title: "2. ด้านพลังงานและทรัพยากร",
                subs: [
                  {
                    title: "2.1 การใช้ไฟฟ้าและน้ำประปา",
                    topics: []
                  }
                ]
              }
            ]
          };
          setTimeout(() => this.successCallback(mockData), CONFIG.MOCK_DELAY_MS);
        },
        getDataInputReports: function() {
          setTimeout(() => this.successCallback([
            { title: "แบบบันทึกข้อมูลการใช้พลังงาน ISO 14001", link: "#" },
            { title: "แบบบันทึกการจัดการของเสียและขยะ", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },
        getOrgDataReports: function() {
          setTimeout(() => this.successCallback([
            { title: "โครงสร้างบุคลากรกองกายภาพและสิ่งแวดล้อม", link: "#" },
            { title: "ผังผืนดินและพื้นที่รับผิดชอบ", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },
        getReportDataReports: function() {
          setTimeout(() => this.successCallback([
            { title: "รายงานสรุปการปลดปล่อยก๊าซเรือนกระจกประจำปี", link: "#" },
            { title: "รายงานผลการดำเนินงาน Green University", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        }
      }
    }
  };
}
