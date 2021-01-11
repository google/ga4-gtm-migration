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

/**
 * Builds the menu.
 */
function onOpen() {
  const analyticsPageviewSubMenu = SpreadsheetApp.getUi()
  .createMenu('Pageview Migration')
  .addItem('List UA Settings Variables', 'pmWriteUAVariableToSheet')
  .addItem('List UA Pageview Tags', 'pmWriteUAPageviewToSheet')
  .addItem('List UA Fields', 'pmWriteFieldsToSheet')
  .addItem('List Custom Definitions', 'pmWriteCustomDefinitionsToSheet')
  .addSeparator()
  .addItem('Migrate Config Tag', 'migrateConfigTag')
  .addItem('Migrate Pageview Event Tags', 'migratePageviewEventTags')
	
  const analyticsEventSubMenu = SpreadsheetApp.getUi()
	.createMenu('Event Migration')
	.addItem('List UA Events', 'emListUAEventTags')
	.addItem('List Custom Definitions', 'emWriteCustomDefinitionsToSheet')
	.addSeparator()
	.addItem('Migrate Event Tags', 'migrateEventTags')

  SpreadsheetApp.getUi()
  .createMenu('GTM Migration')
  .addSubMenu(analyticsPageviewSubMenu)
	.addSubMenu(analyticsEventSubMenu)
	.addSeparator()
	.addItem('Authorize Permissions', 'authorization')
  .addToUi();
}

// Values will be shared across multiple functions.
const ss = SpreadsheetApp.getActive();
const settingsSheet = ss.getSheetByName('GTM URL');
const changelogSheet = ss.getSheetByName('Changelog');
const pageviewMigrationSheet = ss.getSheetByName('Pageview Migration');
const eventMigrationSheet = ss.getSheetByName('Event Migration');
const validationSheet = ss.getSheetByName('Validation Settings');

const gtmUrl = settingsSheet.getRange('B1').getValue();
const gtmPath = gtmUrl.split('#/container/')[1];

// Pageview migration sheet ranges.

// Fields range for the pageview migration sheet.
const pmFieldsRange = {
	row: 2,
	column: 11,
	numRows: pageviewMigrationSheet.getLastRow(),
	numColumns: 5
};

// Custom definitions write range for the pageview migration sheet.
const pmCustomDefinitionsWriteRange = {
  row: 2,
  column: 17,
  numRows: pageviewMigrationSheet.getLastRow(),
  numColumns: 5
};

// Custom definitions read write range for the pageview migration sheet.
const pmCustomDefinitionsReadRange = {
  row: 2,
  column: 17,
  numRows: pageviewMigrationSheet.getLastRow(),
  numColumns: 8
};

// UA settings variable range for the pageview migration sheet.
const pmSettingsVariableRange = {
  row: 2,
  column: 1,
  numRows: pageviewMigrationSheet.getLastRow(),
  numColumns: 5
};

// UA pageview tags range for the pageview migration sheet.
const pmTagRange = {
	row: 2, 
	column: 7, 
	numRows: 50, 
	numColumns: 3
}

const tagSuffix = ' - GA4';

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
 * @param {string} analyticsType GA4 config or event or UA
 * @param {string} tagType Either TRACK_PAGEVIEW or TRACK_EVENT
 * @return {?Array<?Object>}
 */
function filterTags(tags, analyticsType, tagType) {
  let filteredTags = [];
  tags.forEach(tag => {
    if (tag.type == analyticsType) {
      if (analyticsType == analyticsVersion.ua) {
        tag.parameter.forEach(param => {
          if (param.key == paramKeyValues.trackType) {
            if (param.value == tagType) {
              filteredTags.push(tag);
            } else if (param.value == tagType) {
							filteredTags.push(tag);
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
			{value: value, type: 'template', key: 'value'}
		],
		type: 'map'
	}
}

/**
 * Retrieves fields or custom definitions from the sheet and converts them into
 * mappings that can be added to a tag or variable.
 * @param {!Object} sheet Sheet where the fields to set exist.
 * @param {!Object} range Sheet range where the fields to set exist.
 * @param {string} migrationType The type (pageview or event) of migration 
 * taking place.
 * @param {string} mappingType The mapping type (fields or cds))
 * @return {!Object} Returns an object that contains the mappings to be applied
 * to the tags or variables.
 */
function getMappingsFromSheet(sheet, range, migrationType, mappingType) {
  const values =
	sheet.getRange(range.row, range.column, range.numRows, range.numColumns)
	.getValues();
	
	const mappings = {
		fields: {
			configTag: [],
			allEventTags: [],
			singleEventTags: []	
		},
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
			let fieldName = null;
			let fieldValue = row[3];
			let scope = null;
			let migrateToOption = null;
			
			if (mappingType == 'fields') {
        fieldName = row[2];
        migrateToOption = row[4];
			} else if (mappingType == 'cds') {
        fieldName = row[5];
				scope = row[6];
        migrateToOption = row[7];
			}

			if (migrateToOption == migrateTo.config && mappingType == 'fields') {
				mappings.fields.configTag.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.allEvents 
				&& mappingType == 'fields') {
				mappings.fields.allEventTags
					.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.singleEvent 
				&& mappingType == 'fields') {
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
			} else if (migrateToOption == migrateTo.config && mappingType == 'cds') {
				mappings.customDefinitions.configTag[scope]
				.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.allEvents 
				&& mappingType == 'cds') {
				mappings.customDefinitions.allEventTags[scope]
				.push(buildMapObject(fieldName, fieldValue));
			} else if (migrateToOption == migrateTo.singleEvent 
				&& mappingType == 'cds') {
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
 * @return {!Array<?Array<string>>} Either an emptry array or a double array of
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
              tempArray[3] = map.getValue();
              tempArray[4] = map.getKey();
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
 * @param {!Object<number>} clearRange The range of values to clear.
 * @param {!Object<number>} contentRange The range of values that will be
 * written to the sheet.
 */
function fieldsWriteToSheet(sheet, fields, clearRange, contentRange) {
  const snakeCaseFieldNames = convertToSnakeCase(fields);
  contentRange.numRows = snakeCaseFieldNames.length;
  contentRange.numColumns = 4;
  sheet
      .getRange(
          clearRange.row, clearRange.column, clearRange.numRows,
          clearRange.numColumns)
      .clearContent();
  sheet
      .getRange(
          contentRange.row, contentRange.column, contentRange.numRows,
          contentRange.numColumns)
      .setValues(snakeCaseFieldNames);
}

// Pageview migration functions

/**
 * Writes the UA variables in a workspace to the pageview migration sheet.
 */
function pmWriteUAVariableToSheet() {
  avWriteToSheet(pageviewMigrationSheet, pmSettingsVariableRange);
}

/**
 * Writes the fields in the selected UA variable and all UA pageview tags to the
 * pageview migration sheet.
 */
function pmWriteFieldsToSheet() {
  let fields = [];

  const analyticsVariable = getVariable(
    avGetIds(pageviewMigrationSheet, pmSettingsVariableRange, 'UA')
  );
  fields = fields.concat(fieldsList(analyticsVariable));

  const pageviewTags = filterTags(
		listTags(),
		analyticsVersion.ua,
		uaTagType.pageview
	);
	
  pageviewTags.forEach(tag => {
    fields = fields.concat(fieldsList(tag));
  });

  fieldsWriteToSheet(
      pageviewMigrationSheet, fields, pmFieldsRange, pmFieldsRange);
}

/**
 * Writes the custom definitions in the selected analytics settings variable and
 * all pageviews to the pageview migration sheet.
 */
function pmWriteCustomDefinitionsToSheet() {
  let customDefinitions = [];
	
	const analyticsVariableId = avGetIds(
		pageviewMigrationSheet, pmSettingsVariableRange, 'UA'
	);
	const analyticsVariable = getVariable(analyticsVariableId);
	
	customDefinitions = customDefinitions.concat(cdList(analyticsVariable));

  const pageviewTags = filterTags(
		listTags(), analyticsVersion.ua, uaTagType.pageview
	);
  pageviewTags.forEach(tag => {
    customDefinitions = customDefinitions.concat(cdList(tag));
  });

  cdWriteToSheet(
      pageviewMigrationSheet, pmCustomDefinitionsWriteRange, customDefinitions);
}

/**
 * Writes the UA pageview tags to the pageview migration sheet.
 */
function pmWriteUAPageviewToSheet() {
  const tags = listTags();
  const pageviewTags = listTagNamesAndIds(
		filterTags(tags, analyticsVersion.ua, uaTagType.pageview)
	);
  if (pageviewTags.length) {
    pageviewMigrationSheet
        .getRange(pmTagRange.row, pmTagRange.column, pageviewTags.length, 2)
        .setValues(pageviewTags);
  }
}

/**
 * Returns an array containing tags, tag Ids, and tag names.
 * @param {!Object} sheet Sheet where the pageview tag IDs and names exist.
 * @param {!Object} range Sheet range for the pageview tags IDs and names.
 * @param {string} workflow Either pageview or event migration.
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
			if (rows[tagIdIndex][2] == tagType || tagType == 'all') {
				tagData.push({
					tagName: rows[tagIdIndex][0],
					id: rows[tagIdIndex][1], 
					tag: tag
				});
			}
		} else if (migrationType == 'event' && tagIdIndex != -1) {
			if (rows[tagIdIndex][4]) {
				tagData.push({
					tagName: rows[tagIdIndex][2],
					id: rows[tagIdIndex][1], 
					tag: tag,
					configTag: rows[tagIdIndex][3]
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
			pmSettingsVariableRange,
			'GA4'
		);
		
		const fieldsToSet =	fieldMappings.configTag.concat(
			customDefinitionMappings.configTag.parameter)

    skeletonPageviewTag.type = 'gaawc';
    skeletonPageviewTag.name = tag.tagName + tagSuffix;
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
      avGetIds(pageviewMigrationSheet, pmSettingsVariableRange, 'GA4')
    );
		// Set the tag type to GA4's event type.
    skeletonPageviewTag.type = analyticsVersion.ga4Event;
    skeletonPageviewTag.name = tag.tagName + tagSuffix;
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
  logChange(
      newPageviewTag.name, newPageviewTag.type, newPageviewTag.tagId, 'Created',
      newPageviewTag.tagManagerUrl);
}

/**
 * Kicks off the pageview tag migration for the config tag.
 */
function migrateConfigTag() {
	const customDefinitionMappings = getMappingsFromSheet(
		pageviewMigrationSheet,
		pmCustomDefinitionsReadRange,
		'pageview',
		'cds'
	).customDefinitions;

	const fieldMappings = getMappingsFromSheet(
		pageviewMigrationSheet,
		pmFieldsRange,
		'pageview',
		'fields'
	).fields;	
	
  const tags = getTagsFromSheet(
		pageviewMigrationSheet, pmTagRange, 'pageview', 'Config Tag'
	);
	
  tags.forEach(tag => {
    migratePageviewTag(
			tag, 'Config Tag', customDefinitionMappings, fieldMappings
		);
		Utilities.sleep(200);
  });
}

/**
 * Kicks off the migration of the pageview event tags.
 */
function migratePageviewEventTags() {
	const customDefinitionMappings = getMappingsFromSheet(
		pageviewMigrationSheet,
		pmCustomDefinitionsReadRange,
		'pageview',
		'cds'
	).customDefinitions;

	const fieldMappings = getMappingsFromSheet(
		pageviewMigrationSheet,
		pmFieldsRange,
		'pageview',
		'fields'
	).fields;			

  const tags = getTagsFromSheet(
      pageviewMigrationSheet, pmTagRange, 'pageview', 'Event Tag'
	);
	
  tags.forEach(tag => {
    migratePageviewTag(
			tag, 'Event Tag', customDefinitionMappings, fieldMappings
		);
		Utilities.sleep(200);
  });
}

// Spreadsheet changelog functions.

/**
 * Adds a row to the changelog sheet to create a record of the modification that
 * was made.
 * @param {string} entityName The name of what was changed.
 * @param {string} The type (trigger, tag, variable, etc.) that was changed.
 * @param {number} The ID of the entity that was chagned
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

// Event config tag functions.

const emTagsWriteRange = {
	row: 2,
	column: 1,
	numRows: eventMigrationSheet.getLastRow(),
	numColumns: 2
}

const emTagsReadRange = {
	row: 2,
	column: 1,
	numRows: eventMigrationSheet.getLastRow(),
	numColumns: 5
}


const emConfigTagRange = {
	row: 2,
	column: 5,
	numRows: validationSheet.getLastRow(),
	numColumns: 2
}

const emCustomDefinitionsWriteRange = {
	row: 2,
	column: 7,
	numRows: eventMigrationSheet.getLastRow(),
	numColumns: 5
}

const emCustomDefinitionsReadRange = {
	row: 2,
	column: 7,
	numRows: eventMigrationSheet.getLastRow(),
	numColumns: 8
}

/**
 * Writes config tag names and IDs to the validation sheet to create a drop-down
 * menu for user to select from on the event migration sheet.
 * @param {!Object} sheet The sheet to write the config tags to.
 * @param {!Object} range The write range for the sheet.
 */
function emWriteTagsToSheet(sheet, range, gaVersion, uaType) {
	const tags = listTagNamesAndIds(filterTags(listTags(), gaVersion, uaType));
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
		validationSheet, emConfigTagRange, analyticsVersion.ga4Config, ''
	);
}

/**
 * Lists the UA event tag names and IDs in the event migration sheet.
 */
function emListUAEventTags() {
  emWriteTagsToSheet(
		eventMigrationSheet, emTagsWriteRange, analyticsVersion.ua, uaTagType.event
	);
	emListConfigTags();
}

/** 
 * Writes the custom definitions for all UA event tags in a GTM container to
 * the event migration sheet.
 */
function emWriteCustomDefinitionsToSheet() {
	let customDefinitions = [];
	
  const eventTags = filterTags(
		listTags(), analyticsVersion.ua, uaTagType.event
	);
  eventTags.forEach(tag => {
    customDefinitions = customDefinitions.concat(cdList(tag));
  });

  cdWriteToSheet(
      eventMigrationSheet, emCustomDefinitionsWriteRange, customDefinitions
	);
}

/**
 * Creates a new GA4 tag basd on the original UA event.
 * @param {!Object} tag The tag to be migrated.
 * @param {?Object} customDefinitionMappings The custom definitions from the 
 * old tag to be added to the new tag.
 */
function migrateEventTag(tag, customDefinitionMappings) {
  let skeletonEventTag = getTagSkeleton(tag.tag);
  skeletonEventTag.parameter = [];
	
	// Set the tag type to GA4's event type.
  skeletonEventTag.type = analyticsVersion.ga4Event;
  skeletonEventTag.name = tag.tagName + tagSuffix;
	
	// Set the event name to page_view.
  skeletonEventTag.parameter.push({
		key: 'eventName', 
		type: 'template', 
		value: tag.tagName
	});
	// Set the config tag for the event.
  skeletonEventTag.parameter.push({
		key: 'measurementId',
		type: 'tagReference',
		value: tag.configTag
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
	const customDefinitionMappings = getMappingsFromSheet(
		eventMigrationSheet,
		emCustomDefinitionsReadRange,
		'event',
		'cds'
	).customDefinitions;	

  const tags = getTagsFromSheet(
		eventMigrationSheet, emTagsReadRange, 'event', ''
	);
	
  tags.forEach(tag => {
		migrateEventTag(tag, customDefinitionMappings);
		Utilities.sleep(200);
	});
}