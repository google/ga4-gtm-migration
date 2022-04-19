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

// Functions related to the 'fields to set' section of tags.

/**
 * Writes the fields in the selected UA variable and all UA pageview tags to the
 * pageview migration sheet.
 */
function writeFieldsToSetToPageviewSheet() {
  const sheetsMetaField = 'pageviewMigration';
  if (validSettingsVariable(sheetsMetaField) && validMeasurementId()) {
    let fields = [];

    const analyticSettingsVariableId = getAnalyticsSettingsVariableId(sheetsMetaField);
    const analyticsSettingsVariable = getGTMResource('variables', analyticSettingsVariableId);
    fields = fields.concat(formatFieldsToSet(analyticsSettingsVariable));

    const pageviewTags = filterUATags(
      listGTMResources('tags', getSelectedWorkspacePath()),
      analyticsVersion.ua, uaTagType.pageview,
      'selectedTags', sheetsMetaField, 'fields to set'
    );

    pageviewTags.forEach(tag => fields = fields.concat(formatFieldsToSet(tag)));

    const snakeCaseFieldNames = convertToSnakeCase(fields);
    writeToSheet(snakeCaseFieldNames, sheetsMetaField, 'fields to set');
  }
}

/**
 * Returns a nested array to of field name and value pairs.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} An array of arrays containing entity ID,
 * field name, and value strings.
 */
function formatFieldsToSet(entity) {
  let fieldsToSet = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      if (param.key == 'fieldsToSet') {
        param.list.forEach(field => {
          let tempArray = [];
          field.map.forEach(map => {
            if (map.key == 'fieldName') {
							tempArray[0] = entity.name;
              tempArray[1] = entity.variableId || entity.tagId;
              tempArray[2] = map.value;
            } else if (map.key == 'value') {
              tempArray[3] = map.value;
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
 * Retrieves fields from the sheet and converts them into
 * mappings that can be added to a tag or variable.
 * @param {string} sheetsMetaField
 * @return {!Object} Returns an object that contains the mappings to be applied
 * to the tags or variables.
 */
function getFieldsToSetMappings(sheetsMetaField) {
  const values = getDataFromSheet(sheetsMetaField, 'fields to set')

  const mappings = {
		fields: {
			configTag: [],
			allEventTags: [],
			singleEventTags: []
		}
	};

  if (values.length > 0) {
    let filteredRows = removeEmptyRows(values);
		const entityIds = [];

    filteredRows.forEach(row => {
			const entityId = row[1];
			const fieldName = row[2];
			const fieldValue = row[3];
			const migrateToOption = row[4];

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