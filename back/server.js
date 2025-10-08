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
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// DÉSACTIVER LE CACHE POUR TOUTES LES REQUÊTES GET
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
  let idField = "";

  if (role === "etudiant") {
    table = "etudiant";
    idField = "Immatricule";
  } else if (role === "encadreur") {
    table = "encadreur";
    idField = "Matricule";
  } else if (role === "admin") {
    table = "admin";
    idField = "Id_admin";
  } else {
    return res.status(400).json({ error: "Rôle invalide" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT ${idField}, Nom, Email FROM ${table} WHERE Email = ? AND Mot_de_passe = ? LIMIT 1`,
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Identifiants invalides" });
    res.json({ message: "Connexion réussie", role, user: rows[0] });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur" });
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
    const [rows] = await pool.query("SELECT * FROM etudiant WHERE Immatricule = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Étudiant introuvable" });
    res.json(rows[0]);
  } catch {
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
        P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_deb, P.Date_fin, P.Id_encadreur, P.Id_equipe,
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

// GET projet spécifique avec détails complets
app.get("/projets/:id", async (req, res) => {
   try {
     const [rows] = await pool.query(
       `SELECT P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_deb, P.Date_fin, P.Id_encadreur, P.Id_equipe,
               E.Nom AS Nom_encadreur, E.Titre AS Titre_encadreur, E.Email AS Email_encadreur,
               ET.Nom AS Nom_etudiant, ET.Email AS Email_etudiant
        FROM projet P
        JOIN encadreur E ON P.Id_encadreur = E.Matricule
        JOIN etudiant ET ON P.Id_etudiant = ET.Immatricule
        WHERE P.Id_projet = ?`,
       [req.params.id]
     );
     if (rows.length === 0) return res.status(404).json({ error: "Projet introuvable" });
     res.json(rows[0]);
   } catch (err) {
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

// GET membres de l'équipe d'un projet spécifique
app.get("/projets/:id/equipe", async (req, res) => {
  try {
    console.log(`👥 Récupération des membres de l'équipe pour le projet ${req.params.id}`);

    // D'abord vérifier si le projet a une équipe
    const [projetRows] = await pool.query(
      "SELECT Id_equipe, Theme, Id_etudiant FROM projet WHERE Id_projet = ?",
      [req.params.id]
    );

    if (projetRows.length === 0) {
      console.log(`❌ Projet ${req.params.id} non trouvé`);
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    const projet = projetRows[0];
    console.log(`📋 Projet trouvé: ${projet.Theme}, Id_equipe: ${projet.Id_equipe}, Id_etudiant: ${projet.Id_etudiant}`);

    if (!projet.Id_equipe) {
      console.log(`📋 Projet ${req.params.id} n'a pas d'équipe`);
      return res.json([]);
    }

    // Récupérer tous les membres de l'équipe
    const [membres] = await pool.query(
      `SELECT E.Immatricule, E.Nom, E.Email, E.Niveau, E.Id_equipe
       FROM etudiant E
       WHERE E.Id_equipe = ?
       ORDER BY E.Nom`,
      [projet.Id_equipe]
    );

    console.log(`✅ ${membres.length} membres trouvés pour l'équipe ${projet.Id_equipe} du projet ${req.params.id}`);
    console.log(`📋 Membres:`, membres.map(m => `${m.Nom} (${m.Immatricule})`));

    res.json(membres);
  } catch (err) {
    console.error("❌ Erreur récupération membres équipe:", err);
    res.status(500).json({ error: "Erreur récupération membres équipe", details: err.message });
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
app.get("/etudiants/:id/calendrier", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT P.Date_deb AS date, P.Theme AS title, 'Projet' AS type FROM projet P WHERE P.Id_etudiant=?
       UNION
       SELECT L.Date_soumission AS date, L.Nom AS title, 'Livrable' AS type FROM livrable L WHERE L.Id_etudiant=?`,
      [req.params.id, req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur calendrier" });
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

// ------------------- ROUTE DE SANTÉ -------------------
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), database: "Connected" });
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