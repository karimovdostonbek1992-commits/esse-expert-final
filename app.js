const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const langData = {
    uz: { title: "Milliy sertifikat bo'limi", btn: "TAHLIL QILISH", res: "Ekspert Xulosasi", crit: ["Mavzu (4 ball)", "Mantiq (3 ball)", "Imlo (3 ball)", "Tinish belgisi (2 ball)", "Uslub (3 ball)"], prompt: "O'zbek tili eksperti sifatida 15 ballik tizimda tahlil qil." },
    en: { title: "IELTS Exam Department", btn: "ANALYZE ESSAY", res: "Examiner Feedback", crit: ["Task Response (9.0)", "Coherence (9.0)", "Lexical (9.0)", "Grammar (9.0)"], prompt: "IELTS Examiner mode. Grade out of 9.0 band score." },
    ru: { title: "Национальный сертификат (RU)", btn: "НАЧАТЬ АНАЛИЗ", res: "Отчет эксперта", crit: ["Содержание (3)", "Логика (2)", "Грамматика (3)", "Стиль (2)"], prompt: "Эксперт по русскому языку. Оцени по 10-бальной шкале." }
};

// --- 1. EMAILNI TEKSHIRISH VA RO'YXATDAN O'TISH ---
function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const alias = document.getElementById('regAlias').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    
    // Qat'iy Email tekshiruvi (Regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name || !alias || !email) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }

    if (!emailRegex.test(email)) {
        alert("Xato: Haqiqiy email kiriting! (Masalan: user@gmail.com)");
        return;
    }

    const userData = { name, alias, email };
    localStorage.setItem('essayLabUser', JSON.stringify(userData));
    loadUI(userData);
}

// --- 2. TILNI ALMASHTIRISH (EN va RU ishlamayotganini tuzatish) ---
function setMode(mode) {
    console.log("Mode changed to:", mode); // Tekshirish uchun
    currentMode = mode;
    const c = langData[mode];
    
    // Vizual effektlar (CSS o'zgaruvchilari)
    const root = document.documentElement;
    if(mode === 'uz') {
        root.style.setProperty('--t-color', '#00ff88');
        root.style.setProperty('--t-shadow', 'rgba(0, 255, 136, 0.4)');
    } else if(mode === 'en') {
        root.style.setProperty('--t-color', '#00d2ff');
        root.style.setProperty('--t-shadow', 'rgba(0, 210, 255, 0.4)');
    } else if(mode === 'ru') {
        root.style.setProperty('--t-color', '#ff3366');
        root.style.setProperty('--t-shadow', 'rgba(255, 51, 102, 0.4)');
    }

    // Matnlarni o'zgartirish
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    document.getElementById('resultLabel').innerText = c.res;
    
    // Mezonlarni chiqarish
    document.getElementById('criteriaList').innerHTML = c.crit.map(i => `
        <div class="p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold theme-text uppercase tracking-widest">
            ${i}
        </div>
    `).join('');

    // Tugmalar klassini yangilash
    ['uz', 'en', 'ru'].forEach(m => {
        const btn = document.getElementById('btn' + m.charAt(0).toUpperCase() + m.slice(1));
        if (btn) {
            btn.className = (mode === m) 
                ? "px-5 py-2.5 rounded-xl font-black text-xs neon-glow" 
                : "px-5 py-2.5 rounded-xl font-black text-xs text-slate-400 hover:text-white transition";
        }
    });
}

// --- 3. TIZIMGA YUKLASH ---
window.onload = function() {
    const savedUser = localStorage.getItem('essayLabUser');
    if (savedUser) {
        loadUI(JSON.parse(savedUser));
    }
};

function loadUI(user) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('userTag').innerText = `@${user.alias} | ${user.email}`;
    setMode('uz'); // Default holat
}

// Qolgan AI va Theme funksiyalari (Oldingidek)
function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-white';
    setMode(currentMode);
}
