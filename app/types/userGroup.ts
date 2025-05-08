import { User } from "./user";
import { Group } from "./group";

export interface UserGroup {
  id: string;
  userId: string;
  groupId: string;
  permission: string;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  group?: Group;
}
