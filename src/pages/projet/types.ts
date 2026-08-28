import type { Projet } from '../../domain/types';

export interface TabProps {
  projet: Projet;
  maj: (updater: (p: Projet) => Projet) => void;
}
