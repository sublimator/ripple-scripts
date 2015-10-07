/* eslint-disable func-style */
'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const {keyPairFromSeed, seedFromPhrase} = require('@niq/ripple-keypairs');

function getKeyPair(secret, {type = 'secp256k1'} = {}) {
  const seed = !secret ? crypto.randomBytes(16) :
               /^s/.test(secret) ? secret :
               seedFromPhrase(secret);
  return keyPairFromSeed(seed, type);
}

const prettyJSON = obj => JSON.stringify(obj, undefined, 2);
const memoized = _.memoize(getKeyPair, (...args) => JSON.stringify(args));

module.exports = {
  getKeyPair: memoized,
  prettyJSON
};
