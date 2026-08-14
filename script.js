/* Mobile toggle */
const toggle=document.querySelector('.mobile-toggle');
const nav=document.querySelector('.nav-links');
if(toggle&&nav){toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',nav.classList.contains('open'));});}
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

/* Active page highlight */
(function(){
  const path=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a:not(.btn)').forEach(a=>{
    const href=a.getAttribute('href');
    if(href===path||(path==='index.html'&&href==='index.html')){
      a.classList.add('nav-active');
    }
  });
})();

/* Splash screen */
(function(){
  if(sessionStorage.getItem('splash-shown'))return;
  const splash=document.createElement('div');
  splash.id='splash-screen';
  splash.innerHTML=`
    <div class="splash-content">
      <img src="assets/logo.png" alt="True Impact Philanthropy" class="splash-logo">
      <div class="splash-brand">True Impact Philanthropy</div>
      <div class="splash-tagline">Strategy • Partnerships • Growth</div>
    </div>
  `;
  document.body.prepend(splash);
  document.body.style.overflow='hidden';
  setTimeout(()=>{
    splash.classList.add('splash-fade');
    setTimeout(()=>{
      splash.remove();
      document.body.style.overflow='';
      sessionStorage.setItem('splash-shown','1');
    },600);
  },3000);
})();

/* Get in Touch popup (homepage only, after 8 seconds) */
(function(){
  const path=window.location.pathname.split('/').pop()||'index.html';
  if(path!=='index.html'&&path!=='')return;
  if(sessionStorage.getItem('popup-dismissed'))return;

  setTimeout(()=>{
    if(sessionStorage.getItem('popup-dismissed'))return;
    const overlay=document.createElement('div');
    overlay.id='cta-popup-overlay';
    overlay.innerHTML=`
      <div class="cta-popup">
        <button class="cta-popup-close" aria-label="Close">&times;</button>
        <div class="cta-popup-eyebrow">Ready to strengthen your fundraising?</div>
        <h3 class="cta-popup-title">Let's have a conversation.</h3>
        <p class="cta-popup-text">Book a free discovery call to discuss your organization's fundraising goals and find out how True Impact can help.</p>
        <a href="contact.html#book" class="btn btn-primary cta-popup-btn">Book a Discovery Conversation</a>
        <button class="cta-popup-later">Maybe later</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';

    requestAnimationFrame(()=>{
      overlay.classList.add('popup-visible');
    });

    function closePopup(){
      overlay.classList.remove('popup-visible');
      document.body.style.overflow='';
      sessionStorage.setItem('popup-dismissed','1');
      setTimeout(()=>overlay.remove(),300);
    }

    overlay.querySelector('.cta-popup-close').addEventListener('click',closePopup);
    overlay.querySelector('.cta-popup-later').addEventListener('click',closePopup);
    overlay.addEventListener('click',(e)=>{
      if(e.target===overlay)closePopup();
    });
  },30000);
})();

/* Contact form handler */
function handleQualifiedSubmit(e){
  e.preventDefault();
  const ids=['name','org','email','website','budget','revenue','need','timeline','investment','message'];
  const values=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)?.value||'']));
  const body=`Name: ${values.name}\nOrganization: ${values.org}\nEmail: ${values.email}\nWebsite: ${values.website}\nOperating budget: ${values.budget}\nFundraising revenue: ${values.revenue}\nNeed: ${values.need}\nTimeline: ${values.timeline}\nInvestment range: ${values.investment}\n\nBiggest challenge:\n${values.message}`;
  window.location.href=`mailto:mcmclyne@gmail.com?subject=${encodeURIComponent('Qualified Discovery Conversation Request - '+values.org)}&body=${encodeURIComponent(body)}`;
  return false;
}
