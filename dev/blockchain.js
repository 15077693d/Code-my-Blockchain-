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
        if (hash.substr(0, 4) === "0000") {
            console.log(`Done!Hash:${hash} nonce:${nonce}`)
            return ({ nonce, hash })
        }
        nonce += 1
    }
}

Blockchain.prototype.chainIsValid = function(blockchain){
    let flag = true
    for (let i=1;i<blockchain.length;i++){
        const currentBlock = blockchain[i]
        const prevBlock = blockchain[i-1]
        console.log(`index: ${i+1}`)
        console.log(`prevBlock: ${prevBlock.hash}`)
        console.log(`currentBlock: ${currentBlock.hash}`)
        // 1. prevBlock's == block's previousBlockHash
        if (prevBlock.hash!==currentBlock.previousBlockHash){
            console.log(`Hash not equal!(${i+1}): ${prevBlock.hash} vs ${currentBlock.previousBlockHash}`)
            flag = false
        }
        // 2. hash block again with nonce see is 0000 of not
        const currentBlockData = {transactions:currentBlock.transactions,index:i+1}
        const hash = this.hashBlock(prevBlock.hash, currentBlockData, currentBlock.nonce)
        if (hash.substr(0, 4) !== "0000"){
            console.log(`No 0000!(${i+1}): ${prevBlock.hash} vs ${hash}`)
            flag = false
        }
    }
    // 3. genesis block is correct
    const genesisBlock = blockchain[0]
    const correctNonce = genesisBlock.nonce===961213
    const correctPreviousBlockHash = genesisBlock.previousBlockHash ==='instagram:oscariscoding'
    const correctHash = genesisBlock.hash ==='github:15077693d'
    const correctTransactions = genesisBlock.transactions.length===0
    if ((correctNonce&&correctPreviousBlockHash&&correctHash&&correctTransactions) === false){
        console.log(`genesis is wrong!: correctNonce-${correctNonce}  correctPreviousBlockHash-${correctPreviousBlockHash} correctHash-${correctHash} correctTransactions-${correctTransactions}`)
        flag = false
    }
    return flag
}

module.exports = Blockchain