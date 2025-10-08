// Script de test pour les fonctionnalités de modification de projet
const http = require('http');

function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testModificationProjet() {
  console.log('🔧 === TEST DES FONCTIONNALITÉS DE MODIFICATION ===\n');

  try {
    // 1. Tester la modification d'un projet
    console.log('1️⃣ Test de modification du projet 5...');

    const projetModifie = {
      theme: "Système de recommandation pour étudiants (Modifié)",
      description: "Projet modifié pour tester les fonctionnalités",
      date_debut: "2025-10-01",
      date_fin: "2025-12-01",
      id_encadreur: 3,
      id_etudiant: 5,
      id_equipe: 17
    };

    const response = await makeRequest('PUT', 'http://localhost:5000/projets/5', projetModifie);

    if (response.statusCode === 200) {
      console.log('✅ Projet modifié avec succès');
      console.log('Réponse:', response.data);
    } else {
      console.log('❌ Erreur lors de la modification du projet');
      console.log('Status:', response.statusCode);
      console.log('Erreur:', response.data);
    }

    // 2. Vérifier que le projet a été modifié
    console.log('\n2️⃣ Vérification du projet modifié...');
    const projetVerif = await makeRequest('GET', 'http://localhost:5000/projets/5');

    if (projetVerif.statusCode === 200) {
      console.log('✅ Projet récupéré avec succès');
      console.log('Nouveau thème:', projetVerif.data.Theme);
      console.log('Nouvelle description:', projetVerif.data.Description);
    }

    // 3. Tester la modification d'une équipe
    console.log('\n3️⃣ Test de modification de l\'équipe 17...');

    const equipeModifiee = {
      nom_equipe: "Équipe Alpha (Modifiée)",
      membres: [5, 9, 3] // Ajouter l'étudiant 3
    };

    const responseEquipe = await makeRequest('PUT', 'http://localhost:5000/equipes/17', equipeModifiee);

    if (responseEquipe.statusCode === 200) {
      console.log('✅ Équipe modifiée avec succès');
      console.log('Réponse:', responseEquipe.data);
    } else {
      console.log('❌ Erreur lors de la modification de l\'équipe');
      console.log('Status:', responseEquipe.statusCode);
      console.log('Erreur:', responseEquipe.data);
    }

    // 4. Vérifier les membres de l'équipe modifiée
    console.log('\n4️⃣ Vérification des membres de l\'équipe modifiée...');
    const membresEquipe = await makeRequest('GET', 'http://localhost:5000/projets/5/equipe');

    if (membresEquipe.statusCode === 200) {
      console.log('✅ Membres de l\'équipe récupérés');
      console.log(`Nombre de membres: ${membresEquipe.data.length}`);
      membresEquipe.data.forEach((membre, index) => {
        console.log(`   ${index + 1}. ${membre.Nom} (${membre.Immatricule})`);
      });
    }

    // 5. Tester la route des projets de l'étudiant
    console.log('\n5️⃣ Test de la route des projets de l\'étudiant 5...');
    const projetsEtudiant = await makeRequest('GET', 'http://localhost:5000/etudiants/5/projets');

    if (projetsEtudiant.statusCode === 200) {
      console.log('✅ Projets de l\'étudiant récupérés');
      console.log(`Nombre de projets: ${projetsEtudiant.data.length}`);
      projetsEtudiant.data.forEach((projet, index) => {
        console.log(`   ${index + 1}. ${projet.Theme} (Équipe: ${projet.Id_equipe || 'Aucune'})`);
      });
    }

    console.log('\n🎉 TESTS DE MODIFICATION TERMINÉS');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testModificationProjet();