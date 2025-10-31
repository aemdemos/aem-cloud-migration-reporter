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

import { getLast30DaysIngestions } from './api.js';
import MigrationsTable from './migrationsTable.js';
import { ELEMENT_IDS } from './constants.js';
import getUserProfile from './userProfile.js';
import { summarizeIngestions } from './utils.js';

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
    this.ingestions = [];
    this.filteredIngestions = [];
    this.isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupUserProfile();
    this.setupEventListeners();
    MigrationsApp.setupSidekickLogout();

    // Load the migration table as soon as the app initializes
    // Don't ignore the promise; handle errors globally if needed
    this.startMigrationSearch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled error in startMigrationSearch:', error);
    });
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
      }
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
    const customerSearch = document.getElementById(ELEMENT_IDS.CUSTOMER_SEARCH);
    if (customerSearch) {
      customerSearch.addEventListener('input', (e) => {
        this.filterMigrations(e.target.value);
      });
    }
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
   * Start the migration search and display process
   */
  async startMigrationSearch() {
    try {
      // Ensure user profile is available
      await this.ensureUserProfile();

      // Show loading state
      migrationsTable.initTable([]);
      migrationsTable.enableSorting();

      // Fetch ingestions
      const resp = await getLast30DaysIngestions();

      let headers = null;
      let body;

      if (typeof Response !== 'undefined' && resp instanceof Response) {
        headers = resp.headers;
        try {
          body = await resp.json();
        } catch (e) {
          body = null;
        }
      } else if (Array.isArray(resp)) {
        // previous shape: api returned the array directly
        body = resp;
      } else {
        body = resp;
      }

      // Normalize ingestions array
      if (Array.isArray(body)) {
        this.ingestions = body;
      } else if (body && Array.isArray(body.ingestions)) {
        this.ingestions = body.ingestions;
      } else {
        this.ingestions = [];
      }

      // Extract total from header
      let totalHeader = null;
      if (headers) {
        if (typeof headers.get === 'function') {
          totalHeader = headers.get('X-Ingestions-Count');
        } else {
          const key = Object.keys(headers).find((k) => k.toLowerCase() === 'x-ingestions-count');
          totalHeader = key ? headers[key] : undefined;
        }
      }
      const total = totalHeader ? parseInt(totalHeader, 10) : this.ingestions.length;

      // 🔹 Summarize the ingestions by customer
      const summarized = summarizeIngestions(this.ingestions);

      // Sort customer Names alphabetically for predictable loading
      summarized.sort((a, b) => a.customerName.localeCompare(b.customerName));

      // Initialize filtered ingestions
      this.filteredIngestions = [...summarized];

      // Initialize table with migrations (this creates the table-summary-wrapper)
      migrationsTable.initTable(this.filteredIngestions);
      migrationsTable.enableSorting();

      // Render the ingestions count after the wrapper is created
      this.renderIngestionsCount(Number.isNaN(total) ? 0 : total);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in ingestion search:', error);
      // Check if error is due to user not being logged in
      // If so, the login message is already displayed by ensureUserProfile()
      if (error.message === 'User not logged in') {
        return; // Don't override the login message
      }
      // For other errors, show generic error message
      const container = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
      if (container) {
        container.innerHTML = '<p class="error">Failed to load migration data.</p>';
      }
    }
  }

  /**
   * Render total ingestions count in the table-summary
   */
  // eslint-disable-next-line class-methods-use-this
  renderIngestionsCount(total) {
    // Find the table-summary-wrapper
    const summaryWrapper = document.querySelector('.table-summary-wrapper');
    if (!summaryWrapper) return;

    // Clear and create the summary content
    summaryWrapper.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'table-summary';
    summary.innerHTML = `
      <span class="summary-label">Ingestions (Last 30 Days):</span>
      <span class="summary-value">${Number.isFinite(total) ? total : 0}</span>
    `;

    summaryWrapper.appendChild(summary);
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MigrationsApp());
} else {
  // eslint-disable-next-line no-new
  new MigrationsApp();
}
