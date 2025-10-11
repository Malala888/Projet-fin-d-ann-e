// Script pour forcer la mise à jour des données utilisateur dans le navigateur

async function forcerMiseAJourUtilisateur() {
  try {
    console.log("🔧 Forçage de la mise à jour des données utilisateur...");

    // Récupérer tous les étudiants
    const response = await fetch('http://localhost:5000/etudiants');
    const etudiants = await response.json();

    console.log(`📋 ${etudiants.length} étudiants trouvés`);

    // Afficher les données avec leurs emails pour identification
    etudiants.forEach((etudiant, index) => {
      console.log(`${index + 1}. ${etudiant.Nom} (${etudiant.Immatricule}):`);
      console.log(`   Email: ${etudiant.Email}`);
      console.log(`   Filière: ${etudiant.Filiere || 'NULL'}`);
      console.log(`   Parcours: ${etudiant.Parcours || 'NULL'}`);
      console.log(`   Niveau: ${etudiant.Niveau || 'NULL'}`);
      console.log("---");
    });

    console.log("\n💡 POUR RÉSOUDRE LE PROBLÈME:");
    console.log("Le problème vient du fait que votre navigateur a un ancien localStorage");
    console.log("Voici les étapes pour le corriger:");

    console.log("\n📋 ÉTAPE 1 - Ouvrez votre navigateur:");
    console.log("   • Allez sur http://localhost:3000/login");
    console.log("   • Ouvrez la console développeur (F12)");

    console.log("\n📋 ÉTAPE 2 - Videz le localStorage:");
    console.log("   • Dans la console, tapez: localStorage.clear()");
    console.log("   • Puis tapez: location.reload()");

    console.log("\n📋 ÉTAPE 3 - Reconnectez-vous:");
    console.log("   • Reconnectez-vous avec vos identifiants");
    console.log("   • Allez sur la page 'Paramètres'");

    console.log("\n📋 ÉTAPE 4 - Vérifiez les données:");
    console.log("   • Dans la console, tapez: JSON.parse(localStorage.getItem('user'))");
    console.log("   • Vous devriez voir Filiere, Parcours et Niveau remplis");

    console.log("\n🎯 DONNÉES DISPONIBLES:");
    etudiants.forEach(etudiant => {
      if (etudiant.Filiere && etudiant.Parcours && etudiant.Niveau) {
        console.log(`✅ ${etudiant.Nom}: ${etudiant.Filiere} - ${etudiant.Parcours} - ${etudiant.Niveau}`);
      }
    });

    console.log("\n🚨 SI LES DONNÉES SONT VIDES:");
    console.log("   Votre utilisateur dans la base de données n'a pas été mis à jour.");
    console.log("   Utilisez l'un des utilisateurs existants qui ont des données complètes.");

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré");
  }
}

// Exécuter le script
forcerMiseAJourUtilisateur();