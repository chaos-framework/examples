import {
  World,
  Vector,
  Entity,
  ByteLayer,
  ArrayChunk,
  ProcessEffectGenerator,
} from "@chaos-framework/core";

import * as Chess from "../Chess.js";
import Tiles from "../Enums/Tile.js";
import ChessMove from "../Actions/ChessMove.js";
import { ChessPiece } from "../Util/Types.js";

const algebraicFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default class Chessboard extends World {
  constructor() {
    super({
      size: new Vector(1, 1),
      baseLayer: new ByteLayer(0),
      streaming: false,
    });
  }

  initializeChunk(x: number, y: number, data?: { [key: string]: any }): void {
    this.baseLayer.setChunk(x, y, new ArrayChunk<number>(0, data?.["base"]));
    if (x === 0 && y === 0) {
      // Fill in white tiles
      this.baseLayer.drawSquare(Tiles.WHITE, new Vector(0, 0), 8);
      // Set every other tile inside the board to black
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if ((x + y) % 2 === 1) {
            this.baseLayer.set(x, y, Tiles.BLACK);
          }
        }
      }
    }
  }

  async *clear() {
    for (const [id, entity] of this.entities) {
      yield entity.unpublish().direct().asEffect();
    }
  }

  // Returns true if a piece has reached the far end of the board based on its "forward" direction
  isEdgeOfBoardForForwardDirection(
    position: Vector,
    forwardDirection: Vector
  ): boolean {
    if (
      (forwardDirection.y === -1 && position.y === 0) ||
      (forwardDirection.y === 1 && position.y === 7) ||
      (forwardDirection.x === -1 && position.x === 0) ||
      (forwardDirection.x === 1 && position.y === 7)
    ) {
      return true;
    }
    return false;
  }

  move(from: Vector | string, to: Vector | string): ChessMove | undefined {
    let orig = from instanceof Vector ? from : Chessboard.fromAlgebraic(from);
    let dest = to instanceof Vector ? to : Chessboard.fromAlgebraic(to);
    if (orig === undefined || dest === undefined) {
      return undefined;
    }
    const piece = this.getEntitiesAtCoordinates(orig.x, orig.y)[0];
    if (piece === undefined) {
      return undefined;
    }
    return new ChessMove(piece as ChessPiece, dest);
  }

  playSquares(): Generator<Vector> {
    return this.getPlaySquares(new Vector(0, 0), new Vector(8, 8));
  }

  private getPlaySquares = function* (starting: Vector, dimensions: Vector) {
    for (let x = starting.x; x < dimensions.x; x++) {
      for (let y = starting.y; y < dimensions.y; y++) {
        yield new Vector(x, y);
      }
    }
  };

  async *setUpStandardGame(): ProcessEffectGenerator<any> {
    yield* this.setupCustomGame(`
      RNBQKBNR
      PPPPPPPP
      ........
      ........
      ........
      ........
      pppppppp
      rnbqkbnr
    `);
  }

  async *setupCustomGame(board: string): ProcessEffectGenerator<any> {
    board = board.replace(/\s+/g, "");
    if (board.length !== 64) {
      throw new Error("Bad layout string passed!");
    }
    for (let i = 0; i < 64; i++) {
      const piece = Chess.createStandardPieceFromNotation(board[i]);
      if (piece !== undefined) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        yield piece
          .publish({ world: this, position: new Vector(x, y) })
          .direct()
          .asEffect();
      }
    }
  }

  pieceAt(algebriac: string): Entity | undefined {
    const position = Chessboard.fromAlgebraic(algebriac);
    if (position !== undefined) {
      const piece = this.getEntitiesAtCoordinates(position.x, position.y)[0];
      return piece;
    }
    return undefined;
  }

  // Convert vector to algebraic, ie { 0 ,0 } to 'a1'
  static toAlgebraic(vector: Vector): string | undefined {
    if (!Chessboard.isInBounds(vector)) {
      return undefined;
    }
    const row = vector.y + 1;
    const column = algebraicFiles[vector.x];
    if (column === undefined) {
      return undefined;
    }
    return column + row.toString();
  }

  // Convert algebraic into a vector, ie 'a1' to { 0, 0 }
  static fromAlgebraic(algebraic: string): Vector | undefined {
    if (algebraic.length !== 2) {
      return undefined;
    }
    const letter = algebraic[0];
    const column = algebraicFiles.findIndex((val) => val === letter);
    if (column === -1) {
      return undefined;
    }
    const row = parseInt(algebraic[1], 10) - 1;
    if (!(typeof row === "number") || row < 0 || row > 7) {
      return undefined;
    }
    const vector = new Vector(column, row);
    if (Chessboard.isInBounds(vector)) {
      return vector;
    } else {
      return undefined;
    }
  }

  // TODO this should be an instance method on all World instances, not just this specific one
  static isInBounds(position: Vector) {
    return position.x < 8 && position.y < 8;
  }

  exportToJSON(): any {
    let json: any = {};
    for (const [, entity] of this.entities) {
      const algebriac = Chessboard.toAlgebraic(entity.position);
      if (algebriac !== undefined) {
        json[algebriac.toUpperCase()] = entity.metadata.get("notation");
      }
    }
    return json;
  }

  serialize(): string {
    return "";
  }

  unserialize(data: string): Chessboard {
    return new Chessboard();
  }
}
