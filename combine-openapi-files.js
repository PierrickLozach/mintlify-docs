// combine-openapi.js
const fs = require('fs');
const path = require('path');
const { merge, isErrorResult } = require('openapi-merge');

const servicesDir = '../backend/lambdas';
const outputFile = 'combined.json';

// Array to store OpenAPI objects
const openapiDocs = [];

// Find all service directories
fs.readdirSync(servicesDir).forEach((serviceName) => {
  const servicePath = path.join(servicesDir, serviceName);
  if (fs.statSync(servicePath).isDirectory()) {
    const openapiFile = path.join(servicePath, 'openapi.json');
    if (fs.existsSync(openapiFile)) {
      try {
        // Read and parse the OpenAPI file
        const content = JSON.parse(fs.readFileSync(openapiFile, 'utf8'));
        console.log(`Found OpenAPI file: ${openapiFile}`);
        openapiDocs.push({
          oas: content, // This is the key - just provide the OAS document directly
        });
      } catch (err) {
        console.error(`Error reading ${openapiFile}:`, err);
      }
    }
  }
});

// Run the merge with the array directly
try {
  console.log(`Attempting to merge ${openapiDocs.length} OpenAPI files...`);

  // Pass the array directly to merge (not as a property of a config object)
  const result = merge(openapiDocs);

  if (isErrorResult(result)) {
    throw new Error(`Failed to merge: ${result.message} (${result.type})`);
  }

  // Write the merged result to the output file
  fs.writeFileSync(outputFile, JSON.stringify(result.output, null, 2));
  console.log(`Successfully created ${outputFile}`);
} catch (error) {
  console.error('Error merging OpenAPI files:', error);
}
