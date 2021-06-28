# Changelog

All notable changes to this tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.3.15 - 2021-06-28

### Fixed

-  We fixed a regression introduced in v1.3.10 which causes `Header Sort` and `Drop down Sort` to not keep the list view sorted when pressing back button.

## 1.3.14 - 2021-06-22

### Fixed

-  We fixed all `logger` deprecated warnings being thrown during the execution. 

## 1.3.13 - 2021-06-02

### Fixed

-   Fixed an issue introduced in v1.3.12 where if the list view's search is not enabled, then the widget would error on any list view control widget interaction.  

## 1.3.12 - 2021-05-27 [YANKED]

### Fixed

-   Fixed an issue introduced in v1.3.11 where using a list view control widget multiple times would accumulate its constraints instead of replacing them.
-   Fixed an issue where the list view control widgets constraints are combined incorrectly with the integrated list view search's constraints, losing context in-between.

## 1.3.11 - 2021-05-10 [YANKED]

### Fixed

-   Fixed an issue where combining list view filtering with pagination sort would reset all the filters. (Fixes Ticket #119143)
