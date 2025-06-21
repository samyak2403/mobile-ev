// Global Variables
let currentApp = null;
let isLocked = false; // Start unlocked
let calculatorDisplay = '';
let calculatorOperator = '';
let calculatorPrevious = '';
let calculatorWaitingForOperand = false;
let cameraStream = null;
let musicPlaying = false;
let isDarkMode = false;
let deviceUnlocked = true; // Start unlocked

// Initialize the device
document.addEventListener('DOMContentLoaded', function() {
    initializeDevice();
    updateTime();
    setInterval(updateTime, 1000);
    updateBattery();
    setInterval(updateBattery, 60000);
});

// Initialize Device
function initializeDevice() {
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    
    // Start with home screen active by default
    lockScreen.style.display = 'none';
    homeScreen.classList.add('active');
    
    // App icon click handlers
    const appIcons = document.querySelectorAll('.app-icon, .dock-icon');
    appIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const appName = this.getAttribute('data-app');
            if (appName) {
                openApp(appName);
            }
        });
    });
}

// Time and Status Functions
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: false 
    });
    
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('lock-hour').textContent = timeString;
    document.getElementById('lock-date').textContent = dateString;
}

function updateBattery() {
    const batteryLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
    document.getElementById('battery-level').textContent = batteryLevel + '%';
    
    const batteryIcon = document.querySelector('.fa-battery-three-quarters');
    if (batteryLevel > 75) {
        batteryIcon.className = 'fas fa-battery-full';
    } else if (batteryLevel > 50) {
        batteryIcon.className = 'fas fa-battery-three-quarters';
    } else if (batteryLevel > 25) {
        batteryIcon.className = 'fas fa-battery-half';
    } else {
        batteryIcon.className = 'fas fa-battery-quarter';
    }
}

// Device Control Functions
function unlockDevice() {
    // Device is always unlocked - no need for unlock functionality
    console.log('Device is always unlocked');
    return;
}

function lockDevice() {
    // Lock device functionality disabled - always stay on home screen
    console.log('Lock device disabled - staying on home screen');
    return;
}

// App Management Functions
function openApp(appName) {
    if (isLocked) return;
    
    const app = document.getElementById(appName + '-app');
    if (!app) return;
    
    // Close current app
    if (currentApp) {
        currentApp.classList.remove('active');
    }
    
    // Open new app
    app.classList.add('active');
    currentApp = app;
    
    // Initialize app-specific functionality
    switch(appName) {
        case 'camera':
            initializeCamera();
            break;
        case 'calculator':
            initializeCalculator();
            break;
        case 'phone':
            initializePhone();
            break;
        case 'music':
            initializeMusic();
            break;
        case 'weather':
            updateWeather();
            break;
    }
}

function closeApp() {
    if (currentApp) {
        currentApp.classList.remove('active');
        
        // Clean up app-specific resources
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        
        currentApp = null;
    }
}

// Phone App Functions
function initializePhone() {
    const phoneNumber = document.getElementById('phone-number');
    phoneNumber.value = '';
}

function addDigit(digit) {
    const phoneNumber = document.getElementById('phone-number');
    phoneNumber.value += digit;
}

function deleteDigit() {
    const phoneNumber = document.getElementById('phone-number');
    phoneNumber.value = phoneNumber.value.slice(0, -1);
}

function makeCall() {
    const phoneNumber = document.getElementById('phone-number');
    if (phoneNumber.value) {
        // Simulate call
        alert(`Calling ${phoneNumber.value}...`);
        phoneNumber.value = '';
    }
}

// Calculator App Functions
function initializeCalculator() {
    const calcResult = document.getElementById('calc-result');
    calcResult.value = '0';
    calculatorDisplay = '0';
    calculatorOperator = '';
    calculatorPrevious = '';
    calculatorWaitingForOperand = false;
}

function calcNumber(number) {
    const calcResult = document.getElementById('calc-result');
    
    if (calculatorWaitingForOperand) {
        calcResult.value = number;
        calculatorWaitingForOperand = false;
    } else {
        calcResult.value = calcResult.value === '0' ? number : calcResult.value + number;
    }
}

function calcOperation(nextOperator) {
    const calcResult = document.getElementById('calc-result');
    const inputValue = parseFloat(calcResult.value);
    
    if (calculatorPrevious === '') {
        calculatorPrevious = inputValue;
    } else if (calculatorOperator) {
        const currentValue = calculatorPrevious || 0;
        const newValue = calculate(currentValue, inputValue, calculatorOperator);
        
        calcResult.value = String(newValue);
        calculatorPrevious = newValue;
    }
    
    calculatorWaitingForOperand = true;
    calculatorOperator = nextOperator;
}

function calculateResult() {
    const calcResult = document.getElementById('calc-result');
    const inputValue = parseFloat(calcResult.value);
    
    if (calculatorPrevious !== '' && calculatorOperator) {
        const newValue = calculate(calculatorPrevious, inputValue, calculatorOperator);
        calcResult.value = String(newValue);
        calculatorPrevious = '';
        calculatorOperator = '';
        calculatorWaitingForOperand = true;
    }
}

function calculate(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            return firstOperand / secondOperand;
        case '%':
            return firstOperand % secondOperand;
        default:
            return secondOperand;
    }
}

function clearCalc() {
    const calcResult = document.getElementById('calc-result');
    calcResult.value = '0';
    calculatorDisplay = '0';
    calculatorOperator = '';
    calculatorPrevious = '';
    calculatorWaitingForOperand = false;
}

// Camera App Functions
async function initializeCamera() {
    try {
        const video = document.getElementById('camera-feed');
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: false 
        });
        video.srcObject = cameraStream;
    } catch (error) {
        console.log('Camera not available:', error);
        // Show placeholder
        const video = document.getElementById('camera-feed');
        video.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        video.style.display = 'flex';
        video.style.alignItems = 'center';
        video.style.justifyContent = 'center';
        video.innerHTML = '<i class="fas fa-camera" style="font-size: 48px; color: white; opacity: 0.7;"></i>';
    }
}

function switchCamera() {
    // Simulate camera switch
    alert('Camera switched!');
}

function takePicture() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Simulate flash effect
    const screen = document.querySelector('.screen');
    screen.style.background = 'white';
    setTimeout(() => {
        screen.style.background = '';
    }, 100);
    
    alert('Picture taken!');
}

function openGallery() {
    alert('Opening gallery...');
}

// Weather App Functions
function updateWeather() {
    // Simulate weather data update
    const temperatures = [18, 19, 20, 21, 22, 23, 24, 25];
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
    const icons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'];
    
    const temp = temperatures[Math.floor(Math.random() * temperatures.length)];
    const conditionIndex = Math.floor(Math.random() * conditions.length);
    
    document.querySelector('.weather-temp').textContent = temp + '°C';
    document.querySelector('.weather-desc').textContent = conditions[conditionIndex];
    document.querySelector('.weather-icon i').className = 'fas ' + icons[conditionIndex];
}

// Music App Functions
function initializeMusic() {
    const playIcon = document.getElementById('play-icon');
    playIcon.className = musicPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function toggleMusic() {
    const playIcon = document.getElementById('play-icon');
    const progress = document.querySelector('.progress');
    
    musicPlaying = !musicPlaying;
    playIcon.className = musicPlaying ? 'fas fa-pause' : 'fas fa-play';
    
    if (musicPlaying) {
        // Simulate progress
        let width = 30;
        const interval = setInterval(() => {
            if (!musicPlaying || width >= 100) {
                clearInterval(interval);
                if (width >= 100) {
                    musicPlaying = false;
                    playIcon.className = 'fas fa-play';
                    progress.style.width = '0%';
                }
                return;
            }
            width += 1;
            progress.style.width = width + '%';
        }, 100);
    }
}

// Notes App Functions
function addNote() {
    const notesContainer = document.querySelector('.notes-container');
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        <div class="note-title">New Note</div>
        <div class="note-preview">Tap to edit this note...</div>
        <div class="note-date">Now</div>
    `;
    
    noteItem.addEventListener('click', function() {
        const title = prompt('Enter note title:', 'New Note');
        const content = prompt('Enter note content:', 'Tap to edit this note...');
        
        if (title && content) {
            this.querySelector('.note-title').textContent = title;
            this.querySelector('.note-preview').textContent = content;
        }
    });
    
    notesContainer.insertBefore(noteItem, notesContainer.firstChild);
}

// Settings App Functions
function toggleDarkMode() {
    const body = document.body;
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Touch and Gesture Handling
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', function(e) {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    
    // Swipe up from bottom to go home
    if (deltaY > 50 && Math.abs(deltaX) < 50 && touchStartY > window.innerHeight * 0.8) {
        if (currentApp) {
            closeApp();
        }
    }
    
    // Swipe down from top for notifications (placeholder)
    if (deltaY < -50 && Math.abs(deltaX) < 50 && touchStartY < 100) {
        // Could implement notification panel here
        console.log('Notification panel');
    }
});

// Haptic Feedback Simulation
function vibrate(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// Add vibration to button clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('button, .app-icon, .dock-icon, .key, .calc-btn')) {
        vibrate(25);
    }
});

// Keyboard Support
document.addEventListener('keydown', function(e) {
    if (currentApp && currentApp.id === 'calculator-app') {
        const key = e.key;
        if (/[0-9]/.test(key)) {
            calcNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            calcOperation(key);
        } else if (key === 'Enter' || key === '=') {
            calculateResult();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            clearCalc();
        }
    }
    
    if (currentApp && currentApp.id === 'phone-app') {
        const key = e.key;
        if (/[0-9*#]/.test(key)) {
            addDigit(key);
        } else if (key === 'Backspace') {
            deleteDigit();
        } else if (key === 'Enter') {
            makeCall();
        }
    }
    
    // Global shortcuts
    if (e.key === 'Escape') {
        closeApp();
    }
});

// Power Button Simulation - Just close apps
document.querySelector('.power-button').addEventListener('click', function() {
    if (currentApp) {
        closeApp();
        vibrate(100);
        console.log('Power button: Closed current app');
    } else {
        vibrate(100);
        console.log('Power button: Already on home screen');
    }
});

// Volume Button Simulation
document.querySelector('.volume-up').addEventListener('click', function() {
    vibrate(25);
    console.log('Volume up');
});

document.querySelector('.volume-down').addEventListener('click', function() {
    vibrate(25);
    console.log('Volume down');
});

// Device Orientation
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        // Handle orientation change
        console.log('Orientation changed');
    }, 100);
});

// Prevent context menu on long press (mobile-like behavior)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Prevent text selection (mobile-like behavior)
document.addEventListener('selectstart', function(e) {
    if (!e.target.matches('input, textarea')) {
        e.preventDefault();
    }
});

// App-specific event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for existing notes
    document.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = prompt('Enter note title:', this.querySelector('.note-title').textContent);
            const content = prompt('Enter note content:', this.querySelector('.note-preview').textContent);
            
            if (title && content) {
                this.querySelector('.note-title').textContent = title;
                this.querySelector('.note-preview').textContent = content;
            }
        });
    });
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for app content
document.querySelectorAll('.app-content').forEach(content => {
    content.style.scrollBehavior = 'smooth';
});

// Loading states
function showLoading(element) {
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

function hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('App error:', e.error);
});

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.mobileDevice = {
    openApp,
    closeApp,
    unlockDevice,
    lockDevice,
    toggleDarkMode,
    vibrate
}; 