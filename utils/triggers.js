/**
 * Copyright 2023 Google LLC
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
 * Writes the trigger names and IDs to the validation sheet.
 */
function writeTriggersToValidationSheet() {
  const triggers = listGTMResources('triggers', getSelectedWorkspacePath());
  const triggerNames = triggers.reduce((arr, trigger) => {
    arr.push([trigger.name, trigger.triggerId]);
    return arr;
  }, []);
  triggerNames.push([
    'All Pages',
    '2147479553'
  ], [
    'Consent Initialization - All Pages',
    '2147479572'
  ], [
    'Initialization - All Pages',
    '2147479573'
  ]);
  clearRangeContent('validation', 'triggers');
  writeToSheet(triggerNames, 'validation', 'triggers');
}
