const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const speakingTopics = {
    uz: ["Texnologiyalarning ta'limdagi roli haqida gapiring.", "Sizning sevimli kitobingiz va uning ahamiyati.", "Sog'lom turmush tarzi nima?", "Tabiatni asrash uchun nima qilish kerak?"],
    en: ["Talk about the role of technology in education.", "Your favorite book and its importance.", "What is a healthy lifestyle?", "How can we protect the environment?"],
    ru: ["Расскажите о роли технологий в образовании.", "Ваша любимая книга и ее значение.", "Что такое здоровый образ жизни?", "Как мы можем защитить природу?"]
};

const langData = {
    uz: {
        title: "Milliy sertifikat bo'limi", btn: "TAHLIL QILISH", topicPh: "Esse mavzusi...", textPh: "Matnni shu yerga yozing...",
        wordLabel: "SO'Z", critTitle: "Baholash Mezonlari", speakingTitle: "AI Nutq Murabbiyi", statusIdle: "Tugmani bosing va gapiring", 
        statusRec: "AI eshitmoqda...", loader: "AI TAHLIL QILMOQDA...",
        crit: ["Mavzu (4 ball)", "Mantiq (3 ball)", "Imlo (3 ball)", "Tinish (2 ball)", "Uslub (3 ball)"],
        prompt: "O'zbek tili eksperti sifatida 15 ballik tizimda tahlil qil."
    },
    en: {
        title: "IELTS Exam Center", btn: "ANALYZE ESSAY", topicPh: "Essay topic...", textPh: "Write your essay here...",
        wordLabel: "WORDS", critTitle: "Assessment Criteria", speakingTitle: "AI Speaking Coach", statusIdle: "Press mic and speak",
        statusRec: "AI is listening...", loader: "AI ANALYZING...",
        crit: ["Task Response (9.0)", "Coherence (9.0)", "Lexical (9.0)", "Grammar (9.0)"],
        prompt: "Act as an IELTS Examiner. Grade out of 9.0 band score."
    },
    ru: {
        title: "Национальный сертификат", btn: "НАЧАТЬ АНАЛИЗ", topicPh: "Тема эссе...", textPh: "Напишите ваше эссе здесь...",
        wordLabel: "СЛОВ", critTitle: "Критерии оценки", speakingTitle: "AI Тренер по речи", statusIdle: "Нажмите и говорите",
        statusRec: "AI слушает...", loader: "AI АНАЛИЗИРУЕТ...",
        crit: ["Содержание (3)", "Логика (2)", "Грамматика (3)", "Стиль (2)"],
        prompt: "Оцени как эксперт по русскому языку по 10-бальной шкале."
    }
};

// Sidebar Logic
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
menuBtn.onclick = (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
    menuBtn.querySelector('i').classList.toggle('fa-bars');
    menuBtn.querySelector('i').classList.toggle('fa-times');
};

function switchTab(tab) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(tab + 'Page').classList.remove('hidden');
    sidebar.classList.remove('open');
    menuBtn.querySelector('i').className = 'fas fa-bars';
}

// Auth Logic
function registerUser() {
    const email = document.getElementById('regEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Haqiqiy email kiriting!");
    
    const userData = { name: document.getElementById('regName').value, alias: document.getElementById('regAlias').value, email };
    localStorage.setItem('essayLabUser', JSON.stringify(userData));
    loadUI(userData);
}

function loadUI(user) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('userTag').innerText = `@${user.alias} | ${user.email}`;
    setMode('uz');
}

// Mode & Language Logic
function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    const root = document.documentElement;
    const config = { uz: ['#00ff88', 'rgba(0, 255, 136, 0.4)'], en: ['#00d2ff', 'rgba(0, 210, 255, 0.4)'], ru: ['#ff3366', 'rgba(255, 51, 102, 0.4)'] };
    
    root.style.setProperty('--t-color', config[mode][0]);
    root.style.setProperty('--t-shadow', config[mode][1]);

    // Writing Localize
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    document.getElementById('topicInput').placeholder = c.topicPh;
    document.getElementById('essayInput').placeholder = c.textPh;
    document.getElementById('wordLabel').innerText = c.wordLabel;
    document.getElementById('critTitle').innerText = c.critTitle;
    document.getElementById('loaderText').innerText = c.loader;

    // Speaking Localize
    document.getElementById('speakingTitle').innerText = c.speakingTitle;
    document.getElementById('recordingStatus').innerText = c.statusIdle;
    const randomTopic = speakingTopics[mode][Math.floor(Math.random() * speakingTopics[mode].length)];
    document.getElementById('speakingQuestion').innerText = randomTopic;

    document.getElementById('criteriaList').innerHTML = c.crit.map(i => `<div class="p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-bold theme-text uppercase tracking-widest">${i}</div>`).join('');
    
    ['uz', 'en', 'ru'].forEach(m => {
        const btn = document.getElementById('btn' + m.charAt(0).toUpperCase() + m.slice(1));
        if (m === mode) btn.classList.add('neon-glow'); else btn.classList.remove('neon-glow');
    });
}

// Speaking Logic
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.onstart = () => {
        document.getElementById('recordingStatus').innerText = langData[currentMode].statusRec;
        document.getElementById('micRipple').classList.add('animate-ping', 'opacity-50');
    };
    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        document.getElementById('transcript').innerText = `"${text}"`;
        analyzeSpeaking(text);
    };
}

function startRecording() {
    recognition.lang = currentMode === 'en' ? 'en-US' : (currentMode === 'ru' ? 'ru-RU' : 'uz-UZ');
    recognition.start();
    document.getElementById('startRecordBtn').classList.add('hidden');
    document.getElementById('stopRecordBtn').classList.remove('hidden');
}

function stopRecording() {
    recognition.stop();
    document.getElementById('startRecordBtn').classList.remove('hidden');
    document.getElementById('stopRecordBtn').classList.add('hidden');
    document.getElementById('micRipple').classList.remove('animate-ping', 'opacity-50');
}

async function analyzeSpeaking(text) {
    document.getElementById('loader').classList.remove('hidden');
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: langData[currentMode].prompt + " Analyze this speaking transcript." }, { role: "user", content: text }]
            })
        });
        const data = await res.json();
        document.getElementById('speakingResult').classList.remove('hidden');
        document.getElementById('speakingFeedback').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, `<b class="theme-text">$1</b>`);
    } finally { document.getElementById('loader').classList.add('hidden'); }
}

// Essay Logic
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
    } finally { document.getElementById('loader').classList.add('hidden'); }
};

function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
    setMode(currentMode);
}

window.onload = () => {
    const saved = localStorage.getItem('essayLabUser');
    if (saved) loadUI(JSON.parse(saved));
};

document.getElementById('essayInput').oninput = function() {
    document.getElementById('wordCount').innerText = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
};
