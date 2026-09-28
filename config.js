const CONFIG = {
  APP_TITLE: "OPPE Work data - กองกายภาพและสิ่งแวดล้อม",
  ENABLE_LOCAL_MOCK: true,
  MOCK_DELAY_MS: 400
};

// จำลอง google.script.run เมื่อทดสอบระบบบน VS Code
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
            userEmail: "officer@mahidol.ac.th",
            treeData: [
              {
                title: "1. ด้านการจัดการสิ่งแวดล้อม",
                subs: [
                  {
                    title: "1.1 มาตรฐานสำนักงานสีเขียว (Green Office)",
                    topics: [
                      {
                        title: "หมวดที่ 1 การบริหารจัดการองค์การ",
                        tasks: [
                          { title: "นโยบายสิ่งแวดล้อม", link: "https://google.com" },
                          { title: "คณะทำงานด้านสิ่งแวดล้อม", link: "https://google.com" }
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
                    title: "2.1 ข้อมูลการใช้ไฟฟ้าและน้ำประปา",
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
            { title: "แบบบันทึกการใช้ไฟฟ้าประจำเดือน", link: "#" },
            { title: "แบบบันทึกการใช้น้ำประปาประจำเดือน", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },
        getOrgDataReports: function() {
          setTimeout(() => this.successCallback([
            { title: "รายชื่อบุคลากรและโครงสร้างองค์กร", link: "#" },
            { title: "แผนผังอาคารและพื้นที่การดูแล", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        },
        getReportDataReports: function() {
          setTimeout(() => this.successCallback([
            { title: "รายงานสรุปปริมาณก๊าซเรือนกระจก (GHG Report)", link: "#" },
            { title: "รายงานสรุปผลการประหยัดพลังงานรายไตรมาส", link: "#" }
          ]), CONFIG.MOCK_DELAY_MS);
        }
      }
    }
  };
}
