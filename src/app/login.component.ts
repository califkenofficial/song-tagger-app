import { Component, OnInit } from '@angular/core';
import { Router }    from '@angular/router';

import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [`#login{margin-top: 200px; text-align:center}`]
})
export class LoginComponent {
  constructor(private loginService: LoginService) { }

  // ngOnInit() {
  //   this.loginService.login();
  // }
}
