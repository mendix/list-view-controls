# Pagination

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

## Sample
* Lower Pagination
![Default buttons](/assets/Pagination/demo.gif)

* Multiple Paginations

![Page buttons](/assets/Pagination/demo2.gif)

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
