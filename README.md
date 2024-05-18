# Interactive Grid Project

## Overview

This project is an interactive grid application built with React and Next.js using the latest App Directory features. It allows users to toggle the state of cells within a grid. The grid state is persisted using a PostgreSQL database.

## Features

-  **Interactive Grid**: Users can toggle cells on and off by clicking or using keyboard interactions.

-  **Persistent State**: The state of the grid is stored in a PostgreSQL database, ensuring data persistence.

-  **Responsive Design**: The grid layout is responsive and adapts to different screen sizes.

-  **Accessible**: The application includes keyboard support for better accessibility.

## Technologies Used

-  **Frontend**: React, Next.js (App Directory), TypeScript

-  **Database**: PostgreSQL, Drizzle ORM

-  **Styling**: Custom CSS

-  **Deployment**: Vercel

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

-  **Set up the database**

- Create a PostgreSQL database and obtain the connection string.

- Add the connection string to your `.env.local` file:

env

-  -  `POSTGRES_URL=your_postgres_connection_string`

-  **Run the application**

The application will be available at `http://localhost:3000`.

Usage

-----

-  **Toggle Cell State**: Click on any cell in the grid to toggle its state between active and inactive.

-  **Keyboard Support**: Use the Enter or Space key to toggle the state of a focused cell.

-  **Switch Themes**: Click the "Toggle Theme" button to switch between light and dark modes.

Deployment

----------

The project is deployed on Vercel. To deploy your own instance:

1. Fork the repository on GitHub

2. Create a new project on Vercel and link it to your GitHub repository

3. Set environment variables on Vercel

- Add your PostgreSQL connection string as `POSTGRES_URL`.

Demo

----

Check out the live demo: https://interactive-grid-next-dif8ke5rk-chase-collins-projects.vercel.app/

Example .env.local

------------------

env

`POSTGRES_URL="postgres://default:password@host:port/database?sslmode=require"`
