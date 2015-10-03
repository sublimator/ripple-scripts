#!/usr/bin/env node
/* eslint-disable curly */
'use strict';

const yargs = require('yargs');
const assert = require('assert-diff');
const _ = require('lodash');
const Sequelize = require('sequelize');
const {STObject, binary} = require('@niq/ripple-core');
const {readJSON, serializeObject, makeParser} = binary;

function rekey(obj, mapping) {
  return _.transform(mapping, (to, v, k) => {
    const arg = obj[k];
    if (arg) {
      to[v] = arg;
    }
  });
}

function binaryToJSON(bytes) {
  return readJSON(makeParser(bytes));
}

function prettyJSON(value) {
  return JSON.stringify(value, null, 2);
}

function assertRecyclable(json) {
  const recycled = STObject.from(json).toJSON();
  assert.deepEqual(recycled, json);
  const recycledAgain = binaryToJSON(serializeObject(recycled));
  assert.deepEqual(recycledAgain, json);
  recycledAgain.inSpanner = 'works';
  assert.throws(() => assert.deepEqual(recycledAgain, json));
}

function recycleTest(txn) {
  const {tx_json, meta} = txn;
  assertRecyclable(tx_json);
  assertRecyclable(meta);
}

function makeTransactionModel(sequelize) {
  const transactionsTable = {
    TransID: {type: Sequelize.STRING, primaryKey: true},
    TransType: {type: Sequelize.STRING},
    FromAcct: {type: Sequelize.STRING},
    FromSeq: {type: Sequelize.BIGINT},
    LedgerSeq: {type: Sequelize.BIGINT},
    Status: {type: Sequelize.STRING},
    RawTxn: {type: Sequelize.BLOB},
    TxnMeta: {type: Sequelize.BLOB}
  };
  const config = {
    timestamps: false,
    freezeTableName: true,
    instanceMethods: {
      toJSON() {
        const tx_json = binaryToJSON(this.RawTxn);
        const meta = binaryToJSON(this.TxnMeta);
        const ledger_index = this.LedgerSeq;
        const hash = this.TransID;
        return {hash, meta, tx_json, ledger_index};
      }
    }
  };
  return sequelize.define('Transactions', transactionsTable, config);
}

function makeQuery(argv) {
  const where = rekey(argv, {
    hash: 'TransID',
    ledger_index: 'LedgerSeq',
    account: 'FromAcct',
    type: 'TransType'
  });
  return {where, limit: argv.limit || 200};
}

function initDB(dbPath) {
  const sequelize = new Sequelize(
      'transaction.db', 'user', 'pass',
      {logging: false, dialect: 'sqlite', storage: dbPath});
  const Transaction = makeTransactionModel(sequelize);
  return {Transaction};
}

function getArgs() {
  return yargs
    .describe('db', 'abs path to transaction.db')
    .describe('hash', 'hash of a transaction to dump')
    .describe('ledger_index', 'restrict query to given ledger_index')
    .describe('account', 'restrict query to given Account')
    .describe('recycle_test', 'recycle json for integrity checks')
    .describe('type', 'restrict query to given TransactionType')
    .demand('db')
  .argv;
}

function main(argv = getArgs()) {
  const {Transaction} = initDB(argv.db);
  const query = makeQuery(argv);
  Transaction.findAll(query).then(function(txns) {
    if (argv.recycle_test) {
      txns.forEach(tx => recycleTest(tx.toJSON()));
    }
    console.log(prettyJSON(txns));
    // support script.js $argv > dump.json
    console.error({query, count: txns.length});
    if (_.isFunction(argv.done)) {
      argv.done();
    }
  });
}

module.exports = main;
if (require.main === module) {
  main();
}
