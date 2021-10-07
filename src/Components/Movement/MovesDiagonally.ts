import { Action, Component, MoveAction } from '@chaos/core';

import MovementPermissionPriority from '../../Enums/MovementPermissionPriority';

export default class MovesDiagonally extends Component {
  name = 'Moves Diagonally';

  permit(action: Action) {
    if (action instanceof MoveAction && action.target === this.parent && action.tagged('playerMovement')) {
      const { target, to } = action;
      if (target.position.isDiagonalTo(to)) {
        action.permit({ priority: MovementPermissionPriority.ALLOWED });
      }
    }
  }
}
