#!/usr/bin/env node
/* eslint-disable func-style */
'use strict';

const path = require('path');
const {signing: {sign}} = require('@niq/ripple-core');
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
  const [, script, secret, tx_json] = args;
  if (args.length < 4) {
    const relative = path.basename(script, '.js');
    console.error(`Usage: ${relative} <secret> <tx_json>\ne.g:`);
    console.error(`${relative} ${EXAMPLE.secret} '${EXAMPLE.tx_json}'`);
  } else {
    const bundle = sign(JSON.parse(tx_json), getKeyPair(secret));
    console.log(prettyJSON(bundle));
  }
}

module.exports = main;
if (require.main === module) {
  main();
}
