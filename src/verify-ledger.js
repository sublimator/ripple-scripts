#!/usr/bin/env node
/* eslint-disable curly */
'use strict';

const assert = require('assert');
const path = require('path');
const _ = require('lodash');
const yargs = require('yargs');
const ripple = require('@niq/ripple-core-types');
const {binary, ShaMap, STObject, HashPrefix, Hash256} = ripple;
const {BinarySerializer, serializeObject} = binary;

function loadJSON(fn) {
  return require(path.resolve(fn));
}

function transactionItem(json) {
  assert(json.hash);
  const index = Hash256.from(json.hash);
  const item = {
    hashPrefix() {
      return HashPrefix.transaction;
    },
    toBytesSink(sink) {
      const serializer = new BinarySerializer(sink);
      serializer.writeLengthEncoded(STObject.from(json));
      serializer.writeLengthEncoded(STObject.from(json.metaData));
    }
  };
  return [index, item];
}

function entryItem(json) {
  const index = Hash256.from(json.index);
  const bytes = serializeObject(json);
  const item = {
    hashPrefix() {
      return HashPrefix.accountStateEntry;
    },
    toBytesSink(sink) {
      sink.put(bytes);
    }
  };
  return [index, item];
}

function computeHash(itemsJson, itemizer) {
  const map = new ShaMap();
  itemsJson.forEach(item => map.addItem(...itemizer(item)));
  return map.hash().toHex();
}

const transactionHash = _.partialRight(computeHash, transactionItem);
const accountHash = _.partialRight(computeHash, entryItem);

function main(ledgerFile) {
  const ledger = loadJSON(ledgerFile);
  const {accountState, transactions, account_hash, transaction_hash} = ledger;
  console.log(`historical txn hash: ` + transaction_hash);
  console.log(`recomputed txn hash: ` + transactionHash(transactions));
  if (accountState) {
    console.log(`historical account hash: ` + account_hash);
    console.log(`recomputed account hash: ` + accountHash(accountState));
  }
  return 0;
}

(function() {
  const {argv} = yargs.usage('verify-ledger <ledger_dump.json>').demand(1);
  main(argv._[0]);
}());
