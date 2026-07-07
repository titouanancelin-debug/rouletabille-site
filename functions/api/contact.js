import { escapeHtml, isBot, isValidEmail, sendEmail, jsonBody } from '../_lib/resend.js';

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonBody(400, { error: 'invalid_json' });
  }

  if (isBot(data)) return jsonBody(200, { ok: true });

  const { nom, email, objet, message } = data;
  if (!nom || !isValidEmail(email) || !message) {
    return jsonBody(400, { error: 'missing_fields' });
  }

  const html = `
    <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
    <p><strong>Email :</strong> ${escapeHtml(email)}</p>
    <p><strong>Objet :</strong> ${escapeHtml(objet || '—')}</p>
    <p><strong>Message :</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const result = await sendEmail(env, {
    subject: `Contact site — ${objet || 'Sans objet'}`,
    html,
    replyTo: email,
  });

  return result.ok ? jsonBody(200, { ok: true }) : jsonBody(502, { error: 'send_failed', detail: result.detail });
}
