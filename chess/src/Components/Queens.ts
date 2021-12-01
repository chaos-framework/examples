import { Component, Action, MoveAction, TerminalMessage, Entity, LogicalAction, UnpublishEntityAction, PublishEntityAction } from '@chaos-framework/core';

import * as Chess from '../Chess.js';
import ChessMove from '../Actions/ChessMove.js';
import Queen from '../Entities/Pieces/Queen.js';
import ChessTeam from '../Enums/Teams.js';
import Chessboard from '../Worlds/Chessboard.js';

export default class Queens extends Component {
  name = 'Queens';
  description = 'Automatically turns into a Queen upon reaching the far end of the board..js';
  
  react(action: Action) {
    // Send out queening message if appropirate
    if (action instanceof ChessMove && action.target === this.parent && action.applied && action.target.world instanceof Chessboard) {
      const { target, to } = action;
      // Make sure the target has a team
      if (target.team === undefined) {
        return;
      }
      const teamName = target.team.name as ChessTeam;
      const forward = Chess.teamDirections[teamName];
      // See if this pawn has reached the edge of the board
      if (action.target.world.isEdgeOfBoardForForwardDirection(to, forward)) {
        action.followup(new LogicalAction('queen', { piece: target }, { caster: target }));
      }
      return;
    }
    // Do the queening if message is sent successfully
    if (
      action instanceof LogicalAction &&
      action.name === 'queen' &&
      action.payload.piece === this.parent &&
      this.parent instanceof Entity &&
      action.permitted
    ) {
      // Queen the piece
      const queen = Queen(this.parent.team!);
      action.followup(this.parent.unpublish());
      action.followup(queen.publish({ world: this.parent.world!, position: this.parent.position })
        .withMessage(this.parent, 'has turned into', queen));
      return;
    }
  }
}
