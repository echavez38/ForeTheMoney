import nodemailer from 'nodemailer';
import type { User } from '@shared/schema';

// Email configuration
const createTransporter = async () => {
  // For development, create test account with Ethereal Email
  if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📧 Usando cuenta de prueba para emails:');
      console.log('Host:', testAccount.smtp.host);
      console.log('User:', testAccount.user);
      
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('Error creando cuenta de prueba:', error);
      // Fallback to Gmail configuration
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  // Production configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export class EmailService {
  private transporter: any = null;

  private async getTransporter() {
    if (!this.transporter) {
      this.transporter = await createTransporter();
    }
    return this.transporter;
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      const welcomeHtml = this.generateWelcomeEmailHtml(user);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@forethemoney.com',
        to: user.email,
        subject: '¡Bienvenido a Fore the Money! 🏌️‍♂️',
        html: welcomeHtml,
        text: this.generateWelcomeEmailText(user)
      };

      const info = await transporter.sendMail(mailOptions);
      
      // In development, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de bienvenida enviado a:', user.email);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview URL:', previewUrl);
        }
      }

      return true;
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      return false;
    }
  }

  private generateWelcomeEmailHtml(user: User): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Fore the Money</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 1.1em;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          font-size: 1.2em;
          margin-bottom: 30px;
          color: #2d3748;
        }
        .features {
          background-color: #f7fafc;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
        }
        .features h3 {
          color: #16a34a;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
          padding-left: 25px;
        }
        .feature-list li:last-child {
          border-bottom: none;
        }
        .feature-list li:before {
          content: "⛳";
          position: absolute;
          left: 0;
          color: #16a34a;
        }
        .user-info {
          background-color: #f0f9ff;
          border-left: 4px solid #22c55e;
          padding: 20px;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #1f2937;
          color: #9ca3af;
          padding: 30px;
          text-align: center;
          font-size: 0.9em;
        }
        .footer a {
          color: #22c55e;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏌️‍♂️ Fore the Money</h1>
          <p>Golf Scoring & Betting App</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <strong>¡Hola ${user.name}!</strong><br>
            ¡Bienvenido a Fore the Money! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de todas las funciones de nuestra aplicación de golf.
          </div>

          <div class="user-info">
            <h3>📋 Información de tu Cuenta</h3>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Handicap:</strong> ${user.handicap}</p>
            <p><strong>Tipo de Auth:</strong> ${user.authType === 'pin' ? 'PIN (6 dígitos)' : 'Contraseña'}</p>
          </div>

          <div class="features">
            <h3>🎯 Características Principales</h3>
            <ul class="feature-list">
              <li>Tarjetas de puntuación digitales para rondas de golf</li>
              <li>Sistema de apuestas con Stroke Play y Match Play</li>
              <li>Cálculos automáticos de handicap y puntuación neta</li>
              <li>Apuestas especiales: Oyeses, Side Bets, Press Bets</li>
              <li>Multijugador en tiempo real con códigos de sala</li>
              <li>Soporte para Club Campestre de Puebla y La Vista Country Club</li>
              <li>Análisis detallado de rendimiento y estadísticas</li>
              <li>Sistema de logros y seguimiento de progreso</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:5000'}" class="button">
              🚀 Comenzar a Jugar
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Consejos para Empezar</h4>
            <p style="color: #92400e; margin-bottom: 0;">
              1. <strong>Crea tu primera ronda</strong> desde el dashboard<br>
              2. <strong>Invita amigos</strong> usando códigos de sala para jugar en tiempo real<br>
              3. <strong>Configura las apuestas</strong> según tus preferencias<br>
              4. <strong>Disfruta del golf</strong> mientras la app calcula todo automáticamente
            </p>
          </div>
        </div>

        <div class="footer">
          <p>¡Gracias por unirte a Fore the Money!</p>
          <p>Para soporte técnico, contacta: <a href="mailto:support@forethemoney.com">support@forethemoney.com</a></p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 0.8em;">
            Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateWelcomeEmailText(user: User): string {
    return `
¡Hola ${user.name}!

¡Bienvenido a Fore the Money! Tu cuenta ha sido creada exitosamente.

INFORMACIÓN DE TU CUENTA:
- Nombre: ${user.name}
- Username: ${user.username}
- Email: ${user.email}
- Handicap: ${user.handicap}
- Tipo de Autenticación: ${user.authType === 'pin' ? 'PIN (6 dígitos)' : 'Contraseña'}

CARACTERÍSTICAS PRINCIPALES:
⛳ Tarjetas de puntuación digitales para rondas de golf
⛳ Sistema de apuestas con Stroke Play y Match Play
⛳ Cálculos automáticos de handicap y puntuación neta
⛳ Apuestas especiales: Oyeses, Side Bets, Press Bets
⛳ Multijugador en tiempo real con códigos de sala
⛳ Soporte para Club Campestre de Puebla y La Vista Country Club
⛳ Análisis detallado de rendimiento y estadísticas
⛳ Sistema de logros y seguimiento de progreso

CONSEJOS PARA EMPEZAR:
1. Crea tu primera ronda desde el dashboard
2. Invita amigos usando códigos de sala para jugar en tiempo real
3. Configura las apuestas según tus preferencias
4. Disfruta del golf mientras la app calcula todo automáticamente

¡Comenzar a Jugar: ${process.env.APP_URL || 'http://localhost:5000'}

¡Gracias por unirte a Fore the Money!

Para soporte técnico: support@forethemoney.com

---
Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.
    `;
  }
}

export const emailService = new EmailService();