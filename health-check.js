(function() {
  const API_URL = 'https://formsubmit.cloudgenz.com';

  document.getElementById('healthCheck')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Calculate My Score';
    
    let total = 0;
    const weak = [];
    const labels = [
      'Fundraising strategy',
      'Revenue diversification',
      'Donor stewardship',
      'Prospect pipeline',
      'Corporate partnerships',
      'Grant strategy',
      'Board engagement',
      'CRM & donor data',
      'Case for support',
      'Leadership & capacity'
    ];

    // Calculate score from 10 questions
    for (let i = 1; i <= 10; i++) {
      const el = document.querySelector(`input[name="q${i}"]:checked`);
      if (!el) {
        if (window.showNotification) {
          window.showNotification(`Please answer question ${i} to calculate your complete score.`, true);
        }
        const qBox = document.querySelector(`input[name="q${i}"]`)?.closest('.assessment-q');
        if (qBox) qBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const v = Number(el.value);
      total += v;
      if (v === 0) weak.push(labels[i - 1]);
    }

    const score = total * 5;
    let title = '';
    let copy = '';

    if (score < 40) {
      title = 'Significant Foundation Gaps';
      copy = 'Your organization has fundraising potential, but several foundational gaps may be limiting growth and creating unnecessary pressure on staff and leadership.';
    } else if (score < 70) {
      title = 'Promising, but Inconsistent';
      copy = 'You have important pieces in place, but inconsistent systems or priorities may be preventing fundraising from performing as strongly as it could.';
    } else if (score < 90) {
      title = 'Strong Foundation, Clear Growth Opportunities';
      copy = 'Your fundraising foundation is comparatively strong. The next opportunity is likely to come from sharper prioritization, stronger pipeline management and deeper relationship development.';
    } else {
      title = 'Mature Fundraising Foundation';
      copy = 'Your organization reports strong practices across most areas. A strategic review can help identify the next level of growth, efficiency and relationship development.';
    }

    // Update Score Elements in UI
    const scoreNumEl = document.getElementById('scoreNumber');
    const scoreTitleEl = document.getElementById('scoreTitle');
    const scoreCopyEl = document.getElementById('scoreCopy');
    const prioritiesEl = document.getElementById('scorePriorities');

    if (scoreNumEl) scoreNumEl.textContent = score;
    if (scoreTitleEl) scoreTitleEl.textContent = title;
    if (scoreCopyEl) scoreCopyEl.textContent = copy;

    if (prioritiesEl) {
      prioritiesEl.innerHTML = '';
      const displayWeak = weak.length ? weak.slice(0, 4) : ['Revenue growth strategy', 'Pipeline optimization', 'Leadership alignment'];
      displayWeak.forEach(item => {
        const d = document.createElement('div');
        d.className = 'check';
        d.textContent = 'Priority to review: ' + item;
        prioritiesEl.appendChild(d);
      });
    }

    const result = document.getElementById('healthResult');
    if (result) {
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Gather lead information
    const name = document.getElementById('hc-name')?.value?.trim() || 'Anonymous';
    const email = document.getElementById('hc-email')?.value?.trim() || 'Not provided';
    const organization = document.getElementById('hc-org')?.value?.trim() || 'Not specified';
    const consent = document.getElementById('hc-consent')?.checked ? 'Yes' : 'No';

    // Send Lead and Assessment Summary via NodeEmail Service
    const payload = {
      name: name,
      email: email,
      organization: organization,
      health_check_score: `${score} / 100`,
      foundation_category: title,
      identified_priorities: weak.length ? weak.join(', ') : 'None marked 0',
      subscribed_to_insights: consent
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Calculating & Saving...';
      }
      
      await fetch(`${API_URL}/submit/trueimpact-health-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Health check lead transmission note:', err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
})();