import * as OBR from "./obr-api";
import { ContextMenuIconFilter, ContextMenuItem, ContextMenuContext, Item }
    from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import * as npc from "./npc";

const panelIconURL = "/Owlbear-NPC-Automation/panel.svg";

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
        icon: panelIconURL,
        label: "Show ID",
        }],
    onClick: contextMap(OBR.showId)
};
export const menuAdd      : ContextMenuItem = {
    id: pre.ID + "/menuAdd",
    icons: [{
        icon: panelIconURL,
        label: "Enable NPC",
        filter: NPCDisabledFilter
        }],
    onClick: contextMap(OBR.enableNPCs)
};
export const menuSettings : ContextMenuItem = {
    id: pre.ID + "/menuSettings",
    icons: [{
        icon: panelIconURL,
        label: "NPC Settings",
        filter: NPCEnabledFilter
    }],
    embed: { url: "/Owlbear-NPC-Automation/src/settings-menu.html" }
};
export const menuInfo     : ContextMenuItem = {
    id: pre.ID + "/menuInfo",
    icons: [{
        icon: panelIconURL,
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
