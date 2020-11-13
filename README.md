## GA4 GTM Migration

This is not an officially supported Google product.

This repository contains a script that can be used in combination with a Google Spreadsheet to migrate Universal Analytics (UA) tags in a Google Tag Manager (GTM) container. This does not modify any existing tags, triggers, or variables in the given GTM container. The migration process does not enable editing or the creation of triggers or variables and  only creates tags based on what already exists in the workspace.


## How to Setup the Script

Follow these steps to properly install the script:



1. Create a copy of [this spreadsheet](https://docs.google.com/spreadsheets/d/1wpmw7kkHpHzPIDC-mJS3BkSqGqf46W7E5UYpYTFilEc/edit?resourcekey=0-iEpABBGIT6mtfbUtfcsktA#gid=712345901)
2. Click on GA4 GTM Migration > Authorize Permissions
3. Accept the permissions request in the pop-up

The spreadsheet should now be ready to migrate UA tags to GA4.


## Migrate Pageview Tags

GA4 GTM Migration enables users to migrate UA pageview and event tags to GA4 in GTM. Users can migrate UA pageview tags to either config or “page\_view” event tag types depending on user input. This script makes the following assumption regarding pageviews:



*   An analytics settings variable exists in the GTM workspace

By following these steps, a user can translate pageview tags into either config or event tags:



1. Paste the GTM workspace URL into the GTM URL sheet
2. Click on GA4 GTM Migration > Pageview Migration > List UA Settings Variable
    *   This will list every settings variable that exists in the workspace. The user will then need to select which variable to migrate and enter the measurement ID to be used when the GA4 config tag is created.
3. Click on GA4 GTM Migration > Pageview Migration > List UA Pageview Tags
    *   This will list all UA pageview tags in the GTM workspace. The user will need to determine which tags should be migrated and if a given tag should be migrated as a config or event tag. The user can change the tag names, but the tag IDs should not be edited.
4. Click on GA4 GTM Migration > Pageview Migration > List UA Fields
    *   This will list all of the “Fields to Set” settings for all Analytics settings variables and UA pageview tags in the GTM Workspace. The user will need to determine if a given field will be migrated to a config tag, the field name, and the field value. The GA4 field name and value columns are used in the new GA4 tags during the migration process.
5. Click on GA4 GTM Migration > Pageview Migration > List Custom Definitions
    *   This will list all of the custom definitions for all Analytics settings variables and UA pageview tags in the GTM workspace. The user will need to determine if a given definition will be migrated to the config tag, all event tags, or a corresponding event tag (e.g. a dimension for UA tag 42 will be migrated only to its corresponding GA4 pageview event tag). Dimensions are equivalent to User Properties and metrics are equivalent to parameters. If a metric is set for a config tag, it will be set under the “Fields to Set” settings of the GA4 tag.
6. Click on GA4 GTM Migration > Pageview Migration > Migrate Config Tag or Migrate Event Tags to migrate pageview tags. New GA4 tags will be created in the GTM workspace.

Migration of pageview tags is complete. These tags will use the same triggers and retain many of the same advanced settings as the original UA tags. Changes can be published via the GTM UI.


## Migrate Event Tags

GA4 GTM Migration enables users to migrate UA pageview and event tags to GA4 in GTM. This script makes the following assumption regarding pageviews:



*   UA event tags exist in the selected GTM workspace
*   At least one GA4 config tag already exists in the selected GTM workspace

By following these steps, a user can translate pageview tags into either config or event tags:



1. Paste the GTM workspace URL into the GTM URL sheet
2. Click on GA4 GTM Migration > Event Migration > List UA Events
    *   This will list every UA event tag and GA4 config tag that exists in the GTM workspace. The user will then need to select which tag to migrate and select the config tag to be used when the GA4 event tag is created.
3. Click on GA4 GTM Migration > Event Migration > List Custom Definitions
    *   This will list all of the custom definitions for all UA event tags in the GTM workspace. The user will need to determine if a given definition will be migrated to the config tag, all event tags, or a corresponding event tag (e.g. a dimension for UA tag 10 will be migrated only to its corresponding GA4 event tag). Dimensions are equivalent to User Properties and metrics are equivalent to parameters.
4. Click on GA4 GTM Migration > Event Migration > Migrate Event Tags to migrate the selected UA event tags to GA4. New GA4 tags will be created in the GTM workspace.

Migration of event tags is complete. These tags will use the same triggers and retain many of the same advanced settings as the original UA tags. Changes can be published via the GTM UI.


## Logging Changes

Any change is recorded under the “Changelog” sheet. This will list links to the tags that have been created as well as the time created and name of the creator. 
