import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class ReadableTagService {

  constructor(private http: Http) { }
  // Get all posts from the API

  getAllTags() {
    return this.http.get('/api/tags/:song_id')
      .map(res => res.json());
  }

  saveTags(tags, song_id) {
    return this.http.post('/api/tags/'+song_id, tags);
  }

}
