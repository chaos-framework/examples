import { Action, Component, Modifier, MoveAction } from '@chaos/core';

import { getForwardDirection } from '../../Util/Movement';
import { getTeamFromTag } from '../../Util/Peices';

import MovementPermissionPriority from '../../Enums/MovementPermissionPriority';

export default class MovesOneSquareForward extends Component implements Modifier {
  name = "Moves One Square Forward"

  modify(action: Action) {
    if (action instanceof MoveAction && action.target === this.parent && action.tagged('playerMovement')) {
      const { target, to } = action;
      const team = target.metadata.get('team');
      if(team === undefined || (team !== 'WHITE' && team !== 'BLACK')) {
        action.deny({ message: 'Cannot determine team of this piece.' });
        return;
      }
      // Make sure the movement is "forward"
      const delta = to.subtract(target.position);
      // Check that the movement is only one square directly forward
      if (delta.y === getForwardDirection(team) && Math.abs(delta.y) === 1 && delta.x === 0) {
        action.permit({ priority: MovementPermissionPriority.ALLOWED });
        return;
      }
      // Make sure not too far to side
      if (Math.abs(delta.x) > 1) {
        action.deny({ message: 'Too far to the side!' });
        return;
      }
      // Make sure it's only diagonal if capturing an enemy peice
      if (Math.abs(delta.x) === 1) {
        const board = target.world;
        if(board === undefined) {
          action.deny({ message: 'Piece is not published / not on a board.' });
          return;
        }
        const entityAtDestination = board.getEntitiesAtCoordinates(to.x, to.y)[0];
        if(entityAtDestination === undefined || getTeamFromTag(entityAtDestination) === team) {
          action.deny({ message: 'You can only move diagonally to capture an enemy piece.' })
          return;
        }
      }
    }
  }

}