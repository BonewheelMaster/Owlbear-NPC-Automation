import * as state from "./state";
export function distance(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
export function length(vec) {
    return distance(vec, { x: 0, y: 0 });
}
// Round x to the nearest multiple of y.
export function round(x, y) {
    return y * Math.round(x / y);
}
// Keep only those items which implement the NPC interface; namely, that have
// metadata that is of the correct type.
export function filterNPCs(items) {
    const npcs = [];
    for (const item of items) {
        if (!state.validMetadata(item.metadata[state.STATE])) {
            continue;
        }
        npcs.push({ ...item, meta: item.metadata[state.STATE] });
    }
    return npcs;
}
// Given all items and a target id, return the item that id corresponds to.
export function getTarget(items, targetId) {
    const targets = items.filter((item) => item.id == targetId);
    if (targets.length == 1) {
        return targets[0];
    }
    else {
        return null;
    }
}
// Get the text label from an item. If the item has none, return "".
export function getTextLabel(item) {
    if ("text" in item
        && typeof item.text == "object"
        && item.text != null
        && "plainText" in item.text
        && typeof item.text.plainText == "string") {
        return item.text.plainText;
    }
    else {
        return "";
    }
}
// Get the name of an item, which is its text label if it has one.
export function getName(item) {
    const label = getTextLabel(item);
    if (label == "") {
        return `${item.name}`;
    }
    else {
        return `${label}`;
    }
}
export const origin = { x: 0, y: 0 };
export const emptyBoundingBox = {
    min: origin,
    max: origin,
    width: 0,
    height: 0,
    center: origin
};
