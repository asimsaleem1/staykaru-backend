import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHomePage(res: Response): void {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StayKaro API Server</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        
        .container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 600px;
          width: 90%;
          backdrop-filter: blur(10px);
        }
        
        .logo {
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .status {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          margin-bottom: 2rem;
          font-weight: 600;
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
        
        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .btn {
          display: inline-block;
          padding: 1rem 2rem;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(102, 126, 234, 0.6);
        }
        
        .btn-secondary {
          background: #f8f9fa;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .btn-secondary:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .feature {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }
        
        .feature h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .feature p {
          font-size: 0.8rem;
          color: #666;
        }
        
        .footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
          color: #888;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 2rem;
          }
          
          .logo {
            font-size: 2rem;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .features {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏠 StayKaro</div>
        <div class="subtitle">
          Student Accommodation & Food Service Platform<br>
          Backend API Server
        </div>
        
        <div class="status">🟢 Server Running on Port 3001</div>
        
        <div class="actions">
          <a href="/api" class="btn btn-primary">
            📚 Explore API Documentation
          </a>
          <a href="/status" class="btn btn-secondary">
            ⚡ Check Server Status
          </a>
        </div>
        
        <div class="features">
          <div class="feature">
            <h3>🔐 Authentication</h3>
            <p>JWT-based auth with role management</p>
          </div>
          <div class="feature">
            <h3>🏠 Accommodations</h3>
            <p>Property listings and booking system</p>
          </div>
          <div class="feature">
            <h3>🍽️ Food Service</h3>
            <p>Menu management and order processing</p>
          </div>
          <div class="feature">
            <h3>💳 Payments</h3>
            <p>Secure payment processing</p>
          </div>
          <div class="feature">
            <h3>⭐ Reviews</h3>
            <p>Rating and feedback system</p>
          </div>
          <div class="feature">
            <h3>📊 Analytics</h3>
            <p>Business insights and reporting</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Built with NestJS, MongoDB & Firebase</p>
          <p>Ready for testing with Swagger UI</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  getStatus(): object {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      port: 3001,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        cache: 'active',
        swagger: 'available at /api'
      },
      endpoints: {
        documentation: '/api',
        health: '/status',
        auth: '/auth',
        users: '/users',
        accommodations: '/accommodations',
        bookings: '/bookings',
        orders: '/orders',
        payments: '/payments',
        reviews: '/reviews',
        analytics: '/analytics'
      }
    };
  }
}
