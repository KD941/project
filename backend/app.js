const libExpress = require('express');
const libCors = require('cors');
const libRandom = require('randomstring');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const server = libExpress();
server.use(libExpress.json());
const client = new MongoClient('mongodb://Admin:Karmdip123@localhost:27017/IMS?authSource=IMS');

server.use(libCors());
//for signup
server.post('/user/signup', async (req, res) => {
    if (req.body.name && req.body.email && req.body.password && req.body.phone) {
        await client.connect();
        const db = await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({ email: req.body.email }).toArray();
        if (result.length > 0) {
            res.json({ message: "User already exists" });
            console.log("User already exists");
        }
        else {
            const user =
            {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            }
            await collection.insertOne(user);
            res.json({ message: "User Created Successfully" });
            console.log("User Created Successfully");

        }
        client.close();
    }
    else {
        res.json({ message: "All fields required" });
    }
})
server.get("/user/roles", async (req, res) => {
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('users');
    const result = await collection.find({ token: req.headers.token }).toArray();
    if (result.length > 0) {
        const user = result[0];
        console.log("User roles fetched successfully");
        res.status(200).json({
            admin: user?.is_admin === true,
            team_owner: !!user?.owner_of,
            player: !!user?.playing_for

        })
        client.close();
    }
    else {
        res.status(404).json({ message: "No roles found" });
    }
    client.close();
}
)
server.put("/player/:id/update",async (req,res)=>
{
    if (req.body.name && req.body.score && req.body.matches && req.body.playing_for&&req.body.catches&&req.body.wickets) {
        console.log("Player update request received");
        await client.connect();
        const db = await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();
        if (result.length > 0) {
            const user = result[0];
            await collection.updateOne(
                { _id: new ObjectId(user._id) },
                {
                    $set: {
                        name: req.body.name,
                        score: req.body.score,
                        matches: req.body.matches,
                        playing_for: req.body.playing_for,
                        catches:req.body.catches,
                        wickets:req.body.wickets
                    }
                }
            );
            res.status(200).json({ message: "Player updated successfully" });
            console.log("Player updated successfully");
        }
        else {
            res.status(404).json({ message: "Player not found" });
        }
        client.close();
    }
})
//for login(creating tokens)
server.post("/token", async (req, res) => {
    if (req.body.email && req.body.password) {
        console.log("Login request received");
        await client.connect();
        const db = await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({ email: req.body.email, password: req.body.password }).toArray();
        if (result.length > 0) {
            const token = libRandom.generate(7);
            const user = result[0];
            await collection.updateOne(
                { _id: new ObjectId(user._id) },
                { $set: { token: token } }
            );

            res.status(200).json({
                message: 'Login Successful',
                token: token

            });
            console.log("Login Successful");
            client.close();
        }
        else {
            res.status(401).json({ message: "Invalid Credentials" });
        }
    }
    else {
        res.status(400).json({ error: "ALL FIELDS REQUIRED" });
    }
})
server.get("/player", async (req, res) => {
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('users');
    const result = await collection.find({ "playing_for":{ $exists:true}}).toArray();
    if (result.length > 0) {
        res.status(200).json(result);
        console.log("Players fetched successfully");
        console.log(result);
    }
    else {
        res.status(404).json({ message: "No players found" });
    }
    client.close();
})
server.delete("/player/:id", async (req, res) => {
await client.connect();
const db = await client.db('IMS');
const collection = await db.collection('users');
const result = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();
if (result.length > 0) {
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ message: "Player deleted successfully" });
    console.log("Player deleted successfully");
}
else 
{
    res.status(404).json({ message: "No player found" });
}
client.close();
})

server.get("/teams",async (req,res)=>
{
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('teams');
    const result = await collection.find().toArray();
    if (result.length > 0) {
        res.status(200).json(result);
        console.log("Teams fetched successfully");
        console.log(result);
    }
    else {
        res.status(404).json({ message: "No teams found" });
    }
    client.close();
})
server.delete("/teams/:id",async (req,res)=>
{
    console.log("delete req recieved");
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('teams');
    const result = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();
    if(result.length>0)
    {
        await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json({ message: "Team deleted successfully" });
        console.log("Team deleted successfully");
    }
    else {
        res.status(404).json({ message: "No team found" });
    }
    client.close();
})
server.get("/teams/:id", async (req, res) => {
    console.log("Team request received");
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('teams');
    const result = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();
    if (result.length > 0) {
        res.status(200).json(result[0]);
        console.log("Team fetched successfully");
    }
    else {
        res.status(404).json({ message: "No team found" });
    }
    client.close();
})
server.put("/teams/:id/updateteam", async (req, res) => 
    {
    console.log("Team update request received");
      await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('teams');
    const result = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();
    if (result.length > 0) {
        const team = result[0];
    
        await collection.updateOne(
                { _id: new ObjectId(team._id) },
                {
                    $set: {
                        team_name: req.body.name,
                        state: req.body.state,
                        color:req.body.color
                    }
                })

       
    }
    else {
        res.status(404).json({ message: "No team found" });
    }
    client.close();
    })
server.get("/player/:id/stats", async (req,res)=>
{ console.log("Player stats request received");
    await client.connect();
    const db = await client.db('IMS');
    const collection = await db.collection('users');
    const result = await collection.find({"_id":new ObjectId(req.params.id)}).toArray();
    if (result.length > 0) {
     res.status(200).json(result[0]);
        console.log("Player stats fetched successfully");
        
    }
    else {
        res.status(404).json({ message: "No players found" });
    }
    client.close();
})
server.post("/teams/create", async (req, res) => {
    if (req.body.name && req.body.state && req.body.color) {
        console.log("Team creation request received");
        await client.connect();
        const db = await client.db('IMS');
        const collection = await db.collection('teams');
        const team = {
            team_name: req.body.name,
            state: req.body.state,
            color: req.body.color
        }
        await collection.insertOne(team);
        res.status(200).json({ message: "Team created successfully" });
        console.log("Team created successfully");
        client.close();
    }
    else {
        res.status(400).json({ message: "All fields are required" });
    }
})
server.post("/player/create", async (req, res) => {
    if (req.body.name && req.body.score && req.body.matches && req.body.playing_for&&req.body.catches&&req.body.wickets) {
        console.log("Player creation request received");
        await client.connect();
        const db = await client.db('IMS');
        const collection = await db.collection('users');
        const player = {
            name: req.body.name,
            score: req.body.score,
            matches: req.body.matches,
            playing_for: req.body.playing_for,
            catches:req.body.catches,
            wickets:req.body.wickets
        }
        await collection.insertOne(player);
        res.status(200).json({ message: "Player created successfully" });
        console.log("Player created successfully");
        client.close();
    }
    else {
        res.status(400).json({ message: "All fields are required" });
    }
})
server.listen(8000, () => {
    console.log("Server is running on port 8000");
})