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
 * Migrates Universal Google Analytics (UA GA) tags to App + Web (AW) tags in
 * a given Google Tag Manager (GTM) container.
 */

const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();
const cache = CacheService.getScriptCache();
const cacheTimeout = 300;
const cachingEnabled = getDataFromSheet('settings', 'caching')[0][0];

const analyticsVersion = {
	ga4Event: 'gaawe',
	ua: 'ua'
};

/**
 * Removes the empty rows for a given range of values.
 * @param {!Array<!Array<string>>} rows Spreadsheet row values.
 * @return {?Array<?Array<string>>} Spreadsheet row values with no empty values.
 */
function removeEmptyRows(rows) {
  return rows.filter(row => {
    return row[0] != '';
  });
}

/**
 * Builds the map object for user properties.
 * @param {string} name The name of the entity being mapped.
 * @param {string} value The value of the entity being mapped.
 * @return {!Object} The map object that can be added to a tag or variable.
 */
function buildUserPropertyMapObject (name, value) {
  return {
    map: [
      {value: name, type: 'template', key: 'name'},
      {value: value.toString(), type: 'template', key: 'value'}
    ],
    type: 'map'
  };
}

/**
 * Builds the map object for fields, custom definitions, etc.
 * @param {string} name The name of the entity being mapped.
 * @param {string} value The value of the entity being mapped.
 * @return {!Object} The map object that can be added to a tag or variable.
 */
function buildParameterMapObject(name, value) {
  return {
    map: [
      {value: name, type: 'template', key: 'parameter'},
      {value: value.toString(), type: 'template', key: 'parameterValue'}
    ],
    type: 'map'
  };
	
}

/**
 * Writes data to a specified sheet.
 * @param {!Array} data The data to be written to the sheet.
 * @param {string} sheetName The name of the sheet to which the data will be 
 * written.
 * @param {string} rangeName The name of the range for the sheet where the data 
 * will be written.
 */
function writeToSheet(data, sheetName, rangeName) {
  let ranges = null;
  sheetsMeta[sheetName].ranges.forEach(range => {
    if (range.name == rangeName) {
      ranges = range.write;
    }
  });
  let sheet = ss.getSheetByName(sheetsMeta[sheetName].sheetName);
  if (sheet == null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  }
  if (data.length > 0) {
    sheet
      .getRange(ranges.row, ranges.column, data.length, ranges.numColumns)
      .setValues(data);
  }
}

/**
 * Gets data to a specified sheet and range.
 * @param {string} sheetsMetaField The name of the sheet to read the data from.
 * @param {string} rangeName The name of the range to read the data from.
 * @return {!}
 */
function getDataFromSheet(sheetsMetaField, rangeName) {
  let ranges = null;
  sheetsMeta[sheetsMetaField].ranges.forEach(range => {
    if (range.name == rangeName) {
      ranges = range.read;
    }
  });
  let sheet = ss.getSheetByName(sheetsMeta[sheetsMetaField].sheetName);
  if (sheet == undefined) {
    sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .insertSheet(sheetsMeta[sheetsMetaField].sheetName);
  }
  const data = sheet
    .getRange(ranges.row, ranges.column, sheet.getLastRow(), ranges.numColumns)
    .getValues();
  return removeEmptyRows(data);
}

/**
 * Clear contents of a specific range.
 * @param {string} sheetsMetaField
 * @param {string} rangeName
 */
function clearRangeContent(sheetsMetaField, rangeName) {
  let ranges = null;
  sheetsMeta[sheetsMetaField].ranges.forEach(range => {
    if (range.name == rangeName) {
      ranges = range.read;
    }
  });
  const sheet = ss.getSheetByName(sheetsMeta[sheetsMetaField].sheetName);
  sheet.getRange(
    ranges.row, 
    ranges.column, 
    sheet.getLastRow(), 
    ranges.numColumns)
  .clearContent();
}

const errorText = {
  missingUASettingsVariable: `
    You must select a Universal Analytics (UA) settings variable to migrate. You
    cannot proceed with the migration until a UA settings variable is selected
    for migration.
  `,
  missingMeasurementId: `
    A valid measurement ID or GTM variable name must be entered under the
    "GA4 Measurement ID" column for the UA settings variable you selected.
    You cannot proceed with the migration until a valid value is entered.
  `,
  missingGTMWorkspace: `
    No Google Tag Manager Workspace has been selected. Please go to the
    "GTM Workspace" sheet and select a workspace under the "Select
    Workspace" column.
  `
}