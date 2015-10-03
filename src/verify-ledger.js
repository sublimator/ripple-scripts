#!/usr/bin/env node
/* eslint-disable curly */
'use strict';

const path = require('path');
const yargs = require('yargs');
const ripple = require('@niq/ripple-core');
const {hashes: {accountStateHash, transactionTreeHash}} = ripple;

function loadJSON(fn) {
  return require(path.resolve(fn));
}

function main(ledgerFile) {
  const ledger = loadJSON(ledgerFile);
  const {accountState, transactions, account_hash, transaction_hash} = ledger;
  console.log(`historical txn hash: ` + transaction_hash);
  console.log(`recomputed txn hash: ` + transactionTreeHash(transactions));
  if (accountState) {
    console.log(`historical account hash: ` + account_hash);
    console.log(`recomputed account hash: ` + accountStateHash(accountState));
  }
  return 0;
}

(function() {
  const {argv} = yargs.usage('verify-ledger <ledger_dump.json>').demand(1);
  main(argv._[0]);
}());
