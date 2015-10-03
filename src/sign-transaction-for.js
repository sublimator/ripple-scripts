#!/usr/bin/env node

/* eslint-disable func-style */
'use strict';

const path = require('path');
const {signing: {signFor}} = require('@niq/ripple-core');
const {getKeyPair, prettyJSON} = require('./utils');

const EXAMPLE = {
  secret: 'sEd7t79mzn2dwy3vvpvRmaaLbLhvme6',
  tx_json: JSON.stringify({
    Account: 'r9LqNeG6qHxjeUocjvVki2XR35weJ9mZgQ',
    Amount: '1000',
    Destination: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    Fee: '10',
    Flags: 2147483648,
    Sequence: 1,
    TransactionType: 'Payment'
  })
};

function main(args = process.argv) {
  const [, script, secret, tx_json, signingAccount] = args;
  const relative = path.basename(script, '.js');
  if (args.length < 4) {
    console.error(`Usage: ${relative} <secret> <tx_json> [signing_account]`);
    console.error('e.g:');
    console.error(`${relative} ${EXAMPLE.secret} '${EXAMPLE.tx_json}'`);
  } else {
    const keyPair = getKeyPair(secret);
    const bundle = signFor(JSON.parse(tx_json), keyPair, signingAccount);
    console.log(prettyJSON(bundle));
    console.error(`${relative} nextSigner '${JSON.stringify(bundle.tx_json)}'`);
  }
}

module.exports = main;
if (require.main === module) {
  main();
}
