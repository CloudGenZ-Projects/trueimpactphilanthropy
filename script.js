// const FORM_ENDPOINT_EMAIL = 'mcmclyne@gmail.com'; 
const FORM_ENDPOINT_EMAIL = 'cloudgenz.dev@gmail.com'; 
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

/* Discovery / Contact Form Submission via FormSubmit */
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
    _subject: `New Discovery Conversation Request — ${values.org || values.name}`,
    _template: 'table',
    _captcha: 'false',
    Name: values.name,
    Organization: values.org,
    Email: values.email,
    Website: values.website || 'N/A',
    Operating_Budget: values.budget,
    Fundraising_Revenue: values.revenue,
    Need_Help_With: values.need,
    Start_Timeline: values.timeline,
    Investment_Range: values.investment,
    Biggest_Challenge: values.message,
    Submitted_At: new Date().toLocaleString()
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${FORM_ENDPOINT_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alertBox.className = 'form-alert success';
      alertBox.textContent = 'Thank you! Your discovery conversation request has been sent successfully. Marsha will be in touch shortly.';
      alertBox.style.display = 'block';
      form.reset();
    } else {
      throw new Error('Form submission failed.');
    }
  } catch (err) {
    console.warn('FormSubmit AJAX fallback to mailto:', err);
    const mailBody = `Name: ${values.name}\nOrganization: ${values.org}\nEmail: ${values.email}\nWebsite: ${values.website}\nOperating Budget: ${values.budget}\nFundraising Revenue: ${values.revenue}\nNeed: ${values.need}\nTimeline: ${values.timeline}\nInvestment: ${values.investment}\n\nBiggest Challenge:\n${values.message}`;
    window.location.href = `mailto:${FORM_ENDPOINT_EMAIL}?subject=${encodeURIComponent('Qualified Discovery Conversation Request - ' + values.org)}&body=${encodeURIComponent(mailBody)}`;
    
    alertBox.className = 'form-alert success';
    alertBox.textContent = 'Opening your email client to complete your discovery request...';
    alertBox.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }

  return false;
}