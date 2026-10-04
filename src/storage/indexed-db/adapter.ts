import { localRecordSchema } from '../../domain/schemas/foundation'
import type { LocalRecord } from '../../domain/types'

export interface RecordStorage {
  get(id: string): Promise<LocalRecord | undefined>
  list(): Promise<LocalRecord[]>
  put(record: LocalRecord): Promise<void>
  remove(id: string): Promise<void>
  commit(change: { put?: readonly LocalRecord[]; remove?: readonly string[] }): Promise<void>
  close(): void
}

// The generic store is infrastructure only. Future phases define module schemas.
export function createRecordStorage(databaseName = 'fitness-os-local'): RecordStorage {
  let database: Promise<IDBDatabase> | undefined
  function open(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) return Promise.reject(new Error('Local records require browser IndexedDB.'))
    database ??= new Promise((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1)
      request.onupgradeneeded = () => { request.result.createObjectStore('records', { keyPath: 'id' }) }
      request.onerror = () => { database = undefined; reject(new Error('Local storage could not open. Export your records before clearing site data.')) }
      request.onblocked = () => { database = undefined; reject(new Error('Close other Fitness OS tabs and retry opening local storage.')) }
      request.onsuccess = () => {
        request.result.onversionchange = () => { request.result.close(); database = undefined }
        resolve(request.result)
      }
    })
    return database
  }
  async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', mode)
      const request = operation(transaction.objectStore('records'))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(new Error('Local data operation failed. Existing records have been preserved.'))
      transaction.onabort = () => reject(new Error('Local data operation was aborted. Nothing was saved.'))
    })
  }
  return {
    async get(id) { const record: unknown = await transact('readonly', (store) => store.get(id)); return record === undefined ? undefined : localRecordSchema.parse(record) },
    async list() {
      const records: unknown[] = await transact('readonly', (store) => store.getAll())
      return records.map((record) => localRecordSchema.parse(record))
    },
    async put(record) { const valid = localRecordSchema.parse(record); await transact('readwrite', (store) => store.put(valid)) },
    async remove(id) { await transact('readwrite', (store) => store.delete(id)) },
    async commit(change) {
      const records = (change.put ?? []).map((record) => localRecordSchema.parse(record))
      const db = await open()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('records', 'readwrite'), recordStore = transaction.objectStore('records')
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(new Error('Local data changes failed. Existing records were preserved.'))
        transaction.onabort = () => reject(new Error('Local changes were aborted. Nothing was saved.'))
        try { records.forEach((record) => recordStore.put(record)); (change.remove ?? []).forEach((id) => recordStore.delete(id)) }
        catch { transaction.abort() }
      })
    },
    close() { if (database) { void database.then((db) => db.close()).catch(() => undefined); database = undefined } },
  }
}
