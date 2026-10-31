import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';

type ListenButtonProps = {
  /** Stop or station name read aloud (D9). */
  name: string;
  size?: number;
  iconSize?: number;
  tone?: 'primary' | 'nightAccent';
  shape?: 'circle' | 'square';
};

/** Reads a stop or station name aloud, to match it with what the traveller hears. */
export function ListenButton({ name, size = 48, iconSize = 24, ...rest }: ListenButtonProps) {
  return (
    <IconButton
      icon="volume_up"
      label="Écouter le nom"
      onPress={() => void speak(name)}
      tone="primary"
      iconVariant="filled"
      size={size}
      iconSize={iconSize}
      {...rest}
    />
  );
}
