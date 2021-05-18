import { Howl } from "howler";

export type PlayListLoop = "random" | "list-loop" | "list";

export interface PlayListItem {
  id: string;
  sid: number;
  title: string;
  url: string;
  duration?: number;
  timer?: number;
  howl?: Howl;
  deleted: boolean
}
