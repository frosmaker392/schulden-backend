import * as Neo4J from 'neo4j-driver'
import Neo4JUtil from '../../src/utils/Neo4JUtil'

let neo4jDriver: Neo4J.Driver,
  mockSession: Neo4J.Session,
  mockSessionFactory: () => Neo4J.Session
describe('Neo4JUtil', () => {
  beforeEach(() => {
    mockSession = {
      close: jest.fn() as unknown
    } as Neo4J.Session

    mockSessionFactory = () => mockSession

    neo4jDriver = {
      session: jest.fn(mockSessionFactory) as unknown
    } as Neo4J.Driver
  })

  test('run read query', async () => {
    const callback = jest.fn(async () => 3)

    const result = await Neo4JUtil.session(neo4jDriver, 'read', callback)

    expect(neo4jDriver.session).toHaveBeenCalledWith({
      defaultAccessMode: Neo4J.session.READ
    })
    expect(callback).toBeCalledWith(mockSession)
    expect(mockSession.close).toHaveBeenCalled()
    expect(result).toBe(3)
  })

  test('run write query', async () => {
    const callback = jest.fn(async () => 5)

    const result = await Neo4JUtil.session(neo4jDriver, 'write', callback)

    expect(neo4jDriver.session).toHaveBeenCalledWith({
      defaultAccessMode: Neo4J.session.WRITE
    })
    expect(callback).toBeCalledWith(mockSession)
    expect(mockSession.close).toHaveBeenCalled()
    expect(result).toBe(5)
  })
})
