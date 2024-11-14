const express = require('express');
const { ObjectId } = require('mongodb'); // Pour gérer les ObjectId de MongoDB
require('dotenv').config(); // Charger les variables d'environnement
const connectdb = require('./bdd'); // Connexion à la base MongoDB
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Fonction utilitaire pour vérifier les ObjectId
function isValidObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

// ---------------------  CLASS ------------------- //

// Obtenir toutes les classes
app.get('/classrooms', async (req, res) => {
    try {
        const db = await connectdb();
        const classrooms = await db.collection('classrooms').find().toArray();
        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Ajt une class
app.post('/classrooms', async (req, res) => {
    try {
        const db = await connectdb();
        const { name } = req.body;

        if (!name) {
            return res.status(422).json({ error: "Le paramètre 'name' est manquant" });
        }

        const duplicate = await db.collection('classrooms').findOne({ name });
        if (duplicate) {
            return res.status(409).json({ error: 'La classe existe déjà' });
        }

        const newClass = { name, students: [] }; // Ajouter un tableau d'étudiants vide
        await db.collection('classrooms').insertOne(newClass);
        res.status(201).json({ message: 'Classe créée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Modifier une class
app.put('/classrooms/:id', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.id;
        const { name } = req.body;

        if (!isValidObjectId(classroomId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        if (!name) {
            return res.status(422).json({ error: "Le paramètre 'name' est manquant" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: 'Classe introuvable' });
        }

        await db.collection('classrooms').updateOne({ _id: new ObjectId(classroomId) }, { $set: { name } });
        res.status(200).json({ message: 'Classe modifiée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supp une class
app.delete('/classrooms/:id', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.id;

        if (!isValidObjectId(classroomId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: 'Classe introuvable' });
        }

        await db.collection('classrooms').deleteOne({ _id: new ObjectId(classroomId) });
        res.status(204).send(); // No Content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// --------------------- STUDENT ------------------- //

// cherche tous les students
app.get('/classrooms/:classroom_id/students', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.classroom_id;

        if (!isValidObjectId(classroomId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: 'Classe introuvable' });
        }

        res.status(200).json(classroom.students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Ajt un student à une class
app.post('/classrooms/:classroom_id/students', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.classroom_id;
        const { name } = req.body;

        if (!isValidObjectId(classroomId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        if (!name) {
            return res.status(422).json({ error: "Le paramètre 'name' est manquant" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: 'Classe introuvable' });
        }

        const studentExists = classroom.students.some(student => student.name === name);
        if (studentExists) {
            return res.status(409).json({ error: 'L\'étudiant existe déjà dans cette classe' });
        }

        const newStudent = { _id: new ObjectId(), name };
        await db.collection('classrooms').updateOne(
            { _id: new ObjectId(classroomId) },
            { $push: { students: newStudent } }
        );

        res.status(201).json({ message: 'Étudiant ajouté avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supp un student d'une class
app.delete('/classrooms/:classroom_id/students/:student_id', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.classroom_id;
        const studentId = req.params.student_id;

        if (!isValidObjectId(classroomId) || !isValidObjectId(studentId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: 'Classe introuvable' });
        }

        await db.collection('classrooms').updateOne(
            { _id: new ObjectId(classroomId) },
            { $pull: { students: { _id: new ObjectId(studentId) } } }
        );

        res.status(204).send(); // No Content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.put('/classrooms/:classroom_id/students/:student_id', async (req, res) => {
    try {
        const db = await connectdb();
        const classroomId = req.params.classroom_id;
        const studentId = req.params.student_id;
        const { name } = req.body;

        if (!ObjectId.isValid(classroomId) || !ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: "L'ID fourni est invalide" });
        }

        if (!name) {
            return res.status(422).json({ error: "Le paramètre 'name' est manquant" });
        }

        const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(classroomId) });
        if (!classroom) {
            return res.status(404).json({ error: "Classe introuvable" });
        }

        const studentIndex = classroom.students.findIndex((student) => student._id.toString() === studentId);
        if (studentIndex === -1) {
            return res.status(404).json({ error: "Étudiant introuvable dans la classe" });
        }

        classroom.students[studentIndex].name = name;

        await db.collection('classrooms').updateOne(
            { _id: new ObjectId(classroomId) },
            { $set: { students: classroom.students } }
        );

        res.status(200).json({ message: "Étudiant modifié avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// --------------------- LANCEMENT DU SERVEUR ------------------- //
app.listen(port, () => {
    console.log(`Serveur OP sur http://localhost:${port}`);
});
