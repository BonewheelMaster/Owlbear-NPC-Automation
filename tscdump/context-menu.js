import OBR from "@owlbear-rodeo/sdk";
import * as npcOps from "./npc-operations";
import * as state from "./state";
export function contextMap(f) {
    return (context) => f(context.items);
}
export const NPCDisabledFilter = { every: [{ key: "layer", value: "CHARACTER" },
        { key: ["metadata", state.STATE, "enabled"], value: true,
            operator: "!=" }
    ],
    roles: ["GM"] };
export const NPCEnabledFilter = { every: [{ key: "layer", value: "CHARACTER" },
        { key: ["metadata", state.STATE, "enabled"], value: true }
    ],
    roles: ["GM"]
};
export const menuInfo = {
    id: state.ID + "/menuInfo",
    // TODO see if these urls can be relative
    icons: [{ icon: "https://bonewheelmaster.github.io/Owlbear-NPC-Automation/panel.svg",
            label: "Info -> Console",
            filter: { roles: ["GM"] }
        }],
    onClick: ((context) => { console.log(context.items); }),
};
export const showId = {
    id: state.ID + "/showId",
    icons: [{ icon: "https://bonewheelmaster.github.io/Owlbear-NPC-Automation/panel.svg",
            label: "Show ID",
            filter: { roles: ["GM"] }
        }],
    onClick: (contextMap(npcOps.showId)),
};
export const menuAdd = {
    id: state.ID + "/menuAdd",
    icons: [{ icon: "https://bonewheelmaster.github.io/Owlbear-NPC-Automation/panel.svg",
            label: "Enable NPC",
            filter: NPCDisabledFilter
        }],
    onClick: (contextMap(npcOps.addTokens)),
};
export const menuSettings = {
    id: state.ID + "/menuSettings",
    icons: [{ icon: "https://bonewheelmaster.github.io/Owlbear-NPC-Automation/panel.svg",
            label: "NPC Settings",
            filter: NPCEnabledFilter
        }],
    embed: { url: "https://bonewheelmaster.github.io/Owlbear-NPC-Automation/settings-menu.html" },
};
export function main() {
    OBR.contextMenu.create(menuInfo);
    OBR.contextMenu.create(menuAdd);
    OBR.contextMenu.create(menuSettings);
    OBR.contextMenu.create(showId);
}
