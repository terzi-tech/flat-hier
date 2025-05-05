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
 * @param {string} markdown - The Markdown content to write.
 * @param {string} filePath - The file path to write the Markdown to.
 * @returns {Promise<void>} - A promise that resolves when the file is written.
 */
import fs from 'fs/promises';
export async function writeMarkdownToFile(markdown, filePath) {
    try {
        await fs.writeFile(filePath, markdown, 'utf-8');
        console.log(`Markdown file successfully written to ${filePath}`);
    } catch (error) {
        console.error(`Failed to write Markdown file: ${error.message}`);
        throw error;
    }
}