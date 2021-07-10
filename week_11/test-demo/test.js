var assert = require('assert');
import { add } from './add.js'

describe('ADD', function () {
    it('add 1+2 should be 4', function () {
        assert.strictEqual(add(1,2), 3);
    });
});