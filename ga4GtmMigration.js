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
/*
 * TODO(bkuehn): Create checks to see if a sheet already exists and
 * otherwise creates necessary sheets
 */
const settingsSheet = ss.getSheetByName('GTM URL');
const changelogSheet = ss.getSheetByName('Changelog');
const pageviewMigrationSheet = ss.getSheetByName('Pageview Migration');

const gtmUrl = settingsSheet.getRange('B1').getValue();
const gtmPath = gtmUrl.split('#/container/')[1];

// Pageview migration sheet start columns.
const pmStartColumn = {
  analyticsVariable: 1,
  tags: 7,
  fieldsToSet: 11,
  customDefinitions: 15
};

// Measurement ID range values.
const measurementIdRange = {
  row: 2,
  column: pmStartColumn.analyticsVariable,
  numRows: 50,
  numColumns: 5
};

// Entity types as defined by the GTM API.
// TODO(bkuehn): List all entity types that will be used for filtering..
const entityTypes = {
	aw: 'gaawc',
	ua: 'ua'
}

// Parameter key values as defined by the GTM API.
// TODO(bkuehn): List all parameter key values that will be used for filtering.
const paramKeyValues = {
	mid: 'measurementId',
	trackType: 'trackType'
	
}

/**
 * Makes an API call to retrieve a list of variables in a GTM container.
 * @return {?Object} The API response.
 */
function listVariables() {
  return Tagmanager_v2.Accounts.Containers.Workspaces.Variables.list(gtmPath)
      .variable;
}

/**
 * Makes an API call to retrieve a list of tags in a GTM container.
 * @return {?Object} The API response.
 */
function listTags() {
  return Tagmanager_v2.Accounts.Containers.Workspaces.Tags.list(gtmPath).tag;
}

/**
 * Makes an API call to retrieve a single variable in a GTM container.
 * @param {number} id The ID for a variable in the GTM container.
 * @return {?Object} A variable object.
 */
function getVariable(id) {
  return Tagmanager_v2.Accounts.Containers.Workspaces.Variables.get(
      gtmPath + '/variables/' + id);
}

/**
 * Makes an API call to retrieve a single tag in a GTM container.
 * @param {number} id The ID for a tag in the GTM container.
 * @return {?Object} A tag object.
 */
function getTag(id) {
  return Tagmanager_v2.Accounts.Containers.Workspaces.Tags.get(
      gtmPath + '/tags/' + id);
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
    if (tag.type == entityTypes.aw) {
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
 * Writes a new row to the Changelog sheet to record a change that was made to
 * the GTM container.
 * @param {string} entityName Name of the entity that was modified.
 * @param {string} entityType The type of entity that was modified.
 * @param {number} entityId The ID of the entity that was modified.
 * @param {string} gtmURL The URL for the entity that was modified.
 */
function logChange(entityName, entityType, entityId, actionTaken, gtmURL) {
  const date = new Date();
  const currentDateTime =
      date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
  const user = Session.getActiveUser().getEmail();
  const loggedChange = [[
    currentDateTime, entityName, entityType, entityId, actionTaken, gtmURL, user
  ]];
  changelogSheet.getRange((changelogSheet.getLastRow() + 1), 1, 1, 7)
      .setValues(loggedChange);
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
 * @param {string} analyticsTagType
 * @return {?Array<?Object>}
 */
function filterUniversalAnalyticsTags(tags, analyticsTagType) {
  let filteredTags = [];
  tags.forEach(tag => {
    if (tag.type == entityTypes.ua) {
      tag.parameter.forEach(param => {
        if (param.key == paramKeyValues.trackType) {
          if (analyticsTagType == 'pageview' &&
              param.value == 'TRACK_PAGEVIEW') {
            filteredTags.push([tag.getName(), tag.getTagId()]);
            return;
          } else if (
              analyticsTagType == 'event' && param.value == 'TRACK_EVENT') {
            filteredTags.push([tag.getName(), tag.getTagId()]);
            return;
          }
        }
      });
    }
  });
  return filteredTags;
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
  // TODO(bkuehn): Add a notificaiton for when there are no UA variables
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
  rows.forEach(row => {
    if (row[4] && type == 'UA') {
      id = row[2];
    } else if (row[4] && type == 'GA4') {
    	id = row[3];
    }
  });
  return id;
}

// Functions related to custom definitions.

/**
 * Writes custom definitions to a sheet.
 * @param {!Object} sheet The sheet the information will be written to.
 * @param {!Object} range The sheet range for the data to be written.
 * @param {!Array<!Array<string>>} A double array listing the custom definitions
 * to be written to the sheet.
 */
function cdWriteToSheet(sheet, range, customDefinitions) {
  contentRange.numRows = customDefinitions.length;
  if (customDefinitions.length > 0) {
    sheet
        .getRange(range.row, range.column, range.numRows, range.numColumns)
        .setValues(customDefinitions);
  }
}

/**
 * Lists the custom definitions in a given tag or variable.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} Either an emptry array or a double array of
 * custom definitions in a given tag or variable.
 */
function cdList(entity) {
  let definitions = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      if (param.getKey() == 'dimension' || param.getKey() == 'metric') {
        param.getList().forEach(entity => {
          let tempArray = [];
          entity.getMap().forEach(map => {
            if (map.getKey() == 'index') {
              tempArray[0] = entity.id;
              tempArray[1] = map.getValue();
            } else if (
                map.getKey() == 'dimension' || map.getKey() == 'metric') {
              tempArray[2] = map.getValue();
              tempArray[3] = map.getKey();
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
		/*
		* TODO(bkuehn): Add a condition to distinguish which custom definitions
		* should be associated with which tags.
		*/
    if (scope == 'dimension') {
      userProperties.push({
        map: [
          {value: fieldName, type: 'template', key: 'name'},
          {value: fieldValue, type: 'template', key: 'value'}
        ],
        type: 'map'
      });
    } else if (scope == 'metric') {
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