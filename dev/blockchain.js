const sha256 = require('sha256')
function Blockchain() {
    this.chain = []
    this.pendingTransactions = []
    this.createNewBlock(961213, 'instagram:oscariscoding', 'github:15077693d');
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
    this.chain.push(newBlock)
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
    }
    this.pendingTransactions.push(newTransaction)
    return this.getLastBlock()['index']
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
        if (hash.substr(0, 4) === "0000") {
            console.log(`Done!Hash:${hash} nonce:${nonce}`)
            return ({ nonce, hash })
        }
        nonce += 1
    }
}
module.exports = Blockchain