require('dotenv').config() // used to import env config

//express documentation copied
const express = require('express')
const app = express()
const port = 3000

const github={
    "login": "appwrite",
    "id": 25003669,
    "node_id": "MDEyOk9yZ2FuaXphdGlvbjI1MDAzNjY5",
    "avatar_url": "https://avatars.githubusercontent.com/u/25003669?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/appwrite",
    "html_url": "https://github.com/appwrite",
    "followers_url": "https://api.github.com/users/appwrite/followers",
    "following_url": "https://api.github.com/users/appwrite/following{/other_user}",
    "gists_url": "https://api.github.com/users/appwrite/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/appwrite/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/appwrite/subscriptions",
    "organizations_url": "https://api.github.com/users/appwrite/orgs",
    "repos_url": "https://api.github.com/users/appwrite/repos",
    "events_url": "https://api.github.com/users/appwrite/events{/privacy}",
    "received_events_url": "https://api.github.com/users/appwrite/received_events",
    "type": "Organization",
    "site_admin": false,
    "name": "Appwrite",
    "company": null,
    "blog": "https://appwrite.io",
    "location": "Planet Earth, Milky Way",
    "email": null,
    "hireable": null,
    "bio": "End to end backend server for frontend and mobile developers. 👩‍💻👨‍💻",
    "twitter_username": "appwrite",
    "public_repos": 104,
    "public_gists": 0,
    "followers": 2924,
    "following": 0,
    "created_at": "2017-01-09T09:05:24Z",
    "updated_at": "2023-09-28T15:24:35Z"
  }

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
app.get('/github',(req,res)=>{
    res.json(github)
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
