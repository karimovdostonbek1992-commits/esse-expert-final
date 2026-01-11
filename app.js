const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;
let isRecording = false;

const langData = {
    uz: { title: "MILLIY SERTIFIKAT AI", topicPh: "Mavzuni kiriting...", textPh: "Esseni shu yerga yozing...", wordLabel: "SO'Z", loader: "AI TAHLIL QILMOQDA...", statusIdle: "BOSHLASH UCHUN BOSING", statusRec: "AI ESHITMOQDA...", prompt: "O'zbek tili eksperti sifatida tahlil qil." },
    en: { title: "IELTS AI EXAM PRO", topicPh: "Enter essay topic...", textPh: "Type your essay here...", wordLabel: "WORDS", loader: "AI ANALYZING...", statusIdle: "PRESS TO START SPEAKING", statusRec: "AI IS LISTENING...", prompt: "Act as an IELTS Examiner." },
    ru: { title: "СЕРТИФИКАТ AI RU", topicPh: "Введите тему...", textPh: "Пишите эссе здесь...", wordLabel: "СЛОВ", loader: "AI АНАЛИЗИРУЕТ...", statusIdle: "НАЖМИТЕ ДЛЯ СТАРТА", statusRec: "AI СЛУШАЕТ...", prompt: "Оцени как эксперт русского языка." }
};

// Auth
function registerUser() {
    const email = document.getElementById('regEmail').value;
    if(!email.includes('@')) return alert("Haqiqiy email kiriting!");
    localStorage.setItem('essayUser', email);
    loadUI(email);
}

function loadUI(email) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').style.opacity = '1';
    document.getElementById('userTag').innerText = email;
    setMode('uz');
}

// Mode & Topic
async function generateNewTopic() {
    const display = document.getElementById('speakingQuestion');
    display.innerText = "...";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `Generate one IELTS Speaking topic in ${currentMode}. Just the sentence.` }]
        })
    });
    const data = await res.json();
    display.innerText = data.choices[0].message.content;
}

function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('topicInput').placeholder = c.topicPh;
    document.getElementById('essayInput').placeholder = c.textPh;
    document.getElementById('wordLabel').innerText = c.wordLabel;
    document.getElementById('loaderText').innerText = c.loader;
    document.getElementById('recordingStatus').innerText = c.statusIdle;
    generateNewTopic();
}

// Writing AI
document.getElementById('checkBtn').onclick = async () => {
    const text = document.getElementById('essayInput').value;
    const topic = document.getElementById('topicInput').value;
    if(text.length < 20) return alert("Matn juda qisqa!");

    document.getElementById('loader').classList.remove('hidden');
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: langData[currentMode].prompt }, { role: "user", content: `Mavzu: ${topic}\nEsse: ${text}` }]
        })
    });
    const data = await res.json();
    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('resultContent').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b class="theme-text">$1</b>');
    document.getElementById('loader').classList.add('hidden');
    window.scrollTo({ top: document.getElementById('resultBox').offsetTop - 100, behavior: 'smooth' });
};

// Speaking AI
let recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
recognition.continuous = true;

document.getElementById('recordBtn').onclick = () => {
    if(!isRecording) {
        recognition.lang = currentMode === 'en' ? 'en-US' : (currentMode === 'ru' ? 'ru-RU' : 'uz-UZ');
        recognition.start();
        isRecording = true;
        document.getElementById('micIcon').className = 'fas fa-stop';
        document.getElementById('micRipple').classList.add('animate-ping', 'opacity-50');
        document.getElementById('recordingStatus').innerText = langData[currentMode].statusRec;
    } else {
        recognition.stop();
        isRecording = false;
        document.getElementById('micIcon').className = 'fas fa-microphone';
        document.getElementById('micRipple').classList.remove('animate-ping', 'opacity-50');
    }
};

recognition.onresult = async (e) => {
    const text = e.results[e.results.length - 1][0].transcript;
    document.getElementById('transcript').innerText = `"${text}"`;
    document.getElementById('loader').classList.remove('hidden');
    
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `Analyze this speech for ${currentMode}: ${text}` }]
        })
    });
    const data = await res.json();
    document.getElementById('speakingResult').classList.remove('hidden');
    document.getElementById('speakingFeedback').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>');
    document.getElementById('loader').classList.add('hidden');
};

function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
}

window.onload = () => {
    const saved = localStorage.getItem('essayUser');
    if(saved) loadUI(saved);
};

document.getElementById('essayInput').oninput = function() {
    document.getElementById('wordCount').innerText = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
};
