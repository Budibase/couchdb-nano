// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

const Nano = require('..')
const COUCH_URL = 'http://localhost:5984'
const nano = Nano(COUCH_URL)
const nock = require('nock')

afterEach(() => {
  nock.cleanAll()
})

test('should be able to get a list of documents - POST /db/_all_docs - db.list', async () => {
  // mocks
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        }
      },
      {
        id: '1000543',
        key: '1000543',
        value: {
          rev: '1-3256046064953e2f0fdb376211fe78ab'
        }
      },
      {
        id: '100077',
        key: '100077',
        value: {
          rev: '1-101bff1251d4bd75beb6d3c232d05a5c'
        }
      }
    ]
  }
  const scope = nock(COUCH_URL)
    .post('/db/_all_docs')
    .reply(200, response)

  // test GET /db/_all_docs
  const db = nano.db.use('db')
  const p = await db.list()
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})

test('should be able to get a list of documents with opts - POST /db/_all_docs - db.list', async () => {
  // mocks
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        },
        doc: {
          _id: '1000501',
          _rev: '2-46dcf6bf2f8d428504f5290e591aa182',
          a: 1,
          b: 2
        }
      }
    ]
  }
  const scope = nock(COUCH_URL)
    .post('/db/_all_docs')
    .reply(200, response)

  // test GET /db/_all_docs
  const db = nano.db.use('db')
  const p = await db.list({ include_docs: true, limit: 1 })
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})

test('should be able to handle 404 - POST /db/_all_docs - db.list', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  const scope = nock(COUCH_URL)
    .post('/db/_all_docs')
    .reply(404, response)

  // test GET /db/_all_docs
  const db = nano.db.use('db')
  await expect(db.list()).rejects.toThrow('missing')
  expect(scope.isDone()).toBe(true)
})
