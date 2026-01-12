// Konfiguratsiya
const API_KEY = "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";
let currentLang = 'uz';

// Tarjimalar bazasi
const translations = {
    uz: {
        title: "Milliy sertifikat bo'limi",
        topicHolder: "Esse mavzusi...",
        textHolder: "Matnni shu yerga yozing...",
        btnAnalyze: "TAHLIL QILISH",
        wordLabel: "SO'Z",
        criteria: ["MAVZU", "MANTIQ", "IMLO", "USLUB"]
    },
    en: {
        title: "IELTS Writing Center",
        topicHolder: "Essay topic...",
        textHolder: "Write your essay here...",
        btnAnalyze: "ANALYZE ESSAY",
        wordLabel: "WORDS",
        criteria: ["TOPIC", "LOGIC", "GRAMMAR", "STYLE"]
    },
    ru: {
        title: "Национальный сертификат (RU)",
        topicHolder: "Тема эссе...",
        textHolder: "Напишите текст здесь...",
        btnAnalyze: "НАЧАТЬ АНАЛИЗ",
        wordLabel: "СЛОВ",
        criteria: ["ТЕМА", "ЛОГИКА", "ГРАММАТИКА", "СТИЛЬ"]
    }
};

// 1. KIRISH LOGIKASI
document.getElementById('btn-login').addEventListener('click', () => {
    const name = document.getElementById('input-name').value;
    const alias = document.getElementById('input-alias').value;
    const email = document.getElementById('input-email').value;

    if (!name || !email) {
        alert("Iltimos, ism va emailni to'ldiring!");
        return;
    }

    // Sahifani almashtirish
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    
    // Foydalanuvchi ma'lumotini chiqarish
    document.getElementById('user-badge').innerText = `@${alias} | ${email}`;
});

// 2. TIL O'ZGARTIRISH LOGIKASI
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Avvalgi aktiv tugmani o'chirish
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        // Bosilgan tugmani aktiv qilish
        e.target.classList.add('active');
        
        // Tilni yangilash
        currentLang = e.target.getAttribute('data-lang');
        updateTexts();
    });
});

function updateTexts() {
    const t = translations[currentLang];
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('essay-topic').placeholder = t.topicHolder;
    document.getElementById('essay-text').placeholder = t.textHolder;
    document.getElementById('btn-analyze').innerText = t.btnAnalyze;
    
    // Mezonlarni yangilash
    const list = document.getElementById('criteria-list');
    list.innerHTML = ''; // Tozalash
    t.criteria.forEach(crit => {
        list.innerHTML += `
            <div class="criteria-card">
                <span>${crit}</span> 
                <span class="score">? BALL</span>
            </div>
        `;
    });
}

// 3. KUN VA TUN REJIMI
const themeBtn = document.getElementById('btn-theme');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Iconni o'zgartirish
    const icon = themeBtn.querySelector('i');
    if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// 4. SO'Z SANAGICH
document.getElementById('essay-text').addEventListener('input', function() {
    const words = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('word-count').innerText = words;
});

// 5. TAHLIL QILISH (Mock function)
document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('essay-text').value;
    if(text.length < 5) return alert("Matn juda qisqa!");

    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    loader.style.display = "flex";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: `Analyze this essay in ${currentLang} and give scores (0-10) for Topic, Logic, Grammar: ${text}` }]
            })
        });
        const data = await response.json();
        
        // Hozircha shunchaki natija kelganini bildiramiz
        alert("Tahlil yakunlandi! Natija: " + data.choices[0].message.content.substring(0, 50) + "...");
    } catch (e) {
        alert("Xatolik: " + e.message);
    } finally {
        loader.classList.add('hidden');
        loader.style.display = "none";
    }
});

// Ilova ishga tushganda matnlarni yangilash
updateTexts();
