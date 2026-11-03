import { isLocalPicture } from '@/domain/place';
import { categoryOfIcon } from '@/domain/place-category';
import { GLYPHS, type IconName } from '@/ui/icon/glyphs';
import { colors, fontFamilies } from '@/ui/theme';

import { PIN_BOX, PIN_PATH, pinFace, pinWidth } from './pin-shape';

// DOM elements drawn over the MapLibre map in the browser. Built with createElement and
// textContent only: place data may one day come from a share link, an untrusted input.

const CSS = `
.trip-map .maplibregl-ctrl-bottom-left,
.trip-map .maplibregl-ctrl-bottom-right { bottom: var(--controls-bottom, 0px); }
/* The credit button: a round warm-white ⓘ with an emerald « i », like the phone's (spec 009). */
.trip-map .maplibregl-ctrl-attrib.maplibregl-compact { transform: scale(1.4); transform-origin: bottom left; background: ${colors.warmWhite}; box-shadow: 0 2px 6px rgba(17,24,39,.18); }
.trip-map .maplibregl-ctrl-attrib-button { background-color: transparent; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='7' r='1.7' fill='%23037C6D'/%3E%3Crect x='10.6' y='10' width='2.8' height='8' rx='1.4' fill='%23037C6D'/%3E%3C/svg%3E"); }
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

/** The vivid gradient of a place's family (spec 008), as a CSS background. */
function vividBackground(icon: IconName): string {
  const [from, to] = colors.vivid[categoryOfIcon(icon)];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function deepColor(icon: IconName): string {
  return colors.category[categoryOfIcon(icon)];
}

function glyph(icon: IconName, size: number, color: string, outlined = false): HTMLDivElement {
  const element = box({
    fontFamily: `'${outlined ? fontFamilies.icon : fontFamilies.iconFilled}'`,
    fontSize: `${size}px`,
    lineHeight: '1',
    color,
  });
  element.textContent = String.fromCodePoint(GLYPHS[icon]);
  return element;
}

/** The traveller: an emerald dot ringed in white, in a pale emerald halo (spec 009). */
export function createTravellerDot(): HTMLElement {
  // No inline position: MapLibre's marker class keeps the root absolute, on its spot.
  const root = box({ width: '68px', height: '68px', pointerEvents: 'none' });
  root.append(
    box({
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      background: colors.accuracy,
      border: `1px solid ${colors.accuracyEdge}`,
      boxSizing: 'border-box',
    }),
    box({
      position: 'absolute',
      inset: '20px',
      borderRadius: '50%',
      background: colors.emerald,
      animation: 'trip-map-pulse 2s ease-out infinite',
    }),
    box({
      position: 'absolute',
      inset: '20px',
      borderRadius: '50%',
      background: colors.emerald,
      border: '4px solid #FFFFFF',
      boxSizing: 'border-box',
      boxShadow: '0 2px 6px rgba(0,0,0,.3)',
    }),
  );
  return root;
}

/** Cone laid on the ground in front of the traveller, pointing the way they go. */
export function createTravellerCone(): HTMLElement {
  const root = box({ width: '96px', height: '96px', pointerEvents: 'none' });
  root.style.background = `conic-gradient(from -28deg at 50% 50%, ${colors.emerald}8C 0deg, ${colors.emerald}00 56deg, transparent 56deg)`;
  root.style.clipPath = 'circle(50%)';
  return root;
}

/** Destination pin: the place pictogram on its family colour, with a pointer (spec 008). */
export function createDestinationPin(icon: IconName): HTMLElement {
  const root = box({ display: 'flex', flexDirection: 'column', alignItems: 'center' });
  const head = box({
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: vividBackground(icon),
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
    borderTop: `10px solid ${deepColor(icon)}`,
    marginTop: '-2px',
  });
  root.append(head, pointer);
  root.style.pointerEvents = 'none';
  return root;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * A saved place the traveller can touch (spec 009): a white teardrop edged in emerald with
 * the emerald outlined pictogram, or the place's photo in its round head with the
 * pictogram in a small white disc. The chosen place is larger and solid emerald.
 */
export function createPlacePin(
  icon: IconName,
  photo: string | undefined,
  selected: boolean,
  label: string,
): HTMLElement {
  const width = pinWidth(selected);
  const face = pinFace(width, selected);
  const hasPhoto = photo !== undefined && isLocalPicture(photo);
  // No inline position: MapLibre's marker class keeps the root absolute, on its spot.
  const root = box({
    width: `${width}px`,
    height: `${face.height}px`,
    cursor: 'pointer',
    zIndex: selected ? '2' : '1',
  });
  root.setAttribute('role', 'button');
  root.setAttribute('aria-label', label);
  root.append(
    box({
      position: 'absolute',
      left: `${width / 2 - 9}px`,
      bottom: '-3px',
      width: '18px',
      height: '6px',
      borderRadius: '9px',
      background: 'rgba(17,24,39,.14)',
    }),
  );
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(face.height));
  svg.setAttribute('viewBox', `0 0 ${PIN_BOX.width} ${PIN_BOX.height}`);
  Object.assign(svg.style, { position: 'absolute', inset: '0', overflow: 'visible' });
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', PIN_PATH);
  path.setAttribute('fill', selected ? colors.emerald : '#FFFFFF');
  path.setAttribute('stroke', colors.emerald);
  path.setAttribute('stroke-width', selected ? '0' : '2.2');
  svg.append(path);
  root.append(svg);
  const head = box({
    position: 'absolute',
    left: `${face.left}px`,
    top: `${face.top}px`,
    width: `${face.size}px`,
    height: `${face.size}px`,
    borderRadius: '50%',
    background: '#FFFFFF',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  if (photo && hasPhoto) {
    const image = document.createElement('img');
    image.src = photo;
    image.alt = '';
    Object.assign(image.style, { width: '100%', height: '100%', objectFit: 'cover' });
    head.append(image);
    const badge = box({
      position: 'absolute',
      left: `${face.left - 4}px`,
      top: `${face.top + face.size - 16}px`,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#FFFFFF',
      boxShadow: '0 1px 4px rgba(0,0,0,.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    badge.append(glyph(icon, 13, colors.emerald, true));
    root.append(head, badge);
  } else {
    head.append(glyph(icon, Math.round(face.size * 0.62), colors.emerald, true));
    root.append(head);
  }
  return root;
}

/** Start of the trip when it is a saved place: its pictogram on its family colour. */
export function createOriginPin(icon: IconName): HTMLElement {
  const root = box({
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: vividBackground(icon),
    border: '3px solid #FFFFFF',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,.3)',
    pointerEvents: 'none',
  });
  root.append(glyph(icon, 26, '#FFFFFF'));
  return root;
}

/** Stop where to get on or off: the vehicle pictogram, or the metro "M", in the line colour. */
export function createStopPin(
  symbol: IconName | 'metro',
  color: string,
  alight = false,
): HTMLElement {
  const metro = symbol === 'metro';
  const root = box({
    width: '40px',
    height: '40px',
    borderRadius: metro ? '50%' : '8px',
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
  if (alight) root.style.boxShadow = `0 0 0 4px ${colors.alert}, 0 2px 6px rgba(0,0,0,.3)`;
  return root;
}

/** Big white arrow laid on the next corner, pointing the street to take. */
export function createManeuverArrow(): HTMLElement {
  const root = box({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: colors.ink,
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
