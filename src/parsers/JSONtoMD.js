/**
 * Converts JSON data into Markdown format, including only the description field.
 * For the first item, the outline number is excluded from the header.
 * Skips any items with an outline starting with '0.'
 * @param {Array} jsonData - The JSON data to be converted.
 * @returns {string} - The generated Markdown content.
 */
export function JSONtoMD(jsonData) {
    let markdown = '';

    jsonData.forEach((item, index) => {
        // Skip items with an outline starting with '0.'
        if (item.outline.startsWith('0.')) {
            return;
        }

        // Generate header based on the 'hier' property
        const headerLevel = '#'.repeat(item.hier + 1);
        if (index === 0) {
            // Exclude outline number for the first item
            markdown += `${headerLevel} ${item.title}\n\n`;
        } else {
            markdown += `${headerLevel} ${item.outline} ${item.title}\n\n`;
        }

        // Add description only
        if (item.description) {
            markdown += `${item.description}\n\n`;
        }
    });

    return markdown;
}

/**
 * Writes the generated Markdown content to a file.
 * The file name is derived from the `filepath` in `reqtext_config.json`.
 * @param {string} markdown - The Markdown content to write.
 * @returns {Promise<void>} - A promise that resolves when the file is written.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname issue for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function writeMarkdownToFile(markdown) {
    try {
        // Read the configuration file
        const configPath = path.resolve(__dirname, '../../reqtext_config.json');
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

        // Derive the output file name
        const outputFileName = path.basename(config.filepath, '.json') + '.md';
        const outputFilePath = path.resolve(__dirname, `../../${outputFileName}`);

        // Write the Markdown content to the file
        await fs.writeFile(outputFilePath, markdown, 'utf-8');
        console.log(`Markdown file successfully written to ${outputFilePath}`);
    } catch (error) {
        console.error(`Failed to write Markdown file: ${error.message}`);
        throw error;
    }
}