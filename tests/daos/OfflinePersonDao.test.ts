import {
  OfflinePersonDao,
  OfflinePersonMemoryDao
} from '../../src/daos/OfflinePersonDao'
import { OfflinePerson } from '../../src/models'

let offlinePersonDao: OfflinePersonDao
describe('OfflinePersonMemoryDao', () => {
  beforeEach(() => {
    offlinePersonDao = new OfflinePersonMemoryDao()
  })

  test('create - returns the newly created person', async () => {
    const p1 = await offlinePersonDao.create('id1', 'test1')
    const p2 = await offlinePersonDao.create('id1', 'test2')
    const p3 = await offlinePersonDao.create('id2', 'test')

    expect(p1.id).toEqual(expect.any(String))
    expect(p2.id).toEqual(expect.any(String))
    expect(p3.id).toEqual(expect.any(String))
    expect(p1.name).toBe('test1')
    expect(p2.name).toBe('test2')
    expect(p3.name).toBe('test')

    expect(await offlinePersonDao.getAll('id1')).toHaveLength(2)
    expect(await offlinePersonDao.getAll('id2')).toHaveLength(1)
  })

  let createdPersons: OfflinePerson[]
  describe('after create', () => {
    beforeEach(async () => {
      createdPersons = await Promise.all(
        [
          ['id1', 'test1'],
          ['id1', 'test2'],
          ['id1', 'test3'],
          ['id2', 'test'],
          ['id3', 'test1'],
          ['id3', 'test2']
        ].map(([ownerId, name]) => offlinePersonDao.create(ownerId, name))
      )
    })

    describe('getAll', () => {
      test('returns persons owned by given ownerId', async () => {
        const id1Persons = await offlinePersonDao.getAll('id1')
        const id2Persons = await offlinePersonDao.getAll('id2')
        const id3Persons = await offlinePersonDao.getAll('id3')

        expect(id1Persons.length).toBe(3)
        expect(id2Persons.length).toBe(1)
        expect(id3Persons.length).toBe(2)
      })

      test('returns empty if user owns no persons', async () => {
        const id4Persons = await offlinePersonDao.getAll('id4')

        expect(id4Persons.length).toBe(0)
      })
    })

    describe('deleteById', () => {
      test('returns deleted person if successful', async () => {
        const deleted = await offlinePersonDao.deleteById(
          'id1',
          createdPersons[2].id
        )
        const personsAfterDeletion = await offlinePersonDao.getAll('id1')

        expect(deleted).not.toBeUndefined()
        expect(deleted?.name).toBe(createdPersons[2].name)
        expect(personsAfterDeletion.length).toBe(2)
        expect(
          personsAfterDeletion.findIndex(
            (p) => p.name === createdPersons[2].name
          )
        ).toBe(-1)
      })

      test('returns undefined if not successful', async () => {
        const deleted = await offlinePersonDao.deleteById(
          'id2',
          'non-existent-id'
        )
        const personsAfterDeletion = await offlinePersonDao.getAll('id2')

        expect(deleted).toBeUndefined()
        expect(personsAfterDeletion.length).toBe(1)

        const deletedNoOwner = await offlinePersonDao.deleteById('id4', 'test1')

        expect(deletedNoOwner).toBeUndefined()
      })
    })
  })
})
