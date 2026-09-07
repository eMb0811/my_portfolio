import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import nodemailer from 'nodemailer'

function contactApiDevPlugin() {
  return {
    name: 'contact-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const isContactApi = req.url === '/api/contact' || req.url?.endsWith('/api/contact');
        if (isContactApi && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { nom, email, message } = JSON.parse(body || '{}');
              if (!nom || !email || !message) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Tous les champs sont requis.' }));
              }

              const env = loadEnv('development', process.cwd(), '');
              const user = env.GMAIL_USER || 'elhadjibarry2001@gmail.com';
              const pass = env.GMAIL_APP_PASSWORD;

              if (!pass) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'GMAIL_APP_PASSWORD non configuré dans .env' }));
              }

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass },
              });

              await transporter.sendMail({
                from: `"Portfolio [Dev]" <${user}>`,
                to: user,
                replyTo: email,
                subject: `[Portfolio Contact] Nouveau message de ${nom}`,
                text: `Nom: ${nom}\nEmail: ${email}\n\nMessage:\n${message}`,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #00F5D4; background: #080E1B; padding: 12px 16px; border-radius: 8px;">Nouveau message depuis le Portfolio</h2>
                    <p><strong>Nom :</strong> ${nom}</p>
                    <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Message :</strong></p>
                    <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
                  </div>
                `,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, message: 'Votre message a été envoyé avec succès !' }));
            } catch (err) {
              console.error('Erreur API dev contact:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: "Erreur lors de l'envoi de l'email." }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), contactApiDevPlugin()],
  base: mode === 'docker' ? '/' : '/my_portfolio/',
}))