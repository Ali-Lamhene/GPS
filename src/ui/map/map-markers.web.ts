import { GLYPHS, type IconName } from '@/ui/icon/glyphs';
import { colors, fontFamilies } from '@/ui/theme';

// DOM elements drawn over the MapLibre map in the browser. Built with createElement and
// textContent only: place data may one day come from a share link, an untrusted input.

const CSS = `
.trip-map .maplibregl-ctrl-bottom-left,
.trip-map .maplibregl-ctrl-bottom-right { bottom: var(--controls-bottom, 0px); }
@keyframes trip-map-pulse { 0% { transform: scale(1); opacity: .45 } 100% { transform: scale(2.4); opacity: 0 } }
`;

let cssInjected = false;

/** Adds the map's own CSS rules to the page once. */
export function injectMapCss() {
  if (cssInjected) return;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

function box(css: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const element = document.createElement('div');
  Object.assign(element.style, css);
  return element;
}

function glyph(icon: IconName, size: number, color: string): HTMLDivElement {
  const element = box({
    fontFamily: `'${fontFamilies.iconFilled}'`,
    fontSize: `${size}px`,
    lineHeight: '1',
    color,
  });
  element.textContent = String.fromCodePoint(GLYPHS[icon]);
  return element;
}

/** The traveller: a large blue dot with a dark outline and a soft pulse, facing the screen. */
export function createTravellerDot(): HTMLElement {
  const root = box({ position: 'relative', width: '36px', height: '36px', pointerEvents: 'none' });
  root.append(
    box({
      position: 'absolute',
      inset: '4px',
      borderRadius: '50%',
      background: colors.primary,
      animation: 'trip-map-pulse 2s ease-out infinite',
    }),
    box({
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      background: colors.primary,
      border: '5px solid #FFFFFF',
      boxSizing: 'border-box',
      boxShadow: `0 0 0 2px ${colors.onSecondaryContainer}, 0 2px 6px rgba(0,0,0,.35)`,
    }),
  );
  return root;
}

/** Cone laid on the ground in front of the traveller, pointing the way they go. */
export function createTravellerCone(): HTMLElement {
  const root = box({ width: '96px', height: '96px', pointerEvents: 'none' });
  root.style.background = `conic-gradient(from -28deg at 50% 50%, ${colors.primary}99 0deg, ${colors.primary}00 56deg, transparent 56deg)`;
  root.style.clipPath = 'circle(50%)';
  return root;
}

/** Destination pin: the place pictogram in a dark rounded square with a pointer. */
export function createDestinationPin(icon: IconName): HTMLElement {
  const root = box({ display: 'flex', flexDirection: 'column', alignItems: 'center' });
  const head = box({
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: colors.ink,
    border: '3px solid #FFFFFF',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.3)',
  });
  head.append(glyph(icon, 28, '#FFFFFF'));
  const pointer = box({
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `10px solid ${colors.ink}`,
    marginTop: '-2px',
  });
  root.append(head, pointer);
  root.style.pointerEvents = 'none';
  return root;
}

/** Stop where to get on or off: the vehicle pictogram, or the metro "M", in the line colour. */
export function createStopPin(symbol: IconName | 'metro', color: string): HTMLElement {
  const metro = symbol === 'metro';
  const root = box({
    width: '40px',
    height: '40px',
    borderRadius: metro ? '50%' : '12px',
    background: color,
    border: '3px solid #FFFFFF',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,.3)',
    pointerEvents: 'none',
  });
  if (metro) {
    const letter = box({ color: '#FFFFFF', fontFamily: fontFamilies.bold, fontSize: '22px' });
    // The official metro sign, a D9 exception like the line ids.
    letter.textContent = 'M';
    root.append(letter);
  } else {
    root.append(glyph(symbol, 24, colors.ink));
    root.style.background = '#FFFFFF';
    root.style.border = `4px solid ${color}`;
  }
  return root;
}

/** Big white arrow laid on the next corner, pointing the street to take. */
export function createManeuverArrow(): HTMLElement {
  const root = box({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: colors.onSecondaryContainer,
    border: '4px solid #FFFFFF',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
    pointerEvents: 'none',
  });
  root.append(glyph('arrow_upward', 32, '#FFFFFF'));
  return root;
}

/** The OpenStreetMap credit starts folded behind its ⓘ button (spec 002, D9). */
export function foldAttribution(container: HTMLElement) {
  const attribution = container.querySelector('.maplibregl-ctrl-attrib');
  attribution?.classList.remove('maplibregl-compact-show');
  attribution?.removeAttribute('open');
}
