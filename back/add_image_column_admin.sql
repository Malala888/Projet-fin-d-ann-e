-- Script pour ajouter la colonne Image à la table admin
-- Exécuter cette commande dans MySQL:
-- SOURCE back/add_image_column_admin.sql;

USE projet_m1;

-- Vérifier si la colonne Image existe déjà
SELECT COUNT(*) as image_column_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'projet_m1'
  AND TABLE_NAME = 'admin'
  AND COLUMN_NAME = 'Image';

-- Ajouter la colonne Image si elle n'existe pas
ALTER TABLE admin ADD COLUMN Image VARCHAR(255) DEFAULT NULL;

-- Vérifier que la colonne a été ajoutée
DESCRIBE admin;

-- Afficher un message de confirmation
SELECT 'Colonne Image ajoutée avec succès à la table admin' as message;