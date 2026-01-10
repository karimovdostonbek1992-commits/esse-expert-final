function setMode(mode) {
    currentMode = mode;
    const c = langData[mode];

    // CSS o'zgaruvchilarini tilga qarab o'zgartirish (Glow effektlar uchun)
    const root = document.documentElement;
    if(mode === 'uz') {
        root.style.setProperty('--t-color', '#00ff88');
        root.style.setProperty('--t-shadow', 'rgba(0, 255, 136, 0.4)');
    } else if(mode === 'en') {
        root.style.setProperty('--t-color', '#00d2ff');
        root.style.setProperty('--t-shadow', 'rgba(0, 210, 255, 0.4)');
    } else if(mode === 'ru') {
        root.style.setProperty('--t-color', '#ff3366');
        root.style.setProperty('--t-shadow', 'rgba(255, 51, 102, 0.4)');
    }
    // ... qolgan kodlar (Sarlavhalarni yangilash va h.k.)
}
