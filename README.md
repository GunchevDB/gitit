# StackAssist ThreeJS

StackAssist is a web application that leverages Three.js for 3D rendering and animations, providing an interactive platform for visualizing and manipulating stacked boxes.

## Getting started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en) (v14 or higher)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [git](https://www.git-scm.com/downloads)

## Installation

1. Clone the repository

```git clone https://git.fhict.nl/I450970/stackassist-example.git```

2. Navigate to the project directory 

```cd stackassist-example```

3. Install the dependencies

```npm install```


## Running the application
 
To run the application in development mode

```npm run dev```

This command will start a local development server, typically accessible at `https://localhost:5173/`.

## Testing as a Progressive Web App(PWA)

To test the application as a PWA, follow these steps:

1. Build the project

```npm run build```

2. Serve the built project

```npm run serve```

The application will be hosted on an available port, most likely at `https://localhost:5173/`

# Deployment

You can also access the deployed version of the application on Netlify:

[Stack Assist on Netlify](https://boxes-stack-threejs.netlify.app/)

# Project Structure

The project's main components are organized as follows:

- `src/`: Contains the source code of the project.
- `components/`: Contains reusable components like `WebGL`, `Controller`, `Loader`, etc.
- `styles/`: Contains the CSS files for styling the application.
- `index.html`: The main HTML file.
- `main.js`: The entry point of the application.

# Key Features

- **Three.js Integration**: Leverage the power of Three.js for 3D rendering and animations.
- **Progressive Web App**: Installable on mobile devices and desktops for a native app-like experience.
- **Responsive Design**: Ensures the application looks great on all devices.
- **Interactive Controls**: Use the OrbitControls for intuitive navigation within the 3D space.

# Contacts

**Project Members**

- Dimitar Gunchev
- Gabriela Simeonova
- Tsveta Pandurska
- Majid Al-Jahwari
- Abdullah Al Kindi

