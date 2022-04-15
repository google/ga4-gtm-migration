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
 * Writes GTM variables to the validation sheet.
 */
function writeGTMVariablesToValidationSheet() {
  const variables = listGTMResources('variables', getSelectedWorkspacePath());
  let formattedVariables = formatGTMVariablesToNamesArray(variables);
  const builtInVariables = listGTMResources('builtInVariables', getSelectedWorkspacePath());
  formattedVariables = formattedVariables.concat(formatGTMVariablesToNamesArray(builtInVariables));
  clearRangeContent('validation', 'gtm variables');
  writeToSheet(formattedVariables, 'validation', 'gtm variables');
  let range = {};
  sheetsMeta.validation.ranges.forEach(r => {
    if (r.name == 'gtm variables') {
      range = r.read;
    }
  });
  const validationSheet = ss.getSheetByName(sheetsMeta.validation.sheetName);
  const ruleRange = validationSheet.getRange(range.row, range.column, validationSheet.getLastRow(), range.numColumns);
  const rule = SpreadsheetApp.newDataValidation().requireValueInRange(ruleRange, true).build();
  setGTMVariablesValidation('pageviewMigration', rule);
  setGTMVariablesValidation('eventMigration', rule);
}

/**
 * Sets the validations rules for the GTM variables dropdown to various
 * ranges in the Pageview Migration and Event Migration sheets.
 * @param {string} sheetsMetaField The field name to be referenced in the sheetsMeta object.
 * @param {!Object} rule The validation rule to be applied to a range.
 */
function setGTMVariablesValidation(sheetsMetaField, rule) {
  const sheet = ss.getSheetByName(sheetsMeta[sheetsMetaField].sheetName);
  let range = {};
  sheetsMeta[sheetsMetaField].ranges.forEach(r => {
    if (/variables list/.test(r.name)) {
      range = r.write;
      const sheetRange = sheet.getRange(range.row, range.column, sheet.getLastRow(), range.numColumns);
      sheetRange.setDataValidation(rule);
    }
  });
}

/**
 * Changes an array of variable objects into a double array of variable names.
 * Double curly brackets are added to the begginning and end of each variable
 * name to mimic how it appears in Tag Manager.
 * @param {!Object} variables
 * @return {!Array<!Array<string>>} A double array of variable names.
 */
function formatGTMVariablesToNamesArray(variables) {
  return variables.reduce((arr, variable) => {
    arr.push(['{{' + variable.name + '}}']);
    return arr;
  }, []);
}