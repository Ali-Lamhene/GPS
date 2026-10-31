import { IconButton } from './icon-button';

type HelpButtonProps = {
  onPress: () => void;
  tone?: 'tonal' | 'glass' | 'night';
  shape?: 'circle' | 'square';
  size?: number;
  iconSize?: number;
};

/** Opens the help card (D10). Present on every traveller screen. */
export function HelpButton({ onPress, tone = 'tonal', ...rest }: HelpButtonProps) {
  return <IconButton icon="help" label="Aide" onPress={onPress} tone={tone} {...rest} />;
}
