export function isProduction() {
  return window.location.href.includes('.org');
}

export function isLocalhost() {
  return !isProduction() && !window.location.href.includes('192.');
}
