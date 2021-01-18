const sha256 = require('sha256')
const uuid = require('uuid')
const currentNodeUrl = process.argv[3]
function Blockchain() {
    this.chain = []
    this.pendingTransactions = []
    this.currentNodeUrl = currentNodeUrl
    this.networkNodes = []
    genesisBlock = this.createNewBlock(961213, 'instagram:oscariscoding', 'github:15077693d')
    this.chain.push(genesisBlock)
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    // nonce is a proof on proof of work
    const newBlock = {
        index: this.chain.length + 1,
        timestmp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    }
    this.pendingTransactions = []
    return newBlock
}

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1]
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid.v1().split('-').join('')
    }
    return newTransaction
}

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObject){
    this.pendingTransactions.push(transactionObject)
    return this.getLastBlock().index + 1
}

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const data = previousBlockHash + String(nonce) + JSON.stringify(currentBlockData)
    return sha256(data)
}

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0
    while (true) {
        const hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
        //console.log(`Mining...Hash:${hash} nonce:${nonce}`)
        if (hash.substr(0, 5) === "00000") {
            console.log(`Done!Hash:${hash} nonce:${nonce}`)
            return ({ nonce, hash })
        }
        nonce += 1
    }
}
module.exports = Blockchain