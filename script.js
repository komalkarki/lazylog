// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    darkModeToggle.textContent = document.body.classList.contains('light-mode') ? '☀' : '☾';
});

// Load Motivation Quote
async function loadJokes() {
    try {
        const response = await fetch('data/lazyJokes.json');
        const data = await response.json();
        return data.jokes;
    } catch (error) {
        console.error('Error loading jokes:', error);
        return ["You're too lazy to even load the quote!"];
    }
}

function displayMotivation(jokes) {
    const quoteElement = document.getElementById('motivation-quote');
    const randomIndex = Math.floor(Math.random() * jokes.length);
    quoteElement.textContent = jokes[randomIndex];
    quoteElement.classList.add('fade-in');
}

// Save Entry
function saveEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('entries')) || [];
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
}

// Check-in Form
const checkInForm = document.getElementById('check-in-form');
checkInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const confession = document.getElementById('confession').value.trim();
    const tags = Array.from(document.getElementById('tags').selectedOptions).map(opt => opt.value);
    const timeCategory = document.getElementById('time-wasted-category').value;
    const timeAmount = parseInt(document.getElementById('time-wasted-amount').value);
    const date = new Date().toISOString().split('T')[0];

    if (!confession) return;

    const entry = { confession, tags, date, timeWasted: { category: timeCategory, amount: timeAmount } };
    saveEntry(entry);
    checkInForm.reset();

    document.getElementById('confession').classList.add('bounce');
    setTimeout(() => document.getElementById('confession').classList.remove('bounce'), 500);

    checkAchievements();
    displayStats();
});

// Anti-goals
const antiGoalsForm = document.getElementById('anti-goals-form');
antiGoalsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const antiGoal = document.getElementById('anti-goal').value.trim();
    if (!antiGoal) return;
    addAntiGoal(antiGoal);
    antiGoalsForm.reset();
});

function addAntiGoal(antiGoal) {
    let antiGoals = JSON.parse(localStorage.getItem('antiGoals')) || [];
    antiGoals.push(antiGoal);
    localStorage.setItem('antiGoals', JSON.stringify(antiGoals));
    displayAntiGoals();
}

function displayAntiGoals() {
    const list = document.getElementById('anti-goals-list');
    const antiGoals = JSON.parse(localStorage.getItem('antiGoals')) || [];
    list.innerHTML = antiGoals.map(goal => `<li>${goal}</li>`).join('');
}

// Achievements
const achievements = [
    { id: 'procrastination_pro', name: 'Procrastination Pro', condition: entries => entries.filter(e => e.tags.includes('Procrastinated')).length >= 5 },
    { id: 'nap_champion', name: 'Nap Champion', condition: entries => entries.filter(e => e.tags.includes('Slept')).length >= 3 },
    { id: 'binge_master', name: 'Binge Master', condition: entries => entries.filter(e => e.tags.includes('Binged Netflix')).length >= 2 },
];
function checkAchievements() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    let unlocked = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];

    if (entries.length === 0) return; // no achievements without entries

    let newUnlocks = false;

    achievements.forEach(ach => {
        if (!unlocked.includes(ach.id) && ach.condition(entries)) {
            unlocked.push(ach.id);
            newUnlocks = true;
            alert(`🎉 Achievement Unlocked: ${ach.name}`);
        }
    });

    if (newUnlocks) {
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
    }
console.log("Current entries:", entries);
console.log("Unlocked so far:", unlocked);

    displayAchievements(); // update UI
}


function displayAchievements() {
    const list = document.getElementById('achievements-list');
    const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    list.innerHTML = achievements.map(ach => `
        <li style="color: ${unlocked.includes(ach.id) ? 'var(--success-highlight)' : 'var(--font-color)'}">
            ${ach.name}
        </li>
    `).join('');
}

// Stats Dashboard
function displayStats() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];

    // Tag Frequencies
    const tagFrequencies = {};
    entries.forEach(e => e.tags.forEach(tag => {
        tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1;
    }));

    document.getElementById('tag-frequencies').innerHTML = `
        <h3>Tag Frequencies</h3>
        <ul>${Object.entries(tagFrequencies).map(([tag, count]) => `<li>${tag}: ${count}</li>`).join('')}</ul>
    `;

    // Time Wasted
    const timeWasted = {};
    entries.forEach(e => {
        if (e.timeWasted) {
            const { category, amount } = e.timeWasted;
            timeWasted[category] = (timeWasted[category] || 0) + amount;
        }
    });

    document.getElementById('time-wasted').innerHTML = `
        <h3>Time Wasted (Minutes)</h3>
        <ul>${Object.entries(timeWasted).map(([cat, amt]) => `<li>${cat}: ${amt}</li>`).join('')}</ul>
    `;

    // Top Excuses
    const excuseCounts = {};
    entries.forEach(e => {
        excuseCounts[e.confession] = (excuseCounts[e.confession] || 0) + 1;
    });

    const topExcuses = Object.entries(excuseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    document.getElementById('top-excuses').innerHTML = `
        <h3>Top Excuses</h3>
        <ul>${topExcuses.map(([excuse, count]) => `<li>${excuse} (${count})</li>`).join('')}</ul>
    `;
}

// Lazy Mode Button
async function loadExcuses() {
    try {
        const response = await fetch('data/excuses.json');
        const data = await response.json();
        return data.excuses;
    } catch (error) {
        console.error('Error loading excuses:', error);
        return ["Too lazy to think of an excuse."];
    }
}

document.getElementById('lazy-mode').addEventListener('click', async () => {
    const excuses = await loadExcuses();
    const excuse = excuses[Math.floor(Math.random() * excuses.length)];
    const entry = {
        confession: excuse,
        tags: ['Random'],
        date: new Date().toISOString().split('T')[0],
        timeWasted: {
            category: 'random',
            amount: Math.floor(Math.random() * 60)
        }
    };
    saveEntry(entry);
    checkAchievements();
    displayStats();
});

// Initialize Everything on Load
document.addEventListener('DOMContentLoaded', async () => {
    const jokes = await loadJokes();
    displayMotivation(jokes);
    displayAntiGoals();
    displayAchievements();
    displayStats();
});
