var assert = require('assert');

import { parseHTML } from '../html-parser/parser';

describe('ADD', function () {
    
    it('<a></a>', function () {
        let tree = parseHTML('<a></a>');
        assert.strictEqual(tree.children[0].tagName, "a");
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href="aaa"></a>', function () {
        let tree = parseHTML('<a href="aaa"></a>');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href=\'aaa\'></a>', function () {
        let tree = parseHTML("<a xx=\'aaa\'></a>");
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href=aaa></a>', function () {
        let tree = parseHTML("<a xx=aaa ss = ss></a>");
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href="aaa" id="aa" ></ a>', function () {
        let tree = parseHTML('<a href = "aaa" id="aa"></a>');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href id></a>', function () {
        let tree = parseHTML('<a href id></a>');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a id></a>', function () {
        let tree = parseHTML('<a id></a>');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a href="aa" id></a>', function () {
        let tree = parseHTML('<a href="aa" id></a>');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a />', function () {
        let tree = parseHTML('<a />');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<A /> aa', function () {
        let tree = parseHTML('<A />');
        assert.strictEqual(tree.children[0].children.length, 0);
    });
    it('<a >aaa</a>', function () {
        let tree = parseHTML('<a>aaa</a>');
        assert.strictEqual(tree.children[0].children.length, 1);
    });
    it('<>', function () {
        let tree = parseHTML('<>');
        console.log(tree)
        assert.strictEqual(tree.children.length, 0);
    });
    it('<style >aaa</style>', function () {
        let tree = parseHTML('<style>aaa</style>');
        assert.strictEqual(tree.children[0].children.length, 1);
    });



});