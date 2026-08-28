# DHPM — Division 08

Application de gestion de projet pour les dossiers de **Division 08** (portes, cadres
et quincaillerie) : suivi des 13 jalons du processus standard, échéances, tâches,
journal de projet et extras de chantier.

Reprise et structuration de l'artifact « Projets d'Antoine » sous forme
d'application React autonome, hébergeable comme site statique.

## Ce que fait l'application

- **Tableau de bord** — valeur du portefeuille, avancement moyen, jalons en retard,
  échéances des 14 prochains jours, dernières entrées de journal, charge par étape.
- **Projets** — liste filtrable (recherche, statut, santé, étape) et triable, avec
  totaux de valeur et d'ouvertures.
- **Fiche projet** — frise du processus, puis six onglets : Jalons, Gantt, Tâches,
  Journal, Extras & crédits, Fiche.
- **Jalons** — vue transversale : où se concentrent la charge et les retards.
- **Réglages** — export JSON / CSV, restauration d'une sauvegarde, thème, référentiel
  du processus, remise à zéro.

### Le processus standard

Quatre étapes, treize jalons pondérés. L'avancement d'un projet est la moyenne des
jalons pondérée par leur poids, les jalons marqués `N/A` étant retirés du calcul ;
il peut aussi être forcé à la main.

| Étape | Jalons | Poids total |
| --- | --- | --- |
| Prise en charge | Ouverture de dossier, Dessins d'atelier, Optimisation, Diagramme de branchement | 30 |
| Approvisionnement | Mise en marche (achats), Réception de la marchandise | 28 |
| Réalisation | Façonnage des serrures, Prémontage quincaillerie, Installation, Livraison | 32 |
| Fermeture | Facturation, Émission des garanties, Fermeture du dossier | 10 |

Le référentiel vit dans [`src/domain/process.ts`](src/domain/process.ts) : c'est le
seul endroit à modifier pour ajuster un libellé, un poids ou une équipe responsable.

## Où sont les données

Tout est enregistré dans le **stockage local du navigateur**, une demi-seconde après
la dernière frappe, et l'écriture est forcée lorsque l'onglet se ferme. Rien n'est
envoyé sur un serveur : il n'y a ni compte, ni base de données partagée.

Conséquences pratiques :

- un autre poste, un autre navigateur ou une fenêtre privée ne voient pas ces projets ;
- vider les données de site du navigateur efface tout ;
- **exportez régulièrement en JSON** (Réglages ▸ Exporter) — c'est la sauvegarde, et
  c'est aussi la façon de transporter les dossiers d'un poste à l'autre.

## Développement

```bash
npm install
npm run dev        # serveur de développement
npm test           # tests unitaires (calculs métier)
npm run typecheck  # vérification TypeScript
npm run build      # bundle de production dans dist/
npm run preview    # sert le bundle construit
```

## Déploiement

Le résultat du build est un site statique : `dist/` se dépose tel quel sur
n'importe quel hébergeur.

Pour **GitHub Pages**, le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
construit et publie automatiquement à chaque poussée sur la branche par défaut. Il
faut activer Pages une seule fois : *Settings ▸ Pages ▸ Source: GitHub Actions*.
Le site étant servi sous `/DHPM/`, le workflow passe `DHPM_BASE=/DHPM/` à Vite ;
pour un domaine dédié, laissez la variable vide.

## Structure

```
src/
  domain/     types, référentiel du processus, calculs, mise en page du Gantt
  store/      stockage local, import/export, état global, routeur, thème
  components/ éléments d'interface réutilisables
  pages/      tableau de bord, projets, jalons, réglages, fiche projet
```

Les calculs métier (`domain/`) ne dépendent ni de React ni du navigateur : ce sont
eux que couvrent les tests unitaires.
