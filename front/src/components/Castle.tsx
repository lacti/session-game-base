import * as React from 'react';

import CastleSvg from '../assets/castle.svg';

export default function Castle({hp}:{hp: number}) {
  return <>
    <img src={CastleSvg} alt="Castle" draggable={false} />
    <span className="HP">{hp}</span>
  </>
}