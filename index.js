const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://avinashkola:avinash@webprojectsdb.qe6p8.mongodb.net/?retryWrites=true&w=majority&appName=webprojectsdb";


async function fetchall(res) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const cursor = client.db("webperojectsdb").collection("projects").find({});

        const results = await cursor.toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    } catch (e) {
        res.writeHead(500);
        res.end("Database error");
    } finally {
        await client.close();
    }
}

async function fetchone(res, id) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const cursor = client.db("webperojectsdb").collection("projects").find({id:id});

        const results = await cursor.toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    } catch (e) {
        res.writeHead(500);
        res.end("Database error");
    } finally {
        await client.close();
    }
    
}

const server = http.createServer((req, res) => {

    console.log(req.url);
    if (req.url === '/') {
        res.end("<h1> Home </h1> ");
    }
    if (req.url.startsWith("/api")) {
        
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const id = urlParams.searchParams.get("id");
        console.log(id)
        if(id){
            fetchone(res,id).catch(console.error)
        }
        else{
        fetchall(res).catch(console.error)
        }
        
    }

});

const PORT = process.env.PORT || 5959;

server.listen(PORT, () => console.log(`Great our server is running on port ${PORT} `));