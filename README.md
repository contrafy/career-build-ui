# career-build-ui

Frontend for Career Builder, built with Vite + React + TypeScript + TailwindCSS.

## Features

- Dynamic job listings fetched from API backend
- Filter form: title, description, location, remote, role type
- Resume upload (PDF) with LLM-based filter hint integration
- Clean, animated UI using `tailwindcss` and `tw-animate-css`
- Responsive design and dark theme support via CSS custom props

## Tech Stack

- **React** – Component-based UI
- **Vite** – Fast dev server and build
- **TailwindCSS** – Utility-first styling
- **TypeScript** – Type safety across components
- **FastAPI backend** – See [`career-build-api`](https://github.com/your-org/career-build-api)

## Setup

```bash
npm install
npm run dev

## TODO

- Theme switcher
- LLM-powered filter injection post-resume upload
- Source selection toggle (YC, internships, etc.)