import React, { useEffect, useState } from "react";
import axios from "axios";

const ParametreEtudiant = () => {
    const [etudiant, setEtudiant] = useState(null);
    const [formData, setFormData] = useState({
        Nom: "",
        Email: "",
        Mot_de_passe: "",
        Filiere: "",
        Parcours: "",
        Niveau: ""
    });
    const [loading, setLoading] = useState(true);

    // Récupérer les données de l'utilisateur au chargement
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("role");

        if (!storedUser || storedRole !== "etudiant") {
            window.location.href = "/login";
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setEtudiant(userData);

            // Initialiser le formulaire avec les données
            setFormData({
                Nom: userData.Nom || "",
                Email: userData.Email || "",
                Mot_de_passe: userData.Mot_de_passe || "",
                Filiere: userData.Filiere || "",
                Parcours: userData.Parcours || "",
                Niveau: userData.Niveau || ""
            });

            setLoading(false);
            console.log("✅ Données utilisateur chargées:", userData);
        } catch (error) {
            console.error("❌ Erreur de chargement:", error);
            localStorage.clear();
            window.location.href = "/login";
        }
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        console.log(`📝 Champ ${id} modifié:`, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!etudiant) return;

        console.log("🚀 Soumission du formulaire avec les données:", formData);

        try {
            const response = await axios.put(`http://localhost:5000/etudiants/${etudiant.Immatricule}`, formData);
            console.log("✅ Réponse du serveur:", response.data);

            // Mettre à jour les données locales
            const updatedUser = response.data.user;
            setEtudiant(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("✅ Profil mis à jour avec succès !");
            window.location.reload();

        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour:", error.response ? error.response.data : error.message);
            alert("❌ Une erreur est survenue lors de la mise à jour.");
        }
    };

    if (loading || !etudiant) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <p>🔄 Chargement...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>⚙️ Paramètres de mon compte</h1>

            <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2>📝 Informations personnelles</h2>

                <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            Nom complet:
                        </label>
                        <input
                            id="Nom"
                            type="text"
                            value={formData.Nom}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            Email:
                        </label>
                        <input
                            id="Email"
                            type="email"
                            value={formData.Email}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            Filière:
                        </label>
                        <input
                            id="Filiere"
                            type="text"
                            value={formData.Filiere}
                            onChange={handleChange}
                            placeholder="Ex: Informatique"
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            Parcours:
                        </label>
                        <input
                            id="Parcours"
                            type="text"
                            value={formData.Parcours}
                            onChange={handleChange}
                            placeholder="Ex: IA, GL, Réseaux"
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            Niveau:
                        </label>
                        <select
                            id="Niveau"
                            value={formData.Niveau}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}
                        >
                            <option value="">Sélectionner un niveau</option>
                            <option value="L1">Licence 1</option>
                            <option value="L2">Licence 2</option>
                            <option value="L3">Licence 3</option>
                            <option value="M1">Master 1</option>
                            <option value="M2">Master 2</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: "#007bff",
                            color: "white",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        💾 Enregistrer les modifications
                    </button>
                </form>

                {/* Debug info */}
                <div style={{
                    marginTop: "30px",
                    padding: "15px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6"
                }}>
                    <h4>🔍 Informations de debug:</h4>
                    <p><strong>Nom:</strong> {etudiant.Nom}</p>
                    <p><strong>Email:</strong> {etudiant.Email}</p>
                    <p><strong>Filière:</strong> {etudiant.Filiere || 'Non définie'}</p>
                    <p><strong>Parcours:</strong> {etudiant.Parcours || 'Non défini'}</p>
                    <p><strong>Niveau:</strong> {etudiant.Niveau || 'Non défini'}</p>
                    <p><strong>Immatricule:</strong> {etudiant.Immatricule}</p>

                    <details>
                        <summary>📋 Données complètes (cliquez pour voir)</summary>
                        <pre>{JSON.stringify(etudiant, null, 2)}</pre>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default ParametreEtudiant;