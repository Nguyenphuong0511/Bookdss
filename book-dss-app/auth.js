/**
 * DSS BookSuggest — Student auth (localStorage, no SQL/backend required)
 * Suitable for demo, coursework, and local deployment.
 * For production with many users: migrate to a real API + database.
 */
(function () {
    const USERS_KEY = "dss_student_users";
    const SESSION_KEY = "dss_current_session";

    async function hashPassword(password) {
        const data = new TextEncoder().encode(password);
        const buf = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    function getUsers() {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function normalizeStudentId(id) {
        return String(id || "").trim().toUpperCase();
    }

    function findUserByStudentId(studentId) {
        const norm = normalizeStudentId(studentId);
        return getUsers().find((u) => u.studentId === norm);
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function isLoggedIn() {
        const session = getSession();
        if (!session?.studentId) return false;
        return Boolean(findUserByStudentId(session.studentId));
    }

    function setSession(studentId) {
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                studentId: normalizeStudentId(studentId),
                loginAt: new Date().toISOString()
            })
        );
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getCurrentUser() {
        const session = getSession();
        if (!session?.studentId) return null;
        return findUserByStudentId(session.studentId) || null;
    }

    /** Demo account for first-time testing (created only if no users exist). */
    async function seedDemoUserIfEmpty() {
        if (getUsers().length > 0) return;
        const demoPassword = await hashPassword("123456");
        saveUsers([
            {
                studentId: "22115682",
                passwordHash: demoPassword,
                fullName: "Nguyễn Văn Hoàng",
                className: "K67-HTTT",
                phone: "0987654321",
                email: "",
                createdAt: new Date().toISOString()
            }
        ]);
    }

    async function registerUser({ studentId, password, fullName, className, phone, email }) {
        const sid = normalizeStudentId(studentId);
        const pwd = String(password || "");
        const name = String(fullName || "").trim();
        const cls = String(className || "").trim();
        const ph = String(phone || "").trim();

        if (!sid || sid.length < 6) {
            return { ok: false, message: "MSSV phải có ít nhất 6 ký tự." };
        }
        if (pwd.length < 6) {
            return { ok: false, message: "Mật khẩu tối thiểu 6 ký tự." };
        }
        if (!name || !cls || !ph) {
            return { ok: false, message: "Vui lòng điền đầy đủ họ tên, lớp và số điện thoại." };
        }
        if (findUserByStudentId(sid)) {
            return { ok: false, message: "MSSV này đã được đăng ký. Hãy đăng nhập." };
        }

        const users = getUsers();
        users.push({
            studentId: sid,
            passwordHash: await hashPassword(pwd),
            fullName: name,
            className: cls,
            phone: ph,
            email: String(email || "").trim(),
            createdAt: new Date().toISOString()
        });
        saveUsers(users);
        setSession(sid);
        return { ok: true, message: "Đăng ký thành công!" };
    }

    async function loginUser(studentId, password) {
        const user = findUserByStudentId(studentId);
        if (!user) {
            return { ok: false, message: "MSSV chưa đăng ký. Vui lòng tạo tài khoản mới." };
        }
        const hash = await hashPassword(String(password || ""));
        if (hash !== user.passwordHash) {
            return { ok: false, message: "Mật khẩu không đúng." };
        }
        setSession(user.studentId);
        return { ok: true, message: "Đăng nhập thành công!" };
    }

    function logoutUser() {
        clearSession();
    }

    function updateUserProfile(updates) {
        const session = getSession();
        if (!session?.studentId) return false;

        const users = getUsers();
        const idx = users.findIndex((u) => u.studentId === session.studentId);
        if (idx === -1) return false;

        const u = users[idx];
        if (updates.fullName != null) u.fullName = String(updates.fullName).trim();
        if (updates.className != null) u.className = String(updates.className).trim();
        if (updates.phone != null) u.phone = String(updates.phone).trim();
        if (updates.email != null) u.email = String(updates.email).trim();

        users[idx] = u;
        saveUsers(users);
        return true;
    }

    function requireAuth(redirectUrl) {
        if (isLoggedIn()) return true;
        window.location.replace(redirectUrl || "login.html");
        return false;
    }

    function fillBorrowForm() {
        const user = getCurrentUser();
        if (!user) return;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || "";
        };

        setVal("borrow-student-name", user.fullName);
        setVal("borrow-student-id", user.studentId);
        setVal("borrow-student-class", user.className);
        setVal("borrow-student-phone", user.phone);
    }

    function syncProfileFromBorrowForm() {
        const name = document.getElementById("borrow-student-name")?.value.trim();
        const cls = document.getElementById("borrow-student-class")?.value.trim();
        const phone = document.getElementById("borrow-student-phone")?.value.trim();
        if (name || cls || phone) {
            updateUserProfile({ fullName: name, className: cls, phone });
        }
    }

    window.DssAuth = {
        seedDemoUserIfEmpty,
        registerUser,
        loginUser,
        logoutUser,
        getSession,
        getCurrentUser,
        isLoggedIn,
        requireAuth,
        updateUserProfile,
        fillBorrowForm,
        syncProfileFromBorrowForm,
        normalizeStudentId
    };
})();
