/**
 * True Impact Philanthropy - WordPress REST API Dynamic Blog Loader
 * Combines live WordPress articles with the 5 foundational site articles.
 */

const WP_API_URL = 'https://trueimpactphilanthropy.cloudgenz.com/wp-json/wp/v2';

const staticArticles = [
  {
    id: 'static-1',
    title: 'How Much Does a Fundraising Consultant Cost in Canada?',
    excerpt: 'There is no single correct fee because the scope can range from a focused strategy session to months of fractional leadership. The better question is what level of problem you are asking the consultant to solve.',
    category: 'Fundraising Strategy',
    readTime: '5 min read',
    date: 'August 2026',
    link: 'how-much-fundraising-consultant-cost-canada.html',
    isStatic: true
  },
  {
    id: 'static-2',
    title: 'What Is a Fractional Fundraising Director?',
    excerpt: 'A fractional fundraising director provides senior fundraising leadership on a part-time or contracted basis. The organization gains strategic expertise without immediately carrying the cost and commitment of a full-time executive hire.',
    category: 'Fractional Leadership',
    readTime: '6 min read',
    date: 'August 2026',
    link: 'what-is-fractional-fundraising-director.html',
    isStatic: true
  },
  {
    id: 'static-3',
    title: 'How to Build a Fundraising Strategy for a Small Nonprofit',
    excerpt: 'Small nonprofits often try to do too much: grants, events, corporate outreach, major gifts, social media campaigns and donor appeals, all at once. A useful strategy begins by choosing where not to spend limited capacity.',
    category: 'Fundraising Strategy',
    readTime: '7 min read',
    date: 'August 2026',
    link: 'build-fundraising-strategy-small-nonprofit.html',
    isStatic: true
  },
  {
    id: 'static-4',
    title: 'Why Corporate Sponsorship Requests Fail',
    excerpt: 'Many sponsorship requests begin with what the nonprofit needs: a dollar amount, an event and a list of logo benefits. The company is left to figure out why the opportunity matters to them.',
    category: 'Corporate Partnerships',
    readTime: '5 min read',
    date: 'August 2026',
    link: 'why-corporate-sponsorship-requests-fail.html',
    isStatic: true
  },
  {
    id: 'static-5',
    title: 'Fundraising Consultant vs. Development Director: Which Do You Need?',
    excerpt: 'A permanent fundraising hire makes sense when the organization has enough ongoing work, leadership support, budget, systems and strategic clarity to sustain the role. A consultant can make more sense when the organization first needs diagnosis, strategy, specialized expertise or temporary senior leadership.',
    category: 'Nonprofit Leadership',
    readTime: '6 min read',
    date: 'August 2026',
    link: 'fundraising-consultant-vs-development-director.html',
    isStatic: true
  }
];

window.allCombinedArticles = [...staticArticles];

document.addEventListener('DOMContentLoaded', () => {
  initBlogFeed();
  initSingleArticle();
});

/**
 * Initialize dynamic blog feed on philanthropy.html
 */
async function initBlogFeed() {
  const blogContainer = document.getElementById('dynamic-blog-grid');
  const categoryFilters = document.getElementById('blog-category-filters');
  const searchInput = document.getElementById('blog-search-input');
  
  if (!blogContainer) return;

  try {
    const res = await fetch(`${WP_API_URL}/posts?_embed=1&per_page=50&_=${Date.now()}`);
    if (res.ok) {
      const wpPosts = await res.json();
      
      // Normalize WP posts (exclude placeholder default "Hello world" post with ID 1 if desired)
      const normalizedWpPosts = wpPosts
        .filter(p => p.id !== 1 || wpPosts.length === 1)
        .map(post => {
          const title = post.title?.rendered || 'Untitled Article';
          const excerpt = post.excerpt?.rendered ? stripHtml(post.excerpt.rendered).substring(0, 180) + '...' : '';
          const date = formatDate(post.date);
          const slug = post.slug;
          const link = `article.html?slug=${slug}`;
          
          let mediaUrl = '';
          if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            mediaUrl = post._embedded['wp:featuredmedia'][0].source_url;
          }

          let category = 'Philanthropy & Strategy';
          if (post._embedded?.['wp:term']?.[0]?.[0]?.name) {
            category = post._embedded['wp:term'][0][0].name;
          }

          const words = stripHtml(post.content?.rendered || '').split(/\s+/).length;
          const readTime = Math.max(1, Math.round(words / 200)) + ' min read';

          return {
            id: `wp-${post.id}`,
            title,
            excerpt,
            category,
            readTime,
            date,
            link,
            mediaUrl,
            isWp: true
          };
        });

      // Merge: Newest WordPress posts FIRST, followed by the 5 permanent foundational articles!
      window.allCombinedArticles = [...normalizedWpPosts, ...staticArticles];
    }
  } catch (err) {
    console.log('WordPress API note: displaying static articles.', err);
    window.allCombinedArticles = [...staticArticles];
  }

  renderArticles(window.allCombinedArticles, blogContainer);
  setupCategories(window.allCombinedArticles, categoryFilters, blogContainer);
  setupSearch(searchInput, blogContainer);
}

const POSTS_PER_PAGE = 6;
let currentBlogPage = 1;
let currentArticlesList = [];

/**
 * Render article cards with dynamic pagination
 */
function renderArticles(articles, container, page = 1) {
  if (!container) return;
  currentArticlesList = articles || [];
  currentBlogPage = page;

  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="lead" style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 3rem 0;">No articles found matching your search.</p>';
    updatePaginationControls(0, 1, container);
    return;
  }

  const totalPages = Math.ceil(articles.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const pagedArticles = articles.slice(startIndex, startIndex + POSTS_PER_PAGE);

  container.innerHTML = pagedArticles.map(art => {
    return `
      <article class="blog-card ${art.mediaUrl ? 'has-image' : ''}">
        ${art.mediaUrl ? `<div class="blog-card-img"><img src="${art.mediaUrl}" alt="${art.title}" loading="lazy"></div>` : ''}
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-category-badge">${art.category}</span>
            <span class="blog-read-time">${art.readTime}</span>
          </div>
          <h3><a href="${art.link}">${art.title}</a></h3>
          <p>${art.excerpt}</p>
          <div class="blog-card-footer">
            <span class="blog-date">${art.date}</span>
            <a class="read-link" href="${art.link}">Read article →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  updatePaginationControls(totalPages, page, container);
}

/**
 * Update pagination UI controls
 */
function updatePaginationControls(totalPages, currentPage, container) {
  let paginationWrap = document.getElementById('blog-pagination-controls');
  if (!paginationWrap) {
    paginationWrap = document.createElement('div');
    paginationWrap.id = 'blog-pagination-controls';
    paginationWrap.className = 'blog-pagination';
    container.parentNode.insertBefore(paginationWrap, container.nextSibling);
  }

  if (totalPages <= 1) {
    paginationWrap.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changeBlogPage(${currentPage - 1})">← Prev</button>`;

  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="changeBlogPage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changeBlogPage(${currentPage + 1})">Next →</button>`;

  paginationWrap.innerHTML = html;
}

window.changeBlogPage = function(newPage) {
  const container = document.getElementById('dynamic-blog-grid');
  renderArticles(currentArticlesList, container, newPage);
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Setup category filter buttons (Top 5 categories, cleanly presented)
 */
function setupCategories(articles, filterContainer, blogContainer) {
  if (!filterContainer) return;
  
  // Count frequency of each category (ignoring 'Uncategorized')
  const catCounts = {};
  articles.forEach(a => {
    if (a.category && a.category.toLowerCase() !== 'uncategorized') {
      catCounts[a.category] = (catCounts[a.category] || 0) + 1;
    }
  });

  // Get top 5 most popular categories
  const topCategories = Object.keys(catCounts)
    .sort((a, b) => catCounts[b] - catCounts[a])
    .slice(0, 5);

  filterContainer.innerHTML = `<button class="category-btn active" data-category="all">All Articles</button>` +
    topCategories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('');

  filterContainer.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const selected = e.target.dataset.category;
      if (selected === 'all') {
        renderArticles(window.allCombinedArticles, blogContainer, 1);
      } else {
        const filtered = window.allCombinedArticles.filter(a => (a.category || '').toLowerCase() === selected.toLowerCase());
        renderArticles(filtered, blogContainer, 1);
      }
    });
  });
}

/**
 * Setup search input filtering
 */
function setupSearch(searchInput, blogContainer) {
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!window.allCombinedArticles) return;
    
    const matched = window.allCombinedArticles.filter(a => {
      const title = (a.title || '').toLowerCase();
      const excerpt = (a.excerpt || '').toLowerCase();
      const category = (a.category || '').toLowerCase();
      return title.includes(q) || excerpt.includes(q) || category.includes(q);
    });
    renderArticles(matched, blogContainer, 1);
  });
}

/**
 * Initialize single article reader & comments
 */
async function initSingleArticle() {
  const articleContent = document.getElementById('single-article-content');
  if (!articleContent) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const postId = urlParams.get('id');

  if (!slug && !postId) {
    articleContent.innerHTML = `<div class="container" style="padding: 4rem 0;"><p class="lead">Article not specified. <a href="philanthropy.html">Return to Let’s Talk Philanthropy</a></p></div>`;
    return;
  }

  try {
    let endpoint = slug ? `${WP_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=1` : `${WP_API_URL}/posts/${postId}?_embed=1`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Post not found');
    
    let post = await res.json();
    if (Array.isArray(post)) post = post[0];

    if (!post) throw new Error('Post not found');

    document.title = `${post.title.rendered} | Let’s Talk Philanthropy`;
    
    // Render full post
    renderSinglePost(post, articleContent);
    
    // Load comments
    loadComments(post.id);
    setupCommentForm(post.id);
  } catch (err) {
    console.error('Error fetching article:', err);
    articleContent.innerHTML = `
      <div class="container" style="padding: 5rem 0; text-align: center;">
        <h2>Article Unavailable</h2>
        <p class="lead">The requested article could not be loaded from WordPress at this moment.</p>
        <a class="btn btn-primary" href="philanthropy.html">Return to All Articles</a>
      </div>
    `;
  }
}

/**
 * Render single article layout
 */
function renderSinglePost(post, container) {
  const title = post.title.rendered;
  const content = post.content.rendered;
  const date = formatDate(post.date);
  
  let mediaUrl = '';
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    mediaUrl = post._embedded['wp:featuredmedia'][0].source_url;
  }

  let category = 'Philanthropy & Strategy';
  if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] && post._embedded['wp:term'][0][0]) {
    category = post._embedded['wp:term'][0][0].name;
  }

  const words = stripHtml(content).split(/\s+/).length;
  const readTime = Math.max(1, Math.round(words / 200)) + ' min read';

  container.innerHTML = `
    <article class="single-article">
      <header class="article-hero word-banner-hero">
        <div class="container">
          <div class="article-meta-top">
            <span class="blog-category-badge">${category}</span>
            <span class="article-date">${date}</span>
            <span class="article-read-time">${readTime}</span>
          </div>
          <h1>${title}</h1>
        </div>
      </header>

      <div class="container article-body-wrap">
        ${mediaUrl ? `<div class="article-featured-img"><img src="${mediaUrl}" alt="${title}"></div>` : ''}
        
        <div class="article-main-content">
          ${content}
        </div>

        <!-- Author Bio Card -->
        <div class="author-card">
          <img src="assets/marsha-home-profile.jpg" alt="Marsha Clyne, Founder & Principal Consultant">
          <div>
            <div class="eyebrow">Written by</div>
            <h3>Marsha Clyne</h3>
            <p class="author-title">Fundraising Strategist • Partnership Builder • Nonprofit Leader</p>
            <p>Marsha is the Founder and Principal Consultant of True Impact Philanthropy, helping mission-driven organizations strengthen fundraising, partnerships and sustainable leadership across Canada.</p>
            <div class="author-actions">
              <a class="btn btn-primary" href="contact.html#book">Book a Conversation</a>
              <a class="btn btn-secondary" href="about-true-impact.html">About Marsha</a>
            </div>
          </div>
        </div>

        <!-- Social Share Bar -->
        <div class="share-bar">
          <strong>Share this article:</strong>
          <div class="share-bar-buttons">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn linkedin">LinkedIn</a>
            <a href="mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(window.location.href)}" class="share-btn email">Email</a>
            <a href="https://wa.me/?text=${encodeURIComponent(title + ' ' + window.location.href)}" target="_blank" rel="noopener" class="share-btn whatsapp-share">WhatsApp</a>
            <button class="share-btn copy-link" onclick="navigator.clipboard.writeText(window.location.href); if (window.showNotification) showNotification('Article link copied to clipboard!');">Copy Link</button>
          </div>
        </div>

        <!-- Comments & Discussion Area -->
        <section class="comments-section" id="comments">
          <div class="comments-header">
            <div class="eyebrow">Join the discussion</div>
            <h2>Comments &amp; Reflections</h2>
            <p class="small-note">Comments are moderated to foster respectful and constructive discussions for the nonprofit community.</p>
          </div>

          <div id="comments-list" class="comments-list">
            <p class="loading-text">Loading comments...</p>
          </div>

          <div class="comment-form-wrap">
            <h3>Leave a Thought or Perspective</h3>
            <form id="article-comment-form" class="comment-form">
              <div class="form-row">
                <div>
                  <label for="comment-author">Your Name *</label>
                  <input type="text" id="comment-author" name="author_name" required placeholder="e.g. Sarah Jenkins">
                </div>
                <div>
                  <label for="comment-email">Your Email * (Will not be published)</label>
                  <input type="email" id="comment-email" name="author_email" required placeholder="sarah@example.org">
                </div>
              </div>
              <div>
                <label for="comment-content">Your Reflection or Question *</label>
                <textarea id="comment-content" name="content" rows="4" required placeholder="Share your experience, perspective or question..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Submit Comment for Moderation</button>
              <div id="comment-status" class="comment-status"></div>
            </form>
          </div>
        </section>

      </div>
    </article>
  `;
}

/**
 * Load approved comments for post
 */
async function loadComments(postId) {
  const listEl = document.getElementById('comments-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${WP_API_URL}/comments?post=${postId}&_=${Date.now()}`);
    const comments = await res.json();

    if (!comments || comments.length === 0) {
      listEl.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your perspective!</p>';
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-head">
          <strong>${c.author_name || 'Community Member'}</strong>
          <span class="comment-date">${formatDate(c.date)}</span>
        </div>
        <div class="comment-body">
          ${c.content.rendered}
        </div>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = '<p class="no-comments">Discussion is open. Share your perspective below.</p>';
  }
}

/**
 * Handle comment form submit
 */
/**
 * Handle comment form submit directly to WordPress
 */
function setupCommentForm(postId) {
  const form = document.getElementById('article-comment-form');
  const statusEl = document.getElementById('comment-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.innerHTML = '<span style="color: var(--emerald); font-weight: 600;">Submitting to WordPress...</span>';

    const authorName = document.getElementById('comment-author').value.trim();
    const authorEmail = document.getElementById('comment-email').value.trim();
    const commentContent = document.getElementById('comment-content').value.trim();

    // 1. Submit directly to WordPress native comment processor (wp-comments-post.php)
    const formData = new FormData();
    formData.append('comment_post_ID', postId);
    formData.append('author', authorName);
    formData.append('email', authorEmail);
    formData.append('comment', commentContent);
    formData.append('submit', 'Post Comment');

    try {
      // Post to native WordPress comment handler
      await fetch('https://trueimpactphilanthropy.cloudgenz.com/wp-comments-post.php', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      statusEl.innerHTML = '<div class="alert-success">Thank you!</div>';
      form.reset();

      // Immediately display the submitted comment below
      const listEl = document.getElementById('comments-list');
      if (listEl) {
        const noCommentsEl = listEl.querySelector('.no-comments');
        if (noCommentsEl) noCommentsEl.remove();

        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newCommentHtml = `
          <div class="comment-item new-comment">
            <div class="comment-head">
              <strong>${escapeHtml(authorName)}</strong>
              <span class="comment-date">${todayStr}</span>
            </div>
            <div class="comment-body">
              <p>${escapeHtml(commentContent)}</p>
            </div>
          </div>
        `;
        listEl.insertAdjacentHTML('beforeend', newCommentHtml);
      }
    } catch (err) {
      console.error('WordPress comment submission error:', err);
      statusEl.innerHTML = '<div class="alert-success">Thank you!</div>';
      form.reset();
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
