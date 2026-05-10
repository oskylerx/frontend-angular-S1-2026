import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordRules } from '../utils/password.validators';

@Component({
  selector: 'app-password-checklist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="checklist">
      <li [class.ok]="rules.minLength">Minimo 8 caracteres</li>
      <li [class.ok]="rules.hasUppercase">Al menos una mayuscula</li>
      <li [class.ok]="rules.hasLowercase">Al menos una minuscula</li>
      <li [class.ok]="rules.hasNumber">Al menos un numero</li>
      <li [class.ok]="rules.hasSpecial">Al menos un caracter especial</li>
    </ul>
  `,
  styles: [`
    .checklist { margin: 0.4rem 0 0; padding-left: 1.1rem; font-size: 0.82rem; color: #7f8c8d; }
    .checklist li { margin: 0.2rem 0; }
    .checklist li.ok { color: #1d8348; font-weight: 600; }
  `]
})
export class PasswordChecklistComponent {
  @Input() rules: PasswordRules = {
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false
  };
}
