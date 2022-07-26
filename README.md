# Schuldenverfolgung (Backend)

## Running the project

0. Make sure the folder neo4j/data is present before running the following docker command, as it serves as the mount point for the container to persist its data.
1. Run the docker container with the database using `docker compose up -d`.
2. Run `npm install` to install all dependencies.
3. Run `npm run dev` for the development server.

## Commands

- `generate` - Generates GraphQL and TypeScript type definitions from nexus schema (under src/graphql).