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
 * Creates a line graph showing total ingestions by month.
 */
// eslint-disable-next-line import/prefer-default-export
export function createLineGraph(migrations) {
  const container = document.createElement('div');
  container.className = 'line-graph-container';

  // Filter migrations with valid last ingestion dates
  const validMigrations = migrations.filter((m) => m.lastIngestion && m.lastIngestion > 0);

  if (validMigrations.length === 0) {
    container.innerHTML = '<p class="no-data">No ingestion data available</p>';
    return container;
  }

  // Group ingestions by month and sum total ingestions
  const monthGroups = new Map();
  validMigrations.forEach((migration) => {
    const date = new Date(migration.lastIngestion);
    // Create month key (YYYY-MM format)
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

    const totalIngestions = Number(migration.totalIngestions) || 0;
    monthGroups.set(monthKey, (monthGroups.get(monthKey) || 0) + totalIngestions);
  });

  // Convert to array and sort by month
  const dataPoints = Array.from(monthGroups.entries())
    .map(([monthKey, total]) => ({
      date: new Date(`${monthKey}-01T00:00:00Z`),
      count: total,
      monthKey,
    }))
    .sort((a, b) => a.date - b.date);

  // Graph dimensions
  const width = 800;
  const height = 300;
  const padding = {
    top: 30, right: 30, bottom: 50, left: 60,
  };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const minDate = dataPoints[0].date.getTime();
  const maxDate = dataPoints[dataPoints.length - 1].date.getTime();
  const maxCount = Math.max(...dataPoints.map((d) => d.count));

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'line-graph-svg');

  // Create title
  const title = document.createElement('h3');
  title.className = 'line-graph-title';
  title.textContent = 'Total Ingestions by Month';

  // Create grid lines
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'grid-lines');
  const ySteps = 5;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= ySteps; i++) {
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + (graphHeight * i / ySteps);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('y1', y);
    line.setAttribute('x2', padding.left + graphWidth);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-width', '1');
    gridGroup.appendChild(line);
  }
  svg.appendChild(gridGroup);

  // Create line path
  const pathData = dataPoints.map((point, index) => {
    // eslint-disable-next-line no-mixed-operators
    const x = padding.left + (point.date.getTime() - minDate) / (maxDate - minDate) * graphWidth;
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + graphHeight - (point.count / maxCount * graphHeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#3b82f6');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  // Create area under the line
  const areaData = `${pathData} L ${padding.left + graphWidth} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', areaData);
  area.setAttribute('fill', 'url(#gradient)');
  area.setAttribute('opacity', '0.2');

  // Create gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'gradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '0%');
  gradient.setAttribute('y2', '100%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#3b82f6');
  stop1.setAttribute('stop-opacity', '1');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#3b82f6');
  stop2.setAttribute('stop-opacity', '0');

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.insertBefore(defs, svg.firstChild);
  svg.insertBefore(area, path);

  // Add data points
  dataPoints.forEach((point) => {
    // eslint-disable-next-line no-mixed-operators
    const x = padding.left + (point.date.getTime() - minDate) / (maxDate - minDate) * graphWidth;
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + graphHeight - (point.count / maxCount * graphHeight);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#3b82f6');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'data-point');

    // Tooltip
    const dateStr = point.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    circle.innerHTML = `<title>${dateStr}: ${point.count.toLocaleString()} total ingestions</title>`;

    svg.appendChild(circle);
  });

  // Y-axis labels
  const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  yAxisGroup.setAttribute('class', 'y-axis');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= ySteps; i++) {
    // eslint-disable-next-line no-mixed-operators
    const value = Math.round(maxCount - (maxCount * i / ySteps));
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + (graphHeight * i / ySteps);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', padding.left - 10);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'axis-label');
    text.textContent = value;
    yAxisGroup.appendChild(text);
  }
  svg.appendChild(yAxisGroup);

  // X-axis labels (show all months or sample based on count)
  const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisGroup.setAttribute('class', 'x-axis');

  // Show all months if <= 12, otherwise show every other month
  const step = dataPoints.length <= 12 ? 1 : Math.ceil(dataPoints.length / 12);
  dataPoints.forEach((point, index) => {
    if (index % step === 0 || index === dataPoints.length - 1) {
      // eslint-disable-next-line no-mixed-operators
      const x = padding.left + (point.date.getTime() - minDate) / (maxDate - minDate) * graphWidth;
      const dateStr = point.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', height - padding.bottom + 20);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'axis-label');
      text.textContent = dateStr;
      xAxisGroup.appendChild(text);
    }
  });
  svg.appendChild(xAxisGroup);

  // Y-axis label
  const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yAxisLabel.setAttribute('x', -height / 2);
  yAxisLabel.setAttribute('y', 20);
  yAxisLabel.setAttribute('transform', 'rotate(-90)');
  yAxisLabel.setAttribute('text-anchor', 'middle');
  yAxisLabel.setAttribute('class', 'axis-title');
  yAxisLabel.textContent = 'Total Ingestions';
  svg.appendChild(yAxisLabel);

  // Assemble container
  container.appendChild(title);
  container.appendChild(svg);

  return container;
}
