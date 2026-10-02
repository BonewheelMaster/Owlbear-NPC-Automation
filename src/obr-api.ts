// This is the interface for the subset of the OBR SDK that I care about, minus the types.
import OBR, { Item, GridScale, GridType, Vector2, ContextMenuItem }
    from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC, NPCAI } from "./npc";
import * as npc from "./npc";

export type Grid = {
    dpi   : number;
    scale : GridScale;
    type  : GridType;
};

export async function getItems() : Promise<Item[]> {
    return OBR.scene.items.getItems();
}
export async function getSelection() : Promise<Item[]> {
    const selection = await OBR.player.getSelection();
    if (selection === undefined) { return []; }
    const items = await getItems();

    let sel = [];
    for (const id in selection) {
        const item = items.find((i) => i.id == id);
        if (item !== undefined) { items.push(item); }
    }
    return items;
}
export async function getGrid() : Promise<Grid> {
    const [dpi, scale, type] = await Promise.all([
        OBR.scene.grid.getDpi(), OBR.scene.grid.getScale(), OBR.scene.grid.getType()
    ]);
    return {dpi: dpi, scale: scale, type: type};
}
export async function snapToGrid(pos : Vector2) : Promise<Vector2> {
    return OBR.scene.grid.snapPosition(pos, 1, false, true);
}

export async function showId(items : Item[]) : Promise<void> {
    items.map((i) => showNotification(i.id));
}
export async function enableNPCs(items : Item[]) : Promise<void> {
    updateItems((i) => { i.metadata[pre.ID] = npc.initMeleeAI; return i; }, items);
}
export async function disableNPCs(items : Item[]) : Promise<void> {
    updateItems((i) => { i.metadata[pre.ID] = {}; return i; }, items);
}
export async function updateNPCs(f : (npcAI : NPCAI) => NPCAI, npcs : NPC[])
    : Promise<void>
{
    updateItems((item) => {
                    if (!npc.isNPC(item)) { return item; }
                    item.meta = f(item.meta);
                    return item; }
                , npcs);
}
export async function updateItems(f : (item : Item) => Item, items : Item[])
    : Promise<void>
{
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            item = f(item);
        }
    });
}
export async function createContextMenus(menus : ContextMenuItem[]) : Promise<void> {
    await Promise.all(menus.map((menu) => { OBR.contextMenu.create(menu); }));
}
export async function showNotification(msg : string) : Promise<void> {
    OBR.notification.show(msg, "INFO");
}
export async function onReady(f : () => void) : Promise<void> {
    OBR.onReady(f);
}
export async function onChange(f : (items : Item[]) => void) : Promise<void> {
    OBR.scene.items.onChange(f);
}
