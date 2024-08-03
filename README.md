# 🌐 API Hub

This project is a full-stack application designed for managing API categories, including both frontend and backend components. Below is the detailed information about the setup, usage, and development of this project.

## 📋 Table of Contents

- [Installation](#installation)
- [Required Installations](#required-installations)
- [Available Scripts](#available-scripts)
- [Running the Application](#running-the-application)
- [MongoDB Atlas Configuration](#mongodb-atlas-configuration)
- [Connecting to MongoDB using Compass](#connecting-to-mongodb-using-compass)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

To install and set up the project, follow these steps:

1. Clone the repository:

    ```sh
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```sh
    cd api-hub
    ```

3. Install the dependencies for both frontend and backend:

    ```sh
    npm install
    ```

## 🛠️ Required Installations

### Frontend

This project requires the following libraries and tools for the frontend:

- **React**: A JavaScript library for building user interfaces. To install, use:

    ```sh
    npm install react react-dom
    ```

- **Material-UI**: React components for faster and easier web development. To install, use:

    ```sh
    npm install @mui/material @emotion/react @emotion/styled
    ```

- **Font Awesome**: Scalable vector icons that can be customized. To install, use:

    ```sh
    npm install @fortawesome/fontawesome-free
    ```

- **React Router**: Declarative routing for React. To install, use:

    ```sh
    npm install react-router-dom
    ```

- **React Icons**: Popular icons in your React projects easily with react-icons. To install, use:

    ```sh
    npm install react-icons
    ```

### Backend

This project requires the following libraries and tools for the backend:

- **Express**: A minimal and flexible Node.js web application framework. To install, use:

    ```sh
    npm install express
    ```

- **Mongoose**: MongoDB object modeling for Node.js. To install, use:

    ```sh
    npm install mongoose
    ```

- **CORS**: A package for providing a Connect/Express middleware that can be used to enable CORS with various options. To install, use:

    ```sh
    npm install cors
    ```

- **BcryptJS**: A library to help you hash passwords. To install, use:

    ```sh
    npm install bcryptjs
    ```

- **Express Validator**: A set of express.js middlewares that wraps validator.js validator and sanitizer functions. To install, use:

    ```sh
    npm install express-validator
    ```

- **JSON Web Token**: A library to create, sign, and verify JSON Web Tokens. To install, use:

    ```sh
    npm install jsonwebtoken
    ```

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the frontend app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the frontend app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run eject`

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

### `node server.js`

Runs the backend server. The server will typically run on [http://localhost:5000](http://localhost:5000).

## 🚀 Running the Application

### Running the Frontend

1. Navigate to the project directory:

    ```sh
    cd api-hub/client
    ```

2. Start the React development server:

    ```sh
    npm start
    ```

    This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Running the Backend

1. Navigate to the backend directory:

    ```sh
    cd api-hub/backend
    ```

2. Install backend dependencies (if you haven't already):

    ```sh
    npm install
    ```

3. Start the Express server:

    ```sh
    node server.js
    ```

    This will start the backend server, typically running on [http://localhost:5000](http://localhost:5000).

### Running Both Frontend and Backend Concurrently

To run both frontend and backend servers concurrently, you can use a tool like `concurrently`. First, install `concurrently`:

```sh
npm install concurrently --save-dev
```

Then, add a new script to your `package.json`:

```json
"scripts": {
  "start": "concurrently \"npm run start:client\" \"npm run start:server\"",
  "start:client": "cd client && npm start",
  "start:server": "cd backend && node server.js"
}
```

Now, you can start both servers with a single command:

```sh
npm start
```

## 🗄️ MongoDB Atlas Configuration

To configure MongoDB Atlas for your backend, follow these steps:


1. Add the following code to `db.js`, replacing `<your-mongo-db-uri>` with your actual MongoDB Atlas URI:

    ```js
     mongoose.connect('<your-mongo-db-uri>')

    
    ```

## 🌐 Connecting to MongoDB using Compass

To connect to your MongoDB Atlas cluster using MongoDB Compass, follow these steps:

1. **Download and Install MongoDB Compass**: If you haven't already, download and install MongoDB Compass from the [official website](https://www.mongodb.com/try/download/compass).

2. **Obtain your MongoDB Atlas Connection String**:
    - Go to your MongoDB Atlas dashboard.
    - Navigate to your cluster and click on the "Connect" button.
    - Select "Connect with MongoDB Compass."
    - Copy the provided connection string. It should look something like this:

    ```sh
    mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
    ```

3. **Open MongoDB Compass**:
    - Launch MongoDB Compass on your computer.

4. **Connect to your Cluster**:
    - In the MongoDB Compass welcome screen, paste your connection string into the "Paste your connection string (SRV or Standard)" field.
    - Replace `<username>`, `<password>`, and `<dbname>` with your actual MongoDB Atlas credentials and database name.
    - Click on "Connect."

5. **Explore your Database**:
    - Once connected, you can explore your collections, documents, run queries, and perform various operations directly from MongoDB Compass.

## 📚 Usage

To use and develop this project, follow the installation steps and use the available scripts to start the development server or build the project for production. Customize the project by adding more features and dependencies as required.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Roopesh Votarikari, Kalyan Narmala, Vinay Kumar, Madhu Babu, and Arun Reddy

---
