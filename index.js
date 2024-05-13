const express = require('express')
const cors = require('cors')
//const jwt = require('jsonwebtoken')
//const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://volunteer-voyage.web.app',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
//app.use(cookieParser())

app.get('/',(req,res) => {
    res.send ('Hello from Server')
})


app.listen(port, () => console.log(`Server running on port ${port}`))
