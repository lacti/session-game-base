export default function putRandomCard(deck: number[]): number[] {
  function next() {
    return Math.ceil(Math.random() * 10);
  }
  while (true) {
    const candidate = next();
    if (deck.includes(candidate)) {
      continue;
    }
    deck.push(candidate);
    break;
  }
  return deck;
}
