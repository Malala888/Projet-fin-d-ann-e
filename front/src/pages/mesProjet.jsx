import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

const MesProjets = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [etudiant, setEtudiant] = useState(null);
    const [projets, setProjets] = useState([]);
    const navigate = useNavigate();

    // Fonction pour ouvrir l'email dans une petite fenêtre centrée
    const openEmailWindow = (projet) => {
        const sujet = encodeURIComponent(`Question concernant le projet: ${projet.Theme}`);
        const corps = encodeURIComponent(`Bonjour ${projet.Nom_encadreur},\n\nJe vous contacte au sujet du projet "${projet.Theme}".\n\nCordialement,\n${etudiant?.Nom}`);
        const mailtoLink = `mailto:${projet.Email_encadreur}?subject=${sujet}&body=${corps}`;

        // Calculer la position pour centrer la fenêtre
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const windowWidth = 600;
        const windowHeight = 400;
        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        // Ouvrir dans une petite fenêtre centrée
        window.open(
            mailtoLink,
            'emailWindow',
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
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
                    console.log("📋 Projets reçus:", response.data);
                    console.log("🔍 Détails du premier projet:", response.data[0]);
                    setProjets(response.data);
                    setTimeout(() => {
                        feather.replace();
                    }, 0);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des projets :", error);
                });
        } catch (error) {
            console.error("Erreur de parsing des données utilisateur :", error);
            localStorage.clear();
            navigate("/login");
        }
    }, [navigate]);

    if (!etudiant) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Chargement des projets...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
            {/* Navbar */}
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
                            <div className="flex items-center">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="http://static.photos/people/200x200/2"
                                    alt="Profile"
                                />
                                <span className="ml-2 text-sm font-medium">
                                    {etudiant.Nom}
                                </span>
                                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {/* --- */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={`sidebar bg-white w-64 min-h-screen border-r ${
                        sidebarOpen ? "" : "hidden"
                    } md:block`}
                >
                    <div className="p-4 border-b flex items-center">
                        <img
                            className="h-10 w-10 rounded-full"
                            src="http://static.photos/people/200x200/2"
                            alt=""
                        />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {etudiant.Nom}
                            </p>
                            <p className="text-xs text-gray-500">Étudiant M1</p>
                        </div>
                    </div>
                    <nav className="p-4 space-y-1">
                        <Link
                            to="/dashboard"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de
                            bord
                        </Link>
                        <Link
                            to="/mes_projet"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
                        >
                            <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes
                            projets
                        </Link>
                        <Link
                            to="/mes_livrables"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes
                            livrables
                        </Link>
                        <Link
                            to="/calendrierEtudiant"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            <i data-feather="calendar" className="mr-3 h-5 w-5"></i>{" "}
                            Calendrier
                        </Link>
                        <Link
                            to="/statistique_etudiant"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Mes
                            statistiques
                        </Link>
                        <Link
                            to="/parametre_etudiant"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
                            Paramètres
                        </Link>
                    </nav>
                </aside>
                {/* --- */}
                {/* Main content */}
                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Mes projets
                    </h1>
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
                                    projets.map((projet, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
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
                                                            (projet.Id_encadreur % 10) + 1
                                                        }`}
                                                        alt=""
                                                    />
                                                    <span>{`${projet.Nom_encadreur || 'Non défini'} ${projet.Titre_encadreur || ''}`}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {projet.Date_fin ? (() => {
                                                    try {
                                                        const dateObj = new Date(projet.Date_fin);
                                                        return dateObj.toLocaleDateString('fr-FR');
                                                    } catch (error) {
                                                        return projet.Date_fin;
                                                    }
                                                })() : 'Non définie'}
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
                                                <Link
                                                    to={`/projet_detail/${projet.Id_projet}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
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
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            Aucun projet trouvé pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

        </div>
    );
};

export default MesProjets;