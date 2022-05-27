/**
 * Copyright 2022 Google LLC
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

  const analyticsPageviewSubMenu = ui
  .createMenu('Pageview Migration')
  .addItem('List UA Settings Variables', 'writeAnalyticsSettingsVariablesToPageviewSheet')
  .addItem('List UA Pageview Tags', 'writeUAPageviewTagsToSheet')
  .addItem('List UA Fields', 'writeFieldsToSetToPageviewSheet')
  .addItem('List Custom Definitions', 'writeCustomDefinitionsToPageviewSheet')
  .addSeparator()
  .addItem('Migrate Config Tag', 'migrateConfigTag')
  .addItem('Migrate Pageview Event Tags', 'migratePageviewEventTags');

  const analyticsEventSubMenu = ui
	.createMenu('Event Migration')
  .addItem('List UA Settings Variables', 'writeAnalyticsSettingsVariablesToEventSheet')
	.addItem('List UA Events', 'writeEventAndConfigTagsToSheet')
  .addItem('List UA Event Data', 'writeUAEventDataToSheet')
	.addItem('List Custom Definitions', 'writeCustomDefinitionsToEventSheet')
	.addSeparator()
	.addItem('Migrate Event Tags', 'migrateEventTags');

  const listVariables = ui
  .createMenu('(Optional) GTM Variables')
  .addItem('Add GTM Variable Dropdown List', 'writeGTMVariablesToValidationSheet');

  ui
  .createMenu('GTM Migration')
  .addSubMenu(workspaceSubMenu)
  .addSubMenu(analyticsPageviewSubMenu)
	.addSubMenu(analyticsEventSubMenu)
	.addSeparator()
  .addSubMenu(listVariables)
  .addSeparator()
	.addItem('Authorize Permissions', 'authorization')
  .addToUi();
}