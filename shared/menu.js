/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Builds the menu.
 */
function onOpen() {
  const workspaceSubMenu = ui
    .createMenu('GTM Workspace Selection')
    .addItem('List GTM Accounts', 'writeGtmAccountsToSheet')
    .addItem('List GTM Containers', 'writeSelectedGtmContainersToSheet')
    .addItem('List GTM Workspaces', 'writeSelectedGtmWorkspacesToSheet')

  const configurationVariableSubMenu = ui
    .createMenu('Configuration Variable')
    .addItem(
      'List UA Settings Variables', 
      'writeAnalyticsSettingsVariablesToConfigurationVariableSheet')
    .addItem('List Settings to Migrate', 'writeConfigurationSettingsToSheet')
    .addSeparator()
    .addItem('Create Configuration Variable', 'createConfigurationVariable');

  const eventSettingsVariableSubMenu = ui
    .createMenu('Event Setting Variable')
    .addItem(
      'List UA Settings Variables', 
      'writeAnalyticsSettingsVariablesToEventVariableSheet')
    .addItem('List Settings to Migrate', 'writeSettingsToEventTagSheet')
    .addSeparator()
    .addItem('Create Event Settings Variable', 'createEventVariable');
  
  const googleTagSubMenu = ui
    .createMenu('Google Tag')
    .addItem('List Settings to Migrate', 'writeSettingsToGoogleTagSheet')
    .addSeparator()
    .addItem('Create Google Tag', 'createGoogleTag');

  const eventTagSubMenu = ui
    .createMenu('Event Tags')
    .addItem('List Tags to Migrate', 'writeUATagsToEventSheet')
    .addItem('List Settings to Migrate', 'writeUASettingsToEventSheet')
    .addSeparator()
    .addItem('Create Event Tags', 'migrateUATags');

  ui.createMenu('GTM Migration')
    .addSubMenu(workspaceSubMenu)
    .addSubMenu(configurationVariableSubMenu)
    .addSubMenu(eventSettingsVariableSubMenu)
    .addSubMenu(googleTagSubMenu)
    .addSubMenu(eventTagSubMenu)
    .addToUi();
}