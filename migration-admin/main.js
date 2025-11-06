/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  getCustomerMigrationInfo,
} from './api.js';
import MigrationsTable from './migrationsTable.js';
import { ELEMENT_IDS } from './constants.js';
import { DateRange } from './DateRange.js';
import getUserProfile from './userProfile.js';
import { createLineGraph, createTotalIngestionsGraph } from './lineGraph.js';

const migrationsTable = new MigrationsTable();

/**
* AEM Cloud Service Migrations Reporter Application
* Simplified main application controller
*/
class MigrationsApp {
  constructor() {
    this.userProfile = null;
    this.migrations = [];
    this.filteredMigrations = [];
    this.isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    try {
      this.setupUserProfile();
      this.setupEventListeners();
      MigrationsApp.setupSidekickLogout();

      // Don't load data automatically - wait for user to search
    } catch (error) {
      // Error already handled in setupUserProfile (alert shown, UI disabled)
      // eslint-disable-next-line no-console
      console.error('Initialization failed:', error.message);
    }
  }

  /**
   * Setup user profile for localhost development
   */
  setupUserProfile() {
    if (this.isLocalhost) {
      const params = new URLSearchParams(window.location.search);
      const email = params.get('email');
      const name = params.get('name');

      if (email && name) {
        this.userProfile = { email, name };
      } else {
        // Alert and prevent user from continuing if params are missing
        // eslint-disable-next-line no-alert
        alert('Email and name parameters are required for localhost development.\n\nPlease add them to the URL:\n?email=you@adobe.com&name=YourFullName');

        // Disable the UI
        this.disableUI();

        // Throw error to prevent further initialization
        throw new Error('Missing required URL parameters: email and name');
      }
    }
  }

  /**
   * Disable the UI when validation fails
   */
  // eslint-disable-next-line class-methods-use-this
  disableUI() {
    // Disable search input
    const customerSearch = document.getElementById(ELEMENT_IDS.CUSTOMER_SEARCH);
    if (customerSearch) {
      customerSearch.disabled = true;
    }

    // Disable search button
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.disabled = true;
    }

    // Show error message in the container
    const container = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
    if (container) {
      container.innerHTML = '<p class="error">Access denied. Please add email and name parameters to the URL.</p>';
    }
  }

  /**
   * Setup AEM sidekick logout functionality
   */
  static setupSidekickLogout() {
    const doLogout = () => window.location.reload();

    const sk = document.querySelector('aem-sidekick');
    if (sk) {
      sk.addEventListener('logged-out', doLogout);
    } else {
      document.addEventListener('sidekick-ready', () => {
        document.querySelector('aem-sidekick')?.addEventListener('logged-out', doLogout);
      }, { once: true });
    }
  }

  /**
   * Ensure user profile is available
   */
  async ensureUserProfile() {
    if (!this.userProfile) {
      try {
        this.userProfile = await getUserProfile();
      } catch (error) {
        const container = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
        if (container) {
          container.innerHTML = '<p class="error">You are not logged in. Please log in to view migration data.</p>';
        }
        const loginError = new Error('User not logged in');
        loginError.originalError = error;
        throw loginError;
      }
    }

    // Check if user profile is still null after attempting to get it
    if (!this.userProfile) {
      const container = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
      if (container) {
        container.innerHTML = this.isLocalhost
          ? '<p class="error">You are not logged in. Please add ?email=you@adobe.com&name=YourFullName to the URL</p>'
          : '<p class="error">You are not logged in. Please log in via AEM Sidekick to view migration data.</p>';
      }
      throw new Error('User not logged in');
    }
  }

  /**
   * Set up event listeners for search and filters
   */
  setupEventListeners() {
    const searchButton = document.getElementById('search-button');
    const customerSearch = document.getElementById(ELEMENT_IDS.CUSTOMER_SEARCH);

    // Handle search button click - always load fresh data
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.startMigrationSearch().catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Unhandled error in startMigrationSearch:', error);
        });
      });
    }

    // Handle customer search input - filter locally with spinner
    if (customerSearch) {
      customerSearch.addEventListener('input', () => {
        this.handleCustomerSearchFilter();
      });
    }

    // Listen for Enter key press anywhere on the page - always load fresh data
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.startMigrationSearch().catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Unhandled error in startMigrationSearch:', error);
        });
      }
    });
  }

  /**
   * Filter migrations based on customer search
   * @param {string} searchTerm - The search term for customer name
   */
  filterMigrations(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowerSearchTerm) {
      this.filteredMigrations = [...this.migrations];
    } else {
      // eslint-disable-next-line max-len
      this.filteredMigrations = this.migrations.filter((migration) => migration.customerName && migration.customerName.toLowerCase().includes(lowerSearchTerm));
    }

    migrationsTable.initTable(this.filteredMigrations);
    migrationsTable.enableSorting();
  }

  /**
   * Handle customer search filter with spinner
   */
  handleCustomerSearchFilter() {
    const spinner = document.getElementById('loading-spinner');
    const customerSearch = document.getElementById(ELEMENT_IDS.CUSTOMER_SEARCH);

    if (!customerSearch) return;

    // Show spinner and set loading state
    document.body.classList.add('loading');
    if (spinner) spinner.classList.remove('hidden');

    // Use requestAnimationFrame to ensure DOM updates are applied before filtering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const searchTerm = customerSearch.value;
        this.filterMigrations(searchTerm);

        // Update summary stats based on filtered results
        const totalIngestions = this.computeIngestionStats(this.filteredMigrations);
        this.renderIngestionsCount(totalIngestions);

        // Hide spinner and remove loading state
        document.body.classList.remove('loading');
        if (spinner) spinner.classList.add('hidden');
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  computeIngestionStats(migrations) {
    let total = 0;
    let failed = 0;

    migrations.forEach((m) => {
      const t = Number(m.totalIngestions);
      const f = Number(m.failedIngestions);
      if (Number.isFinite(t)) total += t;
      if (Number.isFinite(f)) failed += f;
    });

    const successful = total - failed;
    const customers = migrations.length;

    return {
      customers, total, successful, failed,
    };
  }

  /**
   * Start the migration search and display process
   */
  async startMigrationSearch() {
    const spinner = document.getElementById('loading-spinner');
    const graphWrapper = document.getElementById('line-graph-wrapper');

    try {
      // Ensure user profile is available
      await this.ensureUserProfile();

      // Show spinner, set loading state, and clear old graphs
      document.body.classList.add('loading');
      if (spinner) spinner.classList.remove('hidden');
      if (graphWrapper) graphWrapper.innerHTML = ''; // Clear previous graphs

      // Show loading state for the table
      migrationsTable.initTable([]);
      migrationsTable.enableSorting();

      // Fetch customer migration data
      const dateRangeSelect = document.getElementById('date-range-select');
      const selectedRange = dateRangeSelect ? dateRangeSelect.value : 'LAST_MONTH';

      const resp = await getCustomerMigrationInfo(selectedRange);

      let body;

      if (typeof Response !== 'undefined' && resp instanceof Response) {
        try {
          body = await resp.json();
        } catch (e) {
          body = null;
        }
      } else if (Array.isArray(resp)) {
        body = resp;
      } else {
        body = resp;
      }

      // Normalize migrations array
      if (Array.isArray(body)) {
        this.migrations = body;
      } else {
        this.migrations = [];
      }

      // Sort customer Names alphabetically for predictable loading
      this.migrations.sort((a, b) => a.customerName.localeCompare(b.customerName));

      // Apply customer search filter
      const customerSearch = document.getElementById(ELEMENT_IDS.CUSTOMER_SEARCH);
      const searchTerm = customerSearch ? customerSearch.value : '';
      this.filterMigrations(searchTerm);

      // Update the table header
      const totalIngestionsHeader = document.getElementById('total-ingestions-header');
      if (totalIngestionsHeader) {
        totalIngestionsHeader.textContent = `Total Ingestions (${DateRange[selectedRange].label})`;
      }

      const totalIngestions = this.computeIngestionStats(this.filteredMigrations);
      this.renderIngestionsCount(totalIngestions);

      // Render line graph with all migrations (not filtered by customer search)
      this.renderLineGraph(this.migrations, selectedRange);
    } catch (error) {
      if (error.message === 'User not logged in') return;

      const errorContainer = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
      if (errorContainer) {
        errorContainer.innerHTML = '<p class="error">Failed to load migration data.</p>';
      }
    } finally {
      // Hide spinner and remove loading state
      document.body.classList.remove('loading');
      if (spinner) spinner.classList.add('hidden');
    }
  }

  /**
   * Render total ingestions count in the table-summary
   */
  // eslint-disable-next-line class-methods-use-this
  renderIngestionsCount(stats) {
    const summaryWrapper = document.querySelector('.table-summary-wrapper');
    if (!summaryWrapper) return;

    summaryWrapper.innerHTML = '';

    const {
      customers, total, successful, failed,
    } = stats;

    const summary = document.createElement('div');
    summary.className = 'table-summary';
    summary.innerHTML = `
    <span class="summary-label">Customers:</span>
    <span class="summary-value">${(customers || 0).toLocaleString()}</span>
    <span class="summary-separator">|</span>
    <span class="summary-label">Total Ingestions:</span>
    <span class="summary-value">${(total || 0).toLocaleString()}</span>
    <span class="summary-separator">|</span>
    <span class="summary-label success">Successful:</span>
    <span class="summary-value success">${(successful || 0).toLocaleString()}</span>
    <span class="summary-separator">|</span>
    <span class="summary-label failed">Failed:</span>
    <span class="summary-value failed">${(failed || 0).toLocaleString()}</span>
  `;

    summaryWrapper.appendChild(summary);
  }

  /**
   * Render line graph showing last ingestions over time
   */
  // eslint-disable-next-line class-methods-use-this
  renderLineGraph(migrations, dateRange) {
    const graphWrapper = document.getElementById('line-graph-wrapper');
    if (!graphWrapper) return;

    graphWrapper.innerHTML = '';

    // Create total ingestions graph
    const ingestionsGraph = createTotalIngestionsGraph(migrations, dateRange);
    graphWrapper.appendChild(ingestionsGraph);

    // Create customers graph
    const customersGraph = createLineGraph(migrations, dateRange);
    graphWrapper.appendChild(customersGraph);
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MigrationsApp());
} else {
  // eslint-disable-next-line no-new
  new MigrationsApp();
}
