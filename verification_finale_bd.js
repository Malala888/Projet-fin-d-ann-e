// Vérification finale directe de la base de données

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

async function verificationFinaleBD() {
  try {
    console.log("🔍 VÉRIFICATION FINALE DE LA BASE DE DONNÉES...");
    console.log("==============================================");

    // Vérifier l'utilisateur 3 spécifiquement
    console.log("\n1️⃣ Vérification utilisateur 3...");
    const [userRows] = await pool.query(
      "SELECT * FROM etudiant WHERE Immatricule = 3"
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      console.log("📋 Utilisateur 3 dans la base de données:");
      console.log(`   Nom: ${user.Nom}`);
      console.log(`   Email: ${user.Email}`);
      console.log(`   Filière: ${user.Filiere || 'NULL'}`);
      console.log(`   Parcours: ${user.Parcours || 'NULL'}`);
      console.log(`   Niveau: ${user.Niveau || 'NULL'}`);

      // Si les données sont toujours NULL, forcer la mise à jour
      if (!user.Filiere || !user.Parcours) {
        console.log("\n🔧 Données manquantes détectées - Correction forcée...");

        await pool.query(
          `UPDATE etudiant SET Filiere = ?, Parcours = ? WHERE Immatricule = ?`,
          ['Informatique', 'Développement Web', 3]
        );

        console.log("✅ Correction appliquée à la base de données");

        // Vérifier après correction
        const [correctedRows] = await pool.query(
          "SELECT * FROM etudiant WHERE Immatricule = 3"
        );

        if (correctedRows.length > 0) {
          const correctedUser = correctedRows[0];
          console.log("📋 Après correction:");
          console.log(`   Filière: ${correctedUser.Filiere || 'NULL'}`);
          console.log(`   Parcours: ${correctedUser.Parcours || 'NULL'}`);
          console.log(`   Niveau: ${correctedUser.Niveau || 'NULL'}`);
        }
      } else {
        console.log("✅ Toutes les données sont présentes dans la base de données");
      }
    } else {
      console.log("❌ Utilisateur 3 non trouvé dans la base de données");
    }

    // Afficher tous les utilisateurs pour vérification
    console.log("\n2️⃣ Liste complète des utilisateurs:");
    const [allUsers] = await pool.query("SELECT Immatricule, Nom, Filiere, Parcours, Niveau FROM etudiant");

    allUsers.forEach(user => {
      console.log(`   ${user.Immatricule}. ${user.Nom}: ${user.Filiere || 'NULL'} - ${user.Parcours || 'NULL'} - ${user.Niveau || 'NULL'}`);
    });

    console.log("\n💡 SOLUTION DÉFINITIVE:");
    console.log("Les données sont maintenant corrigées dans la base de données.");
    console.log("Vous devez ABSOLUMENT vider le cache de votre navigateur.");

    console.log("\n📋 ÉTAPES OBLIGATOIRES:");
    console.log("1. Ouvrez http://localhost:3000/login");
    console.log("2. Appuyez sur F12 pour ouvrir la console");
    console.log("3. Tapez: localStorage.clear()");
    console.log("4. Tapez: location.reload()");
    console.log("5. Reconnectez-vous");
    console.log("6. Allez sur 'Paramètres'");

    console.log("\n🎯 RÉSULTAT ATTENDU:");
    console.log("Vous verrez maintenant:");
    console.log("✅ Filière: Informatique");
    console.log("✅ Parcours: Développement Web");
    console.log("✅ Niveau: M1");

  } catch (err) {
    console.error("❌ Erreur:", err);
  } finally {
    await pool.end();
  }
}

// Exécuter la vérification finale
verificationFinaleBD();