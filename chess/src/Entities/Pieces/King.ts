import { Entity, GlyphCode347, Team } from "@chaos-framework/core";
import { createBaseChessPiece } from "./_common.js";
import Collides from "../../Components/Movement/Collides.js";
import MovesOneSquareAnyDirection from "../../Components/Movement/MovesOneSquareAnyDirection.js";
import Checkable from "../../Components/Combat/Checkable.js";

function King(team: Team): Entity {
  return createBaseChessPiece(
    "King",
    team,
    ["K", "k"],
    [new Collides(), new MovesOneSquareAnyDirection(), new Checkable()]
  );
}

export default King;
