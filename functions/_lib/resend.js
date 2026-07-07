/* Envoi d'email via l'API Resend — utilisé par les fonctions functions/api/*.
   Nécessite les variables d'environnement RESEND_API_KEY, RESEND_FROM et
   CONTACT_TO_EMAIL, configurées dans le dashboard Cloudflare Pages
   (Settings > Environment variables).
   NB: un changement de variable d'environnement seul ne redéploie pas — il
   faut un nouveau build (push, ou "Retry" sur le DERNIER déploiement). */

export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email);
}

export async function sendEmail(env, { subject, html, replyTo }) {
  const payload = {
    from: env.RESEND_FROM,
    to: [env.CONTACT_TO_EMAIL],
    subject,
    html,
  };
  if (replyTo && isValidEmail(replyTo)) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (res.ok) return { ok: true };
  const detail = await res.text().catch(() => '');
  return { ok: false, status: res.status, detail };
}

/* Honeypot anti-spam : si ce champ caché est rempli, c'est un bot.
   On répond 200 sans rien envoyer, pour ne pas l'alerter. */
export function isBot(data) {
  return !!data['bot-field'];
}

export function jsonBody(status, body) {
  return new Response(JSON.stringify(body ?? {}), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
