import { Group } from "./group";
import { Music } from "./music";

export interface Category {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  group?: Group;
  musics?: Music[];
}
