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

export const getAllMigrations = async () => {
    return [
        {
            id: 1,
            tenant: "Acme Company",
            bpaReportUploads: 2,
            totalExtractions: 5,
            totalIngestions: 3,
            firstExtraction: "2025-08-01",
            firstIngestion: "2025-08-02",
            lastExtraction: "2025-09-01",
            lastIngestion: "2025-09-02"
        },
        {
            id: 2,
            tenant: "Global Corp",
            bpaReportUploads: 0,
            totalExtractions: 1,
            totalIngestions: 1,
            firstExtraction: "2025-10-12",
            firstIngestion: "2025-10-13",
            lastExtraction: "2025-10-12",
            lastIngestion: "2025-10-13"
        }
    ];
};
