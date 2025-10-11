// Script de debug pour vérifier les données de l'utilisateur connecté

async function debugUtilisateurConnecte() {
  try {
    console.log("🔍 Debug des données utilisateur...");

    // Récupérer tous les étudiants pour voir les données actuelles
    const response = await fetch('http://localhost:5000/etudiants');
    const etudiants = await response.json();

    console.log("📋 État actuel de la base de données:");
    etudiants.forEach(etudiant => {
      console.log(`👤 ${etudiant.Nom} (${etudiant.Immatricule}):`);
      console.log(`   - Filière: ${etudiant.Filiere || 'NULL'}`);
      console.log(`   - Parcours: ${etudiant.Parcours || 'NULL'}`);
      console.log(`   - Niveau: ${etudiant.Niveau || 'NULL'}`);
      console.log(`   - Email: ${etudiant.Email}`);
      console.log("---");
    });

    console.log("\n💡 INSTRUCTIONS POUR DEBUG:");
    console.log("1. Ouvrez http://localhost:3000/login");
    console.log("2. Connectez-vous avec vos identifiants");
    console.log("3. Ouvrez la console développeur (F12)");
    console.log("4. Tapez cette commande:");
    console.log("   JSON.parse(localStorage.getItem('user'))");
    console.log("5. Vérifiez les valeurs de Filiere, Parcours et Niveau");
    console.log("6. Si elles sont null, c'est que votre utilisateur n'a pas été mis à jour");

    // Tester avec un utilisateur spécifique (remplacez par vos vraies données)
    console.log("\n🔐 Test de connexion avec un utilisateur existant...");
    try {
      const loginResponse = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'malala.rakoto@etud.univ.edu', // Utilisateur qui a des données
          password: 'etu123',
          role: 'etudiant'
        })
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        console.log("✅ Connexion réussie !");
        console.log("📋 Données reçues:", data.user);

        const user = data.user;
        console.log(`👤 Utilisateur: ${user.Nom}`);
        console.log(`   - Filière: ${user.Filiere || 'NULL'}`);
        console.log(`   - Parcours: ${user.Parcours || 'NULL'}`);
        console.log(`   - Niveau: ${user.Niveau || 'NULL'}`);
      } else {
        console.log("❌ Erreur de connexion:", await loginResponse.text());
      }
    } catch (loginError) {
      console.log("❌ Erreur de connexion:", loginError.message);
    }

  } catch (err) {
    console.error("❌ Erreur:", err.message);
  }
}

// Exécuter le debug
debugUtilisateurConnecte();