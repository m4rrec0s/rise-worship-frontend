import { User } from "./user";
import { UserGroup } from "./userGroup";
import { Music } from "./music";
import { Setlist } from "./setlist";
import { Category } from "./category";

export interface Group {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  creator?: User;
  permissions?: UserGroup[];
  musics?: Music[];
  setlists?: Setlist[];
  categories?: Category[];
}
