## GA4 GTM Migration Tool

This is not an officially supported Google product.

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

## Logging Changes

Any change is recorded under the “Changelog” sheet. This will list links to the tags that have been created, time created, and name of the creator. 

## Settings

The write request delay can be modified in the "Settings" sheet. You can also disable chaching and find the release number for the sheet you are using in this sheet.

## FAQ

**Q:** When using the GTM variable dropdown list, I see a warning message saying “Input must fall within specified range”. Do I need to change the value I entered?

**A:** No, you should ignore that warning. You can enter any value you want where the GTM variable dropdown list is present. There is no way to turn off that warning message when you don’t choose a GTM variable from the list, so please ignore.

**Q:** Sometimes the cells and rows in my spreadsheet turn different colors when I’m entering information, what does that mean?

**A**: These are visual guides to let you know when all the necessary information has been imputed for a given migration step. 


* If a row turns green, then all the information necessary to migrate those values has been correctly entered.
* If a cell turns yellow, then information needs to be entered in that cell in order for the migration to work.
* If a cell turns purple, then that cell is technialy optional.
