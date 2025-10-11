// Test simple pour vérifier les données utilisateur
// Utilise fetch au lieu d'axios

async function testerDonneesUtilisateur() {
  try {
    console.log("🔍 Test de récupération des données utilisateur...");

    // Récupérer tous les étudiants via l'API
    const response = await fetch('http://localhost:5000/etudiants');
    const etudiants = await response.json();

    console.log(`📋 ${etudiants.length} étudiants trouvés via l'API`);

    for (const etudiant of etudiants) {
      console.log(`\n👤 Étudiant: ${etudiant.Nom} (${etudiant.Immatricule})`);
      console.log(`   Email: ${etudiant.Email}`);
      console.log(`   Filière: ${etudiant.Filiere || 'NULL'}`);
      console.log(`   Parcours: ${etudiant.Parcours || 'NULL'}`);
      console.log(`   Niveau: ${etudiant.Niveau || 'NULL'}`);

      // Afficher les données brutes pour debug
      console.log(`   Données brutes:`, {
        Filiere: etudiant.Filiere,
        Parcours: etudiant.Parcours,
        Niveau: etudiant.Niveau
      });
    }

    console.log("\n💡 INSTRUCTIONS POUR VOUS:");
    console.log("1. Ouvrez votre navigateur");
    console.log("2. Allez sur http://localhost:3000/login");
    console.log("3. Connectez-vous avec vos identifiants");
    console.log("4. Ouvrez la console développeur (F12)");
    console.log("5. Tapez: localStorage.getItem('user')");
    console.log("6. Vérifiez si Filiere et Parcours sont présents");

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré sur le port 5000");
  }
}

// Exécuter le test
testerDonneesUtilisateur();