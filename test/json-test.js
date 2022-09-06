/*
	JSON Kit

	Copyright (c) 2016 - 2022 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

/* global describe, it, before, after */

"use strict" ;



var fs = require( 'fs' ) ;
var json = require( '..' ) ;





/* Helpers */



function testStringifyEq( stringify , v ) {
	expect( stringify( v ) )
		.to.be( JSON.stringify( v ) ) ;
}

function testParseEq( parse , s ) {
	expect( JSON.stringify(
		parse( s )
	) )
		.to.be( JSON.stringify(
			JSON.parse( s )
		) ) ;
}

function testParseEqAlt( parse , s , s2 ) {
	expect( JSON.stringify(
		parse( s )
	) )
		.to.be( JSON.stringify(
			JSON.parse( s2 )
		) ) ;
}




/* Tests */



describe( "JSON stringify" , () => {

	it( "basic test" , () => {
		var stringify = json.stringifier( {} ) ;

		testStringifyEq( stringify , undefined ) ;
		testStringifyEq( stringify , null ) ;
		testStringifyEq( stringify , true ) ;
		testStringifyEq( stringify , false ) ;

		testStringifyEq( stringify , 0 ) ;
		testStringifyEq( stringify , 0.0000000123 ) ;
		testStringifyEq( stringify , -0.0000000123 ) ;
		testStringifyEq( stringify , 1234 ) ;
		testStringifyEq( stringify , -1234 ) ;
		testStringifyEq( stringify , NaN ) ;
		testStringifyEq( stringify , Infinity ) ;
		testStringifyEq( stringify , -Infinity ) ;

		testStringifyEq( stringify , '' ) ;
		testStringifyEq( stringify , '0' ) ;
		testStringifyEq( stringify , '1' ) ;
		testStringifyEq( stringify , '123' ) ;
		testStringifyEq( stringify , 'A' ) ;
		testStringifyEq( stringify , 'ABC' ) ;
		testStringifyEq( stringify , '\ta"b"c\n\rAB\tC\né~\'#&|_\\-ł"»¢/æ//nĸ^' ) ;
		testStringifyEq( stringify , '\t\v\x00\x01\x7f\x1fa\x7fa' ) ;

		testStringifyEq( stringify , {} ) ;
		testStringifyEq( stringify , { a: 1 , b: '2' } ) ;
		testStringifyEq( stringify , {
			a: 1 , b: '2' , c: true , d: null , e: undefined
		} ) ;
		testStringifyEq( stringify , { a: 1 ,
			b: '2' ,
			sub: {
				c: true , d: null , e: undefined , sub: { f: '' }
			} } ) ;

		testStringifyEq( stringify , [] ) ;
		testStringifyEq( stringify , [ 1 , '2' ] ) ;
		testStringifyEq( stringify , [ 1 , '2' , [ null , undefined , true ] ] ) ;

		testStringifyEq( stringify , require( '../sample/sample1.json' ) ) ;
		testStringifyEq( stringify , require( '../sample/stringFlatObject.js' ) ) ;

		// Investigate why it does not work
		//testStringifyEq( stringify , require( '../sample/garbageStringObject.js' ) ) ;
	} ) ;

	it( "functions" , () => {
		var stringify = json.stringifier( {} ) ;
		expect( stringify( { a: 1 , fn: () => null } ) ).to.be( '{"a":1,"fn":null}' ) ;
	} ) ;
	
	it( "depth limit" , () => {
		var stringify = json.stringifier( { depth: 2 } ) ;

		var o = {
			a: 1 ,
			b: 2 ,
			c: {
				d: 4 ,
				e: 5
			}
		} ;

		expect( stringify( o , 1 ) ).to.be( '{"a":1,"b":2,"c":null}' ) ;
		expect( stringify( o , 2 ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		expect( stringify( o ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		o = {
			a: a ,
			b: b
		} ;

		expect( stringify( a ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( a , 2 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( a , 3 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( stringify( a , 4 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;

		expect( stringify( o ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":null},"b":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( o , 2 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":null},"b":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( o , 3 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( stringify( o , 4 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;
	} ) ;

	it( "document depth limit (roots-db compatible)" , () => {
		var stringify = json.stringifier( { documentDepth: 2 } ) ;

		var o = {
			a: 1 ,
			b: 2 ,
			c: {
				d: 4 ,
				e: 5
			}
		} ;

		Object.defineProperty( o , '_' , { value: {} } ) ;

		expect( stringify( o , 1 ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		expect( stringify( o , 2 ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		expect( stringify( o ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;

		Object.defineProperty( o.c , '_' , { value: {} } ) ;

		expect( stringify( o , 1 ) ).to.be( '{"a":1,"b":2,"c":null}' ) ;
		expect( stringify( o , 2 ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;
		expect( stringify( o ) ).to.be( '{"a":1,"b":2,"c":{"d":4,"e":5}}' ) ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		o = {
			a: a ,
			b: b
		} ;

		Object.defineProperty( o , '_' , { value: {} } ) ;
		Object.defineProperty( a , '_' , { value: {} } ) ;
		Object.defineProperty( b , '_' , { value: {} } ) ;

		expect( stringify( a ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( a , 2 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( a , 3 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( stringify( a , 4 ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;

		expect( stringify( o ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":null},"b":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( o , 2 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":null},"b":{"k4":1,"k5":2,"k6":null}}' ) ;
		expect( stringify( o , 3 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}}' ) ;
		expect( stringify( o , 4 ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":null}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":null}}}}' ) ;
	} ) ;

	it( "circular ref notation" , () => {
		var stringify = json.stringifier( { circularRefNotation: true } ) ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		var o = {
			a: a ,
			b: b
		} ;

		expect( stringify( a ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}}' ) ;
		expect( stringify( o ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"@@ref@@":-2}}}}' ) ;
	} ) ;

	it( "unique ref notation" , () => {
		var stringify = json.stringifier( { uniqueRefNotation: true } ) ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		var o = {
			a: a ,
			b: b
		} ;

		expect( stringify( a ) ).to.be( '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":[]}}}' ) ;
		expect( stringify( o ) ).to.be( '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":["a"]}}},"b":{"@@ref@@":["a","k3"]}}' ) ;
	} ) ;

	it( "property masks" , () => {
		var stringify = json.stringifier( { propertyMask: true } ) ;
		var o , mask ;

		o = {
			a: 'A' ,
			b: 2 ,
			c: 'three' ,
			sub: {
				d: 'dee!' ,
				f: 5 ,
				sub: {
					g: 'gee'
				} ,
				array: [
					{
						title: 'One two' ,
						text: 'blah'
					} ,
					{
						title: 'You should know that!' ,
						text: 'blah'
					} ,
					{
						title: '10 things about nothing' ,
						text: 'blah blih'
					}
				]
			}
		} ;

		mask = {
			a: true ,
			sub: {
				f: true ,
				sub: {
					g: true
				} ,
				array: {
					title: true
				}
			}
		} ;

		expect( stringify( o , mask ) ).to.be( '{"a":"A","sub":{"f":5,"sub":{"g":"gee"},"array":[{"title":"One two"},{"title":"You should know that!"},{"title":"10 things about nothing"}]}}' ) ;

		mask = {
			a: true ,
			sub: {
				f: true ,
				sub: true ,
				array: true
			}
		} ;

		expect( stringify( o , mask ) ).to.be( '{"a":"A","sub":{"f":5,"sub":{"g":"gee"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}}' ) ;
	} ) ;

	it( "local enumerate" , () => {
		var stringify = json.stringifier( { localEnumerate: true , documentDepth: 3 } ) ;
		var stringifyStd = json.stringifier() ;
		var o , mask ;

		o = {
			a: 'A' ,
			b: 2 ,
			c: 'three' ,
			sub: {
				d: 'dee!' ,
				f: 5 ,
				sub: {
					g: 'gee'
				} ,
				array: [
					{
						title: 'One two' ,
						text: 'blah'
					} ,
					{
						title: 'You should know that!' ,
						text: 'blah'
					} ,
					{
						title: '10 things about nothing' ,
						text: 'blah blih'
					}
				]
			}
		} ;
		//stringify( o , mask ) ;
		//return ;

		Object.defineProperty( o , '__enumerate__' , { configurable: true , value: () => [ 'a' , 'b' ] } ) ;
		expect( stringify( o , mask ) ).to.be( '{"a":"A","b":2}' ) ;
		expect( stringifyStd( o , mask ) ).to.be( '{"a":"A","b":2,"c":"three","sub":{"d":"dee!","f":5,"sub":{"g":"gee"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}}' ) ;

		Object.defineProperty( o , '__enumerate__' , { configurable: true , value: () => [ 'a' , 'sub' ] } ) ;
		Object.defineProperty( o.sub , '__enumerate__' , { configurable: true , value: () => [ 'f' , 'sub' ] } ) ;
		expect( stringify( o , mask ) ).to.be( '{"a":"A","sub":{"f":5,"sub":{"g":"gee"}}}' ) ;
		expect( stringifyStd( o , mask ) ).to.be( '{"a":"A","b":2,"c":"three","sub":{"d":"dee!","f":5,"sub":{"g":"gee"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}}' ) ;
		
		// Test the documentDepth feature
		Object.defineProperty( o , '_' , { configurable: true , value: {} } ) ;
		Object.defineProperty( o.sub , '_' , { configurable: true , value: {} } ) ;
		Object.defineProperty( o , '__enumerate__' , { configurable: true , value: ( depth ) => {
			return [ 'a' , 'sub' ] ;
		} } ) ;
		Object.defineProperty( o.sub , '__enumerate__' , { configurable: true , value: ( depth ) => {
			return depth > 1 ? [ 'd' , 'sub' ] : [ 'sub' ] ;
		} } ) ;
		expect( stringify( o , mask ) ).to.be( '{"a":"A","sub":{"d":"dee!","sub":{"g":"gee"}}}' ) ;	// Depth: 1
		expect( stringify( o.sub , mask ) ).to.be( '{"sub":{"g":"gee"}}' ) ;	// Depth:0
		expect( stringifyStd( o , mask ) ).to.be( '{"a":"A","b":2,"c":"three","sub":{"d":"dee!","f":5,"sub":{"g":"gee"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}}' ) ;
		expect( stringifyStd( o.sub , mask ) ).to.be( '{"d":"dee!","f":5,"sub":{"g":"gee"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}' ) ;
	} ) ;

	it( "ordered keys" , () => {
		var stringify = json.stringifier( { orderedKeys: true } ) ;
		var stringifyStd = json.stringifier() ;
		var o ;

		o = {
			akey: 'A' ,
			anotherkey: 1 ,
			yetanotherkey: 2 ,
			aKeyCamel: 'three' ,
			AKEY: 'four' ,
			sub: {
				someKey: 'five' ,
				omgAKey: 6 ,
				sub: {
					whatAKey: 'seven' ,
					stillAKey: 'eight'
				} ,
				array: [
					{
						title: 'One two' ,
						text: 'blah'
					} ,
					{
						title: 'You should know that!' ,
						text: 'blah'
					} ,
					{
						title: '10 things about nothing' ,
						text: 'blah blih'
					}
				]
			}
		} ;

		expect( stringifyStd( o ) ).to.be( '{"akey":"A","anotherkey":1,"yetanotherkey":2,"aKeyCamel":"three","AKEY":"four","sub":{"someKey":"five","omgAKey":6,"sub":{"whatAKey":"seven","stillAKey":"eight"},"array":[{"title":"One two","text":"blah"},{"title":"You should know that!","text":"blah"},{"title":"10 things about nothing","text":"blah blih"}]}}' ) ;
		expect( stringify( o ) ).to.be( '{"akey":"A","AKEY":"four","aKeyCamel":"three","anotherkey":1,"sub":{"array":[{"text":"blah","title":"One two"},{"text":"blah","title":"You should know that!"},{"text":"blah blih","title":"10 things about nothing"}],"omgAKey":6,"someKey":"five","sub":{"stillAKey":"eight","whatAKey":"seven"}},"yetanotherkey":2}' ) ;
	} ) ;

	it( "indentation" , () => {
		var stringify = json.stringifier( { indent: '    ' } ) ;

		var o = {
			a: 1 ,
			b: {
				c: 3 ,
				d: 4 ,
				e: {
					f: 6 ,
					g: 7
				}
			} ,
			h: {
				i: 9 ,
				j: 10
			} ,
			k: [ 'a' , 'b' , 'c' , true , false , null , [ 0 , 1 , 2 , 3 ] , {} , [] ] ,
			i: {} ,
			j: []
		} ;

		//console.log( "JSON - pretty print:\n" + stringify( o ) ) ;
		expect( stringify( o ) ).to.be( '{\n    "a": 1,\n    "b": {\n        "c": 3,\n        "d": 4,\n        "e": {\n            "f": 6,\n            "g": 7\n        }\n    },\n    "h": {\n        "i": 9,\n        "j": 10\n    },\n    "k": [\n        "a",\n        "b",\n        "c",\n        true,\n        false,\n        null,\n        [\n            0,\n            1,\n            2,\n            3\n        ],\n        {},\n        []\n    ],\n    "i": {},\n    "j": []\n}' ) ;
	} ) ;
} ) ;



describe( "JSON parse" , () => {

	it( "basic test" , () => {
		var parse = json.parser( {} ) ;

		testParseEq( parse , 'null' ) ;
		testParseEq( parse , 'true' ) ;
		testParseEq( parse , 'false' ) ;

		testParseEq( parse , '0' ) ;
		testParseEq( parse , '1' ) ;
		testParseEq( parse , '123' ) ;
		testParseEq( parse , '-123' ) ;
		testParseEq( parse , '123.456' ) ;
		testParseEq( parse , '-123.456' ) ;
		testParseEq( parse , '0.123' ) ;
		testParseEq( parse , '-0.123' ) ;
		testParseEq( parse , '0.00123' ) ;
		testParseEq( parse , '-0.00123' ) ;

		testParseEq( parse , '""' ) ;
		testParseEq( parse , '"abc"' ) ;
		testParseEq( parse , '"abc\\"def"' ) ;
		testParseEq( parse , '"abc\\ndef\\tghi\\rjkl"' ) ;
		testParseEq( parse , '"abc\\u0000\\u007f\\u0061def\\"\\"jj"' ) ;

		testParseEq( parse , '{}' ) ;
		testParseEq( parse , '{"a":1}' ) ;
		testParseEq( parse , '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false}' ) ;
		testParseEq( parse , '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":{},"i":{"j":"J!"}}}' ) ;

		testParseEq( parse , '[]' ) ;
		testParseEq( parse , '[1,2,3]' ) ;
		testParseEq( parse , '[-12,1.5,"toto",true,false,null,0.3]' ) ;
		testParseEq( parse , '[-12,1.5,"toto",true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;

		testParseEq( parse , '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
		testParseEq( parse , '[-12,1.5,"toto",{"g":123,"h":[1,2,3],"i":["j","J!"]},true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;

		testParseEq( parse , ' { "a" :   1 , "b":  \n"string",\n  "c":"" \t,\n\t"d" :   null,"e":true,   "f"   :   false  , "sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;

		testParseEq( parse , fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ) ;
	} ) ;

	it( "depth limit" , () => {
		var parse = json.parser( { depth: 2 } ) ;

		var oJson ;

		oJson = '{"a":1,"b":2,"c":{"d":4,"e":5},"f":6}' ;
		expect( parse( oJson , 1 ) ).to.equal( {
			a: 1 , b: 2 , c: undefined , f: 6
		} ) ;
		expect( parse( oJson , 2 ) ).to.equal( {
			a: 1 , b: 2 , c: { d: 4 , e: 5 } , f: 6
		} ) ;
		expect( parse( oJson ) ).to.equal( {
			a: 1 , b: 2 , c: { d: 4 , e: 5 } , f: 6
		} ) ;

		oJson = '{"a":1,"b":2,"c":{"nasty\\n\\"key}}]][{":"nasty[value{}}}]]"},"f":6}' ;
		expect( json.parser( { depth: 1 } )( oJson ) ).to.equal( {
			a: 1 , b: 2 , c: undefined , f: 6
		} ) ;
	} ) ;

	it( "circular ref notation" , () => {
		var parse = json.parser( { refNotation: true } ) ;

		var aJson = '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}}' ;
		var oJson = '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":-2}}},"b":{"k4":1,"k5":2,"k6":{"k1":1,"k2":2,"k3":{"@@ref@@":-2}}}}' ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		var o = {
			a: a ,
			b: b
		} ;

		var aParsed = parse( aJson ) ;
		expect( aParsed ).to.only.have.own.keys( 'k1' , 'k2' , 'k3' ) ;
		expect( aParsed.k1 ).to.be( 1 ) ;
		expect( aParsed.k2 ).to.be( 2 ) ;
		expect( aParsed.k3 ).to.only.have.own.keys( 'k4' , 'k5' , 'k6' ) ;
		expect( aParsed.k3.k4 ).to.be( 1 ) ;
		expect( aParsed.k3.k5 ).to.be( 2 ) ;
		expect( aParsed.k3.k6 ).to.be( aParsed ) ;

		var oParsed = parse( oJson ) ;
		expect( oParsed ).to.only.have.own.keys( 'a' , 'b' ) ;
		expect( oParsed.a ).to.only.have.own.keys( 'k1' , 'k2' , 'k3' ) ;
		expect( oParsed.a.k1 ).to.be( 1 ) ;
		expect( oParsed.a.k2 ).to.be( 2 ) ;
		expect( oParsed.b ).to.only.have.own.keys( 'k4' , 'k5' , 'k6' ) ;
		expect( oParsed.b.k4 ).to.be( 1 ) ;
		expect( oParsed.b.k5 ).to.be( 2 ) ;
		expect( oParsed.a.k3.k6 ).to.be( oParsed.a ) ;
		expect( oParsed.b.k6.k3 ).to.be( oParsed.b ) ;
	} ) ;

	it( "unique ref notation" , () => {
		var parse = json.parser( { refNotation: true } ) ;

		var aJson = '{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":[]}}}' ;
		var oJson = '{"a":{"k1":1,"k2":2,"k3":{"k4":1,"k5":2,"k6":{"@@ref@@":["a"]}}},"b":{"@@ref@@":["a","k3"]}}' ;

		var a = {
			k1: 1 ,
			k2: 2
		} ;

		var b = {
			k4: 1 ,
			k5: 2
		} ;

		a.k3 = b ;
		b.k6 = a ;

		var o = {
			a: a ,
			b: b
		} ;

		var aParsed = parse( aJson ) ;
		//console.log( '\n\naParsed:' , aParsed ) ;
		expect( aParsed ).to.only.have.own.keys( 'k1' , 'k2' , 'k3' ) ;
		expect( aParsed.k1 ).to.be( 1 ) ;
		expect( aParsed.k2 ).to.be( 2 ) ;
		expect( aParsed.k3 ).to.only.have.own.keys( 'k4' , 'k5' , 'k6' ) ;
		expect( aParsed.k3.k4 ).to.be( 1 ) ;
		expect( aParsed.k3.k5 ).to.be( 2 ) ;
		expect( aParsed.k3.k6 ).to.be( aParsed ) ;

		//console.log( "\n\n" ) ;

		var oParsed = parse( oJson ) ;
		//console.log( '\n\noParsed:' , oParsed ) ;
		expect( oParsed ).to.only.have.own.keys( 'a' , 'b' ) ;
		expect( oParsed.a ).to.only.have.own.keys( 'k1' , 'k2' , 'k3' ) ;
		expect( oParsed.a.k1 ).to.be( 1 ) ;
		expect( oParsed.a.k2 ).to.be( 2 ) ;
		expect( oParsed.b ).to.only.have.own.keys( 'k4' , 'k5' , 'k6' ) ;
		expect( oParsed.b.k4 ).to.be( 1 ) ;
		expect( oParsed.b.k5 ).to.be( 2 ) ;
		expect( oParsed.a.k3.k6 ).to.be( oParsed.a ) ;
		expect( oParsed.b.k6.k3 ).to.be( oParsed.b ) ;

		expect( oParsed.a.k3 ).to.be( oParsed.b ) ;
		expect( oParsed.b.k6 ).to.be( oParsed.a ) ;
	} ) ;
} ) ;



describe( "JSON stringify + parse with the ref notation" , () => {

	it( "big test" , () => {
		var stringify = json.stringifier( { uniqueRefNotation: true } ) ;
		var parse = json.parser( { refNotation: true } ) ;

		var sample = require( '../sample/sample1.json' ) ;
		var sampleJson = JSON.stringify( sample ) ;

		var o = {
			a: sample ,
			b: {
				c: "some data" ,
				d: sample
			} ,
			e: "some data" ,
			f: {
				g: [ "some data" , sample , "some data" , sample ]
			}
		} ;

		var json1 = stringify( o ) ;

		expect( json1 ).to.be(
			'{"a":' + sampleJson + ',"b":{"c":"some data","d":{"@@ref@@":["a"]}},"e":"some data","f":{"g":["some data",{"@@ref@@":["a"]},"some data",{"@@ref@@":["a"]}]}}'
		) ;

		var r = parse( json1 ) ;
		expect( r ).to.equal( o ) ;
		expect( r.b.d ).to.be( r.a ) ;
		expect( r.f.g[ 1 ] ).to.be( r.a ) ;
		expect( r.f.g[ 3 ] ).to.be( r.a ) ;


		// Test ref to an array
		o = {
			a: [ "one" , 2 , sample , 4 , sample ] ,
			b: {
				c: "some data" ,
				d: sample
			} ,
			e: "some data" ,
			f: {
				g: [ "some data" , sample , "some data" , sample ]
			}
		} ;

		var json2 = stringify( o ) ;

		expect( json2 ).to.be(
			'{"a":["one",2,' + sampleJson + ',4,{"@@ref@@":["a",2]}],"b":{"c":"some data","d":{"@@ref@@":["a",2]}},"e":"some data","f":{"g":["some data",{"@@ref@@":["a",2]},"some data",{"@@ref@@":["a",2]}]}}'
		) ;

		r = parse( json2 ) ;
		expect( r ).to.equal( o ) ;
		expect( r.a[ 2 ] ).to.be( r.b.d ) ;
		expect( r.a[ 4 ] ).to.be( r.b.d ) ;
		expect( r.f.g[ 1 ] ).to.be( r.b.d ) ;
		expect( r.f.g[ 3 ] ).to.be( r.b.d ) ;
	} ) ;
} ) ;



describe( "LXON stringify + parse with the ref notation" , () => {
	it( "LXON unquoted keys test" , () => {
		var parse = json.parser( { lxonUnquotedKeys: true } ) ;

		testParseEq( parse , 'null' ) ;
		testParseEq( parse , 'true' ) ;
		testParseEq( parse , 'false' ) ;

		testParseEq( parse , '0' ) ;
		testParseEq( parse , '1' ) ;
		testParseEq( parse , '123' ) ;
		testParseEq( parse , '-123' ) ;
		testParseEq( parse , '123.456' ) ;
		testParseEq( parse , '-123.456' ) ;
		testParseEq( parse , '0.123' ) ;
		testParseEq( parse , '-0.123' ) ;
		testParseEq( parse , '0.00123' ) ;
		testParseEq( parse , '-0.00123' ) ;

		testParseEq( parse , '""' ) ;
		testParseEq( parse , '"abc"' ) ;
		testParseEq( parse , '"abc\\"def"' ) ;
		testParseEq( parse , '"abc\\ndef\\tghi\\rjkl"' ) ;
		testParseEq( parse , '"abc\\u0000\\u007f\\u0061def\\"\\"jj"' ) ;

		testParseEq( parse , '{}' ) ;
		testParseEq( parse , '{"a":1}' ) ;
		testParseEq( parse , '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false}' ) ;
		testParseEq( parse , '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":{},"i":{"j":"J!"}}}' ) ;

		testParseEqAlt( parse ,
			'{a:1}' ,
			'{"a":1}'
		) ;
		testParseEqAlt( parse ,
			'{a:1,key:"string", key2 :"", key3 :null, _$TrAnG3_k3Y:true}' ,
			'{"a":1,"key":"string","key2":"","key3":null,"_$TrAnG3_k3Y":true}'
		) ;
		testParseEqAlt( parse ,
			'{key:"string", sub : {  _$TrAnG3_k3Y:true } }' ,
			'{"key":"string","sub":{"_$TrAnG3_k3Y":true}}'
		) ;

		testParseEq( parse , '[]' ) ;
		testParseEq( parse , '[1,2,3]' ) ;
		testParseEq( parse , '[-12,1.5,"toto",true,false,null,0.3]' ) ;
		testParseEq( parse , '[-12,1.5,"toto",true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;

		testParseEq( parse , fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ) ;
		testParseEqAlt( parse ,
			fs.readFileSync( __dirname + '/../sample/sample1.lxon' ).toString() ,
			fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString()
		) ;
	} ) ;

	it( "Check that LXON unquoted keys are off by default" , () => {
		var parse = json.parser( {} ) ;

		expect( () => parse( '{a:1}' ) ).to.throw() ;
		expect( () => parse( '{ key : 1 }' ) ).to.throw() ;
	} ) ;

	it( "LXON new constants" , () => {
		var parse = json.parser( { lxonConstants: true } ) ;

		expect( parse( 'Infinity' ) ).to.be( Infinity ) ;
		expect( parse( 'infinity' ) ).to.be( Infinity ) ;
		expect( parse( 'NaN' ) ).to.be( NaN ) ;
		expect( parse( 'nan' ) ).to.be( NaN ) ;

		expect( parse( 'true' ) ).to.be( true ) ;
		expect( parse( 'false' ) ).to.be( false ) ;
		expect( parse( 'yes' ) ).to.be( true ) ;
		expect( parse( 'no' ) ).to.be( false ) ;
		expect( parse( 'on' ) ).to.be( true ) ;
		expect( parse( 'off' ) ).to.be( false ) ;
		expect( parse( 'null' ) ).to.be( null ) ;

		expect( parse( '-Infinity' ) ).to.be( - Infinity ) ;
		expect( parse( '- Infinity' ) ).to.be( - Infinity ) ;
	} ) ;

	it( "Check that LXON constants are off by default" , () => {
		var parse = json.parser( {} ) ;

		expect( () => parse( 'Infinity' ) ).to.throw() ;
		expect( () => parse( 'infinity' ) ).to.throw() ;
		expect( () => parse( 'NaN' ) ).to.throw() ;
		expect( () => parse( 'nan' ) ).to.throw() ;

		expect( () => parse( 'yes' ) ).to.throw() ;
		expect( () => parse( 'no' ) ).to.throw() ;
		expect( () => parse( 'on' ) ).to.throw() ;
		expect( () => parse( 'off' ) ).to.throw() ;

		expect( () => parse( '-Infinity' ) ).to.throw() ;
		expect( () => parse( '-infinity' ) ).to.throw() ;
	} ) ;
} ) ;



describe( "stringifyStream()" , () => {

	it( "empty input stream should output a stream of an empty array" , ( done ) => {
		var stringify = json.stringifier( {} ) ;
		var stream = json.stringifyStream( { stringifier: stringify } ) ;
		var str = '' ;

		stream.on( 'data' , ( data ) => {
			str += data.toString() ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( str ).to.be( '[]' ) ;
			done() ;
		} ) ;

		stream.end() ;
	} ) ;

	it( "when the input stream push some object, the output stream should push an array of object" , ( done ) => {
		var stringify = json.stringifier( {} ) ;
		var stream = json.stringifyStream( { stringifier: stringify } ) ;
		var str = '' ;

		stream.on( 'data' , ( data ) => {
			str += data.toString() ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( str ).to.be( '[{"a":1,"b":2,"c":"C"},{"toto":"titi"}]' ) ;
			done() ;
		} ) ;

		stream.write( { a: 1 , b: 2 , c: 'C' } ) ;
		stream.write( { toto: "titi" } ) ;
		stream.end() ;
	} ) ;
} ) ;



describe( "parseStream()" , () => {

	it( 'empty stream (i.e.: "[]")' , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '[]' ) ;
		stream.end() ;
	} ) ;

	it( "single object in one write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: 1 , b: 2 , c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '[ { "a": 1 , "b": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;

	it( "single string in one write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [ "nasty string, with comma, inside" ] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '[ "nasty string, with comma, inside" ]' ) ;
		stream.end() ;
	} ) ;

	it( "single object in two write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: 1 , b: 2 , c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '[ { "a": 1 , "b' ) ;
		stream.write( '": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;

	it( "single object in multiple write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: 1 , b: 2 , c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [ ' ) ;
		stream.write( '{ "a": ' ) ;
		stream.write( ' 1 , "b' ) ;
		stream.write( '": 2 , "' ) ;
		stream.write( 'c": "C" }' ) ;
		stream.write( '  ] ' ) ;
		stream.write( '  ' ) ;
		stream.end() ;
	} ) ;

	it( "multiple objects in one write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: 1 , b: 2 , c: 'C' } ,
				{ one: 1 } ,
				[ "two" , "three" ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '[{"a":1,"b":2,"c":"C"},{"one":1},[ "two" , "three" ] , true , false , null ]' ) ;
		stream.end() ;
	} ) ;

	it( "multiple objects in many write" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: 1 , b: 2 , c: 'C' } ,
				{ one: 1 } ,
				[ "two" , "three" ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [{ ' ) ;
		stream.write( '"a":1' ) ;
		stream.write( ',"b":2,' ) ;
		stream.write( '"c":"C"}' ) ;
		stream.write( ',' ) ;
		stream.write( '{"one":1},[ "tw' ) ;
		stream.write( 'o" , "thr' ) ;
		stream.write( 'ee" ] , tr' ) ;
		stream.write( 'ue , false , ' ) ;
		stream.write( 'n' ) ;
		stream.write( 'u' ) ;
		stream.write( 'll ]' ) ;
		stream.write( ' \n ' ) ;
		stream.end() ;
	} ) ;

	it( "multiple objects in many write with nasty strings" , ( done ) => {
		var parse = json.parser( {} ) ;
		var stream = json.parseStream( { parser: parse } ) ;
		var array = [] ;

		stream.on( 'data' , ( data ) => {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;

		stream.on( 'end' , ( data ) => {
			expect( array ).to.equal( [
				{ a: '  "  }  ' , b: 2 , c: '  C{[' } ,
				{ one: 1 } ,
				[ '  tw"}"}o' , '\\"thr\\ee\n' ] ,
				true ,
				false ,
				undefined
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;

		stream.write( '   ' ) ;
		stream.write( '  \n ' ) ;
		stream.write( '  \n [{ ' ) ;
		stream.write( '"a":"  \\"  }  "' ) ;
		stream.write( ',"b":2,' ) ;
		stream.write( '"c":"  C{["}' ) ;
		stream.write( ',' ) ;
		stream.write( '{"one":1},[ "  tw\\"}' ) ;
		stream.write( '\\"}o" , "\\\\\\"thr\\\\' ) ;
		stream.write( 'ee\\n" ] , tr' ) ;
		stream.write( 'ue , false , ' ) ;
		stream.write( 'n' ) ;
		stream.write( 'u' ) ;
		stream.write( 'll ]' ) ;
		stream.write( ' \n ' ) ;
		stream.end() ;
	} ) ;
} ) ;

