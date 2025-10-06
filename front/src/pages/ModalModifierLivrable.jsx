import React, { useState, useEffect } from 'react';

const ModalModifierLivrable = ({ isOpen, onClose, onSubmit, projets, livrableAModifier, etudiantId }) => {
    const [nom, setNom] = useState('');
    const [dateSoumission, setDateSoumission] = useState('');
    const [projetId, setProjetId] = useState('');
    const [fichier, setFichier] = useState(null);
    const [error, setError] = useState('');

    // Fonction simplifiée pour formater la date pour l'input
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        
        // Extraire seulement la partie YYYY-MM-DD
        const datePart = String(dateString).split('T')[0];
        
        // Vérifier que c'est un format valide
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }
        
        return "";
    };

    // Pré-remplir les champs quand le livrable à modifier change
    useEffect(() => {
        if (livrableAModifier) {
            console.log("📝 Chargement du livrable:", livrableAModifier);
            
            setNom(livrableAModifier.title || livrableAModifier.Nom || livrableAModifier.Titre || '');
            
            // Formater la date
            const dateFormatted = formatDateForInput(livrableAModifier.Date_soumission);
            console.log("📅 Date formatée pour input:", dateFormatted);
            setDateSoumission(dateFormatted);
            
            // Trouver l'ID du projet
            let currentProjetId = livrableAModifier.Id_projet;
            if (!currentProjetId && livrableAModifier.project) {
                const projet = projets.find(p => p.Theme === livrableAModifier.project);
                if (projet) {
                    currentProjetId = projet.Id_projet;
                }
            }

            if (currentProjetId) {
                setProjetId(currentProjetId.toString());
            }
        }
    }, [livrableAModifier, projets]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!nom || !dateSoumission || !projetId) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        setError('');

        const formData = new FormData();
        formData.append('Nom', nom);
        formData.append('Titre', nom);
        formData.append('Date_soumission', dateSoumission); // Format YYYY-MM-DD
        formData.append('Id_projet', projetId);
        formData.append('Id_etudiant', livrableAModifier.Id_etudiant || etudiantId);
        
        // Ajouter le fichier si présent
        if (fichier) {
            formData.append('fichier', fichier);
        }

        console.log("📤 Envoi des données:", {
            Nom: nom,
            Date_soumission: dateSoumission,
            Id_projet: projetId,
            Id_etudiant: livrableAModifier.Id_etudiant || etudiantId,
            fichier: fichier ? fichier.name : 'aucun'
        });

        // Logging détaillé pour la date
        console.log("📅 DÉTAILS DATE AVANT ENVOI:");
        console.log(`  Date sélectionnée: ${dateSoumission}`);
        console.log(`  Type: ${typeof dateSoumission}`);

        try {
          const dateObj = new Date(dateSoumission);
          console.log(`  Date parsée: ${dateObj.toISOString()}`);
          console.log(`  Date locale: ${dateObj.toLocaleDateString('fr-FR')}`);
          console.log(`  Timestamp: ${dateObj.getTime()}`);
        } catch (dateError) {
          console.error(`  ❌ Erreur parsing date avant envoi:`, dateError);
        }

        onSubmit(livrableAModifier.Id_livrable, formData);
    };

    if (!isOpen || !livrableAModifier) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Modifier le Livrable
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                                Titre du Livrable <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date de Soumission <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={dateSoumission}
                                onChange={(e) => {
                                    console.log("📅 Nouvelle date sélectionnée:", e.target.value);
                                    setDateSoumission(e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="projet" className="block text-sm font-medium text-gray-700 mb-1">
                                Projet Associé <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="projet"
                                value={projetId}
                                onChange={(e) => setProjetId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                required
                            >
                                <option value="">Sélectionner un projet</option>
                                {projets.map(projet => (
                                    <option key={projet.Id_projet} value={projet.Id_projet}>
                                        {projet.Theme}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 mb-1">
                                Nouveau Fichier (Remplacer l'ancien)
                            </label>
                            <input
                                type="file"
                                id="fichier"
                                onChange={(e) => setFichier(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Laissez vide pour conserver le fichier actuel
                            </p>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                    
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalModifierLivrable;