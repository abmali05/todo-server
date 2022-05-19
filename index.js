const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


var uri = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0-shard-00-00.n2zk3.mongodb.net:27017,cluster0-shard-00-01.n2zk3.mongodb.net:27017,cluster0-shard-00-02.n2zk3.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-o5m8nt-shard-0&authSource=admin&retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('inventory').collection('product');
        // const userCollection = client.db('inventory').collection('userproduct');

        app.get('/inventory', async (req, res) => {
            const dscSort = { _id: -1 }
            const query = {};
            const cursor = inventoryCollection.find(query);
            const products = await cursor.sort(dscSort).toArray();
            res.send(products);

        });

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const productDetails = await inventoryCollection.findOne(query);
            res.send(productDetails);
        });


        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {

                    quantity: updatedQuantity.quantity,
                },
            };
            const productUpdate = await inventoryCollection.updateOne(filter, updatedDoc, options);
            res.send(productUpdate);

        });

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const productDelete = await inventoryCollection.deleteOne(query);
            res.send(productDelete);
        });

        app.post('/addproduct', async (req, res) => {
            const product = req.body;
            const addProduct = await inventoryCollection.insertOne(product);
            res.send(addProduct);
        })

        app.get('/myproduct', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const dscSort = { _id: -1 };
            const query = { email: email };
            const cursor = inventoryCollection.find(query);
            const products = await cursor.sort(dscSort).toArray();
            res.send(products);

        });


    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Inventory server is runnung successfully')
});

app.listen(port, () => {
    console.log('Inventory server is runnung on  port', port);
})