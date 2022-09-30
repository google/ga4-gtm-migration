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

const sheetsMeta = {
  gtmWorkspace: {
    sheetName: 'GTM Workspace',
    ranges: [{
      name: 'accounts list',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 3
      },
      write : {
        row: 2,
        column: 1,
        numRow: 1,
        numColumns: 2
      }
    }, {
      name: 'containers list',
      read: {
        row: 2,
        column: 4,
        numRows: 1,
        numColumns: 3
      },
      write : {
        row: 2,
        column: 4,
        numRow: 1,
        numColumns: 2
      }
    }, {
      name: 'workspaces list',
      read: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 3
      },
      write : {
        row: 2,
        column: 7,
        numRow: 1,
        numColumns: 2
      }
    }]
  },
  pageviewMigration: {
    sheetName: 'Pageview Migration',
    ranges: [{
      name: 'settings variable',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 5
      },
      write: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 3
      }
    }, {
      name: 'pageview tags', 
      read: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 5
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 2
      }
    }, {
      name: 'custom definitions',
      read: {
        row: 2,
        column: 19,
        numRows: 1,
        numColumns: 8
      },
      write: {
        row: 2,
        column: 19,
        numRows: 1,
        numColumns: 6
      }
    }, {
      name: 'fields to set',
      read: {
        row: 2,
        column: 13,
        numRows: 1,
        numColumns: 5
      },
      write: {
        row: 2,
        column: 13,
        numRows: 1,
        numColumns: 4
      }
    }, {
      name: 'variables list - ua settings variable',
      read: {
        row: 2,
        column: 4,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 4,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'variables list - fields to set',
      read: {
        row: 2,
        column: 16,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 16,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'variables list - custom definitions',
      read: {
        row: 2,
        column: 24,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 24,
        numRows: 1,
        numColumns: 1
      }
    }]
  },
  eventMigration: {
    sheetName: 'Event Migration',
    ranges: [{
      name: 'settings variable',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 4
      },
      write: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 3
      }
    }, {
      name: 'event tags',
      read: {
        row: 2,
        column: 6,
        numRows: 1,
        numColumns: 8
      },
      write: {
        row: 2,
        column: 6,
        numRows: 1,
        numColumns: 2
      }
    }, {
      name: 'event data',
      read: {
        row: 2,
        column: 15,
        numRows: 1,
        numColumns: 7
      },
      write: {
        row: 2,
        column: 15,
        numRows: 1,
        numColumns: 5
      }
    }, {
      name: 'custom definitions',
      read: {
        row: 2,
        column: 23,
        numRows: 1,
        numColumns: 8
      },
      write: {
        row: 2,
        column: 23,
        numRows: 1,
        numColumns: 6
      }
    }, {
      name: 'variables list - event name',
      read: {
        row: 2,
        column: 9,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 9,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'variables list - event data',
      read: {
        row: 2,
        column: 19,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 19,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'variables list - custom definitions',
      read: {
        row: 2,
        column: 28,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 28,
        numRows: 1,
        numColumns: 1
      }
    }]
  },
  validation: {
    sheetName: 'Validation Settings',
    ranges: [{
      name: 'config tags',
      read: {
        row: 2,
        column: 5,
        numRows: 1,
        numColumns: 2
      },
      write: {
        row: 2,
        column: 5,
        numRows: 1,
        numColumns: 2
      }
    }, {
      name: 'gtm variables',
      read: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 1
      }
    }]
  },
  settings: {
    sheetName: 'Settings',
    ranges: [{
      name: 'consent',
      read: {
        row: 2,
        column: 2,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 2,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'request delay',
      read: {
        row: 3,
        column: 2,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 3,
        column: 2,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'dismissed update',
      read: {
        row: 4,
        column: 2,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 4,
        column: 2,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'caching',
      read: {
        row: 5,
        column: 2,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 5,
        column: 2,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'release',
      read: {
        row: 6,
        column: 2,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 6,
        column: 2,
        numRows: 1,
        numColumns: 1
      }
    }]
  },
  ga4CustomDimensions: {
    sheetName: 'GA4 Custom Dimensions',
    ranges: [{
      name: 'values',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 13
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 2 
      }
    }]
  },
  ga4CustomMetrics: {
    sheetName: 'GA4 Custom Metrics',
    ranges: [{
      name: 'values',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 13
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 2 
      }
    }]
  }
}