import { expect } from 'chai';
import 'mocha';
import { Chaos } from '@chaos-framework/core';

import * as Chess from'../../src/Chess.js';

describe('Chessboard position export', function() {
  beforeEach(() => {
    Chaos.reset();
    Chess.initialize();
    Chaos.processor.process();
  });

  it('Exports positions correctly', () => {
    const output = Chess.board.exportToJSON();
    expect(output['A2']).to.equal('P');
    expect(output['B2']).to.equal('P');
    expect(output['A1']).to.equal('R');
    expect(output['D8']).to.equal('q');
  });
});

describe('Standard Game State Tracking', function() {
  beforeEach(() => {
    Chaos.reset();
    Chess.initialize();
    Chaos.processor.process();
  });

  it('Tracks en passant status', function() {
    Chess.board.move('a2', 'a4')?.execute();
    Chaos.processor.process();
    expect(Chess.state.enPassant).to.equal('a3');
    Chess.board.move('a7', 'a6')?.execute();
    Chaos.processor.process();
    expect(Chess.state.enPassant).to.be.null;
  });

  it.skip('Tracks castling status', function() {

  });

  it('Tracks half moves since last meaningful play (individual player moves since last pawn advance or capture)', () => {
    const { board, state } = Chess;
    // Move the two knights back and forth
    for (let i = 0; i < 10; i += 1) {
      board.move('b1', 'a3')?.execute();
      Chaos.processor.process();
      board.move('b8', 'a6')?.execute();
      Chaos.processor.process();
      board.move('a3', 'b1')?.execute();
      Chaos.processor.process();
      board.move('a6', 'b8')?.execute();
      Chaos.processor.process();
    }
    expect(state.halfMove).to.equal(40);
    // Move a pawn to reset to zero
    board.move('h2', 'h4')?.execute();
    Chaos.processor.process();
    expect(state.halfMove).to.equal(0);
    // Move some more and capture a piece, which should also reset to zero
    board.move('g7', 'g6')?.execute();
    Chaos.processor.process();
    board.move('h4', 'h5')?.execute();
    Chaos.processor.process();
    board.move('g6', 'g5')?.execute();
    Chaos.processor.process();
    board.move('h5', 'h6')?.execute();
    Chaos.processor.process();
    board.move('g8', 'h6')?.execute();  // capture white pawn with black knight
    Chaos.processor.process();
    expect(state.halfMove).to.equal(0);
  });

  it('Tracks moves (in chess terminology, a move is when both players have taken their turn)', () => {
    const state = Chess.state;
    expect(state.fullMove).to.equal(1); // Moves start at one, for some reason
    Chess.board.move('a2', 'a3')?.execute();
    Chaos.processor.process();
    expect(state.fullMove).to.equal(1); // One player making a move is only a half move, so should still be one
    Chess.board.move('a7', 'a6')?.execute();
    Chaos.processor.process();
    expect(state.fullMove).to.equal(2);
    Chess.board.move('a3', 'a4')?.execute();
    Chaos.processor.process();
    Chess.board.move('a6', 'a5')?.execute();
    Chaos.processor.process();
    expect(state.fullMove).to.equal(3);
    Chess.board.move('b2', 'b3')?.execute();
    Chaos.processor.process();
    Chess.board.move('b7', 'b6')?.execute();
    Chaos.processor.process();
    expect(state.fullMove).to.equal(4);
  });

  it('Tracks which team has the current turn', () => {
    const state = Chess.state;
    expect(state.turn).to.equal('white');
    Chess.board.move('a2', 'a4')?.execute();
    Chaos.processor.process();
    expect(state.turn).to.equal('black');
    Chess.board.move('a7', 'a6')?.execute();
    Chaos.processor.process();
    expect(state.turn).to.equal('white');
  });
  
  it('Tracks check status from previous turn', function() {
    Chess.board.move('c1', 'd7')?.execute(true); // force an illegal move to have a bishop put the black king in check
    Chaos.processor.process();
    expect(Chess.state.check).to.equal(true);
    Chess.board.move('d8', 'd7')?.execute(); // capture the white bishop as the black queen
    Chaos.processor.process();
    expect(Chess.state.check).to.equal(false);
  });

  it.skip('Tracks checkmate', function() {

  });
});
