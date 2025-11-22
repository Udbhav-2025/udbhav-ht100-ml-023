// --- DATABASE SIMULATION ---
// We use LocalStorage to store users so data persists even if you refresh
const db = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    saveUser: (user) => {
        let users = db.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    },
    findUser: (email) => {
        let users = db.getUsers();
        return users.find(u => u.email === email);
    },
    updateUserPass: (email, newPass) => {
        let users = db.getUsers();
        let index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].password = newPass;
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    }
};

let currentUser = null;
let uploadedFiles = [];

// --- AUTH FUNCTIONS ---

function toggleAuth(type) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-flow').classList.add('hidden');
    
    if(type === 'login') document.getElementById('login-form').classList.remove('hidden');
    if(type === 'signup') document.getElementById('signup-form').classList.remove('hidden');
}

function handleSignup() {
    const user = document.getElementById('signup-user').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;

    if (!user || !email || !pass) return alert("Fill all fields");

    if (db.findUser(email)) return alert("User already exists!");

    db.saveUser({ username: user, email: email, password: pass, history: [] });
    alert("Signup successful! Please login.");
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    const user = db.findUser(email);
    
    if (user && user.password === pass) {
        currentUser = user;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('display-username').innerText = user.username;
        document.getElementById('display-email').innerText = user.email;
        showPage('upload');
    } else {
        alert("Invalid credentials");
    }
}

function handleLogout() {
    currentUser = null;
    location.reload(); // Refresh to clear state
}

// --- FORGOT PASSWORD FLOW ---

function showForgotPass() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('forgot-flow').classList.remove('hidden');
    document.getElementById('fp-step-1').classList.remove('hidden');
    document.getElementById('fp-step-2').classList.add('hidden');
    document.getElementById('fp-step-3').classList.add('hidden');
}

let generatedOTP = 0;
let recoveryEmail = "";

function sendOTP() {
    recoveryEmail = document.getElementById('fp-email').value;
    if(!db.findUser(recoveryEmail)) return alert("Email not registered");

    // Simulating OTP
    generatedOTP = Math.floor(1000 + Math.random() * 9000);
    alert(`OTP Sent to ${recoveryEmail}: ${generatedOTP}`); // Alert simulates email
    
    document.getElementById('fp-step-1').classList.add('hidden');
    document.getElementById('fp-step-2').classList.remove('hidden');
}

function verifyOTP() {
    const enteredOTP = document.getElementById('fp-otp').value;
    if (parseInt(enteredOTP) === generatedOTP) {
        document.getElementById('fp-step-2').classList.add('hidden');
        document.getElementById('fp-step-3').classList.remove('hidden');
    } else {
        alert("Incorrect OTP. Try again.");
        // Show Resend Option logic is handled in HTML structure
    }
}

function resendOTP() {
    sendOTP();
}

function resetPasswordFinal() {
    const newPass = document.getElementById('fp-new-pass').value;
    db.updateUserPass(recoveryEmail, newPass);
    alert("Password Changed! Please login.");
    toggleAuth('login');
}

// --- NAVIGATION & MENUS ---

function toggleMenu() {
    const menu = document.getElementById('side-menu');
    menu.style.width = menu.style.width === "250px" ? "0" : "250px";
}

function toggleProfile() {
    document.getElementById('profile-modal').classList.toggle('hidden');
}

function showPage(pageId) {
    // Hide all pages
    document.getElementById('upload-page').classList.add('hidden');
    document.getElementById('audio-page').classList.add('hidden');
    document.getElementById('video-page').classList.add('hidden');
    document.getElementById('history-page').classList.add('hidden');
    
    toggleMenu(); // Close menu if open

    // Show target
    if(pageId === 'home' || pageId === 'upload') {
        document.getElementById('upload-page').classList.remove('hidden');
    } else if (pageId === 'audio') {
        document.getElementById('audio-page').classList.remove('hidden');
    } else if (pageId === 'history') {
        loadHistory();
        document.getElementById('history-page').classList.remove('hidden');
    }
}

// --- SETTINGS LOGIC ---

function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    toggleMenu();
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    if(theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

function changeFont() {
    const font = document.getElementById('font-select').value;
    document.documentElement.style.setProperty('--font-family', font);
}

function changeZoom(val) {
    document.documentElement.style.setProperty('--base-size', val + 'px');
}

// --- MAIN APP LOGIC ---

function handleFiles() {
    const input = document.getElementById('file-upload');
    const previewArea = document.getElementById('preview-area');
    
    if (input.files.length > 10) {
        alert("Maximum 10 photos allowed");
        input.value = "";
        return;
    }

    uploadedFiles = Array.from(input.files);
    previewArea.innerHTML = "";

    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('preview-img');
            previewArea.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    checkEmotion();
}

function checkEmotion() {
    const emotion = document.getElementById('emotion-select').value;
    const btn = document.getElementById('generate-btn');
    
    // Button active only if files exist AND emotion is selected
    if (uploadedFiles.length > 0 && emotion) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// --- AI GENERATION SIMULATION ---

function generateStory() {
    const btn = document.getElementById('generate-btn');
    btn.innerText = "Generating with AI...";
    btn.disabled = true;

    // Simulate API delay (3 seconds)
    setTimeout(() => {
        const emotion = document.getElementById('emotion-select').value;
        const story = `This is an AI generated story based on your ${uploadedFiles.length} photos. The mood is ${emotion}. Once upon a time... (Story continues)...`;
        
        document.getElementById('story-text').value = story;
        // Mock audio source
        document.getElementById('audio-player').src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
        
        showPage('audio');
        btn.innerText = "Generate Audio Book"; // Reset button
        
        // Add to History
        currentUser.history.push({ date: new Date().toLocaleDateString(), mood: emotion });
        // Update user in DB
        let allUsers = db.getUsers();
        let idx = allUsers.findIndex(u => u.email === currentUser.email);
        allUsers[idx] = currentUser;
        localStorage.setItem('users', JSON.stringify(allUsers));

    }, 3000);
}

function convertToVideo() {
    const btn = document.querySelector('#audio-page .primary-btn');
    btn.innerText = "Converting to Video (Runway Gen-2)...";
    
    setTimeout(() => {
        showPage('video');
        btn.innerText = "Convert to Video (AI)";
    }, 4000);
}

function downloadVideo() {
    alert("Downloading video...");
}

function loadHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    if(currentUser.history.length === 0) {
        list.innerHTML = "<li>No history found.</li>";
    } else {
        currentUser.history.forEach(item => {
            const li = document.createElement('li');
            li.innerText = `Upload on ${item.date} - Mood: ${item.mood}`;
            list.appendChild(li);
        });
    }
}