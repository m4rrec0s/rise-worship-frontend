import { Setlist } from "./setlist";
import { Music } from "./music";

export interface SetlistMusic {
  id: string;
  setlistId: string;
  musicId: string;
  order: number;

  setlist?: Setlist;
  music?: Music;
}
