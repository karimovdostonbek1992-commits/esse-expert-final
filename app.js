const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const langData = {
    uz: { title: "Writing Pro", btn: "TAHLIL", topicPh: "Esse mavzusi...", textPh: "Matnni yozing...", wordLabel: "SO'Z", critTitle: "Mezonlar", speakingTitle: "AI Coach", statusIdle: "Boshlash uchun bosing", statusRec: "AI eshitmoqda...", loader: "TAHLIL QILINMOQDA...", prompt: "O'zbek tili eksperti sifatida tahlil qil." },
    en: { title: "IELTS Pro", btn: "ANALYZE", topicPh: "Essay topic...", textPh: "Type essay here...", wordLabel: "WORDS", critTitle: "Criteria", speakingTitle: "AI Coach", statusIdle: "Press to start", statusRec: "AI listening...", loader: "ANALYZING...", prompt: "Act as an IELTS Examiner." },
    ru: { title: "Sertifikat RU", btn: "АНАЛИЗ", topicPh: "Тема эссе...", textPh: "Пишите здесь...", wordLabel: "СЛОВ", critTitle: "Критерии", speakingTitle: "AI Coach", statusIdle: "Нажмите для старта", statusRec: "AI слушает...", loader: "АНАЛИЗ...", prompt: "Оцени как эксперт русского языка." }
};

// Menu Control
document.getElementById('menuBtn').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('sidebar').classList.toggle('open');
};
document.onclick = () => document.getElementById('sidebar').classList.remove('open');

function switchTab(tab) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(tab + 'Page').classList.remove('hidden');
}

// Auth Logic
function registerUser() {
    const email = document.getElementById('regEmail').value;
    if(!email.includes('@')) return alert("Email xato!");
    const user = { alias: document.getElementById('regAlias').value, email };
    localStorage.setItem('essayLabUser', JSON.stringify(user));
    loadUI(user);
}

function loadUI(user) {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainContent').style.opacity = '1';
    document.getElementById('userTag').innerText = `@${user.alias}`;
    setMode('uz');
}

async function generateNewTopic() {
    const display = document.getElementById('speakingQuestion');
    display.innerText = "...";
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: `New IELTS Speaking topic in ${currentMode}. Just the topic sentence.` }]
            })
        });
        const data = await res.json();
        display.innerText = data.choices[0].message.content;
    } catch(e) { display.innerText = "Error loading topic."; }
}

function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    document.getElementById('topicInput').placeholder = c.topicPh;
    document.getElementById('essayInput').placeholder = c.textPh;
    document.getElementById('wordLabel').innerText = c.wordLabel;
    document.getElementById('critTitle').innerText = c.critTitle;
    document.getElementById('speakingTitle').innerText = c.speakingTitle;
    document.getElementById('recordingStatus').innerText = c.statusIdle;
    document.getElementById('loaderText').innerText = c.loader;
    generateNewTopic();
}

// Speaking Logic
let recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
recognition.continuous = true;
recognition.onstart = () => {
    document.getElementById('micRipple').classList.add('animate-ping', 'opacity-50');
    document.getElementById('recordingStatus').innerText = langData[currentMode].statusRec;
};
recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript;
    document.getElementById('transcript').innerText = text;
    analyzeSpeaking(text);
};

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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `Grade this speech: ${text}` }]
        })
    });
    const data = await res.json();
    document.getElementById('speakingResult').classList.remove('hidden');
    document.getElementById('speakingFeedback').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>');
    document.getElementById('loader').classList.add('hidden');
}

// Writing Logic
document.getElementById('checkBtn').onclick = async () => {
    const text = document.getElementById('essayInput').value;
    if(text.length < 10) return;
    document.getElementById('loader').classList.remove('hidden');
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: langData[currentMode].prompt }, { role: "user", content: text }]
        })
    });
    const data = await res.json();
    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('resultContent').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>');
    document.getElementById('loader').classList.add('hidden');
};

function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
}

window.onload = () => {
    const saved = localStorage.getItem('essayLabUser');
    if(saved) loadUI(JSON.parse(saved));
};
