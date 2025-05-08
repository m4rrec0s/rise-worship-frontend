import { Group } from "./group";
import { User } from "./user";
import { SetlistMusic } from "./setlistMusic";

export interface Setlist {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  group?: Group;
  creator?: User;
  musics?: SetlistMusic[];
}
