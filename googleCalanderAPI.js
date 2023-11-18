const { google } = require('googleapis');
console.log("point0");
const fs = require('fs');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');
console.log("point1");
// Load client secrets from a file you downloaded from the Google Cloud Console
const credentials = JSON.parse(fs.readFileSync("C:/Users/mesit/Downloads/noble-trainer-405319-13137c8f9cd7.json"));
console.log("point0.5");
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
console.log("point2");
// Authorize a client with credentials
async function authorize() {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
console.log("point3"); 
  // Check if we have previously stored a to cken
  try {
    const token = fs.readFileSync('token.json');
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

// Get a new token
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });

  const token = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(token);

  // Store the token for later use
  fs.writeFileSync('token.json', JSON.stringify(token));
  console.log('Token stored to', 'token.json');

  return oAuth2Client;
}

// Example function to list upcoming events
async function listUpcomingEvents() {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error:', err);

    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming events:');
      events.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

// Run the example function
listUpcomingEvents();
