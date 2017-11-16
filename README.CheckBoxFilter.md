# Check box filter
Enable users to filter a list view at run time, with various constraints when checked or unchecked

## Features
* Filter items by an attribute
* Filter items by XPath
* Configure filter actions when the widget is checked
* Configure filter actions when the widget is unchecked
* Set a checked checkbox as default
* Supports multiple filters on the same list view

## Sample
![Sample](assets/CheckBoxFilter/demo.gif)

## Usage

Configure the widget as below.

Provide the entity name for the target list view.
![General](assets/CheckBoxFilter/configuration_general.jpg)

Set up filter actions to be applied when the widget is checked.
![Checked](assets/CheckBoxFilter/configuration_checked.jpg)

Set up filter actions to be applied when the widget is unchecked
![Unchecked](assets/CheckBoxFilter/configuration_unchecked.jpg)

When filtering by `Attribute`, select an attribute and input an attribute value to filter by.

    - For 'Boolean' datatype use `true` or `false` string.
    - For 'Enumeration' datatype use the enumeration name/key not 'caption'
When filtering by `XPath`, input a constraint to filter by.
`None` is for an empty option which resets the filter then selected.

**NB: The widget connects to the first list view it finds from within its parent container and outer wards.** 

