export function generateBookingCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PMX-${ts}-${rnd}`;
}
