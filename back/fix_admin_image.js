// Script temporaire pour corriger la colonne Image de la table admin
// Usage: node back/fix_admin_image.js

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "projet_m1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const fixAdminImage = async () => {
  try {
    console.log("🔧 Correction de la colonne Image pour la table admin...");

    // Vérifier si la colonne Image existe
    const [columns] = await pool.query("DESCRIBE admin");
    const imageColumnExists = columns.some(col => col.Field === 'Image');

    if (!imageColumnExists) {
      console.log("📊 Ajout de la colonne Image à la table admin...");
      await pool.query("ALTER TABLE admin ADD COLUMN Image VARCHAR(255) DEFAULT NULL");
      console.log("✅ Colonne Image ajoutée avec succès");
    } else {
      console.log("✅ Colonne Image existe déjà");
    }

    // Définir une image par défaut pour l'admin
    console.log("🖼️ Définition d'une image par défaut pour l'admin...");
    await pool.query(
      "UPDATE admin SET Image = ? WHERE Id_admin = 1",
      ["/uploads/1760187376266-fond.pnj.PNG"]
    );
    console.log("✅ Image par défaut définie pour l'admin ID 1");

    // Vérifier le résultat
    const [admins] = await pool.query("SELECT Id_admin, Nom, Email, Image FROM admin WHERE Id_admin = 1");
    console.log("📋 Résultat de la vérification:", admins[0]);

    console.log("🎉 Correction terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    pool.end();
  }
};

// Exécuter la correction
fixAdminImage();