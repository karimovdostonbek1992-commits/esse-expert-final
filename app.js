const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const langData = {
    uz: { title: "Milliy sertifikat bo'limi", btn: "TAHLIL QILISH", res: "Ekspert Xulosasi", crit: ["Mavzu (4 ball)", "Mantiq (3 ball)", "Imlo (3 ball)", "Tinish belgisi (2 ball)", "Uslub (3 ball)"], prompt: "O'zbek tili eksperti sifatida 15 ballik tizimda tahlil qil." },
    en: { title: "IELTS Exam Department", btn: "ANALYZE ESSAY", res: "Examiner Feedback", crit: ["Task Response (9.0)", "Coherence (9.0)", "Lexical (9.0)", "Grammar (9.0)"], prompt: "IELTS Examiner mode. Grade out of 9.0 band score." },
    ru: { title: "Национальный сертификат (RU)", btn: "НАЧАТЬ АНАЛИЗ", res: "Отчет эксперта", crit: ["Содержание (3)", "Логика (2)", "Грамматика (3)", "Стиль (2)"], prompt: "Эксперт по русскому языку. Оцени по 10-балльной шкале." }
};

// 1. REGISTRATSIYA VA EMAIL TEKSHIRUV
function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const alias = document.getElementById('regAlias').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    
    // Qat'iy Email tekshiruvi (Regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name || !alias || !email) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return; // Funksiyani to'xtatish
    }

    if (!emailRegex.test(email)) {
        alert("Xato: Iltimos haqiqiy email kiriting! (Masalan: user@gmail.com)");
        return; // Email xato bo'lsa to'xtatadi
    }

    const userData = { name, alias, email };
    localStorage.setItem('essayLabUser', JSON.stringify(userData));
    loadUI(userData);
}

// 2. TIZIMGA YUKLASH
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
    setMode('uz');
}

// 3. TILNI ALMASHTIRISH VA NEON EFFEKT (EN/RU ISHLAYDIGAN QILINDI)
function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    
    // CSS neon ranglarini yangilash
    const root = document.documentElement;
    if(mode === 'uz') {
        root.style.setProperty('--t-color', '#00ff88');
        root.style.setProperty('--t-shadow', 'rgba(0, 255, 136, 0.5)');
    } else if(mode === 'en') {
        root.style.setProperty('--t-color', '#00d2ff');
        root.style.setProperty('--t-shadow', 'rgba(0, 210, 255, 0.5)');
    } else if(mode === 'ru') {
        root.style.setProperty('--t-color', '#ff3366');
        root.style.setProperty('--t-shadow', 'rgba(255, 51, 102, 0.5)');
    }

    // Matnlarni almashtirish
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    
    // Mezonlar ro'yxati
    document.getElementById('criteriaList').innerHTML = c.crit.map(i => `
        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest shadow-inner" style="color: var(--t-color)">
            ${i}
        </div>
    `).join('');

    // TUGMALARNI YORQIN QILISH (DYNAMIC STYLE)
    const btnIds = ['btnUz', 'btnEn', 'btnRu'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        const btnLang = id.replace('btn', '').toLowerCase();
        
        if (btnLang === mode) {
            // Tanlangan til tugmasi yorqin neon bo'ladi
            btn.className = "px-5 py-2.5 rounded-xl font-black text-xs transition-all neon-glow text-white";
        } else {
            // Tanlanmaganlari xira bo'ladi
            btn.className = "px-5 py-2.5 rounded-xl font-black text-xs transition-all text-slate-400 hover:text-white";
        }
    });
}

// 4. TAHLIL QISMI (AI)
document.getElementById('checkBtn').onclick = async () => {
    const topic = document.getElementById('topicInput').value;
    const text = document.getElementById('essayInput').value;
    
    if(!topic || text.length < 50) {
        alert("Iltimos, mavzu va kamida 50 ta so'zdan iborat esse kiriting!");
        return;
    }

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('resultBox').classList.add('hidden');

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: langData[currentMode].prompt },
                    { role: "user", content: `Mavzu: ${topic}\nEsse: ${text}` }
                ]
            })
        });
        const data = await res.json();
        document.getElementById('resultContent').innerHTML = data.choices[0].message.content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, `<b style="color: var(--t-color); text-shadow: 0 0 10px var(--t-shadow)">$1</b>`);
        
        document.getElementById('resultBox').classList.remove('hidden');
        document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        alert("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
};

// 5. THEME TOGGLE
function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
}

// 6. WORD COUNT
document.getElementById('essayInput').oninput = function() {
    const count = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').innerText = count;
};
