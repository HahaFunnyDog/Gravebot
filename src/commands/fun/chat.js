import Promise from 'bluebird';
import Cleverbot from 'cleverbot-node';
import ent from 'entities';
import nconf from 'nconf';

import T from '../../translate';


const clever = new Cleverbot();
clever.configure({botapi: nconf.get('CLEVERBOT_KEY')});

function chat(client, evt, suffix, lang) {
  if (!nconf.get('CLEVERBOT_KEY')) return Promise.resolve(T('chat_setup', lang));
  if (!suffix) suffix = 'Hello.';
  evt.message.channel.sendTyping();
  return new Promise((resolve, reject) => {
    Cleverbot.prepare(() => {
      try {
        clever.write(suffix, (response) => {
          if (/\|/g.test(response.message)) {
            response.message = response.message.replace(/\|/g, '\\u');
            response.message = response.message.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
              return String.fromCharCode(parseInt(grp, 16));
            });
          }
          resolve(ent.decodeHTML(response.message));
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default {
  chat
};

export const help = {
  chat: {parameters: 'text'}
};
