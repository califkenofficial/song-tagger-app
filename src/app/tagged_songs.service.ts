import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class TaggedSongsService {

  constructor(private http: Http) { }
  // Get all posts from the API

  getAllTaggedSongs() {
    return this.http.get('/api/tagged_songs')
      .map(res => res.json());
  }
}