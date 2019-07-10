const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const express = require('express');
const socketIo = require('socket.io');
const _ = require('lodash');
const updateFiles = require('./update-files');
const store = require('./store');
const dispatcher = require('./dispatcher');

const app = express();
const server = http.Server(app);
const io = socketIo.listen(server);
store.set('io', io);
const port = _.toInteger(process.env.PORT) || 3000;
store.set('port', port);
const slidePath = path.join(__dirname, '..', 'static', 'slides');
store.set('slidePath', slidePath);
store.set('timerSec', _.toInteger(process.env.TIMER_SEC) || 30);
store.set('pass', process.env.PASS || '');


fs.watch(slidePath, {}, updateFiles);

app.use('/', express.static(path.join(__dirname, '..', 'static')));

server.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

io.on('connection', (socket) => {
  console.log('socket.io connect socket.id: ', socket.id);
  socket.on('request-current-image', () => {
    const files = store.get('files');
    const currentlyShownImageName = store.get('currentlyShownImageName');
    const currentlyShownImageIndex = files.findIndex(row => row.filename === currentlyShownImageName);
    if (currentlyShownImageIndex !== -1) {
      socket.emit('reply-current-image', files[currentlyShownImageIndex]);
    }
  });
  socket.on('slide-next', (payload) => {
    const pass = store.get('pass');
    if (pass.length === 0) {
      console.log('admin pass not set, so admin features disabled');
      return;
    }
    const urlObj = url.parse(payload.href);
    const params = querystring.parse(urlObj.query);
    const password = params._;
    if (_.toLower(pass) === password) {
      dispatcher.next();
    }
  });
  socket.on('slide-back', (payload) => {
    const pass = store.get('pass');
    if (pass.length === 0) {
      console.log('admin pass not set, so admin features disabled');
      return;
    }
    const urlObj = url.parse(payload.href);
    const params = querystring.parse(urlObj.query);
    const password = params._;
    if (_.toLower(pass) === password) {
      dispatcher.back();
    }
  });
});

updateFiles();
