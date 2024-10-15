const express = require ("express")
require('dotenv').config(); // pour recuperer les les infos dans le .env
const port = process.env.port || 5000 // pour le .env
const connectdb = require("./bdd");
const app = express();
app.use (express.json()); // Express analyse le contenue json

// Creations de route vers bdd

// App get pour recuperer toute les liste dans classrooms
app.get("/classrooms",async (req,res) => {
// res = ce que l'user recois (generalement en JSON)
// req = ce que l'user envois

try{

const db = await connectdb();
const classrooms = await db.collection('classrooms').find().toArray();
//status 200 : c'est OP
res.status(200).json(classrooms);
} catch(error){
    console.error(error);
    res.status(500).json({erreur:"Erreur serveur"})

}


});

// Ajout d'une classe
app.post("/classrooms",async (req,res) => {
    // res = ce que l'user recois (generalement en JSON)
    // req = ce que l'user envois
    
    try{

    const db = await connectdb();
    const {name} = req.body;
    if (!name) {
        return res.status(422).json({error:"il manque le paramètre 'name'"})
    }

    //verifié si il y a des doublons

    const double = await db.collection('classrooms').findOne({name:name})

    if (double) {
        return res.status(409).json({error:"Le paramètre 'name' existe déja"})
    }

    await db.collection('classrooms').insertOne({name:name})

    res.status(201).json({message: "Created"});
    
    } catch(error){
        console.error(error);
        res.status(500).json({erreur:"Erreur serveur"})
    
    }
    
    
    });


app.listen(port, () => {
    console.log("Serveur OP",port);
})