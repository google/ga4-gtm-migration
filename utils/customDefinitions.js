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

// Functions related to custom definitions.

/**
 * Writes the custom definitions in the selected analytics settings variable and
 * pageview tags to the pageview migration sheet.
 */
function writeCustomDefinitionsToPageviewSheet() {
  const sheetsMetaField = 'pageviewMigration';
  if (validSettingsVariable(sheetsMetaField) && validMeasurementId()) {
    writeCustomDefinitionsToSheet(
      sheetsMetaField, 'custom definitions', uaTagType.pageview);
  }
}

/**
 * Writes the custom definitions for all UA event tags in a GTM container to
 * the event migration sheet.
 */
function writeCustomDefinitionsToEventSheet() {
  if (validCustomData('eventMigration', 'custom definitions')) {
    writeCustomDefinitionsToSheet(
      'eventMigration', 'custom definitions', uaTagType.event);
  }
}

/**
 * Writes custom definitions to a sheet.
 * @param {string} sheetsMetaField
 * @param {string} rangeName
 * @param {string} type Either TRACK_PAGEVIEW or TRACK_EVENT
 */
function writeCustomDefinitionsToSheet(sheetsMetaField, rangeName, type) {
  let customDefinitions = [];
	let analyticsVariableId = null;
  let tagRangeName = '';

  if (type == 'TRACK_PAGEVIEW') {
    analyticsVariableId = getAnalyticsSettingsVariableId('pageviewMigration');
    tagRangeName = 'pageview tags';
  } else if (type == 'TRACK_EVENT') {
    analyticsVariableId = getAnalyticsSettingsVariableId('eventMigration');
    tagRangeName = 'event tags';
  }
	const analyticsVariable = getGTMResource('variables', analyticsVariableId);

	customDefinitions = customDefinitions.concat(listCustomDefinitions(analyticsVariable));

  const filteredUATags = filterUATags(
    listGTMResources('tags', getSelectedWorkspacePath()),
    analyticsVersion.ua, type, 'selectedTags', sheetsMetaField,
    tagRangeName
	);

  filteredUATags.forEach(tag => {
    customDefinitions = customDefinitions.concat(listCustomDefinitions(tag));
  });

  writeToSheet(customDefinitions, sheetsMetaField, rangeName);
}

/**
 * Lists the custom definitions in a given tag or variable.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} Either an empty array or a double array of
 * custom definitions in a given tag or variable.
 */
function listCustomDefinitions(entity) {
  let definitions = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      const entityName = entity.name;
      const id = entity.variableId || entity.tagId;
      if (param.key == 'dimension' || param.key == 'metric') {
        param.list.forEach(entity => {
          let tempArray = [];
          entity.map.forEach(map => {
            if (map.key == 'index') {
							tempArray[0] = entityName;
              tempArray[1] = id;
              tempArray[2] = map.value;
            } else if (
                map.key == 'dimension' || map.key == 'metric') {
              tempArray[3] = map.key;
              tempArray[4] = '';
              tempArray[5] = map.value;
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
 * @param {string} sheetsMetaField The sheet the information will be fead from.
 * @return {!Object} The use rproperties and parameters,
 */
function formatCustomDefinitionsFromSheet(sheetsMetaField) {
  const content = getDataFromSheet(sheetsMetaField, 'custom definitions');
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

/**
 * Retrieves custom definitions from the sheet and converts them into
 * mappings that can be added to a tag or variable.
 * @param {string} sheetsMetaField
 * @return {!Object} Returns an object that contains the mappings to be applied
 * to the tags or variables.
 */
function getCustomDefinitionMappings(sheetsMetaField) {
  const values = getDataFromSheet(sheetsMetaField, 'custom definitions');

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

  if (values.length > 0) {
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
					mappings.customDefinitions.singleEventTags.push({
						entityId: entityId,
						user_property: [],
						parameter: []
					});
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
 * Import names of resources that were marked to be migrated as either
 * parameters or user properties and lists them in the GA4 custom 
 * dimension sheet.
 */
function writeParamsAndUserPropsToGA4DimensionSheet() {
  let paramsAndUserProps = [];
  const pageviewCustomDefinitions = formatParamsAndUserPropsGA4Sheets('pageviewMigration', 'custom definitions');
  const eventData = formatParamsAndUserPropsGA4Sheets('eventMigration', 'event data');
  const eventCustomDefinitions = formatParamsAndUserPropsGA4Sheets('eventMigration', 'custom definitions')
  paramsAndUserProps = paramsAndUserProps.concat(pageviewCustomDefinitions, eventData, eventCustomDefinitions);
  writeToSheet(paramsAndUserProps, 'ga4CustomDimensions', 'values');
}

/**
 * Import names of resources that were marked to be migrated as
 * parameters and lists them in the GA4 custom metric sheet.
 */
function writeParamsToGA4MetricSheet() {
  let paramsAndUserProps = [];
  const pageviewCustomDefinitions = formatParamsAndUserPropsGA4Sheets('pageviewMigration', 'custom definitions');
  const eventData = formatParamsAndUserPropsGA4Sheets('eventMigration', 'event data');
  const eventCustomDefinitions = formatParamsAndUserPropsGA4Sheets('eventMigration', 'custom definitions')
  paramsAndUserProps = paramsAndUserProps.concat(pageviewCustomDefinitions, eventData, eventCustomDefinitions);
  paramsOnly = paramsAndUserProps.filter(value => value[1] == 'EVENT');
  writeToSheet(paramsOnly, 'ga4CustomMetrics', 'values');
}

/**
 * Formats the parameters and user properties found in a given range
 * so that the name and scope can be written GA4 custom definition sheet.
 * @param sheetsMetaField
 * @param rangeName
 * @return {!Array<?Array<string, string>>}
 */
function formatParamsAndUserPropsGA4Sheets(sheetsMetaField, rangeName) {
  const data = getDataFromSheet(sheetsMetaField, rangeName);
  return data.reduce((arr, row) => {
    if (row[row.length - 1] != 'Do Not Migrate' &&
        row[row.length - 1] != '') {
      if (row[row.length - 2] == 'parameter') {
        arr.push([row[row.length - 4], 'EVENT']);
      } else if (row[row.length - 2] == 'user_property') {
        arr.push([row[row.length - 4], 'USER']);
      }
    }
    return arr;
  }, []);
}