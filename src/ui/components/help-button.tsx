import { IconButton } from './icon-button';

type HelpButtonProps = {
  onPress: () => void;
  tone?: 'help' | 'glass' | 'night';
  shape?: 'circle' | 'square';
  size?: number;
  iconSize?: number;
};

/** Opens the help card (D10). Present on every traveller screen. */
/** Help keeps its size of before (spec 010): the safety net of a stressed traveller. */
const HELP_SIZE = 56;

export function HelpButton({ onPress, tone = 'help', ...rest }: HelpButtonProps) {
  return (
    <IconButton
      icon="help"
      label="Aide"
      onPress={onPress}
      tone={tone}
      size={HELP_SIZE}
      iconSize={30}
      {...rest}
    />
  );
}
