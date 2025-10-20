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

import { getAllMigrations } from './api.js';
import { MigrationsTable } from './migrationsTable.js';
import { ELEMENT_IDS } from './constants.js';

const migrationsTable = new MigrationsTable();

/**
 * AEM Cloud Service Migrations Tracker Application
 * Simplified main application controller
 */
class MigrationsApp {
  constructor() {
    this.migrations = [];
    this.filteredMigrations = [];
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Load the migration table as soon as the app initializes
    // Don't ignore the promise; handle errors globally if needed
    this.startMigrationSearch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled error in startMigrationSearch:', error);
    });
    this.setupEventListeners();
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
      this.filteredMigrations = this.migrations.filter(migration => 
        migration.tenant && migration.tenant.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    migrationsTable.initTable(this.filteredMigrations);
    migrationsTable.enableSorting();
  }

  /**
   * Start the migration search and display process
   */
  async startMigrationSearch() {
    try {
      // Show loading state
      migrationsTable.initTable([]);
      migrationsTable.enableSorting();
      // Fetch migrations
      this.migrations = await getAllMigrations();
      // Sort tenants alphabetically for predictable loading
      this.migrations.sort((a, b) => a.tenant.localeCompare(b.tenant));
      // Initialize filtered migrations
      this.filteredMigrations = [...this.migrations];
      // Initialize table with migrations
      migrationsTable.initTable(this.filteredMigrations);
      migrationsTable.enableSorting();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in migration search:', error);
      const container = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
      if (container) {
        container.innerHTML = `<p class="error">Failed to load migration data.</p>`;
      }
    }
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MigrationsApp());
} else {
  // eslint-disable-next-line no-new
  new MigrationsApp();
}
