import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());

const GMAIL_USER = process.env.GMAIL_USER || 'elhadjibarry2001@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

app.post(['/api/contact', '/my_portfolio/api/contact'], async (req, res) => {
  const { nom, email, message } = req.body || {};

  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Veuillez renseigner tous les champs obligatoires (nom, email, message).' });
  }

  // Basic email syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Veuillez renseigner une adresse email valide.' });
  }

  if (!GMAIL_APP_PASSWORD) {
    console.error('Erreur: Variable GMAIL_APP_PASSWORD non configurée.');
    return res.status(500).json({ error: 'Configuration email non initialisée sur le serveur.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio - Contact" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: email,
      subject: `[Portfolio Contact] Nouveau message de ${nom}`,
      text: `Nouveau message reçu depuis le formulaire de contact du Portfolio :\n\nNom: ${nom}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
            .header { background: #080E1B; padding: 20px 24px; border-bottom: 2px solid #00F5D4; }
            .header h2 { margin: 0; color: #00F5D4; font-size: 1.25rem; }
            .header p { margin: 4px 0 0; color: #94a3b8; font-size: 0.85rem; }
            .body { padding: 24px; }
            .field { margin-bottom: 16px; }
            .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px; }
            .value { font-size: 1rem; color: #0f172a; font-weight: 500; }
            .msgBox { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; color: #334155; margin-top: 6px; }
            .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>Nouveau message de contact</h2>
              <p>Envoyé depuis le portfolio en ligne</p>
            </div>
            <div class="body">
              <div class="field">
                <div class="label">Expéditeur</div>
                <div class="value">${nom}</div>
              </div>
              <div class="field">
                <div class="label">Email de réponse</div>
                <div class="value"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Message</div>
                <div class="msgBox">${message}</div>
              </div>
            </div>
            <div class="footer">
              Ce message a été transmis via votre serveur portfolio AWS (Docker + Nodemailer).
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Votre message a été envoyé avec succès !' });
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email :", err);
    return res.status(500).json({ error: "Une erreur est survenue lors de l'envoi de l'email." });
  }
});

// Serve frontend static assets
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

app.use('/my_portfolio', express.static(distPath));
app.use(express.static(distPath));

// Fallback to index.html for SPA routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur portfolio en écoute sur http://0.0.0.0:${PORT}`);
});
