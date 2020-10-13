export default function processTimer(
  interval: number,
  oldTimer: number,
  dt: number
): { multiple: number; remain: number } {
  const newTimer = oldTimer + dt;
  const multiple = Math.floor(newTimer / interval);
  const remain = newTimer % interval;
  return { multiple, remain };
}
