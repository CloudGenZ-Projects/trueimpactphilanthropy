const API_URL = 'https://formsubmit.cloudgenz.com';

/* Mobile Navigation Toggle */
const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav-links');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => nav?.classList.remove('open'));
});

/* Active Page Highlight */
(function() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.btn)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav-active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

/* Splash Screen / Loader (First time visit per session) */
(function() {
  if (sessionStorage.getItem('splash-shown')) return;
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = `
    <div class="splash-content">
      <img src="assets/true-impact-logo.png" alt="True Impact Philanthropy logo" class="splash-logo">
      <div class="splash-brand">True Impact Philanthropy</div>
      <div class="splash-tagline">Strategy • Partnerships • Growth</div>
      <div class="splash-spinner" aria-hidden="true"></div>
    </div>
  `;
  document.body.prepend(splash);
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    splash.classList.add('splash-fade');
    setTimeout(() => {
      splash.remove();
      document.body.style.overflow = '';
      sessionStorage.setItem('splash-shown', '1');
    }, 600);
  }, 2200);
})();

/* Timed CTA Popup Modal (Homepage only, after 6 seconds) */
(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path !== 'index.html' && path !== '') return;
  if (sessionStorage.getItem('popup-dismissed')) return;

  setTimeout(() => {
    if (sessionStorage.getItem('popup-dismissed')) return;
    const overlay = document.createElement('div');
    overlay.id = 'cta-popup-overlay';
    overlay.innerHTML = `
      <div class="cta-popup">
        <button class="cta-popup-close" aria-label="Close">&times;</button>
        <div class="cta-popup-eyebrow">Ready to strengthen your fundraising?</div>
        <h3 class="cta-popup-title">Let’s have a conversation.</h3>
        <p class="cta-popup-text">Book a free discovery call to discuss your organization's fundraising goals and find out how True Impact can help.</p>
        <a href="contact.html#book" class="btn btn-primary cta-popup-btn">Book a Discovery Conversation</a>
        <button class="cta-popup-later">Maybe later</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      overlay.classList.add('popup-visible');
    });

    function closePopup() {
      overlay.classList.remove('popup-visible');
      document.body.style.overflow = '';
      sessionStorage.setItem('popup-dismissed', '1');
      setTimeout(() => overlay.remove(), 350);
    }

    overlay.querySelector('.cta-popup-close')?.addEventListener('click', closePopup);
    overlay.querySelector('.cta-popup-later')?.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  }, 6000);
})();

/* Discovery / Contact Form Submission */
async function handleQualifiedSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Request a Conversation';
  
  const ids = ['name', 'org', 'email', 'website', 'budget', 'revenue', 'need', 'timeline', 'investment', 'message'];
  const values = Object.fromEntries(ids.map(id => [id, document.getElementById(id)?.value?.trim() || '']));
  
  if (!values.name || !values.email || !values.message) {
    alert('Please fill in all required fields (Name, Email, Message).');
    return false;
  }
  
  let alertBox = form.querySelector('.form-alert');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.className = 'form-alert';
    form.prepend(alertBox);
  }
  alertBox.style.display = 'none';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Request...';
  }

  const payload = {
    name: values.name,
    organization: values.org,
    email: values.email,
    website: values.website || 'N/A',
    operating_budget: values.budget,
    fundraising_revenue: values.revenue,
    need_help_with: values.need,
    start_timeline: values.timeline,
    investment_range: values.investment,
    biggest_challenge: values.message,
  };

  try {
    const response = await fetch(`${API_URL}/submit/trueimpact-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success !== false) {
      alertBox.className = 'form-alert success';
      alertBox.textContent = 'Thank you! Your discovery conversation request has been sent successfully. Marsha will be in touch shortly.';
      alertBox.style.display = 'block';
      form.reset();
    } else {
      throw new Error(result.message || 'Form submission failed.');
    }
  } catch (err) {
    console.error('Submission error:', err);
    alertBox.className = 'form-alert error';
    alertBox.textContent = err.message || 'Something went wrong while submitting. Please try again or reach out directly.';
    alertBox.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }

  return false;
}