/* eslint-disable func-names, prefer-arrow-callback, wrap-iife */
/* global io */

(function () {
  function ready(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function updatePage(data) {
    if (data && data.url) {
      console.log(data.url);
    } else {
      console.log('socket.io did not send url. data: ', data);
      return;
    }
    const slideBoxImageEls = document.querySelectorAll('.slide-box img');
    let newImgEl;
    let oldImgEl;
    Array.prototype.forEach.call(slideBoxImageEls, function (element) {
      if (element.classList.contains('visible')) {
        oldImgEl = element;
        return;
      }
      newImgEl = element;
    });
    newImgEl.setAttribute('src', data.url);
    if (oldImgEl) {
      if (newImgEl.src === oldImgEl.src) {
        return;
      }
      oldImgEl.classList.remove('visible');
    }
    newImgEl.classList.add('visible');
  }


  function handleKeyDown(event, socket) {
    if (event.code === 'ArrowRight' || event.key === '+') {
      socket.emit('slide-next', { href: window.location.href });
    }
    if (event.code === 'ArrowLeft' || event.key === '-') {
      socket.emit('slide-back', { href: window.location.href });
    }
  }


  ready(function () {
    const socket = io();
    socket.on('disconnect', function () {
      console.log('socket.io disconnected');
    });
    socket.on('new-slide-images', updatePage);
    socket.on('reply-current-image', updatePage);
    socket.on('connect', function () {
      console.log('socket.io connected socket.id: ', socket.id);
      socket.emit('request-current-image');
    });
    document.addEventListener('keydown', function (event) { handleKeyDown(event, socket); });
  });
})();
