// Diagnostic complet du système de paramètres

async function diagnosticComplet() {
  try {
    console.log("🔍 DIAGNOSTIC COMPLET DU SYSTÈME...");
    console.log("=====================================");

    // 1. Vérifier si le serveur répond
    console.log("\n1️⃣ Test de connexion au serveur...");
    try {
      const healthResponse = await fetch('http://localhost:5000/health');
      const healthData = await healthResponse.json();
      console.log("✅ Serveur backend répond correctement");
      console.log("📊 Status:", healthData);
    } catch (error) {
      console.log("❌ Serveur backend ne répond pas");
      console.log("💡 Démarrez le serveur: cd back && npm start");
      return;
    }

    // 2. Vérifier les données des étudiants
    console.log("\n2️⃣ Vérification des données étudiants...");
    try {
      const etudiantsResponse = await fetch('http://localhost:5000/etudiants');
      const etudiants = await etudiantsResponse.json();
      console.log(`✅ ${etudiants.length} étudiants récupérés`);

      console.log("\n📋 Données détaillées:");
      etudiants.forEach((etudiant, index) => {
        console.log(`${index + 1}. ${etudiant.Nom}:`);
        console.log(`   - Filière: ${etudiant.Filiere || 'NULL'}`);
        console.log(`   - Parcours: ${etudiant.Parcours || 'NULL'}`);
        console.log(`   - Niveau: ${etudiant.Niveau || 'NULL'}`);
      });

    } catch (error) {
      console.log("❌ Erreur récupération étudiants:", error.message);
      return;
    }

    // 3. Tester la connexion avec un utilisateur
    console.log("\n3️⃣ Test de connexion...");
    try {
      const loginResponse = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'malala.rakoto@etud.univ.edu',
          password: 'etu123',
          role: 'etudiant'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log("✅ Connexion réussie !");
        console.log("📋 Données reçues:");
        console.log(`   - Nom: ${loginData.user.Nom}`);
        console.log(`   - Filière: ${loginData.user.Filiere || 'NULL'}`);
        console.log(`   - Parcours: ${loginData.user.Parcours || 'NULL'}`);
        console.log(`   - Niveau: ${loginData.user.Niveau || 'NULL'}`);

        // Vérifier que toutes les données sont présentes
        if (loginData.user.Filiere && loginData.user.Parcours && loginData.user.Niveau) {
          console.log("✅ Toutes les données sont présentes dans la réponse du serveur");
        } else {
          console.log("❌ Des données sont manquantes dans la réponse du serveur");
        }
      } else {
        console.log("❌ Échec de connexion:", await loginResponse.text());
      }
    } catch (error) {
      console.log("❌ Erreur de connexion:", error.message);
    }

    // 4. Vérifier le frontend
    console.log("\n4️⃣ Vérification du frontend...");
    console.log("💡 Ouvrez votre navigateur et allez sur:");
    console.log("   http://localhost:3000/login");
    console.log("   Connectez-vous avec:");
    console.log("   Email: malala.rakoto@etud.univ.edu");
    console.log("   Mot de passe: etu123");
    console.log("   Allez sur 'Paramètres'");

    console.log("\n🔍 Dans la console développeur (F12), tapez:");
    console.log("   1. localStorage.getItem('user')");
    console.log("   2. JSON.parse(localStorage.getItem('user'))");

    console.log("\n📋 Vous devriez voir:");
    console.log("   - Filiere: 'Informatique'");
    console.log("   - Parcours: 'Réseaux'");
    console.log("   - Niveau: 'M1'");

    console.log("\n💡 Si les données sont présentes dans localStorage mais pas dans le formulaire:");
    console.log("   Il y a un problème avec le code du formulaire");

    console.log("\n💡 Si les données ne sont pas dans localStorage:");
    console.log("   Il y a un problème avec la route de login");

  } catch (err) {
    console.error("❌ Erreur générale:", err.message);
  }
}

// Exécuter le diagnostic
diagnosticComplet();