import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import {
  createTestAccount,
  generateAuthHeaders,
  generateAuthHeadersForGet,
  createTestCardTemplate,
  createTestAccessPass,
  cleanupTestAccount,
  createPublishedCardTemplate,
} from '../helpers/test-utils';

const app = createApp();

describe('Access Pass API Integration Tests', () => {
  let testAccount: any;
  let testCardTemplate: any;

  beforeAll(async () => {
    // Create test account with STANDARD tier
    testAccount = await createTestAccount('STARTER');
    // Create a published card template for access pass testing
    testCardTemplate = await createPublishedCardTemplate(testAccount.account.accountId);
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestAccount(testAccount.account.accountId);
  });

  describe('POST /v1/access-passes - Issue Access Pass', () => {
    it('should issue a new access pass with valid authentication', async () => {
      const payload = {
        cardTemplateId: testCardTemplate.id,
        externalUserId: 'user123',
        metadata: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/access-passes')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('externalId');
      expect(response.body.data).toHaveProperty('status', 'ACTIVE');
      expect(response.body.data.metadata).toMatchObject(payload.metadata);
    });

    it('should fail without authentication headers', async () => {
      const payload = {
        cardTemplateId: testCardTemplate.id,
        externalUserId: 'user456',
      };

      const response = await request(app)
        .post('/v1/access-passes')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid signature', async () => {
      const payload = {
        cardTemplateId: testCardTemplate.id,
        externalUserId: 'user789',
      };

      const response = await request(app)
        .post('/v1/access-passes')
        .set({
          'X-ACCT-ID': testAccount.accountId,
          'X-PAYLOAD-SIG': 'invalid-signature',
        })
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid card template ID', async () => {
      const payload = {
        cardTemplateId: 'invalid-template-id',
        externalUserId: 'user999',
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/access-passes')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /v1/access-passes - List Access Passes', () => {
    let createdAccessPass: any;

    beforeAll(async () => {
      // Create an access pass for listing tests
      createdAccessPass = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'list-test-user',
          metadata: { name: 'List Test User' },
        }
      );
    });

    it('should list access passes for a card template', async () => {
      const sigPayload = {
        cardTemplateId: testCardTemplate.id,
        limit: 10,
        offset: 0,
      };

      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get('/v1/access-passes')
        .set(headers)
        .query({
          ...query,
          cardTemplateId: testCardTemplate.id,
          limit: 10,
          offset: 0,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('passes');
      expect(Array.isArray(response.body.data.passes)).toBe(true);
      expect(response.body.data.passes.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/v1/access-passes')
        .query({ cardTemplateId: testCardTemplate.id })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /v1/access-passes/:id - Update Access Pass', () => {
    let accessPassToUpdate: any;

    beforeAll(async () => {
      accessPassToUpdate = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'update-test-user',
          metadata: { name: 'Update Test User', version: 1 },
        }
      );
    });

    it('should update an access pass with valid authentication', async () => {
      const updatePayload = {
        metadata: {
          name: 'Updated User Name',
          version: 2,
          additionalField: 'new value',
        },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch(`/v1/access-passes/${accessPassToUpdate.id}`)
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.metadata).toMatchObject(updatePayload.metadata);
    });

    it('should fail to update non-existent access pass', async () => {
      const updatePayload = {
        metadata: { name: 'Should Fail' },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch('/v1/access-passes/non-existent-id')
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /v1/access-passes/:id/suspend - Suspend Access Pass', () => {
    let accessPassToSuspend: any;

    beforeAll(async () => {
      accessPassToSuspend = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'suspend-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should suspend an active access pass', async () => {
      const payload = { id: accessPassToSuspend.id };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToSuspend.id}/suspend`)
        .set(headers)
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'SUSPENDED');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToSuspend.id}/suspend`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /v1/access-passes/:id/resume - Resume Access Pass', () => {
    let accessPassToResume: any;

    beforeAll(async () => {
      accessPassToResume = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'resume-test-user',
          status: 'SUSPENDED',
        }
      );
    });

    it('should resume a suspended access pass', async () => {
      const payload = { id: accessPassToResume.id };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToResume.id}/resume`)
        .set(headers)
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'ACTIVE');
    });
  });

  describe('POST /v1/access-passes/:id/unlink - Unlink Access Pass', () => {
    let accessPassToUnlink: any;

    beforeAll(async () => {
      accessPassToUnlink = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'unlink-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should unlink an access pass', async () => {
      const payload = { id: accessPassToUnlink.id };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToUnlink.id}/unlink`)
        .set(headers)
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'UNLINKED');
    });
  });

  describe('POST /v1/access-passes/:id/delete - Delete Access Pass', () => {
    let accessPassToDelete: any;

    beforeAll(async () => {
      accessPassToDelete = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'delete-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should delete an access pass', async () => {
      const payload = { id: accessPassToDelete.id };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToDelete.id}/delete`)
        .set(headers)
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'DELETED');
    });
  });
});
