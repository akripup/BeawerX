// AJAX запросы к API
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        document.getElementById('content').innerHTML = 
            '<pre>' + JSON.stringify(users, null, 2) + '</pre>';
    } catch (error) {
        console.error('Error:', error);
    }
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadUsers);