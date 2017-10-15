import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class LoginService {

  constructor(private http: Http) { }
  // Get all posts from the API

  login() {
    console.log("here")
    return this.http.get('/login').map(_ => console.log("success"));
  }
}
