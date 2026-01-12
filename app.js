const API_KEY = "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";
let currentLang = 'uz';

const systems = {
    uz: {
        title: "Milliy sertifikat bo'limi",
        max: 7.5,
        criteria: ["MAVZUNI YORITISH", "MANTIQIY BOG'LIQLIK", "LUG'AT BOYLIĞI", "GRAMMATIKA"],
        prompt: "Milliy sertifikat (CEFR) standarti. Har bir mezonga max 7.5 ball ber."
    },
    en: {
        title: "IELTS Writing Center",
        max: 9.0,
        criteria: ["TASK RESPONSE", "COHERENCE", "LEXICAL RESOURCE", "GRAMMAR ACCURACY"],
        prompt: "IELTS examiner standard. Scores 0-9.0 in 0.5 steps."
    },
    ru: {
        title: "Сертификация (ТРКИ)",
        max: 25,
        criteria: ["СОДЕРЖАНИЕ", "СВЯЗНОСТЬ", "ЛЕКСИКА", "ГРАММАТИКА"],
        prompt: "Стандарт ТРКИ. Максимум 25 баллов за каждый критерий."
    }
};

// INITIALIZATION
document.getElementById('btn-login').addEventListener('click', () => {
    const alias = document.getElementById('input-alias').value || "FOYDALANUVCHI";
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-badge').innerText = `@${alias.toUpperCase()} | ONLINE`;
    setTheme('uz');
});

// THEME & LANG SWITCHER
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => setTheme(e.target.getAttribute('data-lang')));
});

function setTheme(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    document.body.className = document.body.classList.contains('light-mode') ? `theme-${lang} light-mode` : `theme-${lang}`;
    document.getElementById('main-title').innerText = systems[lang].title;
    renderCriteria([null, null, null, null]);
}

function renderCriteria(scores) {
    const config = systems[currentLang];
    const list = document.getElementById('criteria-list');
    list.innerHTML = "";

    config.criteria.forEach((name, index) => {
        const isInitial = scores[index] === null;
        const val = isInitial ? config.max : scores[index];
        const label = isInitial ? "MAX BALL" : "TO'PLANGAN BALL";
        
        list.innerHTML += `
            <div class="criteria-card ${!isInitial ? 'animate-pulse-once' : 'opacity-60'}">
                <div class="flex flex-col">
                    <span class="text-[9px] text-[var(--primary)] font-black tracking-widest">${label}</span>
                    <span class="font-bold text-sm tracking-tight">${name}</span>
                </div>
                <span class="score text-2xl font-black">${val}<span class="text-[10px] opacity-30 ml-1">/${config.max}</span></span>
            </div>`;
    });
}

// AI ANALYSIS
document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('essay-text').value;
    const topic = document.getElementById('essay-topic').value;
    if(text.trim().length < 30) return alert("Iltimos, kamida 30 ta so'zdan iborat matn kiriting!");

    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    loader.style.display = 'flex';

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ 
                    role: "system", 
                    content: `${systems[currentLang].prompt}. 
                    Javob formati: 
                    Scores: [4 ta son vergul bilan]
                    Feedback: [Tahlil va xatolar tushuntirishi ${currentLang} tilida]`
                }, { role: "user", content: `Mavzu: ${topic}\n\nMatn: ${text}` }]
            })
        });
        
        const data = await res.json();
        const content = data.choices[0].message.content;
        
        const scores = content.match(/Scores:\s*([\d.,\s]+)/i)[1].match(/[\d.]+/g);
        const feedback = content.split(/Feedback:/i)[1].trim();

        renderCriteria(scores);
        document.getElementById('feedback-content').innerText = feedback;
        document.getElementById('feedback-section').classList.remove('hidden');
    } catch (e) {
        alert("API bilan bog'lanishda xatolik. Kalitni yoki internetni tekshiring.");
    } finally {
        loader.classList.add('hidden');
        loader.style.display = 'none';
    }
});

// LIGHT/DARK TOGGLE
document.getElementById('btn-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('btn-theme').querySelector('i');
    icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
});

// WORD COUNTER
document.getElementById('essay-text').addEventListener('input', function() {
    const words = this.value.trim().split(/\s+/).filter(x => x).length;
    document.getElementById('word-count').innerText = words;
});
