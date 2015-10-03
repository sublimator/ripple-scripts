/* eslint-disable func-style */
'use strict';

const {keyPairFromSeed, seedFromPhrase} = require('@niq/ripple-keypairs');

function getKeyPair(secret) {
  const seed = /^s/.test(secret) ? secret : seedFromPhrase(secret);
  return keyPairFromSeed(seed);
}

const prettyJSON = obj => JSON.stringify(obj, undefined, 2);

module.exports = {
  getKeyPair,
  prettyJSON
};
