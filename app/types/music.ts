import { Group } from "./group";
import { User } from "./user";
import { Category } from "./category";
import { SetlistMusic } from "./setlistMusic";

export interface Music {
  id: string;
  groupId: string;
  title: string;
  lyrics: string;
  tone: string;
  cipher?: string;
  author: string;
  links: Record<string, string>; // Para representar o campo Json
  thumbnail?: string;
  categoryId?: string;
  tags: string[];
  bpm?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  group?: Pick<Group, "id" | "name">;
  creator?: User;
  category?: Category;
  setlists?: SetlistMusic[];
}
