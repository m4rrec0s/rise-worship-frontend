import { Music } from "./music";

export interface SetlistMusic {
  id: string;
  order: number;
  music?: Music;
}
