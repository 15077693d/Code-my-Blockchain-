const app = require('express')()
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const rp = require('request-promise')
const uuid = require('uuid')
const port = process.argv[2]
const nodeAddress = uuid.v1().split('-').join('')
const atrium = new Blockchain()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.get('/blockchain', function (req, res) {
    res.send(atrium)
})

app.post('/transaction', function (req, res) { 
    const transactionObject = req.body.transactionObject
    const number_of_block = atrium.addTransactionToPendingTransactions(transactionObject)
    res.json({
        note:`Transaction will be added in block ${number_of_block}`,
        url:atrium.currentNodeUrl
    })
})

app.post('/transaction/broadcast', async (req, res) =>{
    const {amount, sender, recipient } =req.body 
    const transactionObject = atrium.createNewTransaction(amount, sender, recipient)
    const nodeUrls = atrium.networkNodes
    let broadcastPromises = []
    nodeUrls.forEach(
        nodeUrl => {
            const options = {
                method:"POST",
                uri:`${nodeUrl}/transaction`,
                body:{
                    transactionObject:transactionObject
                },
                json:true
            }
            broadcastPromises.push(rp(options))
        }
    )
    const data = await Promise.all(broadcastPromises)
    res.json(data)
})

app.post('/receive-new-block', async function(req, res){
    const newBlock = req.body.newBlock
    const correctHash = newBlock.previousBlockHash === atrium.getLastBlock().hash
    const correctIndex = newBlock.index === atrium.getLastBlock().index + 1
    if (correctHash && correctIndex){
        atrium.chain.push(newBlock)
        atrium.pendingTransactions = []
        res.json(
            {
                note:`Add new block and renew pending transaction on ${atrium.currentNodeUrl}`,
                url:atrium.currentNodeUrl,
                code:200
            }
        )
    }else{
        res.json(
            {
                code:404,
                note:`Error add new block on ${atrium.currentNodeUrl}`,
                url:atrium.currentNodeUrl
            }
        )
    }
})

app.get('/mine', async function (req, res) {
    const lastBlock = atrium.getLastBlock()
    const previousBlockHash = lastBlock.hash
    const currentBlockData = {
        transactions:atrium.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    const {nonce, hash} = atrium.proofOfWork(previousBlockHash, currentBlockData)
    atrium.createNewTransaction(12.5,'atrier',nodeAddress)
    const newBlock=atrium.createNewBlock(
        nonce, previousBlockHash, hash
    )

    const promises1 = atrium.networkNodes.map(
        networkNode => {
             const options = {
                method:"POST",
                uri:`${networkNode}/receive-new-block`,
                body:{newBlock},
                json:true
                }
            return rp(options)
        }
    )
    const newBlockRes = await Promise.all(promises1)
    if (new Set(newBlockRes.map(res => res.code)).has(200)){
        const options = {
        method:"POST",
        uri:`${atrium.currentNodeUrl}/transaction/broadcast`,
        body:{amount:12.5, sender:'atrier', recipient:nodeAddress },
        json:true,
    }
    const newTransactionRes =await rp(options)
    res.json({
        note:'New block mined successfully',
        url:atrium.currentNodeUrl,
        block:newBlock,
        newBlockRes,
        newTransactionRes
    })
    }else{
        res.json({
            note:'Too slowly, New block mined unsuccessfully...',
            url:atrium.currentNodeUrl,
        })
    }
    
 })

// register a node and broadcast it to network
app.post('/register-and-broadcast-node', async (req, res)=>{
    const newNodeUrl = req.body.newNodeUrl;
    let nodes = []
    if(atrium.networkNodes.indexOf(newNodeUrl)==-1) {
        atrium.networkNodes.push(newNodeUrl)
        nodes.push({"url":atrium.currentNodeUrl,"code":200})
    }else{
        nodes.push({"url":atrium.currentNodeUrl,"code":404})
    }
    let regNodesPromises = []
    atrium.networkNodes.forEach(
    networkUrl => {
             // '/register-node'
            const options = {
                method:'POST',
                uri: `${networkUrl}/register-node`,
                json:true,
                body:{
                    newNodeUrl:newNodeUrl
                }
            }
            regNodesPromises.push(rp(options))
        })
    const otherNodes = await Promise.all(regNodesPromises)
    nodes = nodes.concat(otherNodes)
    res.json({nodes})
})

// register a node to network
app.post('/register-node',function(req, res){
    const nodeDidntAdd = atrium.networkNodes.indexOf(req.body.newNodeUrl) === -1
    const nodeNotMyself = req.body.newNodeUrl!==atrium.currentNodeUrl
    if (nodeDidntAdd && nodeNotMyself){
        atrium.networkNodes.push(req.body.newNodeUrl)
        res.send({
            url:atrium.currentNodeUrl,
            code:200
        })
    }else{
        res.send({
            url:atrium.currentNodeUrl,
            code:404
        })
    }
})

// register multiple nodes at once
app.post('/register-nodes-bulk',function(req, res){
     let networkAdded = []
     req.body.allNetworkNodes.forEach(
         networkNode => {
             if (atrium.networkNodes.indexOf(networkNode)==-1){
                atrium.networkNodes.push(networkNode)
                networkAdded.push(networkNode)
             }
         }
     )
    res.json({
        networkAdded,
        total:networkAdded.length
    })
})

// consensus
app.get('/consensus', async (req, res) => {
   const getBlockchainPromises = []
   atrium.networkNodes.forEach(
    networkNode => {
        const option = {
            uri:`${networkNode}/blockchain`,
            method:"GET",
            json:true
        }
        getBlockchainPromises.push(
            rp(option)
        )
    }
   )
   const nodes = await Promise.all(getBlockchainPromises)
   let maxLength = atrium.chain.length
   let longestChain = null
   let newPendingTansaction = null
   nodes.forEach(
    node => {
        // longer than maxLength
        if (node.chain.length>maxLength){
            // chain is valid
            if(atrium.chainIsValid(node.chain)){
                longestChain = node.chain
                newPendingTansaction = node.pendingTransactions
            }
        }
    }
   )
   if (longestChain){
        atrium.chain = longestChain
        atrium.pendingTransactions = newPendingTansaction
        res.json({
            note:'Replace the chain...',
            url:atrium.currentNodeUrl,
        })
   }
   res.json({
    note:'No replace in the chain...',
    url:atrium.currentNodeUrl,
})
})

app.listen(Number(port), () => {
    console.log(`listening on port ${port}...`)
})
