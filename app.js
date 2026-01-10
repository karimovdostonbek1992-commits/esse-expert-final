// --- O'zgaruvchilar va Sozlamalar ---
const GROQ_API_KEY = "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";
let currentMode = 'uz';
let isLight = false;

const langData = {
    uz: { title: "Milliy sertifikat bo'limi", btn: "TAHLIL QILISH", res: "Ekspert Xulosasi", crit: ["Mavzu (4 ball)", "Mantiq (3 ball)", "Imlo (3 ball)", "Tinish belgisi (2 ball)", "Uslub (3 ball)"], prompt: "O'zbek tili eksperti sifatida 15 ballik tizimda tahlil qil." },
    en: { title: "IELTS Exam Department", btn: "ANALYZE ESSAY", crit: ["Task Response (9.0)", "Coherence (9.0)", "Lexical (9.0)", "Grammar (9.0)"], prompt: "IELTS Examiner mode. Grade out of 9.0 band score." },
    ru: { title: "Национальный сертификат (RU)", btn: "НАЧАТЬ АНАЛИЗ", crit: ["Содержание (3)", "Логика (2)", "Грамматика (3)", "Стиль (2)"], prompt: "Эксперт по русскому языку. Оцени по 10-бальной шкале." }
};

// --- 1. Ro'yxatdan o'tish va Email Validatsiyasi ---
function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const alias = document.getElementById('regAlias').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    
    // Emailni tekshirish (Regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!name || !alias || !emailRegex.test(email)) {
        alert("Iltimos, ma'lumotlarni to'g'ri kiriting! Email formatini tekshiring (masalan: info@domain.com)");
        return;
    }

    const userData = { name, alias, email };
    // Ma'lumotlarni saqlash
    localStorage.setItem('essayLabUser', JSON.stringify(userData));
    
    loadUI(userData);
}

// --- 2. Xotiradan tekshirish ---
window.onload = function() {
    const savedUser = localStorage.getItem('essayLabUser');
    if (savedUser) {
        loadUI(JSON.parse(savedUser));
    }
};

function loadUI(user) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('userTag').innerText = `@${user.alias} | ${user.email}`;
    setMode('uz');
}

// --- 3. Til va Rejimlar ---
function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];
    document.getElementById('mainBody').className = (isLight ? 'light-mode ' : '') + `min-h-screen p-4 md:p-12 mode-${mode}`;
    document.getElementById('mainTitle').innerText = c.title;
    document.getElementById('checkBtn').innerText = c.btn;
    
    // Mezonlarni chiqarish
    document.getElementById('criteriaList').innerHTML = c.crit.map(i => `
        <div class="p-5 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-wider" style="color: var(--t-color); box-shadow: inset 0 0 10px var(--t-shadow)">
            ${i}
        </div>
    `).join('');
    
    // Tugmalar yorqinligi rejimga qarab
    ['uz', 'en', 'ru'].forEach(m => {
        const b = document.getElementById('btn' + m.charAt(0).toUpperCase() + m.slice(1));
        if (mode === m) {
            b.className = "px-5 py-2.5 rounded-xl font-black text-xs neon-glow";
        } else {
            b.className = "px-5 py-2.5 rounded-xl font-black text-xs text-slate-400 hover:text-white transition";
        }
    });
}

function toggleTheme() {
    isLight = !isLight;
    document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-orange-500' : 'fas fa-moon text-yellow-400';
    setMode(currentMode);
}

// --- 4. Sun'iy Intellekt Tahlili ---
document.getElementById('checkBtn').onclick = async () => {
    const topic = document.getElementById('topicInput').value;
    const text = document.getElementById('essayInput').value;
    
    if(!topic || text.length < 50) return alert("Mavzu yoki matn yetarli emas!");

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('resultBox').classList.add('hidden');

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: langData[currentMode].prompt },
                    { role: "user", content: `Mavzu: ${topic}\nEsse: ${text}` }
                ]
            })
        });
        const data = await res.json();
        document.getElementById('resultContent').innerHTML = data.choices[0].message.content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, `<b style="color: var(--t-color); text-shadow: 0 0 10px var(--t-shadow)">$1</b>`);
        
        document.getElementById('resultBox').classList.remove('hidden');
        document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        alert("Server bilan ulanishda xatolik!");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
};

// --- 5. Qo'shimcha Funksiyalar ---
document.getElementById('essayInput').oninput = function() {
    const count = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').innerText = count;
};

function downloadPDF() {
    const element = document.getElementById('resultBox');
    const user = JSON.parse(localStorage.getItem('essayLabUser'));
    html2pdf().set({
        margin: 1,
        filename: `EssayLab_Report_${user.alias}.pdf`,
        html2canvas: { scale: 2, backgroundColor: isLight ? '#f0f9ff' : '#050a15' }
    }).from(element).save();
}
