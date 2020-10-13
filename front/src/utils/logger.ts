export default function logHook(...args: any[]) {
  return function <T>(value: T) {
    console.info(...args, value);
    return value;
  };
}
