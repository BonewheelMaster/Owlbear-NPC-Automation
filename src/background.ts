import * as OBR from "./obr-api";

import * as pre from "./prelude";

import { main as addContextMenu } from "./context-menu";

OBR.onReady(addContextMenu);
