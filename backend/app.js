const libExpress = require('express');
const libCors = require('cors');
const libRandom=require('randomstring');
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
        client.close();
    }
    else
    {
        res.json({message:"All fields required"});
    }
})

//for login(creating tokens)
server.post("/user/login",async (req,res)=>
{
    if(req.body.email&&req.body.password)
    {
        await client.connect();
        const db= await client.db('IMS');
        const collection = await db.collection('users');
        const result = await collection.find({email: req.body.email,password:req.body.password}).toArray();
        if(result.length>0)
        {
            const token= libRandom.generate(7);
            const user=result[0]
            await collection.updateOne(
                {email: req.body.email},
                {$set: {token: token}}
            );
            res.json({message:'Login Successful',token: token});
            console.log("Login Successful");
            localStorage.setItem('token', token);

        }
        else{
            res.json({message:"Invalid Credentials"});
            console.log("Invalid Credentials");
        }


    }
    else{
        res.json({error:"ALL FIELDS REQUIRED"});
    }
})
server.listen(8000,()=>{
    console.log("Server is running on port 8000");
})