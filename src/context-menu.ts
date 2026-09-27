import * as OBR from "./obr-api";
import { ContextMenuIconFilter, ContextMenuItem, ContextMenuContext, Item }
    from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import * as npc from "./npc";

export const NPCDisabledFilter : ContextMenuIconFilter = {
    roles: ["GM"],
    every: [
        { key: ["metadata", pre.ID, "kind"], value: npc.MELEE , operator: "!=" },
        { key: ["metadata", pre.ID, "kind"], value: npc.RANGED, operator: "!=" },
    ]
};
export const NPCEnabledFilter  : ContextMenuIconFilter = {
    roles: ["GM"],
    every: [
        { key: ["metadata", pre.ID, "kind"], value: npc.MELEE , coordinator: "||" },
        { key: ["metadata", pre.ID, "kind"], value: npc.RANGED, coordinator: "||" },
    ]
};

export const menuShowId   : ContextMenuItem = {
    id: pre.ID + "/menuShowId",
    icons: [{
        icon: "./panel.svg",
        label: "Show ID",
        }],
    onClick: contextMap(OBR.showId)
};
export const menuAdd      : ContextMenuItem = {
    id: pre.ID + "/menuAdd",
    icons: [{
        icon: "./panel.svg",
        label: "Enable NPC",
        filter: NPCDisabledFilter
        }],
    onClick: contextMap(OBR.enableNPCs)
};
export const menuSettings : ContextMenuItem = {
    id: pre.ID + "/menuSettings",
    icons: [{
        icon: "./panel.svg",
        label: "NPC Settings",
        filter: NPCEnabledFilter
    }],
    embed: { url: "./settings-menu.html" } // TODO can these be relative?
};
export const menuInfo     : ContextMenuItem = {
    id: pre.ID + "/menuInfo",
    icons: [{
        icon: "./panel.svg", // TODO can these be relative?
        label: "Info -> Console"
        }],
    onClick: (context) => { console.log(context.items); }
};

export function main() : void {
    //                                                          VV TODO Tmp
    OBR.createContextMenus([menuShowId, menuAdd, menuSettings, menuInfo]);
}

export function contextMap(f : (items : Item[]) => void)
    : (context : ContextMenuContext) => void {
    return (context) => f(context.items);
}
