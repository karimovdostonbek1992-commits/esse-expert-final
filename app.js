const API_KEY = "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";
let currentLang = 'uz';

const systems = {
    uz: {
        title: "Milliy sertifikat bo'limi",
        max: 7.5,
        criteria: ["MAVZUNI YORITISH", "MANTIQIY BOG'LIQLIK", "LUG'AT BOYLIĞI", "GRAMMATIKA"],
        prompt: "Milliy sertifikat (CEFR) standarti. Max 7.5 ball."
    },
    en: {
        title: "IELTS Writing Center",
        max: 9,
        criteria: ["TASK RESPONSE", "COHERENCE", "LEXICAL RESOURCE", "GRAMMATICAL RANGE"],
        prompt: "IELTS examiner standard. Max 9.0 band."
    },
    ru: {
        title: "Сертификация (ТРКИ)",
        max: 25,
        criteria: ["СОДЕРЖАНИЕ", "СВЯЗНОСТЬ", "ЛЕКСИКА", "ГРАММАТИКА"],
        prompt: "Стандарт ТРКИ. Максимум 25 баллов."
    }
};

// LOGIN
document.getElementById('btn-login').addEventListener('click', () => {
    const alias = document.getElementById('input-alias').value || "GUEST";
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-badge').innerText = `@${alias.toUpperCase()} | ONLINE`;
    setTheme('uz');
});

// TIL VA DIZAYN
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => setTheme(e.target.getAttribute('data-lang')));
});

function setTheme(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    document.body.className = `theme-${lang}`;
    document.getElementById('main-title').innerText = systems[lang].title;
    renderCriteria([null, null, null, null]);
}

function renderCriteria(scores) {
    const config = systems[currentLang];
    const list = document.getElementById('criteria-list');
    list.innerHTML = "";

    config.criteria.forEach((name, index) => {
        const val = scores[index] !== null ? scores[index] : config.max;
        const label = scores[index] !== null ? "NATIJA" : "MAX BALL";
        list.innerHTML += `
            <div class="criteria-card ${scores[index] !== null ? 'animate-pulse-once' : 'opacity-40'}">
                <div class="flex flex-col">
                    <span class="text-[9px] text-[var(--primary)] font-bold">${label}</span>
                    <span class="text-white text-sm font-bold tracking-tight">${name}</span>
                </div>
                <span class="score text-2xl font-black">${val}<span class="text-[10px] opacity-30 ml-1">/${config.max}</span></span>
            </div>`;
    });
}

// TAHLIL
document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('essay-text').value;
    if(text.trim().length < 20) return alert("Matn kiriting!");

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
                    content: `${systems[currentLang].prompt}. Javob formati: 
                    Scores: raqam, raqam, raqam, raqam
                    Feedback: [Xatolar tahlili ${currentLang} tilida]`
                }, { role: "user", content: text }]
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
        alert("Xatolik yuz berdi.");
    } finally {
        loader.classList.add('hidden');
        loader.style.display = 'none';
    }
});

// KUN/TUN
document.getElementById('btn-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// SO'Z SANASH
document.getElementById('essay-text').addEventListener('input', function() {
    document.getElementById('word-count').innerText = this.value.trim().split(/\s+/).filter(x => x).length;
});
