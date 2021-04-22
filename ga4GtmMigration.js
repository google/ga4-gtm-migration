/**
 * Copyright 2020 Google LLC
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
const gtmUrlSheet = ss.getSheetByName('GTM URL');
const changelogSheet = ss.getSheetByName('Changelog');
const pageviewMigrationSheet = ss.getSheetByName('Pageview Migration');
const eventMigrationSheet = ss.getSheetByName('Event Migration');
const validationSheet = ss.getSheetByName('Validation Settings');
const settingsSheet = ss.getSheetByName('Settings');

const gtmUrl = gtmUrlSheet.getRange('B1').getValue();
const gtmPath = gtmUrl.split('#/container/')[1];
const version = '1.02';

/**
 * Builds the menu.
 */
function onOpen() {
  const analyticsPageviewSubMenu = ui
  .createMenu('Pageview Migration')
  .addItem('List UA Settings Variables', 'pmWriteUAVariableToSheet')
  .addItem('List UA Pageview Tags', 'pmWriteUAPageviewToSheet')
  .addItem('List UA Fields', 'pmWriteFieldsToSheet')
  .addItem('List Custom Definitions', 'pmWriteCustomDefinitionsToSheet')
  .addSeparator()
  .addItem('Migrate Config Tag', 'migrateConfigTag')
  .addItem('Migrate Pageview Event Tags', 'migratePageviewEventTags')
	
  const analyticsEventSubMenu = ui
	.createMenu('Event Migration')
  .addItem('List UA Settings Variables', 'emWriteUAVariableToSheet')
	.addItem('List UA Events', 'emListUAEventTags')
  .addItem('List UA Event Data', 'emWriteUAEventDataToSheet')
	.addItem('List Custom Definitions', 'emWriteCustomDefinitionsToSheet')
	.addSeparator()
	.addItem('Migrate Event Tags', 'migrateEventTags')

  ui
  .createMenu('GTM Migration')
  .addSubMenu(analyticsPageviewSubMenu)
	.addSubMenu(analyticsEventSubMenu)
	.addSeparator()
	.addItem('Authorize Permissions', 'authorization')
  .addToUi();
	checkVersion();
	measurementConsentCheck();
}

/**
 * Checks if this is the latest version of the script and sheet.
 * If not, it prompts the user to create a new copy of the sheet
 * from Github.
 */
function checkVersion() {
  const githubCodeText = UrlFetchApp.fetch('https://raw.githubusercontent.com/google/ga4-gtm-migration/master/ga4GtmMigration.js').getContentText();
  const versionRegex = new RegExp('version = ' + 
	version.split('.').join('\\.'));
  if (!versionRegex.test(githubCodeText) && 
	!settingsSheet.getRange('B4').getValue()) {
    const response = ui.alert(
			'There is a new version of this tool available at ' + 
			'https://github.com/google/ga4-gtm-migration. Please use the latest ' + 
			'version of the tool by using the files on Github or making a copy of ' +
			'this spreadsheet: ' +
			'https://docs.google.com/spreadsheets/d/1wpmw7kkHpHzPIDC-mJS3BkSqGqf46W7E5UYpYTFilEc/')
    if (response == ui.Button.OK || response == ui.Button.CLOSE) {
      settingsSheet.getRange('B4').setValue(true);
    }
  }
}


// Pageview migration sheet ranges.
const pageviewRanges = {
  // Fields ranges for the pageview migration sheet.
  fields: {
    write: {
      row: 2,
      column: 12,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 5
    },
    read: {
      row: 2,
      column: 12,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 5
    }
  },
  // Custom definitions ranges for the pageview migration sheet.
  customDefinitions: {
    write: {
      row: 2,
      column: 18,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 6
    },
    read: {
      row: 2,
      column: 18,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 8
    }
  },
  // UA settings variable ranges for the pageview migration sheet.
  settingsVariable: {
    write: {
      row: 2,
      column: 1,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 5
    },
    read: {
      row: 2,
      column: 1,
      numRows: pageviewMigrationSheet.getLastRow(),
      numColumns: 5
    }
  },
  // UA pageview tags ranges for the pageview migration sheet.
  uaPageviewTags: {
    write: {
      row: 2, 
      column: 7, 
      numRows: 50, 
      numColumns: 4
    },
    read: {
      row: 2, 
      column: 7, 
      numRows: 50, 
      numColumns: 4
    }
  }
}

// Event migration ranges
const eventRanges = {
  // UA event tags ranges for the event migration sheet.
  eventTags: {
    write: {
      row: 2,
      column: 6,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 2
    },
    read: {
      row: 2,
      column: 6,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 6
    }
  },
  // GA4 config tag ranges for the validation sheet.
  configTags: {
    write: {
      row: 2,
      column: 5,
      numRows: validationSheet.getLastRow(),
      numColumns: 2
    },
    read: {
      row: 2,
      column: 5,
      numRows: validationSheet.getLastRow(),
      numColumns: 2
    }
  },
  // Custom definitions ranges for the event migration sheet.
  customDefinitions: {
    write: {
      row: 2,
      column: 21,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 6
    },
    read: {
      row: 2,
      column: 21,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 8
    }
  },
  // Event data (category, action, and label values) ranges for the event migration sheet.
  eventData: {
    write: {
      row: 2,
      column: 13,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 5
    },
    read: {
      row: 2,
      column: 13,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 7
    }
  },
  settingsVariable: {
    write: {
      row: 2,
      column: 1,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 3
    },
    read: {
      row: 2,
      column: 1,
      numRows: eventMigrationSheet.getLastRow(),
      numColumns: 4
    }
  }
}

// The delay in milliseconds between each write request to the GTM API.
const writeDelay = parseInt(settingsSheet.getRange('B3').getValue()) || 4000;

// Entity types as defined by the GTM API.
const analyticsVersion = {
	ga4Config: 'gaawc',
	ga4Event: 'gaawe',
	ua: 'ua'
}

const uaTagType = {
	pageview: 'TRACK_PAGEVIEW',
	event: 'TRACK_EVENT'
}

// Parameter key values as defined by the GTM API.
const paramKeyValues = {
	mid: 'measurementId',
	trackType: 'trackType'
}

// The "Migrate To" options for a given mapping.
const migrateTo = {
	config: 'Config Tag',
	allEvents: 'All Event Tags',
	singleEvent: 'Corresponding Event Tag'
}

/**
 * Makes an API call to retrieve a list of variables in a GTM container.
 * @return {?Object} The API response.
 */
function listVariables() {
  return TagManager.Accounts.Containers.Workspaces.Variables.list(gtmPath)
      .variable;
}

/**
 * Makes an API call to retrieve a list of tags in a GTM container.
 * @return {?Object} The API response.
 */
function listTags() {
  return TagManager.Accounts.Containers.Workspaces.Tags.list(gtmPath).tag;
}

/**
 * Makes an API call to retrieve a single variable in a GTM container.
 * @param {number} id The ID for a variable in the GTM container.
 * @return {?Object} A variable object.
 */
function getVariable(id) {
  return TagManager.Accounts.Containers.Workspaces.Variables.get(
      gtmPath + '/variables/' + id);
}

/**
 * Makes an API call to retrieve a single tag in a GTM container.
 * @param {number} id The ID for a tag in the GTM container.
 * @return {?Object} A tag object.
 */
function getTag(id) {
  return TagManager.Accounts.Containers.Workspaces.Tags.get(
      gtmPath + '/tags/' + id);
}

/**
 * Runs some API requests to force the script to request auth permissions.
 */
function authorization() {
  Session.getActiveUser().getEmail();
  TagManager.Accounts.list();
  SpreadsheetApp.getActive();
}

/**
 * Checks if any tag names entered by the user are the same as existing
 * tag names. If a duplicate is found, ' - GA4' is added to the end of the
 * new tag's name to avoid a duplicate name error when creating the new tag.
 * @param {string} tagName
 * @return {string}
 */
function checkForDuplicateTagName(tagName) {
  const tags = listTags();
  tags.forEach(tag => {
    if (tagName == tag.getName()) {
      tagName = tagName + ' - GA4';
      return tagName;
    }
  });
  return tagName;
}

/**
 * Identifies if a character is upper or lowercase.
 * @param {string} character
 * @return {bool}
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
 * Removes tag object properties that are not needed or will be set later,
 * creating a shell that still includes the trigger settings for a tag.
 * @param {!Object} tag The tag object to remove properties from.
 * @return {!Object} A tag object with fewer properties.
 */
function getTagSkeleton(tag) {
  delete tag.name;
  delete tag.path;
  delete tag.parameter;
  delete tag.fingerprint;
  delete tag.type;
  delete tag.tagManagerUrl;
  delete tag.workspaceId;
  delete tag.tagId;
  delete tag.accountId;
  delete tag.containerId;
  return tag;
}

/**
 * Returns any AW config tag in the container.
 * @param {string} awMeasurementId The measurement ID for config tag that a 
 * user wants to get.
 * @return {?Object} A config tag if one exists in the container, else null.
 */
function getConfigTag(awMeasurementId) {
  const allTags = listTags();
  let configTag;
  allTags.forEach(tag => {
    if (tag.type == analyticsVersion.ga4Config) {
      tag.parameter.forEach(param => {
        if (param.key == paramKeyValues.mid) {
          if (param.value == awMeasurementId) {
            configTag = tag;
          }
        }
      });
    }
  });
  return configTag;
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
 * @param {!Object} filterSettings An object with additional filter settings: 
 * analyticsType - GA4 config or event or UA, tagType - GA4 config or event or
 * UA, additionalConditions - Either sameSettingsVariable, selectedTags, or none
 * @return {?Array<?Object>}
 */
function filterTags(tags, filterSettings) {
  let filteredTags = [];
  const sheet = ss.getActiveSheet();
  let selectedSettingsVariableName = '';
  let tagIds = []
  if (filterSettings.tagType == 'TRACK_PAGEVIEW') {
    selectedSettingsVariableName = '{{' + 
    sheet.getRange(
      pageviewRanges.settingsVariable.read.row,
      pageviewRanges.settingsVariable.read.column,
      pageviewRanges.settingsVariable.read.numRows,
      pageviewRanges.settingsVariable.read.numColumns)
    .getValues().find(row => row[row.length - 1] == true)[0] +  '}}';
    tagIds = sheet.getRange(
      pageviewRanges.uaPageviewTags.read.row,
      pageviewRanges.uaPageviewTags.read.column,
      pageviewRanges.uaPageviewTags.read.numRows,
      pageviewRanges.uaPageviewTags.read.numColumns)
    .getValues().filter(row => {
      if (row[row.length - 1] !== 'Do Not Migrate' &&
      row[row.length - 1] !== '') {
        return row;
      }
    }).map(row => row[1]);
  } else if (filterSettings.tagType == 'TRACK_EVENT') {
    selectedSettingsVariableName = '{{' + 
    sheet.getRange(
      eventRanges.settingsVariable.read.row,
      eventRanges.settingsVariable.read.column,
      eventRanges.settingsVariable.read.numRows,
      eventRanges.settingsVariable.read.numColumns)
    .getValues().find(row => row[row.length - 1] == true)[0] +  '}}';
    tagIds = sheet.getRange(
    eventRanges.eventTags.read.row,
    eventRanges.eventTags.read.column,
    eventRanges.eventTags.read.numRows,
    eventRanges.eventTags.read.numColumns)
    .getValues().filter(row => row[row.length - 1] == true)
    .map(row => row[1]);
  }

  tags.forEach(tag => {
    if (tag.type == filterSettings.analyticsType) {
      if (filterSettings.analyticsType == analyticsVersion.ua) {
        const gaSettingsParam = tag.parameter.find(param => param.key == 'gaSettings');
        tag.parameter.forEach(param => {
          if (param.key == paramKeyValues.trackType) {
            if (param.value == filterSettings.tagType) {
              if (filterSettings.additionalConditions == 'sameSettingsVariable') {
                if (gaSettingsParam != undefined) {
                  if (gaSettingsParam.value == selectedSettingsVariableName) {
                    filteredTags.push(tag);
                  } 
                }
              } else if (filterSettings.additionalConditions == 'selectedTags') {
                if (tagIds.indexOf(parseInt(tag.getTagId())) != -1) { 
                  filteredTags.push(tag);
                }
              } else if (filterSettings.additionalConditions == 'none') {
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
 * Extracts the tag name and ID and returns a double array of names and IDs.
 * @param {!Array<!Object>} tags An array of tag objects.
 * @return {!Array} An array of arrays with two values, a tag name and ID.
 */
function listTagNamesAndIds(tags) {
	const tagNamesAndIds = [];
	tags.forEach(tag => {
    tagNamesAndIds.push([
			'=hyperlink("' + tag.getTagManagerUrl() + 
			'","' + tag.getName() + '")',
			tag.getTagId()
		]);
	})
  return tagNamesAndIds;
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
	}
}

/**
 * Retrieves fields from the sheet and converts them into
 * mappings that can be added to a tag or variable.
 * @param {!Object} sheet Sheet where the fields to set exist.
 * @param {!Object} range Sheet range where the fields to set exist.
 * @return {!Object} Returns an object that contains the mappings to be applied
 * to the tags or variables.
 */
function getFieldMappings(sheet, range) {
  const values =
	sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
	.getValues();

  const mappings = {
		fields: {
			configTag: [],
			allEventTags: [],
			singleEventTags: []	
		}
	};

  if (values[0][0] != '') {
    let filteredRows = removeEmptyRows(values);
		const entityIds = [];
		
    filteredRows.forEach(row => {
			const entityId = row[1];
			const fieldName = row[2];
			const fieldValue = row[3];
			const migrateToOption = row[4]
			
			if (migrateToOption == migrateTo.config) {
				mappings.fields.configTag.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.allEvents) {
				mappings.fields.allEventTags
					.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.singleEvent) {
				if (entityIds.indexOf(entityId) != -1) {
					mappings.fields.singleEventTags[entityIds.indexOf(entityId)]
					.mappings.push(buildMapObject(fieldName, fieldValue));
				} else {
					entityIds.push(entityId);
					mappings.fields.singleEventTags
					.push({
						entityId: entityId,
						mappings: [buildMapObject(fieldName, fieldValue)]
					});
				}
			}
    });
  }
	return mappings;
}

/**
 * Retrieves custom definitions from the sheet and converts them into
 * mappings that can be added to a tag or variable.
 * @param {!Object} sheet Sheet where the custom definitions to set exist.
 * @param {!Object} range Sheet range where the custom definitions to set exist.
 * @return {!Object} Returns an object that contains the mappings to be applied
 * to the tags or variables.
 */
function getCustomDefinitionMappings(sheet, range) {
  const values =
	sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
	.getValues();
	
	const mappings = {
		customDefinitions: {
			configTag: {
				user_property: [],
				parameter: []
			},
			allEventTags: {
				user_property: [],
				parameter: []
			},
			singleEventTags: []
		}
	};

  if (values[0][0] != '') {
    let filteredRows = removeEmptyRows(values);
		const entityIds = [];
		
    filteredRows.forEach(row => {
			const entityId = row[1];
			const fieldName = row[4];
			const fieldValue = row[5];
			const scope = row[6];
			const migrateToOption = row[7];

			if (migrateToOption == migrateTo.config) {
				mappings.customDefinitions.configTag[scope]
				.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.allEvents) {
				mappings.customDefinitions.allEventTags[scope]
				.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.singleEvent) {
				if (entityIds.indexOf(entityId) != -1) {
					mappings.customDefinitions
					.singleEventTags[entityIds.indexOf(entityId)][scope]
					.push(buildMapObject(fieldName, fieldValue));
				} else {
					entityIds.push(entityId);
					mappings.customDefinitions.singleEventTags
					.push({
						entityId: entityId,
						user_property: [],
						parameter: []
					})
					mappings.customDefinitions
					.singleEventTags[entityIds.indexOf(entityId)][scope]
					.push(buildMapObject(fieldName, fieldValue));
				}
			}
    });
  }
	return mappings;
}

/**
 * Adds a row to the changelog sheet to create a record of the modification that
 * was made.
 * @param {string} entityName The name of what was changed.
 * @param {string} entityType The type (trigger, tag, variable, etc.) that was changed.
 * @param {number} entityId The ID of the entity that was chagned
 * @param {string} actionTaken A brief description of how something was changed.
 * @param {string} gtmURL The URL for the entity that was changed.
 */
function logChange(entityName, entityType, entityId, actionTaken, gtmURL) {
  const date = new Date();
  const currentDateTime = 
		date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
  const user = Session.getActiveUser().getEmail();
  const loggedChange = [[
		currentDateTime, entityName, entityType, entityId, actionTaken, gtmURL, user
	]]
  changelogSheet.getRange(
		(changelogSheet.getLastRow() + 1), 1, 1, 7
	).setValues(loggedChange);
}

/**
 * Validates if a UA settings variable has been selected to be migrated.
 * @param {!Object} sheet
 * @param {!Object} range
 * @return {boolean}
 */
function validSettingsVariable(sheet, range) {
  let rows = sheet.getRange(
		range.row, range.column,
		range.numRows, range.numColumns).getValues();
  rows = rows.filter(row => row[row.length - 1]);
  if (rows.length > 0) {
    return true;
  } else {
    ui.alert('Must select UA settings variable by checking a checkbox.')
    return false;
  }
}

/**
 * Validates if a measurement ID has beeen entered.
 * @param {!Object} sheet
 * @param {!Object} range
 * @return {boolean}
 */
function validMID(sheet, range) {
  let rows = sheet.getRange(
		range.row, range.column,
		range.numRows, range.numColumns).getValues();
  rows = rows.filter(row => {
    if (row[row.length - 1] && row[3].length > 0) {
      return row;
    }
	});
  if (rows.length > 0) {
    return true;
  } else {
    ui.alert('Must enter measurement ID in column D.')
    return false;
  }
}

/**
 * Validates if all event tags that are being migrated have config tag
 * specified.
 * @param {!Object} sheet
 * @param {!Object} range
 * @return {boolean}
 */
function validConfigTag(sheet, range) {
  let rows = sheet.getRange(
    range.row, range.column,
    range.numRows, range.numColumns).getValues();
  rows = rows.filter(row => {
    if (row[4].length == 0 && row[5]) {
      return row;
    }
	});
  if (rows.length == 0) {
    return true;
  } else {
    ui.alert('All event tags being migrated must have a ' + 
		'specificied config tag.')
    return false;
  }
}

/**
 * Validates if user_property or parameter is specified for every custom
 * definition or event category, action, or label that is being migrated.
 * @param {!Object} sheet
 * @param {!Object} range
 * @return {boolean}
 */
function validCustomData(sheet, range) {
  let rows = sheet.getRange(
    range.row, range.column,
    range.numRows, range.numColumns).getValues();
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
    ui.alert('All event data and/or custom definitions must specify if ' + 
    'they will be converted to a user_property or parameter.');
    return false;
  }
}

function measurementConsentCheck() {
  let consented = settingsSheet.getRange('B2').getValue();
  if (consented != true && consented != false) {
    const response = ui.alert('Can we measure your useage of this tool to ' +
    'better understand how the tool is used and inform future development of this tool?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      settingsSheet.getRange('B2').setValue(true);
      consented = true;
    } else if (response == ui.Button.NO) {
      settingsSheet.getRange('B2').setValue(false);
      consented = false;
    }
  }
  return consented;
}

function sendGAHit(data) {
  if (measurementConsentCheck()) {
    const endpoint = 'https://www.google-analytics.com/collect';
    const payload = {
      'v': '1',
      't': 'event',
      'tid': 'UA-188567387-1',
      'cid': ss.getId(),
      'ec': data.category,
      'ea': data.action,
      'el': data.label
    };
    const options = {
      'method': 'post',
      'payload': payload
    };
    UrlFetchApp.fetch(endpoint, options);
  }
}

// Functions related to the UA settings variable and the GA4 measurement ID

/**
 * Finds all the UA settings variables in a container and writes them to a 
 * specified range and sheet.
 * @param {!Object} sheet The sheet the information will be written to.
 * @param {!Object} range The sheet range for the data to be written.
 */
function avWriteToSheet(sheet, range) {
  const variables = listVariables(); // List all variables in the container.
  const analyticsVariables = avFilter(variables);
  range.numRows = analyticsVariables.length;
  range.numColumns = 3;
  if (analyticsVariables.length > 0) {
    sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
        .setValues(analyticsVariables);
  }
}

/**
 * Filters a list of variables to return only the UA settings variables in a
 * container.
 * @param {!Object} variables A list of all variables in a container.
 * @return {!Array<?Object>} A list of UA settings variable objects.
 */
function avFilter(variables) {
	let analyticsVariables = [];
  variables.forEach(variable => {
    if (variable.type == 'gas') {
      const name = variable.name;
      let trackingId = '';
      variable.parameter.forEach(param => {
        if (param.getKey() == 'trackingId') {
          trackingId = param.getValue();
        }
      });
      const variableId = variable.getVariableId();
      analyticsVariables.push([name, trackingId, variableId]);
    }
  });
  return analyticsVariables;
}

/**
 * Gets either the UA variable ID or measurement ID from the sheet.
 * @param {!Object} sheet
 * @param {!Object} range
 * @param {string} type The GA type of the ID being requested.
 * @return {number|string}
 */
function avGetIds(sheet, range, type) {
	const rows = sheet.getRange(range.row, range.column, range.numRows,
		range.numColumns).getValues();
	let id = null;
  if (sheet.getName() == 'Pageview Migration') {
    rows.forEach(row => {
      if (row[4] && type == 'UA') {
        id = row[2];
      } else if (row[4] && type == 'GA4') {
        id = row[3];
      }
    });
  } else if (sheet.getName() == 'Event Migration') {
    rows.forEach(row => {
      if (row[3] && type == 'UA') {
        id = row[2];
      }
    });
  }
  return id;
}

// Functions related to custom definitions.

/**
 * Writes custom definitions to a sheet.
 * @param {!Object} sheet The sheet the information will be written to.
 * @param {!Object} range The sheet range for the data to be written.
 * @param {string} type Either TRACK_PAGEVIEW or TRACK_EVENT
 * custom definitions to be written to the sheet.
 */
function cdWriteToSheet(sheet, range, type) {
  let customDefinitions = [];
	let analyticsVariableId = null;

  if (type == 'TRACK_PAGEVIEW') {
    analyticsVariableId = avGetIds(
      sheet, pageviewRanges.settingsVariable.read, 'UA'
    );
  } else if (type == 'TRACK_EVENT') {
    analyticsVariableId = avGetIds(
      sheet, eventRanges.settingsVariable.read, 'UA'
    );
  }
	const analyticsVariable = getVariable(analyticsVariableId);
	
	customDefinitions = customDefinitions.concat(cdList(analyticsVariable));

  const tags = filterTags(
		listTags(),
    {
      analyticsType: analyticsVersion.ua,
      tagType: type,
      additionalConditions: 'selectedTags'
    }
	);

  tags.forEach(tag => {
    customDefinitions = customDefinitions.concat(cdList(tag));
  });
      
  range.numRows = customDefinitions.length;
  if (customDefinitions.length > 0) {
    sheet
        .getRange(range.row, range.column, range.numRows, range.numColumns)
        .setValues(customDefinitions);
  }
}

/**
 * Lists the custom definitions in a given tag or variable.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} Either an empty array or a double array of
 * custom definitions in a given tag or variable.
 */
function cdList(entity) {
  let definitions = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      const entityName = entity.name;
      const id = entity.variableId || entity.tagId;
      if (param.getKey() == 'dimension' || param.getKey() == 'metric') {
        param.getList().forEach(entity => {
          let tempArray = [];
          entity.getMap().forEach(map => {
            if (map.getKey() == 'index') {
							tempArray[0] = entityName;
              tempArray[1] = id;
              tempArray[2] = map.getValue();
            } else if (
                map.getKey() == 'dimension' || map.getKey() == 'metric') {
              tempArray[3] = map.getKey();
              tempArray[4] = '';
              tempArray[5] = map.getValue();
            }
          });
          definitions.push(tempArray);
        });
      }
    });
  }
  return definitions;
}

/**
 * Retrieves the listed custom definitions for a given entity from a sheet and
 * formats the data so that it can be added to a GA4 tag object's set of
 * parameters. The custom definitions are converted to user properties and
 * parameters.
 * @param {!Object} sheet The sheet the information will be fead from.
 * @param {!Object} range The sheet range for the data to be read from.
 * @return {!Object} The user 
 */
function cdGetFromSheet(sheet, range) {
  const content =
      sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
          .getValues();
  let userProperties = [];
  let parameters = [];
  content.forEach(row => {
    const fieldValue = row[2];
    const fieldName = row[4];
    const scope = row[5];
    if (scope == 'user property') {
      userProperties.push({
        map: [
          {value: fieldName, type: 'template', key: 'name'},
          {value: fieldValue, type: 'template', key: 'value'}
        ],
        type: 'map'
      });
    } else if (scope == 'parameter') {
      parameters.push({
        map: [
          {value: fieldName, type: 'template', key: 'name'},
          {value: fieldValue, type: 'template', key: 'value'}
        ],
        type: 'map'
      });
    }
  });
  return {userProperties: userProperties, parameters: parameters};
}

// Functions related to the 'fields to set' section of tags.

/**
 * Returns a nested array to of field name and value pairs.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} An array of arrays containing entity ID,
 *     field name, and value strings.
 */
function fieldsList(entity) {
  let fieldsToSet = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      if (param.getKey() == 'fieldsToSet') {
        param.getList().forEach(field => {
          let tempArray = [];
          field.getMap().forEach(map => {
            if (map.getKey() == 'fieldName') {
							tempArray[0] = entity.getName();
              tempArray[1] = entity.variableId || entity.tagId;
              tempArray[2] = map.getValue();
            } else if (map.getKey() == 'value') {
              tempArray[3] = map.getValue();
            }
          });
          fieldsToSet.push(tempArray);
        });
      }
    });
  }
  return fieldsToSet;
}

/**
 * Writes the fields names and values to the sheet.
 * @param {!Object} sheet
 * @param {!Array<?Array<string>>} fields The fields to be written to the sheet.
 * @param {!Object} clearRange The range of values to clear.
 * @param {!Object} contentRange The range of values that will be
 * written to the sheet.
 */
function fieldsWriteToSheet(sheet, fields, clearRange, contentRange) {
	if (fields.length > 0) {
  	const snakeCaseFieldNames = convertToSnakeCase(fields);
  	contentRange.numRows = snakeCaseFieldNames.length;
  	contentRange.numColumns = 4;
  	sheet.getRange(
			clearRange.row,
			clearRange.column,
			clearRange.numRows,
			clearRange.numColumns)
			.clearContent();
		sheet.getRange(
			contentRange.row,
			contentRange.column,
			contentRange.numRows,
			contentRange.numColumns)
	  .setValues(snakeCaseFieldNames);
	}
}

// Pageview migration functions

/**
 * Writes the UA variables in a workspace to the pageview migration sheet.
 */
function pmWriteUAVariableToSheet() {
  avWriteToSheet(pageviewMigrationSheet, pageviewRanges.settingsVariable.write);
}

/**
 * Writes the fields in the selected UA variable and all UA pageview tags to the
 * pageview migration sheet.
 */
function pmWriteFieldsToSheet() {
  if (validSettingsVariable(pageviewMigrationSheet,
		pageviewRanges.settingsVariable.read) && 
		validMID(pageviewMigrationSheet, pageviewRanges.settingsVariable.read)) {
    let fields = [];

    const analyticsVariable = getVariable(
      avGetIds(pageviewMigrationSheet, pageviewRanges.settingsVariable.read, 'UA')
    );
    fields = fields.concat(fieldsList(analyticsVariable));

    const pageviewTags = filterTags(
      listTags(),
      {
        analyticsType: analyticsVersion.ua,
        tagType: uaTagType.pageview,
        additionalConditions: 'selectedTags'
      }
    );
    
    pageviewTags.forEach(tag => {
      fields = fields.concat(fieldsList(tag));
    });
		
    fieldsWriteToSheet(
        pageviewMigrationSheet, fields, pageviewRanges.fields.write, pageviewRanges.fields.write);
  }
}

/**
 * Writes the custom definitions in the selected analytics settings variable and
 * pageview tags to the pageview migration sheet.
 */
function pmWriteCustomDefinitionsToSheet() {
  if (validSettingsVariable(pageviewMigrationSheet,
		pageviewRanges.settingsVariable.read) && 
		validMID(pageviewMigrationSheet, pageviewRanges.settingsVariable.read)) {
    cdWriteToSheet(
      pageviewMigrationSheet, pageviewRanges.customDefinitions.write, uaTagType.pageview);
  }
}

/**
 * Writes the UA pageview tags to the pageview migration sheet.
 */
function pmWriteUAPageviewToSheet() {
  if (validSettingsVariable(pageviewMigrationSheet,
		pageviewRanges.settingsVariable.read) && 
		validMID(pageviewMigrationSheet, pageviewRanges.settingsVariable.read)) {
    const tags = listTags();
    const pageviewTags = listTagNamesAndIds(
      filterTags(tags, {
        analyticsType: analyticsVersion.ua,
        tagType: uaTagType.pageview,
        additionalConditions: 'sameSettingsVariable'
      })
    );
    if (pageviewTags.length) {
      pageviewMigrationSheet
          .getRange(pageviewRanges.uaPageviewTags.write.row, pageviewRanges.uaPageviewTags.write.column, pageviewTags.length, 2)
          .setValues(pageviewTags);
    }
  }
}

/**
 * Returns an array containing tags, tag Ids, and tag names.
 * @param {!Object} sheet Sheet where the pageview tag IDs and names exist.
 * @param {!Object} range Sheet range for the pageview tags IDs and names.
 * @param {string} migrationType Either pageview or event migration.
 * @param {string} tagType The kind of pageview that will be returned.
 * @return {!Array<?Object>}
 */
function getTagsFromSheet(sheet, range, migrationType, tagType) {
  const rows = sheet.getRange(
		range.row, range.column, range.numRows, range.numColumns
	).getValues();
	const tagIds = [];
	rows.forEach(row => {
		tagIds.push(row[1]);
	});
  
	const tagData = [];
	
	const tags = listTags();
	
	tags.forEach(tag => {
		const tagIdIndex = tagIds.indexOf(parseInt(tag.getTagId()));
		if (migrationType == 'pageview' && tagIdIndex != -1) {
			if (rows[tagIdIndex][3] == tagType || tagType == 'all') {
				tagData.push({
					tagName: rows[tagIdIndex][2],
					id: rows[tagIdIndex][1], 
					tag: tag
				});
			}
		} else if (migrationType == 'event' && tagIdIndex != -1) {
			if (rows[tagIdIndex][5]) {
				tagData.push({
          id: rows[tagIdIndex][1], 
					tagName: rows[tagIdIndex][2],
					eventName: rows[tagIdIndex][3],
          configTag: rows[tagIdIndex][4],
					tag: tag
				});
			}
		}
	});
	return tagData
}

/**
 * Creates GA4 tags in the workspace based on existing universal analytics
 * tags and spreadsheet settings.
 * @param {!Object} tag The original tag to be migrated.
 * @param {string} tagType The kind of pageview tag being migrated.
 * @param {!Object} customDefinitionMappings
 * @param {!Object} fieldMappings
 */
function migratePageviewTag(
	tag,
	tagType,
	customDefinitionMappings,
	fieldMappings) {

  let skeletonPageviewTag = getTagSkeleton(tag.tag);
  skeletonPageviewTag.parameter = [];

  if (tagType == 'Config Tag') {
    const measurementId = avGetIds(
			pageviewMigrationSheet,
			pageviewRanges.settingsVariable.read,
			'GA4'
		);
		
		const fieldsToSet =	fieldMappings.configTag.concat(
			customDefinitionMappings.configTag.parameter)

    skeletonPageviewTag.type = 'gaawc';
    skeletonPageviewTag.name = checkForDuplicateTagName(tag.tagName);
	  skeletonPageviewTag.parameter.push({
			key: 'userProperties',
			type: 'list',
			list: customDefinitionMappings.configTag.user_property
		});
    skeletonPageviewTag.parameter.push({
			key: 'fieldsToSet',
			type: 'list',
			list: fieldsToSet
		});
    skeletonPageviewTag.parameter.push({
			key: 'measurementId',
			type: 'template', 
			value: measurementId
		});

  } else if (tagType == 'Event Tag') {
    const configTag = getConfigTag(
      avGetIds(pageviewMigrationSheet, pageviewRanges.settingsVariable.read, 'GA4')
    );
		// Set the tag type to GA4's event type.
    skeletonPageviewTag.type = analyticsVersion.ga4Event;
    skeletonPageviewTag.name = tag.tagName;
		// Set the event name to page_view.
    skeletonPageviewTag.parameter.push({
			key: 'eventName', 
			type: 'template', 
			value: 'page_view'
		});
		// Set the config tag for the event.
    skeletonPageviewTag.parameter.push({
			key: 'measurementId',
			type: 'tagReference',
			value: configTag.name
		});
		
		// Set custom definitions associated with all event tags.
		let parameters = [];
		parameters = parameters.concat(
			customDefinitionMappings.allEventTags.parameter
		);
		let userProperties = [];
		userProperties = userProperties.concat(
			customDefinitionMappings.allEventTags.user_property
		);
		
		// Set custom definitions from corresponding tag.
		customDefinitionMappings.singleEventTags.forEach(entity => {
			if (entity.entityId == tag.id) {
				parameters = parameters.concat(entity.parameter);
				userProperties = userProperties.concat(entity.user_property);
			}
		});
		
	  skeletonPageviewTag.parameter.push({
			key: 'userProperties',
			type: 'list',
			list: userProperties
		});
	  skeletonPageviewTag.parameter.push({
			key: 'eventParameters',
			type: 'list',
			list: parameters
		});
  }

  const newPageviewTag =
      TagManager.Accounts.Containers.Workspaces.Tags.create(
          skeletonPageviewTag, gtmPath);

  const gaData = {
    category: 'Tag Created',
    action: tagType,
    label: newPageviewTag.containerId
  };
  sendGAHit(gaData);

  logChange(
      newPageviewTag.name, newPageviewTag.type, newPageviewTag.tagId, 'Created',
      newPageviewTag.tagManagerUrl);
}

/**
 * Kicks off the pageview tag migration for the config tag.
 */
function migrateConfigTag() {
  if (validCustomData(pageviewMigrationSheet,
		pageviewRanges.customDefinitions.read)) {
    const customDefinitionMappings = getCustomDefinitionMappings(
      pageviewMigrationSheet,
      pageviewRanges.customDefinitions.read
    ).customDefinitions;

    const fieldMappings = getFieldMappings(
      pageviewMigrationSheet,
      pageviewRanges.fields.read
    ).fields;	
    
    const tags = getTagsFromSheet(
      pageviewMigrationSheet, pageviewRanges.uaPageviewTags.read, 
			'pageview', 'Config Tag'
    );
    
    tags.forEach(tag => {
      migratePageviewTag(
        tag, 'Config Tag', customDefinitionMappings, fieldMappings
      );
      Utilities.sleep(writeDelay);
    });
  }
}

/**
 * Kicks off the migration of the pageview event tags.
 */
function migratePageviewEventTags() {
  if (validCustomData(pageviewMigrationSheet, 
    pageviewRanges.customDefinitions.read)) {
    const customDefinitionMappings = getCustomDefinitionMappings(
      pageviewMigrationSheet,
      pageviewRanges.customDefinitions.read
    ).customDefinitions;

    const fieldMappings = getFieldMappings(
      pageviewMigrationSheet,
      pageviewRanges.fields.read
    ).fields;			

    const tags = getTagsFromSheet(
        pageviewMigrationSheet, pageviewRanges.uaPageviewTags.read, 'pageview', 'Event Tag'
    );
    
    tags.forEach(tag => {
      migratePageviewTag(
        tag, 'Event Tag', customDefinitionMappings, fieldMappings
      );
      Utilities.sleep(writeDelay);
    });
  }
}

// Event config tag functions.

/**
 * Writes config tag names and IDs to the validation sheet to create a drop-down
 * menu for user to select from on the event migration sheet.
 * @param {!Object} sheet The sheet to write the config tags to.
 * @param {!Object} range The write range for the sheet.
 */
function emWriteTagsToSheet(sheet, range, gaVersion, uaType) {
  const filterSettings = {
    analyticsType: gaVersion,
    tagType: uaType,
    additionalConditions: 'sameSettingsVariable'
  };
	const tags = listTagNamesAndIds(filterTags(listTags(), filterSettings));
	sheet.getRange(
		range.row, range.column, sheet.getLastRow(), range.numColumns
	).clear();
	sheet.getRange(
		range.row, range.column, tags.length, range.numColumns
	).setValues(tags);
}

/**
 * Lists the config tag names and IDs in the validation settings sheet. 
 */
function emListConfigTags() {
  emWriteTagsToSheet(
		validationSheet, eventRanges.configTags.write, analyticsVersion.ga4Config, ''
	);
}

/**
 * Lists the UA event tag names and IDs in the event migration sheet.
 */
function emListUAEventTags() {
  if (validSettingsVariable(eventMigrationSheet, eventRanges.settingsVariable.read)) {
    emWriteTagsToSheet(
      eventMigrationSheet, eventRanges.eventTags.write, analyticsVersion.ua, uaTagType.event
    );
    emListConfigTags();
  }
}

/** 
 * Writes the custom definitions for all UA event tags in a GTM container to
 * the event migration sheet.
 */
function emWriteCustomDefinitionsToSheet() {
  if (validCustomData(eventMigrationSheet, eventRanges.eventData.read)) {
    cdWriteToSheet(
      eventMigrationSheet, eventRanges.customDefinitions.write, uaTagType.event);
  }
}

/**
 * Lists the category, action, and label values in a given tag.
 * @param {!Object} entity A tag object.
 * @return {!Array<?Array<string>>} Either an empty array or a double array of
 * event data from a given tag.
 */
function uaEventDataList(entity) {
  let eventData = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      const entityName = entity.name;
      const id = entity.variableId || entity.tagId;
      if (param.getKey() == 'eventCategory' || 
      param.getKey() == 'eventAction' ||
      param.getKey() == 'eventLabel') {
        eventData.push([
          entityName,
          id,
          param.getKey(),
          '',
          param.getValue()
        ]);
      }
    });
  }
  return eventData;
}

/** 
 * Writes UA event category, action, and label data to the event migration sheet.
 */
function emWriteUAEventDataToSheet() {
  if (validConfigTag(eventMigrationSheet, eventRanges.eventTags.read)) {
    let eventData = [];
    const filterSettings = {
      analyticsType: analyticsVersion.ua,
      tagType: uaTagType.event,
      additionalConditions: 'selectedTags'
    }
    const eventTags = filterTags(listTags(), filterSettings);
    eventTags.forEach(tag => {
      eventData = eventData.concat(uaEventDataList(tag));
    });
    eventDataWriteToSheet(
        eventMigrationSheet, eventRanges.eventData.write, eventData
    );
  }
}

/**
 * Writes event category, action, and label data to a sheet.
 * @param {!Object} sheet The sheet the information will be written to.
 * @param {!Object} range The sheet range for the data to be written.
 * @param {!Array<!Array<string>>} eventData A double array listing the event 
 * data to be written to the sheet.
 */
function eventDataWriteToSheet(sheet, range, eventData) {
  range.numRows = eventData.length;
  if (eventData.length > 0) {
    sheet
        .getRange(range.row, range.column, range.numRows, range.numColumns)
        .setValues(eventData);
  }
}

/**
 * Retrieves event data from the sheet and converts them into
 * mappings that can be added to a tag.
 * @param {!Object} sheet Sheet where the fields to set exist.
 * @param {!Object} range Sheet range where the fields to set exist.
 * @return {!Object} Returns an object that contains mappings to be applied
 * to tags.
 */
function getEventDataMappings(sheet, range) {
  const values =
	sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
	.getValues();
	
	const mappings = {
		eventData: {
			allEventTags: {
				user_property: [],
				parameter: []
			},
			singleEventTags: []
		}
	};

  if (values[0][0] != '') {
    let filteredRows = removeEmptyRows(values);
		const entityIds = [];
		
    filteredRows.forEach(row => {
			const entityId = row[1];
			const fieldName = row[3];
			const fieldValue = row[4];
			const scope = row[5];
			const migrateToOption = row[6];

			if (migrateToOption == migrateTo.allEvents) {
				mappings.eventData.allEventTags[scope]
				.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.singleEvent) {
				if (entityIds.indexOf(entityId) != -1) {
					mappings.eventData
					.singleEventTags[entityIds.indexOf(entityId)][scope]
					.push(buildMapObject(fieldName, fieldValue));
				} else {
					entityIds.push(entityId);
					mappings.eventData.singleEventTags
					.push({
						entityId: entityId,
						user_property: [],
						parameter: []
					})
					mappings.eventData
					.singleEventTags[entityIds.indexOf(entityId)][scope]
					.push(buildMapObject(fieldName, fieldValue));
				}
			}
    });
  }
	return mappings;
}

/**
 * Writes the UA variables in a workspace to the event migration sheet.
 */
function emWriteUAVariableToSheet() {
  avWriteToSheet(eventMigrationSheet, eventRanges.settingsVariable.write);
}

/**
 * Creates a new GA4 tag basd on the original UA event.
 * @param {!Object} tag The tag to be migrated.
 * @param {?Object} customDefinitionMappings The custom definitions from the 
 * original tag.
 * @param {?Object} eventDataMappings The event data from the original tag.
 */
function migrateEventTag(tag, customDefinitionMappings, eventDataMappings) {
  let skeletonEventTag = getTagSkeleton(tag.tag);
  skeletonEventTag.parameter = [];
	
	// Set the tag type to GA4's event type.
  skeletonEventTag.type = analyticsVersion.ga4Event;
  skeletonEventTag.name = checkForDuplicateTagName(tag.tagName);
	
	// Set the event name to page_view.
  skeletonEventTag.parameter.push({
		key: 'eventName', 
		type: 'template', 
		value: tag.eventName
	});
	// Set the config tag for the event.
  skeletonEventTag.parameter.push({
		key: 'measurementId',
		type: 'tagReference',
		value: tag.configTag
	});
		
	// Set mappings associated with all event tags.
	let parameters = [];
	parameters = parameters.concat(
		customDefinitionMappings.allEventTags.parameter,
    eventDataMappings.allEventTags.parameter
	);
	let userProperties = [];
	userProperties = userProperties.concat(
		customDefinitionMappings.allEventTags.user_property,
    eventDataMappings.allEventTags.user_property
	);
	
	// Set mappings for corresponding tag.
	customDefinitionMappings.singleEventTags.forEach(entity => {
		if (entity.entityId == tag.id) {
			parameters = parameters.concat(entity.parameter);
			userProperties = userProperties.concat(entity.user_property);
		}
	});
  eventDataMappings.singleEventTags.forEach(entity => {
    if (entity.entityId == tag.id) {
      parameters = parameters.concat(entity.parameter);
      userProperties = userProperties.concat(entity.user_property);
    }
  });
		
	skeletonEventTag.parameter.push({
		key: 'userProperties',
		type: 'list',
		list: userProperties
	});
	skeletonEventTag.parameter.push({
		key: 'eventParameters',
		type: 'list',
		list: parameters
	});

	const newEventTag = TagManager.Accounts.Containers.Workspaces.Tags
	.create(skeletonEventTag, gtmPath);

  const gaData = {
    category: 'Tag Created',
    action: 'Event Tag',
    label: newEventTag.containerId
  };
  sendGAHit(gaData);
	
	logChange(
		newEventTag.name,
		newEventTag.type,
		newEventTag.tagId,
		'Created',
		newEventTag.tagManagerUrl
	);
}

/**
 * Kicks off the migration of the event tags.
 */
function migrateEventTags() {
  if (validCustomData(eventMigrationSheet, 
		eventRanges.customDefinitions.read)) {
    const customDefinitionMappings = getCustomDefinitionMappings(
      eventMigrationSheet,
      eventRanges.customDefinitions.read
    ).customDefinitions;

    const eventDataMappings = getEventDataMappings(
      eventMigrationSheet,
      eventRanges.eventData.read
    ).eventData;

    const tags = getTagsFromSheet(
      eventMigrationSheet, eventRanges.eventTags.read, 'event', ''
    );
    
    tags.forEach(tag => {
      migrateEventTag(tag, customDefinitionMappings, eventDataMappings);
      Utilities.sleep(writeDelay);
    });
  }
}