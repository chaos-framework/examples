import { Component, Modifier, Action, MoveAction, Team, Chaos } from '@chaos/core'

import Chess from '../..';
import MovementPermissionPriority from '../../Enums/MovementPermissionPriority';
import Teams from '../../Enums/Teams';

// Only allows player movement during the team's turn
export default class CanOnlyMoveOnTurn extends Component implements Modifier {
  modify(action: Action) {
    if (action instanceof MoveAction && action.tagged('playerMovement')) {
      // Make sure the piece's current team has the turn
      const team = action.target.getTeam();
      action.deny({ priority: MovementPermissionPriority.DISALLOWED, message: "It's not this team's turn!" });
    }
  }
}
