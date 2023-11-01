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
  configurationVariable: {
    sheetName: 'Create Configuration Variables',
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
      name: 'parameters', 
      read: {
        row: 2,
        column: 12,
        numRows: 1,
        numColumns: 3
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 5
      }
    }]
  },
  eventVariable: {
    sheetName: 'Create Event Tag Variables',
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
      name: 'parameters',
      read: {
        row: 2,
        column: 12,
        numRows: 1,
        numColumns: 4
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 5
      }
    }]
  },
  googleTag: {
    sheetName: 'Create Google Tag',
    ranges: [{
      name: 'tag settings',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 8
      },
      write: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 7
      }
    }, {
      name: 'parameters',
      read: {
        row: 2,
        column: 15,
        numRows: 1,
        numColumns: 5
      },
      write: {
        row: 2,
        column: 10,
        numRows: 1,
        numColumns: 5
      }
    }]
  },
  eventTag: {
    sheetName: 'Create GA4 Event Tags',
    ranges: [{
      name: 'tags',
      read: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 10
      },
      write: {
        row: 2,
        column: 1,
        numRows: 1,
        numColumns: 3
      }
    }, {
      name: 'parameters',
      read: {
        row: 2,
        column: 12,
        numRows: 1,
        numColumns: 10
      },
      write: {
        row: 2,
        column: 12,
        numRows: 1,
        numColumns: 6
      }
    }]
  },
  validation: {
    sheetName: 'Validation Settings',
    ranges: [{
      name: 'gtm variables',
      read: {
        row: 2,
        column: 3,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 3,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'configuration variables',
      read: {
        row: 2,
        column: 5,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 5,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'event variables',
      read: {
        row: 2,
        column: 6,
        numRows: 1,
        numColumns: 1
      },
      write: {
        row: 2,
        column: 6,
        numRows: 1,
        numColumns: 1
      }
    }, {
      name: 'triggers',
      read: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 2
      },
      write: {
        row: 2,
        column: 7,
        numRows: 1,
        numColumns: 2
      }
    }]
  },
  settings: {
    sheetName: 'Settings',
    ranges: [{
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
  }
}