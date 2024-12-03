const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://avinashkola:avinash@webprojectsdb.qe6p8.mongodb.net/?retryWrites=true&w=majority&appName=webprojectsdb";

async function fetchAll(res) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const cursor = client.db("webperojectsdb").collection("projects").find({});
        const results = await cursor.toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results))
    } catch (e) {
        res.writeHead(500);
        res.end("Database error");
    } finally {
        await client.close();
    }
}

async function fetchOne(res, id) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await client.db("webperojectsdb").collection("projects").findOne({ id: id });
        if (result) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result))
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Project not found" }));
        }
    } catch (e) {
        res.writeHead(500);
        res.end("Database error");
    } finally {
        await client.close();
    }
}

const server = http.createServer((req, res) => {
    const staticDir = path.join(__dirname, "public");

    if (req.url === '/' || req.url === '/index.html') {
        // Serve the index.html file
        fs.readFile(path.join(staticDir, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error loading homepage");
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(content);
            }
        });
        return; // Stop further processing
    }

    if (req.url.startsWith("/api")) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const id = urlParams.searchParams.get("id");
        if (id) {
            fetchOne(res, id).catch(console.error);
        } else {
            fetchAll(res).catch(console.error);
        }
        return; 
    }

    const filePath = path.join(staticDir, req.url);
    const ext = path.extname(filePath);
    const mimeTypes = {
        ".css": "text/css",
        ".js": "application/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("File not found");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
});

const PORT = process.env.PORT || 5959;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
