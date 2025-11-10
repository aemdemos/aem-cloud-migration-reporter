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

/**
 * Generic function to create a bar graph with day ranges on X-axis
 * @param {Object} config - Configuration object
 * @param {Array} config.migrations - Array of migration data
 * @param {string} config.title - Graph title
 * @param {string} config.yAxisLabel - Y-axis label
 * @param {string} config.xAxisLabel - X-axis label
 * @param {string} config.barColor - Bar color (hex)
 * @param {Function} config.calculateData - Function to calculate bar data from migrations
 * @returns {HTMLElement} - The graph container element
 */
function createBarGraph(config) {
  const {
    migrations, title, barColor, calculateData,
  } = config;

  const container = document.createElement('div');
  container.className = 'graph-container';

  // Calculate data based on provided function
  const { dataPoints, maxCount, totalUniqueCustomers } = calculateData(migrations);

  if (dataPoints.length === 0) {
    container.innerHTML = '<p class="no-data">No ingestion data available</p>';
    return container;
  }

  // Graph dimensions
  const width = 800;
  const height = 300;
  const padding = {
    top: 50, right: 30, bottom: 50, left: 60,
  };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'graph-svg');

  // Create title
  const titleElement = document.createElement('h3');
  titleElement.className = 'graph-title';
  titleElement.textContent = title;

  // Create grid lines
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'grid-lines');
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i += 1) {
    const y = padding.top + ((graphHeight * i) / ySteps);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(padding.left));
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', String(padding.left + graphWidth));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-width', '1');
    gridGroup.appendChild(line);
  }
  svg.appendChild(gridGroup);

  // Calculate grand total
  // For customer graphs, use totalUniqueCustomers; for ingestions, sum the bars
  const grandTotal = totalUniqueCustomers !== undefined
    ? totalUniqueCustomers
    : dataPoints.reduce((sum, dp) => sum + dp.count, 0);

  // Bars
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'].slice().reverse();
  const reversedDataPoints = dataPoints.slice().reverse();
  const barWidth = (graphWidth / dayRanges.length) * 0.8;
  const barSpacing = (graphWidth / dayRanges.length) * 0.2;

  reversedDataPoints.forEach((point, index) => {
    const x = padding.left + ((index * graphWidth) / dayRanges.length) + (barSpacing / 2);
    const barHeight = ((point.count / maxCount) * graphHeight);
    const y = padding.top + graphHeight - barHeight;

    // Calculate color intensity based on value (gradient effect)
    const intensity = maxCount > 0 ? point.count / maxCount : 0;
    let gradientColor;
    if (barColor === '#3b82f6') {
      // Blue gradient for customers graph
      gradientColor = `rgba(59, 130, 246, ${0.4 + (intensity * 0.6)})`;
    } else {
      // Green gradient for ingestions graph
      gradientColor = `rgba(16, 185, 129, ${0.4 + (intensity * 0.6)})`;
    }

    // Bar rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(barWidth));
    rect.setAttribute('height', String(barHeight));
    rect.setAttribute('fill', gradientColor);
    rect.setAttribute('rx', '4');
    rect.setAttribute('class', 'data-bar');
    rect.innerHTML = `<title>${point.tooltip}</title>`;
    svg.appendChild(rect);

    // Calculate percentage
    const percentage = grandTotal > 0 ? ((point.count / grandTotal) * 100).toFixed(1) : 0;

    // Label above each bar with count and percentage
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(x + barWidth / 2));
    label.setAttribute('y', String(y - 5));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'bar-label');
    label.textContent = `${point.count.toLocaleString()} (${percentage}%)`;
    svg.appendChild(label);
  });

  // Grand total text above graph
  const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  totalText.setAttribute('x', String(padding.left + graphWidth / 2));
  totalText.setAttribute('y', String(padding.top - 20));
  totalText.setAttribute('text-anchor', 'middle');
  totalText.setAttribute('class', 'grand-total');
  totalText.textContent = `Total: ${grandTotal.toLocaleString()}`;
  svg.appendChild(totalText);

  // Y-axis labels
  const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  yAxisGroup.setAttribute('class', 'y-axis');
  for (let i = 0; i <= ySteps; i += 1) {
    const value = Math.round(maxCount - ((maxCount * i) / ySteps));
    const y = padding.top + ((graphHeight * i) / ySteps);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(padding.left - 10));
    text.setAttribute('y', String(y + 5));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'axis-label');
    text.textContent = String(value);
    yAxisGroup.appendChild(text);
  }
  svg.appendChild(yAxisGroup);

  // X-axis labels with actual dates
  const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisGroup.setAttribute('class', 'x-axis');

  // Helper function to format date range labels
  const formatDateRange = (rangeStr) => {
    const now = new Date();
    const [start, end] = rangeStr.split('-').map(Number);

    // Label "1-10" represents daysAgo 0-9 (positions 1-10 in sequence)
    // So we need to subtract 1 to get actual daysAgo values
    const oldestDaysAgo = end - 1; // e.g., "1-10" → 10-1 = 9 days ago
    const newestDaysAgo = start - 1; // e.g., "1-10" → 1-1 = 0 (today)

    // Calculate actual dates
    const startDate = new Date(now.getTime() - (oldestDaysAgo * 24 * 60 * 60 * 1000));
    const endDate = new Date(now.getTime() - (newestDaysAgo * 24 * 60 * 60 * 1000));

    const formatDate = (date) => {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    const startFormatted = formatDate(startDate);
    const endFormatted = formatDate(endDate);

    // If same month, show "Nov 1-10", otherwise "Oct 31-Nov 5"
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}`;
    }
    return `${startFormatted}-${endFormatted}`;
  };

  dayRanges.forEach((range, index) => {
    const rangeWidth = graphWidth / dayRanges.length;
    const x = padding.left + ((index * graphWidth) / dayRanges.length) + (rangeWidth / 2);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(height - padding.bottom + 20));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'axis-label');
    text.textContent = formatDateRange(range);
    xAxisGroup.appendChild(text);
  });
  svg.appendChild(xAxisGroup);

  // Y-axis label
  const yAxisLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yAxisLabelText.setAttribute('x', String(-height / 2));
  yAxisLabelText.setAttribute('y', String(15));
  yAxisLabelText.setAttribute('transform', 'rotate(-90)');
  yAxisLabelText.setAttribute('text-anchor', 'middle');
  yAxisLabelText.setAttribute('class', 'axis-title');
  yAxisLabelText.textContent = config.yAxisLabel;
  svg.appendChild(yAxisLabelText);

  // X-axis label
  const xAxisLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xAxisLabelText.setAttribute('x', String(padding.left + graphWidth / 2));
  xAxisLabelText.setAttribute('y', String(height - 5));
  xAxisLabelText.setAttribute('text-anchor', 'middle');
  xAxisLabelText.setAttribute('class', 'axis-title');
  xAxisLabelText.textContent = config.xAxisLabel;
  svg.appendChild(xAxisLabelText);

  container.appendChild(titleElement);
  container.appendChild(svg);
  return container;
}

/**
 * Creates a bar graph showing customers running migrations.
 */
export function createCustomersGraph(migrations) {
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  return createBarGraph({
    migrations,
    title: 'Customers Running Ingestions - Last 60 Days',
    yAxisLabel: 'Number of Customers',
    xAxisLabel: 'Date Range',
    barColor: '#3b82f6',
    calculateData: (migs) => {
      const now = Date.now();

      // Filter migrations with ingestionStartDates
      const validMigrations = migs.filter(
        (m) => m.ingestionStartDates && Array.isArray(m.ingestionStartDates),
      );

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Count unique customers per day range
      const customersPerRange = {
        '1-10': new Set(),
        '11-20': new Set(),
        '21-30': new Set(),
        '31-40': new Set(),
        '41-50': new Set(),
        '51-60': new Set(),
      };

      validMigrations.forEach((migration) => {
        migration.ingestionStartDates.forEach((timestamp) => {
          // Include all ingestions
          const daysAgo = Math.floor((now - timestamp) / (86400000));
          if (daysAgo >= 0) {
            if (daysAgo >= 0 && daysAgo < 10) {
              customersPerRange['1-10'].add(migration.customerName);
            } else if (daysAgo >= 10 && daysAgo < 20) {
              customersPerRange['11-20'].add(migration.customerName);
            } else if (daysAgo >= 20 && daysAgo < 30) {
              customersPerRange['21-30'].add(migration.customerName);
            } else if (daysAgo >= 30 && daysAgo < 40) {
              customersPerRange['31-40'].add(migration.customerName);
            } else if (daysAgo >= 40 && daysAgo < 50) {
              customersPerRange['41-50'].add(migration.customerName);
            } else if (daysAgo >= 50) {
              customersPerRange['51-60'].add(migration.customerName);
            }
          }
        });
      });

      // Convert Sets to counts and create data points
      const rangeCounts = {};
      dayRanges.forEach((range) => {
        rangeCounts[range] = customersPerRange[range].size;
      });

      const maxCount = Math.max(...Object.values(rangeCounts));

      // Calculate total unique customers across all ranges
      const allUniqueCustomers = new Set();
      Object.values(customersPerRange).forEach((customerSet) => {
        customerSet.forEach((customer) => allUniqueCustomers.add(customer));
      });
      const totalUniqueCustomers = allUniqueCustomers.size;

      // Create distributed data
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(rangeCounts[range]),
        tooltip: `${range} days ago: ${rangeCounts[range].toLocaleString()} unique customers`,
      }));

      return {
        dataPoints: distributedData,
        maxCount: maxCount || 1,
        totalUniqueCustomers,
      };
    },
  });
}

/**
 * Creates a bar graph showing number of ingestions.
 */
export function createIngestionsGraph(migrations) {
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  return createBarGraph({
    migrations,
    title: 'Ingestion Activity - Last 60 Days',
    yAxisLabel: 'Number of Ingestions',
    xAxisLabel: 'Date Range',
    barColor: '#10b981',
    calculateData: (migs) => {
      const now = Date.now();

      // Filter migrations with ingestionStartDates
      const validMigrations = migs.filter(
        (m) => m.ingestionStartDates && Array.isArray(m.ingestionStartDates),
      );

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Initialize counts for each day range
      const rangeCounts = {
        '1-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51-60': 0,
      };

      // Count ingestions per day range
      validMigrations.forEach((migration) => {
        migration.ingestionStartDates.forEach((timestamp) => {
          // Include all ingestions
          if (timestamp <= now) {
            const daysAgo = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));

            if (daysAgo >= 0 && daysAgo <= 9) {
              rangeCounts['1-10'] += 1;
            } else if (daysAgo >= 10 && daysAgo <= 19) {
              rangeCounts['11-20'] += 1;
            } else if (daysAgo >= 20 && daysAgo <= 29) {
              rangeCounts['21-30'] += 1;
            } else if (daysAgo >= 30 && daysAgo <= 39) {
              rangeCounts['31-40'] += 1;
            } else if (daysAgo >= 40 && daysAgo <= 49) {
              rangeCounts['41-50'] += 1;
            } else if (daysAgo >= 50) {
              rangeCounts['51-60'] += 1;
            }
          }
        });
      });

      const maxCount = Math.max(...Object.values(rangeCounts));

      // Create distributed data
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(rangeCounts[range]),
        tooltip: `${range} days ago: ${rangeCounts[range].toLocaleString()} ingestions`,
      }));

      return { dataPoints: distributedData, maxCount: maxCount || 1 };
    },
  });
}
