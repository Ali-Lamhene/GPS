import { isLocalPicture } from '@/domain/place';
import { GLYPHS, type IconName } from '@/ui/icon/glyphs';
import { colors, fontFamilies } from '@/ui/theme';

import { PIN_BOX, PIN_PATH, pinFace, pinWidth } from './pin-shape';

// DOM elements drawn over the MapLibre map in the browser. Built with createElement and
// textContent only: place data may one day come from a share link, an untrusted input.

/** Room kept free on the right of the unfolded credit: the column of round buttons. */
const CREDIT_RIGHT_CLEARANCE = 112;

const CSS = `
.trip-map .maplibregl-ctrl-bottom-left,
.trip-map .maplibregl-ctrl-bottom-right { bottom: var(--controls-bottom, 0px); }
/* The credit button: a round warm-white ⓘ with an emerald « i », like the phone's (spec 009). */
.trip-map .maplibregl-ctrl-attrib.maplibregl-compact { background: ${colors.warmWhite}; box-shadow: 0 2px 6px rgba(17,24,39,.18); }
/* Unfolded, the credit wraps before the column of buttons on the right (spec 024). */
.trip-map .maplibregl-ctrl-attrib.maplibregl-compact-show { max-width: calc(100vw - ${CREDIT_RIGHT_CLEARANCE}px); }
.trip-map .maplibregl-ctrl-attrib-button::after { content: ''; position: absolute; inset: -12px; }
.trip-map .maplibregl-ctrl-attrib-button { position: relative; background-color: transparent; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='7' r='1.7' fill='%23037C6D'/%3E%3Crect x='10.6' y='10' width='2.8' height='8' rx='1.4' fill='%23037C6D'/%3E%3C/svg%3E"); }
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

const SVG_NS = 'http://www.w3.org/2000/svg';

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

/** Destination: the chosen place's solid emerald teardrop (spec 010). */
export function createDestinationPin(icon: IconName): HTMLElement {
  const root = createPlacePin(icon, undefined, true, '');
  root.removeAttribute('role');
  root.removeAttribute('aria-label');
  root.style.pointerEvents = 'none';
  root.style.cursor = '';
  return root;
}

/** Start of the trip when it is a saved place: a white teardrop edged in emerald. */
export function createOriginPin(icon: IconName): HTMLElement {
  const root = createPlacePin(icon, undefined, false, '');
  root.removeAttribute('role');
  root.removeAttribute('aria-label');
  root.style.pointerEvents = 'none';
  root.style.cursor = '';
  return root;
}

/**
 * Stop where to get on or off (spec 010): a teardrop like the place pins, white edged in
 * the line colour with the vehicle pictogram, or solid in the line colour with the metro
 * "M". Where to get off, it is edged in the alert orange.
 */
export function createStopPin(
  symbol: IconName | 'metro',
  color: string,
  alight = false,
): HTMLElement {
  const width = 36;
  const face = pinFace(width, false);
  const metro = symbol === 'metro';
  // No inline position: MapLibre's marker class keeps the root absolute, on its spot.
  const root = box({ width: `${width}px`, height: `${face.height}px`, pointerEvents: 'none' });
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(face.height));
  svg.setAttribute('viewBox', `0 0 ${PIN_BOX.width} ${PIN_BOX.height}`);
  Object.assign(svg.style, { position: 'absolute', inset: '0', overflow: 'visible' });
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', PIN_PATH);
  path.setAttribute('fill', metro ? color : '#FFFFFF');
  path.setAttribute('stroke', alight ? colors.alert : color);
  path.setAttribute('stroke-width', alight ? '4' : '2.5');
  svg.append(path);
  const head = box({
    position: 'absolute',
    left: `${face.left}px`,
    top: `${face.top}px`,
    width: `${face.size}px`,
    height: `${face.size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  if (metro) {
    const letter = box({ color: '#FFFFFF', fontFamily: fontFamilies.bold, fontSize: '18px' });
    // The official metro sign, a D9 exception like the line ids.
    letter.textContent = 'M';
    head.append(letter);
  } else {
    head.append(glyph(symbol, Math.round(face.size * 0.7), colors.ink, true));
  }
  root.append(svg, head);
  return root;
}

/** Emerald arrow on a white disc at the next corner, unlike the traveller's dot (spec 010). */
export function createManeuverArrow(): HTMLElement {
  const root = box({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#FFFFFF',
    border: `4px solid ${colors.emerald}`,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
    pointerEvents: 'none',
  });
  root.append(glyph('arrow_upward', 32, colors.emerald));
  return root;
}

/** The OpenStreetMap credit starts folded behind its ⓘ button (spec 002, D9). */
export function foldAttribution(container: HTMLElement) {
  const attribution = container.querySelector('.maplibregl-ctrl-attrib');
  attribution?.classList.remove('maplibregl-compact-show');
  attribution?.removeAttribute('open');
}
