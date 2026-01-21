// feed.js

// Загрузка постов при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username') || 'Гость';
    document.getElementById('usernameDisplay').textContent = username;
    
    // Загрузка постов
    loadPosts();
});

// Загрузка постов с сервера
async function loadPosts() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://127.0.0.1:8001/feed', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else {
            showError('Ошибка загрузки постов');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить посты');
    }
}

// Отображение постов
function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                📭 Пока нет ни одного поста
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">${escapeHtml(post.author || 'Аноним')}</div>
                <div class="post-date">${formatDate(post.created_at)}</div>
            </div>
            
            <div class="post-content">
                ${escapeHtml(post.content || 'Нет описания')}
            </div>
            
            <div class="post-footer">
                <div class="post-price">${post.price ? escapeHtml(post.price) + ' ₽' : 'Цена не указана'}</div>
                <div class="post-actions">
                    <button class="bid-btn" onclick="makeBid(${post.id})">
                        Сделать ставку
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Поиск постов
async function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const container = document.getElementById('postsContainer');
    
    if (!searchTerm) {
        container.innerHTML = '<div class="loading-message">🔍 Введите поисковый запрос</div>';
        return;
    }
    
    container.innerHTML = '<div class="loading-message">🔎 Поиск постов...</div>';
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://127.0.0.1:8001/feed/search?q=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
            
            if (posts.length === 0) {
                container.innerHTML = `
                    <div class="empty-message">
                        🔍 По запросу "${escapeHtml(searchTerm)}" ничего не найдено
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Ошибка поиска:', error);
        showError('Ошибка при поиске');
    }
}

// Сделать ставку (заглушка)
function makeBid(postId) {
    alert(`Ставка на пост #${postId}\nФункция будет реализована позже`);
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Показать ошибку
function showError(message) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="empty-message" style="color: #ff6b6b;">
            ❌ ${escapeHtml(message)}
        </div>
    `;
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обновление постов каждые 30 секунд
setInterval(loadPosts, 30000);