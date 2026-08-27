import type { AppChipTone } from '../ui/AppChip';
import type { CyclePhase } from '../../utils/cycle';

export const phaseLabels: Record<CyclePhase, string> = {
  folicular: 'Folicular',
  lutea: 'Lutea',
  menstrual: 'Menstrual',
  ovulatoria: 'Ovulatoria',
};

export const phaseTones: Record<CyclePhase, AppChipTone> = {
  folicular: 'peach',
  lutea: 'rose',
  menstrual: 'primary',
  ovulatoria: 'warning',
};
