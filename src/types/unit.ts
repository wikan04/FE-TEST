import { Ruas } from "./ruas";

export interface Unit {
  id: number;
  unit: string;
  status: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  ruas?: Ruas[];
}

export interface UnitResponse {
  status: boolean;
  message: string;
  data: Unit[];
}
