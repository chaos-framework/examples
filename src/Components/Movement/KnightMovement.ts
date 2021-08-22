import { Action, Component, Modifier, MoveAction } from '@chaos/core';

import MovementPermissionPriority from '../../Enums/MovementPermissionPriority';

// Allows for knight 2-1 movement
export default class KnightMovement extends Component implements Modifier {
  name = 'Knight Movement';

  modify(action: Action) {
    if (action instanceof MoveAction && action.target === this.parent && action.tagged('playerMovement')) {
      const { target, to } = action;
      const delta = to.subtract(target.position).absolute();
      if((delta.x === 1 && delta.y === 2) || (delta.x === 2 && delta.y === 1)) {
        action.permit({ priority: MovementPermissionPriority.ALLOWED });
      }
    }
  }
}