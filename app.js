const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const langData = {
    uz: { title: "Milliy sertifikat bo'limi", btn: "TAHLIL QILISH", crit: ["Mavzu (4 ball)", "Mantiq (3 ball)", "Imlo (3 ball)", "Tinish (2 ball)", "Uslub (3 ball)"], prompt: "O'zbek tili eksperti sifatida 15 ballik tizimda tahlil qil." },
    en: { title: "IELTS Exam Center", btn: "ANALYZE ESSAY", crit: ["Task Response (9.0)", "Coherence (9.0)", "Lexical (9.0)", "Grammar (9.0)"], prompt: "IELTS Examiner mode. Grade out of 9.0 band score." },
    ru: { title: "Национальный сертификат (RU)", btn: "НАЧАТЬ АНАЛИЗ", crit: ["Содержание (3)", "Логика (2)", "Грамматика (3)", "Стиль (2)"], prompt: "Эксперт по русскому языку. Оцени по 10-балльной шкале." }
};

// --- SIDEBAR & NAVIGATION ---
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

menuBtn.onclick = (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
    menuBtn.querySelector('i').classList.toggle('fa-bars');
    menuBtn.querySelector('i').classList.toggle('fa-times');
};

document.onclick = (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        menuBtn.querySelector('i').className = 'fas fa-bars';
    }
};

function switchTab(tab) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(tab + 'Page').classList.remove('hidden');
    sidebar.classList.remove('open');
    menuBtn.querySelector('i').className = 'fas fa-bars';
}

// --- AUTH & REGISTRATION ---
function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const alias = document.getElementById('regAlias').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Xato: Haqiqiy email manzilingizni kiriting!");
        return;
    }

    if (name && alias) {
        const userData = { name, alias, email };
        localStorage.setItem('essayLabUser', JSON.stringify(userData));
        loadUI(userData);
    } else {
        alert("Barcha maydonlarni to'ldiring!");
    }
}

function loadUI(user) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('userTag').innerText = `@${user.alias} | ${user.email}`;
    setMode('uz');
}

// --- LANGUAGE & THEME ---
function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    const root = document.documentElement;
    const config = {
        uz: ['#00ff88', 'rgba(0, 255, 136, 0.4)'],
        en: ['#00d2ff', 'rgba(0, 210, 255, 0.4)'],
        ru: ['#ff3366', 'rgba(255, 51, 102, 0.4)']
    };
    root.style.setProperty('--t-color', config[mode][0]);
    root.style.setProperty('--t-shadow', config[mode][1]);

    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    document.getElementById('criteriaList').innerHTML = c.crit.map(i => `<div class="p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-bold theme-text uppercase tracking-widest">${i}</div>`).join('');

    ['uz', 'en', 'ru'].forEach(m => {
        const btn = document.getElementById('btn' + m.charAt(0).toUpperCase() + m.slice(1));
        if (m === mode) btn.classList.add('neon-glow'); else btn.classList.remove('neon-glow');
    });
}

function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
}

// --- WRITING (AI) ---
document.getElementById('checkBtn').onclick = async () => {
    const topic = document.getElementById('topicInput').value;
    const text = document.getElementById('essayInput').value;
    if(!topic || text.length < 50) return alert("Mavzu va matnni to'ldiring!");

    document.getElementById('loader').classList.remove('hidden');
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: langData[currentMode].prompt }, { role: "user", content: `Mavzu: ${topic}\nEsse: ${text}` }]
            })
        });
        const data = await res.json();
        document.getElementById('resultContent').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, `<b class="theme-text">$1</b>`);
        document.getElementById('resultBox').classList.remove('hidden');
    } catch (e) { alert("Xatolik!"); }
    finally { document.getElementById('loader').classList.add('hidden'); }
};

// --- SPEAKING (AI) ---
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
        document.getElementById('recordingStatus').innerText = "AI eshitmoqda...";
        document.getElementById('micRipple').classList.add('animate-ping', 'opacity-50');
    };
    recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById('transcript').innerText = `"${text}"`;
        document.getElementById('micRipple').classList.remove('animate-ping', 'opacity-50');
        analyzeSpeaking(text);
    };
}

document.getElementById('recordBtn').onclick = () => recognition.start();

async function analyzeSpeaking(text) {
    document.getElementById('loader').classList.remove('hidden');
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: `Act as an IELTS Examiner. Grade this speaking response: ${text}` }]
            })
        });
        const data = await res.json();
        document.getElementById('speakingResult').classList.remove('hidden');
        document.getElementById('speakingFeedback').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>');
    } finally { document.getElementById('loader').classList.add('hidden'); }
}

window.onload = () => {
    const saved = localStorage.getItem('essayLabUser');
    if (saved) loadUI(JSON.parse(saved));
};

document.getElementById('essayInput').oninput = function() {
    document.getElementById('wordCount').innerText = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
};
