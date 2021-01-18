const Blockchain = require('./blockchain.js')
let newBlock;
let transaction;
const atrium = new Blockchain()
transaction = atrium.createNewTransaction(100, 'oscar', 'terry')
atrium.addTransactionToPendingTransactions(transaction)
const output1 = atrium.proofOfWork(atrium.chain[0]['hash'], {transactions:atrium.pendingTransactions,index:2})
newBlock =atrium.createNewBlock(output1['nonce'], atrium.chain[0]['hash'], output1['hash'])
atrium.chain.push(newBlock)
transaction = atrium.createNewTransaction(1200, 'oscar', 'terry')
atrium.addTransactionToPendingTransactions(transaction)
transaction = atrium.createNewTransaction(1100, 'oscar', 'terry')
atrium.addTransactionToPendingTransactions(transaction)
const output2 = atrium.proofOfWork(atrium.chain[1]['hash'], {transactions:atrium.pendingTransactions,index:3})
newBlock = atrium.createNewBlock(output2['nonce'], atrium.chain[1]['hash'], output2['hash'])
atrium.chain.push(newBlock)
const blockchain = atrium.chain
transaction = atrium.createNewTransaction(1100, 'oscar', 'terry')
atrium.addTransactionToPendingTransactions(transaction)
console.log(JSON.stringify(atrium))

