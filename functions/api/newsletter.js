import { escapeHtml, isBot, isValidEmail, sendEmail, jsonBody } from '../_lib/resend.js';

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonBody(400, { error: 'invalid_json' });
  }

  if (isBot(data)) return jsonBody(200, { ok: true });

  const { email } = data;
  if (!isValidEmail(email)) return jsonBody(400, { error: 'missing_fields' });

  const html = `<p>Nouvelle inscription à la newsletter :</p><p><strong>${escapeHtml(email)}</strong></p>`;

  const sent = await sendEmail(env, {
    subject: 'Nouvelle inscription newsletter',
    html,
    replyTo: email,
  });

  return sent ? jsonBody(200, { ok: true }) : jsonBody(502, { error: 'send_failed' });
}
