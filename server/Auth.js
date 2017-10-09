var Auth = (function() {
  var getAccessToken = function() {
    return localStorage.getItem('pa_token');
  }

  var setAccessToken = function(token){
    localStorage.setItem('pa_token', token);
  }

  var getUserInfo = function(){
    return JSON.parse(localStorage.getItem('user_info'));
  }

  var setUserInfo = function(name, id) {
    let userInfo = {
      name: name,
      id: id
    }
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }

  return {
    getUserInfo: getUserInfo,
    serUserInfo: setUserInfo,
    getAccessToken: getAccessToken,
    setAccessToken: setAccessToken
  }
})();