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

const messageText = {
  missingUASettingsVariable: `
    You must select a Universal Analytics (UA) settings variable by checking
    a box under the "Use Settings Variable in Migration" row. You cannot
    proceed with the migration until a UA settings variable is selected
    for migration.
  `,
  missingMeasurementId: `
    A valid measurement ID or GTM variable name must be entered under the
    "GA4 Measurement ID" column for the UA settings variable you selected.
    You cannot proceed with the migration until a valid value is entered.
  `,
  missingConfigTag: `
    One or more config tags must be set under the "Config Tag" column. All
    event tags that are selected for migration must have a config tag
    selected as well.
  `,
  missingCustomDimensionSetting: `
    One or more custom definitions set to be migrated do not have either 
    "user_property" or "parameter" set under the "Convert To" column. Please 
    specify if they will be converted to a  user_property or parameter. You
    cannot proceed until all custom dimensions set to migrate have a value
    set under the "Convert To" column.
  `,
  missingEventDataSetting: `
    One or more event category, action, or label set to be migrated does not 
    have either "user_property" or "parameter" set under the "Convert To" column. 
    Please specify if they will be converted to a  user_property or parameter. You
    cannot proceed until all event catogories, actions, and labels set to migrate 
    have a value set under the "Convert To" column.
  `,
  versionUpdate: `
    There is a new version of this tool available. Please use the latest version of the tool by using the files 
    on Github or making a copy of this spreadsheet:

    https://docs.google.com/spreadsheets/d/1wpmw7kkHpHzPIDC-mJS3BkSqGqf46W7E5UYpYTFilEc/

    Update Details:

  `,
  measurementConsent: `
    Can we measure your useage of the GA4 GTM Migration Tool to understand
    how often this tool is used and inform future development?
  `,
  missingGTMWorkspace: `
    No Google Tag Manager Workspace has been selected. Please go to the
    "GTM Workspace" sheet and select a workspace under the "Select
    Workspace" column.
  `
}

/**
 * Validates if a UA settings variable has been selected to be migrated.
 * @param {!string} sheetsMetaField
 * @return {boolean}
 */
function validSettingsVariable(sheetsMetaField) {
  let rows = getDataFromSheet(sheetsMetaField, 'settings variable');
  rows = rows.filter(row => row[row.length - 1]);
  if (rows.length > 0) {
    return true;
  } else {
    ui.alert(messageText.missingUASettingsVariable);
    return false;
  }
}

/**
 * Validates if a measurement ID has beeen entered.
 * @return {boolean}
 */
function validMeasurementId() {
  let rows = getDataFromSheet('pageviewMigration', 'settings variable');
  rows = rows.filter(row => row[row.length - 1] && row[3].length > 0)
  if (rows.length > 0) {
    return true;
  } else {
    ui.alert(messageText.missingMeasurementId);
    return false;
  }
}

/**
 * Validates if user_property or parameter is specified for every custom
 * definition or event category, action, or label that is being migrated.
 * @param {string} sheetName
 * @param {string} rangeName
 * @return {boolean}
 */
function validCustomData(sheetsMetaField, rangeName) {
  let rows = getDataFromSheet(sheetsMetaField, rangeName)
  rows = rows.filter(row => {
    if (row[row.length - 1] == 'All Event Tags' ||
      row[row.length - 1] == 'Corresponding Event Tag' ||
			row[row.length - 1] == 'Config Tag') {
				if (row[row.length - 2] != 'user_property' &&
					row[row.length - 2] != 'parameter') {
						return row;
					}
				}
			});
  if (rows.length == 0) {
    return true;
  } else {
    let message = '';
    if (/event/.test(row[2])) {
      message = messageText.missingCustomDimensionSetting;
    } else {
      message = messageText.missingEventDataSetting;
    }
    ui.alert(message);
    return false;
  }
}

/**
 * Validates if all event tags that are being migrated have config tag
 * specified.
 * @return {boolean}
 */
function validConfigTag() {
  let rows = getDataFromSheet('eventMigration', 'event tags');
  rows = rows.filter(row => row[4].length == 0 && row[5]);
  if (rows.length == 0) {
    return true;
  } else {
    ui.alert(messageText.missingConfigTag);
    return false;
  }
}

/**
 * Checks if this is the latest version of the script and sheet.
 * If not, it prompts the user to create a new copy of the sheet
 * from Github.
 */
function checkRelease() {
  if (getDataFromSheet('settings', 'dismissed update')[0][0] == 'Not Set') {
    const releases = JSON.parse(
      UrlFetchApp.fetch(
        'https://api.github.com/repos/google/ga4-gtm-migration/releases'
      ).getContentText());
    const sheetReleaseVersion = getDataFromSheet('settings', 'release')[0][0].split('v')[1].split('.');
    for (let i = 0; i < releases.length; i++) {
      const release = releases[i];
      const version = release.tag_name.split('v')[1].split('.');
      const title = 'Update Avilable';
      const message = messageText.versionUpdate + release.body + `
      
      ` + release.html_url;
      if (parseInt(sheetReleaseVersion[0]) < parseInt(version[0])) {
        const response = ui.alert(title, message, ui.ButtonSet.OK);
        if (response == ui.Button.OK || response == ui.Button.CLOSE) {
          writeToSheet([['Dismissed']], 'settings', 'dismissed update');
        }
        break;
      } else if (parseInt(sheetReleaseVersion[1]) < parseInt(version[1])) {
        const response = ui.alert(title, message, ui.ButtonSet.OK);
        if (response == ui.Button.OK || response == ui.Button.CLOSE) {
          writeToSheet([['Dismissed']], 'settings', 'dismissed update');
        }
        break;
      } else if (parseInt(sheetReleaseVersion[2]) < parseInt(version[2])) {
        const response = ui.alert(title, message, ui.ButtonSet.OK);
        if (response == ui.Button.OK || response == ui.Button.CLOSE) {
          writeToSheet([['Dismissed']], 'settings', 'dismissed update');
        }
        break;
      }
    }
  }
}

/**
 * Checks if a user has consented to be measured with Google Analytics.
 * @return {!bool} Whether or not a user has consented.
 */
function measurementConsentCheck() {
  let consented = getDataFromSheet('settings', 'consent')[0][0];
  if (consented == 'Not Set') {
    const response = ui.alert(messageText.measurementConsent, 
    ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      writeToSheet([[true]], 'settings', 'consent');
      consented = true;
    } else if (response == ui.Button.NO) {
      writeToSheet([[false]], 'settings', 'consent');
      consented = false;
    }
  }
  return consented;
}