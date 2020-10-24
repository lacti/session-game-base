import putRandomCard from "./putRandomCard";

export default function newRandomCard(): number[] {
  const cards: number[] = [];
  while (cards.length < 5) {
    putRandomCard(cards);
  }
  return cards;
}
