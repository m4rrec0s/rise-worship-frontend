import { Group } from "./group";
import { Music } from "./music";
import { Setlist } from "./setlist";
import { UserGroup } from "./userGroup";

export interface User {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  lastLogin?: Date;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  permissions: UserGroup[];
  musics: Music[];
  createdGroups: Group[];
  setlist: Setlist[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface GoogleAuthData {
  idToken: string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  imageUrl?: string | null;
}

export interface AuthResponse {
  user: User;
  idToken: string;
  sessionToken: string;
  firebaseUid: string;
}
