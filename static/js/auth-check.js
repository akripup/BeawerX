// Проверяем авторизацию при загрузке любой страницы
document.addEventListener('DOMContentLoaded', function() {
    // Страницы, которые не требуют авторизации
    const publicPages = ['auth.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    // Если это не публичная страница и пользователь не авторизован
    if (!publicPages.includes(currentPage) && 
        localStorage.getItem('isAuthenticated') !== 'true') {
        
        // Перенаправляем на страницу авторизации
        window.location.href = '../templates/auth.html';
    }
});