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