import express from 'express'

const app = express();

app.get('/api/jokes',(req,res)=>{
    const jokes=[{id: 1,title:"A joke",content:"Hello"},{id: 2,title:"Another Joke",content:"JSCA"},{id: 3,title:"Third Joke",content:"Namaskar"},{id: 4,title:"Fourth Joke",content:"Star"},{id: 5 ,title:"Fifth Joke",content:"Moon"}];
    res.send(jokes);
})
const port = process.env.PORT || 3000;

app.listen(port,()=>{console.log(`serve at http://localhost:${port}`)})