import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PlaylistsService } from './playlists.service';
import { PlaylistSongsService } from './playlist_songs.service';
import { SongService } from './song.service';
import { Tag } from './Tag';


import { PlaylistsComponent } from './playlists.component';
import { PlaylistSongsComponent } from './playlist_songs.component';
import { SongComponent } from './song.component';
import { LoginComponent } from './login.component';
import { ReadableTagComponent } from './readable_tag.component';


const ROUTES = [
 {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' 
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'playlists',
    component: PlaylistsComponent,
  },
  {
    path: 'playlist_songs/:user_id/:playlist_id',
    component: PlaylistSongsComponent,
  },
   {
    path: 'song/:track_id',
    component: SongComponent,
  }
];

@NgModule({
  declarations: [
    AppComponent,
    PlaylistsComponent,
    PlaylistSongsComponent,
    SongComponent,
    LoginComponent,
    ReadableTagComponent
  ],
  entryComponents: [ReadableTagComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
  ],
  providers: [
    PlaylistsService,
    PlaylistSongsService,
    SongService,
    Tag
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
