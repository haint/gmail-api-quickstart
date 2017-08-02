var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

fs.readFile('client_secret.json', (err, content) => {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  authorize(JSON.parse(content), listLabels);
});

var authorize = (credentials, callback) => {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];

  // console.log(credentials);
  // console.log(google.auth.OAuth2);

  // var auth = googleAuth();
  var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

var getNewToken = (oauth2Client, callback) => {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  })
}

var storeToken = (token) => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

var listLabels = (auth) => {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, (err, resp) => {
    if (err) {
      console.log('The API returned an error: ', err);
      return;
    }
    var labels = resp.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
    
  })
}