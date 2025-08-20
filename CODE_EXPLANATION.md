# Code Explanation

This document provides a technical breakdown of the Weather Dashboard application files.

## `index.html`

The HTML file defines the structure and layout of the web application.

-   **Container**: The main container is `<div class="weather-app-container">`, which holds the entire application.
-   **Header**: Contains the main title `<h1>Weather Dashboard</h1>`.
-   **Search and Controls**:
    -   `<div class="search-section">`: Holds the city input field (`#location-input`) and the search button (`#search-button`).
    -   `<div class="controls-section">`: Contains the dropdown (`#viewSelect`) to switch between different forecast views and the button to clear history (`#clear-history-button`).
-   **Search History**:
    -   `<div class="history-section">`: A dedicated area to display a list (`#history-list`) of recent searches.
-   **Weather Display**:
    -   `<div class="weather-display-section">`: This is the main area where weather data is shown. It contains multiple child `div` elements, each with the `.weather-view` class.
    -   **States**: It includes divs for different UI states: `#loading-state`, `#empty-state` (initial view), and `#error-state`.
    -   **Data Views**: Each forecast type has its own dedicated view that is shown or hidden by the JavaScript based on user selection:
        -   `#current-weather`
        -   `#hourly-forecast`
        -   `#7day-forecast`
        -   `#15day-forecast`
        -   `#monthly-overview`
-   **Footer**: Includes creator information and social media links.
-   **Scripts and Stylesheets**:
    -   Links to the `style.css` file for styling.
    -   Links to Font Awesome for icons.
    -   Links to the `script.js` file at the end of the `<body>` to ensure the HTML is parsed before the script runs.

## `style.css`

This file provides the visual styling for the application, focusing on a modern, dark, and responsive theme.

-   **Overall Styling**: Sets a dark gradient background for the `body` with a subtle animation. The main text color is a light grey (`#e0e0e0`) for contrast.
-   **Main App Container**: The `.weather-app` class styles the main content box with a semi-transparent dark background, rounded corners, and a shadow to make it "float" above the background.
-   **Accent Color**: A teal color (`#1abc9c`) is used consistently for headers, highlights, and interactive element focus, creating a cohesive look.
-   **Buttons and Inputs**: Styled to have rounded corners, dark backgrounds, and clear hover/focus states that use the accent color.
-   **Layout**: The layout is managed primarily with Flexbox (`display: flex`), ensuring proper alignment and spacing of components.
-   **Forecast Items**: The `.forecast-container` uses CSS Grid (`display: grid`) to create a responsive gallery of forecast items that adjusts the number of columns based on screen width.
-   **Responsive Design**: Uses `@media` queries to adjust the layout for smaller screens (tablets and mobile phones), such as stacking elements vertically and adjusting font sizes.

## `script.js`

This file contains all the client-side logic for the application. The script waits for the `DOMContentLoaded` event before running.

-   **Global Variables**:
    -   **DOM Element References**: At the top, constants are defined to hold references to all the interactive and display elements from the HTML.
    -   `API_KEY` and `BASE_URL`: Store the API key and the base URL for the VisualCrossing weather service.
    -   `searchHistory`: An array to hold search history, initialized from `localStorage` to persist searches between sessions.

-   **Core Functions**:
    -   `fetchWeather(city, viewMode)`: This is the primary asynchronous function.
        1.  It disables UI elements and shows a loading message.
        2.  It constructs the API request URL based on the `city` and the selected `viewMode` (current, hourly, etc.).
        3.  It uses the `fetch()` API to make the request.
        4.  On a successful response, it calls `renderData()` to display the results and `addToHistory()` to save the search.
        5.  If an error occurs (e.g., city not found), it displays an error message.
        6.  Finally, it re-enables the UI elements.
    -   `renderData(data, viewMode)`: This function is responsible for updating the HTML with the fetched weather data.
        1.  It first clears all previous data from the display containers.
        2.  A `switch` statement determines which block of code to execute based on the `viewMode`.
        3.  For each case, it accesses the relevant part of the `data` object, creates HTML elements dynamically (e.g., for forecast items), and populates the corresponding view in the DOM.
    -   `showWeatherView(viewId)`: A helper function that manages which weather view is visible by adding the `.active` class to the correct element and removing it from all others.

-   **History Management**:
    -   `addToHistory(location)`: Adds a new location to the `searchHistory` array (ensuring no duplicates) and saves the updated array to `localStorage`.
    -   `renderHistory()`: Clears and re-renders the list of search history items in the UI. It also attaches click listeners to each item.
    -   `removeFromHistory(index)` and `clearAllHistory()`: Manage the removal of single items or the entire history list, updating both the UI and `localStorage`.

-   **Event Handling**:
    -   Event listeners are attached to the search button, the input field (for the "Enter" key), the view selector dropdown, and the clear history button.
    -   These listeners trigger the core functions (`fetchWeather`, `clearAllHistory`, etc.) based on user interaction.

-   **Initialization**:
    -   When the script first loads, it calls `populateViewSelect()` to create the dropdown options, `renderHistory()` to display any saved history, and `showWeatherView('empty-state')` to set the initial view.
