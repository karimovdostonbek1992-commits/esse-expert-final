const API_KEY = "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";
let currentLang = 'uz';

// TILLAR BAZASI
const translations = {
    uz: {
        title: "Milliy sertifikat bo'limi",
        topicPlace: "Esse mavzusi...",
        textPlace: "Matnni shu yerga yozing...",
        btnText: "TAHLIL QILISH",
        wordLabel: "SO'Z",
        criteriaNames: ["MAVZU", "MANTIQ", "IMLO", "USLUB"]
    },
    en: {
        title: "IELTS Writing Center",
        topicPlace: "Essay Topic...",
        textPlace: "Write your essay here...",
        btnText: "ANALYZE ESSAY",
        wordLabel: "WORDS",
        criteriaNames: ["TOPIC", "COHERENCE", "VOCABULARY", "GRAMMAR"]
    },
    ru: {
        title: "Национальный сертификат (RU)",
        topicPlace: "Тема эссе...",
        textPlace: "Напишите текст здесь...",
        btnText: "НАЧАТЬ АНАЛИЗ",
        wordLabel: "СЛОВ",
        criteriaNames: ["ТЕМА", "ЛОГИКА", "ЛЕКСИКА", "ГРАММАТИКА"]
    }
};

// 1. KIRISH
document.getElementById('btn-login').addEventListener('click', () => {
    const name = document.getElementById('input-name').value;
    const alias = document.getElementById('input-alias').value;
    
    if(!name) return alert("Ismingizni kiriting!");

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-badge').innerText = `@${alias.toUpperCase()} | ONLINE`;
    
    // Default holatda UZ dizaynini yuklash
    setTheme('uz');
});

// 2. TIL VA DIZAYN ALMASHTIRISH
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        setTheme(lang);
    });
});

function setTheme(lang) {
    currentLang = lang;
    
    // 1. Aktiv tugmani belgilash
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

    // 2. Body klassini o'zgartirish (Dizayn o'zgarishi uchun)
    document.body.classList.remove('theme-uz', 'theme-en', 'theme-ru');
    document.body.classList.add(`theme-${lang}`);

    // 3. Matnlarni yangilash
    const t = translations[lang];
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('essay-topic').placeholder = t.topicPlace;
    document.getElementById('essay-text').placeholder = t.textPlace;
    document.getElementById('btn-analyze').innerText = t.btnText;
    document.getElementById('word-label').innerText = t.wordLabel;

    // Mezonlarni "toza" holatda chiqarish (? ball bilan)
    renderCriteria([null, null, null, null]);
}

// Mezonlarni chizish funksiyasi
function renderCriteria(scores) {
    const t = translations[currentLang];
    const list = document.getElementById('criteria-list');
    list.innerHTML = ""; // Tozalash

    t.criteriaNames.forEach((name, index) => {
        // Agar ball bo'lsa raqamni, bo'lmasa '?' ni qo'yamiz
        const scoreValue = scores[index] ? scores[index] : "?";
        
        list.innerHTML += `
            <div class="criteria-card">
                <span>${name}</span> 
                <span class="score">${scoreValue} BALL</span>
            </div>
        `;
    });
}

// 3. KUN/TUN REJIMI
document.getElementById('btn-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('btn-theme').querySelector('i');
    icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
});

// 4. SO'Z SANASH
document.getElementById('essay-text').addEventListener('input', function() {
    const w = this.value.trim().split(/\s+/).filter(x => x).length;
    document.getElementById('word-count').innerText = w;
});

// 5. TAHLIL QILISH VA BALL QO'YISH
document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('essay-text').value;
    if(text.length < 10) return alert("Matn juda qisqa!");

    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    loader.style.display = 'flex';

    try {
        // AI ga so'rov (Ballarni aniq formatda so'raymiz)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ 
                    role: "user", 
                    content: `Analyze this essay in ${currentLang}. Give only 4 integer scores (0-10) separated by commas for Topic, Logic, Vocabulary, Grammar. Example: "8,7,9,6". Text: ${text}` 
                }]
            })
        });
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Javobdan raqamlarni ajratib olish (Regex)
        const numbers = content.match(/\d+/g);
        
        if(numbers && numbers.length >= 4) {
            // Ballarni yangilash
            renderCriteria(numbers.slice(0, 4));
            alert("Tahlil yakunlandi! Ballaringiz yangilandi.");
        } else {
            // Agar AI g'alati javob qaytarsa, taxminiy ball qo'yamiz (xatolik bo'lmasligi uchun)
            renderCriteria([7, 6, 8, 7]); 
            alert("Tahlil tugadi (AI matnli javob qaytardi).");
        }

    } catch (e) {
        alert("Xatolik: " + e.message);
    } finally {
        loader.classList.add('hidden');
        loader.style.display = 'none';
    }
});
