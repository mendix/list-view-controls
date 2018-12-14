[![Build Status](https://travis-ci.org/mendixlabs/list-view-controls.svg?branch=master)](https://travis-ci.org/mendixlabs/list-view-controls)
[![Dependency Status](https://david-dm.org/mendixlabs/list-view-controls.svg)](https://david-dm.org/mendixlabs/list-view-controls)
[![Dev Dependency Status](https://david-dm.org/mendixlabs/list-view-controls.svg#info=devDependencies)](https://david-dm.org/mendixlabs/list-view-controls#info=devDependencies)
[![codecov](https://codecov.io/gh/mendixlabs/list-view-controls/branch/master/graph/badge.svg)](https://codecov.io/gh/mendixlabs/list-view-controls)
![badge](https://img.shields.io/badge/mendix-7.7.1-green.svg)

# List view controls
Enable users to filter or search a list view.

## Available widgets
* `Check box filter`: Filters a list view with various constraints when checked or unchecked
* `Drop down filter`: Filters a list view with various options that can be selected from a drop-down
* `Drop down sort`: Adds an interactive sort to your list view.
* `Text box search`: Adds an interactive search box to all of your list view
* `Pagination`: Adds bootstrap like paging to a list view and page numbers similar to in-built data grid
* `Header sort`: Add sorting behavior to the headers of a list view.

## Dependencies
Mendix 7.20.0

## Demo projects
[https://listviewcontrols.mxapps.io](https://listviewcontrols.mxapps.io)

## Basic configuration

### Pagination
Add bootstrap like paging to your list view similar to the built-in data grid. The widget also supports page numbers.

## Features
* Add pagination navigation buttons to the list view 
ie:
  * First button
  * Last button
  * Next button
  * Previous button
  * Hide unused buttons.
  * Page numbers as buttons  
  * Page numbers with text as buttons
  * Page text that can be added to pagination in combination with the follow place holders.
  {firstItem} {lastItem} {totalItems} {currentPageNumber} {totalPages}
* Page size: This feature limits the number of items on the list view 

## Sample
* Lower Pagination
![Default buttons](/assets/Pagination/demo.gif)

* Multiple Paginations

![Page buttons](/assets/Pagination/demo2.gif)

* Page size
![Page size](/assets/Pagination/pagesizedemo.gif)

## Usage

### Appearance configuration

![Data source](/assets/Pagination/Appearance.png)
 - On the `Hide unused paging` option of the `Appearance` 
 tab, specify if the buttons should be hidden when they are not needed.For example when the records are few.
  * On the `Page style` option of the `Appearance` 
  tab, specify how the buttons should look.
    * `Default`
     shows the pagination with the looks similar to Mendix data grid paging
    * `Page number buttons`
     show the pagination as numbers with default set to seven
    * `Custom`
     Allows the pagination to be configured to look the way one desires
- ![Page size configuration](/assets/Pagination/Pagesize_config1.png)
- ![Page size configuration](/assets/Pagination/Pagesize_config2.png)
- ![Page size configuration](/assets/Pagination/Pagesize_config3.png)
### Check Box Filter
Enable users to filter a list view at run time, with various constraints when checked or unchecked

## Features
* Filter items by an attribute
* Filter items by XPath
* Configure filter actions when the widget is checked
* Configure filter actions when the widget is unchecked
* Set a checked checkbox as default
* Supports multiple filters on the same list view

## Sample
![Sample](/assets/CheckBoxFilter/demo.gif)

## Usage

Configure the widget as below.

Provide the entity name for the target list view.
![General](/assets/CheckBoxFilter/configuration_general.jpg)

Set up filter actions to be applied when the widget is checked.
![Checked](/assets/CheckBoxFilter/configuration_checked.jpg)

Set up filter actions to be applied when the widget is unchecked
![Unchecked](/assets/CheckBoxFilter/configuration_unchecked.jpg)

When filtering by `Attribute`, select an attribute and input an attribute value to filter by.

    - For 'Boolean' datatype use `true` or `false` string.
    - For 'Enumeration' datatype use the enumeration name/key not 'caption'
When filtering by `XPath`, input a constraint to filter by.
`None` is for an empty option which resets the filter then selected.

**NB: The widget connects to the first list view it finds from within its parent container and outer wards.** 


### Drop Down Filter
Enable users to filter a list view at run time, with various options that can be selected from a drop-down

## Features
* Filter items by an attribute
* Filter items by XPath
* Select a filter from a list of options
* Set a default filter option

## Sample
![Sample](/assets/DropDownFilter/demo.gif)

## Usage
Place the Drop-down filter widget above a list view.
Provide the entity name of the target list view in the `General` tab.

![General](/assets/DropDownFilter/General.png)

Add a new filter with a caption and choose comparison type.

![Filters](/assets/DropDownFilter/Filters.png)

When filtering by `Attribute`, select an attribute and input a value to filter by
When filtering by `XPath`, input a constraint to filter by.
`None` is for an empty option which resets the filter then selected.

**NB: The `None` filter option should always appear at the top of the list and it does not require a caption.** 
**Also to note, only one empty filter option should be selected.**

![XPathConstraint](/assets/DropDownFilter/XPathConstraint.png)

### Drop Down Sort
Add an interactive sort to your list view.
It supports sorting on a single field similar to the built-in list view sort capabilities.

## Features
* Sort through a single field
* Specify an option to sort list view items on load. If multiple defaults are selected, the widget will select the first one.

## Demo project
![Demo](/assets/DropDownSort/demo.gif)

## Usage

### Data source configuration

![Data source](/assets/DropDownSort/Datasource.png)
 - On the `List view with entity` option of the `Data source` tab, browse and 
 select the "entity" property of the list widget you want to sort.
 This `entity` must be the one used on the list view.
 
 ![Data source](/assets/DropDownSort/SortAttributes.png)
 
 - On the `Sort attributes` option of the `Data source` tab, browse and 
 select the attribute on the list widget entity to be sorted. 
 
 
 ![Data source](/assets/DropDownSort/SortAttributesItems.png)


### Text Search
Add an interactive search box to all of your list-view
It supports searching on single field similar to the built-in list view search capabilities.

## Features
* Search through a single field with single and multiple attributes
* Open search in default

## Sample
![Sample](/assets/TextBoxSearch/demo.gif)

## Usage

Configure the widget as below.

![General](/assets/TextBoxSearch/general.jpg)

- On the `List view with entity` option of the `General` tab, select an entity that matches listview entity.

- On the `Attributes` option of the `General` tab, create attributes to be used in the text search.

![General](/assets/TextBoxSearch/attribute.jpg)

### Header Sort
Please follow [Header sort guide](docs/README.HeaderSort.md)
![Demo header sort](/assets/HeaderSort/demo.gif)

## Issues, suggestions and feature requests
Please report issues at [https://github.com/mendixlabs/list-view-controls/issues](https://github.com/mendixlabs/list-view-controls/issues).

## Development and contribution
Prerequisite: Install git, node package manager, webpack CLI, grunt CLI, Karma CLI

To contribute, fork and clone.

    > git clone https://github.com/mendixlabs/list-view-controls.git

The code is in typescript. Use a typescript IDE of your choice, like Visual Studio Code or WebStorm.

To set up the development environment, run:

    > npm install

Create a folder named `dist` in the project root.

Create a Mendix test project in the dist folder and rename its root folder to `dist/MxTestProject`. Changes to the widget code shall be automatically pushed to this test project.
Or get the test project from [https://github.com/mendixlabs/list-view-controls/releases/latest](https://github.com/mendixlabs/list-view-controls/releases/latest)

To automatically compile, bundle and push code changes to the running test project, run:

    > npm start

To run the project unit tests with code coverage, results can be found at `dist/testresults/coverage/index.html`, run:

    > npm run test:unit

Run the unit test continuously during development:

    > npm run test:dev

Run the end to end test during development:

    > npm run test:e2e:dev

## Scripts
While developing, you will probably rely mostly on `npm start`; however, there are additional scripts at your disposal:

|`npm run <script>`|Description|
|------------------|-----------|
|`start`|Build the project and monitor source and config for changes and rebuild.|
|`test`|Runs lint, build, unit tests with Karma and generates a coverage report, deploy and run e2e test|
|`test:dev`|Runs Karma and watches for changes to re-run tests; does not generate coverage reports.|
|`test:unit`|Runs unit tests with Karma and generates a coverage report.|
|`test:e2e`|Runs end 2 end tests with remote.|
|`test:e2e:dev`|Runs end 2 end tests with locally on localhost:8080|
|`deploy`|Use latest widget build to update the Mendix project update the application to Mendix node.|
|`build:prod`|Build widget optimized for production|
|`build:dev`|Build widget optimized for debugging.|
|`lint`|Lint all `.js` files.|
|`lint:fix`|Lint and fix all `.ts` files.|

# CI and remote testing
To enable the continues integration services.
Copy the `node_modules/mendix-widget-build-script/dist/localSettings.js`
 to your project root, and update the settings to run the update deployment from local source.

**Do not forget** to exclude this file in the `.gitignore` as it contains sensitive data.
```
exports.settings = {
    appName: "appName",
    key: "xxxxxxxx-xxxx-xxxx-xxxxx-xxxxxxxxxxxx",
    password: "secret",
    projectId: "xxxxxxxx-xxxx-xxxx-xxxxx-xxxxxxxxxxxx",
    user: "ci@example.com"
};
```

More information about the [Mendix widget build script](https://github.com/FlockOfBirds/mendix-widget-build-script).
