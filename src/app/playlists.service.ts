import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class PlaylistsService {

  constructor(private http: Http) { }
  // Get all posts from the API

  getAllPlaylists() {
    return this.http.get('/api/user_playlists')
      .map(res => res.json());
  }
}


