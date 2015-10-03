#!/usr/bin/env node

/* eslint-disable func-style */
'use strict';

const path = require('path');
const {encodeAccountID} = require('ripple-address-codec');
const {verify, computePublicKeyHash} = require('@niq/ripple-keypairs');
const {binary} = require('@niq/ripple-core');
const {parseBytes, signingData} = binary;

const EXAMPLE = JSON.stringify({
  Account: 'r9LqNeG6qHxjeUocjvVki2XR35weJ9mZgQ',
  Amount: '1000',
  Destination: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  Fee: '10',
  Flags: 2147483648,
  Sequence: 1,
  TransactionType: 'Payment',
  SigningPubKey:
    'ED' +
    '5F5AC8B98974A3CA843326D9B88CEBD0560177B973EE0B149F782CFAA06DC66A',
  TxnSignature:
    '7D0825105229923B261C716F225181E5A66A34C9480446ABE64818A673954CC3' +
    '4D42946CD82172814F037976AE3800BDE983624A45FCDBED4A548C4650BF900D'
});

function computeSigningKeyID(tx_json) {
  const publicBytes = parseBytes(tx_json.SigningPubKey);
  return encodeAccountID(computePublicKeyHash(publicBytes));
}

function verifyTxJson(tx_json) {
  const verified = verify(signingData(tx_json),
                  tx_json.TxnSignature,
                  tx_json.SigningPubKey);
  const keyID = computeSigningKeyID(tx_json);
  const masterKey = keyID === tx_json.Account;
  return {keyID, masterKey, verified};
}

(function main(args = process.argv) {
  const [, script, tx_json] = args;
  if (args.length < 3) {
    const relative = path.basename(script, '.js');
    console.error(`Usage: ${relative} <tx_json>\ne.g:`);
    console.error(`${relative} '${EXAMPLE}'`);
  } else {
    console.log(JSON.stringify(verifyTxJson(JSON.parse(tx_json))));
  }
}());
