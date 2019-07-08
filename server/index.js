const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const _ = require('lodash');
const updateFiles = require('./update-files');
const store = require('./store');

const app = express();
const server = http.Server(app);
const io = socketIo.listen(server);
store.set('io', io);
const port = _.toInteger(process.env.PORT) || 3000;
store.set('port', port);
const slidePath = path.join(__dirname, '..', 'static', 'slides');
store.set('slidePath', slidePath);
store.set('timerMs', _.toInteger(process.env.TIMER_MS) || 30 * 1000);


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
});

updateFiles();
