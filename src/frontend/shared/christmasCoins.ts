/**
 * Christmas Reindeer Coin Animation Engine (Navidad David)
 *
 * Spawns festive Santa's reindeer coins that arc gracefully from a clicked button
 * directly into the shopping cart button in the header, simulating money/gifts deposited into the cart.
 */

// SVG markup for Santa's reindeer coin
const REINDEER_COIN_SVG = `
<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="goldCoinGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="25%" stop-color="#fef08a" />
      <stop offset="65%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#92400e" />
    </radialGradient>
    <filter id="reindeerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="0.6" flood-color="#451a03" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Base de la moneda dorada con borde estriado tipo medalla navideña -->
  <circle cx="20" cy="20" r="18.5" fill="url(#goldCoinGrad)" stroke="#fef08a" stroke-width="1.8"/>
  <circle cx="20" cy="20" r="15.5" stroke="#ca8a04" stroke-width="0.9" stroke-dasharray="2 1.5"/>

  <!-- Silueta del Reno de Santa Claus -->
  <g filter="url(#reindeerShadow)">
    <!-- Cuernos ramificados del reno -->
    <path d="M14 12 C12 9, 10 7, 8 8 M10 7 C10 5, 8 3, 6 4 M12 10 C10 9, 9 6, 7 6" stroke="#451a03" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M26 12 C28 9, 30 7, 32 8 M30 7 C30 5, 32 3, 34 4 M28 10 C30 9, 31 6, 33 6" stroke="#451a03" stroke-width="1.4" stroke-linecap="round"/>
    <!-- Orejas de reno -->
    <path d="M12 15 C9 14, 11 12, 14 14 Z" fill="#78350f"/>
    <path d="M28 15 C31 14, 29 12, 26 14 Z" fill="#78350f"/>
    <!-- Cabeza y hocico -->
    <path d="M14 14 C14 13, 26 13, 26 14 C27 18, 24 26, 20 28 C16 26, 13 18, 14 14 Z" fill="#78350f"/>
    <!-- Ojos -->
    <circle cx="17" cy="18" r="1.1" fill="#1c1917"/>
    <circle cx="23" cy="18" r="1.1" fill="#1c1917"/>
    <!-- Nariz roja de Rodolfo el Reno de Santa Claus con brillo festivo -->
    <circle cx="20" cy="24" r="2.6" fill="#ef4444"/>
    <circle cx="19.2" cy="23.2" r="0.8" fill="#ffffff" opacity="0.9"/>
  </g>
  <!-- Destello estelar festivo -->
  <path d="M20 2.5 L20.8 4.2 L22.5 5 L20.8 5.8 L20 7.5 L19.2 5.8 L17.5 5 L19.2 4.2 Z" fill="#ffffff" opacity="0.9"/>
</svg>
`;

function getOrCreateOverlay(): HTMLElement {
  let overlay = document.getElementById('christmas-coin-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'christmas-coin-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '99999';
    overlay.style.overflow = 'hidden';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function spawnCartSparkle(overlay: HTMLElement, x: number, y: number) {
  for (let s = 0; s < 4; s++) {
    const star = document.createElement('div');
    star.textContent = s % 2 === 0 ? '✨' : '✦';
    star.style.position = 'fixed';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.fontSize = `${14 + Math.random() * 8}px`;
    star.style.color = '#fef08a';
    star.style.textShadow = '0 0 8px #eab308, 0 0 14px rgba(234, 179, 8, 0.8)';
    star.style.pointerEvents = 'none';
    star.style.zIndex = '99999';
    overlay.appendChild(star);

    const destX = (Math.random() - 0.5) * 50;
    const destY = (Math.random() - 0.5) * 50;

    const anim = star.animate(
      [
        { transform: 'translate(0, 0) scale(0.3)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(1.2)`, opacity: 0.95, offset: 0.6 },
        { transform: `translate(${destX * 1.3}px, ${destY * 1.3}px) scale(0)`, opacity: 0, offset: 1 },
      ],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    );
    anim.onfinish = () => star.remove();
  }
}

function spawnSingleReindeerCoin(
  overlay: HTMLElement,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  cartButton: HTMLElement | null,
  onLand: () => void
) {
  const coin = document.createElement('div');
  coin.className = 'christmas-reindeer-coin';
  coin.style.position = 'fixed';
  coin.style.left = '0px';
  coin.style.top = '0px';
  coin.style.width = '38px';
  coin.style.height = '38px';
  coin.style.borderRadius = '50%';
  coin.style.boxShadow = '0 0 16px rgba(234, 179, 8, 0.85), 0 4px 10px rgba(0,0,0,0.5)';
  coin.style.pointerEvents = 'none';
  coin.style.willChange = 'transform, opacity';
  coin.innerHTML = REINDEER_COIN_SVG;
  overlay.appendChild(coin);

  // Explosión inicial suave y arco hacia el carrito
  const spreadX = (Math.random() - 0.5) * 60;
  const spreadY = -(Math.random() * 40 + 25);
  const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 40;
  const midY = Math.min(startY, targetY) - 90 - Math.random() * 70;

  const keyframes: Keyframe[] = [
    {
      transform: `translate3d(${startX}px, ${startY}px, 0) scale(0.3) rotate(0deg)`,
      opacity: 0,
      offset: 0,
    },
    {
      transform: `translate3d(${startX + spreadX}px, ${startY + spreadY}px, 0) scale(1.15) rotate(70deg)`,
      opacity: 1,
      offset: 0.18,
    },
    {
      transform: `translate3d(${midX}px, ${midY}px, 0) scale(1) rotate(220deg)`,
      opacity: 1,
      offset: 0.55,
    },
    {
      transform: `translate3d(${targetX - 19}px, ${targetY - 19}px, 0) scale(0.4) rotate(420deg)`,
      opacity: 0.95,
      offset: 0.92,
    },
    {
      transform: `translate3d(${targetX - 19}px, ${targetY - 19}px, 0) scale(0) rotate(540deg)`,
      opacity: 0,
      offset: 1,
    },
  ];

  const animation = coin.animate(keyframes, {
    duration: 800,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'forwards',
  });

  animation.onfinish = () => {
    coin.remove();

    // Pulso festivo en el icono del carrito al recibir la moneda
    if (cartButton) {
      cartButton.animate(
        [
          { transform: 'scale(1)', filter: 'brightness(1)' },
          { transform: 'scale(1.24)', filter: 'brightness(1.4) drop-shadow(0 0 12px rgba(229,184,105,0.9))' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1)', filter: 'brightness(1)' },
        ],
        { duration: 280, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
      );
    }

    // Partículas estelares alrededor del carrito
    spawnCartSparkle(overlay, targetX, targetY);

    onLand();
  };
}

/**
 * Dispara una ráfaga de monedas navideñas con el reno de Santa Claus desde el elemento origen
 * hacia el botón del carrito de compras.
 *
 * @param fromElement Elemento HTML que disparó la acción (botón Comprar o Agregar)
 * @param onComplete Callback opcional invocado al aterrizar la última moneda en el carrito
 * @param options Cantidad de monedas (por defecto 5)
 */
export function shootChristmasCoins(
  fromElement: HTMLElement,
  onComplete?: () => void,
  options?: { count?: number }
) {
  if (typeof window === 'undefined') {
    onComplete?.();
    return;
  }

  const overlay = getOrCreateOverlay();
  const fromRect = fromElement.getBoundingClientRect();
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;

  // Localizar el botón del carrito en el navbar
  const cartButton =
    document.getElementById('header-cart-button') ||
    (document.querySelector('[data-purpose="cart-button"]') as HTMLElement | null);

  let targetX = window.innerWidth - 65;
  let targetY = 32;

  if (cartButton) {
    const cartRect = cartButton.getBoundingClientRect();
    targetX = cartRect.left + cartRect.width / 2;
    targetY = cartRect.top + cartRect.height / 2;
  }

  const count = options?.count ?? 5;
  let finishedCount = 0;

  for (let i = 0; i < count; i++) {
    const delay = i * 70;
    setTimeout(() => {
      spawnSingleReindeerCoin(
        overlay,
        startX,
        startY,
        targetX,
        targetY,
        cartButton,
        () => {
          finishedCount++;
          if (finishedCount === count) {
            onComplete?.();
          }
        }
      );
    }, delay);
  }
}
