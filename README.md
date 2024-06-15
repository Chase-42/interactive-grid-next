# Interactive Grid Project

## Overview

This project is an interactive grid application built with React and Next.js using the latest App Directory features. It allows users to toggle the state of cells within a grid. The grid state is persisted using a PostgreSQL database.

## Features

- **Interactive Grid**: Users can toggle cells on and off by clicking or using keyboard interactions.
- **Persistent State**: The state of the grid is stored in a PostgreSQL database, ensuring data persistence.
- **Color Picker**: The application includes a color picker for customizing the color of cells.
- **Responsive Design**: The grid layout is responsive and adapts to different screen sizes.
- **Accessible**: The application includes keyboard support for better accessibility.
- **Advanced Features**:
  - **Loading Spinner**: Displays a spinner while data is being fetched.
  - **Error Handling**: Shows an error message if data fetching fails.
  - **React Query Integration**: Optimized data fetching and state management using React Query.

## Technologies Used

-  **Frontend**: React, Next.js, TypeScript

-  **Database**: PostgreSQL, Drizzle ORM

-  **Styling**: Custom CSS

-  **Deployment**: Vercel

## Demo

Check out the live demo: [Interactive Grid Demo](https://interactive-grid-next.vercel.app/)

## Getting Started

### Prerequisites

- Node.js

- npm or yarn

- PostgreSQL database

### Installation

1.  **Clone the repository**

  - git clone https://github.com/Chase-42/interactive-grid-next

  - cd interactive-grid

2.  **Install dependencies**

  - npm install or yarn install

3.  **Set up the database**

  - Create a PostgreSQL database and obtain the connection string.

  - Add the connection string to your `.env.local` file:

-   `POSTGRES_URL=your_postgres_connection_string`

4.  **Run the application**
  
  - NPM or Yarn run dev
  
  - The application will be available at `http://localhost:3000`.

## Usage

-----

-  **Toggle Cell State**: Click on any cell in the grid to toggle its state between active and inactive.

-  **Keyboard Support**: Use the Enter or Space key to toggle the state of a focused cell.

## Deployment

----------

The project is deployed on Vercel. To deploy your own instance:

1. Fork the repository on GitHub

2. Create a new project on Vercel and link it to your GitHub repository

3. Set environment variables on Vercel

- Add your PostgreSQL connection string as `POSTGRES_URL`.



