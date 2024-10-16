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

    //Supprimer une classe
    app.delete("/classrooms/:id", async (req, res) => {
        try {
            const db = await connectdb();
            const classroomId = req.params.id; // Récupérer l'ID de la classe depuis les paramètres de l'URL
            
            // Recherche de la classe avec l'ID
            const result = await db.collection('classrooms').findOne({ _id: new require('mongodb').ObjectId(classroomId) });
            
            if (!result) {
                // 404 si la classe n'existe pas
                return res.status(404).json({ error: "La classe n'existe pas." });
            }
    
            // Suppression 
            await db.collection('classrooms').deleteOne({ _id: new require('mongodb').ObjectId(classroomId) });
    
            // 204 No content si la suppression est réussie
            res.status(204).json();
    
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });

    //Modifier une classe
    app.put("/classrooms/:id", async (req, res) => {
        try {

            const db = await connectdb();
            const classroomId = req.params.id;
            const { name } = req.body;
    
            if (!name) {
                return res.status(422).json({ error: "Le paramètre name est manquant." });
            }

            // si la classe existe pas
            const existingClassroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
            if (!existingClassroom) {
                return res.status(404).json({ error: "La classe n'existe pas." });
            }


            // le nom de la classe existe deja
            const duplicateClass = await db.collection('classrooms').findOne({ name });
            if (duplicateClass && duplicateClass._id.toString() !== classroomId) {
                return res.status(409).json({ error: "Le paramètre 'name' existe déjà." });
            }

            
            // requete d'update en fonction de l'id
            await db.collection('classrooms').updateOne({ _id: new ObjectId(classroomId) }, { $set: { name } }); // .updateOne est toujours acompagne de $set
            res.status(200).json({ message: "Ok" });

        } catch (err) {

            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }); 
     


app.listen(port, () => {
    console.log("Serveur OP",port);
})