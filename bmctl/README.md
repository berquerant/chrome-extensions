# bmctl

Search the bookmarks.

# Usage

1. Click the icon of bmctl, a popup opens.
2. Type search word in text box.

Click a X mark at the bottom right of a bookmark, delete the bookmark.

# Options

Click `Settings` button on a popup, or click options, then you can change the settings.

Click `Reset` button to set the settings default values in the settings page.

Click `Save` button to apply the settings.

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

# Operation

Click `Operation` button to open a modal for operation to the current search result.

Click `All` button to check all items.

Click `Clear` button to uncheck all items.

Click `Import` button to import bookmarks.

Click `Export` button to display checked items as json.

Click `Delete` button to delete checked items.

## Import

1. Select a folder by the select box at left side. This is the parent folder.
2. Write a json into the text area. The structure of the json is the same as `Export` json.
3. Click `Show` button to display bookmarks after import.
4. Click `Import` button to import specified items under the selected folder.

# Install

`make build` and load this extension from `bmctl/dist`.

# Development

`npm ci`, then you can start development.

`make dev` is convenient to check and build source for development.
