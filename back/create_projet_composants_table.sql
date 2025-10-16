--
-- Structure de la table `projet_composants`
--

CREATE TABLE `projet_composants` (
  `Id_projet` int(11) NOT NULL,
  `Modelisation` tinyint(1) DEFAULT 0,
  `Developpement` tinyint(1) DEFAULT 0,
  `UX_UI_Design` tinyint(1) DEFAULT 0,
  `Rapport_Projet` tinyint(1) DEFAULT 0,
  `Date_mise_a_jour` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour la table `projet_composants`
--
ALTER TABLE `projet_composants`
  ADD PRIMARY KEY (`Id_projet`);

--
-- Contraintes pour la table `projet_composants`
--
ALTER TABLE `projet_composants`
  ADD CONSTRAINT `projet_composants_ibfk_1` FOREIGN KEY (`Id_projet`) REFERENCES `projet` (`Id_projet`) ON DELETE CASCADE;

--
-- Insérer des données de test pour vos projets existants
--
INSERT INTO `projet_composants` (`Id_projet`, `Modelisation`, `Developpement`, `UX_UI_Design`, `Rapport_Projet`) VALUES
(1, 1, 0, 0, 0),
(2, 1, 0, 0, 0),
(3, 1, 1, 0, 0);