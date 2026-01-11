const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isRecording = false;

// 100-200 ta mavzu uchun kengaytirilgan baza
const database = {
    uz: {
        title: "MILLIY SERTIFIKAT AI", btn: "TAHLIL QILISH", topicPh: "Mavzuni kiriting...", textPh: "Esseni shu yerga yozing...", wordLabel: "SO'Z", speakingTitle: "Nutq Murabbiyi", statusIdle: "BOSHLASH UCHUN BOSING", statusRec: "AI ESHITMOQDA...", loader: "TAHLIL QILINMOQDA...",
        topics: [
            "Global isishning tabiatga ta'siri haqida gapiring.",
            "Sun'iy intellekt insoniyatga foydali yoki zararli?",
            "Sizning eng yoqtirgan badiiy asaringiz.",
            "O'zbekistonda turizmni rivojlantirish yo'llari.",
            "Internetning yoshlar hayotidagi o'rni.",
            "Sog'lom turmush tarzi uchun nimalar qilish kerak?",
            "Kelajakda qaysi kasblar yo'qolib ketadi?",
            "Oilaviy an'analarning ahamiyati.",
            "Chet tillarini o'rganishda eng samarali usul qaysi?",
            "Kitob o'qish yoki kino ko'rish: qaysi biri yaxshiroq?",
            "Siz uchun ideal dam olish maskani qayerda?"
            // ... Bu yerga yana 100 ta mavzu qo'shish mumkin
        ]
    },
    en: {
        title: "IELTS EXAM AI PRO", btn: "ANALYZE ESSAY", topicPh: "Enter essay topic...", textPh: "Write your essay here...", wordLabel: "WORDS", speakingTitle: "AI Speaking Coach", statusIdle: "PRESS TO START", statusRec: "AI IS LISTENING...", loader: "AI ANALYZING...",
        topics: [
            "Discuss the advantages and disadvantages of online education.",
            "Describe a famous person you would like to meet.",
            "How can we solve the problem of urban traffic congestion?",
            "The impact of social media on modern communication.",
            "Should children be allowed to use smartphones in schools?",
            "Discuss the importance of protecting endangered species.",
            "Is it better to work for a big company or a small startup?",
            "Describe a traditional festival in your country.",
            "The role of sports in maintaining physical health.",
            "Discuss the effects of globalization on local cultures."
        ]
    },
    ru: {
        title: "СЕРТИФИКАТ AI RU", btn: "НАЧАТЬ АНАЛИЗ", topicPh: "Введите тему эссе...", textPh: "Пишите эссе здесь...", wordLabel: "СЛОВ", speakingTitle: "AI Тренер", statusIdle: "НАЖМИТЕ ДЛЯ СТАРТА", statusRec: "AI СЛУШАЕТ...", loader: "ИДЕТ АНАЛИЗ...",
        topics: [
            "Влияние технологий на современное образование.",
            "Ваша любимая книга и чему она вас научила.",
            "Проблемы экологии в современном мире.",
            "Важность изучения иностранных языков.",
            "Как интернет изменил нашу жизнь за последние 10 лет?",
            "Спорт как залог долголетия и здоровья.",
            "Традиции вашей семьи, которыми вы гордитесь.",
            "Преимущества и недостатки жизни в большом городе.",
            "Роль искусства в жизни современного человека."
        ]
    }
};

function setRandomTopic() {
    const list = database[currentMode].topics;
    const random = list[Math.floor(Math.random() * list.length)];
    document.getElementById('speakingQuestion').innerText = random;
}

function setMode(mode) {
    currentMode = mode;
    const c = database[mode];
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('topicInput').placeholder = c.topicPh;
    document.getElementById('essayInput').placeholder = c.textPh;
    document.getElementById('wordLabel').innerText = c.wordLabel;
    document.getElementById('checkBtn').innerText = c.btn;
    document.getElementById('speakingTitle').innerText = c.speakingTitle;
    document.getElementById('recordingStatus').innerText = c.statusIdle;
    document.getElementById('loaderText').innerText = c.loader;
    setRandomTopic();
}

// Auth
function registerUser() {
    const email = document.getElementById('regEmail').value;
    if(!email.includes('@')) return alert("Email xato!");
    localStorage.setItem('userEmail', email);
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('userTag').innerText = email;
    setMode('uz');
}

// AI Analysis (Writing)
document.getElementById('checkBtn').onclick = async () => {
    const topic = document.getElementById('topicInput').value;
    const text = document.getElementById('essayInput').value;
    if(text.length < 20) return;

    document.getElementById('loader').classList.remove('hidden');
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: `Bahola: ${currentMode}` }, { role: "user", content: `Topic: ${topic}\nEssay: ${text}` }]
        })
    });
    const data = await res.json();
    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('resultContent').innerHTML = data.choices[0].message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b class="theme-text">$1</b>');
    document.getElementById('loader').classList.add('hidden');
};

// Speaking Control
let recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
recognition.continuous = true;

document.getElementById('recordBtn').onclick = () => {
    if(!isRecording) {
        recognition.lang = currentMode === 'en' ? 'en-US' : (currentMode === 'ru' ? 'ru-RU' : 'uz-UZ');
        recognition.start();
        isRecording = true;
        document.getElementById('micIcon').className = 'fas fa-stop';
        document.getElementById('micRipple').classList.add('animate-ping', 'opacity-50');
        document.getElementById('recordingStatus').innerText = database[currentMode].statusRec;
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
    // AI Tahlil qismi...
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('speakingResult').classList.remove('hidden');
    document.getElementById('speakingFeedback').innerText = "AI tahlil qilmoqda...";
};

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

window.onload = () => {
    const saved = localStorage.getItem('userEmail');
    if(saved) {
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
        document.getElementById('userTag').innerText = saved;
        setMode('uz');
    }
};

document.getElementById('essayInput').oninput = function() {
    document.getElementById('wordCount').innerText = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
};
