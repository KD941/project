const libExpress = require('express');
const libCors = require('cors');
const libRandom=require('randomstring');
const {MongoClient}= require('mongodb');
const { ObjectId}=require('mongodb');
const server= libExpress();
server.use(libExpress.json());
const client= new MongoClient('mongodb://Admin:Karmdip123@localhost:27017/IMS?authSource=IMS');

server.use(libCors());
//for signup
server.post('/user/signup',async(req,res)=>
{
    if(req.body.name && req.body.email&&req.body.password&&req.body.phone)
    {await client.connect();
        const db= await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({email: req.body.email}).toArray();
        if(result.length>0)
        {
            res.json({message:"User already exists"});
            console.log("User already exists");
        }
        else{
            const user =
            {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            }
            await collection.insertOne(user);
            res.json({message:"User Created Successfully"});
console.log("User Created Successfully");

        }
        client.close();
    }
    else
    {
        res.json({message:"All fields required"});
    }
})
server.get("user/roles",async(req,res)=>
{
    await client.connect();
    const db= await client.db('IMS');
    const collection = await db.collection('roles');
    const result = await collection.find({token:req.header.token}).toArray();
    if(result.length>0)
    { const user=result[0];
        res.status(200).json({
            admin:user?.is_admin===true,
            team_owner:!!user?.owner_of,
            player:!!user?.playing_for

        })
    }
    else{
        res.status(404).json({message:"No roles found"});
    }
    client.close();
}
)
//for login(creating tokens)
server.post("/token",async (req,res)=>
{
    if(req.body.email && req.body.password)
    {console.log("Login request received");
        await client.connect();
        const db= await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({email: req.body.email,password:req.body.password}).toArray();
        if(result.length>0)
        {
            const token= libRandom.generate(7);
            const user=result[0];
            await collection.updateOne(
                {_id:new ObjectId(user._id)},
                {$set: {token: token}}
            );
      
            res.status(200).json({
                message: 'Login Successful',
                token: token
               
            });
            console.log("Login Successful");
            client.close();
        }
        else{
            res.status(401).json({message:"Invalid Credentials"});
        }
    }
    else{
        res.status(400).json({error:"ALL FIELDS REQUIRED"});
    }
})
server.listen(8000,()=>{
    console.log("Server is running on port 8000");
})