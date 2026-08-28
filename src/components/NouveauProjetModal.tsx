/** Création d'un projet : les champs strictement nécessaires pour ouvrir un dossier. */
import { useState } from 'react';
import { Modal } from './Modal';
import { projetVide } from '../domain/schema';
import { todayISO } from '../domain/format';
import { useStore } from '../store/AppStore';
import { naviguer } from '../store/router';

/** Propose le numéro suivant à partir du plus élevé déjà saisi. */
function numeroSuggere(numeros: string[]): string {
  const dernier = numeros.filter(Boolean).sort().pop() ?? '';
  return /^\d+$/.test(dernier) ? String(Number(dernier) + 1) : '626001';
}

export function NouveauProjetModal({ onClose }: { onClose: () => void }) {
  const { data, ajouterProjet } = useStore();
  const [f, setF] = useState({
    numero: numeroSuggere(data.projets.map((p) => p.numero)),
    nom: '',
    client: '',
    charge: '',
    montant: '',
    nbOuv: '',
    dateOuverture: todayISO(),
  });

  function creer() {
    const p = projetVide({
      numero: f.numero.trim(),
      nom: f.nom.trim(),
      client: f.client.trim(),
      charge: f.charge.trim(),
      montant: f.montant === '' ? null : Number(f.montant),
      nbOuv: f.nbOuv === '' ? null : Number(f.nbOuv),
      dateOuverture: f.dateOuverture,
    });
    ajouterProjet(p);
    onClose();
    naviguer(`#/projet/${p.id}/fiche`);
  }

  return (
    <Modal
      titre="Nouveau projet"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={creer}>
            Créer le projet
          </button>
        </>
      }
    >
      <div className="row2">
        <label className="fl">
          <span>Numéro</span>
          <input className="inp" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} />
        </label>
        <label className="fl">
          <span>Nombre d’ouvertures</span>
          <input
            className="inp"
            type="number"
            min={0}
            value={f.nbOuv}
            onChange={(e) => setF({ ...f, nbOuv: e.target.value })}
          />
        </label>
      </div>
      <label className="fl">
        <span>Nom du projet</span>
        <input
          className="inp"
          autoFocus
          placeholder="Ex. École Saint-Francis"
          value={f.nom}
          onChange={(e) => setF({ ...f, nom: e.target.value })}
        />
      </label>
      <div className="row2">
        <label className="fl">
          <span>Client</span>
          <input
            className="inp"
            placeholder="Entrepreneur général"
            value={f.client}
            onChange={(e) => setF({ ...f, client: e.target.value })}
          />
        </label>
        <label className="fl">
          <span>Chargé de projet</span>
          <input className="inp" value={f.charge} onChange={(e) => setF({ ...f, charge: e.target.value })} />
        </label>
      </div>
      <div className="row2">
        <label className="fl">
          <span>Valeur du contrat ($)</span>
          <input
            className="inp"
            type="number"
            step="0.01"
            value={f.montant}
            onChange={(e) => setF({ ...f, montant: e.target.value })}
          />
        </label>
        <label className="fl">
          <span>Date d’ouverture</span>
          <input
            className="inp"
            type="date"
            value={f.dateOuverture}
            onChange={(e) => setF({ ...f, dateOuverture: e.target.value })}
          />
        </label>
      </div>
    </Modal>
  );
}
