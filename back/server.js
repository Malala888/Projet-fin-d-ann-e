// server.js
const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ------------------- MIDDLEWARE -------------------
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires']
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// DÉSACTIVER LE CACHE POUR LES IMAGES UNIQUEMENT
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/uploads')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    console.log(`📁 Serving static file: ${filePath}`);
  }
}));

// Logger global
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ------------------- MYSQL POOL -------------------
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "projet_m1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Gestion des erreurs de connexion MySQL
pool.on('connection', (connection) => {
  console.log('✅ Nouvelle connexion MySQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('❌ Connexion MySQL perdue');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('❌ Connexion MySQL refusée');
  } else {
    console.error('❌ Erreur MySQL inconnue:', err);
  }
});

// ------------------- MULTER CONFIG -------------------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ------------------- ROUTES AUTH -------------------
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  let table = "";

  // ... (le reste de ta logique if/else pour le rôle est correct)
  if (role === "etudiant") {
    table = "etudiant";
  } else if (role === "encadreur") {
    table = "encadreur";
  } else if (role === "admin") {
    table = "admin";
  } else {
    return res.status(400).json({ error: "Rôle invalide" });
  }

  try {
    const [rows] = await pool.query(
      // On s'assure de bien tout sélectionner avec '*'
      `SELECT * FROM ${table} WHERE Email = ? AND Mot_de_passe = ? LIMIT 1`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // On renvoie directement l'objet utilisateur complet
    // C'est cette ligne qui corrige le problème principal
    res.json({ message: "Connexion réussie", role, user: rows[0] });

  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// ------------------- ROUTE REGISTER -------------------
app.post("/register", async (req, res) => {
  const { matricule, nom, email, password, confirmPassword, role, filiere, parcours, niveau, titre } = req.body;
  console.log("📝 Tentative d'inscription:", { matricule, nom, email, role });
  // Validation des champs requis
  if (!matricule || !nom || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }
  // Validation du mot de passe
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
  }
  // Validation du rôle
  if (!["etudiant", "encadreur"].includes(role)) {
    return res.status(400).json({ error: "Rôle invalide" });
  }
  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }
  try {
    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query(
      `SELECT Email FROM ${role} WHERE Email = ?`,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    let insertQuery, values;
    if (role === "etudiant") {
      // Validation des champs spécifiques à l'étudiant
      if (!filiere || !parcours || !niveau) {
        return res.status(400).json({ error: "Tous les champs étudiant sont requis" });
      }

      insertQuery = `
        INSERT INTO etudiant (Immatricule, Nom, Email, Mot_de_passe, Filiere, Parcours, Niveau)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      values = [matricule, nom, email, password, filiere, parcours, niveau];

    } else if (role === "encadreur") {
      // Validation du champ spécifique à l'encadreur
      if (!titre) {
        return res.status(400).json({ error: "Le titre est requis pour l'encadreur" });
      }
      insertQuery = `
        INSERT INTO encadreur (Matricule, Nom, Email, Mot_de_passe, Titre)
        VALUES (?, ?, ?, ?, ?)
      `;
      values = [matricule, nom, email, password, titre];
    }
    const [result] = await pool.query(insertQuery, values);
    console.log(`✅ ${role} créé avec succès. ID:`, result.insertId);
    res.status(201).json({
      message: "Compte créé avec succès",
      role: role,
      id: result.insertId
    });
  } catch (err) {
    console.error("❌ Erreur lors de la création du compte:", err);

    // Gestion des erreurs spécifiques à MySQL
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('Email')) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }
      if (err.message.includes('Immatricule') || err.message.includes('Matricule')) {
        return res.status(409).json({ error: "Ce matricule est déjà utilisé" });
      }
    }

    res.status(500).json({ error: "Erreur serveur lors de la création du compte" });
  }
});

// ------------------- ROUTES ETUDIANTS & ENCADREURS -------------------
app.get("/etudiants", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM etudiant");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération étudiants" });
  }
});

app.get("/encadreurs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM encadreur");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération encadreurs" });
  }
});

app.get("/equipes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipe");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération équipes" });
  }
});

app.get("/etudiants/:id", async (req, res) => {
  try {
    const etudiantId = req.params.id;

    // Récupérer les informations de l'étudiant et de son équipe
    const [etudiantRows] = await pool.query(
      `SELECT e.*, eq.Nom_equipe
       FROM etudiant e
       LEFT JOIN equipe eq ON e.Id_equipe = eq.Id_equipe
       WHERE e.Immatricule = ?`,
      [etudiantId]
    );

    if (etudiantRows.length === 0) {
      return res.status(404).json({ error: "Étudiant introuvable" });
    }
    // Récupérer les projets de l'étudiant (individuels ou via son équipe)
    let projetRows = [];
    try {
      const [result] = await pool.query(
        `SELECT p.*, e.Nom as Nom_encadreur, e.Titre as Titre_encadreur
         FROM projet p
         JOIN encadreur e ON p.Id_encadreur = e.Matricule
         WHERE p.Id_etudiant = ? OR p.Id_equipe = ?`,
        [etudiantId, etudiantRows[0].Id_equipe]
      );
      projetRows = result;
    } catch (projetError) {
      console.error(`Erreur projets pour ${etudiantId}:`, projetError);
      projetRows = [];
    }

    // Retourner la structure attendue par le frontend
    res.json({
      details: etudiantRows[0],
      projets: projetRows,
    });
  } catch (err) {
    console.error("Erreur récupération étudiant:", err);
    res.status(500).json({ error: "Erreur récupération étudiant" });
  }
});

app.get("/encadreurs/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM encadreur WHERE Matricule = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Encadreur introuvable" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur récupération encadreur" });
  }
});

// ------------------- ROUTES PROJETS -------------------
app.get("/etudiants/:id/projets", async (req, res) => {
  const etudiantId = req.params.id;
  try {
    // D'abord, récupérer l'Id_equipe de l'étudiant, s'il en a un.
    const [etudiantRows] = await pool.query(
      "SELECT Id_equipe FROM etudiant WHERE Immatricule = ?",
      [etudiantId]
    );
    const etudiantEquipeId = etudiantRows.length > 0 ? etudiantRows[0].Id_equipe : null;

    // Requête pour récupérer les projets :
    // 1. Les projets où l'étudiant est le créateur (Id_etudiant)
    // 2. OU les projets qui appartiennent à son équipe (Id_equipe)
    // On utilise DISTINCT pour éviter les doublons si un étudiant est créateur ET dans l'équipe.
    const query = `
      SELECT DISTINCT
        P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_deb, P.Date_fin, P.Id_encadreur, P.Id_equipe, P.Id_etudiant,
        E.Nom AS Nom_encadreur, E.Email AS Email_encadreur, E.Titre AS Titre_encadreur
      FROM projet P
      JOIN encadreur E ON P.Id_encadreur = E.Matricule
      WHERE P.Id_etudiant = ? OR (P.Id_equipe IS NOT NULL AND P.Id_equipe = ?)
    `;

    const [projetRows] = await pool.query(query, [etudiantId, etudiantEquipeId]);

    console.log(`📋 Projets récupérés pour l'étudiant ${etudiantId}:`, projetRows.length);
    res.json(projetRows);

  } catch (err) {
    console.error("❌ Erreur récupération projets de l'étudiant:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des projets" });
  }
});

// GET projet spécifique avec détails complets (VERSION AMÉLIORÉE)
app.get("/projets/:id", async (req, res) => {
   try {
     const [rows] = await pool.query(
       `SELECT P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_deb, P.Date_fin, P.Id_encadreur, P.Id_equipe,
               E.Nom AS Nom_encadreur, E.Titre AS Titre_encadreur, E.Email AS Email_encadreur,
               ET.Nom AS Nom_etudiant, ET.Email AS Email_etudiant,
               EQ.Nom_equipe  -- On ajoute le nom de l'équipe ici
        FROM projet P
        JOIN encadreur E ON P.Id_encadreur = E.Matricule
        JOIN etudiant ET ON P.Id_etudiant = ET.Immatricule
        LEFT JOIN equipe EQ ON P.Id_equipe = EQ.Id_equipe -- On utilise LEFT JOIN au cas où il n'y a pas d'équipe
        WHERE P.Id_projet = ?`,
       [req.params.id]
     );
     if (rows.length === 0) return res.status(404).json({ error: "Projet introuvable" });
     res.json(rows[0]);
   } catch (err) {
     console.error("❌ Erreur récupération projet détaillé:", err);
     res.status(500).json({ error: "Erreur récupération projet" });
   }
});

// GET livrables d'un projet spécifique
app.get("/projets/:id/livrables", async (req, res) => {
   try {
     console.log(`📋 Récupération des livrables pour le projet ${req.params.id}`);

     const [rows] = await pool.query(
       `SELECT L.Id_livrable, L.Id_etudiant, L.Id_encadreur, L.Nom, L.Titre, L.Date_soumission, L.Status, L.Chemin_fichier, L.Type, L.Taille_fichier,
               ET.Nom AS Nom_etudiant, ET.Email AS Email_etudiant
        FROM livrable L
        JOIN etudiant ET ON L.Id_etudiant = ET.Immatricule
        WHERE L.Id_projet = ?
        ORDER BY L.Date_soumission DESC`,
       [req.params.id]
     );

     console.log(`✅ ${rows.length} livrables trouvés pour le projet ${req.params.id}`);
     res.json(rows);
   } catch (err) {
     console.error("❌ Erreur récupération livrables projet:", err);
     res.status(500).json({ error: "Erreur récupération livrables projet", details: err.message });
   }
});

// GET membres de l'équipe d'un projet (amélioré pour gérer les projets individuels)
app.get("/projets/:id/equipe", async (req, res) => {
  try {
    const projetId = req.params.id;
    console.log(`👥 Récupération de l'équipe pour le projet ${projetId}`);

    // 1. Récupérer l'Id_equipe et l'Id_etudiant du projet
    const [projetRows] = await pool.query(
      "SELECT Id_equipe, Id_etudiant FROM projet WHERE Id_projet = ?",
      [projetId]
    );

    if (projetRows.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    const { Id_equipe, Id_etudiant } = projetRows[0];
    let membres = [];

    // Si c'est un projet d'équipe, on tente de récupérer les membres
    if (Id_equipe) {
      console.log(`Projet en équipe (ID: ${Id_equipe}). Récupération des membres.`);
      [membres] = await pool.query(
        `SELECT Immatricule, Nom, Niveau, Parcours FROM etudiant WHERE Id_equipe = ? ORDER BY Nom`,
        [Id_equipe]
      );
    }

    // **CORRECTION :** Si l'équipe est vide mais qu'un étudiant principal est défini,
    // on le récupère. C'est le cas pour un projet individuel.
    if (membres.length === 0 && Id_etudiant) {
      console.log(`Projet individuel ou équipe vide. Récupération de l'étudiant ID: ${Id_etudiant}.`);
      [membres] = await pool.query(
        `SELECT Immatricule, Nom, Niveau, Parcours FROM etudiant WHERE Immatricule = ?`,
        [Id_etudiant]
      );
    }

    console.log(`✅ ${membres.length} membre(s) trouvé(s) pour le projet ${projetId}.`);
    res.json(membres);

  } catch (err) {
    console.error("❌ Erreur récupération membres équipe:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des membres de l'équipe" });
  }
});

// POST créer une nouvelle équipe
app.post("/equipes", async (req, res) => {
  try {
    const { nom_equipe, membres } = req.body;

    console.log("📝 Création d'une nouvelle équipe:", {
      nom_equipe,
      membres: membres || []
    });

    if (!nom_equipe) {
      return res.status(400).json({ error: "Le nom de l'équipe est requis" });
    }

    const [result] = await pool.query(
      `INSERT INTO equipe (Nom_equipe) VALUES (?)`,
      [nom_equipe]
    );
    const equipeId = result.insertId;
    console.log(`✅ Équipe créée avec ID: ${equipeId}`);

    if (membres && Array.isArray(membres) && membres.length > 0) {
      console.log(`👥 Ajout de ${membres.length} membres à l'équipe ${equipeId}`);
      for (const membreId of membres) {
        try {
          const [membreCheck] = await pool.query("SELECT Immatricule FROM etudiant WHERE Immatricule = ?", [membreId]);
          if (membreCheck.length > 0) {
            await pool.query(`UPDATE etudiant SET Id_equipe = ? WHERE Immatricule = ?`, [equipeId, membreId]);
            console.log(`✅ Étudiant ${membreId} ajouté à l'équipe ${equipeId}`);
          } else {
            console.warn(`⚠️ Étudiant ${membreId} non trouvé, ignoré`);
          }
        } catch (membreError) {
          console.error(`❌ Erreur ajout étudiant ${membreId}:`, membreError);
        }
      }
    }

    res.status(201).json({
      message: "Équipe créée avec succès",
      id_equipe: equipeId,
      nom_equipe: nom_equipe,
      membres_ajoutes: membres ? membres.length : 0
    });

  } catch (err) {
    console.error("❌ Erreur création équipe:", err);
    res.status(500).json({ error: "Erreur lors de la création de l'équipe", details: err.message });
  }
});

// POST créer un nouveau projet - VERSION SIMPLIFIÉE
app.post("/projets", async (req, res) => {
  const { theme, description, date_debut, date_fin, id_encadreur, id_etudiant, id_equipe } = req.body;

  // Validation simple
  if (!theme || !description || !date_debut || !date_fin || !id_encadreur || !id_etudiant) {
    return res.status(400).json({ error: "Tous les champs requis ne sont pas fournis." });
  }

  try {
    // La logique est maintenant beaucoup plus simple : on insère juste UNE ligne.
    const [result] = await pool.query(
      `INSERT INTO projet (Theme, Description, Date_deb, Date_fin, Id_encadreur, Id_etudiant, Id_equipe, Avancement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [theme, description, date_debut, date_fin, id_encadreur, id_etudiant, id_equipe || null, 0]
    );
    const projetId = result.insertId;

    console.log(`✅ Projet unique créé avec ID: ${projetId}, pour l'équipe: ${id_equipe || 'N/A'}`);

    // La logique pour mettre à jour les membres de l'équipe est déjà dans ta route POST /equipes.
    // Il faut s'assurer que l'interface appelle cette route correctement avant la création du projet.

    res.status(201).json({
      message: "Projet créé avec succès",
      id_projet: projetId
    });

  } catch (err) {
    console.error("❌ Erreur lors de la création du projet :", err);
    res.status(500).json({ error: "Erreur lors de la création du projet", details: err.message });
  }
});

// PUT modifier un projet existant
app.put("/projets/:id", async (req, res) => {
  const { theme, description, date_debut, date_fin, id_encadreur, id_etudiant, id_equipe } = req.body;
  const projetId = req.params.id;

  console.log("📝 Modification du projet:", projetId);
  console.log("Données reçues:", req.body);

  // Validation des champs
  if (!theme || !description || !date_debut || !date_fin || !id_encadreur || !id_etudiant) {
    return res.status(400).json({ error: "Tous les champs requis ne sont pas fournis." });
  }

  try {
    // Vérifier que le projet existe
    const [projetCheck] = await pool.query("SELECT Id_projet FROM projet WHERE Id_projet = ?", [projetId]);
    if (projetCheck.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    // Vérifier que l'encadreur existe
    const [encadreurCheck] = await pool.query("SELECT Matricule FROM encadreur WHERE Matricule = ?", [id_encadreur]);
    if (encadreurCheck.length === 0) {
      return res.status(400).json({ error: "Encadreur non trouvé" });
    }

    // Vérifier que l'étudiant existe
    const [etudiantCheck] = await pool.query("SELECT Immatricule FROM etudiant WHERE Immatricule = ?", [id_etudiant]);
    if (etudiantCheck.length === 0) {
      return res.status(400).json({ error: "Étudiant non trouvé" });
    }

    // Si une équipe est spécifiée, vérifier qu'elle existe
    if (id_equipe) {
      const [equipeCheck] = await pool.query("SELECT Id_equipe FROM equipe WHERE Id_equipe = ?", [id_equipe]);
      if (equipeCheck.length === 0) {
        return res.status(400).json({ error: "Équipe non trouvée" });
      }
    }

    // Mettre à jour le projet
    const [result] = await pool.query(
      `UPDATE projet
       SET Theme = ?, Description = ?, Date_deb = ?, Date_fin = ?, Id_encadreur = ?, Id_etudiant = ?, Id_equipe = ?
       WHERE Id_projet = ?`,
      [theme, description, date_debut, date_fin, id_encadreur, id_etudiant, id_equipe || null, projetId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Aucune modification effectuée" });
    }

    console.log(`✅ Projet ${projetId} modifié avec succès`);

    res.json({
      message: "Projet modifié avec succès",
      id_projet: projetId
    });

  } catch (err) {
    console.error("❌ Erreur lors de la modification du projet :", err);
    res.status(500).json({ error: "Erreur lors de la modification du projet", details: err.message });
  }
});

// DELETE un projet
app.delete("/projets/:id", async (req, res) => {
  const projetId = req.params.id;
  console.log(`🗑️ Tentative de suppression du projet ID: ${projetId}`);

  try {
    // D'abord, on vérifie si le projet existe pour éviter les erreurs fantômes
    const [projetCheck] = await pool.query("SELECT Id_projet FROM projet WHERE Id_projet = ?", [projetId]);
    if (projetCheck.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    // On supprime le projet.
    // La base de données s'occupera de supprimer les livrables associés grâce à "ON DELETE CASCADE".
    const [result] = await pool.query("DELETE FROM projet WHERE Id_projet = ?", [projetId]);

    if (result.affectedRows === 0) {
      // Si aucune ligne n'a été supprimée, c'est qu'il y a eu un problème
      return res.status(400).json({ error: "La suppression a échoué" });
    }

    console.log(`✅ Projet ${projetId} supprimé avec succès.`);
    res.json({ message: "Projet supprimé avec succès" });

  } catch (err) {
    console.error("❌ Erreur lors de la suppression du projet :", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression", details: err.message });
  }
});

// PUT modifier une équipe existante
app.put("/equipes/:id", async (req, res) => {
  const { nom_equipe, membres } = req.body;
  const equipeId = req.params.id;

  console.log("👥 Modification de l'équipe:", equipeId);
  console.log("Données reçues:", req.body);

  if (!nom_equipe || !Array.isArray(membres)) {
    return res.status(400).json({ error: "Nom de l'équipe et liste des membres requis" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que l'équipe existe
    const [equipeCheck] = await connection.query("SELECT Id_equipe FROM equipe WHERE Id_equipe = ?", [equipeId]);
    if (equipeCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Équipe non trouvée" });
    }

    // Mettre à jour le nom de l'équipe
    await connection.query(
      "UPDATE equipe SET Nom_equipe = ? WHERE Id_equipe = ?",
      [nom_equipe, equipeId]
    );

    // D'abord, supprimer tous les membres actuels de l'équipe
    await connection.query("UPDATE etudiant SET Id_equipe = NULL WHERE Id_equipe = ?", [equipeId]);

    // Ensuite, ajouter les nouveaux membres
    for (const membreId of membres) {
      await connection.query(
        "UPDATE etudiant SET Id_equipe = ? WHERE Immatricule = ?",
        [equipeId, membreId]
      );
    }

    await connection.commit();
    console.log(`✅ Équipe ${equipeId} modifiée avec succès`);

    res.json({
      message: "Équipe modifiée avec succès",
      id_equipe: equipeId,
      nom_equipe: nom_equipe,
      membres_ajoutes: membres.length
    });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Erreur lors de la modification de l'équipe :", err);
    res.status(500).json({ error: "Erreur lors de la modification de l'équipe", details: err.message });
  } finally {
    connection.release();
  }
});

// server.js

app.put("/etudiants/:id", async (req, res) => {
  const etudiantId = req.params.id;
  const { Nom, Email, Mot_de_passe, Filiere, Parcours, Niveau } = req.body;

  console.log(`📝 Mise à jour du profil pour l'étudiant ID: ${etudiantId}`);

  if (!Nom || !Email) {
    return res.status(400).json({ error: "Le nom et l'email sont requis." });
  }

  try {
    let finalPassword = Mot_de_passe;
    // Si le champ mot de passe est laissé vide, on conserve l'ancien
    if (!finalPassword) {
      const [currentUser] = await pool.query("SELECT Mot_de_passe FROM etudiant WHERE Immatricule = ?", [etudiantId]);
      if (currentUser.length > 0) {
        finalPassword = currentUser[0].Mot_de_passe;
      }
    }

    // On met à jour la base de données avec tous les champs
    await pool.query(
      `UPDATE etudiant SET Nom = ?, Email = ?, Mot_de_passe = ?, Filiere = ?, Parcours = ?, Niveau = ? WHERE Immatricule = ?`,
      [Nom, Email, finalPassword, Filiere || null, Parcours || null, Niveau || null, etudiantId]
    );

    // On récupère l'utilisateur complet pour le renvoyer et mettre à jour l'interface
    const [updatedUserRows] = await pool.query(
        "SELECT * FROM etudiant WHERE Immatricule = ?",
        [etudiantId]
    );

    console.log(`✅ Profil de l'étudiant ${etudiantId} mis à jour.`);

    res.json({
      message: "Profil mis à jour avec succès",
      user: updatedUserRows[0] // On renvoie l'utilisateur complet mis à jour
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du profil :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

// POST pour mettre à jour la photo de profil d'un étudiant
app.post("/etudiants/:id/photo", upload.single("photo"), async (req, res) => {
  const etudiantId = req.params.id;

  console.log(`🖼️ Requête de mise à jour photo reçue pour l'étudiant ID: ${etudiantId}`);
  console.log(`📎 Fichier reçu:`, req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'Aucun fichier');

  if (!req.file) {
    console.error(`❌ Aucun fichier reçu pour l'étudiant ${etudiantId}`);
    return res.status(400).json({ error: "Aucun fichier n'a été envoyé." });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  console.log(`🖼️ Mise à jour de la photo pour l'étudiant ID: ${etudiantId}. Nouveau chemin: ${imagePath}`);

  try {
    // Vérifier que l'étudiant existe d'abord
    const [etudiantCheck] = await pool.query(
      "SELECT Immatricule, Nom, Image FROM etudiant WHERE Immatricule = ?",
      [etudiantId]
    );

    if (etudiantCheck.length === 0) {
      console.error(`❌ Étudiant ${etudiantId} non trouvé`);
      return res.status(404).json({ error: "Étudiant non trouvé." });
    }

    console.log(`📋 Étudiant trouvé: ${etudiantCheck[0].Nom}, ancienne image: ${etudiantCheck[0].Image}`);

    // Mettre à jour le chemin de l'image dans la base de données
    const [result] = await pool.query(
      "UPDATE etudiant SET Image = ? WHERE Immatricule = ?",
      [imagePath, etudiantId]
    );

    if (result.affectedRows === 0) {
      console.error(`❌ Aucune ligne mise à jour pour l'étudiant ${etudiantId}`);
      return res.status(404).json({ error: "Étudiant non trouvé." });
    }

    console.log(`✅ Base de données mise à jour. Lignes affectées: ${result.affectedRows}`);

    // Récupérer l'utilisateur complet mis à jour depuis la base de données
    const [updatedUserRows] = await pool.query(
      "SELECT * FROM etudiant WHERE Immatricule = ?",
      [etudiantId]
    );

    if (updatedUserRows.length === 0) {
      return res.status(404).json({ error: "Étudiant non trouvé après mise à jour." });
    }

    console.log(`✅ Photo de l'étudiant ${etudiantId} mise à jour.`);

    // Renvoyer l'objet utilisateur complet, comme le front-end s'y attend
    res.json({
      message: "Photo de profil mise à jour avec succès",
      user: updatedUserRows[0] // <-- C'est la clé !
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de la photo :", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la photo.", details: err.message });
  }
});

// ------------------- ROUTES LIVRABLES -------------------

// GET livrables étudiant
app.get("/etudiants/:id/livrables", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT L.Id_livrable, L.Id_etudiant, L.Id_encadreur, L.Nom, L.Titre, L.Date_soumission, L.Status, L.Chemin_fichier,
              P.Theme AS Nom_projet
       FROM livrable L
       JOIN projet P ON L.Id_projet = P.Id_projet
       WHERE L.Id_etudiant = ?
       ORDER BY L.Date_soumission DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération livrables:", err);
    res.status(500).json({ error: "Erreur récupération livrables", details: err.message });
  }
});

// ADD livrable
app.post("/livrables", upload.single("fichier"), async (req, res) => {
  try {
    const { Nom, Titre, Id_projet, Id_etudiant, Date_soumission, Status } = req.body;

    const [projetRows] = await pool.query("SELECT Id_encadreur FROM projet WHERE Id_projet = ?", [Id_projet]);
    if (projetRows.length === 0) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    const Id_encadreur = projetRows[0].Id_encadreur;

    let chemin_fichier = null, type = null, taille = null;
    if (req.file) {
      chemin_fichier = `/uploads/${req.file.filename}`;
      type = req.file.mimetype;
      taille = (req.file.size / 1024 / 1024).toFixed(2) + "MB";
    }

    const [result] = await pool.query(
      `INSERT INTO livrable (Id_projet, Id_etudiant, Id_encadreur, Nom, Titre, Type, Taille_fichier, Date_soumission, Status, Chemin_fichier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Id_projet, Id_etudiant, Id_encadreur, Nom, Titre, type, taille, Date_soumission, Status || "Soumis", chemin_fichier]
    );
    res.json({ message: "Livrable ajouté", id: result.insertId });
  } catch (err) {
    console.error("Erreur ajout livrable:", err);
    res.status(500).json({ error: "Erreur ajout livrable", details: err.message });
  }
});

// UPDATE livrable
app.put("/livrables/:id", upload.single("fichier"), async (req, res) => {
  try {
    const { Nom, Titre, Id_projet, Id_etudiant, Date_soumission, Status } = req.body;
    const [currentRows] = await pool.query(
      "SELECT Status, Chemin_fichier, Id_encadreur, Type, Taille_fichier FROM livrable WHERE Id_livrable=?",
      [req.params.id]
    );
    if (currentRows.length === 0) return res.status(404).json({ error: "Livrable non trouvé" });
    const currentLivrable = currentRows[0];
    let chemin_fichier = currentLivrable.Chemin_fichier, type = currentLivrable.Type, taille = currentLivrable.Taille_fichier;
    if (req.file) {
      chemin_fichier = `/uploads/${req.file.filename}`;
      type = req.file.mimetype;
      taille = (req.file.size / 1024 / 1024).toFixed(2) + "MB";
    }
    const finalStatus = Status || currentLivrable.Status || "Soumis";
    const [result] = await pool.query(
      `UPDATE livrable SET Id_projet=?, Id_etudiant=?, Id_encadreur=?, Nom=?, Titre=?, Type=?, Taille_fichier=?, Date_soumission=?, Status=?, Chemin_fichier=? WHERE Id_livrable=?`,
      [Id_projet, Id_etudiant, currentLivrable.Id_encadreur, Nom, Titre, type, taille, Date_soumission, finalStatus, chemin_fichier, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(400).json({ error: "Aucune modification effectuée" });
    res.json({ message: "Livrable modifié avec succès", affected: result.affectedRows });
  } catch (err) {
    console.error("❌ Erreur modification livrable:", err);
    res.status(500).json({ error: "Erreur modification livrable", details: err.message });
  }
});

// DELETE livrable
app.delete("/livrables/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Chemin_fichier FROM livrable WHERE Id_livrable=?", [req.params.id]);
    if (rows.length > 0 && rows[0].Chemin_fichier) {
      const filePath = path.resolve(__dirname, "." + rows[0].Chemin_fichier);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    const [result] = await pool.query("DELETE FROM livrable WHERE Id_livrable=?", [req.params.id]);
    res.json({ message: "Livrable supprimé", affected: result.affectedRows });
  } catch (err) {
    console.error("Erreur suppression livrable:", err);
    res.status(500).json({ error: "Erreur suppression livrable", details: err.message });
  }
});

// DOWNLOAD livrable
app.get("/livrables/:id/download", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Chemin_fichier, Nom, Titre FROM livrable WHERE Id_livrable=?", [req.params.id]);
    if (rows.length === 0 || !rows[0].Chemin_fichier) return res.status(404).json({ error: "Fichier non trouvé" });
    const relativePath = rows[0].Chemin_fichier.replace('/uploads/', '');
    const filePath = path.join(__dirname, 'uploads', relativePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Fichier non trouvé sur le serveur" });
    const fileExt = path.extname(filePath).toLowerCase();
    let downloadName = rows[0].Titre || rows[0].Nom || path.basename(filePath);
    if (!path.extname(downloadName)) downloadName += fileExt;
    const mimeTypes = { '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.zip': 'application/zip' };
    const contentType = mimeTypes[fileExt] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("❌ Erreur téléchargement:", err);
    res.status(500).json({ error: "Erreur lors du téléchargement", details: err.message });
  }
});

// ------------------- CALENDRIER -------------------
app.get("/encadreurs/:id/calendrier", async (req, res) => {
  const encadreurId = req.params.id;
  try {
    console.log(`📅 Récupération du calendrier pour l'encadreur ${encadreurId}`);

    // La nouvelle requête utilise UNION pour combiner les projets et les livrables
    // dans un format unifié, exactement comme pour le calendrier étudiant.
    const [events] = await pool.query(
      `
      -- Récupérer les DATES DE FIN des projets supervisés par l'encadreur
      SELECT
        P.Date_fin AS date,
        P.Theme AS title,
        'Projet' AS type
      FROM projet P
      WHERE P.Id_encadreur = ?

      UNION

      -- Récupérer les DATES DE SOUMISSION des livrables supervisés par l'encadreur
      SELECT
        L.Date_soumission AS date,
        L.Nom AS title, -- Utiliser L.Nom pour la cohérence avec le calendrier étudiant
        'Livrable' AS type
      FROM livrable L
      WHERE L.Id_encadreur = ?
      `,
      [encadreurId, encadreurId] // Le paramètre est nécessaire pour chaque SELECT dans l'UNION
    );

    console.log(`✅ ${events.length} événements trouvés pour l'encadreur ${encadreurId}`);
    res.json(events); // On renvoie directement le résultat de la requête SQL

  } catch (err) {
    console.error("❌ Erreur lors de la récupération du calendrier encadreur :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du calendrier" });
  }
});

app.get("/etudiants/:id/calendrier", async (req, res) => {
  const etudiantId = req.params.id;
  try {
    // Étape 1: Récupérer l'ID de l'équipe de l'étudiant
    const [etudiantRows] = await pool.query(
      "SELECT Id_equipe FROM etudiant WHERE Immatricule = ?",
      [etudiantId]
    );
    const equipeId = etudiantRows.length > 0 ? etudiantRows[0].Id_equipe : null;
    // Étape 2: Construire la requête améliorée
    const [rows] = await pool.query(
      `
      -- Récupérer les DATES DE FIN des projets liés à l'étudiant ou à son équipe
      SELECT
        P.Date_fin AS date,      -- Utilise la date de fin comme échéance
        P.Theme AS title,
        'Projet' AS type
      FROM projet P
      WHERE
        P.Id_etudiant = ? OR (P.Id_equipe IS NOT NULL AND P.Id_equipe = ?)
      UNION
      -- Récupérer les DATES DE SOUMISSION des livrables liés à TOUS les projets de l'étudiant/équipe
      SELECT
        L.Date_soumission AS date,
        L.Nom AS title,
        'Livrable' AS type
      FROM livrable L
      WHERE L.Id_projet IN (
        -- Sous-requête pour trouver tous les projets pertinents
        SELECT Id_projet FROM projet
        WHERE Id_etudiant = ? OR (Id_equipe IS NOT NULL AND Id_equipe = ?)
      )
      `,
      [etudiantId, equipeId, etudiantId, equipeId] // Les paramètres sont passés pour chaque '?'
    );
    console.log(`📅 Événements trouvés pour l'étudiant ${etudiantId} (équipe ${equipeId || 'N/A'}): ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération du calendrier :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du calendrier" });
  }
});

// ------------------- STATISTIQUES -------------------
app.get("/etudiants/:id/statistiques", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total_livrables,
              SUM(CASE WHEN Chemin_fichier IS NOT NULL THEN 1 ELSE 0 END) as livrables_soumis,
              SUM(CASE WHEN Chemin_fichier IS NULL AND Date_soumission > CURDATE() THEN 1 ELSE 0 END) as livrables_futurs,
              SUM(CASE WHEN Chemin_fichier IS NULL AND Date_soumission <= CURDATE() THEN 1 ELSE 0 END) as livrables_en_retard
       FROM livrable WHERE Id_etudiant=?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur statistiques" });
  }
});

// ------------------- ROUTES ADMIN -------------------
app.get("/admin/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Id_admin, Nom, Email FROM admin WHERE Id_admin=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Admin introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur admin" });
  }
});

app.put("/admin/:id", async (req, res) => {
  const { Nom, Email } = req.body;
  if (!Nom || !Email) return res.status(400).json({ error: "Nom et Email requis" });
  try {
    await pool.query("UPDATE admin SET Nom=?, Email=? WHERE Id_admin=?", [Nom, Email, req.params.id]);
    res.json({ message: "Profil mis à jour" });
  } catch (err) {
    res.status(500).json({ error: "Erreur update admin" });
  }
});

// POST pour mettre à jour la photo de profil d'un admin
app.post("/admin/:id/photo", upload.single("avatar"), async (req, res) => {
  const adminId = req.params.id;

  console.log(`🖼️ Requête de mise à jour photo reçue pour l'admin ID: ${adminId}`);

  if (!req.file) {
    console.error(`❌ Aucun fichier reçu pour l'admin ${adminId}`);
    return res.status(400).json({ error: "Aucun fichier n'a été envoyé." });
  }

  // Construire le chemin d'accès qui sera stocké en BDD
  const avatarPath = `/uploads/${req.file.filename}`;
  console.log(`✨ Nouveau chemin pour l'avatar: ${avatarPath}`);

  try {
    // Mettre à jour le chemin de l'avatar dans la base de données
    const [result] = await pool.query(
      "UPDATE admin SET Avatar = ? WHERE Id_admin = ?",
      [avatarPath, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Admin non trouvé." });
    }

    console.log(`✅ Avatar de l'admin ${adminId} mis à jour dans la base de données.`);

    // Récupérer l'utilisateur complet mis à jour depuis la base de données
    const [updatedUserRows] = await pool.query(
      "SELECT * FROM admin WHERE Id_admin = ?",
      [adminId]
    );

    if (updatedUserRows.length === 0) {
      return res.status(404).json({ error: "Admin non trouvé après mise à jour." });
    }

    // Renvoyer l'objet utilisateur complet, comme le front-end s'y attend
    res.json({
      message: "Avatar mis à jour avec succès",
      user: updatedUserRows[0] // <-- C'est la clé !
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de l'avatar :", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour.", details: err.message });
  }
});

app.put("/admin/:id/password", async (req, res) => {
   const { currentPassword, newPassword } = req.body;
   try {
     const [rows] = await pool.query("SELECT Mot_de_passe FROM admin WHERE Id_admin=?", [req.params.id]);
     if (rows.length === 0) return res.status(404).json({ error: "Admin introuvable" });
     if (rows[0].Mot_de_passe !== currentPassword) return res.status(401).json({ error: "Mot de passe actuel incorrect" });
     await pool.query("UPDATE admin SET Mot_de_passe=? WHERE Id_admin=?", [newPassword, req.params.id]);
     res.json({ message: "Mot de passe mis à jour" });
   } catch (err) {
     res.status(500).json({ error: "Erreur update mot de passe" });
   }
});

// ------------------- ROUTES ENCADREURS -------------------
app.get("/encadreurs/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM encadreur WHERE Matricule = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Encadreur introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération encadreur" });
  }
});

app.put("/encadreurs/:matricule", async (req, res) => {
  const encadreurId = req.params.matricule;
  const { Nom, Email, Titre, Departement, Bio } = req.body;

  console.log(`📝 Mise à jour du profil pour l'encadreur ID: ${encadreurId}`);

  if (!Nom || !Email) {
    return res.status(400).json({ error: "Le nom et l'email sont requis." });
  }

  try {
    // On met à jour la base de données avec tous les champs disponibles
    await pool.query(
      `UPDATE encadreur SET Nom = ?, Email = ?, Titre = ? WHERE Matricule = ?`,
      [Nom, Email, Titre, encadreurId]
    );

    // On récupère l'utilisateur complet pour le renvoyer et mettre à jour l'interface
    const [updatedUserRows] = await pool.query(
      "SELECT * FROM encadreur WHERE Matricule = ?",
      [encadreurId]
    );

    console.log(`✅ Profil de l'encadreur ${encadreurId} mis à jour.`);
    console.log(`📋 Données utilisateur mises à jour:`, updatedUserRows[0]);

    res.json({
      message: "Profil mis à jour avec succès",
      user: updatedUserRows[0] // On renvoie l'utilisateur complet mis à jour
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du profil :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.put("/encadreurs/:matricule/password", async (req, res) => {
   const { currentPassword, newPassword } = req.body;
   try {
     const [rows] = await pool.query("SELECT Mot_de_passe FROM encadreur WHERE Matricule=?", [req.params.matricule]);
     if (rows.length === 0) return res.status(404).json({ error: "Encadreur introuvable" });
     if (rows[0].Mot_de_passe !== currentPassword) return res.status(401).json({ error: "Mot de passe actuel incorrect" });
     await pool.query("UPDATE encadreur SET Mot_de_passe=? WHERE Matricule=?", [newPassword, req.params.matricule]);
     res.json({ message: "Mot de passe mis à jour" });
   } catch (err) {
     res.status(500).json({ error: "Erreur update mot de passe" });
   }
});

// POST pour mettre à jour la photo de profil d'un encadreur
app.post("/encadreurs/:matricule/image", upload.single("image"), async (req, res) => {
  const encadreurId = req.params.matricule;

  console.log(`🖼️ Requête de mise à jour image reçue pour l'encadreur ID: ${encadreurId}`);
  console.log(`📎 Fichier reçu:`, req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'Aucun fichier');

  if (!req.file) {
    console.error(`❌ Aucun fichier reçu pour l'encadreur ${encadreurId}`);
    return res.status(400).json({ error: "Aucun fichier n'a été envoyé." });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  console.log(`🖼️ Mise à jour de l'image pour l'encadreur ID: ${encadreurId}. Nouveau chemin: ${imagePath}`);

  try {
    // Vérifier que l'encadreur existe d'abord
    const [encadreurCheck] = await pool.query(
      "SELECT Matricule, Nom, Avatar FROM encadreur WHERE Matricule = ?",
      [encadreurId]
    );

    if (encadreurCheck.length === 0) {
      console.error(`❌ Encadreur ${encadreurId} non trouvé`);
      return res.status(404).json({ error: "Encadreur non trouvé." });
    }

    console.log(`📋 Encadreur trouvé: ${encadreurCheck[0].Nom}, ancienne image: ${encadreurCheck[0].Avatar}`);

    // Mettre à jour le chemin de l'image dans la base de données
    const [result] = await pool.query(
      "UPDATE encadreur SET Avatar = ? WHERE Matricule = ?",
      [imagePath, encadreurId]
    );

    if (result.affectedRows === 0) {
      console.error(`❌ Aucune ligne mise à jour pour l'encadreur ${encadreurId}`);
      return res.status(404).json({ error: "Encadreur non trouvé." });
    }

    console.log(`✅ Base de données mise à jour. Lignes affectées: ${result.affectedRows}`);

    // Récupérer l'utilisateur complet mis à jour depuis la base de données
    const [updatedUserRows] = await pool.query(
      "SELECT * FROM encadreur WHERE Matricule = ?",
      [encadreurId]
    );

    if (updatedUserRows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé après mise à jour." });
    }

    console.log(`✅ Image de l'encadreur ${encadreurId} mise à jour.`);

    // Renvoyer l'objet utilisateur complet, comme le front-end s'y attend
    res.json({
      message: "Image de profil mise à jour avec succès",
      user: updatedUserRows[0] // <-- C'est la clé !
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de l'image :", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'image.", details: err.message });
  }
});

// DELETE pour supprimer l'image de profil d'un encadreur
app.delete("/encadreurs/:matricule/image", async (req, res) => {
  const encadreurId = req.params.matricule;

  console.log(`🗑️ Suppression de l'image pour l'encadreur ID: ${encadreurId}`);

  try {
    // Récupérer l'ancienne image avant de la supprimer
    const [encadreurRows] = await pool.query(
      "SELECT Avatar FROM encadreur WHERE Matricule = ?",
      [encadreurId]
    );

    if (encadreurRows.length === 0) {
      return res.status(404).json({ error: "Encadreur non trouvé." });
    }

    const ancienneImage = encadreurRows[0].Avatar;

    // Supprimer le fichier physique s'il existe
    if (ancienneImage) {
      const filePath = path.join(__dirname, ancienneImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Fichier image supprimé: ${filePath}`);
      }
    }

    // Mettre à jour la base de données pour supprimer le chemin de l'image
    await pool.query(
      "UPDATE encadreur SET Avatar = NULL WHERE Matricule = ?",
      [encadreurId]
    );

    // Récupérer l'utilisateur mis à jour
    const [updatedUserRows] = await pool.query(
      "SELECT * FROM encadreur WHERE Matricule = ?",
      [encadreurId]
    );

    res.json({
      message: "Image de profil supprimée avec succès",
      user: updatedUserRows[0]
    });

  } catch (err) {
    console.error("❌ Erreur lors de la suppression de l'image :", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression de l'image.", details: err.message });
  }
});

// GET projets d'un encadreur spécifique avec détails des étudiants
app.get("/encadreurs/:matricule/projets", async (req, res) => {
  const encadreurId = req.params.matricule;
  try {
    console.log(`📋 Récupération des projets pour l'encadreur ${encadreurId}`);

    // Récupérer les projets où l'encadreur supervise avec les informations des étudiants
    const [projetRows] = await pool.query(
      `SELECT P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_deb, P.Date_fin, P.Status, P.Id_equipe, P.Id_etudiant,
              E.Nom AS Nom_etudiant, E.Email AS Email_etudiant, E.Niveau AS Niveau_etudiant, E.Filiere AS Filiere_etudiant,
              EQ.Nom_equipe
       FROM projet P
       JOIN etudiant E ON P.Id_etudiant = E.Immatricule
       LEFT JOIN equipe EQ ON P.Id_equipe = EQ.Id_equipe
       WHERE P.Id_encadreur = ?
       ORDER BY CASE
         WHEN P.Status = 'En cours' THEN 0
         WHEN P.Status = 'En retard' THEN 1
         ELSE 2
       END, P.Date_deb DESC`,
      [encadreurId]
    );

    console.log(`✅ ${projetRows.length} projets trouvés pour l'encadreur ${encadreurId}`);
    res.json(projetRows);

  } catch (err) {
    console.error("❌ Erreur récupération projets de l'encadreur:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des projets" });
  }
});

// NOUVELLE ROUTE : Obtenir tous les étudiants encadrés par un encadreur spécifique
app.get("/encadreurs/:matricule/etudiants", async (req, res) => {
  const { matricule } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT e.*, eq.Nom_equipe
       FROM etudiant e
       LEFT JOIN equipe eq ON e.Id_equipe = eq.Id_equipe
       JOIN projet p ON e.Immatricule = p.Id_etudiant OR e.Id_equipe = p.Id_equipe
       WHERE p.Id_encadreur = ?`,
      [matricule]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des étudiants :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// NOUVELLE ROUTE : Obtenir les détails d'un étudiant spécifique
app.get("/etudiants/:immatricule", async (req, res) => {
  const { immatricule } = req.params;
  console.log(`🔍 Récupération des détails pour l'étudiant ${immatricule}`);

  try {
    // Récupérer les informations de l'étudiant et de son équipe
    const [etudiantRows] = await pool.query(
      `SELECT e.*, eq.Nom_equipe
       FROM etudiant e
       LEFT JOIN equipe eq ON e.Id_equipe = eq.Id_equipe
       WHERE e.Immatricule = ?`,
      [immatricule]
    );

    if (etudiantRows.length === 0) {
      console.log(`❌ Étudiant ${immatricule} non trouvé`);
      return res.status(404).json({ error: "Étudiant non trouvé" });
    }

    console.log(`✅ Étudiant trouvé: ${etudiantRows[0].Nom}`);

    // Récupérer les projets de l'étudiant (individuels ou via son équipe)
    let projetRows = [];
    try {
      const [result] = await pool.query(
        `SELECT p.*, e.Nom as Nom_encadreur, e.Titre as Titre_encadreur
         FROM projet p
         JOIN encadreur e ON p.Id_encadreur = e.Matricule
         WHERE p.Id_etudiant = ? OR p.Id_equipe = ?`,
        [immatricule, etudiantRows[0].Id_equipe]
      );
      projetRows = result;
      console.log(`📋 Projets trouvés pour l'étudiant ${immatricule}:`, projetRows.length);
    } catch (projetError) {
      console.error(`❌ Erreur projets pour ${immatricule}:`, projetError);
      projetRows = [];
    }

    // Retourner la structure attendue par le frontend
    res.json({
      details: etudiantRows[0],
      projets: projetRows,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des détails de l'étudiant :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// AJOUT : GET tous les livrables pour un encadreur spécifique
app.get("/encadreurs/:matricule/livrables", async (req, res) => {
  const { matricule } = req.params;
  console.log(`📚 Récupération des livrables à corriger pour l'encadreur ${matricule}`);

  try {
    const query = `
      SELECT
        L.Id_livrable,
        L.Titre,
        L.Nom AS Nom_fichier,
        L.Type,
        L.Taille_fichier,
        L.Date_soumission,
        L.Status,
        L.Chemin_fichier,
        P.Theme AS Nom_projet,
        ET.Nom AS Nom_etudiant,
        ET.Image AS Avatar_etudiant
      FROM livrable L
      JOIN projet P ON L.Id_projet = P.Id_projet
      JOIN etudiant ET ON L.Id_etudiant = ET.Immatricule
      WHERE L.Id_encadreur = ?
      ORDER BY L.Date_soumission DESC
    `;

    const [livrables] = await pool.query(query, [matricule]);

    console.log(`✅ ${livrables.length} livrables trouvés pour l'encadreur ${matricule}.`);
    res.json(livrables);

  } catch (err) {
    console.error("❌ Erreur lors de la récupération des livrables de l'encadreur:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des livrables" });
  }
});

// ------------------- ROUTES PROJETS - COMPOSANTS -------------------
// NOUVELLE ROUTE 1: Obtenir l'état des composants d'un projet
app.get("/projets/:id/composants", async (req, res) => {
  const projetId = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM projet_composants WHERE Id_projet = ?",
      [projetId]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      // Si aucune entrée n'existe, on renvoie un objet par défaut
      res.json({
        Id_projet: projetId,
        Modelisation: 0,
        Developpement: 0,
        UX_UI_Design: 0,
        Rapport_Projet: 0,
      });
    }
  } catch (err) {
    console.error("❌ Erreur récupération composants projet:", err);
    res.status(500).json({ error: "Erreur récupération des composants du projet" });
  }
});

// NOUVELLE ROUTE 2: Mettre à jour les composants et l'avancement du projet
app.put("/projets/:id/composants", async (req, res) => {
  const projetId = req.params.id;
  const { Modelisation, Developpement, UX_UI_Design, Rapport_Projet } = req.body;

  // Calcul du nouvel avancement (chaque composant vaut 25%)
  const avancement = [Modelisation, Developpement, UX_UI_Design, Rapport_Projet]
    .filter(Boolean) // Garde seulement les 'true' (ou 1)
    .length * 25;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Requête 1: Mettre à jour les composants (UPSERT)
    // Crée la ligne si elle n'existe pas, sinon la met à jour.
    await connection.query(
      `
      INSERT INTO projet_composants (Id_projet, Modelisation, Developpement, UX_UI_Design, Rapport_Projet)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      Modelisation = VALUES(Modelisation),
      Developpement = VALUES(Developpement),
      UX_UI_Design = VALUES(UX_UI_Design),
      Rapport_Projet = VALUES(Rapport_Projet)
      `,
      [projetId, Modelisation, Developpement, UX_UI_Design, Rapport_Projet]
    );

    // Requête 2: Mettre à jour l'avancement dans la table principale 'projet'
    await connection.query(
      "UPDATE projet SET Avancement = ? WHERE Id_projet = ?",
      [avancement, projetId]
    );

    await connection.commit(); // Valide les deux requêtes
    connection.release();

    console.log(`✅ Progression du projet ${projetId} mise à jour à ${avancement}%`);
    res.json({ message: "Progression mise à jour avec succès", avancement });

  } catch (err) {
    await connection.rollback(); // Annule tout en cas d'erreur
    connection.release();
    console.error("❌ Erreur mise à jour progression:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la progression" });
  }
});

// ------------------- ROUTE DE SANTÉ -------------------
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), database: "Connected" });
});

// ------------------- ROUTE DE VÉRIFICATION D'AVATAR -------------------
app.get("/encadreurs/:matricule/avatar", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT Matricule, Nom, Avatar FROM encadreur WHERE Matricule = ?",
      [req.params.matricule]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Encadreur non trouvé" });
    }

    console.log(`🔍 Vérification Avatar - Encadreur ${req.params.matricule}:`);
    console.log(`   - Nom: ${rows[0].Nom}`);
    console.log(`   - Avatar actuel: ${rows[0].Avatar}`);

    res.json({
      matricule: rows[0].Matricule,
      nom: rows[0].Nom,
      avatar: rows[0].Avatar,
      avatarUrl: rows[0].Avatar ? `http://localhost:5000${rows[0].Avatar}` : null
    });
  } catch (err) {
    console.error("❌ Erreur vérification avatar:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

// ------------------- DEMARRAGE -------------------
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé`);
  } else {
    console.error('❌ Erreur du serveur:', err);
  }
  process.exit(1);
});