import { Entity, Team, Vector } from '@chaos-framework/core';

import Chessboard from '../Worlds/Chessboard';

export function movementWillResultInCheck(board: Chessboard, checkablePiece: Entity, movingPiece: Entity, to: Vector, depth = 0) {
  // Temporarily move the piece to the location and test if the piece is in check
  const originalLocation = movingPiece.position;
  movingPiece._move(to);
  const inCheck = isInCheck(board, checkablePiece, depth);
  movingPiece._move(originalLocation);
  return inCheck;
}

export function isInCheck(board: Chessboard, piece: Entity, depth = 0): boolean {
  if (piece.team === undefined) {
    return false;
  }
  // Get all pieces on the board that do not belong to the friendly team
  const enemyPieces = getEnemyPieces(board, piece.team);
  // See if any are capable of moving onto this piece's position
  for(const enemy of enemyPieces) {
    if(moveIsPossible(enemy, piece.position, depth + 1)) {
      return true;
    }
  }
  return false;
}

export function isInCheckmate(board: Chessboard, piece: Entity, attacker: Entity, depth = 0): boolean {
  // See if the piece can move anywhere to break the check, including capturing the attacker
  for(const position of board.playSquares()) {
    if(!position.equals(piece.position) && moveIsPossible(piece, position, depth + 1)) {
      return false;
    }
  }
  // See if any allied pieces can either move between the attacker in a way that breaks the check OR capture the attacker
  const positionsBetweenAttackerAndPiece = [...piece.position.getLineTo(attacker.position)]
  for(const ally of getAlliedPieces(board, piece.team!)) {
    // Try to capture the attacker
    if(moveIsPossible(ally, attacker.position, depth + 1)) {
      return false;
    }
    // See if any movements between attacker and piece in check will break it
    for(const position of positionsBetweenAttackerAndPiece) {
      if(moveIsPossible(ally, position, depth + 1)) {
        return false;
      }
    }
  }
  return true;
}

function moveIsPossible(piece: Entity, position: Vector, queryDepth: number): boolean {
  const potentialCapture = piece.move({ to: position, metadata: { playerMovement: true, queryDepth }}).deniedByDefault();
  piece.handle('permit', potentialCapture);
  potentialCapture.decidePermission();
  return potentialCapture.permitted;
}

function getAlliedPieces(board: Chessboard, friendlyTeam: Team): Entity[] {
  const enemyPieces: Entity[] = [];
  for (const [, entity] of board.entities) {
    if (entity.team === friendlyTeam) {
      enemyPieces.push(entity);
    }
  }
  return enemyPieces;
}

function getEnemyPieces(board: Chessboard, friendlyTeam: Team): Entity[] {
  const enemyPieces: Entity[] = [];
  for (const [, entity] of board.entities) {
    if (entity.team !== friendlyTeam) {
      enemyPieces.push(entity);
    }
  }
  return enemyPieces;
}