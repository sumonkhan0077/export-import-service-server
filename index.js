const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

// PCpxLC201swo4V5s
const uri = "mongodb+srv://export_import:PCpxLC201swo4V5s@cluster0.abef6se.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req , res) => {
    res.send('export import server is running ')
})

async function run() {
  try{
    await  client.connect();

    const db = client.db('export_import');
    const productsCollection = db.collection('products');

 
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally{
    //  await client.close();
  }
    
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})