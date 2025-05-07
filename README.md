# flat-hier
by [terzi-tech](https://github.com/terzi-tech)

## Overview
`flat-hier` is a command-line tool for managing hierarchical data structures stored in flat JSON files. It provides an intuitive interface for creating, editing, and navigating hierarchical data, making it ideal for developers and data managers. 

The tool has no dependencies, ensuring a lightweight and straightforward setup.

## Features
- **Hierarchical Data Management**: Add, delete, promote, demote, and move nodes within a hierarchy.
- **Command-Line Interface (CLI)**: Interact with the tool using simple commands.
- **JSON Templates**: Initialize and extend hierarchies using customizable templates.
- **State Management**: Track the current data, selected index, and mode (navigate/edit).
- **ASCII Tree Rendering**: Visualize the hierarchy in the console.
- **Data Persistence**: Load and save data seamlessly.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/terzi-tech/flat-hier.git
   cd flat-hier
   ```
2. If you plan to contribute to development or run tests, install the development dependencies:
   ```bash
   npm install
   ```
   For regular usage, this step is not required.

## Usage
### Initialize a New Hierarchy
Run the following command to create a new JSON file based on a template:
```bash
fhr init
```

### Edit the Hierarchy
Navigate and edit the hierarchy interactively:
```bash
fhr editor
```

### Commands
- `init`: Initialize a new hierarchy.
- `edit`: Edit an existing hierarchy.

## File Structure
- **`bin/`**: CLI entry point and rendering logic.
- **`src/`**:
  - `cli/`: CLI commands and their registration.
  - `core/`: Core operations for managing hierarchical data.
  - `services/`: Data loading and saving.
  - `utils/`: Utility functions for data manipulation.
- **`templates/`**: JSON templates for initialization and new objects.

## Configuration
The tool uses `flat-hier.config.json` for configuration. Update this file to specify file paths and template names.

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License.