import 'mocha';
import { expect } from 'chai';
import { Chaos, Entity, MoveAction, Team, Vector } from '@chaos-framework/core';

import OneMovePerTurn from '../../../src/Components/PlayOrder/OneMovePerTurn.js';
import ChessMove from '../../../src/Actions/ChessMove.js';

describe('Each team gets one move per turn', () => {
  const firstTeam = new Team();
  const firstPiece = new Entity();
  firstPiece._joinTeam(firstTeam);
  const secondTeam = new Team();
  const secondPiece = new Entity();
  secondPiece._joinTeam(secondTeam);
  let component: OneMovePerTurn;
  beforeEach(() => {
    Chaos.reset();
    Chaos.setCurrentTurn(firstTeam);
    component = new OneMovePerTurn([firstTeam, secondTeam]);
  });

  it('Changes the current turn after each team player movement in a continious cycle', () => {
    const firstMovement = new ChessMove(firstPiece, new Vector(0,0));
    firstMovement.applied = true;
    component.react(firstMovement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(secondTeam);
    const secondMovement = new ChessMove(secondPiece, new Vector(0,0));
    secondMovement.applied = true;
    component.react(secondMovement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(firstTeam);
    component.react(firstMovement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(secondTeam);
  });

  it('Ignores non-player movement (such as a piece being moved to captured section)', () => {
    const firstMovement = new MoveAction({ to: new Vector(0,0), target: firstPiece });
    firstMovement.applied = true;
    component.react(firstMovement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(firstTeam);
    const secondMovement = new MoveAction({ to: new Vector(0,0), target: secondPiece });
    secondMovement.applied = true;
    component.react(secondMovement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(firstTeam);
  });

  it("Does not change turns when the team played isn't part of the turn order anyway", () => {
    const randomPiece = new Entity();
    randomPiece._joinTeam(new Team());
    const movement = new ChessMove(randomPiece, new Vector(0,0));
    movement.applied = true;
    component.react(movement);
    Chaos.processor.process();
    expect(Chaos.currentTurn).to.equal(firstTeam);
  });

});
