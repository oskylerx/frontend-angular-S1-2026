import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class App implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Prueba corregida (ya no se duplica el /api)
    this.http.get(`${environment.apiUrl}/test-db`).subscribe({
      next: (res) => {
        console.log('✅ FRONTEND CONECTADO AL BACKEND EXITOSAMENTE:', res);
        alert('✅ Conexión con el backend en Render exitosa. Revisa la consola (F12).');
      },
      error: (err) => {
        console.error('❌ ERROR AL CONECTAR CON EL BACKEND:', err);
        alert('❌ Error al conectar. Revisa la consola (F12).');
      }
    });
  }
}