import 'mocha';
import { expect } from 'chai';

import { Chaos, Entity, Team, Vector } from '@chaos-framework/core';

import CanOnlyMoveOnTurn from '../../../src/Components/PlayOrder/CanOnlyMoveOnTurn';
import Teams from '../../../src/Enums/Teams';

describe('Can only move on turn', () => {
  let piece: Entity;
  beforeEach(() => {
    Chaos.reset();
    piece = new Entity({ team: new Team({ name: 'WHITE' }) });
  });

  it("Stops a piece from moving when it's not the piece's team's turn", () => {
    const movement = piece.move({ to: new Vector(0, 0), metadata: { playerMovement: true } });
    new CanOnlyMoveOnTurn().permit(movement);
    Chaos.currentTurn = undefined;
    movement.decidePermission();
    expect(movement.permitted).to.be.false;
  });

  it("Does not stop a piece from moving on it's turn", () => {
    const movement = piece.move({ to: new Vector(0, 0), metadata: { playerMovement: true } });
    Chaos.currentTurn = piece.team;
    new CanOnlyMoveOnTurn().permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
  });
});