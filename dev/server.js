const app = require('express')()

app.get('/blockchain', function (req, res) {
    res.send('test')
})

app.post('/transaction', function (req, res) { })

app.get('/mine', function (req, res) { })

app.listen(3000, () => {
    console.log('listening on port 3000...')
})
