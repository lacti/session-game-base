import * as React from "react";

import Card from '../components/Card';
import Castle from '../components/Castle';
import GameContext from "../state/game/models/GameContext";
import enqueueAction from '../state/action/enqueueAction';

export default function GameView({ context }: { context: GameContext }) {
  const world = context.world!;
  if (!world || !world.enemy) {
    return <div>RIP</div>
  }
  return (
    <div className="App">
      <div className="Enemy" style={{backgroundColor: world.enemy.color}}>
        <div className="EnemyCastle">
          <Castle hp={world.enemy.hp}/>
        </div>
        <div className="EnemyDeck">
        {world.enemy.cards.map(cardIndex => (<Card key={`EnemyCard_${cardIndex}`} cardIndex={cardIndex} />))}
        </div>
      </div>
      <div className="My" style={{backgroundColor: world.me.color}}>
        <div className="MyDeck">
        {world.me.cards.map(cardIndex => (<Card key={`MyCard_${cardIndex}`} cardIndex={cardIndex} onClick={() => enqueueAction({
          type: 'pickCard',
          payload: {
            cardIndex,
          }
        })} />))}
        </div>
        <div className="MyCastle">
          <Castle hp={world.me.hp}/>
        </div>
      </div>
    </div>
  );
}
