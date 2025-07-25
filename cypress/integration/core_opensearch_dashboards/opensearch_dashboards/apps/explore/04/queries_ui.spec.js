/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  INDEX_WITH_TIME_1,
  INDEX_PATTERN_WITH_TIME_1,
  DATASOURCE_NAME,
} from '../../../../../../utils/constants';
import {
  getRandomizedWorkspaceName,
  generateBaseConfiguration,
  generateAllTestConfigurations,
} from '../../../../../../utils/apps/explore/shared';
import {
  generateQueryTestConfigurations,
  LanguageConfigs,
} from '../../../../../../utils/apps/explore/queries';
import { prepareTestSuite } from '../../../../../../utils/helpers';

const workspaceName = getRandomizedWorkspaceName();

export const runQueryTests = () => {
  describe('discover autocomplete tests', () => {
    before(() => {
      cy.osd.setupWorkspaceAndDataSourceWithIndices(workspaceName, [INDEX_WITH_TIME_1]);
      cy.createWorkspaceIndexPatterns({
        workspaceName: workspaceName,
        indexPattern: INDEX_WITH_TIME_1,
        timefieldName: 'timestamp',
        dataSource: DATASOURCE_NAME,
        isEnhancement: true,
      });
    });

    beforeEach(() => {
      cy.osd.navigateToWorkSpaceSpecificPage({
        workspaceName: workspaceName,
        page: 'explore/logs',
        isEnhancement: true,
      });
    });

    after(() => {
      cy.osd.cleanupWorkspaceAndDataSourceAndIndices(workspaceName, [INDEX_WITH_TIME_1]);
    });

    generateQueryTestConfigurations(generateBaseConfiguration, {
      languageConfig: LanguageConfigs.SQL_PPL,
    }).forEach((config) => {
      describe(`${config.testName}`, () => {
        // TODO: This is no longer relevant in explore, but should we test the auto-resize capability?
        it.skip('should handle query editor expand/collapse state correctly', () => {
          // Setup
          cy.setDataset(config.dataset, DATASOURCE_NAME, config.datasetType);

          // First check the default expanded state
          cy.getElementByTestId('osdQueryEditor__multiLine').should('be.visible');
          // Verify expanded state
          cy.getElementByTestId('osdQueryEditor__multiLine').should('be.visible');
          cy.getElementByTestId('osdQueryEditor__singleLine').should('not.exist');

          // Verify expanded state persists
          cy.getElementByTestId('osdQueryEditor__multiLine').should('be.visible');
          cy.getElementByTestId('osdQueryEditor__singleLine').should('not.exist');

          // Collapse and verify
          cy.getElementByTestId('osdQueryEditorLanguageToggle').click(); // collapse
          cy.getElementByTestId('osdQueryEditor__multiLine').should('not.exist');
          cy.getElementByTestId('osdQueryEditor__singleLine').should('be.visible');

          cy.getElementByTestId('osdQueryEditor__multiLine').should('not.exist');
          cy.getElementByTestId('osdQueryEditor__singleLine').should('be.visible');
        });
      });
    });

    generateAllTestConfigurations(generateBaseConfiguration, {
      indexPattern: INDEX_PATTERN_WITH_TIME_1,
      index: INDEX_WITH_TIME_1,
    }).forEach((config) => {
      describe(`${config.testName}`, () => {
        it('should show correct documentation link in language reference popover', () => {
          cy.explore.setDataset(config.dataset, DATASOURCE_NAME, config.datasetType);
          // First get the version from help menu
          cy.get('button[aria-label="Help menu"]').click();
          cy.get('.chrHeaderHelpMenu__version')
            .invoke('text')
            .then((versionText) => {
              // Close help menu
              cy.get('button[aria-label="Help menu"]').click();

              // Extract version number and determine docs version
              const version = versionText.replace('v ', '').trim();
              let docsVersion;

              // FIXME: using version to decide docsVersion is fragile, each time the version bumped, the test needs to updated accordingly
              if (version === '3.1.0') {
                docsVersion = 'latest';
              } else {
                const [major, minor, patch] = version.split('.');
                // Validate version numbers
                if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
                  throw new Error(`Invalid version format: ${version}`);
                }
                if (major === '0') {
                  throw new Error(`Major version cannot be 0: ${version}`);
                }
                if (minor === '0') {
                  throw new Error(`Minor version cannot be 0: ${version}`);
                }
                // Include patch version if it's not 0
                docsVersion = patch === '0' ? `${major}.${minor}` : `${major}.${minor}.${patch}`;
              }

              // Now proceed with language reference check
              cy.get('body').then(($body) => {
                const isPopoverOpen = $body.find('.euiPopover__panel-isOpen').length > 0;

                // If popover is already open, close it first
                if (isPopoverOpen) {
                  cy.getElementByTestId('exploreSelectedLanguage').click();
                  // Verify it's closed
                  cy.get('.euiPopover__panel-isOpen').should('not.exist');
                }

                // Now click to open
                cy.getElementByTestId('exploreSelectedLanguage').click();

                // Verify popover appears with title
                cy.get('.euiPopoverTitle').contains('Syntax options').should('be.visible');

                cy.get('.euiPopover__panel-isOpen')
                  .find('a.euiLink.euiLink--primary')
                  .should('have.attr', 'href')
                  .then((href) => {
                    const expectedHref = `https://opensearch.org/docs/${docsVersion}/search-plugins/sql/ppl/syntax/`;
                    expect(href).to.equal(expectedHref);
                  });
              });
            });
        });
      });
    });
  });
};

prepareTestSuite('Queries UI', runQueryTests);
