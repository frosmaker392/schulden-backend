# Schuldenverfolgung (Backend)

This is the backend project for my Bachelor's thesis on a software project for debt management. The backend application is a GraphQL server which interacts with a Neo4J graph database as persistence. The database is ran together with the server on the same layer and all data is stored within this project directory for simplicity reasons.

## Running the project

1. Ensure the database container is running in the background on localhost:7474 before running the project.
   1. For first time setup, make sure the folders `neo4j/data` and `neo4j/logs` are present in the project directory.
   2. Run the database docker container using `docker compose up -d` and go to localhost:7474 to verify it is running.
   3. Set the database credentials as required on Neo4J Browser.
2. Run `npm install` to install all dependencies.
3. Create a .env file in the project directory with the required environment variables (see `src/env.ts` for the list of all required keys).
4. Run `npm run dev` for the development server.

## Commands

- `generate` - Generates GraphQL and TypeScript type definitions from nexus schema (under src/graphql).
