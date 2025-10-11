// Test simple pour vérifier les données utilisateur
// Utilise l'API existante au lieu de se connecter directement à MySQL

const axios = require('axios');

async function testerDonneesUtilisateur() {
  try {
    console.log("🔍 Test de récupération des données utilisateur...");

    // Récupérer tous les étudiants via l'API
    const response = await axios.get('http://localhost:5000/etudiants');
    const etudiants = response.data;

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

    // Tester la connexion avec un utilisateur spécifique (utilisez vos vraies données)
    console.log("\n🔐 Test de connexion...");
    try {
      const loginResponse = await axios.post('http://localhost:5000/login', {
        email: 'votre.email@etud.univ.edu', // Remplacez par votre email
        password: 'votre_mot_de_passe',     // Remplacez par votre mot de passe
        role: 'etudiant'
      });

      console.log("✅ Connexion réussie !");
      console.log("📋 Données reçues:", loginResponse.data.user);

      const user = loginResponse.data.user;
      console.log(`👤 Utilisateur connecté: ${user.Nom}`);
      console.log(`   Filière: ${user.Filiere || 'NULL'}`);
      console.log(`   Parcours: ${user.Parcours || 'NULL'}`);
      console.log(`   Niveau: ${user.Niveau || 'NULL'}`);

    } catch (loginError) {
      console.log("❌ Erreur de connexion:", loginError.response?.data || loginError.message);
      console.log("💡 Assurez-vous que le serveur backend est démarré: cd back && npm start");
    }

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré sur le port 5000");
  }
}

// Exécuter le test
testerDonneesUtilisateur();