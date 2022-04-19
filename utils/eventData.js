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
 * Formats the category, action, and label values in a given tag.
 * @param {!Object} entity A tag object.
 * @return {!Array<?Array<string>>} Either an empty array or a double array of
 * event data from a given tag.
 */
function formatUAEventData(entity) {
  let eventData = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      const entityName = entity.name;
      const id = entity.variableId || entity.tagId;
      if (param.key == 'eventCategory' ||
      param.key == 'eventAction' ||
      param.key == 'eventLabel') {
        eventData.push([
          entityName,
          id,
          param.key,
          '',
          param.value
        ]);
      }
    });
  }
  return eventData;
}

/**
 * Writes UA event category, action, and label data to the event migration sheet.
 */
function writeUAEventDataToSheet() {
  if (validConfigTag()) {
    let eventData = [];
    const tags = listGTMResources('tags', getSelectedWorkspacePath());
    const filteredUATags = filterUATags(tags, analyticsVersion.ua, uaTagType.event, 'selectedTags', 'eventMigration', 'event tags');
    filteredUATags.forEach(tag => eventData = eventData.concat(formatUAEventData(tag)));
    writeToSheet(eventData, 'eventMigration', 'event data');
  }
}

/**
 * Retrieves event data from the sheet and converts them into
 * mappings that can be added to a tag.
 * @param {string} sheetsMetaField Sheet where the fields to set exist.
 * @return {!Object} Returns an object that contains mappings to be applied
 * to tags.
 */
function getEventDataMappings(sheetsMetaField) {
  const values = getDataFromSheet(sheetsMetaField, 'event data');

	const mappings = {
		eventData: {
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
					mappings.eventData.singleEventTags.push({
						entityId: entityId,
						user_property: [],
						parameter: []
					});
					mappings.eventData
					.singleEventTags[entityIds.indexOf(entityId)][scope]
					.push(buildMapObject(fieldName, fieldValue));
				}
			}
    });
  }
	return mappings;
}