import './content_style.scss';

import { colors, getLogger } from './utils/log';


const lg = getLogger('content_script', colors.bgYellowBright)

lg.info('content_script.ts')

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    lg.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

function injectScript(file: string) {
  const body = document.getElementsByTagName('body')[0];
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  body.appendChild(s);
}

injectScript(chrome.runtime.getURL('/js/inject.js'))
