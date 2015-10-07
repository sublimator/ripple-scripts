#!/usr/bin/env node
/* eslint-disable func-style */
'use strict';

const yargs = require('yargs');
const {getKeyPair} = require('./utils');

function main(argv) {
  const secret = argv._[0];
  const params = {type: argv.ed25519 ? 'ed25519' : 'secp256k1'};
  console.log(getKeyPair(secret, params).toJSON());
}

module.exports = main;
if (require.main === module) {
  const {argv} = yargs.default('ed25519', false);
  main(argv);
}
