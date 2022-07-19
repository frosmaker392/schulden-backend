# Schuldenverfolgung (Backend)

## Running the project

1. Run the docker container with the database using the following command:
```
docker run \
    --name schulden-db \
    --restart always \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/data:/data \
    neo4j:4.4.8
```
2. Run `npm install` to install all dependencies.
3. Run `npm run dev` for the development server.

## Commands

- `generate` - Generates GraphQL and TypeScript type definitions from nexus schema (under src/graphql).