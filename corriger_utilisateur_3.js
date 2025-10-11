// Script pour corriger spécifiquement l'utilisateur connecté (Immatricule 3)

async function corrigerUtilisateur3() {
  try {
    console.log("🔧 Correction spécifique de l'utilisateur 3...");

    // Mettre à jour l'utilisateur 3 avec des données complètes
    const donneesCorrection = {
      Nom: "Randrianarisoa Malalatiana",
      Email: "tiana.randria@etud.univ.edu",
      Mot_de_passe: "etu123",
      Filiere: "Informatique",
      Parcours: "Développement Web",
      Niveau: "M1"
    };

    console.log("📝 Mise à jour de l'utilisateur 3 avec:", donneesCorrection);

    const response = await fetch('http://localhost:5000/etudiants/3', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donneesCorrection)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Utilisateur 3 mis à jour avec succès !");
      console.log("📋 Nouvelles données:", result.user);

      console.log("\n💡 PROCHAINES ÉTAPES:");
      console.log("1. Votre navigateur va utiliser l'ancien localStorage");
      console.log("2. Vous devez vider le cache pour récupérer les nouvelles données");
      console.log("3. Voici comment faire:");

      console.log("\n📋 INSTRUCTIONS POUR VOUS:");
      console.log("1. Ouvrez http://localhost:3000/login");
      console.log("2. Ouvrez la console développeur (F12)");
      console.log("3. Tapez: localStorage.clear()");
      console.log("4. Tapez: location.reload()");
      console.log("5. Reconnectez-vous normalement");
      console.log("6. Allez sur 'Paramètres'");

      console.log("\n🎯 APRÈS RECONNEXION:");
      console.log("Vous devriez voir:");
      console.log("✅ Filière: Informatique");
      console.log("✅ Parcours: Développement Web");
      console.log("✅ Niveau: M1");

    } else {
      console.log("❌ Erreur lors de la mise à jour:", await response.text());
    }

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré");
  }
}

// Exécuter la correction
corrigerUtilisateur3();