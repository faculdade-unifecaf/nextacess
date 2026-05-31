import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER ?? '',
    pass: process.env.GMAIL_APP_PASSWORD ?? '',
  },
});

export interface VisitanteQRPayload {
  to: string;
  nome: string;
  empresa: string;
  andar: string | number;
  sala: string;
  data_visita: string;
  hora_prevista?: string | undefined;
  qr_token: string;
  qrBuffer: Buffer;
}

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export const sendVisitanteQR = (p: VisitanteQRPayload) => {
  const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@nextaccess>`;
  return transporter.sendMail({
    from:      `"NextAccess" <${process.env.GMAIL_USER}>`,
    to:        p.to,
    replyTo:   process.env.GMAIL_USER,
    subject:   `Seu acesso foi aprovado — ${p.empresa}`,
    messageId: msgId,
    headers: {
      'X-Priority':       '3',
      'X-Mailer':         'NextAccess Mailer',
      'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
    },
    text: buildText(p),
    html: buildHtml(p),
    attachments: [{
      filename:           'qrcode.png',
      content:            p.qrBuffer,
      contentType:        'image/png',
      contentDisposition: 'inline',
      cid:                'qrcode@nextaccess',
    }],
  });
};

function buildText(p: VisitanteQRPayload): string {
  const data = fmtDate(p.data_visita);
  return [
    `Olá, ${p.nome}!`,
    '',
    'Seu acesso foi aprovado. Apresente o QR Code na catraca de entrada no dia da visita.',
    '',
    `Empresa: ${p.empresa}`,
    `Localização: ${p.andar}º andar · Sala ${p.sala}`,
    `Data da visita: ${data}`,
    p.hora_prevista ? `Horário previsto: ${p.hora_prevista}` : '',
    '',
    `Código de acesso: ${p.qr_token.slice(0, 8).toUpperCase()}`,
    '',
    'Abra este email no celular e apresente o QR Code na catraca.',
    '',
    '© 2026 NextAccess',
  ].filter(Boolean).join('\n');
}

function buildHtml(p: VisitanteQRPayload): string {
  const data = fmtDate(p.data_visita);
  const horario = p.hora_prevista
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">Horário previsto</td>
        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9">${p.hora_prevista}</td>
       </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Acesso aprovado — NextAccess</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
  Olá ${p.nome}, seu acesso para ${p.empresa} foi aprovado. Apresente o QR Code na catraca. ‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#060608 0%,#0d0d1a 100%);padding:32px 40px;text-align:center">
    <div style="display:inline-block;background:rgba(76,158,255,0.12);border:1px solid rgba(76,158,255,0.25);border-radius:8px;padding:6px 14px;margin-bottom:16px">
      <span style="font-size:9px;font-weight:700;letter-spacing:3px;color:#4c9eff;text-transform:uppercase">Sistema de Controle de Acesso</span>
    </div>
    <div style="font-size:26px;font-weight:900;letter-spacing:4px;color:#ffffff;line-height:1">NEXTACCESS</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px 28px">

    <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.2">Olá, ${p.nome}!</p>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7">
      Seu acesso foi <strong style="color:#16a34a">aprovado</strong>. Apresente o QR Code abaixo na <strong style="color:#0f172a">catraca de entrada</strong> no dia da visita.
    </p>

    <!-- Info card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:28px">
      <tr><td style="padding:20px 24px">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8">Detalhes da visita</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">Empresa</td>
            <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9">${p.empresa}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">Localização</td>
            <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9">${p.andar}º andar · Sala ${p.sala}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b${p.hora_prevista ? ';border-bottom:1px solid #f1f5f9' : ''}">Data da visita</td>
            <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right${p.hora_prevista ? ';border-bottom:1px solid #f1f5f9' : ''}">${data}</td>
          </tr>
          ${horario}
        </table>
      </td></tr>
    </table>

    <!-- QR Code — CID inline renderizado no corpo do email -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="background:linear-gradient(135deg,#0a0a12 0%,#0d0d1a 100%);border-radius:18px;padding:36px 24px;border:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0 0 4px;font-size:9px;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:#4c9eff">QR Code de Acesso</p>
        <p style="margin:0 0 20px;font-size:11px;color:rgba(255,255,255,0.35)">Apresente na catraca de entrada</p>
        <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:10px;line-height:0">
          <img src="cid:qrcode@nextaccess" width="220" height="220" alt="QR Code de acesso NextAccess" style="display:block;border-radius:6px">
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);font-family:'Courier New',Courier,monospace;letter-spacing:.18em">${p.qr_token.slice(0, 8).toUpperCase()}</p>
      </td></tr>
    </table>

    <!-- Dica -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">
      <tr><td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px">
        <p style="margin:0;font-size:12px;color:#166534;line-height:1.6">
          <strong>Dica:</strong> abra este email no celular e apresente o QR Code diretamente na catraca. Não é necessário imprimir.
        </p>
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center">
    <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;line-height:1.6">
      Você recebeu este email porque se cadastrou como visitante no NextAccess.<br>
      Se não foi você, ignore esta mensagem.
    </p>
    <p style="margin:0;font-size:11px;color:#cbd5e1">© 2026 NextAccess · Todos os direitos reservados</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
