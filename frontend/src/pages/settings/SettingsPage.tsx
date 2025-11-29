import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySettings } from './sections/CompanySettings';
import { SMTPSettings } from './sections/SMTPSettings';
import { BackupSettings } from './sections/BackupSettings';
import { GeneralSettings } from './sections/GeneralSettings';
import {UsersSettings} from "@/pages/settings/sections/UsersSettings.tsx";

type SettingsTab = 'general' | 'company' | 'smtp' | 'backup' | 'users' | 'roles';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {activeTab === 'smtp' ? 'SMTP Settings' : `${activeTab} Settings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>
            <TabsContent value="company">
              <CompanySettings />
            </TabsContent>
            <TabsContent value="smtp">
              <SMTPSettings />
            </TabsContent>
            <TabsContent value="backup">
              <BackupSettings />
            </TabsContent>
            <TabsContent value="users">
              <UsersSettings />
            </TabsContent>
            <TabsContent value="roles">
              {/*<RolesSettings />*/}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};
