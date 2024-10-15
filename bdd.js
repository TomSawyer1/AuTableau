const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

let db;

const connectDB = async () => {
    if (db) {
        return db; // Si déjà connecté, retourne la connexion existante
    }

    try {
        const client = new MongoClient(uri); // Retire les options dépréciées
        await client.connect();
        console.log("MongoDB connected...");
        db = client.db(process.env.MONGODB_DATABASE); // Assigne la base de données
        return db;
    } catch (err) {
        console.error("Erreur de connexion à MongoDB", err);
        process.exit(1); // Quitte si la connexion échoue
    }
};

module.exports = connectDB;