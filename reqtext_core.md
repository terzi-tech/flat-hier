# ReqText Core

ReqText is a text based requirements management tool. It is a git native tool that allows you to manage your requirements, tests and progress in a json data format. It is designed to use git version control for requirement changes and history. 

The json will drive a markdown file that will be used to display the requirements in a readable format. 

The CLI shows the requirements in a tree format. 

The requirements are stored in a flat json structure, no nested objects. Allowing for readability and faster parsing.

# 1 CLI Commands

This feature allows users to execute various commands within the application. Commands like Add, Delete, Promote, Demote, Move Up, and Move Down are implemented. These commands enable users to manage the hierarchy and structure of requirements effectively.

## 1.1 Init

This feature will initialize the application with a default configuration and data structure. It is essential for setting up the initial state of the application.

## 1.2 Add Item

This feature allows users to add a new item to the requirements tree. The new item will be appended to the selected parent node.

## 1.3 Delete Item

This feature allows users to delete an item from the requirements tree. The selected item and its children will be removed.

## 1.4 Demote Item

This feature allows users to demote an item and its children to the previous level in the hierarchy. This is useful for moving items down in the hierarchy and changing their importance. The feature is implemented and functional.

## 1.5 Promote Item

This feature allows users to promote an item and its children to the next level in the hierarchy. This is useful for moving items up in the hierarchy and changing their importance. The feature is implemented and functional.

# 2 READMEs Generation

ReqText will generate a README.md, a DOCUMENTATION.md and DESIGN.md files. All these files will be generated from the json data. There will be multipled properites to store sections that the user can deside what will go into the three different markdowns.

## 2.1 Json to MD Parser

A custom parser will be created to convert JSON data into Markdown format. The parser will handle various sections and properties of the JSON data, ensuring flexibility and customization. It will generate Markdown files automatically, following a predefined structure for headers, sections, and content. This feature will simplify the process of creating documentation from JSON data.

### 2.1.1 Parser Design

The number of #s in the title will be determined by the hier property. The header will have the outline property followed by the title. The descrption will have **Description:** followed by an underline, new character then the description text from the json.

### 2.1.2 Markdown Formatting Details

PLACEHOLDER

### 2.1.3 File Name From config file

The parser will use the file name from the config file. The file name will be used to create the markdown file. 

## 2.2 MD to Json Parser

This feature will parse markdown files back into json format, allowing for easy editing and updates to the requirements. This function will be called to overwrite the json only on the customer input.

