/** Import / export : sauvegarde JSON complète et extractions CSV. */
import { JALONS, etapeNom, labelStatutJalon } from '../domain/process';
import { avancement, etapeCourante, extrasRetenus, retards, valeurTotale } from '../domain/compute';
import { jalonPct } from '../domain/compute';
import { todayISO } from '../domain/format';
import { normalize } from '../domain/schema';
import type { AppData } from '../domain/types';

export function telecharger(nomFichier: string, contenu: string, mime: string): void {
  const blob = new Blob([contenu], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Excel francophone attend le point-virgule ; le BOM force l'UTF-8. */
function csvDocument(lignes: unknown[][]): string {
  return '﻿' + lignes.map((l) => l.map(csvCell).join(';')).join('\r\n');
}

export function exporterJSON(data: AppData): void {
  telecharger(
    `dhpm-sauvegarde-${todayISO()}.json`,
    JSON.stringify(data, null, 2),
    'application/json',
  );
}

export function exporterProjetsCSV(data: AppData): void {
  const lignes: unknown[][] = [[
    'Numéro', 'Projet', 'Client', 'Chargé de projet', 'Statut', 'Santé', 'Étape courante',
    'Avancement %', 'Contrat', 'Extras retenus', 'Valeur totale', 'Ouvertures',
    'Ouverture', 'Fermeture', 'Jalons en retard',
  ]];
  for (const p of data.projets) {
    lignes.push([
      p.numero, p.nom, p.client, p.charge, p.statut, p.sante, etapeNom(etapeCourante(p)),
      Math.round(avancement(p) * 100), p.montant, extrasRetenus(p), valeurTotale(p),
      p.nbOuv, p.dateOuverture, p.dateFermeture, retards(p).length,
    ]);
  }
  telecharger(`dhpm-projets-${todayISO()}.csv`, csvDocument(lignes), 'text/csv');
}

export function exporterJalonsCSV(data: AppData): void {
  const lignes: unknown[][] = [[
    'Numéro', 'Projet', 'No jalon', 'Jalon', 'Étape', 'Équipe', 'Statut',
    'Avancement %', 'Début', 'Échéance', 'Notes',
  ]];
  for (const p of data.projets) {
    for (const j of JALONS) {
      const js = p.jalons[j.k];
      lignes.push([
        p.numero, p.nom, j.n, j.nom, etapeNom(j.e), j.eq, labelStatutJalon(js.s),
        Math.round(jalonPct(js) * 100), js.d1, js.d2, js.notes,
      ]);
    }
  }
  telecharger(`dhpm-jalons-${todayISO()}.csv`, csvDocument(lignes), 'text/csv');
}

export class ImportInvalideError extends Error {}

/** Analyse le contenu d'un fichier de sauvegarde ; lève si le texte n'est pas exploitable. */
export function lireSauvegarde(texte: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(texte);
  } catch {
    throw new ImportInvalideError('Ce texte n’est pas un fichier de sauvegarde valide.');
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as AppData).projets)) {
    throw new ImportInvalideError('Ce fichier ne contient aucune liste de projets.');
  }
  return normalize(parsed);
}
