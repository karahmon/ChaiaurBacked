require('dotenv').config() // used to import env config

//express documentation copied
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter',(req,res)=>{
    res.send("Chai aur Code")
})
app.get('/login',(req,res)=>{
    res.send("<h1>Please Login Using Correct Credentials</h1>")
})
app.get('/youtube',(req,res)=>{
    res.send("<h2>@monilkarania</h2>")
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
