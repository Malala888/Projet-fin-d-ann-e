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

    // Get Id_encadreur from the projet
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

    // Get current livrable data to preserve status if needed
    const [currentRows] = await pool.query("SELECT Status, Chemin_fichier, Id_encadreur FROM livrable WHERE Id_livrable=?", [req.params.id]);
    const currentLivrable = currentRows[0];

    let chemin_fichier = currentLivrable ? currentLivrable.Chemin_fichier : null;
    let type = null, taille = null;

    if (req.file) {
      chemin_fichier = `/uploads/${req.file.filename}`;
      type = req.file.mimetype;
      taille = (req.file.size / 1024 / 1024).toFixed(2) + "MB";
    }

    // Determine the status to use
    let finalStatus = Status;
    if (!finalStatus && currentLivrable) {
      // If no status provided, keep the current one
      finalStatus = currentLivrable.Status;
    } else if (!finalStatus) {
      // If no current status and no new status, default to "Soumis"
      finalStatus = "Soumis";
    }

    const [result] = await pool.query(
      `UPDATE livrable SET Id_projet=?, Id_etudiant=?, Id_encadreur=?, Nom=?, Titre=?,
       Type=?, Taille_fichier=?, Date_soumission=?, Status=?, Chemin_fichier=? WHERE Id_livrable=?`,
      [Id_projet, Id_etudiant, currentLivrable.Id_encadreur, Nom, Titre, type, taille, Date_soumission, finalStatus, chemin_fichier, req.params.id]
    );
    res.json({ message: "Livrable modifié", affected: result.affectedRows });
  } catch (err) {
    console.error("Erreur modification livrable:", err);
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

// DOWNLOAD livrable - VERSION OPTIMISÉE
app.get("/livrables/:id/download", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT Chemin_fichier, Nom, Titre FROM livrable WHERE Id_livrable=?",
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].Chemin_fichier) {
      console.error(`❌ Livrable ${req.params.id} non trouvé ou sans fichier`);
      return res.status(404).json({ error: "Fichier non trouvé" });
    }

    // Construire le chemin complet du fichier
    const relativePath = rows[0].Chemin_fichier.replace('/uploads/', '');
    const filePath = path.join(__dirname, 'uploads', relativePath);

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier physique non trouvé: ${filePath}`);
      return res.status(404).json({ error: "Fichier non trouvé sur le serveur" });
    }

    console.log(`✅ Fichier trouvé: ${filePath}`);

    // Obtenir l'extension et le nom original
    const fileExt = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // Utiliser le titre ou le nom comme nom de téléchargement
    let downloadName = rows[0].Titre || rows[0].Nom || fileName;

    // S'assurer que le nom a une extension
    if (!path.extname(downloadName)) {
      downloadName += fileExt;
    }

    // Types MIME pour tous les formats courants
    const mimeTypes = {
      // Documents
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.odt': 'application/vnd.oasis.opendocument.text',
      '.rtf': 'application/rtf',

      // Présentations
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.odp': 'application/vnd.oasis.opendocument.presentation',

      // Feuilles de calcul
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
      '.csv': 'text/csv',

      // Texte
      '.txt': 'text/plain',

      // Images
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',

      // Archives
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',

      // Autres
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    };

    const contentType = mimeTypes[fileExt] || 'application/octet-stream';

    // Encoder correctement le nom du fichier pour éviter les problèmes avec les caractères spéciaux
    const encodedFileName = encodeURIComponent(downloadName);

    // Définir les headers appropriés
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"; filename*=UTF-8''${encodedFileName}`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // CORS headers pour permettre le téléchargement depuis le frontend
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    console.log(`📥 Téléchargement: ${downloadName} (${contentType}) - Taille: ${fs.statSync(filePath).size} bytes`);

    // Créer un stream de lecture et l'envoyer au client
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (error) => {
      console.error('❌ Erreur lors de la lecture du fichier:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erreur lors de la lecture du fichier" });
      }
    });

    fileStream.on('end', () => {
      console.log(`✅ Téléchargement terminé: ${downloadName}`);
    });

    // Envoyer le fichier
    fileStream.pipe(res);

  } catch (err) {
    console.error("❌ Erreur téléchargement:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur lors du téléchargement", details: err.message });
    }
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
