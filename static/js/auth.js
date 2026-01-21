// Базовый URL вашего API
const API_BASE_URL = 'http://127.0.0.1:8001';

// Функция переключения на форму входа
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    
    // Обновляем активную кнопку
    document.querySelectorAll('.switch-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const loginBtn = document.querySelectorAll('.switch-btn')[0];
    if (loginBtn) loginBtn.classList.add('active');
    
    // Скрываем сообщения
    hideMessages();
}

// Функция переключения на форму регистрации
function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    
    // Обновляем активную кнопку
    document.querySelectorAll('.switch-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const registerBtn = document.querySelectorAll('.switch-btn')[1];
    if (registerBtn) registerBtn.classList.add('active');
    
    // Скрываем сообщения
    hideMessages();
}

// Функция регистрации нового пользователя
async function register() {
    console.log('=== НАЧАЛО РЕГИСТРАЦИИ ===');
    
    // Получаем элементы формы
    const nameInput = document.getElementById('registerName');
    const loginInput = document.getElementById('registerLogin');
    const passwordInput = document.getElementById('registerPassword');
    const ageInput = document.getElementById('registerAge');
    
    // Проверяем, что элементы существуют
    if (!nameInput || !loginInput || !passwordInput || !ageInput) {
        console.error('Не найдены поля формы!');
        showMessage('registerMessage', '❌ Ошибка: форма не найдена', 'error');
        return;
    }
    
    // Получаем значения из формы
    const name = nameInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    const age = ageInput.value;
    
    console.log('Получены данные:', { name, login, age, password });
    
    // Валидация данных (теперь проверяем пароль)
    if (!validateRegistrationForm(name, login, age, password)) {
        return;
    }
    
    // Подготавливаем данные для отправки
    const userData = {
        user_name: name,
        user_password: password,
        login: login,
        age: parseInt(age)    
    };
    
    console.log('Отправляемые данные:', userData);
    console.log('URL:', `${API_BASE_URL}/api/create_user`);
    
    // Получаем элементы DOM
    const message = document.getElementById('registerMessage');
    const button = document.querySelector('#registerForm button.auth-btn');
    
    if (!button) {
        console.error('Не найдена кнопка регистрации');
        return;
    }
    
    // Блокируем кнопку и показываем загрузку
    button.disabled = true;
    button.textContent = '⏳ Регистрация...';
    showMessage('registerMessage', `⏳ Создаю пользователя ${userData.login}...`, 'info');
    
    try {
        // Отправляем запрос к вашему FastAPI
        const response = await fetch(`${API_BASE_URL}/api/create_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        console.log('Статус ответа:', response.status);
        
        // Проверяем статус ответа
        if (!response.ok) {
            let errorMessage = `Ошибка сервера: ${response.status}`;
            
            // Пытаемся получить детали ошибки из ответа
            try {
                const errorData = await response.json();
                console.log('Детали ошибки:', errorData);
                
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(d => d.msg).join(', ');
                    } else {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.log('Не удалось распарсить ошибку:', e);
            }
            
            throw new Error(errorMessage);
        }
        
        // Парсим успешный ответ
        const data = await response.json();
        console.log('Успешный ответ от API:', data);
        
        // Показываем успешное сообщение
        showMessage('registerMessage', 
            `✅ <strong>Пользователь создан успешно!</strong><br>
             👤 <strong>Имя:</strong> ${data.user_name}<br>
             🔑 <strong>Логин:</strong> ${data.login}<br>
             🎂 <strong>Возраст:</strong> ${data.age}<br>
             📝 <strong>ID:</strong> ${data.id}`, 
            'success');
        
        // Очищаем форму
        nameInput.value = '';
        loginInput.value = '';
        passwordInput.value = '';
        ageInput.value = '';
        
        // Автоматически переключаем на форму входа через 3 секунды
        setTimeout(() => {
            showLoginForm();
            // Заполняем поле логина в форме входа
            const loginUsernameInput = document.getElementById('loginUsername');
            if (loginUsernameInput) {
                loginUsernameInput.value = data.login;
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        
        // Показываем подробное сообщение об ошибке
        let errorText = `❌ <strong>Ошибка регистрации:</strong><br>${error.message}`;
        
        // Добавляем подсказки для частых ошибок
        if (error.message.includes('404')) {
            errorText += `<br><small>⚠️ Эндпоинт не найден. Проверьте FastAPI сервер</small>`;
        } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            errorText += `<br><small>⚠️ Ошибка CORS. Проверьте консоль браузера (F12)</small>`;
        } else if (error.message.includes('422')) {
            errorText += `<br><small>⚠️ Ошибка валидации данных. Проверьте все поля</small>`;
        } else if (error.message.includes('409')) {
            errorText += `<br><small>⚠️ Пользователь с таким логином уже существует</small>`;
        }
        
        showMessage('registerMessage', errorText, 'error');
        
    } finally {
        // Всегда разблокируем кнопку
        button.disabled = false;
        button.textContent = 'Зарегистрироваться';
    }
    
    console.log('=== КОНЕЦ РЕГИСТРАЦИИ ===');
}

// Функция входа пользователя
async function login() {
    console.log('=== НАЧАЛО ВХОДА ===');
    
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!usernameInput || !passwordInput) {
        console.error('Не найдены поля формы входа');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const button = document.querySelector('#loginForm button.auth-btn');
    
    // Валидация
    if (!username || !password) {
        showMessage('loginMessage', '❌ Заполните все поля', 'error');
        return;
    }
    
    if (!button) {
        console.error('Не найдена кнопка входа');
        return;
    }
    
    // Блокируем кнопку
    button.disabled = true;
    button.textContent = '⏳ Вход...';
    
    showMessage('loginMessage', `⏳ Входим как ${username}...`, 'info');
    
    try {
        // Используем эндпоинт аутентификации
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                login: username,
                user_password: password
            })
        });
        
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Ошибка входа: ${response.status}`;
            
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (e) {
                // игнорируем ошибку парсинга
            }
            
            throw new Error(errorMessage);
        }
        
        // Парсим успешный ответ
        const data = await response.json();
        console.log('Успешный вход:', data);
        
        // Сохраняем токен в localStorage
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', username);
            
            showMessage('loginMessage', 
                `✅ <strong>Вход выполнен успешно!</strong><br>
                 Добро пожаловать, ${username}!`, 
                'success');
            
            // Перенаправляем на главную страницу через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            throw new Error('Токен не получен');
        }
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showMessage('loginMessage', `❌ Ошибка входа: ${error.message}`, 'error');
        
    } finally {
        // Разблокируем кнопку
        if (button) {
            button.disabled = false;
            button.textContent = 'Войти';
        }
    }
}

// Вспомогательная функция валидации формы регистрации
function validateRegistrationForm(name, login, age, password) {
    // Проверка обязательных полей
    if (!name || !login || !age || !password) {
        showMessage('registerMessage', '❌ Заполните все обязательные поля!', 'error');
        return false;
    }
    
    // Проверка длины имени
    if (name.length < 2) {
        showMessage('registerMessage', '❌ Имя должно содержать минимум 2 символа', 'error');
        return false;
    }
    
    // Проверка длины логина
    if (login.length < 3) {
        showMessage('registerMessage', '❌ Логин должен содержать минимум 3 символа', 'error');
        return false;
    }
    
    // Проверка пароля
    if (password.length < 6) {
        showMessage('registerMessage', '❌ Пароль должен содержать минимум 6 символов', 'error');
        return false;
    }
    
    // Проверка возраста
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        showMessage('registerMessage', '❌ Возраст должен быть числом от 0 до 120 лет', 'error');
        return false;
    }
    
    return true;
}

// Функция показа сообщений
function showMessage(elementId, text, type = 'info') {
    const message = document.getElementById(elementId);
    if (!message) {
        console.error(`Элемент с ID "${elementId}" не найден`);
        return;
    }
    message.innerHTML = text;
    message.className = `message-box ${type}`;
    message.style.display = 'block';
}

// Функция скрытия всех сообщений
function hideMessages() {
    const loginMsg = document.getElementById('loginMessage');
    const registerMsg = document.getElementById('registerMessage');
    
    if (loginMsg) loginMsg.style.display = 'none';
    if (registerMsg) registerMsg.style.display = 'none';
}

// Функция проверки доступности API
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            console.log('✅ API доступен');
            return true;
        } else {
            console.warn('⚠️ API ответил с ошибкой:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ API недоступен:', error.message);
        return false;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Страница авторизации загружена');
    
    // Проверяем доступность API
    const apiAvailable = await checkApiStatus();
    
    if (!apiAvailable) {
        const footer = document.querySelector('.footer');
        if (footer) {
            const warning = document.createElement('div');
            warning.className = 'api-warning';
            warning.innerHTML = `⚠️ API недоступен! Проверьте:<br>
                                1. Запущен ли FastAPI сервер<br>
                                2. Правильный ли порт: ${API_BASE_URL}<br>
                                3. Проверьте консоль сервера`;
            footer.appendChild(warning);
        }
    }
    
    // Добавляем обработчики клавиш
    document.addEventListener('keydown', function(e) {
        // Enter в форме входа
        if (e.target.id === 'loginPassword' && e.key === 'Enter') {
            login();
        }
        
        // Enter в форме регистрации (пароль или возраст)
        if ((e.target.id === 'registerPassword' || e.target.id === 'registerAge') && e.key === 'Enter') {
            register();
        }
    });
});