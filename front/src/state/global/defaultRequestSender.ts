export default function defaultRequestSender<T>(request: T) {
  console.warn(`There is no connection!`, request);
}
