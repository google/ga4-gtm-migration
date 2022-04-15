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
  const sheet = ss.getSheetByName('Changelog');
  const currentDateTime = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
  const user = Session.getActiveUser().getEmail();
  const loggedChange = [[
		currentDateTime, entityName, entityType, entityId, actionTaken, gtmURL, user
	]];
  sheet.getRange((sheet.getLastRow() + 1), 1, 1, 7).setValues(loggedChange);
}
