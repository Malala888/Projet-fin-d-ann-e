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
  try {
    const [rows] = await pool.query(
      `SELECT P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_fin,
              E.Nom AS Nom_encadreur, E.Email AS Email_encadreur, E.Titre AS Titre_encadreur
       FROM projet P
       JOIN encadreur E ON P.Id_encadreur = E.Matricule
       WHERE P.Id_etudiant = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération projets" });
  }
});

app.get("/projets/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT P.Id_projet, P.Theme, P.Description, P.Avancement, P.Date_fin,
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

// ------------------- ROUTES LIVRABLES -------------------

// GET livrables étudiant
app.get("/etudiants/:id/livrables", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT L.Id_livrable, L.Nom, L.Titre, L.Date_soumission, L.Status, L.Chemin_fichier,
              P.Theme AS Nom_projet
       FROM livrable L
       JOIN projet P ON L.Id_projet = P.Id_projet
       WHERE L.Id_etudiant = ?
       ORDER BY L.Date_soumission DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération livrables" });
  }
});

// ADD livrable
app.post("/etudiants/:id/livrables", upload.single("fichier"), async (req, res) => {
  try {
    const { Nom, Titre, Id_projet, Id_encadreur, Date_soumission, Status } = req.body;
    const Id_etudiant = req.params.id;

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
    res.status(500).json({ error: "Erreur ajout livrable" });
  }
});

// UPDATE livrable
app.put("/livrables/:id", upload.single("fichier"), async (req, res) => {
  try {
    const { Nom, Titre, Id_projet, Id_etudiant, Id_encadreur, Date_soumission, Status } = req.body;

    let chemin_fichier = null, type = null, taille = null;
    if (req.file) {
      chemin_fichier = `/uploads/${req.file.filename}`;
      type = req.file.mimetype;
      taille = (req.file.size / 1024 / 1024).toFixed(2) + "MB";
    }

    const [result] = await pool.query(
      `UPDATE livrable SET Id_projet=?, Id_etudiant=?, Id_encadreur=?, Nom=?, Titre=?, 
       Type=?, Taille_fichier=?, Date_soumission=?, Status=?, Chemin_fichier=? WHERE Id_livrable=?`,
      [Id_projet, Id_etudiant, Id_encadreur, Nom, Titre, type, taille, Date_soumission, Status, chemin_fichier, req.params.id]
    );
    res.json({ message: "Livrable modifié", affected: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: "Erreur modification livrable" });
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
    res.status(500).json({ error: "Erreur suppression livrable" });
  }
});

// DOWNLOAD livrable
app.get("/livrables/:id/download", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Chemin_fichier FROM livrable WHERE Id_livrable=?", [req.params.id]);
    if (rows.length === 0 || !rows[0].Chemin_fichier) return res.status(404).json({ error: "Fichier non trouvé" });
    const filePath = path.resolve(__dirname, "." + rows[0].Chemin_fichier);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: "Erreur téléchargement" });
  }
});

// ------------------- CALENDRIER -------------------
app.get("/etudiants/:id/calendrier", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT P.Date_fin AS date, P.Theme AS title, 'Projet' AS type FROM projet P WHERE P.Id_etudiant=?
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

// ------------------- DEMARRAGE -------------------
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(`📊 Route de santé disponible: http://localhost:${PORT}/health`);
});
