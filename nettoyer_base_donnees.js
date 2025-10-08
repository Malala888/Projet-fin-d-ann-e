// Script pour nettoyer la base de données et supprimer les projets dupliqués
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

async function nettoyerBaseDonnees() {
  console.log('🧹 === NETTOYAGE DE LA BASE DE DONNÉES ===\n');

  try {
    // 1. Analyser les projets dupliqués
    console.log('1️⃣ Analyse des projets dupliqués...');
    const [projets] = await pool.query(`
      SELECT Theme, COUNT(*) as nombre, GROUP_CONCAT(Id_projet) as ids
      FROM projet
      GROUP BY Theme
      HAVING COUNT(*) > 1
    `);

    console.log(`📊 ${projets.length} groupes de projets dupliqués trouvés:`);
    projets.forEach(p => {
      console.log(`   - "${p.Theme}": ${p.nombre} fois (IDs: ${p.ids})`);
    });

    // 2. Supprimer les doublons en gardant seulement le premier ID de chaque groupe
    console.log('\n2️⃣ Suppression des doublons...');

    for (const projet of projets) {
      const ids = projet.ids.split(',').map(id => parseInt(id));
      const idsASupprimer = ids.slice(1); // Garder le premier, supprimer les autres

      if (idsASupprimer.length > 0) {
        console.log(`   - Suppression des projets IDs: ${idsASupprimer.join(', ')} pour "${projet.Theme}"`);

        // Supprimer les projets dupliqués
        await pool.query(
          'DELETE FROM projet WHERE Id_projet IN (?)',
          [idsASupprimer]
        );
      }
    }

    // 3. Vérifier les équipes et leurs membres
    console.log('\n3️⃣ Vérification des équipes et membres...');

    const [equipes] = await pool.query(`
      SELECT e.Id_equipe, e.Nom_equipe, COUNT(et.Immatricule) as nombre_membres
      FROM equipe e
      LEFT JOIN etudiant et ON e.Id_equipe = et.Id_equipe
      GROUP BY e.Id_equipe, e.Nom_equipe
    `);

    console.log(`📋 ${equipes.length} équipes trouvées:`);
    equipes.forEach(equipe => {
      console.log(`   - Équipe ${equipe.Id_equipe}: "${equipe.Nom_equipe}" (${equipe.nombre_membres} membres)`);
    });

    // 4. Vérifier les projets restants
    console.log('\n4️⃣ Vérification des projets restants...');

    const [projetsRestants] = await pool.query(`
      SELECT p.Id_projet, p.Theme, p.Id_equipe, p.Id_etudiant,
             e.Nom_equipe, et.Nom as Nom_etudiant
      FROM projet p
      LEFT JOIN equipe e ON p.Id_equipe = e.Id_equipe
      LEFT JOIN etudiant et ON p.Id_etudiant = et.Immatricule
      ORDER BY p.Id_projet
    `);

    console.log(`📊 ${projetsRestants.length} projets restants:`);
    projetsRestants.forEach(p => {
      console.log(`   - Projet ${p.Id_projet}: "${p.Theme}"`);
      console.log(`     - Étudiant: ${p.Nom_etudiant} (${p.Id_etudiant})`);
      console.log(`     - Équipe: ${p.Id_equipe ? `${p.Nom_equipe} (${p.Id_equipe})` : 'Aucune'}`);
    });

    // 5. Corriger les associations étudiants-équipes si nécessaire
    console.log('\n5️⃣ Correction des associations étudiants-équipes...');

    // Pour l'équipe 17 (projets 5 et 6)
    await pool.query(`
      UPDATE etudiant SET Id_equipe = 17
      WHERE Immatricule IN (5, 9)
    `);
    console.log('   - Étudiants 5 et 9 assignés à l\'équipe 17');

    // Pour l'équipe 18 (projets 8 et 9)
    await pool.query(`
      UPDATE etudiant SET Id_equipe = 18
      WHERE Immatricule IN (6, 7)
    `);
    console.log('   - Étudiants 6 et 7 assignés à l\'équipe 18');

    console.log('\n✅ Nettoyage terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    pool.end();
  }
}

nettoyerBaseDonnees();