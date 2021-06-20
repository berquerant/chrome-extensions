# bmctl

Search the bookmarks.

# Usage

1. Click the icon of bmctl, a popup opens.
2. Type search word.

Click a X mark at the bottom right of a bookmark, delete the bookmark.

# Options

## Query Type

How to search the bookmarks.

### Raw

Search by the search word itself.

### Regex

Search by regexp.

## Query Target Type

Which data to use to search.

### Title

Use title

### Url

Use url.

## Sort Type

How to sort the search result.

### Title

By title.

### Url

By url.

### Timestamp

By creation time.

## Sort Order Type

### Asc

Ascending order.

### Desc

Descending order.

## Query Max Result

Max number of search result.
Empty means no limit.

## Query Source Max Result

Max number of search target.
Empty means no limit.

## Filter After

Oldest creation time of search target.
Include specified date.

## Filter Before

Newest creation time of search target.
Include specified date.

# Install

`make build` and load this extension from `bmctl/dist`.

# Development

`npm ci`, then you can start development.

`make dev` is convenient to check and build source for development.
