# hgrep

Search the history of visited pages.

# Usage

1. Click the icon of hgrep, a popup opens.
2. Type search word.

Click a X mark at the bottom right of a history, delete the history.

# Options

## Sort Type

How to sort the search result.

### Last visit time

Descending order of when a page was last loaded.

### Visit count

Descending order of the number of times a page was loaded.

## Query Type

How to search the history.

### Raw

Search by the search word itself.

### Regex

Search by regexp.

### Glob

**Not implemented yet**.

### Fuzzy

Fuzzy searching.
This option ignores Query Target Type.

## Query Target Type

Which data to use to search.

### Title

Use title.

### Url

Use url.

## Query Start Time Hours Back

How many hours ago the oldest search target is.

## Query Max Result

Max number of search result.

## Query Source Max Result

Max number of search target.

# Install

`make build` and load this extension from `hgrep/dist`.

# Development

`npm ci`, then you can start development.

`make dev` is convenient to check and build source for development.
