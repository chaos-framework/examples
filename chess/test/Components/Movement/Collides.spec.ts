import { expect } from 'chai';
import 'mocha';

import { Entity, Vector } from '@chaos-framework/core';

import Chessboard from '../../../src/Worlds/Chessboard';
import Collides from '../../../src/Components/Movement/Collides';

describe('Colliding with other pieces', () => {
  let board: Chessboard
  let piece: Entity;
  let movementComponent: Collides;
  beforeEach(() => {
    board = new Chessboard();
    piece = new Entity({ metadata: { team: 'WHITE' }});
    movementComponent = new Collides();
    piece._attach(movementComponent);
    piece._publish(board, (Chessboard.fromAlgebraic('b3') as Vector));
    new Entity({ metadata: { team: 'WHITE' }})._publish(board, (Chessboard.fromAlgebraic('c3') as Vector));
    new Entity({ metadata: { team: 'BLACK' }})._publish(board, (Chessboard.fromAlgebraic('d3') as Vector));
    new Entity({ metadata: { team: 'BLACK' }})._publish(board, (Chessboard.fromAlgebraic('e6') as Vector));
    new Entity({ metadata: { team: 'BLACK' }})._publish(board, (Chessboard.fromAlgebraic('a3') as Vector));
    new Entity({ metadata: { team: 'BLACK' }})._publish(board, (Chessboard.fromAlgebraic('b8') as Vector));
  });

  it('Does not deny a piece a move through open space', () => {
    let movement = piece.move({ to: (Chessboard.fromAlgebraic('b7') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('b1') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('a4') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
  });

  it('Does not deny a piece from moving onto another piece at the end of a move through open space', () => {
    let movement = piece.move({ to: (Chessboard.fromAlgebraic('c3') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('a3') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('b8') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.true;
  });

  it('Stops a piece from moving through other pieces to get to destination', () => {
    let movement = piece.move({ to: (Chessboard.fromAlgebraic('d3') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.false;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('e3') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.false;
    movement = piece.move({ to: (Chessboard.fromAlgebraic('f7') as Vector), metadata: { playerMovement: true } });
    movementComponent.permit(movement);
    movement.decidePermission();
    expect(movement.permitted).to.be.false;
  });
});