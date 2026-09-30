import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC } from "./npc";
import * as npc from "./npc";

export function filterNPCs(items : Item[]) : NPC[] {
    return items.filter(npc.isNPC);
}
// Get the name of an item, which is its text label if it has one.
export function getName(item : Item) {
    const label = getLabel(item);
    if (label === null) { return item.name; }
    return label;
}
// Get the label of an item. If it has none, return null.
export function getLabel(item : Item) : string | null {
    if ( "text" in item && typeof item.text == "object" && item.text !== null
        && "plainText" in item.text && typeof item.text.plainText == "string"
       ) { return item.text.plainText; }

    return null;
}
// Given a target id, find its corresponding item if it exists.
export function getTarget(items : Item[], targetId : string) : Item | null {
    const target = items.find((item) => { return item.id == targetId; })
    if (target === undefined) { return null; }
    return target;
}
