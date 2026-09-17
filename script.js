document.getElementById('year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '✕' : '☰';
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) toggle.textContent = '☰';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const leadForm = document.getElementById('bioflexLeadForm');
const formStatus = document.getElementById('formStatus');

leadForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = leadForm.querySelector('.form-submit');
  const formData = new FormData(leadForm);

  if (String(formData.get('_honey') || '').trim()) return;

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const whatsapp = String(formData.get('whatsapp') || '').trim();
  const service = String(formData.get('service') || '').trim();
  const goal = String(formData.get('goal') || '').trim();

  const whatsappMessage = [
    'Hi BioFlexFitness, I submitted an enquiry on the website.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    whatsapp ? `WhatsApp: ${whatsapp}` : null,
    `Service: ${service}`,
    `Goal: ${goal}`
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://wa.me/27671224121?text=${encodeURIComponent(whatsappMessage)}`;

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  if (formStatus) {
    formStatus.style.display = 'none';
    formStatus.innerHTML = '';
  }

  let relayAccepted = false;

  try {
    const response = await fetch('https://formsubmit.co/ajax/bioflexfitnesspty@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    const result = await response.json().catch(() => ({}));
    relayAccepted = response.ok && (result.success === true || result.success === 'true');
  } catch (error) {
    relayAccepted = false;
  }

  if (formStatus) {
    formStatus.style.display = 'block';
    formStatus.innerHTML = relayAccepted
      ? `<strong>Thanks, ${escapeHtml(name)}.</strong><br>Your enquiry was submitted. For the fastest response, send the same details to us on WhatsApp.<br><br><a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Continue on WhatsApp</a>`
      : `<strong>Your details are ready.</strong><br>The email relay could not be confirmed, so please send the enquiry directly to BioFlex on WhatsApp. Your details are already filled in for you.<br><br><a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Send on WhatsApp</a>`;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  submitButton.disabled = false;
  submitButton.textContent = 'Send My Enquiry';
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
