// Script pour corriger les données NULL dans la base de données
// Utilise fetch pour appeler l'API existante

async function corrigerDonneesNull() {
  try {
    console.log("🔧 Correction des données NULL dans la base de données...");

    // Récupérer tous les étudiants
    const response = await fetch('http://localhost:5000/etudiants');
    const etudiants = await response.json();

    console.log(`📋 Traitement de ${etudiants.length} étudiants...`);

    for (const etudiant of etudiants) {
      // Vérifier si les champs sont NULL
      if (!etudiant.Filiere || !etudiant.Parcours) {
        console.log(`🔧 Mise à jour de ${etudiant.Nom} (${etudiant.Immatricule})`);

        // Préparer les nouvelles données
        const donneesCorrigees = {
          Nom: etudiant.Nom,
          Email: etudiant.Email,
          Mot_de_passe: etudiant.Mot_de_passe,
          Filiere: etudiant.Filiere || 'Informatique',
          Parcours: etudiant.Parcours || 'Développement Web'
        };

        try {
          // Mettre à jour via l'API PUT
          const updateResponse = await fetch(`http://localhost:5000/etudiants/${etudiant.Immatricule}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(donneesCorrigees)
          });

          if (updateResponse.ok) {
            console.log(`✅ ${etudiant.Nom} mis à jour avec Filière: ${donneesCorrigees.Filiere}, Parcours: ${donneesCorrigees.Parcours}`);
          } else {
            console.log(`❌ Erreur mise à jour ${etudiant.Nom}:`, await updateResponse.text());
          }
        } catch (updateError) {
          console.log(`❌ Erreur lors de la mise à jour de ${etudiant.Nom}:`, updateError.message);
        }
      } else {
        console.log(`✅ ${etudiant.Nom} a déjà des données complètes`);
      }
    }

    console.log("\n🔍 Vérification finale...");
    const finalResponse = await fetch('http://localhost:5000/etudiants');
    const etudiantsFinaux = await finalResponse.json();

    let compteMisAJour = 0;
    for (const etudiant of etudiantsFinaux) {
      if (etudiant.Filiere && etudiant.Parcours) {
        compteMisAJour++;
      }
    }

    console.log(`✅ ${compteMisAJour}/${etudiantsFinaux.length} étudiants ont maintenant des données complètes`);

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré sur le port 5000");
  }
}

// Exécuter la correction
corrigerDonneesNull();