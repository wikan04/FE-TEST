export interface Coordinate {
  id: number;
  ruas_id: number;
  ordering: number;
  coordinates: string;
  created_at: string;
  updated_at: string;
}

export interface Ruas {
  id: number;
  unit_id: number;
  ruas_name: string;
  long: string;
  km_awal: string;
  km_akhir: string;
  photo_url: string | null;
  doc_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  unit?: {
    id: number;
    unit: string;
    status: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
  };
  coordinates?: Coordinate[];
}

export interface RuasListResponse {
  current_page: number;
  data: Ruas[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface RuasDetailResponse {
  status: boolean;
  message: string;
  data: Ruas;
}

export interface RuasFormData {
  unit_id: number;
  ruas_name: string;
  long: string;
  km_awal: string;
  km_akhir: string;
  status: string;
  coordinates: string[];
}
