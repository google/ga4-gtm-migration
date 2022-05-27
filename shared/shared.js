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
 * Migrates Universal Google Analytics (UA GA) tags to App + Web (AW) tags in
 * a given Google Tag Manager (GTM) container.
 */

// Values will be shared across multiple functions.
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();
const cache = CacheService.getScriptCache();
const cacheTimeout = 300;
const cachingEnabled = getDataFromSheet('settings', 'caching')[0][0];

// Entity types as defined by the GTM API.
const analyticsVersion = {
	ga4Config: 'gaawc',
	ga4Event: 'gaawe',
	ua: 'ua'
};

const uaTagType = {
	pageview: 'TRACK_PAGEVIEW',
	event: 'TRACK_EVENT'
};

// Parameter key values as defined by the GTM API.
const paramKeyValues = {
	mid: 'measurementId',
	trackType: 'trackType'
};

// The "Migrate To" options for a given mapping.
const migrateTo = {
	config: 'Config Tag',
	allEvents: 'All Event Tags',
	singleEvent: 'Corresponding Event Tag'
};

/**
 * Runs some API requests to force the script to request auth permissions.
 */
function authorization() {
  Session.getActiveUser().getEmail();
  TagManager.Accounts.list();
  SpreadsheetApp.getActive();
}

/**
 * Identifies if a character is upper or lowercase.
 * @param {string} character
 * @return {!bool} Whether or not a character is capitalized.
 */
function isCharacterCapital(character) {
  if (character == character.toUpperCase()) {
    return true;
  }
  if (character == character.toLowerCase()) {
    return false;
  }
}

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
 * Returns an array of universal analytics tags.
 * @param {!Array<?Object>} tags
 * @param {string} analyticsType
 * @param {string} tagType
 * @param {string} additionalConditions
 * @param {string} sheetName
 * @param {string} tagRangeName
 * @return {?Array<?Object>}
 */
function filterUATags(tags, analyticsType, tagType, additionalConditions, sheetName, tagRangeName) {
  let filteredTags = [];
  let selectedSettingsVariableName = '';
  const settingsVariableText = getDataFromSheet(sheetName, 'settings variable').find(row => row[row.length - 1] == true)[0];
  selectedSettingsVariableName = '{{' + settingsVariableText +  '}}';
  const tagData = getDataFromSheet(sheetName, tagRangeName);
  let ids = null;
  if (tagType == 'TRACK_PAGEVIEW') {
    ids = tagData.filter(row => {
      if (row[row.length - 1] !== 'Do Not Migrate' && row[row.length - 1] !== '') {
        return row;
        }
      }).map(row => row[1]);
  } else if (tagType == 'TRACK_EVENT') { 
    ids = tagData.filter(row => row[row.length - 1] == true).map(row => row[1]);
  }

  tags.forEach(tag => {
    if (tag.type == analyticsType) {
      if (analyticsType == analyticsVersion.ua) {
        const gaSettingsParam = tag.parameter.find(param => param.key == 'gaSettings');
        tag.parameter.forEach(param => {
          if (param.key == paramKeyValues.trackType) {
            if (param.value == tagType) {
              if (additionalConditions == 'sameSettingsVariable') {
                if (gaSettingsParam != undefined) {
                  if (gaSettingsParam.value == selectedSettingsVariableName) {
                    filteredTags.push(tag);
                  }
                }
              } else if (additionalConditions == 'selectedTags') {
                if (ids.indexOf(parseInt(tag.tagId)) != -1) {
                  filteredTags.push(tag);
                }
              } else if (additionalConditions == 'none') {
                filteredTags.push(tag);
              }
            }
          }
        });
      } else if (tag.type == analyticsVersion.ga4Config) {
				filteredTags.push(tag);
      }
    }
  });
  return filteredTags;
}

/**
 * Attempts to convert camel case field names to snake case.
 * @param {!Array<?Object>} fields A list of all fields.
 * @return {!Array<?Array<string>>} A list of all fields.
 */
function convertToSnakeCase(fields) {
  fields.forEach(field => {
    if (/{{/.test(field[2]) == false) {
			const convertedName = field[2].replace( /([A-Z])/g, " $1" );
			field[2] = convertedName.split(' ').join('_').toLowerCase();
    }
  });
  return fields;
}

/**
 * Gets the measurement ID from the sheet.
 * @param {string} sheetsMetaField
 * @return {string}
 */
function getMeasurementId(sheetsMetaField) {
	const rows = getDataFromSheet(sheetsMetaField, 'settings variable');
  return rows.filter(row => row[4])[0][3];
}

/**
 * Gets the UA settings variable ID from the sheet.
 * @param {string} sheetsMetaField
 * @return {number}
 */
function getAnalyticsSettingsVariableId(sheetsMetaField) {
  const rows = getDataFromSheet(sheetsMetaField, 'settings variable');
  return rows.filter(row => row[row.length - 1])[0][2];
}

/**
 * Builds the map object for fields, custom definitions, etc.
 * @param {string} name The name of the entity being mapped.
 * @param {string} value The value of the entity being mapped.
 * @return {!Object} The map object that can be added to a tag or variable.
 */
function buildMapObject (name, value) {
	return {
		map: [
			{value: name, type: 'template', key: 'name'},
			{value: value.toString(), type: 'template', key: 'value'}
		],
		type: 'map'
	};
}

/**
 * Writes data to a specified sheet.
 * @param {!Array} data The data to be written to the sheet.
 * @param {string} sheetName The name of the sheet to which the data will be written.
 * @param {string} rangeName The name of the range for the sheet where the data will be written.
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
    sheet.getRange(ranges.row, ranges.column, data.length, ranges.numColumns).setValues(data);
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
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetsMeta[sheetsMetaField].sheetName);
  }
  const data = sheet.getRange(ranges.row, ranges.column, sheet.getLastRow(), ranges.numColumns).getValues();
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
  sheet.getRange(ranges.row, ranges.column, sheet.getLastRow(), ranges.numColumns).clearContent();
}