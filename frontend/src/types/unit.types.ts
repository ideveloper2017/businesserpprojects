export interface Unit {
  id?: number;
  code: string;
  name: string;
  active: boolean;
  create_at?: string;
  update_at?: string;
}

export interface CreateUnitDto extends Omit<Unit, 'id' | 'create_at' | 'update_at'> {}
export interface UpdateUnitDto extends Partial<CreateUnitDto> {}
