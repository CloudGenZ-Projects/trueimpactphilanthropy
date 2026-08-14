document.getElementById('healthCheck')?.addEventListener('submit', function(e){
  e.preventDefault();
  let total=0; const weak=[];
  const labels=['Fundraising strategy','Revenue diversification','Donor stewardship','Prospect pipeline','Corporate partnerships','Grant strategy','Board engagement','CRM & donor data','Case for support','Leadership & capacity'];
  for(let i=1;i<=10;i++){ const el=document.querySelector(`input[name="q${i}"]:checked`); if(!el) return; const v=Number(el.value); total+=v; if(v===0) weak.push(labels[i-1]); }
  const score=total*5;
  let title,copy;
  if(score<40){title='Significant Foundation Gaps';copy='Your organization has fundraising potential, but several foundational gaps may be limiting growth and creating unnecessary pressure on staff and leadership.';}
  else if(score<70){title='Promising, but Inconsistent';copy='You have important pieces in place, but inconsistent systems or priorities may be preventing fundraising from performing as strongly as it could.';}
  else if(score<90){title='Strong Foundation, Clear Growth Opportunities';copy='Your fundraising foundation is comparatively strong. The next opportunity is likely to come from sharper prioritization, stronger pipeline management and deeper relationship development.';}
  else {title='Mature Fundraising Foundation';copy='Your organization reports strong practices across most areas. A strategic review can help identify the next level of growth, efficiency and relationship development.';}
  document.getElementById('scoreNumber').textContent=score;
  document.getElementById('scoreTitle').textContent=title;
  document.getElementById('scoreCopy').textContent=copy;
  const priorities=document.getElementById('scorePriorities'); priorities.innerHTML='';
  (weak.length?weak.slice(0,4):['Revenue growth strategy','Pipeline optimization','Leadership alignment']).forEach(x=>{const d=document.createElement('div');d.className='check';d.textContent='Priority to review: '+x;priorities.appendChild(d)});
  const result=document.getElementById('healthResult'); result.hidden=false; result.scrollIntoView({behavior:'smooth',block:'start'});
  // Developer hook: replace with CRM/email API submission.
  const payload={name:document.getElementById('hc-name').value,email:document.getElementById('hc-email').value,organization:document.getElementById('hc-org').value,consent:document.getElementById('hc-consent').checked,score,weak};
  console.log('TIP_HEALTH_CHECK_LEAD',payload);
});