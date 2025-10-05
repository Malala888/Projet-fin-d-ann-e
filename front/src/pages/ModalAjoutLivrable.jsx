import React, { useState, useEffect } from 'react';
import feather from 'feather-icons';

const ModalAjoutLivrable = ({ isOpen, onClose, onSubmit, projets, etudiantId }) => {
    const [nom, setNom] = useState('');
    const [dateSoumission, setDateSoumission] = useState('');
    const [projetId, setProjetId] = useState('');
    const [fichier, setFichier] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        feather.replace();
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nom || !dateSoumission || !projetId) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        setError('');

        // C'est ici que les noms des champs avec Majuscule sont définis
        const formData = new FormData();
        formData.append('Nom', nom);
        formData.append('Titre', nom);
        formData.append('Date_soumission', dateSoumission);
        formData.append('Id_projet', projetId);
        formData.append('Id_etudiant', etudiantId);
        if (fichier) {
            formData.append('fichier', fichier);
        }

        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Ajouter un Nouveau Livrable</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i data-feather="x" className="w-6 h-6"></i>
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
                                onChange={(e) => setDateSoumission(e.target.value)}
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
                                Fichier (Optionnel)
                            </label>
                            <input
                                type="file"
                                id="fichier"
                                onChange={(e) => setFichier(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAjoutLivrable;