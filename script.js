const toggle=document.querySelector('.mobile-toggle');
const nav=document.querySelector('.nav-links');
if(toggle&&nav){toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',nav.classList.contains('open'));});}
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

function handleQualifiedSubmit(e){
  e.preventDefault();
  const ids=['name','org','email','website','budget','revenue','need','timeline','investment','message'];
  const values=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)?.value||'']));
  const body=`Name: ${values.name}\nOrganization: ${values.org}\nEmail: ${values.email}\nWebsite: ${values.website}\nOperating budget: ${values.budget}\nFundraising revenue: ${values.revenue}\nNeed: ${values.need}\nTimeline: ${values.timeline}\nInvestment range: ${values.investment}\n\nBiggest challenge:\n${values.message}`;
  window.location.href=`mailto:mcmclyne@gmail.com?subject=${encodeURIComponent('Qualified Discovery Conversation Request - '+values.org)}&body=${encodeURIComponent(body)}`;
  return false;
}