/**
 * ==========================================================================
 * DSS BOOKSUGGEST - CORE JAVASCRIPT SYSTEM
 * 20 Majors, 2,000 Books, SAW Decision Support Algorithm, Real-Time Sync
 * VNUF - Vietnam National University of Forestry Custom Edition
 * ==========================================================================
 */

// Global Variables
let booksDatabase = [];
let userBookshelf = [];       // Cart: sách sinh viên chọn nhưng chưa xác nhận mượn
let currentDssResults = [];
let activeBorrowRecords = []; // Phiếu mượn đang hoạt động (chưa trả)
let checkoutIncrements = {};  // {bookId: số_lượt_tăng_thêm} – lịch sử mượn vĩnh viễn

// Pagination config for Book Repository
let repoCurrentPage = 1;
const repoPageSize = 15;
let repoFilteredBooks = [];

// Definition of 20 Majors based on image
const MAJORS = [
    { code: "7620211", name: "Quản lý tài nguyên rừng (Kiểm lâm)", faculty: "F", dept: "Khoa Quản lý tài nguyên rừng và môi trường", keywords: ["rừng", "kiểm lâm", "đa dạng sinh học", "bảo tồn", "động vật hoang dã", "luật lâm nghiệp"] },
    { code: "7850101", name: "Quản lý tài nguyên và môi trường", faculty: "F", dept: "Khoa Quản lý tài nguyên rừng và môi trường", keywords: ["môi trường", "tài nguyên", "đất đai", "biến đổi khí hậu", "giám sát", "ô nhiễm"] },
    { code: "7850104", name: "Du lịch sinh thái", faculty: "F", dept: "Khoa Quản lý tài nguyên rừng và môi trường", keywords: ["du lịch", "sinh thái", "bảo tồn", "hướng dẫn viên", "vườn quốc gia", "nhà hàng khách sạn"] },
    { code: "7620205", name: "Lâm sinh", faculty: "S", dept: "Khoa Lâm học", keywords: ["lâm sinh", "trồng rừng", "cây lâm nghiệp", "giống cây", "sinh lý thực vật", "đất lâm nghiệp"] },
    { code: "7340301", name: "Kế toán", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["kế toán", "kiểm toán", "thuế", "tài chính doanh nghiệp", "báo cáo tài chính", "sổ sách"] },
    { code: "7340101", name: "Quản trị kinh doanh", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["quản trị", "kinh doanh", "marketing", "khởi nghiệp", "nhân sự", "chiến lược"] },
    { code: "7310101", name: "Kinh tế/Kinh tế nông nghiệp", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["kinh tế", "nông nghiệp", "nông thôn", "phát triển", "chuỗi giá trị", "thị trường"] },
    { code: "7810103", name: "Quản trị dịch vụ du lịch và lữ hành", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["du lịch", "lữ hành", "tour", "quản trị khách sạn", "dịch vụ", "sự kiện"] },
    { code: "7340201", name: "Tài chính ngân hàng", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["tài chính", "ngân hàng", "tín dụng", "đầu tư", "tiền tệ", "chứng khoán"] },
    { code: "7510605", name: "Logistics và Quản lý chuỗi cung ứng", faculty: "E", dept: "Khoa Kinh tế và Quản trị kinh doanh", keywords: ["logistics", "chuỗi cung ứng", "kho bãi", "vận chuyển", "xuất nhập khẩu", "mua hàng"] },
    { code: "7510205", name: "Công nghệ kỹ thuật cơ điện tử", faculty: "M", dept: "Khoa Cơ điện và công trình", keywords: ["cơ điện tử", "robot", "tự động hóa", "cảm biến", "mạch điện", "vi điều khiển"] },
    { code: "7510205_2", name: "Công nghệ kỹ thuật ô tô", faculty: "M", dept: "Khoa Cơ điện và công trình", keywords: ["ô tô", "động cơ", "hệ thống phanh", "điện ô tô", "bảo dưỡng ô tô", "truyền động"] },
    { code: "7520103", name: "Kỹ thuật cơ khí", faculty: "M", dept: "Khoa Cơ điện và công trình", keywords: ["cơ khí", "chế tạo máy", "bản vẽ", "gia công", "vật liệu cơ khí", "thủy lực"] },
    { code: "7580201", name: "Kỹ thuật xây dựng", faculty: "M", dept: "Khoa Cơ điện và công trình", keywords: ["xây dựng", "bê tông", "kết cấu", "công trình", "bản vẽ autocad", "dự toán"] },
    { code: "7480104", name: "Hệ thống thông tin (CNTT)", faculty: "I", dept: "Khoa Hệ thống thông tin (CNTT)", keywords: ["hệ thống thông tin", "cơ sở dữ liệu", "lập trình", "web", "phần mềm", "python", "java", "an toàn mạng"] },
    { code: "7850103", name: "Quản lý đất đai", faculty: "L", dept: "Viện Quản lý đất đai và Phát triển nông thôn", keywords: ["đất đai", "quy hoạch", "bản đồ", "định giá đất", "địa chính", "luật đất đai"] },
    { code: "7620110", name: "Khoa học cây trồng", faculty: "L", dept: "Viện Quản lý đất đai và Phát triển nông thôn", keywords: ["cây trồng", "nông nghiệp", "bảo vệ thực vật", "phân bón", "sâu bệnh", "canh tác"] },
    { code: "7420201", name: "Công nghệ sinh học", faculty: "B", dept: "Viện Công nghệ sinh học", keywords: ["sinh học", "gen", "tế bào", "vi sinh vật", "nuôi cấy mô", "enzyme", "y dược"] },
    { code: "7640101", name: "Thú y", faculty: "V", dept: "Viện Công nghệ sinh học", keywords: ["thú y", "bệnh súc vật", "dược lý thú y", "chẩn đoán bệnh", "tiêm phòng", "phẫu thuật ngoại khoa"] },
    { code: "7580108", name: "Thiết kế nội thất", faculty: "W", dept: "Viện Công nghiệp gỗ và Nội thất", keywords: ["thiết kế", "nội thất", "không gian", "màu sắc", "vật liệu gỗ", "bản vẽ 3D", "phong thủy"] }
];

// Department mappings for same-faculty bonus calculation
const FACULTIES = {
    "F": "Khoa Quản lý Tài nguyên Rừng và Môi trường",
    "S": "Khoa Lâm học",
    "E": "Khoa Kinh tế và Quản trị Kinh doanh",
    "M": "Khoa Cơ điện và Công trình",
    "I": "Khoa Công nghệ thông tin",
    "L": "Viện Quản lý đất đai và Phát triển nông thôn",
    "B": "Viện Công nghệ sinh học",
    "W": "Viện Công nghiệp gỗ và Nội thất"
};

// Authors List for Random Generator
const ACADEMIC_AUTHORS = [
    "GS.TS. Nguyễn Văn Hùng", "PGS.TS. Trần Thị Mai", "TS. Lê Hoàng Nam", "ThS. Phạm Quốc Khánh",
    "PGS.TS. Vũ Hải Đăng", "TS. Đỗ Thị Phương", "ThS. Bùi Văn Cường", "GS.TS. Lâm Minh Triết",
    "PGS.TS. Nguyễn Ngọc Lung", "TS. Phạm Xuân Hoàn", "TS. Nguyễn Minh Đức", "ThS. Hoàng Trọng Nghĩa",
    "GS.TS. Vương Văn Quỳnh", "PGS.TS. Hà Quang Khải", "TS. Đinh Thị Lệ", "ThS. Trần Quang Bảo",
    "TS. Nguyễn Hữu Dũng", "ThS. Phạm Thế Dũng", "PGS.TS. Lê Xuân Phương", "TS. Nguyễn Quốc Bình"
];

// Goal Tag Descriptions for display
const GOAL_LABELS = {
    "research": "Nghiên cứu khoa học",
    "practice": "Thực hành & Thực chiến",
    "thesis": "Làm đồ án & Luận văn",
    "exam": "Luyện thi & Đọc thêm",
    "general": "Kiến thức chung & Giải trí"
};

/**
 * ==========================================================================
 * INITIALIZATION & PROCEDURAL GENERATOR (2,000 BOOKS)
 * ==========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    if (!window.DssAuth || !DssAuth.isLoggedIn()) {
        window.location.replace("login.html");
        return;
    }
    initApp();
    setupEventListeners();
    setupAuthUI();
});

/** Per-student localStorage keys (bookshelf & borrows isolated per account). */
function getScopedStorageKey(baseKey) {
    const sid = window.DssAuth?.getSession()?.studentId;
    return sid ? `${baseKey}_${sid}` : baseKey;
}

function setupAuthUI() {
    const user = window.DssAuth?.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById("header-user-name");
    const idEl = document.getElementById("header-user-id");
    if (nameEl) nameEl.textContent = user.fullName;
    if (idEl) idEl.textContent = user.studentId;

    const welcomeTitle = document.getElementById("welcome-banner-title");
    const welcomeText = document.getElementById("welcome-banner-text");
    if (welcomeTitle) {
        welcomeTitle.textContent = `Xin chào, ${user.fullName}!`;
    }
    if (welcomeText) {
        welcomeText.innerHTML = `MSSV <strong>${user.studentId}</strong> · Lớp <strong>${user.className}</strong> — Hệ thống đã sẵn sàng gợi ý sách và tạo phiếu mượn với thông tin tài khoản của bạn.`;
    }

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Bạn có chắc muốn đăng xuất?")) {
                DssAuth.logoutUser();
                window.location.replace("login.html");
            }
        });
    }
}

function initApp() {
    // 1. Load persisted borrow data FIRST (before generating books)
    loadBorrowData();

    // 2. Generate 2,000 Books Database and apply saved checkout increments
    generate2000Books();
    applyCheckoutIncrements();

    // 3. Populate Majors Dropdowns in HTML
    populateMajorsDropdowns();

    // 4. Sync Current Date
    const dateSpan = document.getElementById("current-date");
    if (dateSpan) {
        const today = new Date();
        dateSpan.innerText = today.toLocaleDateString("vi-VN");
    }

    // 5. Load Cart (selected but not yet confirmed)
    loadBookshelf();

    // 6. Initialize the Repository filtered set and render first page
    repoFilteredBooks = [...booksDatabase];
    renderRepoTable();

    // 7. Run Initial DSS Suggestion
    runDSSRecommendation();

    // 8. Render borrow records tab
    renderBorrowsTab();

    // 9. Update active borrows pill counter
    updateActiveBorrowsBadge();
}

/**
 * Deterministic pseudo-random helpers — same book ID always yields the same metadata
 * on every page load (checkouts, author, rating, title parts, etc.).
 */
function seededUnit(seed) {
    let h = (seed | 0) * 2654435761;
    h = ((h ^ (h >>> 16)) * 2246822519) | 0;
    h = ((h ^ (h >>> 13)) * 3266489917) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function seededInt(seed, min, max) {
    return min + Math.floor(seededUnit(seed) * (max - min + 1));
}

function seededPick(seed, array) {
    return array[seededInt(seed, 0, array.length - 1)];
}

/**
 * Generate highly realistic, specialized book titles and metadata for 20 majors.
 * Creates exactly 2,000 books total (100 per major).
 */
function generate2000Books() {
    booksDatabase = [];
    let bookIdCounter = 10001;

    // Academic titles prefixes/subjects templates for procedural generation
    const titleTemplates = {
        "7620211": { // QL tài nguyên rừng
            prefix: ["Giáo trình", "Kỹ thuật", "Bảo tồn", "Quản lý", "Nhập môn", "Cơ sở", "Báo cáo nghiên cứu", "Cẩm nang"],
            subject: ["Tài nguyên rừng Việt Nam", "Đa dạng sinh học rừng", "Động vật hoang dã quý hiếm", "Kiểm lâm và Bảo vệ rừng", "Sinh thái rừng nhiệt đới", "Đo đạc và Bản đồ lâm nghiệp", "Hệ sinh thái rừng đặc dụng", "Luật lâm nghiệp quốc tế"],
            suffix: ["nâng cao", "cơ bản", "thực chiến", "và ứng dụng", "thế kỷ 21", "trong phát triển bền vững", "tập 1", "tập 2"]
        },
        "7850101": { // QL tài nguyên và môi trường
            prefix: ["Giáo trình", "Đánh giá", "Quản lý", "Xử lý", "Cơ sở", "Phân tích", "Chuyên đề", "Kỹ năng"],
            subject: ["Môi trường và Tài nguyên nước", "Biến đổi khí hậu toàn cầu", "Xử lý chất thải rắn", "Đánh giá tác động môi trường (ĐTM)", "Công nghệ môi trường xanh", "Tài nguyên thiên nhiên Việt Nam", "Quy hoạch môi trường đô thị", "Quản lý lưu vực sông"],
            suffix: ["và thực hành", "căn bản", "trong kỷ nguyên số", "với phát triển bền vững", "hiện đại", "ứng dụng mới nhất"]
        },
        "7850104": { // Du lịch sinh thái
            prefix: ["Cẩm nang", "Giáo trình", "Nhập môn", "Phát triển", "Kế hoạch", "Nghệ thuật", "Thiết kế"],
            subject: ["Du lịch sinh thái bền vững", "Hướng dẫn du lịch tại Vườn quốc gia", "Phát triển sản phẩm du lịch xanh", "Quản lý khu bảo tồn thiên nhiên", "Tác động của du lịch lên môi trường", "Du lịch cộng đồng nông thôn", "Khách sạn sinh thái thân thiện", "Tuyến điểm du lịch sinh thái Việt Nam"],
            suffix: ["cho sinh viên", "thực tiễn", "hiệu quả", "và xu hướng mới", "tích hợp lý thuyết", "đương đại"]
        },
        "7620205": { // Lâm sinh
            prefix: ["Giáo trình", "Kỹ thuật", "Nghiên cứu", "Phương pháp", "Thực hành", "Hướng dẫn"],
            subject: ["Gieo ươm cây rừng nhiệt đới", "Trồng rừng và phục hồi rừng", "Sinh lý sinh thái cây lâm nghiệp", "Kỹ thuật lâm sinh ứng dụng", "Giống cây lâm nghiệp chất lượng cao", "Lâm học đô thị", "Cải tạo rừng nghèo kiệt", "Đất lâm nghiệp và dinh dưỡng"],
            suffix: ["chuyên sâu", "và chuyển giao", "thực nghiệm", "tiên tiến", "trong lâm nghiệp mới", "tóm tắt"]
        },
        "7340301": { // Kế toán
            prefix: ["Giáo trình", "Lý thuyết", "Hướng dẫn", "Kế toán", "Kiểm toán", "Hệ thống"],
            subject: ["Kế toán tài chính doanh nghiệp", "Kế toán quản trị hiện đại", "Kiểm toán căn bản", "Chuẩn mực kế toán quốc tế (IFRS)", "Thuế và Khai báo thuế doanh nghiệp", "Phân tích báo cáo tài chính", "Kế toán chi phí sản xuất", "Phần mềm kế toán MISA"],
            suffix: ["và bài tập", "mới nhất", "ứng dụng thực tế", "cho nhà quản lý", "chuyên nghiệp", "thực hành"]
        },
        "7340101": { // Quản trị kinh doanh
            prefix: ["Giáo trình", "Chiến lược", "Nghệ thuật", "Nhập môn", "Quản trị", "Khởi nghiệp"],
            subject: ["Quản trị học đại cương", "Quản trị chiến lược doanh nghiệp", "Marketing hỗn hợp", "Quản trị nhân lực hiện đại", "Hành vi tổ chức", "Kinh doanh quốc tế", "Khởi nghiệp đổi mới sáng tạo", "Kế hoạch kinh doanh thực chiến"],
            suffix: ["thời đại 4.0", "cho mọi người", "kinh điển", "và case study", "thành công", "ứng dụng nhanh"]
        },
        "7310101": { // Kinh tế/Kinh tế nông nghiệp
            prefix: ["Giáo trình", "Phân tích", "Chuyên khảo", "Nhập môn", "Đánh giá", "Kinh tế"],
            subject: ["Kinh tế học vĩ mô", "Kinh tế học vi mô", "Phát triển nông nghiệp nông thôn", "Kinh tế nông nghiệp ứng dụng", "Chuỗi giá trị nông sản", "Thị trường nông sản Việt Nam", "Chính sách phát triển nông thôn", "Tín dụng nông nghiệp"],
            suffix: ["phương pháp luận", "và hội nhập", "Việt Nam", "toàn cầu", "trong giai đoạn mới", "cơ bản"]
        },
        "7810103": { // QL dịch vụ du lịch lữ hành
            prefix: ["Giáo trình", "Quản trị", "Nghiệp vụ", "Kế hoạch", "Nhập môn", "Cẩm nang"],
            subject: ["Thiết kế và Điều hành tour", "Quản trị đại lý lữ hành", "Dịch vụ khách hàng du lịch", "Tổ chức sự kiện văn hóa du lịch", "Marketing du lịch số", "Tâm lý khách du lịch", "Địa lý du lịch Việt Nam", "Nghiệp vụ hướng dẫn viên"],
            suffix: ["thực tế", "chuyên nghiệp", "và thực hành", "toàn tập", "tiêu chuẩn VTOS", "mới"]
        },
        "7340201": { // Tài chính ngân hàng
            prefix: ["Giáo trình", "Nghiệp vụ", "Quản lý", "Nhập môn", "Cơ sở", "Tài chính"],
            subject: ["Tài chính tiền tệ", "Nghiệp vụ Ngân hàng thương mại", "Thị trường chứng khoán cơ bản", "Quản trị rủi ro tài chính", "Thanh toán quốc tế", "Tín dụng và Phân tích tín dụng", "Đầu tư tài chính", "Tài chính hành vi"],
            suffix: ["hiện đại", "cho sinh viên", "và ứng dụng", "chuyên sâu", "thực hành kế toán", "kỷ nguyên số"]
        },
        "7510605": { // Logistics và chuỗi cung ứng
            prefix: ["Giáo trình", "Quản trị", "Nhập môn", "Kỹ thuật", "Cơ sở", "Tối ưu hóa"],
            subject: ["Logistics và Chuỗi cung ứng toàn cầu", "Quản trị kho bãi và Tồn kho", "Vận tải và Giao nhận hàng hóa", "Mua hàng và Quản lý nhà cung cấp", "Hải quan và Xuất nhập khẩu", "Chuỗi cung ứng lạnh nông sản", "Công nghệ thông tin trong Logistics", "Phân phối vật lý"],
            suffix: ["và thực tế", "chuẩn quốc tế", "tối ưu", "trong thương mại điện tử", "hiệu quả", "căn bản"]
        },
        "7510205": { // Cơ điện tử
            prefix: ["Giáo trình", "Kỹ thuật", "Thiết kế", "Lập trình", "Nhập môn", "Ứng dụng"],
            subject: ["Hệ thống cơ điện tử tích hợp", "Thiết kế và Lập trình Robot", "Hệ thống điều khiển tự động hóa", "Cảm biến và Kỹ thuật đo lường", "Lập trình vi điều khiển Arduino/PLC", "Vi điều khiển và Hệ thống nhúng", "Kỹ thuật số và Mạch logic", "Khí nén và Thủy lực điều khiển"],
            suffix: ["và thực hành", "chuyên sâu", "trong công nghiệp 4.0", "cho kỹ sư", "cơ bản đến nâng cao", "đồ họa"]
        },
        "7510205_2": { // Ô tô
            prefix: ["Giáo trình", "Kỹ thuật", "Chẩn đoán", "Bảo dưỡng", "Nhập môn", "Cơ cấu"],
            subject: ["Động cơ đốt trong hiện đại", "Hệ thống điện và điện tử ô tô", "Hệ thống phanh và treo ô tô", "Chẩn đoán lỗi và sửa chữa ô tô", "Công nghệ ô tô hybrid và điện", "Cấu tạo gầm ô tô", "Hệ thống truyền lực tự động", "Bảo dưỡng kỹ thuật ô tô"],
            suffix: ["thực hành", "hình ảnh trực quan", "toàn tập", "tiên tiến", "chuẩn hãng", "cho sinh viên kỹ thuật"]
        },
        "7520103": { // Kỹ thuật cơ khí
            prefix: ["Giáo trình", "Vẽ", "Gia công", "Nguyên lý", "Sổ tay", "Tính toán"],
            subject: ["Vẽ kỹ thuật cơ khí cơ bản", "Chế tạo máy và Dung sai", "Gia công cơ khí trên máy CNC", "Nguyên lý máy và Chi tiết máy", "Vật liệu học cơ khí", "Sức bền vật liệu ứng dụng", "Công nghệ hàn và Tạo hình kim loại", "Truyền động cơ khí"],
            suffix: ["và thiết kế", "chuyên nghiệp", "tiêu chuẩn quốc gia", "tóm tắt", "cho thợ và kỹ sư", "bằng AutoCAD"]
        },
        "7580201": { // Xây dựng
            prefix: ["Giáo trình", "Thiết kế", "Tính toán", "Nhập môn", "Cơ sở", "Quản lý"],
            subject: ["Kết cấu bê tông cốt thép", "Kỹ thuật thi công công trình xây dựng", "Cơ học đất và Nền móng", "Vật liệu xây dựng hiện đại", "Dự toán và Quản lý chi phí công trình", "Thiết kế nhà dân dụng bằng AutoCAD", "An toàn lao động trong xây dựng", "Trắc địa công trình"],
            suffix: ["và ví dụ tính toán", "tiêu chuẩn mới", "thực tế công trường", "dễ hiểu", "cho kỹ sư xây dựng", "chuyên sâu"]
        },
        "7480104": { // CNTT
            prefix: ["Giáo trình", "Lập trình", "Cơ sở", "Phân tích", "Nhập môn", "An toàn"],
            subject: ["Cơ sở dữ liệu nâng cao", "Lập trình Web với NodeJS và React", "Trí tuệ nhân tạo và Machine Learning", "Lập trình Python từ cơ bản đến nâng cao", "Cấu trúc dữ liệu và Giải thuật", "Hệ quản trị cơ sở dữ liệu SQL", "Phát triển phần mềm hướng đối tượng", "An toàn thông tin và Bảo mật mạng"],
            suffix: ["thực hành thực chiến", "cho người bắt đầu", "thế hệ mới", "trong chuyển đổi số", "và ứng dụng thực tế", "chuẩn CNTT"]
        },
        "7850103": { // Quản lý đất đai
            prefix: ["Giáo trình", "Bản đồ", "Đăng ký", "Quy hoạch", "Địa chính", "Luật"],
            subject: ["Quy hoạch sử dụng đất đai", "Hệ thông tin địa lý GIS ứng dụng", "Đo đạc và Thành lập bản đồ địa chính", "Định giá đất và Bất động sản", "Luật đất đai và Chính sách đất đai", "Đăng ký đất đai và Cấp sổ đỏ", "Quản lý nhà nước về đất đai", "Hồ sơ địa chính số"],
            suffix: ["và hướng dẫn thực tế", "Việt Nam hiện hành", "thực hành GIS", "cho sinh viên lâm nghiệp", "cơ bản", "chuyên đề"]
        },
        "7620110": { // Cây trồng
            prefix: ["Giáo trình", "Kỹ thuật", "Khoa học", "Bảo vệ", "Cẩm nang", "Phương pháp"],
            subject: ["Canh tác cây trồng nông nghiệp", "Bảo vệ thực vật và Phòng trừ sâu bệnh", "Phân bón và Dinh dưỡng cây trồng", "Sinh lý và Sinh hóa thực vật học", "Chọn tạo giống cây trồng năng suất cao", "Nông nghiệp công nghệ cao trong nhà màng", "Cây ăn quả nhiệt đới", "Kỹ thuật trồng rau an toàn"],
            suffix: ["ứng dụng hiệu quả", "sản xuất sạch", "thực hành đồng ruộng", "khoa học", "cho nông dân mới", "nâng cao"]
        },
        "7420201": { // Công nghệ sinh học
            prefix: ["Giáo trình", "Ứng dụng", "Nhập môn", "Kỹ thuật", "Cơ sở", "Nghiên cứu"],
            subject: ["Công nghệ di truyền và Kỹ thuật gen", "Công nghệ nuôi cấy mô tế bào thực vật", "Ứng dụng vi sinh vật trong nông nghiệp", "Công nghệ enzyme và Protein", "Thiết bị và Công nghệ lên men", "Công nghệ sinh học y dược căn bản", "Sinh học phân tử hiện đại", "Xử lý ô nhiễm bằng công nghệ sinh học"],
            suffix: ["chuyên sâu phòng thí nghiệm", "và ứng dụng", "thực hành", "tiến bộ mới", "toàn tập", "cho nhà sinh học"]
        },
        "7640101": { // Thú y
            prefix: ["Giáo trình", "Chẩn đoán", "Dược lý", "Kỹ thuật", "Bệnh học", "Nhập môn"],
            subject: ["Bệnh truyền nhiễm trên gia súc gia cầm", "Dược lý thú y và Sử dụng thuốc", "Chẩn đoán lâm sàng bệnh thú y", "Phẫu thuật ngoại khoa thú y", "Dinh dưỡng và Thức ăn chăn nuôi", "Ký sinh trùng thú y độc học", "Sức khỏe chó mèo và thú cưng", "Vệ sinh thú y và Phòng dịch"],
            suffix: ["và thực hành lâm sàng", "minh họa thực tế", "cho bác sĩ thú y", "chuyên khoa sâu", "cơ bản", "mới nhất"]
        },
        "7580108": { // Thiết kế nội thất
            prefix: ["Giáo trình", "Nguyên lý", "Nghệ thuật", "Thiết kế", "Nhập môn", "Phác thảo"],
            subject: ["Thiết kế không gian nội thất nhà ở", "Phối màu và Ánh sáng trong nội thất", "Vật liệu trang trí nội thất hiện đại", "Kỹ thuật bản vẽ 3D với 3ds Max/Sketchup", "Phong thủy trong kiến trúc nội thất", "Thiết kế nội thất văn phòng và thương mại", "Lịch sử kiến trúc và mỹ thuật nội thất", "Bản vẽ kỹ thuật thi công đồ gỗ"],
            suffix: ["sáng tạo vượt trội", "và thực hành thiết kế", "cho kiến trúc sư", "độc đáo", "đương đại", "căn bản"]
        }
    };

    // Helper arrays for tags distribution
    const goalPool = ["research", "practice", "thesis", "exam", "general"];

    // Loop through each of the 20 majors
    MAJORS.forEach(major => {
        const templates = titleTemplates[major.code];
        
        // Generate exactly 100 books for this major to guarantee 2,000 total
        for (let i = 1; i <= 100; i++) {
            const id = bookIdCounter;

            // Template parts fixed per book ID (stable across reloads)
            const pref = seededPick(id * 3 + 1, templates.prefix);
            const subj = seededPick(id * 3 + 2, templates.subject);
            const suff = seededPick(id * 3 + 3, templates.suffix);
            
            // Construct a distinct, non-repetitive book title by adding index to avoid duplicates
            let bookTitle = `${pref} ${subj} ${suff}`;
            if (i > 80) {
                // Ensure variation
                bookTitle = `${pref} ${subj} (Xuất bản lần thứ ${Math.floor(i/30) + 1})`;
            } else if (i % 5 === 0) {
                bookTitle = `Giáo trình chuyên ngành: ${subj}`;
            }

            const author = seededPick(id * 7 + 11, ACADEMIC_AUTHORS);
            const year = seededInt(id * 13 + 17, 2016, 2026);
            
            // Base borrow count: fixed per book ID; borrow actions add via checkoutIncrements
            let checkouts = seededInt(id * 19 + 23, 10, 499);
            
            const rating = parseFloat((3.5 + seededUnit(id * 29 + 31) * 1.5).toFixed(1));

            // Distribute Goals tags logically (some research, some practical, some thesis, etc.)
            let goalTag = "";
            if (i <= 20) goalTag = "research"; // 20% Research
            else if (i <= 50) goalTag = "practice"; // 30% Practical
            else if (i <= 70) goalTag = "thesis"; // 20% Thesis/Project
            else if (i <= 90) goalTag = "exam"; // 20% Exam prep
            else goalTag = "general"; // 10% General knowledge

            booksDatabase.push({
                id: bookIdCounter++,
                title: bookTitle,
                author: author,
                majorCode: major.code,
                majorName: major.name,
                faculty: major.faculty,
                year: year,
                checkouts: checkouts,
                rating: rating,
                goal: goalTag
            });
        }
    });

    console.log("Procedural Generator finished. Created exactly " + booksDatabase.length + " books!");
}

/**
 * Populates dropdowns for 20 majors in DSS inputs and Repository filters
 */
function populateMajorsDropdowns() {
    const dssSelect = document.getElementById("select-major");
    const repoSelect = document.getElementById("repo-filter-major");

    if (!dssSelect || !repoSelect) return;

    dssSelect.innerHTML = "";
    repoSelect.innerHTML = '<option value="all">Tất cả 20 ngành học</option>';

    MAJORS.forEach(major => {
        // Form option formatting: Code - Name
        const optionText = `${major.code} - ${major.name}`;
        
        // Add to DSS major selector
        const optionDss = document.createElement("option");
        optionDss.value = major.code;
        optionDss.text = optionText;
        dssSelect.appendChild(optionDss);

        // Add to Repo filter selector
        const optionRepo = document.createElement("option");
        optionRepo.value = major.code;
        optionRepo.text = optionText;
        repoSelect.appendChild(optionRepo);
    });

    // Default select 15th major (Hệ thống thông tin - CNTT) for a cool default demo!
    dssSelect.value = "7480104";
}

/**
 * ==========================================================================
 * DSS ALGORITHM CORE - SAW METHOD (SIMPLE ADDITIVE WEIGHTING)
 * ==========================================================================
 */
function runDSSRecommendation() {
    // 1. Get input parameters
    const selectedMajorCode = document.getElementById("select-major").value;
    const selectedGoal = document.querySelector("#interest-pills .pill.active").dataset.value;
    const keyword = document.getElementById("input-dss-keyword").value.trim().toLowerCase();

    // 2. Fetch weights from sliders
    const wMajor = parseFloat(document.getElementById("slider-w-major").value) / 100;
    const wInterest = parseFloat(document.getElementById("slider-w-interest").value) / 100;
    const wPopularity = parseFloat(document.getElementById("slider-w-popularity").value) / 100;
    const wRating = parseFloat(document.getElementById("slider-w-rating").value) / 100;

    // 3. Find max checkouts (for normalization) in the database
    // We normalize checkouts relative to the maximum checkouts in the selected major's group
    // to give fairer normalization scores.
    const activeMajorBooks = booksDatabase.filter(b => b.majorCode === selectedMajorCode);
    const maxCheckoutsInMajor = Math.max(...activeMajorBooks.map(b => b.checkouts), 500);

    // Get selected major faculty/department for Department Bonus
    const selectedMajorObj = MAJORS.find(m => m.code === selectedMajorCode);
    const selectedFaculty = selectedMajorObj ? selectedMajorObj.faculty : "";

    // 4. Calculate SAW scores for ALL 2,000 books
    const calculatedBooks = booksDatabase.map(book => {
        // Criterion 1: Major Match (R1)
        // Exact match = 1.0, Same Faculty (but different major) = 0.4, Different Faculty = 0.0
        let r1 = 0.0;
        if (book.majorCode === selectedMajorCode) {
            r1 = 1.0;
        } else if (book.faculty === selectedFaculty) {
            r1 = 0.4;
        }

        // Criterion 2: Interest/Goal Match (R2)
        // Matching target goal = 1.0, else = 0.1
        let r2 = (book.goal === selectedGoal) ? 1.0 : 0.1;

        // If there's a keyword search, let's boost r2 if it matches title/author!
        if (keyword.length > 0) {
            const matchesKeyword = book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
            if (matchesKeyword) {
                r2 = Math.min(1.0, r2 + 0.3); // add 0.3 bonus score, capped at 1.0
            }
        }

        // Criterion 3: Popularity/Checkouts (R3)
        // Normalized against the maximum checkouts
        let r3 = book.checkouts / maxCheckoutsInMajor;
        if (r3 > 1.0) r3 = 1.0; // clamp if it exceeds for other faculty books

        // Criterion 4: Star Rating (R4)
        // Rating out of 5 stars
        let r4 = book.rating / 5.0;

        // SAW Formula: Sum (w_j * r_ij)
        const totalScore = (wMajor * r1) + (wInterest * r2) + (wPopularity * r3) + (wRating * r4);

        return {
            ...book,
            r1: r1,
            r2: r2,
            r3: r3,
            r4: r4,
            dssScore: totalScore
        };
    });

    // 5. Sort books in descending order of DSS Score
    // Secondary sort by checkouts, then by rating for stable ranking
    calculatedBooks.sort((a, b) => {
        if (Math.abs(b.dssScore - a.dssScore) > 0.0001) {
            return b.dssScore - a.dssScore;
        }
        if (b.checkouts !== a.checkouts) {
            return b.checkouts - a.checkouts;
        }
        return b.rating - a.rating;
    });

    currentDssResults = calculatedBooks;

    // 6. Render results in UI
    renderDSSResults();
    
    // 7. Render Mathematical Explainer table (Top 5)
    renderMathExplainerTable(selectedMajorCode, selectedGoal);
}

/**
 * Render DSS Recommended Book Cards
 */
function renderDSSResults() {
    const container = document.getElementById("recommendations-container");
    if (!container) return;

    container.innerHTML = "";

    // Take top 10 best recommendations
    const topRecommendations = currentDssResults.slice(0, 10);

    if (topRecommendations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <p>Không tìm thấy cuốn sách nào phù hợp. Vui lòng điều chỉnh lại bộ lọc hoặc trọng số.</p>
            </div>
        `;
        return;
    }

    topRecommendations.forEach((book, index) => {
        // Check 3 states: (1) in cart, (2) actively borrowed, (3) available
        const isInCart = userBookshelf.some(b => b.id === book.id);
        const isActiveBorrowed = isBookActiveBorrowed(book.id);
        const matchPercentage = (book.dssScore * 100).toFixed(1);
        
        // Generate a custom reason description
        let reason = "";
        if (book.r1 === 1.0 && book.r2 === 1.0) {
            reason = `Sách <strong>đặc trưng ngành</strong> của bạn và khớp 100% mục tiêu <strong>${GOAL_LABELS[book.goal]}</strong>.`;
        } else if (book.r1 === 1.0) {
            reason = `Sách thuộc <strong>đúng ngành học chính khóa</strong> của bạn với lượt đánh giá tốt (${book.rating}/5.0).`;
        } else if (book.r2 === 1.0) {
            reason = `Sách cùng Khoa, khớp mục tiêu <strong>${GOAL_LABELS[book.goal]}</strong> của bạn và được mượn nhiều.`;
        } else {
            reason = `Sách có <strong>độ phổ biến vượt trội</strong> và đánh giá rất cao từ sinh viên khóa trước.`;
        }

        // Determine borrow button state
        let borrowBtnHtml = '';
        if (isActiveBorrowed) {
            borrowBtnHtml = `
                <button class="btn-borrow borrowed" disabled style="background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.5); color:#ef4444; cursor:not-allowed;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>Đang được mượn</span>
                </button>`;
        } else if (isInCart) {
            borrowBtnHtml = `
                <button class="btn-borrow borrowed" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>Đã thêm vào kệ</span>
                </button>`;
        } else {
            borrowBtnHtml = `
                <button class="btn-borrow" onclick="toggleBorrowBook(${book.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    <span>Mượn Sách</span>
                </button>`;
        }

        const cardHtml = `
            <div class="rec-card animate-pop" style="animation-delay: ${index * 0.05}s; ${isActiveBorrowed ? 'opacity:0.75;' : ''}">
                <div class="rec-rank-badge">Xếp hạng #${index + 1}</div>
                ${isActiveBorrowed ? '<div style="position:absolute;top:8px;right:8px;background:#ef4444;color:white;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:0.5px;">🔴 ĐANG ĐƯỢC MƯỢN</div>' : ''}
                <div class="rec-card-header">
                    <div class="rec-dss-score">
                        <span>${matchPercentage}%</span>
                        <span style="font-size:0.65rem; font-weight:600; text-transform:uppercase;">DSS</span>
                    </div>
                </div>
                <div class="rec-card-body">
                    <h4 class="rec-book-title">${book.title}</h4>
                    <span class="rec-book-author">${book.author}</span>
                    
                    <div class="rec-tags">
                        <span class="tag-major">${book.majorName.split(" (")[0]}</span>
                        <span class="tag-interest">${GOAL_LABELS[book.goal]}</span>
                    </div>

                    <div class="rec-book-meta">
                        <div class="rec-meta-item star-rating">
                            <span style="margin-right:2px;">★</span>
                            <span>${book.rating.toFixed(1)}</span>
                        </div>
                        <div class="rec-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span>${book.checkouts} lượt mượn</span>
                        </div>
                        <div class="rec-meta-item">
                            <span>Năm XB: ${book.year}</span>
                        </div>
                    </div>
                </div>
                <div class="rec-card-footer">
                    <div class="reason-box">💡 ${reason}</div>
                    ${borrowBtnHtml}
                </div>
            </div>
        `;

        container.insertAdjacentHTML("beforeend", cardHtml);
    });
}

/**
 * Renders the top 5 calculations in a transparent mathematical grid (SAW breakdown)
 */
function renderMathExplainerTable(selectedMajorCode, selectedGoal) {
    const tableBody = document.getElementById("math-explain-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    // Take top 5 for math analysis breakdown
    const top5 = currentDssResults.slice(0, 5);

    // Fetch active weights
    const wMajor = parseInt(document.getElementById("slider-w-major").value);
    const wInterest = parseInt(document.getElementById("slider-w-interest").value);
    const wPopularity = parseInt(document.getElementById("slider-w-popularity").value);
    const wRating = parseInt(document.getElementById("slider-w-rating").value);

    top5.forEach((book, index) => {
        // Calculating weighted scores
        const w1Val = (wMajor * book.r1).toFixed(1);
        const w2Val = (wInterest * book.r2).toFixed(1);
        const w3Val = (wPopularity * book.r3).toFixed(1);
        const w4Val = (wRating * book.r4).toFixed(1);
        const totalPct = (book.dssScore * 100).toFixed(2);

        const rowHtml = `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td class="book-title-cell" title="${book.title}">${book.title.length > 35 ? book.title.substring(0, 35) + "..." : book.title}</td>
                <td>
                    <span>r₁₁ = <strong>${book.r1.toFixed(1)}</strong></span><br>
                    <small>(${wMajor}% × ${book.r1.toFixed(1)} = ${w1Val}đ)</small>
                </td>
                <td>
                    <span>r₁₂ = <strong>${book.r2.toFixed(2)}</strong></span><br>
                    <small>(${wInterest}% × ${book.r2.toFixed(1)} = ${w2Val}đ)</small>
                </td>
                <td>
                    <span>r₁₃ = <strong>${book.r3.toFixed(2)}</strong></span><br>
                    <small>(${wPopularity}% × ${book.r3.toFixed(2)} = ${w3Val}đ)</small>
                </td>
                <td>
                    <span>r₁₄ = <strong>${book.r4.toFixed(2)}</strong></span><br>
                    <small>(${wRating}% × ${book.r4.toFixed(2)} = ${w4Val}đ)</small>
                </td>
                <td class="math-score-bold">${totalPct}%</td>
            </tr>
        `;

        tableBody.insertAdjacentHTML("beforeend", rowHtml);
    });
}

/**
 * ==========================================================================
 * WEIGHTS REAL-TIME PROPORTIONAL BALANCING ALGORITHM
 * ==========================================================================
 * When one slider changes, we adjust the other three sliders proportionally
 * to ensure that the sum of all weights always equals exactly 100%.
 */
function handleSliderChange(changedId, newValue) {
    const sliders = [
        { id: "slider-w-major", value: parseInt(document.getElementById("slider-w-major").value) },
        { id: "slider-w-interest", value: parseInt(document.getElementById("slider-w-interest").value) },
        { id: "slider-w-popularity", value: parseInt(document.getElementById("slider-w-popularity").value) },
        { id: "slider-w-rating", value: parseInt(document.getElementById("slider-w-rating").value) }
    ];

    const targetIndex = sliders.findIndex(s => s.id === changedId);
    sliders[targetIndex].value = newValue;

    const remainingValue = 100 - newValue;
    const otherSliders = sliders.filter((s, idx) => idx !== targetIndex);
    const sumOtherValues = otherSliders.reduce((acc, s) => acc + s.value, 0);

    if (sumOtherValues === 0) {
        // If all others were zero, distribute the remainder equally
        const equalShare = Math.floor(remainingValue / 3);
        const remainder = remainingValue % 3;
        otherSliders.forEach((s, idx) => {
            s.value = equalShare + (idx < remainder ? 1 : 0);
        });
    } else {
        // Proportional distribution
        let currentSum = 0;
        otherSliders.forEach((s, idx) => {
            if (idx === otherSliders.length - 1) {
                // Last slider gets the exact math remainder to avoid float rounding errors
                s.value = remainingValue - currentSum;
            } else {
                const proportionalShare = Math.round((s.value / sumOtherValues) * remainingValue);
                s.value = proportionalShare;
                currentSum += proportionalShare;
            }
        });
    }

    // Write back and update displays
    sliders.forEach(s => {
        const inputEl = document.getElementById(s.id);
        inputEl.value = s.value;

        // Update textual display
        const textId = s.id.replace("slider-", "val-");
        document.getElementById(textId).innerText = `${s.value}%`;
    });

    // Validate Total Weight
    const finalSum = sliders.reduce((acc, s) => acc + s.value, 0);
    const checkBadge = document.getElementById("total-weight-check");
    if (checkBadge) {
        checkBadge.innerText = `${finalSum}%`;
        if (finalSum === 100) {
            checkBadge.className = "success-text";
        } else {
            checkBadge.className = "error-text";
        }
    }

    // Dynamic dynamic real-time recommendation updates! Extremely satisfying experience!
    runDSSRecommendation();
}

function resetWeights() {
    document.getElementById("slider-w-major").value = 25;
    document.getElementById("slider-w-interest").value = 25;
    document.getElementById("slider-w-popularity").value = 25;
    document.getElementById("slider-w-rating").value = 25;

    document.getElementById("val-w-major").innerText = "25%";
    document.getElementById("val-w-interest").innerText = "25%";
    document.getElementById("val-w-popularity").innerText = "25%";
    document.getElementById("val-w-rating").innerText = "25%";

    const checkBadge = document.getElementById("total-weight-check");
    if (checkBadge) {
        checkBadge.innerText = "100%";
        checkBadge.className = "success-text";
    }

    runDSSRecommendation();
}

/**
 * ==========================================================================
 * TABS & NAVIGATION ENGINE
 * ==========================================================================
 */
function switchTab(tabId) {
    // 1. Deactivate all navigation items
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    // 2. Hide all tab content sections
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
    });

    // 3. Find and activate active nav menu item
    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add("active");

    // 4. Activate content area
    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.add("active");

    // 5. Update header text depending on tab
    const titleEl = document.getElementById("page-title");
    const subtitleEl = document.getElementById("page-subtitle");

    if (tabId === "dashboard") {
        titleEl.innerText = "Tổng Quan Thư Viện";
        subtitleEl.innerText = "Hệ thống phân tích và đề xuất tài liệu học tập tối ưu";
    } else if (tabId === "dss-engine") {
        titleEl.innerText = "Hệ Hỗ Trợ Quyết Định (SAW DSS)";
        subtitleEl.innerText = "Thiết lập trọng số tùy chỉnh để tìm kiếm tài liệu tối ưu thời gian thực";
        runDSSRecommendation(); // recalculate DSS whenever switching
    } else if (tabId === "repository") {
        titleEl.innerText = "Kho Sách Thư Viện";
        subtitleEl.innerText = "Duyệt qua danh mục 2,000 đầu sách thuộc 20 ngành học chuẩn";
        filterAndSortRepository();
    } else if (tabId === "borrows") {
        titleEl.innerText = "Phiếu Mượn Đang Hoạt Động";
        subtitleEl.innerText = "Theo dõi sách đang được mượn và xử lý trả sách — lượt mượn được cập nhật tự động";
        renderBorrowsTab();
    }
}

/**
 * ==========================================================================
 * REPOSITORY BROWSER & PAGINATION ENGINE (2,000 BOOKS)
 * ==========================================================================
 */
function filterAndSortRepository() {
    const searchVal = document.getElementById("repo-search").value.trim().toLowerCase();
    const filterMajor = document.getElementById("repo-filter-major").value;
    const sortBy = document.getElementById("repo-sort-by").value;

    let filtered = [...booksDatabase];

    // 1. Apply Major Filter
    if (filterMajor !== "all") {
        filtered = filtered.filter(b => b.majorCode === filterMajor);
    }

    // 2. Apply Text Search (matching title, author or ID)
    if (searchVal.length > 0) {
        filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(searchVal) || 
            b.author.toLowerCase().includes(searchVal) ||
            b.id.toString().includes(searchVal)
        );
    }

    // 3. Apply Sorting
    if (sortBy === "rating-desc") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popularity-desc") {
        filtered.sort((a, b) => b.checkouts - a.checkouts);
    } else if (sortBy === "year-desc") {
        filtered.sort((a, b) => b.year - a.year);
    } else if (sortBy === "title-asc") {
        filtered.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    } else {
        // default sorting by book ID
        filtered.sort((a, b) => a.id - b.id);
    }

    repoFilteredBooks = filtered;
    repoCurrentPage = 1; // reset to page 1

    renderRepoTable();
}

function renderRepoTable() {
    const tableBody = document.getElementById("repo-table-body");
    const countEl = document.getElementById("repo-total-count");
    const indicatorEl = document.getElementById("repo-page-indicator");

    if (!tableBody) return;

    tableBody.innerHTML = "";
    
    const totalCount = repoFilteredBooks.length;
    countEl.innerText = totalCount.toLocaleString("vi-VN");

    if (totalCount === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">
                    Không tìm thấy cuốn sách nào khớp với điều kiện tìm kiếm.
                </td>
            </tr>
        `;
        indicatorEl.innerText = "Trang 0 / 0";
        renderPaginationControls(0);
        return;
    }

    const totalPages = Math.ceil(totalCount / repoPageSize);
    indicatorEl.innerText = `Trang ${repoCurrentPage} / ${totalPages}`;

    // Slice active page items
    const startIdx = (repoCurrentPage - 1) * repoPageSize;
    const endIdx = Math.min(startIdx + repoPageSize, totalCount);
    const pageBooks = repoFilteredBooks.slice(startIdx, endIdx);

    pageBooks.forEach(book => {
        const isInCart = userBookshelf.some(b => b.id === book.id);
        const isActiveBorrowed = isBookActiveBorrowed(book.id);

        let actionCell = '';
        if (isActiveBorrowed) {
            actionCell = `<span style="color:#ef4444; font-weight:700; font-size:0.75rem;">🔴 Đang mượn</span>`;
        } else if (isInCart) {
            actionCell = `<span style="color:var(--success); font-size:0.75rem; font-weight:700;">✓ Đã chọn</span>`;
        } else {
            actionCell = `<button class="btn-text" style="color:var(--primary-light)" onclick="toggleBorrowBook(${book.id})">Mượn sách</button>`;
        }

        const rowHtml = `
            <tr style="${isActiveBorrowed ? 'opacity:0.7;' : ''}">
                <td><small style="font-family:monospace; color:var(--text-muted); font-weight:600;">#${book.id}</small></td>
                <td class="book-title-cell">${book.title}</td>
                <td>${book.author}</td>
                <td><span class="book-tag-major">${book.majorName.split(" (")[0]}</span></td>
                <td>${book.year}</td>
                <td class="text-center"><strong>${book.checkouts}</strong></td>
                <td class="text-center" style="color:var(--warning); font-weight:600;">★ ${book.rating.toFixed(1)}</td>
                <td class="text-center">${actionCell}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", rowHtml);
    });

    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const pagesContainer = document.getElementById("pagination-pages");
    const prevBtn = document.getElementById("btn-pagination-prev");
    const nextBtn = document.getElementById("btn-pagination-next");

    if (!pagesContainer) return;

    pagesContainer.innerHTML = "";

    prevBtn.disabled = repoCurrentPage === 1;
    nextBtn.disabled = repoCurrentPage === totalPages || totalPages === 0;

    if (totalPages === 0) return;

    // Show a smart window of pages (e.g. Page 1, ..., Active-1, Active, Active+1, ..., Last)
    const range = [];
    const windowSize = 1; // number of pages adjacent to current page

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= repoCurrentPage - windowSize && i <= repoCurrentPage + windowSize)) {
            range.push(i);
        }
    }

    let prevPageNum = 0;
    range.forEach(p => {
        if (prevPageNum !== 0 && p - prevPageNum > 1) {
            // inject ellipsis
            const dots = document.createElement("span");
            dots.className = "btn-page-dots";
            dots.innerText = "...";
            pagesContainer.appendChild(dots);
        }

        const pageBtn = document.createElement("button");
        pageBtn.className = `btn-page ${p === repoCurrentPage ? 'active' : ''}`;
        pageBtn.innerText = p;
        pageBtn.onclick = () => {
            repoCurrentPage = p;
            renderRepoTable();
        };

        pagesContainer.appendChild(pageBtn);
        prevPageNum = p;
    });
}

/**
 * ==========================================================================
 * BOOKSHELF DRAWER / SHOPPING CART SYSTEM
 * ==========================================================================
 */
function toggleBorrowBook(bookId) {
    const book = booksDatabase.find(b => b.id === bookId);
    if (!book) return;

    // Check if already borrowed
    const alreadyExists = userBookshelf.some(b => b.id === bookId);
    if (alreadyExists) return;

    // Add to shelf
    userBookshelf.push(book);
    saveBookshelf();
    updateBookshelfUI();

    // Dynamically update both DSS and Repo lists to show "Borrowed" state immediately!
    const dssBtn = document.querySelector(`.rec-card button[onclick="toggleBorrowBook(${bookId})"]`);
    if (dssBtn) {
        dssBtn.classList.add("borrowed");
        dssBtn.disabled = true;
        dssBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Đã đăng ký mượn</span>
        `;
    }

    // Refresh Repository view if active
    const activeTab = document.querySelector(".nav-item.active").dataset.tab;
    if (activeTab === "repository") {
        renderRepoTable();
    }

    // Show a beautiful modern micro-toast notification
    showNotification(`Đã thêm cuốn "${book.title}" vào kệ sách của bạn!`);
}

function removeBookFromShelf(bookId) {
    userBookshelf = userBookshelf.filter(b => b.id !== bookId);
    saveBookshelf();
    updateBookshelfUI();

    // Re-render active screens to update "Borrow" button availability
    const activeTab = document.querySelector(".nav-item.active").dataset.tab;
    if (activeTab === "dss-engine") {
        runDSSRecommendation();
    } else if (activeTab === "repository") {
        renderRepoTable();
    }
}

function updateBookshelfUI() {
    const countEl = document.getElementById("bookshelf-count");
    const totalCountEl = document.getElementById("bookshelf-total-count");
    const emptyState = document.getElementById("bookshelf-empty");
    const listContainer = document.getElementById("bookshelf-list-container");
    const footerEl = document.getElementById("bookshelf-footer");

    if (!countEl) return;

    const count = userBookshelf.length;
    countEl.innerText = count;
    totalCountEl.innerText = `${count} cuốn`;

    if (count === 0) {
        emptyState.style.display = "flex";
        listContainer.style.display = "none";
        footerEl.style.display = "none";
        listContainer.innerHTML = "";
        return;
    }

    emptyState.style.display = "none";
    listContainer.style.display = "flex";
    footerEl.style.display = "block";
    listContainer.innerHTML = "";

    userBookshelf.forEach(book => {
        const itemHtml = `
            <div class="bookshelf-item animate-pop">
                <div class="item-info">
                    <h5 class="item-title">${book.title}</h5>
                    <div class="item-meta">Mã: #${book.id} | Tác giả: ${book.author}</div>
                </div>
                <button class="btn-remove-item" onclick="removeBookFromShelf(${book.id})">Gỡ</button>
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", itemHtml);
    });
}

function saveBookshelf() {
    localStorage.setItem(getScopedStorageKey("dss_bookshelf"), JSON.stringify(userBookshelf));
}

function loadBookshelf() {
    const saved = localStorage.getItem(getScopedStorageKey("dss_bookshelf"));
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Re-link to current database so checkouts/titles stay in sync after reload
            userBookshelf = parsed
                .map(item => booksDatabase.find(b => b.id === item.id))
                .filter(Boolean);
            saveBookshelf();
            updateBookshelfUI();
        } catch (e) {
            console.error("Error reading shelf from local storage", e);
            userBookshelf = [];
        }
    }
}

/**
 * ==========================================================================
 * BORROW RECORDS & CHECKOUT INCREMENT SYSTEM (localStorage persistence)
 * ==========================================================================
 */

/** Load persisted borrow data from localStorage */
function loadBorrowData() {
    try {
        const savedRecords = localStorage.getItem(getScopedStorageKey("dss_active_borrows"));
        if (savedRecords) activeBorrowRecords = JSON.parse(savedRecords);

        const savedIncrements = localStorage.getItem("dss_checkout_increments");
        if (savedIncrements) checkoutIncrements = JSON.parse(savedIncrements);
    } catch (e) {
        console.error("Error loading borrow data", e);
        activeBorrowRecords = [];
        checkoutIncrements = {};
    }
}

/** Save borrow data to localStorage */
function saveBorrowData() {
    localStorage.setItem(getScopedStorageKey("dss_active_borrows"), JSON.stringify(activeBorrowRecords));
    localStorage.setItem("dss_checkout_increments", JSON.stringify(checkoutIncrements));
}

/**
 * Apply saved checkout increments to the in-memory booksDatabase.
 * Baseline checkouts are deterministic per book ID; increments persist real borrows.
 */
function applyCheckoutIncrements() {
    Object.keys(checkoutIncrements).forEach(bookIdStr => {
        const bookId = parseInt(bookIdStr, 10);
        const increment = checkoutIncrements[bookIdStr];
        if (!increment) return;
        const book = booksDatabase.find(b => b.id === bookId);
        if (book) {
            book.checkouts += increment;
        }
    });
}

/** Check if a specific book is in an active (unreturned) borrow record */
function isBookActiveBorrowed(bookId) {
    return activeBorrowRecords.some(record =>
        record.books.some(b => b.id === bookId)
    );
}

/** Update the badge counter showing number of active borrows in sidebar */
function updateActiveBorrowsBadge() {
    const badge = document.getElementById("active-borrows-badge");
    if (badge) {
        const totalBorrowedBooks = activeBorrowRecords.reduce((sum, r) => sum + r.books.length, 0);
        badge.innerText = totalBorrowedBooks;
        badge.style.display = totalBorrowedBooks > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Return a borrow record by slipId.
 * Removes from activeBorrowRecords → books become available again.
 * Checkout count remains incremented (reflects real historical usage).
 */
function returnBorrowRecord(slipId) {
    const recordIndex = activeBorrowRecords.findIndex(r => r.slipId === slipId);
    if (recordIndex === -1) return;

    const record = activeBorrowRecords[recordIndex];
    activeBorrowRecords.splice(recordIndex, 1);
    saveBorrowData();

    // Refresh all views
    renderBorrowsTab();
    updateActiveBorrowsBadge();
    const activeTab = document.querySelector(".nav-item.active")?.dataset.tab;
    if (activeTab === "dss-engine") runDSSRecommendation();
    else if (activeTab === "repository") renderRepoTable();

    showNotification(`✅ Đã trả ${record.books.length} cuốn sách — Cảm ơn sinh viên ${record.studentName}!`);
}

/**
 * Render the active borrow records in the "Phiếu Mượn" tab.
 */
function renderBorrowsTab() {
    const container = document.getElementById("borrows-list-container");
    const emptyState = document.getElementById("borrows-empty-state");
    const countEl = document.getElementById("borrows-active-count");
    if (!container) return;

    if (countEl) countEl.innerText = activeBorrowRecords.length;

    if (activeBorrowRecords.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        container.innerHTML = "";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    container.innerHTML = "";

    // Render newest first
    const sorted = [...activeBorrowRecords].reverse();
    sorted.forEach(record => {
        const today = new Date();
        const returnDate = new Date(record.returnDateISO);
        const daysLeft = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
        const isOverdue = daysLeft < 0;
        const daysText = isOverdue
            ? `<span style="color:#ef4444; font-weight:700;">⚠️ Quá hạn ${Math.abs(daysLeft)} ngày</span>`
            : `<span style="color:#10b981; font-weight:600;">Còn ${daysLeft} ngày</span>`;

        const booksRows = record.books.map((b, i) => `
            <tr>
                <td style="font-family:monospace; color:var(--text-muted); font-size:0.75rem;">#${b.id}</td>
                <td><strong>${b.title}</strong><br><small style="color:var(--text-muted);">Tác giả: ${b.author}</small></td>
                <td><span class="book-tag-major" style="font-size:0.65rem;">${b.majorName ? b.majorName.split(' (')[0] : ''}</span></td>
            </tr>
        `).join('');

        const cardHtml = `
            <div class="borrow-record-card animate-pop">
                <div class="borrow-record-header">
                    <div>
                        <span class="slip-badge" style="font-size:0.7rem;">Phiếu ${record.slipId}</span>
                        <strong style="display:block; margin-top:4px; font-size:0.95rem;">${record.studentName}</strong>
                        <small style="color:var(--text-muted);">MSSV: ${record.studentId} | Lớp: ${record.studentClass} | SĐT: ${record.studentPhone}</small>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.75rem; color:var(--text-muted);">Ngày mượn: <strong>${record.borrowDate}</strong></div>
                        <div style="font-size:0.75rem; margin-top:2px;">Hạn trả: <strong>${record.returnDate}</strong></div>
                        <div style="margin-top:6px;">${daysText}</div>
                    </div>
                </div>
                <div class="table-scroll-container" style="margin:12px 0; border-radius:8px; overflow:hidden;">
                    <table class="repo-table" style="font-size:0.8rem;">
                        <thead><tr><th>Mã</th><th>Tên sách</th><th>Ngành</th></tr></thead>
                        <tbody>${booksRows}</tbody>
                    </table>
                </div>
                <div style="text-align:right; padding-top:8px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <span style="color:var(--text-muted); font-size:0.8rem; margin-right:12px;">Tổng: <strong>${record.books.length} cuốn</strong></span>
                    <button class="btn-secondary" style="color:#ef4444; border-color:rgba(239,68,68,0.4); font-size:0.8rem; padding:6px 16px;" onclick="returnBorrowRecord('${record.slipId}')">
                        📤 Xác nhận Trả Sách
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function simulateCheckout() {
    if (userBookshelf.length === 0) return;
    
    // 1. Fill book count preview in modal
    document.getElementById("borrow-preview-count").innerText = `${userBookshelf.length} cuốn`;
    
    // 2. Open modal and set step 1 active
    const modal = document.getElementById("borrow-modal");
    if (modal) {
        modal.classList.add("open");
        document.getElementById("modal-step-input").classList.add("active");
        document.getElementById("modal-step-slip").classList.remove("active");

        // Auto-fill from logged-in student profile
        if (window.DssAuth) {
            DssAuth.fillBorrowForm();
        }
    }

    // 3. Close the drawer
    const drawer = document.getElementById("bookshelf-drawer");
    if (drawer) drawer.classList.remove("open");
}

/**
 * ==========================================================================
 * EVENT LISTENERS SETUP
 * ==========================================================================
 */
function setupEventListeners() {
    // 1. Sidebar Tab Switching Buttons
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            switchTab(tabId);
        });
    });

    // 2. Proportional sliders linkage
    const sliderIds = ["slider-w-major", "slider-w-interest", "slider-w-popularity", "slider-w-rating"];
    sliderIds.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.addEventListener("input", (e) => {
                handleSliderChange(id, parseInt(e.target.value));
            });
        }
    });

    // 3. Reset weights button
    const btnReset = document.getElementById("btn-reset-weights");
    if (btnReset) {
        btnReset.addEventListener("click", resetWeights);
    }

    // 4. Interest/Goal selection pills
    const pills = document.querySelectorAll("#interest-pills .pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            runDSSRecommendation(); // Dynamic update on goal select
        });
    });

    // 5. DSS trigger button
    const btnRunDss = document.getElementById("btn-run-dss");
    if (btnRunDss) {
        btnRunDss.addEventListener("click", runDSSRecommendation);
    }

    // 6. Major dropdown live change
    const dssSelect = document.getElementById("select-major");
    if (dssSelect) {
        dssSelect.addEventListener("change", runDSSRecommendation);
    }

    // 7. Keyword search live update
    const dssKeyword = document.getElementById("input-dss-keyword");
    if (dssKeyword) {
        dssKeyword.addEventListener("input", () => {
            // Live update with simple debounce-like behavior
            runDSSRecommendation();
        });
    }

    // 8. Math explainer accordian toggle
    const mathToggle = document.getElementById("math-toggle");
    const mathCard = document.querySelector(".math-explainer-card");
    if (mathToggle && mathCard) {
        mathToggle.addEventListener("click", () => {
            mathCard.classList.toggle("expanded");
        });
    }

    // 9. Repository search and filters
    const repoSearch = document.getElementById("repo-search");
    const repoFilterMajor = document.getElementById("repo-filter-major");
    const repoSortBy = document.getElementById("repo-sort-by");

    if (repoSearch) repoSearch.addEventListener("input", filterAndSortRepository);
    if (repoFilterMajor) repoFilterMajor.addEventListener("change", filterAndSortRepository);
    if (repoSortBy) repoSortBy.addEventListener("change", filterAndSortRepository);

    // 10. Repository pagination prev/next
    const prevBtn = document.getElementById("btn-pagination-prev");
    const nextBtn = document.getElementById("btn-pagination-next");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (repoCurrentPage > 1) {
                repoCurrentPage--;
                renderRepoTable();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(repoFilteredBooks.length / repoPageSize);
            if (repoCurrentPage < totalPages) {
                repoCurrentPage++;
                renderRepoTable();
            }
        });
    }

    // 11. Virtual Bookshelf Drawer Toggles
    const bookshelfPill = document.getElementById("btn-view-bookshelf");
    const bookshelfDrawer = document.getElementById("bookshelf-drawer");
    const closeBookshelfBtn = document.getElementById("btn-close-bookshelf");
    const overlay = document.getElementById("bookshelf-overlay");
    const checkoutBtn = document.getElementById("btn-checkout-sim");

    if (bookshelfPill && bookshelfDrawer) {
        bookshelfPill.addEventListener("click", () => {
            bookshelfDrawer.classList.add("open");
        });
    }

    if (closeBookshelfBtn && bookshelfDrawer) {
        closeBookshelfBtn.addEventListener("click", () => {
            bookshelfDrawer.classList.remove("open");
        });
    }

    if (overlay && bookshelfDrawer) {
        overlay.addEventListener("click", () => {
            bookshelfDrawer.classList.remove("open");
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", simulateCheckout);
    }

    // 12. VNUF Borrow Modal Event Listeners
    const borrowModal = document.getElementById("borrow-modal");
    const closeBorrowModalBtn = document.getElementById("btn-close-borrow-modal");
    const closeSlipModalBtn = document.getElementById("btn-close-slip-modal");
    const borrowModalOverlay = document.getElementById("borrow-modal-overlay");
    const cancelBorrowBtn = document.getElementById("btn-cancel-borrow");
    const submitBorrowFormBtn = document.getElementById("btn-submit-borrow-form");
    const printSlipBtn = document.getElementById("btn-print-slip");
    const finishBorrowBtn = document.getElementById("btn-finish-borrow");

    const closeBorrowModal = () => {
        if (borrowModal) borrowModal.classList.remove("open");
    };

    if (closeBorrowModalBtn) closeBorrowModalBtn.addEventListener("click", closeBorrowModal);
    if (closeSlipModalBtn) closeSlipModalBtn.addEventListener("click", closeBorrowModal);
    if (borrowModalOverlay) borrowModalOverlay.addEventListener("click", closeBorrowModal);
    if (cancelBorrowBtn) cancelBorrowBtn.addEventListener("click", closeBorrowModal);

    if (submitBorrowFormBtn) {
        submitBorrowFormBtn.addEventListener("click", () => {
            const nameInput = document.getElementById("borrow-student-name").value.trim();
            const idInput = document.getElementById("borrow-student-id").value.trim();
            const classInput = document.getElementById("borrow-student-class").value.trim();
            const phoneInput = document.getElementById("borrow-student-phone").value.trim();

            if (!nameInput || !idInput || !classInput || !phoneInput) {
                alert("Vui lòng điền đầy đủ tất cả các trường thông tin sinh viên!");
                return;
            }

            if (window.DssAuth) {
                DssAuth.syncProfileFromBorrowForm();
                setupAuthUI();
            }

            // 1. Set values in the official slip
            document.getElementById("slip-stud-name").innerText = nameInput;
            document.getElementById("slip-stud-id").innerText = idInput;
            document.getElementById("slip-stud-class").innerText = classInput;
            document.getElementById("slip-stud-phone").innerText = phoneInput;
            document.getElementById("slip-stud-sig").innerText = nameInput;

            // 2. Format Dates
            const today = new Date();
            const returnDate = new Date();
            returnDate.setDate(today.getDate() + 14); // 14 days limit

            const formatVN = (date) => {
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const yyyy = date.getFullYear();
                return `${dd}/${mm}/${yyyy}`;
            };

            document.getElementById("slip-date-borrow").innerText = formatVN(today);
            document.getElementById("slip-date-return").innerText = formatVN(returnDate);
            document.getElementById("slip-location-date").innerText = `Hà Nội, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

            // Generate Random Slip ID
            const slipRandomNum = Math.floor(100000 + Math.random() * 900000);
            document.getElementById("slip-id-text").innerText = `Số: VNUF-${slipRandomNum}`;

            // 3. Render selected books into the Slip Table
            const slipBooksBody = document.getElementById("slip-books-body");
            if (slipBooksBody) {
                slipBooksBody.innerHTML = "";
                userBookshelf.forEach(book => {
                    const rowHtml = `
                        <tr>
                            <td><strong style="font-family:monospace;">#${book.id}</strong></td>
                            <td>
                                <strong style="color:#0f172a; display:block;">${book.title}</strong>
                                <small style="color:#64748b;">Tác giả: ${book.author} | Năm XB: ${book.year}</small>
                            </td>
                            <td><span style="font-size:0.68rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600; color:#475569;">${book.majorName.split(" (")[0]}</span></td>
                        </tr>
                    `;
                    slipBooksBody.insertAdjacentHTML("beforeend", rowHtml);
                });
            }

            // 4. Transition steps
            document.getElementById("modal-step-input").classList.remove("active");
            document.getElementById("modal-step-slip").classList.add("active");
        });
    }

    if (printSlipBtn) {
        printSlipBtn.addEventListener("click", () => {
            window.print();
        });
    }

    if (finishBorrowBtn) {
        finishBorrowBtn.addEventListener("click", () => {
            // === CORE: Save borrow record and increment checkout counts ===
            const slipIdText = document.getElementById("slip-id-text").innerText; // e.g. "Số: VNUF-482930"
            const slipId = slipIdText.replace("Số: ", "").trim();
            const studentName = document.getElementById("slip-stud-name").innerText;
            const studentId = document.getElementById("slip-stud-id").innerText;
            const studentClass = document.getElementById("slip-stud-class").innerText;
            const studentPhone = document.getElementById("slip-stud-phone").innerText;
            const borrowDate = document.getElementById("slip-date-borrow").innerText;
            const returnDate = document.getElementById("slip-date-return").innerText;

            // Calculate return date ISO for countdown
            const returnDateISO = new Date();
            returnDateISO.setDate(returnDateISO.getDate() + 14);

            // Create official borrow record
            const newRecord = {
                slipId,
                studentName,
                studentId,
                studentClass,
                studentPhone,
                borrowDate,
                returnDate,
                returnDateISO: returnDateISO.toISOString(),
                books: userBookshelf.map(b => ({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    majorName: b.majorName
                }))
            };

            // Add to active records
            activeBorrowRecords.push(newRecord);

            // Increment checkout count for each borrowed book (persisted!)
            userBookshelf.forEach(book => {
                // Increment in-memory database
                const dbBook = booksDatabase.find(b => b.id === book.id);
                if (dbBook) dbBook.checkouts += 1;

                // Persist increment in localStorage
                checkoutIncrements[book.id] = (checkoutIncrements[book.id] || 0) + 1;
            });

            // Persist everything to localStorage
            saveBorrowData();

            if (window.DssAuth) {
                DssAuth.syncProfileFromBorrowForm();
            }

            // Clear cart
            userBookshelf = [];
            saveBookshelf();
            updateBookshelfUI();

            // Update badges and re-render borrow tab
            updateActiveBorrowsBadge();
            renderBorrowsTab();

            // Close Modal
            closeBorrowModal();

            // Refresh current active view
            const activeTab = document.querySelector(".nav-item.active")?.dataset.tab;
            if (activeTab === "dss-engine") {
                runDSSRecommendation();
            } else if (activeTab === "repository") {
                renderRepoTable();
            }

            showNotification(`✅ Phiếu mượn ${slipId} đã được xác nhận! Lượt mượn ${newRecord.books.length} cuốn sách đã được cập nhật.`);
        });
    }
}

/**
 * Helper to show temporary gorgeous floating toast notification
 */
function showNotification(message) {
    // Remove existing toast if any
    const existing = document.querySelector(".dss-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "dss-toast";
    toast.innerHTML = `
        <div class="toast-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Styling toast dynamically to keep style.css clean or custom
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%) translateY(20px)",
        background: "rgba(13, 20, 35, 0.9)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        padding: "14px 24px",
        borderRadius: "12px",
        color: "white",
        fontSize: "0.88rem",
        fontWeight: "600",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.2)",
        zIndex: "1000",
        backdropFilter: "blur(10px)",
        opacity: "0",
        transition: "opacity 0.3s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    });

    // Simple display trigger
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);

    // Auto-remove toast
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Global hooks for inline HTML onclick attributes
window.switchTab = switchTab;
window.toggleBorrowBook = toggleBorrowBook;
window.removeBookFromShelf = removeBookFromShelf;
window.returnBorrowRecord = returnBorrowRecord;
