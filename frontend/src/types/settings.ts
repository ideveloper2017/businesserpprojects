export enum SettingType {
  GENERAL = 'GENERAL',
  COMPANY = 'COMPANY',
  SMTP = 'SMTP',
  CURRENCY = 'CURRENCY',
  WAREHOUSE = 'WAREHOUSE',
  BRAND = 'BRAND',
  CATEGORY = 'CATEGORY',
  UNIT = 'UNIT',
  BACKUP = 'BACKUP'
}

export enum BackupFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface SettingsDto {
  id?: number;
  key: string;
  value: string | null;
  description?: string | null;
  type: SettingType;
  groupName?: string | null;
  isPublic?: boolean;
}

export interface SettingsGroupDto {
  groupName: string;
  settings: SettingsDto[];
}

export interface SettingsResponse {
  groups: SettingsGroupDto[];
}

export interface CompanySettingsDto {
  companyName: string;
  companyEmail: string;
  companyPhone?: string | null;
  companyAddress?: string | null;
  companyLogo?: string | null;
  companyWebsite?: string | null;
}

export interface SMTPSettingsDto {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useSSL: boolean;
  useTLS: boolean;
}

export interface BackupSettingsDto {
  enabled: boolean;
  frequency: BackupFrequency;
  time: string;
  keepBackups: number;
  backupPath: string;
}
