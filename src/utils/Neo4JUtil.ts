import * as Neo4J from 'neo4j-driver'

type AccessMode = 'read' | 'write'

export default class Neo4JUtil {
  static session<T>(
    driver: Neo4J.Driver,
    accessMode: AccessMode,
    queryRunner: (session: Neo4J.Session) => Promise<T>
  ) {
    const neo4jAccessMode =
      accessMode === 'read' ? Neo4J.session.READ : Neo4J.session.WRITE
    const session = driver.session({ defaultAccessMode: neo4jAccessMode })

    return queryRunner(session)
      .catch((e) => {
        console.log(e)
        return {} as T
      })
      .finally(() => session.close())
  }
}
