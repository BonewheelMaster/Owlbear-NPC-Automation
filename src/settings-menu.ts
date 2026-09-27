import * as OBR from "./obr-api";
import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC, NPCAI, NPCAIType } from "./npc";

async function getSelectedNPCs() : Promise<NPC[]>

async function removeSelectedNPCs()  : Promise<void>

// Get the current settings of all given NPCs.
//
// The following describes how conflicts are resolved:
//      If there are no conflicts (all selected NPCs have the same values set),
//      then this will return those values, and "Agreed" as the first of a pair.
//      If there are conflicts but all NPCs are the same AI type, this will
//      return that type, and "Partial" as the first of a pair.
//      Otherwise, this will return "Disagreed". Also returns this if nothing is selected.
function getNPCSettings(NPCs : NPC[])
    : ["Agreed", NPCAI] | ["Partial", NPCAIType] | "Disagreed"

async function makeMenu() : Promise<void>

OBR.onReady(makeMenu);
