const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.abef6se.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("export import server is running ");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("export_import");
    const productsCollection = db.collection("products");
    const myCollection = db.collection("myProducts");
    const myImportCollection = db.collection("myImport");

    const usersCollection = db.collection("users");

    // user data
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send("user already exits , do not need to add user");
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.post("/myImport", async (req, res) => {
      const newImport = req.body;
      const quantity = parseInt(newImport.quantity);
      const result = await myImportCollection.insertOne(newImport);
      const filter = { _id: new ObjectId(newImport.product_id) };
      const update = {
        $inc: { available_quantity: -quantity },
      };
      const countQuantity = await productsCollection.updateOne(filter, update);
      res.send(result, countQuantity);
    });

    // email diya pawa
    app.get("/myImport", async (req, res) => {
      const email = req.query.email;

      let query = {};
      if (email) {
        query = { buyer_email: email };
      }
      const cursor = myImportCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/myImport/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myImportCollection.deleteOne(query);
      res.send(result);
    });

    // data pawa jabe
    // app.get("/products", async (req, res) => {
    //   const cursor = productsCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/products", async (req, res) => {
      try {
        const email = req.query.email;
        // console.log("Received email:", email);

        let query = {};
        if (email) {
          query = { exporter_email: email };
        }

        const result = await productsCollection.find(query).toArray();
        // console.log("Matched products:", result.length);
        res.send(result);
      } catch (error) {
        // console.error("Error fetching products:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // products email diya pawa
    // app.get("/products", async (req, res) => {
    //   const email = req.query.email;
    //   console.log("Received email:", email);

    //   let query = {};
    //   if (email) {
    //     query = { exporter_email: email };
    //   }

    //   const cursor = productsCollection.find(query);
    //   const result = await cursor.toArray();
    //    console.log("Matched products:", result.length);
    //   res.send(result);
    // });

    // latest products
    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection.find().sort({ time: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // data pabo id te
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // data pathaschi
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    // update data
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          product_image: updatedProduct.product_image,
          product_name: updatedProduct.product_name,
          price: updatedProduct.price,
          origin_country: updatedProduct.origin_country,
          rating: updatedProduct.rating,
          rating_number: updatedProduct.rating_number,
          available_quantity: updatedProduct.available_quantity,
          description: updatedProduct.description,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    // delete data
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //  await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
