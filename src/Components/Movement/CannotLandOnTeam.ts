import { Action, Component, Modifier, MoveAction } from '@chaos/core';

import MovementPermissionPriority from '../../Enums/MovementPermissionPriority';

// Disallows movement if landing on your own piece
export default class CannotLandOnTeam extends Component implements Modifier {
  name = "Cannot Land On Team";

  modify(action: Action) {
    if (action instanceof MoveAction && action.target === this.parent && action.tagged('playerMovement')) {
      const { target, to } = action;
      if (target.world === undefined) {
        return;
      }
      const team = target.metadata.get('team');
      if (team === undefined || (team !== 'WHITE' && team !== 'BLACK')) {
        action.deny({ priority: MovementPermissionPriority.DISALLOWED, message: 'Cannot determine team of this piece.' });
        return;
      }
      const entitiesAtLocation = target.world.getEntitiesAtCoordinates(to.x, to.y);
      for (const entity of entitiesAtLocation) {
        if(entity.metadata.get('team') === team) {
          action.deny({ priority: MovementPermissionPriority.DISALLOWED, message: "You cannot move onto your own piece."})
        }
      }
    }
  }
}