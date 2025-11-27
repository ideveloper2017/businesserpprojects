import api from '../lib/api';
import { 
  SettingsDto, 
  CompanySettingsDto, 
  SMTPSettingsDto, 
  BackupSettingsDto,
  SettingsResponse,
  SettingType,
  BackupFrequency
} from '../types/settings';

export const getSettings = async (): Promise<SettingsDto[]> => {
  const response = await api.get('/api/v1/settings');
  return response.data.data;
};

export const getGroupedSettings = async (): Promise<SettingsResponse> => {
  const response = await api.get('/api/v1/settings/grouped');
  return response.data.data;
};

export const getSettingById = async (id: number): Promise<SettingsDto> => {
  const response = await api.get(`/api/v1/settings/${id}`);
  return response.data.data;
};

export const createSetting = async (setting: Partial<SettingsDto>): Promise<SettingsDto> => {
  const response = await api.post('/api/v1/settings', setting);
  return response.data.data;
};

export const updateSetting = async (id: number, setting: Partial<SettingsDto>): Promise<SettingsDto> => {
  const response = await api.put(`/api/v1/settings/${id}`, setting);
  return response.data.data;
};

export const deleteSetting = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/settings/${id}`);
};

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettingsDto> => {
  const response = await api.get('/api/v1/settings/company');
  return response.data.data;
};

export const updateCompanySettings = async (settings: CompanySettingsDto): Promise<CompanySettingsDto> => {
  const response = await api.put('/api/v1/settings/company', settings);
  return response.data.data;
};

// SMTP Settings
export const getSmtpSettings = async (): Promise<SMTPSettingsDto> => {
  const response = await api.get('/api/v1/settings/smtp');
  return response.data.data;
};

export const updateSmtpSettings = async (settings: SMTPSettingsDto): Promise<SMTPSettingsDto> => {
  const response = await api.put('/api/v1/settings/smtp', settings);
  return response.data.data;
};

// Backup Settings
export const getBackupSettings = async (): Promise<BackupSettingsDto> => {
  const response = await api.get('/api/v1/settings/backup');
  return response.data.data;
};

export const updateBackupSettings = async (settings: BackupSettingsDto): Promise<BackupSettingsDto> => {
  const response = await api.put('/api/v1/settings/backup', settings);
  return response.data.data;
};

// Search and filter
export const searchSettings = async (query: string, page: number = 0, size: number = 20) => {
  const response = await api.get('/api/v1/settings/search', {
    params: { query, page, size }
  });
  return response.data.data;
};

export const getSettingsByType = async (type: SettingType): Promise<SettingsDto[]> => {
  const response = await api.get(`/api/v1/settings/type/${type}`);
  return response.data.data;
};

export const getSettingsByGroup = async (groupName: string): Promise<SettingsDto[]> => {
  const response = await api.get(`/api/v1/settings/group/${encodeURIComponent(groupName)}`);
  return response.data.data;
};
