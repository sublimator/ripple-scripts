#!/usr/bin/env node

/* eslint-disable func-style */
'use strict';

const path = require('path');
const {AccountID, STObject, binary} = require('@niq/ripple-core-types');
const {serializeObject, binaryToJSON, bytesToHex, multiSigningData,
       transactionID} = binary;
const {keyPairFromSeed, seedFromPhrase} = require('@niq/ripple-keypairs');

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

function getKeyPair(secret) {
  const seed = /^s/.test(secret) ? secret : seedFromPhrase(secret);
  return keyPairFromSeed(seed);
}

const toHex = v => bytesToHex(v);
const prettyJSON = obj => JSON.stringify(obj, undefined, 2);
const getSigner = (o) => AccountID.from(o.Signer.Account);
const signerComparator = (a, b) => getSigner(a).compareTo(getSigner(b));

function signTxJson(tx_json, secret, signingAccount = null) {
  const keyPair = getKeyPair(secret);

  const signer = {
    Signer: {
      SigningPubKey: toHex(keyPair.publicBytes()),
      TxnSignature: toHex(keyPair.sign(multiSigningData(tx_json))),
      Account: signingAccount || keyPair.id()
    }
  };

  const signers = tx_json.Signers = tx_json.Signers || [];
  signers.push(signer);
  signers.sort(signerComparator);

  const tx = STObject.from(tx_json);
  tx.SigningPubKey = '';

  const serialized = serializeObject(tx);
  const hash = toHex(transactionID(serialized));
  const tx_blob = toHex(serialized);

  return {
    tx_json: binaryToJSON(tx_blob),
    tx_blob,
    hash
  };
}

function main(args = process.argv) {
  const [, script, secret, tx_json, signingAccount] = args;
  const relative = path.relative(process.cwd(), script);
  if (args.length < 4) {
    console.error(`Usage: ${relative} <secret> <tx_json> [signing_account]`);
    console.error(`\ne.g: ${relative} ${EXAMPLE.secret} '${EXAMPLE.tx_json}'`);
  } else {
    const bundle = signTxJson(JSON.parse(tx_json), secret, signingAccount);
    console.log(prettyJSON(bundle));
    console.error(`${relative} nextSigner '${JSON.stringify(bundle.tx_json)}'`);
  }
}

module.exports = main;
if (require.main === module) {
  main();
}
