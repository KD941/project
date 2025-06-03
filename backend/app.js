const libExpress = require('express');
const libCors = require('cors');
const {MongoClient}= require('mongodb');
const server= libExpress();
server.use(libExpress.json());
const client= new MongoClient('mongodb://Admin:Karmdip123@localhost:27017/IMS?authSource=IMS');

server.use(libCors());
//for signup
server.post('/user/signup',async(req,res)=>
{
    if(req.body.name&&req.body.email&&req.body.password&&req.body.phone)
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
    }
    else
    {
        res.json({message:"All fields required"});
    }
})

server.listen(8000,()=>{
    console.log("Server is running on port 8000");
})