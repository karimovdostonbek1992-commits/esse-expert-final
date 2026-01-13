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
        max: 9.0,
        criteria: ["TASK RESPONSE", "COHERENCE", "LEXICAL RESOURCE", "GRAMMAR ACCURACY"],
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

// THEME & LANG
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
        const val = scores[index] !== null ? scores[index] : config.max;
        const label = scores[index] !== null ? "NATIJA" : "MAX BALL";
        list.innerHTML += `
            <div class="criteria-card ${scores[index] === null ? 'opacity-50' : ''}">
                <div class="flex flex-col">
                    <span class="text-[9px] text-[var(--primary)] font-bold">${label}</span>
                    <span class="text-sm font-bold tracking-tight">${name}</span>
                </div>
                <span class="score text-2xl">${val}<span class="text-[10px] opacity-30 ml-1">/${config.max}</span></span>
            </div>`;
    });
}

// AI ANALYSIS
document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('essay-text').value;
    const topic = document.getElementById('essay-topic').value;
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
                    Scores: [4 ta son]
                    Feedback: [Tahlil va xatolar ${currentLang} tilida]`
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
        document.getElementById('btn-download').classList.remove('hidden');
    } catch (e) {
        alert("Xatolik yuz berdi.");
    } finally {
        loader.classList.add('hidden');
        loader.style.display = 'none';
    }
});

// PDF GENERATOR
document.getElementById('btn-download').addEventListener('click', () => {
    const element = document.createElement('div');
    element.className = "p-10 text-black bg-white";
    
    const name = document.getElementById('input-name').value;
    const topic = document.getElementById('essay-topic').value;
    const text = document.getElementById('essay-text').value;
    const feedback = document.getElementById('feedback-content').innerText;
    const scores = Array.from(document.querySelectorAll('.criteria-card')).map(c => c.innerText).join('\n');

    element.innerHTML = `
        <h1 style="color: #059669; border-bottom: 2px solid #059669;">EssayLab AI Hisoboti</h1>
        <p><strong>Foydalanuvchi:</strong> ${name}</p>
        <p><strong>Mavzu:</strong> ${topic}</p>
        <hr>
        <h3>Esse matni:</h3><p>${text}</p>
        <hr>
        <h3>Natijalar:</h3><pre>${scores}</pre>
        <hr>
        <h3>AI Tahlili:</h3><p>${feedback}</p>
    `;

    html2pdf().set({ 
        margin: 10, 
        filename: `${name}_natija.pdf`,
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    }).from(element).save();
});

// OTHER TOOLS
document.getElementById('btn-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

document.getElementById('essay-text').addEventListener('input', function() {
    document.getElementById('word-count').innerText = this.value.trim().split(/\s+/).filter(x => x).length;
});
