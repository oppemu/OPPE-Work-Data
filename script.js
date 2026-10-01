const API_URL = CONFIG.API_URL;
let globalList = []; 
let selectedRowIndex = null;

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

async function loadData() {
    try {
        const response = await fetch(`${API_URL}?action=getData`, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow' 
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            globalList = data.list; // เก็บข้อมูลทั้งหมดไว้ทำ Instant Preview
            renderTable(data.list);
        } else {
            console.error("API Error:", data.message);
            document.getElementById('loading').innerHTML = `<span class="text-danger">เกิดข้อผิดพลาด: ${data.message}</span>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('loading').innerHTML = `<span class="text-danger">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (CORS / Network Error)</span>`;
    }
}

function renderTable(list) {
    document.getElementById('loading').style.display = 'none';
    const docList = document.getElementById('docList');
    docList.style.display = 'flex';
    docList.innerHTML = "";

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'doc-card';
        
        const colC = (item.colC && item.colC !== "undefined") ? item.colC : "-";
        const colH = (item.colH && item.colH !== "undefined") ? item.colH : "-";
        const colI = (item.colI && item.colI !== "undefined") ? item.colI : "-";

        card.innerHTML = `
            <div class="doc-info" style="flex: 1; padding-right: 20px;">
                <div style="font-size: 1.3rem; font-weight: 600; color: #00246B; margin-bottom: 8px;">
                    ${item.colA || '-'}
                </div>
                
                <div style="font-size: 1.05rem; line-height: 1.7;">
                    <div>
                        <span style="color: #00246B; font-weight: 500;">ผู้กรอกข้อมูล:</span> 
                        <span style="color: #000000; font-weight: 400;">${colC}</span>
                    </div>
                    <div>
                        <span style="color: #00246B; font-weight: 500;">รหัส-ระเบียบปฏิบัติ:</span> 
                        <span style="color: #000000; font-weight: 400;">${colH}</span>
                    </div>
                    <div>
                        <span style="color: #00246B; font-weight: 500;">เรื่องที่ดำเนินการ:</span> 
                        <span style="color: #000000; font-weight: 400;">${colI}</span>
                    </div>
                </div>
            </div>
            
            <div class="d-flex flex-column align-items-end justify-content-center" style="min-width: 150px;">
                <button class="btn btn-mahidol px-4 py-2 rounded-pill w-100" onclick="previewPdfInstant(${item.rowIndex})">
                    ดูตัวอย่าง PDF
                </button>
            </div>
        `;
        docList.appendChild(card);
    });
}

// ฟังก์ชันพรีวิวเอกสารแบบทันที (0 วินาที)
function previewPdfInstant(rowIndex) {
    selectedRowIndex = rowIndex;
    const item = globalList.find(x => x.rowIndex === rowIndex);
    if (!item) return;

    let rowsHtml = "";
    if (item.fullRowData && item.fullRowData.length > 0) {
        item.fullRowData.forEach(row => {
            rowsHtml += `
                <tr>
                    <td style="width: 230px;">${row.label} :</td>
                    <td>${row.value}</td>
                </tr>
            `;
        });
    }

    const previewContainer = document.getElementById('previewContent');
    previewContainer.innerHTML = `
        <div style="text-align: center; font-size: 18pt; margin-bottom: 25px; font-weight: normal;">
            การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา
        </div>
        <table>
            ${rowsHtml}
        </table>
    `;

    const previewModal = new bootstrap.Modal(document.getElementById('pdfPreviewModal'));
    previewModal.show();
}

// ฟังก์ชันสำหรับกดยืนยันเพื่อโหลด PDF จริง
async function downloadPdfFromPreview() {
    if (!selectedRowIndex) return;

    const btn = document.getElementById('btnConfirmDownload');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "กำลังสร้างไฟล์ PDF...";

    try {
        const response = await fetch(`${API_URL}?action=generatePDF&rowIndex=${selectedRowIndex}`, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow'
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            const a = document.createElement('a');
            a.href = data.base64;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("เซิร์ฟเวอร์แจ้งข้อผิดพลาด: " + data.message);
        }
    } catch (error) {
        console.error("Download Error:", error);
        alert("การดาวน์โหลดล้มเหลว กรุณาลองใหม่");
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}
// ---- ฟังก์ชันค้นหาเอกสาร ----
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchName');
    const searchBtn = document.getElementById('btnSearch');

    // ฟังก์ชันสำหรับกรองข้อมูล
    function filterDocuments() {
        let searchValue = searchInput.value.toLowerCase().trim();
        
        // ค้นหาการ์ดเอกสารทั้งหมดด้วยคลาส .doc-card ที่สร้างใน renderTable()
        let documentCards = document.querySelectorAll('.doc-card');

        documentCards.forEach(function(card) {
            let cardText = card.textContent || card.innerText;
            if (cardText.toLowerCase().includes(searchValue)) {
                card.style.display = "flex"; // ใช้ flex ตามสไตล์เดิมของการ์ด
            } else {
                card.style.display = "none"; 
            }
        });
    }

    // ทำงานเมื่อคลิกปุ่ม "ค้นหา"
    searchBtn.addEventListener('click', filterDocuments);

    // ทำงานเมื่อกดปุ่ม Enter ในช่องพิมพ์
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            filterDocuments();
        }
    });
});