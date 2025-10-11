// Script de vérification et correction des données étudiant
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

async function verifierEtCorrigerDonneesEtudiant() {
  try {
    console.log("🔍 Vérification des données étudiants...");

    // Récupérer tous les étudiants
    const [etudiants] = await pool.query("SELECT * FROM etudiant");
    console.log(`📋 ${etudiants.length} étudiants trouvés`);

    for (const etudiant of etudiants) {
      console.log(`\n👤 Étudiant: ${etudiant.Nom} (${etudiant.Immatricule})`);
      console.log(`   Email: ${etudiant.Email}`);
      console.log(`   Filière: ${etudiant.Filiere || 'NULL'}`);
      console.log(`   Parcours: ${etudiant.Parcours || 'NULL'}`);
      console.log(`   Niveau: ${etudiant.Niveau || 'NULL'}`);

      // Si les champs sont NULL ou vides, les mettre à jour
      if (!etudiant.Filiere || !etudiant.Parcours || !etudiant.Niveau) {
        console.log(`🔧 Mise à jour des données manquantes...`);

        await pool.query(
          `UPDATE etudiant SET Filiere = ?, Parcours = ?, Niveau = ? WHERE Immatricule = ?`,
          [
            etudiant.Filiere || 'Informatique',
            etudiant.Parcours || 'Développement Web',
            etudiant.Niveau || 'M1',
            etudiant.Immatricule
          ]
        );

        console.log(`✅ Données mises à jour pour ${etudiant.Nom}`);
      }
    }

    // Vérifier les données après mise à jour
    console.log("\n🔍 Vérification après mise à jour...");
    const [etudiantsAfter] = await pool.query("SELECT * FROM etudiant WHERE Filiere IS NOT NULL AND Parcours IS NOT NULL AND Niveau IS NOT NULL");
    console.log(`✅ ${etudiantsAfter.length} étudiants ont maintenant toutes leurs données`);

    for (const etudiant of etudiantsAfter) {
      console.log(`   ${etudiant.Nom}: ${etudiant.Filiere} - ${etudiant.Parcours} - ${etudiant.Niveau}`);
    }

  } catch (err) {
    console.error("❌ Erreur:", err);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
verifierEtCorrigerDonneesEtudiant();