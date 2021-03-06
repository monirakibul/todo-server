const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())

// mongo db connetion 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zdgdm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        const taskCollection = client.db('toDoList').collection('list')


        // get task list filter by email 
        app.get('/task', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = taskCollection.find(query)
            const tasks = await cursor.toArray()
            res.send(tasks)
        });

        // add new tast 
        app.post('/add', async (req, res) => {
            const booking = req.body;
            const result = await taskCollection.insertOne(booking);
            return res.send({ success: true, result });
        });

        // delete task by id 
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });

        //task mark as completed 
        app.put('/completed/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    isCompleted: true
                }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        })


    }
    finally { }
}

run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('running')
})

app.listen(port, () => {
    console.log(port)
})