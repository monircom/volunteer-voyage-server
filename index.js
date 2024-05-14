const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkwszd0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {

        const postsCollection = client.db('volunteerDB').collection('posts')
        const appliedCollection = client.db('volunteerDB').collection('applied')

        // jwt generate
    app.post('/jwt', async (req, res) => {
        const email = req.body
        const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '365d',
        })
        res
          .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
      })
  
      // Clear token on logout
      app.get('/logout', (req, res) => {
        res
          .clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 0,
          })
          .send({ success: true })
      })

    // Get all post data from db
        app.get('/posts', async (req, res) => {
        const result = await postsCollection.find().toArray()
  
        res.send(result)
      })


       // Get a single post data from db using post id
       app.get('/post/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await postsCollection.findOne(query)
        res.send(result)
      })


      // Save a applied data in db
    app.post('/applied', async (req, res) => {
        const appliedData = req.body
  
        // check if its a duplicate request
        const query = {
          email: appliedData.email,
          postId: appliedData.postId,
        }
        const alreadyApplied = await appliedCollection.findOne(query)
        console.log(alreadyApplied)
        if (alreadyApplied) {
          return res
            .status(400)
            .send('You have already Volunteered for this post.')
        }
        //console.log(appliedData.postId,"postId")
        const result = await appliedCollection.insertOne(appliedData)
  
        // update volunteer count in posts collection
        const updateDoc = {
          $inc: { No_of_volunteers_needed: -1 },
        }
        const jobQuery = { _id: new ObjectId(appliedData.postId) }
        const updateVolCount = await postsCollection.updateOne(jobQuery, updateDoc)
        console.log(updateVolCount,"Update")
        res.send(result)
      })
    


      // Connect the client to the server	(optional starting in v4.7)     
      // Send a ping to confirm a successful connection
      //await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
     
    }
  }
  run().catch(console.dir);

app.get('/',(req,res) => {
    res.send ('Hello from Server')
})


app.listen(port, () => console.log(`Server running on port ${port}`))
