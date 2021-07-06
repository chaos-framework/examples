import { World, Vector } from '@chaos/core';

import Tiles from '../Enums/Tile';

const algebraicFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default class Chessboard extends World {
  constructor() {
    super({ width: 13, height: 8, fill: Tiles.EMPTY });
    
    // Fill in white tiles
    this.baseLayer.drawSquare(Tiles.WHITE, new Vector(0, 0), 8);
    // Set every other tile inside the board to black
    for(let x = 0; x < 8; x++) {
      for(let y = 0; y < 8; y++) {
        if((x + y) % 2 === 1) {
          this.baseLayer.setTile(x, y, Tiles.BLACK);
        }
      }
    }

    // Draw spaces for captured black pieces (onto white tiles) and vice versa
    this.baseLayer.drawSquare(Tiles.WHITE, Chessboard.whiteCaptureStart, 2, 8);
    this.baseLayer.drawSquare(Tiles.BLACK, Chessboard.blackCaptureStart, 2, 8);
  }

  static whiteCaptureStart = new Vector(9, 0);
  static blackCaptureStart = new Vector(11, 0);

  // Convert vector to algebraic, ie { 0 ,0 } to 'a8'
  static toAlgebraic(vector: Vector): string | undefined {
    if(!Chessboard.isInBounds(vector)) {
      return undefined;
    }
    const row = vector.y * -1 + 8;
    const column = algebraicFiles[vector.x];
    if(column === undefined) {
      return undefined;
    }
    return column + row.toString();
  }

  // Convert algebraic into a vector, ie 'a8' to { 0, 0 }
  static fromAlgebraic(algebraic: string): Vector | undefined {
    if(algebraic.length !== 2) {
      return undefined;
    }
    const letter = algebraic[0];
    const column = algebraicFiles.findIndex(val => val === letter);
    if(column === -1) {
      return undefined;
    }
    const row = (parseInt(algebraic[1], 10) -1) * -1 + 7;
    if(!(typeof row === 'number')) {
      return undefined;
    }
    const vector = new Vector(column, row);
    if(Chessboard.isInBounds(vector)) {
      return vector;
    } else {
      return undefined;
    }
  }

  static getCaptureSlot(team: 'white' | 'black', previouslyCaptured: number): Vector {
    const startingVector = team === 'white' ? Chessboard.whiteCaptureStart : Chessboard.blackCaptureStart;
    return startingVector.add(new Vector(
      Math.floor(previouslyCaptured / 8),
      previouslyCaptured % 8
    ));
  }
  
  static isInBounds(position: Vector) {
    return position.x < 8 && position.y < 8;
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): Chessboard {
    return new Chessboard();
  }
}