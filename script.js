let currentLevel = 1;

document.addEventListener("DOMContentLoaded", () => {
    initLevel1();
    splitTextForBounce();
});

// --- LEVEL NAV ---
function goToLevel(level) {
    gsap.to(`#level-${currentLevel}`, {
        x: '-100%', duration: 0.5, ease: "power2.inOut",
        onComplete: () => {
            document.getElementById(`level-${currentLevel}`).classList.remove('active');
            document.getElementById(`level-${currentLevel}`).classList.add('hidden');
            
            currentLevel = level;
            const nextPanel = document.getElementById(`level-${currentLevel}`);
            nextPanel.classList.remove('hidden');
            nextPanel.classList.add('active');
            
            gsap.fromTo(nextPanel, { x: '100%' }, { x: '0%', duration: 0.5, ease: "power2.inOut" });

            if (level === 2) fireConfetti();
            if (level === 3) initRoastSlider();
            if (level === 4) initBubbleGame();
            if (level === 5) initDrawCanvas();
            if (level === 7) initScratchCard();
            if (level === 11) initSorryScreen();
        }
    });
}

// --- LEVEL 1: Catch ---
function initLevel1() {
    const target = document.getElementById('moving-target');
    const progress = document.getElementById('catch-progress');
    let score = 0; const maxScore = 3;

    function moveTarget() {
        const area = document.getElementById('catch-game-area');
        const maxX = area.clientWidth - 50; const maxY = area.clientHeight - 50;
        gsap.to(target, { x: Math.random() * maxX - maxX/2, y: Math.random() * maxY - maxY/2, duration: 0.5, ease: "power1.inOut" });
    }
    let moveInterval = setInterval(moveTarget, 800);

    target.addEventListener('mousedown', hit);
    target.addEventListener('touchstart', hit, {passive: false});

    function hit(e) {
        e.preventDefault(); score++;
        progress.style.width = `${(score / maxScore) * 100}%`;
        confetti({ particleCount: 20, spread: 40, origin: { x: (e.clientX || e.touches[0].clientX) / window.innerWidth, y: (e.clientY || e.touches[0].clientY) / window.innerHeight } });
        if (score >= maxScore) {
            clearInterval(moveInterval); gsap.to(target, { scale: 0, duration: 0.3 });
            setTimeout(() => goToLevel(2), 800);
        } else { moveTarget(); }
    }
}

// --- LEVEL 2: Welcome Bounce ---
function splitTextForBounce() {
    const h1 = document.getElementById('welcome-text');
    const text = h1.innerText; h1.innerHTML = '';
    for(let i=0; i<text.length; i++) {
        let span = document.createElement('span'); span.innerText = text[i] === ' ' ? '\u00A0' : text[i];
        span.style.animationDelay = `${i * 0.1}s`; h1.appendChild(span);
    }
}
function fireConfetti() { confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FCE762', '#FF477E', '#06D6A0', '#4F46E5'] }); }

// --- LEVEL 3: Roast Slider ---
function initRoastSlider() {
    const slider = document.getElementById('roast-slider');
    const valueEl = document.getElementById('roast-value');
    const reactionEl = document.getElementById('roast-reaction');
    const btn = document.getElementById('btn-roast');

    slider.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        valueEl.innerText = `${val}%`;
        
        if(val < 30) reactionEl.innerText = "Oh come on, I'm not an angel!";
        else if(val < 70) reactionEl.innerText = "Accurate, but you still love me.";
        else if(val < 100) reactionEl.innerText = "HEY! That's too much!";
        else {
            reactionEl.innerText = "MAXIMUM ANNOYING UNLOCKED.";
            btn.classList.remove('hidden');
            gsap.to(document.body, {x: 5, y: -5, yoyo: true, repeat: 10, duration: 0.05});
        }
    });
}

// --- LEVEL 4: Bubbles ---
function initBubbleGame() {
    const container = document.getElementById('bubble-container');
    const mistakes = ["Hamesha jldi aake tujhe bhi jldi aane ko bolna ⏱", "Kbhi bhi gayab ho jana 👻", "Ragebait krna 🤬", "Jidd krnaa 😤", "Faaltu k jokess marna 😬"];
    let popped = 0;

    mistakes.forEach((text, i) => setTimeout(() => createBubble(text), i * 500));

    function createBubble(text) {
        const b = document.createElement('div'); b.className = 'bubble'; b.innerText = text;
        b.style.left = `${Math.random() * (container.clientWidth - 100)}px`; b.style.bottom = '-50px';
        container.appendChild(b);

        gsap.to(b, { y: -(container.clientHeight + 100), duration: Math.random() * 2 + 3, ease: "linear", repeat: -1, onRepeat: () => b.style.left = `${Math.random() * (container.clientWidth - 100)}px` });
        gsap.to(b, { x: '+=20', duration: 0.8, yoyo: true, repeat: -1, ease: "sine.inOut" });

        const pop = (e) => {
            e.preventDefault(); if(b.classList.contains('popped')) return;
            b.classList.add('popped'); gsap.killTweensOf(b);
            const r = b.getBoundingClientRect();
            confetti({ particleCount: 15, origin: { x: (r.left + r.width/2)/window.innerWidth, y: (r.top + r.height/2)/window.innerHeight } });
            popped++; if (popped >= mistakes.length) document.getElementById('forgive-success').classList.remove('hidden');
            setTimeout(() => b.remove(), 200);
        };
        b.addEventListener('mousedown', pop); b.addEventListener('touchstart', pop, {passive: false});
    }
}

// --- LEVEL 5: Draw Canvas ---
function initDrawCanvas() {
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    let drawing = false; let strokeCount = 0;

    const start = (e) => { drawing = true; draw(e); };
    const stop = () => { drawing = false; ctx.beginPath(); };
    const draw = (e) => {
        if(!drawing) return; e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = '#4F46E5';
        ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
        strokeCount++;
        if(strokeCount > 100) document.getElementById('btn-draw').classList.remove('hidden');
    };

    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop); canvas.addEventListener('mouseleave', stop);
    canvas.addEventListener('touchstart', start, {passive:false});
    canvas.addEventListener('touchmove', draw, {passive:false});
    canvas.addEventListener('touchend', stop);
}

// --- LEVEL 6: Swipe ---
let cardIndex = 3;
function swipeCard(direction) {
    if(cardIndex <= 0) return;
    const cards = document.querySelectorAll('.swipe-card');
    const currentCard = cards[cardIndex-1];
    
    gsap.to(currentCard, {
        x: direction === 'left' ? -300 : 300,
        rotation: direction === 'left' ? -20 : 20,
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            currentCard.style.display = 'none';
            cardIndex--;
            if(cardIndex === 0) {
                document.getElementById('swipe-done').classList.remove('hidden');
                document.querySelector('.swipe-buttons').style.display = 'none';
                fireConfetti();
            }
        }
    });
}

// --- LEVEL 7: Scratch ---
function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.scratch-wrapper');
    canvas.width = wrapper.clientWidth; canvas.height = wrapper.clientHeight;

    ctx.fillStyle = '#C0C0C0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Fredoka One'; ctx.fillStyle = '#1E1E24'; ctx.textAlign = 'center'; ctx.fillText('SCRATCH ME!', canvas.width/2, canvas.height/2);

    let isDrawing = false; let scratchCount = 0; let revealed = false;
    const start = (e) => { isDrawing = true; draw(e); };
    const stop = () => isDrawing = false;
    const draw = (e) => {
        if (!isDrawing) return; e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
        scratchCount++;
        if (scratchCount > 60 && !revealed) {
            revealed = true; document.getElementById('btn-reveal-next').classList.remove('hidden');
        }
    };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, {passive:false}); canvas.addEventListener('touchmove', draw, {passive:false}); canvas.addEventListener('touchend', stop);
}

// --- LEVEL 8: Cookie ---
const fortuneTexts = [
    'So u interested...okay then 😏',
    'We both are in same city doing same job.'
];

function crackCookie(num) {
    const container = document.getElementById(`cookie-${num}`);
    if (container.classList.contains('cracked')) return;
    container.classList.add('cracked');
    fireConfetti();

    // Add message to the shared area below cookies
    const msgArea = document.getElementById('fortune-messages');
    const msg = document.createElement('p');
    msg.className = 'fortune-msg';
    msg.textContent = fortuneTexts[num - 1];
    msgArea.appendChild(msg);
    gsap.from(msg, { scale: 0, duration: 0.4, ease: 'back.out(1.7)' });

    if (num === 1) {
        setTimeout(() => {
            const cookie2 = document.getElementById('cookie-2');
            cookie2.classList.remove('hidden');
            gsap.from(cookie2, { scale: 0, duration: 0.5, ease: 'back.out(1.7)' });
        }, 700);
    } else if (num === 2) {
        const btn = document.getElementById('btn-cookie-next');
        btn.classList.remove('hidden');
        gsap.from(btn, { y: 20, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' });
    }
}

// --- LEVEL 9: Awards ---
let awardsRevealed = 0;
function revealAward(id, el) {
    if(el.classList.contains('revealed')) return;
    el.classList.add('revealed');
    
    // Hide mystery text, show actual text
    el.querySelector('.mystery-text').classList.add('hidden');
    el.querySelector('.actual-text').classList.remove('hidden');
    
    const rect = el.getBoundingClientRect();
    confetti({ particleCount: 30, spread: 50, startVelocity: 20, origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top)/window.innerHeight } });
    
    awardsRevealed++;
    if(awardsRevealed >= 3) {
        setTimeout(() => document.getElementById('btn-awards-next').classList.remove('hidden'), 500);
    }
}

// --- LEVEL 10: Emotional Envelope ---
function openEnvelope() {
    const container = document.getElementById('env-container');
    if(container.classList.contains('open')) return;
    container.classList.add('open');

    // After envelope fades AND collapses (CSS: ~1.1s), hide heading/hint and show letter
    setTimeout(() => {
        document.getElementById('letter-heading').style.display = 'none';
        document.getElementById('letter-hint').style.display = 'none';

        const letter = document.getElementById('the-letter');
        letter.classList.add('opened');

        // After a short delay reveal next button
        setTimeout(() => {
            document.getElementById('btn-letter-next').classList.remove('hidden');
            gsap.from('#btn-letter-next', { y: 30, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' });
        }, 500);
    }, 1200);
}

// --- LEVEL 11: Sorry Screen ---
function initSorryScreen() {
    const emoji = document.getElementById('sorry-emoji');
    // Bounce emoji in
    gsap.from(emoji, { scale: 0, duration: 0.6, ease: 'back.out(1.7)' });
}

// --- LEVEL 12: Ultimate Question ---
function answerQuestion(ans) {
    if(ans === 'yes') {
        document.getElementById('question-box').style.display = 'none';
        triggerChaos();
        
        const happy = document.createElement('div');
        happy.innerHTML = `
            <div style="font-size:5.5rem;text-align:center;margin-bottom:10px;filter:drop-shadow(0 0 20px rgba(255,255,255,0.8));">🥰</div>
            <h1 style="font-family:'Fredoka One',cursive;font-size:3rem;color:white;text-shadow:-3px -3px 0 #1E1E24,3px -3px 0 #1E1E24,-3px 3px 0 #1E1E24,3px 3px 0 #1E1E24,5px 5px 0 #1E1E24;text-transform:uppercase;margin-bottom:15px;">YAY!!!</h1>
            <p style="font-family:'Fredoka One',cursive;font-size:1.5rem;color:white;text-shadow:1px 1px 0 rgba(0,0,0,0.3);margin-bottom:5px;font-weight:900;letter-spacing:1px;">BESTIES FOREVER! 🎉</p>
            <p style="font-size:1.1rem;color:rgba(255,255,255,0.85);font-weight:700;">No one like you in this whole universe!</p>
            <div style="font-size:2rem;margin-top:15px;letter-spacing:5px;animation:none;">✨🌟💛🌟✨</div>
        `;
        happy.style.cssText = `
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            z-index:100;
            width:85%;
            max-width:380px;
            padding:35px 25px;
            text-align:center;
            background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 40%, #06B6D4 100%);
            border: 4px solid #1E1E24;
            border-radius: 24px;
            box-shadow: 8px 8px 0px #1E1E24, 0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(79,70,229,0.3);
            animation: cardPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        document.getElementById('level-12').appendChild(happy);
        gsap.from(happy, { scale: 0, duration: 0.5, ease: 'back.out(1.7)' });
    } else {
        goToLevel(13);
    }
}

// --- Chaos Physics ---
function triggerChaos() {
    var duration = 5 * 1000; var animationEnd = Date.now() + duration;
    setInterval(function() {
        if (animationEnd - Date.now() <= 0) return;
        confetti({ particleCount: 50, spread: 360, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);

    var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Bodies = Matter.Bodies, Composite = Matter.Composite, MouseConstraint = Matter.MouseConstraint, Mouse = Matter.Mouse;
    var matterEl = document.getElementById('matter-container');
    matterEl.style.pointerEvents = 'auto';
    var engine = Engine.create(); var render = Render.create({ element: matterEl, engine: engine, options: { width: window.innerWidth, height: window.innerHeight, wireframes: false, background: 'transparent' }});
    Render.run(render); Runner.run(Runner.create(), engine);

    var ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight + 25, window.innerWidth, 50, { isStatic: true });
    var wallL = Bodies.rectangle(-25, window.innerHeight/2, 50, window.innerHeight, { isStatic: true });
    var wallR = Bodies.rectangle(window.innerWidth + 25, window.innerHeight/2, 50, window.innerHeight, { isStatic: true });
    var ceiling = Bodies.rectangle(window.innerWidth/2, -25, window.innerWidth, 50, { isStatic: true });
    Composite.add(engine.world, [ground, wallL, wallR, ceiling]);

    const emojis = ['🤪', '🍕', '👯‍♀️', '💥', '✨', '👽', '🥳'];
    for(let i=0; i<40; i++) {
        let size = Math.random() * 20 + 20;
        let opt = { render: { fillStyle: ['#FCE762', '#FF477E', '#06D6A0', '#4F46E5'][Math.floor(Math.random()*4)], strokeStyle: '#1E1E24', lineWidth: 3 }, restitution: 0.8 };
        let body = Math.random() > 0.5 ? Bodies.circle(Math.random() * window.innerWidth, -Math.random() * 800, size, opt) : Bodies.rectangle(Math.random() * window.innerWidth, -Math.random() * 800, size*2, size*2, opt);
        Composite.add(engine.world, body);
    }
    
    var mouse = Mouse.create(render.canvas);
    var mc = MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: false } }});
    Composite.add(engine.world, mc); render.mouse = mouse;

    window.addEventListener('deviceorientation', function(e) {
        engine.world.gravity.x = e.gamma / 50;
        engine.world.gravity.y = e.beta / 50;
    });
}
