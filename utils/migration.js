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
 * Kicks off the pageview tag migration for the config tag.
 */
function migrateConfigTag() {
  const sheetsMetaField = 'pageviewMigration';
  if (validCustomData(sheetsMetaField, 'custom definitions')) {
    const customDefinitionMappings = 
      getCustomDefinitionMappings(sheetsMetaField).customDefinitions;

    const fieldMappings = getFieldsToSetMappings(sheetsMetaField).fields;

    const tags = formatTagsToMigrate(sheetsMetaField, 'pageview tags', 'Config Tag');

    tags.forEach(tagData => {
      migratePageviewTag(tagData, 'Config Tag', customDefinitionMappings, fieldMappings);
    });
  }
}

/**
 * Kicks off the migration of the pageview event tags.
 */
function migratePageviewEventTags() {
  const sheetsMetaField = 'pageviewMigration';
  if (validCustomData(sheetsMetaField, 'custom definitions')) {
    const customDefinitionMappings = 
      getCustomDefinitionMappings(sheetsMetaField).customDefinitions;

    const fieldMappings = getFieldsToSetMappings(sheetsMetaField).fields;

    const tags = formatTagsToMigrate(sheetsMetaField, 'pageview tags', 'Event Tag');
    tags.forEach(tagData => {
      migratePageviewTag(tagData, 'Event Tag', customDefinitionMappings, fieldMappings);
    });
  }
}

/**
 * Creates GA4 tags in the workspace based on existing universal analytics
 * tags and spreadsheet settings.
 * @param {!Object} tagData New settings and the original tag to be migrated.
 * @param {string} tagType The kind of pageview tag being migrated.
 * @param {!Object} customDefinitionMappings
 * @param {!Object} fieldMappings
 */
function migratePageviewTag(
	tagData,
	tagType,
	customDefinitionMappings,
	fieldMappings) {

  const sheetsMetaField = 'pageviewMigration';
  const measurementId = getMeasurementId(sheetsMetaField);
  let skeletonPageviewTag = formatTagSkeleton(tagData.oldTag.tag);
  skeletonPageviewTag.parameter = [];

  if (tagType == 'Config Tag') {
		const fieldsToSet =	fieldMappings.configTag.concat(
			customDefinitionMappings.configTag.parameter);

    skeletonPageviewTag.type = 'gaawc';
    skeletonPageviewTag.name = checkForDuplicateTagName(tagData.newSettings.tagName);
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
		// Set the tag type to GA4's event type.
    skeletonPageviewTag.type = analyticsVersion.ga4Event;
    skeletonPageviewTag.name = checkForDuplicateTagName(tagData.newSettings.tagName);
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
			value: tagData.newSettings.configTag
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
			if (entity.entityId == tagData.oldTag.id) {
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

  const newPageviewTag = createGTMResource('tags', getSelectedWorkspacePath(), skeletonPageviewTag);

  const gaData = {
    category: 'Tag Created',
    action: tagType,
    label: newPageviewTag.containerId
  };
  sendGAHit(gaData);

  logChange(newPageviewTag.name, newPageviewTag.type, 
    newPageviewTag.tagId, 'Created',newPageviewTag.tagManagerUrl);
}

/**
 * Kicks off the migration of the event tags.
 */
function migrateEventTags() {
  const sheetsMetaField = 'eventMigration';
  if (validCustomData(sheetsMetaField, 'custom definitions')) {
    
    const customDefinitionMappings = getCustomDefinitionMappings(sheetsMetaField).customDefinitions;

    const eventDataMappings = getEventDataMappings(sheetsMetaField).eventData;

    const tags = formatTagsToMigrate(sheetsMetaField, 'event tags');

    tags.forEach(tagData => {
      migrateEventTag(tagData, customDefinitionMappings, eventDataMappings);
    });
  }
}

/**
 * Creates a new GA4 event tag basd on the original UA event.
 * @param {!Object} tagData New settings and the original tag to be migrated.
 * @param {?Object} customDefinitionMappings The custom definitions from the
 * original tag.
 * @param {?Object} eventDataMappings The event data from the original tag.
 */
function migrateEventTag(tagData, customDefinitionMappings, eventDataMappings) {
  let skeletonEventTag = formatTagSkeleton(tagData.oldTag.tag);
  skeletonEventTag.parameter = [];

	// Set the tag type to GA4's event type.
  skeletonEventTag.type = analyticsVersion.ga4Event;
  skeletonEventTag.name = checkForDuplicateTagName(tagData.newSettings.tagName);

	// Set the event name.
  skeletonEventTag.parameter.push({
		key: 'eventName',
		type: 'template',
		value: tagData.newSettings.eventName
	});
	// Set the config tag for the event.
  skeletonEventTag.parameter.push({
		key: 'measurementId',
		type: 'tagReference',
		value: tagData.newSettings.configTag
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
		if (entity.entityId == tagData.oldTag.id) {
			parameters = parameters.concat(entity.parameter);
			userProperties = userProperties.concat(entity.user_property);
		}
	});
  eventDataMappings.singleEventTags.forEach(entity => {
    if (entity.entityId == tagData.oldTag.id) {
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
  if (tagData.newSettings.enableEcomm) {
    skeletonEventTag.parameter.push({
      key: 'sendEcommerceData',
      type: 'boolean',
      value: tagData.newSettings.enableEcomm.toString()
    });
    if (tagData.newSettings.ecommObject.length > 0) {
      if (tagData.newSettings.ecommObject == 'dataLayer') {
        skeletonEventTag.parameter.push({
          key: 'getEcommerceDataFrom',
          type: 'template',
          value: 'dataLayer'
        });
      } else {
        skeletonEventTag.parameter.push({
          key: 'ecommerceMacroData',
          type: 'template',
          value: tagData.newSettings.ecommObject
        }, {
          key: 'getEcommerceDataFrom',
          type: 'template',
          value: 'customObject'
        });
      }
    }
  }

	const newEventTag = createGTMResource('tags', getSelectedWorkspacePath(), skeletonEventTag);

  const gaData = {
    category: 'Tag Created',
    action: 'Event Tag',
    label: newEventTag.containerId
  };
  sendGAHit(gaData);

	logChange(newEventTag.name, newEventTag.type, newEventTag.tagId,
		'Created', newEventTag.tagManagerUrl);
}

/**
 * Checks if any tag names entered by the user are the same as existing
 * tag names. If a duplicate is found, ' - GA4' is added to the end of the
 * new tag's name to avoid a duplicate name error when creating the new tag.
 * @param {string} tagName
 * @return {string}
 */
function checkForDuplicateTagName(tagName) {
  const tags = listGTMResources('tags', getSelectedWorkspacePath())
  tags.forEach(tag => {
    if (tagName == tag.name) {
      tagName = tagName + ' - GA4';
      return tagName;
    }
  });
  return tagName;
}