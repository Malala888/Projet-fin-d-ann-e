import React, { useState, useEffect } from 'react';

const ModalMessagerie = ({ isOpen, onClose, emailDestinataire, nomEncadreur, projetTheme }) => {
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Réinitialiser les champs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSujet('');
      setMessage('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sujet.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError('');

    try {
      // Créer le lien mailto avec les informations
      const sujetEncoded = encodeURIComponent(sujet);
      const corpsEncoded = encodeURIComponent(message);
      const mailtoLink = `mailto:${emailDestinataire}?subject=${sujetEncoded}&body=${corpsEncoded}`;

      console.log("📧 Ouverture mailto dans nouvelle fenêtre:", mailtoLink);

      // Ouvrir dans une nouvelle fenêtre du navigateur
      const popup = window.open(
        mailtoLink,
        'email',
        'width=800,height=600,scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes'
      );

      if (popup) {
        // Fermer le modal si la fenêtre s'est ouverte correctement
        onClose();
      } else {
        setError("Impossible d'ouvrir la fenêtre. Vérifiez que les pop-ups sont autorisés dans votre navigateur.");
      }

    } catch (error) {
      console.error("Erreur lors de l'ouverture de la fenêtre email:", error);
      setError("Erreur lors de l'ouverture de la fenêtre email.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center border-b p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Envoyer un message
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              À: {nomEncadreur} ({emailDestinataire})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sujet"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Objet de votre message"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tapez votre message ici..."
                required
              />
            </div>

          </div>

          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}

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
              Ouvrir dans l'email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMessagerie;