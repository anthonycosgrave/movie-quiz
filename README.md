# Movie Quiz App

An accessible React quiz application that tests your movie knowledge. Choose from three categories—release years, directors, or actors—and answer questions generated from real movie data via the TMDb API.

Watch the demo below:

[![Watch the demo](http://img.youtube.com/vi/k6XN9ORSmJY/0.jpg)](https://youtu.be/k6XN9ORSmJY)

## Features

- Three quiz categories with dynamic question generation
- Custom React hook for data fetching and transformation
- Keyboard navigable
- ARIA live regions for real-time announcements
- Screen reader support (tested with NVDA on Windows 10)
- Focus management for accessibility
- Comprehensive testing with Jest and Playwright

## Tech Stack

- [React 19.2.0](https://react.dev/blog/2025/10/01/react-19-2)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- [TMDb API](https://developer.themoviedb.org/docs/getting-started)
- [axios](https://axios-http.com/docs/intro)
- [Jest](https://jestjs.io/) + React Testing Library
- [Playwright](https://playwright.dev/)

## Setup

Install dependencies:
```bash
npm install
```

Create a `.env` file with your TMDb API key:
```
REACT_APP_TMDB_API_KEY=your_api_key_here
```

Get your API key from [TMDb](https://www.themoviedb.org/settings/api).

## Usage

Start development server:
```bash
npm start
```

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npx playwright test
```

## Future Enhancements 

Language support for better pronuncation of international names and titles.

## Favicon 


<a target="_blank" href="https://icons8.com/icon/20848/movie-projector">Movie Projector</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
