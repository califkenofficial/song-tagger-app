import { Component } from  "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {inject, TestBed, async } from  "@angular/core/testing";
import { PlaylistSongsComponent } from './playlist_songs.component';
import { PlaylistSongsService } from './playlist_songs.service';


describe('PlaylistSongs Component Test',() => {
  beforeEach(() => {
    let vActivedRoute = new ActivatedRoute();
    vActivedRoute.snapshot = {params:{}, url:null} as ActivatedRouteSnapshot;
    
    TestBed.configureTestingModule({
      declarations: [
      ],
      providers:[
        {provide:PlaylistSongsService,  useFactory: () => new MockPlaylistSongsService()},
        {provide:ActivatedRoute,  useFactory: () => vActivedRoute},
        {provide:Location,  useFactory: () => new MockLocation()},
        {provide:Router,  useFactory: () => new MockRouter()},
        PlaylistSongsComponent
      ] // --> new code
    });
    TestBed.compileComponents();
  });

  beforeEach(inject(
        [PlaylistSongsComponent, PlaylistSongsService, ActivatedRoute, Location, Router],
        (
            playlistSongsComponent: PlaylistSongsComponent,
            playlistService: MockPlaylistSongsService,
            location: MockLocation,
            routeParams: ActivatedRoute,
            tRouter: MockRouter) => {
            this.component = playlistSongsComponent;
            this.searchService = playlistService;
            this.location = location;
            this.routeParams = routeParams;
            this.routeParams.parameters = {};
            this.routeParams.snapshot = {params:{}};
            this.tRouter = tRouter;
        }
    ));

  xit("only calls 'getAllSavedSearches' function once during init method", () => {
    this.getAllPlaylistSongs = 0;
    //this.component.getAllPlaylistSongs = () =>  this.getAllPlaylistSongs += 1;

    this.routeParams.snapshot = {
        params: { 'user_id': '111', 'playlist_id': '1234'}
    };
    this.component.ngOnInit = () =>  this.getAllPlaylistSongs += 1;

    expect(this.getAllPlaylistSongs).toEqual(1);
  });


  class MockPlaylistSongsService extends PlaylistSongsService {
    constructor() {
        super(null);
    }
  }
  class MockActivatedRoute extends ActivatedRoute {
    constructor() {
        super();
    }
  }

  class MockLocation extends Location {
    constructor() {
        super(null);
    }
  }

  class MockRouter {
     public events: any;

    constructor() {
    }
  }
});