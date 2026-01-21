// feed.js - Рыжая тема
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    document.getElementById('usernameDisplay').textContent = username;
    loadPosts();
    setupFilters();
});

function setupFilters() {
    document.getElementById('searchAuthor').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchPosts();
    });
    
    document.getElementById('searchTitle').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchPosts();
    });
    
    document.getElementById('sortDate').addEventListener('change', searchPosts);
}

async function loadPosts() {
    try {
        showLoading();
        const response = await fetch('http://127.0.0.1:8001/api/feed');
        
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else {
            showError('❌ Ошибка загрузки ленты');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('🌐 Нет связи с сервером');
    }
}

function showLoading() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="loading-message">
            <div style="font-size: 48px; margin-bottom: 20px;">🐾</div>
            Загружаем бобровые аукционы...
        </div>
    `;
}

async function searchPosts() {
    const author = document.getElementById('searchAuthor').value.trim();
    const title = document.getElementById('searchTitle').value.trim();
    const date = document.getElementById('searchDate').value;
    const sort = document.getElementById('sortDate').value;
    
    const filters = {};
    if (author) filters.author_name = author;
    if (title) filters.post_title = title;
    if (date) filters.creation_date = date;
    if (sort) filters.sort = sort;
    
    try {
        showLoading();
        const token = localStorage.getItem('authToken');
        
        let url = 'http://127.0.0.1:8001/api/search_post';
        const params = new URLSearchParams(filters).toString();
        if (params) url += '?' + params;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
            
            if (posts.length === 0) {
                const container = document.getElementById('postsContainer');
                container.innerHTML = `
                    <div class="empty-message">
                        <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                        По вашему запросу ничего не найдено
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Ошибка поиска:', error);
        showError('Ошибка при поиске');
    }
}

function resetFilters() {
    document.getElementById('searchAuthor').value = '';
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchDate').value = '';
    document.getElementById('sortDate').value = 'newest';
    loadPosts();
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <div style="font-size: 48px; margin-bottom: 20px;">🪵</div>
                Пока нет ни одного поста
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">${escapeHtml(post.author_name || post.author || 'Анонимный бобёр')}</div>
                <div class="post-date">${formatDate(post.created_at || post.creation_date)}</div>
            </div>
            
            <div class="post-title">${escapeHtml(post.title || post.post_title || 'Без названия')}</div>
            
            <div class="post-content">
                ${escapeHtml(post.content || post.description || 'Нет описания')}
            </div>
            
            <div class="post-footer">
                <div class="post-actions">
                    <button class="bid-btn" onclick="makeBid(${post.id})">
                        🏷️ Ставка
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function makeBid(postId) {
    alert(`🏷️ Ставка на пост #${postId}\nФункция ставок в разработке!`);
}

function formatDate(dateString) {
    if (!dateString) return 'Дата неизвестна';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function showError(message) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="empty-message" style="color: #ff6b6b;">
            ${escapeHtml(message)}
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Автообновление каждые 60 секунд
setInterval(loadPosts, 60000);