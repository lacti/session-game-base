import * as React from "react";

import { CardSvgs } from '../assets/cards';

export default function Card({ cardIndex, onClick }: { cardIndex: number; onClick?: () => void; }) {
  return (
    <img src={CardSvgs[cardIndex]} alt={""} draggable={false} onClick={onClick} />
  );
}
