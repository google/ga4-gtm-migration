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

