import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-403',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Acceso Denegado</h2>
        <p class="error-message">
          No tienes permiso para acceder a este recurso. Contacta al administrador si crees que esto es un error.
        </p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn-primary">Ir al Dashboard</a>
          <a routerLink="/" class="btn-secondary">Ir al Inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
    }

    .error-code {
      font-size: 5rem;
      font-weight: bold;
      color: #e74c3c;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 1.75rem;
      color: #2c3e50;
      margin: 1rem 0;
    }

    .error-message {
      color: #7f8c8d;
      font-size: 1rem;
      line-height: 1.6;
      margin: 1.5rem 0;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      justify-content: center;
    }

    a {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }
  `]
})
export class Error403Component {}
