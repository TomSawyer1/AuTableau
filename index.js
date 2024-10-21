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

//--------------------- CLASSE -------------------//

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
     
//--------------------- STUDENTS -------------------//

// App get pour recuperer la liste des etudiants
app.get("/classrooms/:classroom_id/students",async (req,res) => {
    // res = ce que l'user recois (generalement en JSON)
    // req = ce que l'user envois
    
    try{
    
    const db = await connectdb();
    const students = await db.collection('students').find().toArray();
    //status 200 : c'est OP
    res.status(200).json(students);
    } catch(error){
        console.error(error);
        res.status(500).json({erreur:"Erreur serveur"})
    
    }
    
    });


    // ajouter un etudiant dans une classe
    app.post("/classrooms/:classroom_id/students", async (req, res) => {
        try {
            const db = await connectdb(); // Connexion à la base de données
    
            const classroomId = req.params.classroom_id; 
            const { name } = req.body; 
    
            
            if (!name) {
                return res.status(422).json({ error: "Il manque le paramètre 'name'" });
            }
    
            
            const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
            if (!classroom) {
                return res.status(404).json({ error: "Classe non trouvée" });
            }
    
            
            const studentExists = classroom.students.some(student => student.name === name);
            if (studentExists) {
                return res.status(409).json({ error: "Le paramètre 'name' existe déjà dans la classe" });
            }
    
            
            const updatedClassroom = await db.collection('classrooms').updateOne(
                { _id: new ObjectId(classroomId) },
                { $push: { students: { name } } } // Ajouter l'étudiant à la liste des étudiants
            );
    
            if (updatedClassroom.modifiedCount === 0) {
                return res.status(400).json({ error: "Impossible d'ajouter l'étudiant" });
            }
    
            // Succès : étudiant ajouté
            res.status(201).json({ message: "Étudiant ajouté avec succès" });
    
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });


    //Supprimer un etudiant

    app.delete("/classrooms/:classroom_id/students/:student_id", async (req, res) => {
        try {
            const db = await connectdb(); 
    
            const classroomId = req.params.classroom_id; 
            const studentId = req.params.student_id; 
    
            
            const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
            if (!classroom) {
                return res.status(404).json({ error: "La classe n'éxiste pas ou l'étudiant n'éxiste pas" });
            }
    
            // Vérifier si l'étudiant existe dans la classe
            const studentIndex = classroom.students.findIndex(student => student._id.toString() === studentId);
            if (studentIndex === -1) {
                return res.status(404).json({ error: "La classe n'éxiste pas ou l'étudiant n'éxiste pas" });
            }
    
            // Supprimer l'étudiant de la classe
            const updatedClassroom = await db.collection('classrooms').updateOne(
                { _id: new ObjectId(classroomId) },
                { $pull: { students: { _id: new ObjectId(studentId) } } } // Retirer l'étudiant correspondant à l'ID
            );
    
            if (updatedClassroom.modifiedCount === 0) {
                return res.status(400).json({ error: "Impossible de supprimer l'étudiant" });
            }
    
            res.status(204).json({ message: "No content" });
    
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });
        

    // modifier un etudiant
    app.put("/:classroom_id/students/:student_id", async (req, res) => {
        try {
            const db = await connectdb();
            const classroomId = req.params.classroom_id;
            const studentId = req.params.student_id;
            const { name } = req.body;

            if (!name) {
                return res.status(422).json({ error: "Le paramètre name est manquant." });
            }

            // Vérifier si la classe et l'étudiant existent
            const student = await db.collection('students').findOne({ _id: new ObjectId(studentId), classroom_id: new ObjectId(classroomId) });
            if (!student) {
                return res.status(404).json({ error: "L'étudiant ou la classe n'existe pas." });
            }

            // Vérifier s'il existe un étudiant avec le même nom dans la classe
            const duplicateStudent = await db.collection('students').findOne({ name, classroom_id: new ObjectId(classroomId) });
            if (duplicateStudent && duplicateStudent._id.toString() !== studentId) {
                return res.status(409).json({ error: "Le nom de l'étudiant existe déjà dans cette classe." });
            }

            // Mise à jour de l'étudiant
            await db.collection('students').updateOne({ _id: new ObjectId(studentId) }, { $set: { name } });
            res.status(200).json({ message: "Étudiant mis à jour." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });


app.listen(port, () => {
    console.log("Serveur OP",port);
})