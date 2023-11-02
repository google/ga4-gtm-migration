## GA4 GTM Migration Tool

This is not an officially supported Google product.

<<<<<<< HEAD
This repository contains a script that can be used in combination with a Google Spreadsheet to migrate Universal Analytics tags to Google Analytics 4 tags in the same Google Tag Manager container. This does not modify any existing tags, triggers, or variables in the given Tag Manager container. The migration process does not enable editing or the creation of triggers or variables and only creates tags based on what already exists in a given workspace.


## How to set up the script

Follow these steps to properly install the script:



1. Join [this group](https://groups.google.com/g/ga4-gtm-migration-users) to gain access to the spreadsheet.
2. Create a copy of [this spreadsheet](https://docs.google.com/spreadsheets/d/1wpmw7kkHpHzPIDC-mJS3BkSqGqf46W7E5UYpYTFilEc/edit?resourcekey=0-iEpABBGIT6mtfbUtfcsktA#gid=712345901).
3. Click **GA4 GTM Migration > Authorize Permissions**.
4. Accept the permissions request in the pop-up.

The spreadsheet is now ready to migrate Universal Analytics tags to Google Analytics 4.


## Migrate pageview tags

GA4 GTM Migration enables you to migrate Universal Analytics pageview and event tags to Google Analytics 4 in Tag Manager. You can migrate Universal Analytics pageview tags to either config or page\_view event tag types depending on user input. Steps should be followed in sequencing order.



*   This script assumes that a [Google Analytics Settings Variable](https://support.google.com/tagmanager/answer/9207621) exists in the GTM workspace, and that this variable is used to configure your Universal Analytics tags.

By following these steps, you can translate pageview tags into either config or event tags:



1. First you must select the workspace you want to migrate
    *   Click GTM Migration > GTM Workspace Selection > List GTM Accounts.
    *   Select an account.
    *   Click GTM Migration > GTM Workspace Selection > List GTM Containers.
    *   Select a container.
    *   Click GTM Migration > GTM Workspace Selection > List GTM Workspaces.
    *   Select a workspace. When you select a workspace, the workspace should turn green.
2. (Optional) If you want a dropdown list of your GTM variables when asked to input values, then click GTM Migration > (Optional) GTM Variables > Add GTM Variable Dropdown List. All variables (including built-in variables) in your workspace will be added to the validation sheet and a dropdown list will become available in various parts of the migration spreadsheet. You can either select a variable from the dropdown or enter any other value you want, so please ignore the warning message where the variable dropdown list is present.
3. Click **GTM Migration > Pageview Migration > List UA Settings Variables**. 
    *   This will list every settings variable that exists in the workspace. You then need to select which variable to migrate and enter the measurement ID to be used when the GA4 Config tag is created.
    *   Make sure to add the GA4 measurement ID and tick the box before proceeding further.
4. Click **GTM Migration > Pageview Migration > List UA Pageview Tags**.
    *   This will list the Universal Analytics pageview tags in the Tag Manager workspace that are associated with the settings variable selected in the previous step. You’ll need to determine which tags should be migrated and if a given tag should be migrated as a config or event tag. You can change the tag names, but the tag IDs should not be edited.
    *   Migrating to config tag: Do not enter anything in column J.
    *   Migrating to pageview event tag: Enter the config tag name in column J. A config tag must exist in the GTM workspace before a pageview event tag can be created.
5. Click **GTM Migration > Pageview Migration > List UA Fields**.
    *   This will list all the “Fields to Set” settings for the Universal Analytics pageview tags in the Tag Manager workspace that are being migrated. You will need to determine if a given field should be migrated to a config tag, the field name, and the field value. The Google Analytics 4 field to set name and value columns are used in the new Google Analytics 4 tags during the migration process.
6. Click **GTM Migration > Pageview Migration > List Custom Definitions**.
    *   This will list all the custom definitions for the pageview tags in the Tag Manager workspace that are being migrated. You’ll need to determine if a given definition should be migrated to the config tag, all event tags, or a corresponding event tag in Google Analytics 4 as a “user\_property” or “parameter”.
    *   If a parameter is set for a config tag, it will be set under the “Fields to Set” settings of the Google Analytics 4 tag.
7. Click on **GTM Migration > Pageview Migration > Migrate Config Tag** or **Migrate Event Tags** to migrate pageview tags. New GA4 tags will be created in the Tag Manager workspace automatically.

Migration of pageview tags is complete. These tags will use the same triggers and retain many of the same advanced settings, such as tag sequencing, as the original Universal Analytics tags. Changes can be published via the Tag Manager user interface.


## Migrate Event Tags

GA4 GTM Migration enables you to migrate Universal Analytics pageview and event tags to Google Analytics 4 in a given Tag Manager container. This script makes the following assumption regarding pageviews:



*   Universal Analytics event tags exist in the selected Tag Manager workspace
*   At least one Google Analytics 4 config tag already exists in the selected Tag Manager workspace

By following these steps, you can translate pageview tags into either config or event tags:



1. First you must select the workspace you want to migrate
    *   Click GTM Migration > GTM Workspace Selection > List GTM Accounts.
    *   Select an account.
    *   Click GTM Migration > GTM Workspace Selection > List GTM Containers.
    *   Select a container.
    *   Click GTM Migration > GTM Workspace Selection > List GTM Workspaces.
    *   Select a workspace. When you select a workspace, the workspace should turn green.
2. (Optional) If you want a dropdown list of your GTM variables when asked to input values, then click GTM Migration > (Optional) GTM Variables > Add GTM Variable Dropdown List. All variables (including built-in variables) in your workspace will be added to the validation sheet and a dropdown list will become available in various parts of the migration spreadsheet. You can either select a variable from the dropdown or enter any other value you want, so please ignore the warning message where the variable dropdown list is present.
3. Click **GA4 GTM Migration > Event Migration > List UA Settings Variables.**
    *   This will list every settings variable that exists in the workspace. You then need to select which variable to use for the migration.
4. Click **GA4 GTM Migration > Event Migration > List UA Events**.
    *   This will list all Universal Analytics event tags that use the settings variable selected in the previous step. This will also list every GA4 config tag that exists in the Tag Manager workspace. You will then need to select which tag to migrate and select the GA4 Config tag to be used when the GA4 Event tag is created.
5. Click **GA4 GTM Migration > Event Migration > List UA Event Data**
    *   This will list all the event category, action, and label values associated with the Universal Analytics events selected in the previous step. You’ll need to determine if a given category, action, or label should be migrated to all event tags or a corresponding event tag as a “user\_property” or “parameter”.
6. Click **GA4 GTM Migration > Event Migration > List Custom Definitions**.
    *   This will list all the custom definitions for the Universal Analytics event tags in the Tag Manager workspace that are being migrated. You'll need to determine if a given definition should be migrated to all event tags or a corresponding event tag as a “user\_property” or “parameter”.
7. Click **GA4 GTM Migration > Event Migration > Migrate Event Tags** to migrate the selected Universal Analytics event tags to Google Analytics 4. New Google Analytics 4 tags will be created in the Tag Manager workspace.

Migration of event tags is complete and changes can be published via the Tag Manager user interface. These tags will use the same triggers and retain many of the same advanced settings, such as tag sequencing, as the original Universal Analytics tags.

=======
This repository contains a script that can be used in combination with a Google Spreadsheet to migrate Universal Analytics tags to Google Analytics 4 tags in the same Google Tag Manager workspace. This does not modify any existing tags, triggers, or variables in the given Tag Manager workpace. The migration process does not enable editing or the creation of triggers and only creates tags and settings variables based on what already exists in a given workspace.


## How Access the Template Sheet

Follow these steps to access the template sheet so that you can properly use the script:

1. Join [this group](https://groups.google.com/g/ga4-gtm-migration-users) to gain access to the spreadsheet.
2. Create a copy of [this spreadsheet](https://docs.google.com/spreadsheets/d/1wpmw7kkHpHzPIDC-mJS3BkSqGqf46W7E5UYpYTFilEc/edit?resourcekey=0-iEpABBGIT6mtfbUtfcsktA#gid=712345901).

The spreadsheet is now ready to migrate Universal Analytics tags to Google Analytics 4. The first time you run the script, you will need to authorize the script. If you see a warning message saying the script is unverified, please click through the advanced options and continue with authorizing the script.

## Feedback

If you have feedback or notice bugs, please feel free to raise an issue in GitHub, post in the group, or submit a response to [this survey](https://docs.google.com/forms/d/e/1FAIpQLScHrZbNU2RZGMtcWTVVEsxe5ZzARFvjqFQziixNPUPCsNcUUQ/viewform). Please note that this is not an officially supported Google product, so support is not guaranteed.

## Select the GTM Workspace

First you must select the GTM workspace you want to migrate.

1. Click GTM Migration > GTM Workspace Selection > List GTM Accounts.
2. Select an account.
3. Click GTM Migration > GTM Workspace Selection > List GTM Containers.
4. Select a container.
5. Click GTM Migration > GTM Workspace Selection > List GTM Workspaces.
6. Select a workspace. When you select a workspace, the workspace should turn green.

## Create Settings Variables

The first two steps in migrating your Universal Analytics implementation to GA4 is to first create your settings variables. There are two settings variables that a GA4 implementation makes use of: the configuration settings variable, and the event settings variable.

### Create Configuration Settings Variable

The GA4 GTM Migration tool treats the configuration settings variable as roughly similar to the Universal Analytics settings variable. Therefore, the tool directs you through a process to migrate the UA settings variable into a configuration variable.

1. Navigate to the "Create Configuration Variables" sheet.
2. Click on "GTM Migration > Configuration Variable > List UA Settings Variables"
  * All of the UA settings variables in your workspace should have been listed in the "Create Configuration Variables" sheet.
3. Select the UA settings variable you want to migrate.
4. Enter the GTM configuration variable name.
5. Click on "GTM Migration > Configuration Variable > List Settings to Migrate"
  * The settings from the UA settings variable should be listed in the sheet. If no settings were listed, then nothing was set in the original Universal Settings variable.
6. Select which settings you want to migrate by checking the "Migrate?" box.
7. Enter the new GA4 config parameter names and values for those settings you want to migrate.
8. Click on "GTM Migration > Configuration Variable > Create Configuration Variable".
9. A new configuration variable should now exist within your workspace.

### Create Event Settings Variable

Settings from both the UA settings variable and UA tags will be listed to help you create event settings variables. Ideally, your GA4 event tags will all share a single GA4 event settings variable.

1. Navigate to the "Create Event Settings Variables" sheet.
2. Click on "GTM Migration > Event Setting Variable > List UA Settings Variables"
  * All of the UA settings variables in your workspace should have been listed in the "Create Event Setting Variables" sheet.
3. Select the UA settings variable you want to migrate.
4. Enter the GTM event settings variable name.
5. Click on "GTM Migration > Event Setting Variable > List Settings to Migrate"
  * The settings from the UA settings variable and the UA tags in the selected workspace should be listed in the sheet.
6. Select which settings you want to migrate by checking the "Migrate?" box.
7. Enter whether a given settings will be a parameter or user_property, the GA4 setting name, and the setting value for each setting you want to migrate.
8. Click on "GTM Migration > Event Setting Variable > Create Event Settings Variable".
9. A new event settings variable should now exist within your workspace.

## Create Google Tag

Once your settings variables have been created, you should create a Google Tag.

1. Navigate to the "Create Google Tag" sheet.
2. Enter the name for your Google Tag.
3. Enter the Google Tag Measurement ID.
4. (Optional) Enter the configuration settings variable for the Google Tag.
5. (Optional) Enter the event settings variable for the Google Tag.
6. If you want to use the recommended "Initialization - All Pages" trigger, check the box.
  * If you do not want to use the recommended trigger, leave the box unchecked and enter the triggers and exceptions for the Google Tag.
7. (Optional) Click on "GTM Migration > Google Tag > List Settings to Migrate" to list all settings associated with UA tags in your workspace.
8. (Optional) If there are any settings you want to exist in your Google Tag that are not already in the configuration or event settings variables, then check the "Migrate?" checkbox, enter the corresponding Google Tag Name, parameter type, and parameter value for each setting you want to migrate. Once again, this is only necessary if these settings do not already exist in the settings variables.
9. Click on "GTM Migration > Google Tag > Create Google Tag".
10. A new Google Tag should exist in your workspace.

## Create GA4 Event Tags

Once you have create the settings variables and the Google Tag for your workspace, you can migrate your UA tags to GA4 event tags.

1. Navigate to the "Create GA4 Event Tags" sheet.
2. Click on "GTM Migration > Event Tags > List Tags to Migrate".
  * All of the Universal Analytics tags in your workspace should now be listed in the sheet.
3. Check the "Migrate?" checkbox for any tags you want to migrate. For each tag you want to migrate, enter the following:
  * The GTM Tag Name
  * The GA4 Measurement ID. Ideally, this should match the measurement ID value that was used for the Google Tag.
  * GA4 Event Name
  * Whether or not to send ecommerce data. If ecommerce data is going to be sent, select the ecommerce object.
  * (Optional) The event settings variable.
4. (Optional) Click on "GTM Migration > Event Tags > List Settings to Migrate".
5. (Optional) If there are any settings you want to exist for a given new GA4 tag that are not already in the configuration or event settings variables, then check the "Migrate?" checkbox, enter the setting type, name, and  value for each setting you want to migrate. Once again, this is only necessary if these settings do not already exist in the settings variables or if you are not using the settings variables with your GA4 event tags. Each settings will be created in a corresponding GA4 event tag based on the original UA tag ID.
9. Click on "GTM Migration > Google Tag > Create Event Tags".
10. A new GA4 event tag will be created for each UA tag you chose to migrate. The new GA4 event tags will use the same triggers and will have the same advanced settings as the original UA tags.
>>>>>>> origin

## Logging Changes

Any change is recorded under the “Changelog” sheet. This will list links to the tags that have been created, time created, and name of the creator. 

<<<<<<< HEAD

## FAQ

**Q**: Why does Field to Set appear as ‘Invalid:Input must fall into the specified range’?

**A**: It means that there is currently no equivalent field to set within Google Analytics 4. You can add any Field to Set value that you want, but arbitrary values are not supported.

**Q**: What happens if my Universal Analytics and Google Analytics 4 tags have the same names?

**A**: Multiple tags cannot have the same name in Tag Manager. If the tool detects that a Google Analytics 4 tag has the same name as an existing tag in the Tag Manager workspace, then the tool will automatically append “ - GA4” to the end of the Google Analytics 4 tag name.

=======
## Settings

The write request delay can be modified in the "Settings" sheet. You can also disable chaching and find the release number for the sheet you are using in this sheet.

## FAQ

>>>>>>> origin
**Q:** When using the GTM variable dropdown list, I see a warning message saying “Input must fall within specified range”. Do I need to change the value I entered?

**A:** No, you should ignore that warning. You can enter any value you want where the GTM variable dropdown list is present. There is no way to turn off that warning message when you don’t choose a GTM variable from the list, so please ignore.

**Q:** Sometimes the cells and rows in my spreadsheet turn different colors when I’m entering information, what does that mean?

**A**: These are visual guides to let you know when all the necessary information has been imputed for a given migration step. 


<<<<<<< HEAD

*   If a row turns green, then all the information necessary to migrate those values has been correctly entered.
*    If a cell turns yellow, then that row has been marked for migration, but that cell still needs information entered or else the migration won’t work correctly.
*   If a cell turns red, then a critical ID has been removed for a row that has been marked for migration and you should probably re-list the information.
*   If a row turns gray, then the row has been marked as “Do Not Migrate” and can be left alone.



## Feedback

If you have feedback or notice bugs, please feel free to raise an issue in GitHub, post in the group, or submit a response to [this survey](https://docs.google.com/forms/d/e/1FAIpQLScHrZbNU2RZGMtcWTVVEsxe5ZzARFvjqFQziixNPUPCsNcUUQ/viewform). Please note that this is not an officially supported Google product, so support is not guaranteed.
=======
* If a row turns green, then all the information necessary to migrate those values has been correctly entered.
* If a cell turns yellow, then information needs to be entered in that cell in order for the migration to work.
* If a cell turns purple, then that cell is technialy optional.
>>>>>>> origin
