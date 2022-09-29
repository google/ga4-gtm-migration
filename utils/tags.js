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
 * Extracts the tag name and ID and returns a double array of names and IDs.
 * @param {!Array<!Object>} tags An array of tag objects.
 * @return {!Array} An array of arrays with two values, a tag name and ID.
 */
function formatTagNamesAndIds(tags) {
	const tagNamesAndIds = [];
	tags.forEach(tag => {
    tagNamesAndIds.push([
			'=hyperlink("' + tag.tagManagerUrl +
			'","' + tag.name + '")',
			tag.tagId
		]);
	});
  return tagNamesAndIds;
}

/**
 * Writes the UA pageview tags to the pageview migration sheet.
 */
function writeUAPageviewTagsToSheet() {
  const sheetsMetaField = 'pageviewMigration';
  if (validSettingsVariable(sheetsMetaField) && validMeasurementId()) {
    const tags = listGTMResources('tags', getSelectedWorkspacePath());
    const pageviewTags = formatTagNamesAndIds(
      filterUATags(tags, analyticsVersion.ua, uaTagType.pageview,
        'sameSettingsVariable', sheetsMetaField, 'pageview tags'));
    writeToSheet(pageviewTags, sheetsMetaField, 'pageview tags');
    writeConfigTagsToSheet();
  }
}

/**
 * Filter a list of tags to only return config tag types.
 * @param {!Object} tags
 */
function filterConfigTags(tags) {
  return tags.filter(tag => tag.type == analyticsVersion.ga4Config);
}

/**
 * Writes the UA event tag names and IDs to the event migration sheet. Also 
 * writes config tag names and IDs to the validation sheet via writeConfigTagsToSheet().
 */
function writeEventAndConfigTagsToSheet() {
  const sheetsMetaField = 'eventMigration';
  if (validSettingsVariable(sheetsMetaField)) {
    const tags = listGTMResources('tags', getSelectedWorkspacePath());
    const filteredUATags = filterUATags(tags, analyticsVersion.ua, uaTagType.event, 'sameSettingsVariable', sheetsMetaField, 'event tags');
    const formatedEventTagNamesAndIds = formatTagNamesAndIds(filteredUATags);
    writeToSheet(formatedEventTagNamesAndIds, sheetsMetaField, 'event tags');
    writeConfigTagsToSheet();
  }
}

/**
 * Writes config tag names and IDs to the validation sheet.
 */
function writeConfigTagsToSheet() {
  const tags = listGTMResources('tags', getSelectedWorkspacePath());
  const filteredConfigTags = filterConfigTags(tags);
  const formatedConfigTagNamesAndIds = formatTagNamesAndIds(filteredConfigTags);
  clearRangeContent('validation', 'config tags');
  writeToSheet(formatedConfigTagNamesAndIds, 'validation', 'config tags');
}

/**
 * Returns an array containing tags, tag Ids, and tag names.
 * @param {string} sheetsMetaField
 * @param {string} rangeName 
 * @param {string} tagType The kind of pageview that will be returned.
 * @return {!Array<?Object>}
 */
function formatTagsToMigrate(sheetsMetaField, rangeName, tagType) {
  const rows = getDataFromSheet(sheetsMetaField, rangeName);
	const tagIds = [];
	rows.forEach(row => {
		tagIds.push(row[1]);
	});

	const tagData = [];

	const tags = listGTMResources('tags', getSelectedWorkspacePath());

	tags.forEach(tag => {
		const tagIdIndex = tagIds.indexOf(parseInt(tag.tagId));
		if (sheetsMetaField == 'pageviewMigration' && tagIdIndex != -1) {
			if (rows[tagIdIndex][rows[tagIdIndex].length-1] == tagType || tagType == 'all') {
				tagData.push({
          newSettings: {
            tagName: rows[tagIdIndex][2],
            configTag: rows[tagIdIndex][3]
          },
          oldTag: {
            tag: tag,
            id: rows[tagIdIndex][1]
          }
				});
			}
		} else if (sheetsMetaField == 'eventMigration' && tagIdIndex != -1) {
			if (rows[tagIdIndex][7]) {
				tagData.push({
          newSettings: {
            tagName: rows[tagIdIndex][2],
            eventName: rows[tagIdIndex][3],
            enableEcomm: rows[tagIdIndex][4],
            ecommObject: rows[tagIdIndex][5],
            configTag: rows[tagIdIndex][6]
          },
          oldTag: {
            tag: tag,
            id: rows[tagIdIndex][1]
          }
				});
			}
		}
	});
	return tagData;
}

/**
 * Removes tag object properties that are not needed or will be set later,
 * creating a shell that still includes the trigger settings for a tag.
 * @param {!Object} tag The tag object to remove properties from.
 * @return {!Object} A tag object with fewer properties.
 */
function formatTagSkeleton(tag) {
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