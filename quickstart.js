var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;

var SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'
];
var TOKEN_DIR = '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

fs.readFile('client_secret.json', (err, content) => {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  authorize(JSON.parse(content), sendMessage);
});

var getAccessToken = (oauth2Client, callback) => {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES
  });

  console.log('Visit the url: ', url);
  
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Enter the code here:', function(code) {
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        return callback(err);
      }
      oauth2Client.setCredentials(tokens);

      console.log('Oauth2 Token: ', tokens);

      callback(oauth2Client);
    });
  })
}

var authorize = (credentials, callback) => {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];

  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  getAccessToken(oauth2Client, callback);
}

var makeBody = (to, from, subject, message) => {
  var str = [
    "Content-Type: text/plain; charset=\"UTF-8\"\n",
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ", to, "\n",
    "from: ", from, "\n",
    "subject: ", subject, "\n\n",
    message
  ].join('');

  var encodedMail = new Buffer(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return encodedMail;
}

var sendMessage = (auth) => {
  var raw = makeBody("haithanh0809@gmail.com", "haithanh0809@gmail.com", "test subject", "test message");
  var gmail = google.gmail('v1');
  gmail.users.messages.send({
    auth:auth,
    userId: 'me',
    resource: {
      raw: raw
    }
  }, (err, resp) => {
    console.log(err || resp);
  })
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