const ss = SpreadsheetApp.getActive();
const settingsSheet = ss.getSheetByName('GTM URL');
const changelogSheet = ss.getSheetByName('Changelog');
const pageviewMigrationSheet = ss.getSheetByName('Pageview Migration');
// const pageviewTagSheet = ss.getSheetByName('Pageviews');
// const customDimensionsSheet = ss.getSheetByName('Dimensions');
// const customMetricsSheet = ss.getSheetByName('Metrics');

const gtmUrl = settingsSheet.getRange('B1').getValue();
const gtmPath = gtmUrl.split('#/container/')[1];

// Pageview Migration Range Constants
const pmStartColumn = {
  analyticsVariable: 1,
  tags: 7,
  fieldsToSet: 11,
  customDefinitions: 15
};