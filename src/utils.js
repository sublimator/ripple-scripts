/* eslint-disable func-style */
'use strict';

const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const {isValidSeed} = require('ripple-address-codec');
const {keyPairFromSeed, seedFromPhrase} = require('@niq/ripple-keypairs');

function getKeyPair(secret, {validator = false, type = 'secp256k1'} = {}) {
  const seed = !secret ? crypto.randomBytes(16) :
               isValidSeed(secret) ? secret :
               seedFromPhrase(secret);
  const options = {validator};
  const arg2 = typeof seed === 'string' ? options : type;
  return keyPairFromSeed(seed, arg2, options);
}
const memoized = _.memoize(getKeyPair, (...args) => JSON.stringify(args));
const prettyJSON = obj => JSON.stringify(obj, undefined, 2);
const scriptName = () => path.basename(process.argv[1], '.js');

module.exports = {
  getKeyPair: memoized,
  prettyJSON,
  scriptName
};
