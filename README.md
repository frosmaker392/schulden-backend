# Schuldenverfolgung (Backend)

## Running the project

1. Make sure the folders neo4j/data and neo4j/logs are present in the project directory.
2. Run the docker container with the database using `docker compose up -d`.
3. Run `npm install` to install all dependencies.
4. Run `npm run dev` for the development server.

## Commands

- `generate` - Generates GraphQL and TypeScript type definitions from nexus schema (under src/graphql).