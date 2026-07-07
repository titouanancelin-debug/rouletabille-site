import { escapeHtml, isBot, isValidEmail, sendEmail, jsonBody } from '../_lib/resend.js';

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonBody(400, { error: 'invalid_json' });
  }

  if (isBot(data)) return jsonBody(200, { ok: true });

  const { atelier, nom, email } = data;
  if (!atelier || !nom || !isValidEmail(email)) {
    return jsonBody(400, { error: 'missing_fields' });
  }

  const html = `
    <p><strong>Atelier :</strong> ${escapeHtml(atelier)}</p>
    <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
    <p><strong>Email :</strong> ${escapeHtml(email)}</p>
  `;

  const result = await sendEmail(env, {
    subject: `Inscription atelier — ${atelier}`,
    html,
    replyTo: email,
  });

  return result.ok ? jsonBody(200, { ok: true }) : jsonBody(502, { error: 'send_failed', detail: result.detail });
}
