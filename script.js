document.getElementById('year').textContent = new Date().getFullYear();

const BUSINESS_WHATSAPP = '27671224121';
const WELLNESS_WHATSAPP = '27815348146';

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

// Route wellness enquiries directly to Nyatshikalanga's WhatsApp.
const wellnessLink = Array.from(document.querySelectorAll('a.card-link')).find(link =>
  link.textContent.toLowerCase().includes('wellness support')
);

if (wellnessLink) {
  const wellnessMessage = 'Hi Nyatshikalanga, I found BioFlexFitness online and I would like to enquire about Wellness & Psychosocial Support.';
  wellnessLink.href = `https://wa.me/${WELLNESS_WHATSAPP}?text=${encodeURIComponent(wellnessMessage)}`;
  wellnessLink.target = '_blank';
  wellnessLink.rel = 'noopener';
}

// Add the wellness contact to the footer alongside the main BioFlex contact details.
const footerContact = Array.from(document.querySelectorAll('.footer-grid > div')).find(section => {
  const heading = section.querySelector('strong');
  return heading?.textContent.trim().toLowerCase() === 'contact';
});

if (footerContact && !document.getElementById('wellnessWhatsappContact')) {
  const wellnessContact = document.createElement('a');
  wellnessContact.id = 'wellnessWhatsappContact';
  wellnessContact.href = `https://wa.me/${WELLNESS_WHATSAPP}?text=${encodeURIComponent('Hi Nyatshikalanga, I am contacting you from the BioFlexFitness website regarding wellness support.')}`;
  wellnessContact.target = '_blank';
  wellnessContact.rel = 'noopener';
  wellnessContact.textContent = 'Wellness WhatsApp: +27 81 534 8146';

  const businessWhatsApp = Array.from(footerContact.querySelectorAll('a')).find(link =>
    link.textContent.toLowerCase().includes('whatsapp')
  );

  if (businessWhatsApp) {
    businessWhatsApp.insertAdjacentElement('afterend', wellnessContact);
  } else {
    footerContact.appendChild(wellnessContact);
  }
}

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

  const isWellnessEnquiry = service.toLowerCase().includes('wellness') || service.toLowerCase().includes('psychosocial');
  const destinationNumber = isWellnessEnquiry ? WELLNESS_WHATSAPP : BUSINESS_WHATSAPP;
  const greeting = isWellnessEnquiry
    ? 'Hi Nyatshikalanga, I submitted a wellness enquiry on the BioFlexFitness website.'
    : 'Hi BioFlexFitness, I submitted an enquiry on the website.';

  const whatsappMessage = [
    greeting,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    whatsapp ? `WhatsApp: ${whatsapp}` : null,
    `Service: ${service}`,
    `Goal: ${goal}`
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://wa.me/${destinationNumber}?text=${encodeURIComponent(whatsappMessage)}`;

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
    const destinationLabel = isWellnessEnquiry ? 'Nyatshikalanga on WhatsApp' : 'BioFlex on WhatsApp';
    formStatus.style.display = 'block';
    formStatus.innerHTML = relayAccepted
      ? `<strong>Thanks, ${escapeHtml(name)}.</strong><br>Your enquiry was submitted. For the fastest response, continue with ${destinationLabel}.<br><br><a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Continue on WhatsApp</a>`
      : `<strong>Your details are ready.</strong><br>The email relay could not be confirmed, so please send the enquiry directly to ${destinationLabel}. Your details are already filled in for you.<br><br><a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Send on WhatsApp</a>`;
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
