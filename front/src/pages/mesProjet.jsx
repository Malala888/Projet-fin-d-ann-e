import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

// Modal d'ajout de projet (version "garantie" avec scrollbar visible + équipe)
const ModalAjoutProjet = ({ isOpen, onClose, onProjetAjoute, etudiant }) => {
  const formRef = useRef(null);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    theme: "",
    description: "",
    date_debut: "",
    date_fin: "",
    id_encadreur: "",
    nom_equipe: "",
    membres_equipe: [],
  });
  const [encadreurs, setEncadreurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [nouveauMembre, setNouveauMembre] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Charger données quand modal s'ouvre
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    axios
      .get("http://localhost:5000/encadreurs")
      .then((r) => setEncadreurs(r.data))
      .catch(console.error);
    axios
      .get("http://localhost:5000/etudiants")
      .then((r) => setEtudiants(r.data))
      .catch(console.error);
    setTimeout(() => {
      if (window.feather) window.feather.replace();
    }, 60);

    // empêcher le scroll du body (optionnel mais évite conflits)
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Ajout / suppression membre
  const ajouterMembreEquipe = () => {
    console.log("🔘 Bouton Ajouter membre cliqué");
    console.log("nouveauMembre:", nouveauMembre);
    console.log("formData.membres_equipe:", formData.membres_equipe);
    console.log("etudiants disponibles:", etudiants.length);

    if (!nouveauMembre) {
      console.log("❌ Aucun membre sélectionné");
      return;
    }
    if (
      formData.membres_equipe.find(
        (m) => m.Immatricule?.toString() === nouveauMembre.toString()
      )
    ) {
      console.log("❌ Membre déjà présent");
      return;
    }
    const found = etudiants.find(
      (e) => e.Immatricule?.toString() === nouveauMembre.toString()
    );
    if (!found) {
      console.log("❌ Membre non trouvé dans la liste");
      setErrorMessage("Membre introuvable — recharge la liste et réessaie.");
      return;
    }
    console.log("✅ Membre trouvé, ajout en cours:", found);
    setFormData((prev) => ({
      ...prev,
      membres_equipe: [...prev.membres_equipe, found],
    }));
    setNouveauMembre("");
    setErrorMessage("");
  };
  const supprimerMembreEquipe = (imm) =>
    setFormData((prev) => ({
      ...prev,
      membres_equipe: prev.membres_equipe.filter((m) => m.Immatricule !== imm),
    }));

  // Soumission (création équipe si nécessaire, puis création projet)
  const handleSubmit = async (e) => {
    alert(
      "DEBUG: handleSubmit appelé! Vérifiez la console (F12) pour plus de détails."
    );
    console.log("🚀 handleSubmit appelé!");
    console.log("État actuel du formulaire:", formData);
    console.log("Étudiant connecté:", etudiant);
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      console.log("🔍 VÉRIFICATION CONNEXION ÉTUDIANT:");
      console.log("etudiant:", etudiant);
      console.log("etudiant?.Immatricule:", etudiant?.Immatricule);
      console.log("!etudiant?.Immatricule:", !etudiant?.Immatricule);

      if (!etudiant?.Immatricule) {
        console.log("❌ ERREUR: Étudiant non connecté ou Immatricule manquant");
        setErrorMessage("Tu dois être connecté.");
        setLoading(false);
        return;
      }
      console.log("✅ Étudiant connecté, validation des champs...");
      console.log("Validation des champs:");
      console.log(
        "theme:",
        formData.theme,
        "trim:",
        formData.theme.trim(),
        "bool:",
        !formData.theme.trim()
      );
      console.log(
        "description:",
        formData.description,
        "trim:",
        formData.description.trim(),
        "bool:",
        !formData.description.trim()
      );
      console.log(
        "date_debut:",
        formData.date_debut,
        "bool:",
        !formData.date_debut
      );
      console.log("date_fin:", formData.date_fin, "bool:", !formData.date_fin);
      console.log(
        "id_encadreur:",
        JSON.stringify(formData.id_encadreur),
        "type:",
        typeof formData.id_encadreur,
        "bool:",
        !formData.id_encadreur,
        "length:",
        formData.id_encadreur?.length
      );

      console.log("🔍 VALIDATION DÉTAILLÉE:");
      const champsRequis = {
        theme: formData.theme.trim(),
        description: formData.description.trim(),
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        id_encadreur: formData.id_encadreur,
      };

      Object.entries(champsRequis).forEach(([key, value]) => {
        console.log(
          `${key}: "${value}" (type: ${typeof value}, length: ${
            value?.length || 0
          })`
        );
      });

      if (
        !formData.theme.trim() ||
        !formData.description.trim() ||
        !formData.date_debut ||
        !formData.date_fin ||
        !formData.id_encadreur ||
        formData.id_encadreur === "0" ||
        formData.id_encadreur === ""
      ) {
        console.log("❌ VALIDATION ÉCHOUÉE - Champs manquants détectés");
        const champsManquants = Object.entries(champsRequis)
          .filter(([key, value]) => !value || value === "0" || value === "")
          .map(([key]) => key);
        console.log("Champs manquants:", champsManquants);
        setErrorMessage("Remplis tous les champs obligatoires.");
        setLoading(false);
        return;
      }
      console.log("VALIDATION RÉUSSIE - Tous les champs sont présents");
      if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
        setErrorMessage("La date de fin doit être après la date de début.");
        setLoading(false);
        return;
      }

      let id_equipe = null;
      if (formData.nom_equipe && formData.membres_equipe.length > 0) {
        // préparer array d'IDs (incluant le créateur)
        let membresIds = [parseInt(etudiant.Immatricule, 10)];
        formData.membres_equipe.forEach((m) => {
          const id = parseInt(m?.Immatricule ?? m, 10);
          if (!Number.isNaN(id)) membresIds.push(id);
        });
        membresIds = Array.from(new Set(membresIds));
        try {
          const resp = await axios.post("http://localhost:5000/equipes", {
            nom_equipe: formData.nom_equipe,
            membres: membresIds,
          });
          const d = resp?.data;
          // gestion des différents formats de réponse
          id_equipe =
            d?.id_equipe ?? d?.insertId ?? d?.id ?? d?.insertedId ?? null;
          if (!id_equipe && typeof d === "number") id_equipe = d;
          if (!id_equipe) {
            // serveur a peut-être créé l'équipe sans renvoyer l'id : on stoppe pour éviter d'envoyer un projet incohérent
            setErrorMessage(
              "Équipe créée mais serveur n'a pas renvoyé son id. Vérifie la réponse serveur (console)."
            );
            console.warn("Réponse création équipe:", d);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Erreur création équipe:", err);
          setErrorMessage(
            "Erreur lors de la création de l'équipe : " +
              (err.response?.data?.error || err.message)
          );
          setLoading(false);
          return;
        }
      }

      // créer le projet
      const projetData = {
        theme: formData.theme.trim(),
        description: formData.description.trim(),
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        id_encadreur: parseInt(formData.id_encadreur, 10),
        id_etudiant: parseInt(etudiant.Immatricule, 10),
        id_equipe: id_equipe,
      };

      console.log("🚀 DONNÉES ENVOYÉES AU SERVEUR:");
      console.log("projetData:", projetData);
      console.log("Types:", {
        theme: typeof projetData.theme + ' = "' + projetData.theme + '"',
        description:
          typeof projetData.description + ' = "' + projetData.description + '"',
        date_debut:
          typeof projetData.date_debut + ' = "' + projetData.date_debut + '"',
        date_fin:
          typeof projetData.date_fin + ' = "' + projetData.date_fin + '"',
        id_encadreur:
          typeof projetData.id_encadreur + " = " + projetData.id_encadreur,
        id_etudiant:
          typeof projetData.id_etudiant + " = " + projetData.id_etudiant,
        id_equipe: typeof projetData.id_equipe + " = " + projetData.id_equipe,
      });
      console.log("Types des données:", {
        theme: typeof projetData.theme,
        description: typeof projetData.description,
        date_debut: typeof projetData.date_debut,
        date_fin: typeof projetData.date_fin,
        id_encadreur: typeof projetData.id_encadreur,
        id_etudiant: typeof projetData.id_etudiant,
        id_equipe: typeof projetData.id_equipe,
      });

      const projetResp = await axios.post(
        "http://localhost:5000/projets",
        projetData
      );
      onProjetAjoute(projetResp.data);
      // reset + fermer
      setFormData({
        theme: "",
        description: "",
        date_debut: "",
        date_fin: "",
        id_encadreur: "",
        nom_equipe: "",
        membres_equipe: [],
      });
      onClose();
    } catch (err) {
      console.error("❌ ERREUR CAPTURÉE - Détails complets:");
      console.error("Message:", err.message);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Config:", err.config);
      console.error("Full error object:", err);
      setErrorMessage(
        "Erreur inattendue : " +
          (err.response?.data?.error || err.message || JSON.stringify(err))
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log("🖼️ Modal ouvert, état du formulaire:", formData);
  console.log("👥 Étudiants chargés:", etudiants.length);
  console.log("👨‍🏫 Encadreurs chargés:", encadreurs.length);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3">
      {/* Modal (position fixed top/bottom pour fiabilité du scroll) */}
      <div
        id="mesprojets-modal-scroll"
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl shadow-2xl"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: "5vh",
          maxHeight: "90vh",
          width: "min(760px, calc(100% - 32px))",
          overflowY: "scroll",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* styles scrollbar (WebKit + Firefox) */}
        <style>{`
          #mesprojets-modal-scroll::-webkit-scrollbar { width: 10px; }
          #mesprojets-modal-scroll::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 6px; }
          #mesprojets-modal-scroll::-webkit-scrollbar-track { background: #f3f4f6; }
          /* Firefox */
          #mesprojets-modal-scroll { scrollbar-width: thin; scrollbar-color: #9ca3af #f3f4f6; }
        `}</style>

        {/* HEADER (sticky top) */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Nouveau Projet
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <i data-feather="x" className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENU (c'est cette boîte qui défile) */}
        <div className="p-4">
          {errorMessage && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
              {errorMessage}
            </div>
          )}

          <form
            id="project-form"
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.theme}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, theme: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.date_debut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_debut: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.date_fin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_fin: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encadreur *
              </label>
              <select
                className="w-full p-2 border rounded"
                value={formData.id_encadreur}
                onChange={(e) => {
                  console.log("Encadreur sélectionné:", e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    id_encadreur: e.target.value,
                  }));
                }}
                required
              >
                <option value="">Sélectionner un encadreur</option>
                {encadreurs.map((enc) => {
                  console.log("Encadreur disponible:", enc.Matricule, enc.Nom);
                  return (
                    <option key={enc.Matricule} value={enc.Matricule}>
                      {enc.Nom} ({enc.Titre})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipe (optionnel)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.nom_equipe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nom_equipe: e.target.value,
                    }))
                  }
                />
              </div>

              {formData.nom_equipe && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membres de l'équipe
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      className="flex-1 p-2 border rounded"
                      value={nouveauMembre}
                      onChange={(e) => setNouveauMembre(e.target.value)}
                    >
                      <option value="">Sélectionner un étudiant...</option>
                      {etudiants
                        .filter(
                          (x) =>
                            x.Immatricule !== etudiant.Immatricule &&
                            !formData.membres_equipe.find(
                              (m) => m.Immatricule === x.Immatricule
                            )
                        )
                        .map((x) => (
                          <option
                            key={`student-${x.Immatricule}-${x.Nom}`}
                            value={x.Immatricule}
                          >
                            {x.Nom} ({x.Immatricule})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={ajouterMembreEquipe}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Ajouter
                    </button>
                  </div>

                  {formData.membres_equipe.length > 0 && (
                    <div className="border rounded">
                      <div className="p-2 bg-gray-50 border-b text-xs text-gray-600">
                        Membres ajoutés :
                      </div>
                      <div className="max-h-[160px] overflow-y-auto p-2 space-y-1">
                        {formData.membres_equipe.map((m) => (
                          <div
                            key={m.Immatricule}
                            className="flex justify-between items-center bg-white p-2 rounded text-sm"
                          >
                            <span className="truncate">
                              {m.Nom} ({m.Immatricule})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                supprimerMembreEquipe(m.Immatricule)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <i data-feather="x-circle" className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* FOOTER sticky bottom (dans le container scrollable) */}
        <div className="sticky bottom-0 z-20 bg-white border-t p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              onClose();
            }}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("Bouton Créer cliqué");
              formRef.current?.requestSubmit();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Création..." : "Créer le projet"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de modification de projet
const ModalModifierProjet = ({
  isOpen,
  onClose,
  onProjetModifie,
  projet,
  etudiant,
}) => {
  const formRef = useRef(null);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    theme: "",
    description: "",
    date_debut: "",
    date_fin: "",
    id_encadreur: "",
    nom_equipe: "",
    membres_equipe: [],
  });
  const [encadreurs, setEncadreurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [nouveauMembre, setNouveauMembre] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Pour le message de succès

  // Charger données quand modal s'ouvre
  useEffect(() => {
    if (!isOpen || !projet) return;

    setErrorMessage("");
    setSuccessMessage(""); // Réinitialiser le message de succès

    // Charger les listes générales
    axios
      .get("http://localhost:5000/encadreurs")
      .then((r) => setEncadreurs(r.data))
      .catch(console.error);
    axios
      .get("http://localhost:5000/etudiants")
      .then((r) => setEtudiants(r.data))
      .catch(console.error);

    // Initialiser le formulaire avec les données de base du projet
    const dateDebut = projet.Date_deb
      ? new Date(projet.Date_deb).toISOString().split("T")[0]
      : "";
    const dateFin = projet.Date_fin
      ? new Date(projet.Date_fin).toISOString().split("T")[0]
      : "";

    setFormData({
      theme: projet.Theme || "",
      description: projet.Description || "",
      date_debut: dateDebut,
      date_fin: dateFin,
      id_encadreur: projet.Id_encadreur || "",
      // On initialise le nom et les membres ici, ils seront remplis par les appels API
      nom_equipe: "",
      membres_equipe: [],
    });

    // Charger les détails de l'équipe (nom et membres)
    if (projet.Id_equipe) {
      // On récupère le nom de l'équipe via la route projet améliorée
      axios
        .get(`http://localhost:5000/projets/${projet.Id_projet}`)
        .then((response) => {
          setFormData((prev) => ({
            ...prev,
            nom_equipe: response.data.Nom_equipe || "",
          }));
        })
        .catch((error) =>
          console.error("Erreur chargement nom équipe:", error)
        );

      // On récupère les membres de l'équipe
      axios
        .get(`http://localhost:5000/projets/${projet.Id_projet}/equipe`)
        .then((response) => {
          // On initialise l'état avec les membres actuels
          const membresSansLeCreateur = response.data.filter(
            (m) => m.Immatricule !== etudiant.Immatricule
          );
          setFormData((prev) => ({
            ...prev,
            membres_equipe: membresSansLeCreateur,
          }));
        })
        .catch((error) => {
          console.error("Erreur chargement membres équipe :", error);
          setErrorMessage("Impossible de charger les membres de l'équipe.");
        });
    }

    setTimeout(() => {
      if (window.feather) window.feather.replace();
    }, 100);
  }, [isOpen, projet, etudiant]);

  // Ajout / suppression membre
  const ajouterMembreEquipe = () => {
    if (!nouveauMembre) return;

    if (
      formData.membres_equipe.find(
        (m) => m.Immatricule?.toString() === nouveauMembre.toString()
      )
    ) {
      return;
    }

    const found = etudiants.find(
      (e) => e.Immatricule?.toString() === nouveauMembre.toString()
    );
    if (!found) {
      setErrorMessage("Membre introuvable — recharge la liste et réessaie.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      membres_equipe: [...prev.membres_equipe, found],
    }));
    setNouveauMembre("");
    setErrorMessage("");
  };

  const supprimerMembreEquipe = (immatricule) => {
    setFormData((prev) => ({
      ...prev,
      membres_equipe: prev.membres_equipe.filter(
        (m) => m.Immatricule !== immatricule
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (
        !formData.theme ||
        !formData.description ||
        !formData.date_debut ||
        !formData.date_fin ||
        !formData.id_encadreur
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }
      if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
        throw new Error("La date de fin doit être après la date de début.");
      }

      // 1. Gérer l'équipe
      let equipeId = projet.Id_equipe;
      // Si une équipe existe et que son nom a été modifié ou ses membres ont changé
      if (equipeId && formData.nom_equipe) {
        const membresIds = [
          projet.Id_etudiant,
          ...formData.membres_equipe.map((m) => m.Immatricule),
        ];
        const equipeData = {
          nom_equipe: formData.nom_equipe.trim(),
          membres: Array.from(new Set(membresIds)),
        };
        await axios.put(
          `http://localhost:5000/equipes/${equipeId}`,
          equipeData
        );
      }

      // 2. Mettre à jour le projet avec toutes les informations
      const projetData = {
        theme: formData.theme.trim(),
        description: formData.description.trim(),
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        id_encadreur: parseInt(formData.id_encadreur, 10),
        id_etudiant: projet.Id_etudiant,
        id_equipe: equipeId,
      };
      await axios.put(
        `http://localhost:5000/projets/${projet.Id_projet}`,
        projetData
      );

      // 3. Afficher le succès et fermer
      setSuccessMessage("Projet modifié avec succès !");
      setTimeout(() => {
        onProjetModifie();
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || err.message || "Une erreur est survenue."
      );
      setLoading(false);
    }
  };

  if (!isOpen || !projet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl shadow-2xl"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: "5vh",
          maxHeight: "90vh",
          width: "min(760px, calc(100% - 32px))",
          overflowY: "scroll",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          #mesprojets-modal-modifier::-webkit-scrollbar { width: 10px; }
          #mesprojets-modal-modifier::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 6px; }
          #mesprojets-modal-modifier::-webkit-scrollbar-track { background: #f3f4f6; }
          #mesprojets-modal-modifier { scrollbar-width: thin; scrollbar-color: #9ca3af #f3f4f6; }
        `}</style>

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Modifier le Projet
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <i data-feather="x" className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENU */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 text-sm text-green-800 bg-green-100 p-3 rounded-lg border border-green-300">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 text-sm text-red-800 bg-red-100 p-3 rounded-lg border border-red-300">
              {errorMessage}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.theme}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, theme: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.date_debut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_debut: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.date_fin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_fin: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encadreur *
              </label>
              <select
                className="w-full p-2 border rounded"
                value={formData.id_encadreur}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    id_encadreur: e.target.value,
                  }))
                }
                required
              >
                <option value="">Sélectionner un encadreur</option>
                {encadreurs.map((enc) => (
                  <option key={enc.Matricule} value={enc.Matricule}>
                    {enc.Nom} ({enc.Titre})
                  </option>
                ))}
              </select>
            </div>

            {/* Section Équipe (unifiée) */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-md font-semibold text-gray-800">
                Gestion de l'équipe
              </h4>

              {/* Champ pour modifier le nom de l'équipe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.nom_equipe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nom_equipe: e.target.value,
                    }))
                  }
                  placeholder={
                    projet.Id_equipe
                      ? "Modifier le nom..."
                      : "Nommer l'équipe pour ajouter des membres"
                  }
                />
              </div>

              {/* Section pour gérer les membres (visible si l'équipe a un nom) */}
              {formData.nom_equipe && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membres de l'équipe
                  </label>
                  {/* Sélecteur pour ajouter un nouveau membre */}
                  <div className="flex gap-2 mb-2">
                    <select
                      className="flex-1 p-2 border rounded"
                      value={nouveauMembre}
                      onChange={(e) => setNouveauMembre(e.target.value)}
                    >
                      <option value="">Ajouter un étudiant...</option>
                      {etudiants
                        .filter(
                          (e) =>
                            e.Immatricule !== etudiant.Immatricule && // Ne pas s'ajouter soi-même
                            !formData.membres_equipe.find(
                              (m) => m.Immatricule === e.Immatricule
                            ) // Ne pas ajouter un membre déjà présent
                        )
                        .map((e) => (
                          <option key={e.Immatricule} value={e.Immatricule}>
                            {e.Nom} ({e.Immatricule})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={ajouterMembreEquipe}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>

                  {/* Liste des membres déjà ajoutés */}
                  {formData.membres_equipe.length > 0 && (
                    <div className="border rounded bg-gray-50">
                      <div className="p-2 border-b text-xs text-gray-600 font-medium">
                        Membres actuels :
                      </div>
                      <div className="max-h-[160px] overflow-y-auto p-2 space-y-1">
                        {formData.membres_equipe.map((m) => (
                          <div
                            key={m.Immatricule}
                            className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm"
                          >
                            <span>
                              {m.Nom} ({m.Immatricule})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                supprimerMembreEquipe(m.Immatricule)
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Supprimer le membre"
                            >
                              <i data-feather="x-circle" className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* FOOTER sticky bottom */}
        <div className="sticky bottom-0 z-20 bg-gray-50 border-t p-4 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={loading || successMessage} // On désactive aussi si le succès est déjà affiché
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Modification..." : "Modifier le projet"}
          </button>
        </div>
      </div>
    </div>
  );
};

// NOUVEAU : Modal de confirmation pour la suppression
const ModalConfirmationSuppression = ({
  isOpen,
  onClose,
  onConfirm,
  projet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <i data-feather="alert-triangle" className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">
          Confirmer la suppression
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Êtes-vous sûr de vouloir supprimer le projet : <br />
          <strong className="font-medium">{projet?.Theme}</strong> ? <br />
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// Le reste du composant MesProjets reste inchangé...
const MesProjets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [etudiant, setEtudiant] = useState(null);
  const [projets, setProjets] = useState([]);
  const [isModalAjoutOpen, setIsModalAjoutOpen] = useState(false);
  const [isModalModifierOpen, setIsModalModifierOpen] = useState(false);
  const [projetAmodifier, setProjetAmodifier] = useState(null);
  // NOUVEAU : État pour gérer le modal de suppression
  const [projetASupprimer, setProjetASupprimer] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const navigate = useNavigate();

  const openEmailWindow = (projet) => {
    const sujet = encodeURIComponent(
      `Question concernant le projet: ${projet.Theme}`
    );
    const corps = encodeURIComponent(
      `Bonjour ${projet.Nom_encadreur},\n\nJe vous contacte au sujet du projet "${projet.Theme}".\n\nCordialement,\n${etudiant?.Nom}`
    );
    const mailtoLink = `mailto:${projet.Email_encadreur}?subject=${sujet}&body=${corps}`;
    const screenWidth = window.screen.width,
      screenHeight = window.screen.height;
    const windowWidth = 600,
      windowHeight = 400;
    const left = (screenWidth - windowWidth) / 2,
      top = (screenHeight - windowHeight) / 2;
    window.open(
      mailtoLink,
      "emailWindow",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  const handleProjetAjoute = (nouveauProjet) => {
    axios
      .get(`http://localhost:5000/etudiants/${etudiant.Immatricule}/projets`)
      .then((response) => setProjets(response.data))
      .catch((error) =>
        console.error("Erreur lors du rafraîchissement des projets :", error)
      );
  };

  const handleModifierProjet = (projet) => {
    setProjetAmodifier(projet);
    setIsModalModifierOpen(true);
  };

  const handleProjetModifie = () => {
    axios
      .get(`http://localhost:5000/etudiants/${etudiant.Immatricule}/projets`)
      .then((response) => setProjets(response.data))
      .catch((error) =>
        console.error("Erreur lors du rafraîchissement des projets :", error)
      );
    setIsModalModifierOpen(false);
    setProjetAmodifier(null);
  };

  // NOUVEAU : Fonction pour confirmer et exécuter la suppression
  const handleConfirmDelete = async () => {
    if (!projetASupprimer) return;

    try {
      await axios.delete(
        `http://localhost:5000/projets/${projetASupprimer.Id_projet}`
      );

      // Mettre à jour la liste des projets directement côté client pour une meilleure réactivité
      setProjets(
        projets.filter((p) => p.Id_projet !== projetASupprimer.Id_projet)
      );

      // Afficher le message de succès
      setDeleteSuccessMessage(
        `Projet "${projetASupprimer.Theme}" supprimé avec succès !`
      );

      // Fermer le modal et nettoyer le message après 3 secondes
      setProjetASupprimer(null);
      setTimeout(() => {
        setDeleteSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression du projet :", error);
      // Optionnel : afficher une notification d'erreur
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "etudiant") {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setEtudiant(userData);
      axios
        .get(`http://localhost:5000/etudiants/${userData.Immatricule}/projets`)
        .then((response) => {
          setProjets(response.data);
          setTimeout(() => feather.replace(), 100);
        })
        .catch((error) =>
          console.error("Erreur lors de la récupération des projets :", error)
        );
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Écouter les changements dans localStorage pour mettre à jour les données utilisateur
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setEtudiant(updatedUser);
          console.log(
            "🔄 Données utilisateur mises à jour dans projets:",
            updatedUser
          );
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour des données:", error);
        }
      }
    };

    // Écouter les événements personnalisés de mise à jour utilisateur
    const handleUserUpdate = (e) => {
      const updatedUser = e.detail;
      setEtudiant(updatedUser);
      console.log(
        "🔄 Données utilisateur mises à jour via événement personnalisé:",
        updatedUser
      );
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!etudiant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">
            🔄 Chargement des projets...
          </p>
          <p className="text-sm text-gray-500">
            Si le chargement persiste, veuillez vous{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              reconnecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Construire l'URL de l'image avec cache busting
  const profileImageUrl =
    etudiant?.Image && !etudiant.Image.startsWith("http")
      ? `http://localhost:5000${etudiant.Image}${
          etudiant.Image.includes("?") ? "&" : "?"
        }t=${new Date().getTime()}`
      : etudiant?.Image || "http://static.photos/people/200x200/2";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                <i data-feather="menu" className="h-6 w-6" />
              </button>
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Espace Étudiant
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <div className="group relative">
                <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                  <span className="ml-2 text-sm font-medium">
                    {etudiant.Nom}
                  </span>
                  <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i data-feather="log-out" className="mr-2 h-4 w-4"></i>{" "}
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded text-white hover:bg-blue-600"
            >
              <i data-feather="log-out" className="h-6 w-6"></i>
            </button>
          </div>
        </div>
      </nav>
      <div className="flex flex-1">
        <aside
          className={`sidebar bg-white w-64 min-h-screen border-r ${
            sidebarOpen ? "" : "hidden"
          } md:block absolute md:relative z-20 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={profileImageUrl}
              alt="Avatar de l'étudiant"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {etudiant.Nom}
              </p>
              <p className="text-xs text-gray-500">
                Étudiant {etudiant.Niveau}
              </p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i>Tableau de
              bord
            </Link>
            <Link
              to="/mes_projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i>Mes
              projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i>Mes
              livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i>Calendrier
            </Link>
            <Link
              to="/statistique_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i>Mes
              statistiques
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>Paramètres
            </Link>
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="log-out" className="mr-3 h-5 w-5"></i>{" "}
              Déconnexion
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Mes projets</h1>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => {
                console.log("Ouverture du modal");
                setIsModalAjoutOpen(true);
              }}
            >
              <i data-feather="plus" className="mr-2 h-4 w-4"></i>Nouveau projet
            </button>
          </div>

          {/* NOUVEAU : Message de succès de suppression */}
          {deleteSuccessMessage && (
            <div className="mb-4 text-sm text-green-800 bg-green-100 p-3 rounded-lg border border-green-300">
              {deleteSuccessMessage}
            </div>
          )}
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avancement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projets.length > 0 ? (
                  projets.map((projet) => (
                    <tr key={projet.Id_projet} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {projet.Theme}
                        </div>
                        <div className="text-sm text-gray-500">
                          {projet.Description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            className="h-6 w-6 rounded-full mr-2"
                            src={`http://static.photos/people/200x200/${
                              (projet.Id_encadreur % 10) + 1 || 1
                            }`}
                            alt=""
                          />
                          <span>{`${projet.Nom_encadreur || "Non défini"} ${
                            projet.Titre_encadreur || ""
                          }`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {projet.Date_fin
                          ? new Date(projet.Date_fin).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Non définie"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${projet.Avancement}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {projet.Avancement}% complété
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/projet_detail/${projet.Id_projet}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <i data-feather="eye"></i>
                          </Link>
                          <button
                            onClick={() => openEmailWindow(projet)}
                            className="text-green-600 hover:text-green-900"
                            title="Envoyer un message"
                          >
                            <i data-feather="message-square"></i>
                          </button>
                          <button
                            onClick={() => handleModifierProjet(projet)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Modifier le projet"
                          >
                            <i data-feather="edit"></i>
                          </button>
                          {/* NOUVEAU : Bouton de suppression */}
                          <button
                            onClick={() => setProjetASupprimer(projet)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer le projet"
                          >
                            <i data-feather="trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucun projet trouvé pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <ModalAjoutProjet
        isOpen={isModalAjoutOpen}
        onClose={() => setIsModalAjoutOpen(false)}
        onProjetAjoute={handleProjetAjoute}
        etudiant={etudiant}
      />
      <ModalModifierProjet
        isOpen={isModalModifierOpen}
        onClose={() => {
          setIsModalModifierOpen(false);
          setProjetAmodifier(null);
        }}
        onProjetModifie={handleProjetModifie}
        projet={projetAmodifier}
        etudiant={etudiant}
      />

      {/* NOUVEAU : On ajoute le modal de confirmation ici */}
      <ModalConfirmationSuppression
        isOpen={!!projetASupprimer}
        onClose={() => setProjetASupprimer(null)}
        onConfirm={handleConfirmDelete}
        projet={projetASupprimer}
      />
    </div>
  );
};

export default MesProjets;
