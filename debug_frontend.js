// Script de débogage pour tester la logique frontend
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Erreur parsing JSON: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function debugFrontend() {
  try {
    console.log('🔍 === DÉBOGAGE LOGIQUE FRONTEND ===\n');

    // Étape 1: Récupérer le projet 5
    console.log('1️⃣ Récupération du projet 5...');
    const projet = await makeRequest('http://localhost:5000/projets/5');

    console.log(`📋 Projet: ${projet.Theme}`);
    console.log(`🏷️ Id_equipe: ${projet.Id_equipe}`);

    // Étape 2: Vérifier la condition comme dans le frontend
    console.log(`\n2️⃣ Vérification condition équipe:`);
    console.log(`   - projet.Id_equipe existe: ${!!projet.Id_equipe}`);
    console.log(`   - Condition if (projet.Id_equipe): ${projet.Id_equipe ? 'OUI' : 'NON'}`);

    if (projet.Id_equipe) {
      // Étape 3: Récupérer les membres comme dans le frontend
      console.log(`\n3️⃣ Récupération des membres d'équipe...`);
      const membresEquipe = await makeRequest('http://localhost:5000/projets/5/equipe');

      console.log(`📊 Nombre de membres reçus: ${membresEquipe.length}`);
      console.log(`👥 Membres:`, membresEquipe.map(m => `${m.Nom} (${m.Immatricule})`));

      // Étape 4: Logique de rendu comme dans le frontend
      console.log(`\n4️⃣ Logique de rendu:`);
      const membres = membresEquipe.length > 0 ? membresEquipe : [];
      console.log(`   - membresEquipe.length: ${membresEquipe.length}`);
      console.log(`   - membres.length: ${membres.length}`);
      console.log(`   - membres.length > 0: ${membres.length > 0}`);

      if (membres.length > 0) {
        console.log(`✅ AFFICHERA LES MEMBRES:`);
        membres.forEach((membre, index) => {
          console.log(`   ${index + 1}. ${membre.Nom} (${membre.Immatricule}) - ${membre.Email}`);
        });
      } else {
        console.log(`❌ AFFICHERA LE MESSAGE "PROJET INDIVIDUEL"`);
      }
    } else {
      console.log(`❌ PROJET SANS ÉQUIPE - AFFICHERA "PROJET INDIVIDUEL"`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugFrontend();