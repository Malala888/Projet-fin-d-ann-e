// Script de test pour diagnostiquer le problème d'affichage des équipes
const mysql = require('./back/node_modules/mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projet_m1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testTeamDisplay() {
  try {
    console.log('🔍 === DIAGNOSTIC AFFICHAGE ÉQUIPES ===\n');

    // 1. Vérifier les projets avec équipes
    console.log('1️⃣ Recherche des projets avec équipes...');
    const [projetsAvecEquipes] = await pool.query(`
      SELECT p.Id_projet, p.Theme, p.Id_equipe, e.Nom_equipe
      FROM projet p
      LEFT JOIN equipe e ON p.Id_equipe = e.Id_equipe
      WHERE p.Id_equipe IS NOT NULL
      ORDER BY p.Id_projet
    `);

    console.log(`📊 ${projetsAvecEquipes.length} projets avec équipes trouvés:`);
    projetsAvecEquipes.forEach(p => {
      console.log(`   - Projet ${p.Id_projet}: "${p.Theme}" (Équipe ${p.Id_equipe}: ${p.Nom_equipe || 'Sans nom'})`);
    });

    // 2. Pour chaque projet avec équipe, vérifier les membres
    for (const projet of projetsAvecEquipes) {
      console.log(`\n2️⃣ Membres de l'équipe ${projet.Id_equipe} (Projet ${projet.Id_projet}):`);
      const [membres] = await pool.query(`
        SELECT Immatricule, Nom, Email, Niveau
        FROM etudiant
        WHERE Id_equipe = ?
        ORDER BY Nom
      `, [projet.Id_equipe]);

      if (membres.length > 0) {
        membres.forEach(membre => {
          console.log(`   - ${membre.Nom} (${membre.Immatricule}) - ${membre.Email} - ${membre.Niveau}`);
        });
      } else {
        console.log(`   ⚠️ Aucun membre trouvé pour l'équipe ${projet.Id_equipe}`);
      }
    }

    // 3. Tester l'API backend pour le projet 5
    console.log(`\n3️⃣ Test de l'API /projets/5/equipe:`);
    const http = require('http');
    const apiUrl = 'http://localhost:5000/projets/5/equipe';

    await new Promise((resolve) => {
      const req = http.get(apiUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const membresAPI = JSON.parse(data);
            console.log(`📡 API retourne ${membresAPI.length} membres:`);
            membresAPI.forEach(membre => {
              console.log(`   - ${membre.Nom} (${membre.Immatricule})`);
            });
          } catch (e) {
            console.log(`❌ Erreur parsing réponse API: ${e.message}`);
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        console.log(`❌ Erreur requête API: ${err.message}`);
        resolve();
      });

      req.setTimeout(5000, () => {
        console.log(`⏰ Timeout API`);
        req.destroy();
        resolve();
      });
    });

    // 4. Vérifier les projets individuels (sans équipe)
    console.log(`\n4️⃣ Projets individuels (sans équipe):`);
    const [projetsIndividuels] = await pool.query(`
      SELECT Id_projet, Theme, Id_etudiant
      FROM projet
      WHERE Id_equipe IS NULL
      ORDER BY Id_projet
    `);

    console.log(`📋 ${projetsIndividuels.length} projets individuels trouvés`);
    projetsIndividuels.forEach(p => {
      console.log(`   - Projet ${p.Id_projet}: "${p.Theme}" (Étudiant ${p.Id_etudiant})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    pool.end();
  }
}

testTeamDisplay();