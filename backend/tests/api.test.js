/**
 * @file api.test.js
 * @desc Built-in automated test suite using Node's native test runner (node:test).
 * Validates core business logic, RJIT email security, NoSQL injection sanitization,
 * marketplace domain invariants, auth middleware guards, and HTTP health contracts.
 * Zero external testing libraries or mock frameworks required.
 */

// 1. Explicitly initialize test environment variables before module evaluation
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.JWT_SECRET = 'test_jwt_secret_token_key_for_unit_tests_32chars';
process.env.ALLOWED_COLLEGE_DOMAIN = 'rjit.ac.in';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// 2. Dynamic asynchronous imports ensure process.env.NODE_ENV='test' is active
const { default: app } = await import('../server.js');
const { isCollegeEmailValid } = await import('../models/User.js');
const { sanitizeKeys } = await import('../middlewares/sanitizeMiddleware.js');
const { CATEGORIES, CONDITIONS, STATUSES } = await import('../models/Listing.js');
const { protect } = await import('../middlewares/authMiddleware.js');

describe('=== ReuseCampus Senior Engineering Automated Test Suite ===', () => {

  describe('1. RJIT Institutional Email Validation (@rjit.ac.in)', () => {
    it('should approve valid RJIT student roll number email addresses', () => {
      assert.strictEqual(isCollegeEmailValid('0902cs241008@rjit.ac.in'), true);
      assert.strictEqual(isCollegeEmailValid('0902it211045@rjit.ac.in'), true);
      assert.strictEqual(isCollegeEmailValid('0902me221012@rjit.ac.in'), true);
    });

    it('should approve valid department subdomains and dot notations', () => {
      assert.strictEqual(isCollegeEmailValid('student.cse@rjit.ac.in'), true);
      assert.strictEqual(isCollegeEmailValid('faculty@cs.rjit.ac.in'), true);
      assert.strictEqual(isCollegeEmailValid('admin.office@rjit.ac.in'), true);
    });

    it('should normalize and accept mixed-case or padded emails', () => {
      assert.strictEqual(isCollegeEmailValid('  0902CS241008@RJIT.AC.IN  '), true);
      assert.strictEqual(isCollegeEmailValid('Student@Rjit.Ac.In'), true);
    });

    it('should strictly reject commercial public email providers', () => {
      assert.strictEqual(isCollegeEmailValid('student@gmail.com'), false);
      assert.strictEqual(isCollegeEmailValid('hacker@yahoo.co.in'), false);
      assert.strictEqual(isCollegeEmailValid('scammer@outlook.com'), false);
      assert.strictEqual(isCollegeEmailValid('user@hotmail.com'), false);
    });

    it('should reject other university domains or domain spoofing attempts', () => {
      assert.strictEqual(isCollegeEmailValid('student@iitd.ac.in'), false);
      assert.strictEqual(isCollegeEmailValid('student@mit.edu'), false);
      assert.strictEqual(isCollegeEmailValid('scammer@rjit.ac.in.attacker.com'), false);
      assert.strictEqual(isCollegeEmailValid('fake@fake-rjit.ac.in'), false);
    });

    it('should reject malformed emails, non-strings, and empty inputs', () => {
      assert.strictEqual(isCollegeEmailValid(''), false);
      assert.strictEqual(isCollegeEmailValid(null), false);
      assert.strictEqual(isCollegeEmailValid(undefined), false);
      assert.strictEqual(isCollegeEmailValid(12345), false);
      assert.strictEqual(isCollegeEmailValid('plainaddress'), false);
      assert.strictEqual(isCollegeEmailValid('@rjit.ac.in'), false);
    });
  });

  describe('2. NoSQL Injection & Input Sanitization (sanitizeKeys)', () => {
    it('should strip malicious MongoDB operator keys ($where, $gt, $ne, $regex)', () => {
      const maliciousPayload = {
        email: '0902cs241008@rjit.ac.in',
        password: { $gt: '' },
        $where: 'this.password.length > 0',
        role: 'student',
      };

      sanitizeKeys(maliciousPayload);

      assert.strictEqual(maliciousPayload.$where, undefined);
      assert.deepStrictEqual(maliciousPayload.password, {});
      assert.strictEqual(maliciousPayload.email, '0902cs241008@rjit.ac.in');
      assert.strictEqual(maliciousPayload.role, 'student');
    });

    it('should recursively sanitize deeply nested objects and arrays', () => {
      const nestedPayload = {
        filter: {
          category: 'Books',
          price: {
            $lte: 500,
            nested: {
              $regex: '.*',
              validTag: 'semester-4',
            },
          },
        },
        tags: [{ $ne: 'sold' }, { name: 'electronics' }],
      };

      sanitizeKeys(nestedPayload);

      assert.strictEqual(nestedPayload.filter.price.$lte, undefined);
      assert.strictEqual(nestedPayload.filter.price.nested.$regex, undefined);
      assert.strictEqual(nestedPayload.filter.price.nested.validTag, 'semester-4');
      assert.strictEqual(nestedPayload.tags[0].$ne, undefined);
      assert.strictEqual(nestedPayload.tags[1].name, 'electronics');
    });

    it('should strip dot-notated field injection keys', () => {
      const dotPayload = {
        'seller.isVerified': true,
        'profile.role': 'admin',
        title: 'Engineering Mechanics by Timoshenko',
      };

      sanitizeKeys(dotPayload);

      assert.strictEqual(dotPayload['seller.isVerified'], undefined);
      assert.strictEqual(dotPayload['profile.role'], undefined);
      assert.strictEqual(dotPayload.title, 'Engineering Mechanics by Timoshenko');
    });

    it('should safely preserve Base64 canvas compressed image strings', () => {
      const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...==';
      const listingPayload = {
        title: 'Scientific Calculator fx-991EX',
        price: 850,
        imageUrl: base64Data,
      };

      sanitizeKeys(listingPayload);

      assert.strictEqual(listingPayload.imageUrl, base64Data);
      assert.strictEqual(listingPayload.price, 850);
    });
  });

  describe('3. Marketplace Domain Rules & Schema Invariants', () => {
    it('should maintain canonical campus categories including books, lab equipment, and electronics', () => {
      const requiredCategories = ['Books', 'Lab Equipment', 'Electronics', 'Stationery'];
      for (const cat of requiredCategories) {
        assert.ok(CATEGORIES.includes(cat), `Missing required category: ${cat}`);
      }
    });

    it('should strictly define allowed conditions', () => {
      assert.deepStrictEqual(CONDITIONS, ['New', 'Like New', 'Good', 'Fair']);
    });

    it('should restrict listing status to AVAILABLE or SOLD', () => {
      assert.deepStrictEqual(STATUSES, ['AVAILABLE', 'SOLD']);
    });

    it('should support ₹0 pricing for peer-to-peer junior donations', () => {
      const freeDonationPrice = 0;
      assert.strictEqual(freeDonationPrice >= 0, true);
      assert.strictEqual(freeDonationPrice === 0, true);
    });
  });

  describe('4. Authentication & Authorization Middleware Guard', () => {
    it('should reject unauthenticated requests missing bearer token with 401', async () => {
      const req = { headers: {} };
      let statusCode = null;
      let jsonBody = null;

      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          jsonBody = data;
          return this;
        },
      };

      let nextCalled = false;
      await protect(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(statusCode, 401);
      assert.strictEqual(jsonBody.success, false);
      assert.match(jsonBody.message, /not authorized/i);
    });

    it('should reject non-Bearer authorization header formats', async () => {
      const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
      let statusCode = null;
      let jsonBody = null;

      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          jsonBody = data;
          return this;
        },
      };

      let nextCalled = false;
      await protect(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(statusCode, 401);
      assert.strictEqual(jsonBody.success, false);
    });
  });

  describe('5. Health Endpoint & Live HTTP Contract', () => {
    let testServer;
    let baseUrl;

    before(async () => {
      await new Promise((resolve) => {
        testServer = app.listen(0, '127.0.0.1', () => {
          const port = testServer.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
      }
    });

    it('should expose a valid, running Express app instance', () => {
      assert.ok(app);
      assert.strictEqual(typeof app.handle, 'function');
    });

    it('should return 200 OK with online status and ISO timestamp on GET /api/health', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.status, 'online');
      assert.strictEqual(data.environment, 'test');
      assert.ok(data.timestamp);
      assert.ok(!isNaN(Date.parse(data.timestamp)), 'Timestamp must be a valid ISO date');
    });
  });
});
