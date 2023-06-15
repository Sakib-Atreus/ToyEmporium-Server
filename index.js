require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5007;

app.use(cors());

app.use(express.json());
console.log(process.env.DB_NAME);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.sktmpwb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log(" Database Connected Successfully✅ ");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()

app.get('/', (req, res) => {
  res.send('Lets play with Toys')
})


    const toyCollection = client.db("toyDB").collection("toy");

    app.get('/searchText/:text', async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
    //get all data from database
    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    //get single details data from all data
    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })
  
    //update  single toy
    app.get("/editToys/:id", async (req, res) => {
      const id = (req.params.id);
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })
 

    //delete the toy by selecting id
    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    //my toys added
    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await toyCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    })

    //put data in server
    app.put("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true }
      const updateDoc = {
        $set: {
          name: body.name,
          quantity: body.quantity,
          details: body.details,
          price:body.price
        }
      };
      const result = await toyCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    //post data to database
    app.post('/addToy', async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await toyCollection.insertOne(body);
      // res.send(result);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again later",
          status: false,
        });
      }
    })



app.listen(port, () => {
  console.log(`Lets run the TOY server site on port : ${port}`)
})