import { expect } from 'chai';
import 'mocha';

import { Entity, Vector } from '@chaos-framework/core';
import Chessboard from '../../../src/Worlds/Chessboard.js';
import CountsMovements from '../../../src/Components/Movement/CountsMovements.js';
import ChessMove from '../../../src/Actions/ChessMove.js';

describe('Counts Movements', () => {
  let board: Chessboard
  let piece: Entity;
  let movementComponent: CountsMovements;
  beforeEach(() => {
    board = new Chessboard();
    piece = new Entity();
    movementComponent = new CountsMovements();
    piece._attach(movementComponent);
    piece._publish(board, (Chessboard.fromAlgebraic('b2') as Vector));
  });

  it('Counts player movements', () => {
    piece.metadata.set('moveCount', 0);
    let movement = new ChessMove(piece, Chessboard.fromAlgebraic('b3')!);
    movement.applied = true;
    movementComponent.react(movement);
    expect(piece.metadata.get('moveCount')).to.equal(1);
    movementComponent.react(movement);
    expect(piece.metadata.get('moveCount')).to.equal(2);
    movementComponent.react(movement);
    expect(piece.metadata.get('moveCount')).to.equal(3);
  });
  
  it("Does not count movements of action if it is not a player's move", () => {
    piece.metadata.set('moveCount', 0);
    let movement = new ChessMove(piece, Chessboard.fromAlgebraic('b3')!);
    movementComponent.react(movement);
    expect(piece.metadata.get('moveCount')).to.equal(0);
  });

  it('Does not set moveCount on an entity that does not have it specified already', () => {
    let movement = new ChessMove(piece, Chessboard.fromAlgebraic('b3')!);
    movementComponent.react(movement);
    expect(piece.metadata.get('moveCount')).to.be.undefined;
  });
});
