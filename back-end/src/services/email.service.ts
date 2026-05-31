import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export interface VisitanteQRPayload {
  to: string;
  nome: string;
  empresa: string;
  andar: string | number;
  sala: string;
  data_visita: string;
  hora_prevista?: string | undefined;
  qr_token: string;
  qrDataUrl: string;
}

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export const sendVisitanteQR = (p: VisitanteQRPayload) =>
  resend.emails.send({
    from: 'NextAccess <onboarding@resend.dev>',
    to: p.to,
    subject: `Seu QR Code de acesso — ${p.empresa}`,
    html: buildHtml(p),
  });

function buildHtml(p: VisitanteQRPayload): string {
  const data = fmtDate(p.data_visita);
  const horario = p.hora_prevista
    ? `<tr>
        <td style="padding:5px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Horário previsto</td>
        <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right">${p.hora_prevista}</td>
       </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08)">
  <tr><td style="background:linear-gradient(135deg,#060608 0%,#0d0d1a 100%);padding:36px 40px;text-align:center">
    <div style="font-size:24px;font-weight:900;letter-spacing:3px;color:#fff">NEXTACCESS</div>
    <div style="font-size:10px;color:#4c9eff;letter-spacing:4px;text-transform:uppercase;margin-top:4px">Sistema de Controle de Acesso</div>
  </td></tr>
  <tr><td style="padding:36px 40px 0">
    <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a">Olá, ${p.nome}!</p>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6">
      Seu cadastro foi recebido com sucesso. Apresente o QR Code abaixo na recepção no dia da visita para registrar sua <strong>entrada</strong> e <strong>saída</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:28px">
      <tr><td style="padding:22px 26px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Empresa</td>
            <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right">${p.empresa}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Localização</td>
            <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right">${p.andar}º andar · Sala ${p.sala}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Data da visita</td>
            <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;text-align:right">${data}</td>
          </tr>
          ${horario}
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="background:#0a0a12;border-radius:18px;padding:32px 24px">
        <div style="font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#4c9eff;margin-bottom:18px">QR Code de Acesso</div>
        <img src="${p.qrDataUrl}" width="200" height="200" alt="QR Code" style="display:block;border-radius:12px;background:#fff;padding:6px">
        <div style="margin-top:14px;font-size:11px;color:#475569;font-family:monospace;letter-spacing:.12em">${p.qr_token.slice(0, 8).toUpperCase()}</div>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.7">
      Este QR Code é válido por <strong>48 horas</strong> a partir do cadastro.<br>
      Apresente-o na recepção para registrar sua entrada e saída.
    </p>
  </td></tr>
  <tr><td style="padding:28px 40px;text-align:center">
    <p style="margin:0;font-size:11px;color:#cbd5e1">© 2026 NextAccess · Todos os direitos reservados</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
