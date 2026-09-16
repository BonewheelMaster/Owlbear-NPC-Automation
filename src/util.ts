import OBR, { Item, Vector2, BoundingBox } from "@owlbear-rodeo/sdk";

import * as state from "./state";

export function distance(p1 : Vector2, p2 : Vector2) : number {
    return Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2);
}

export function length(vec : Vector2) : number {
    return distance(vec, { x : 0, y : 0 });
}

// Round x to the nearest multiple of y.
export function round(x : number, y : number) : number {
    return y * Math.round(x / y);
}

// Keep only those items which implement the NPC interface; namely, that have
// metadata that is of the correct type.
export function filterNPCs(items: Item[]) : state.NPC[] {
    const npcs = [];

    for (const item of items) {
        if (! state.validMetadata(item.metadata[state.STATE])) { continue; }
        npcs.push({ ...item, meta: item.metadata[state.STATE] });
    }
    return npcs;
}

// Given all items and a target id, return the item that id corresponds to.
export function getTarget(items: Item[], targetId: string) : Item | null {
    const targets = items.filter((item) => item.id == targetId);

    if (targets.length == 1) {
        return targets[0];
    } else { return null; }
}

// Get the text label from an item. If the item has none, return "".
export function getTextLabel(item : Item) {
    if ( "text" in item
         && typeof item.text == "object"
         && item.text != null
         && "plainText" in item.text
         && typeof item.text.plainText == "string"
       ) { return item.text.plainText; }
    else { return ""; }
}

// Get the name of an item, which is its text label if it has one.
export function getName(item : Item) {
    const label = getTextLabel(item);
    if (label == "") { return `${item.name}`; }
    else             { return `${label}`; }
}

export const origin : Vector2 = { x: 0, y: 0 };

export const emptyBoundingBox : BoundingBox = {
    min: origin,
    max: origin,
    width: 0,
    height: 0,
    center: origin
};
