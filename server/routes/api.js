const express = require('express');
const session = require('express-session');
const router = express.Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

let Tag = require('../../data/db');

//mongoose.connect('mongodb://localhost/test');


const client_id = process.env.MYAPIKEY; // Your client id
const client_secret = process.env.MYAPISECRET; // Your secret
const redirect_uri = 'http://localhost:3000/api/callback'; // Your redirect uri

let generateRandomString = function(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = 'spotify_auth_state';
let sess;

router.use(cookieParser());
/* GET api listing. */
router.get('/', (req, res) => {
  sess.user;
  sess.access;
  res.send('api works');
});

router.get('/login', (req, res) => {
  sess = req.session;
  //Session set when user Request our app via URL
  if(sess.access) {
    res.redirect('/tagged_songs');
  } else {
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    let scope = 'user-read-private user-read-email playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
    );
  } 
});

router.get('/callback', (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter
  sess = req.session;
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, (error, response, body) =>{
      if (!error && response.statusCode === 200) {

        let access_token = body.access_token,
            refresh_token = body.refresh_token;
        sess.access = access_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {  
          sess.picture = body.images[0].url;
          sess.user = body.display_name;
          sess.save(function (err) {
            if (err) return next(err)
             res.redirect('/tagged_songs');
          })
        });
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

router.get('/refresh_token', (req, res) => {

  // requesting access token from refresh token
  let refresh_token = req.query.refresh_token;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.get('/user_playlists', (req, res) => {
  sess = req.session;
  let options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers : { 'Authorization': 'Bearer ' + sess.access},
    json: true
  };

  request.get(options, (error, response, body) => {
    res.status(200).json(body.items);
  })
});

router.get('/playlist_songs/:user_id/:playlist_id', (req, res) => {
  sess = req.session;
  let user_id = req.params.user_id;
  let playlist_id = req.params.playlist_id;
  let url = 'https://api.spotify.com/v1/users/'+user_id+'/playlists/'+playlist_id+'/tracks';
  let options = {
    url: url,
    headers : { 'Authorization': 'Bearer ' + sess.access},
    json: true
  };

  request.get(options, (error, response, body) => {
    res.status(200).json(body.items);
  })
});

router.get('/playlist_songs/:track_id/', (req, res) => {
  sess = req.session;
  let track_id = req.params.track_id;
  let url = 'https://api.spotify.com/v1/tracks/'+track_id;
  let options = {
    url: url,
    headers : { 'Authorization': 'Bearer ' + sess.access},
    json: true
  };

  request.get(options, (error, response, body) => {
    console.log(body);
    res.status(200).json(body);
  })
});

router.get('/tags/:song_id', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  //console.log(req.body);
})

router.post('/tags/:song_id', (req, res, next) => {
  //console.log("in api", req.params.song_id, req.body);
  sess = req.session;
  var songId = req.params.song_id;
  var tags = req.body;
  var errors = [];

  tags.forEach(function(tag, idx, array){
    if (!tag.text) {
      res.status(400);
      res.json({
          "error": "Invalid Data"
      });
    } else {
      var newTag = Tag({
        user: sess.user,
        picture: sess.picture,
        songId: songId,
        position: tag.position.currentPosition,
        text: tag.text,
        time: tag.position.time
      });
      console.log(newTag)
      newTag.save(function(err) {
        if (err) {
            errors.push(err)
        }
        if(idx === array.length-1){
          if(errors.length > 0) {
            res.status(400).send("unable to save to database");
          } else {
            res.status(200).send("Saved!");
          }
        }
      })
    }
  }) 
});

router.get('/tagged_songs', (req, res) => {
  sess = req.session;
  Tag.aggregate([
     {$group: { _id: "$songId"}}
  ])
  .then(items => {
    let tracks = items.map(function(obj){ return obj._id });
    let url = 'https://api.spotify.com/v1/tracks/?ids='+tracks;
    let options = {
      url: url,
      headers : { 'Authorization': 'Bearer ' + sess.access},
      json: true
    };
    request.get(options, (error, response, body) => {
      console.log(body);
      res.status(200).json(body);
    })
  });
});

router.get('/tagged_song/:song_id', (req, res) => {

  var song_id = req.params.song_id;
  Tag.find({songId: song_id }, function (err, tags) {
    if(err){
      console.log(err);
    } else{
      res.status(200).json(tags);
    } 
  });
});
module.exports = router;