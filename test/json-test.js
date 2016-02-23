/*
	The Cedric's Swiss Knife (CSK) - CSK object tree toolbox test suite

	Copyright (c) 2014, 2015 Cédric Ronvel 
	
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

/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var fs = require( 'fs' ) ;
var json = require( '../lib/json.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Helpers */



function testStringifyEq( v )
{
	expect( json.stringify( v ) )
		.to.be( JSON.stringify( v ) ) ;
}

function testParseEq( s )
{
	expect( JSON.stringify(
			json.parse( s )
		) )
		.to.be( JSON.stringify(
			JSON.parse( s )
		) ) ;
}




			/* Tests */



describe( "JSON" , function() {
	
	it( "stringify()" , function() {
		
		testStringifyEq( undefined ) ;
		testStringifyEq( null ) ;
		testStringifyEq( true ) ;
		testStringifyEq( false ) ;
		
		testStringifyEq( 0 ) ;
		testStringifyEq( 0.0000000123 ) ;
		testStringifyEq( -0.0000000123 ) ;
		testStringifyEq( 1234 ) ;
		testStringifyEq( -1234 ) ;
		testStringifyEq( NaN ) ;
		testStringifyEq( Infinity ) ;
		testStringifyEq( - Infinity ) ;
		
		testStringifyEq( '' ) ;
		testStringifyEq( '0' ) ;
		testStringifyEq( '1' ) ;
		testStringifyEq( '123' ) ;
		testStringifyEq( 'A' ) ;
		testStringifyEq( 'ABC' ) ;
		testStringifyEq( '\ta"b"c\n\rAB\tC\né~\'#&|_\\-ł"»¢/æ//nĸ^' ) ;
		testStringifyEq( '\t\v\x00\x01\x7f\x1fa\x7fa' ) ;
		
		testStringifyEq( {} ) ;
		testStringifyEq( {a:1,b:'2'} ) ;
		testStringifyEq( {a:1,b:'2',c:true,d:null,e:undefined} ) ;
		testStringifyEq( {a:1,b:'2',sub:{c:true,d:null,e:undefined,sub:{f:''}}} ) ;
		
		testStringifyEq( [] ) ;
		testStringifyEq( [1,'2'] ) ;
		testStringifyEq( [1,'2',[null,undefined,true]] ) ;
		
		testStringifyEq( require( '../sample/sample1.json' ) ) ;
		testStringifyEq( require( '../sample/stringFlatObject.js' ) ) ;
		
		// Investigate why it does not work
		//testStringifyEq( require( '../sample/garbageStringObject.js' ) ) ;
	} ) ;
	
	it( "parse()" , function() {
		
		testParseEq( 'null' ) ;
		testParseEq( 'true' ) ;
		testParseEq( 'false' ) ;
		
		testParseEq( '0' ) ;
		testParseEq( '1' ) ;
		testParseEq( '123' ) ;
		testParseEq( '-123' ) ;
		testParseEq( '123.456' ) ;
		testParseEq( '-123.456' ) ;
		testParseEq( '0.123' ) ;
		testParseEq( '-0.123' ) ;
		testParseEq( '0.00123' ) ;
		testParseEq( '-0.00123' ) ;
		
		testParseEq( '""' ) ;
		testParseEq( '"abc"' ) ;
		testParseEq( '"abc\\"def"' ) ;
		testParseEq( '"abc\\ndef\\tghi\\rjkl"' ) ;
		testParseEq( '"abc\\u0000\\u007f\\u0061def\\"\\"jj"' ) ;
		
		testParseEq( '{}' ) ;
		testParseEq( '{"a":1}' ) ;
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false}' ) ;
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":{},"i":{"j":"J!"}}}' ) ;
		
		testParseEq( '[]' ) ;
		testParseEq( '[1,2,3]' ) ;
		testParseEq( '[-12,1.5,"toto",true,false,null,0.3]' ) ;
		testParseEq( '[-12,1.5,"toto",true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;
		
		testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
		testParseEq( '[-12,1.5,"toto",{"g":123,"h":[1,2,3],"i":["j","J!"]},true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;
		
		testParseEq( ' { "a" :   1 , "b":  \n"string",\n  "c":"" \t,\n\t"d" :   null,"e":true,   "f"   :   false  , "sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
		
		testParseEq( fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ) ;
	} ) ;
} ) ;



describe( "stringifyStream()" , function() {
	
	it( "empty input stream should output a stream of an empty array" , function( done ) {
		var stream = json.stringifyStream() ;
		var str = '' ;
		
		stream.on( 'data' , function( data ) {
			str += data.toString() ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( str ).to.be( '[]' ) ;
			done() ;
		} ) ;
		
		stream.end() ;
	} ) ;
	
	it( "when the input stream push some object, the output stream should push an array of object" , function( done ) {
		var stream = json.stringifyStream() ;
		var str = '' ;
		
		stream.on( 'data' , function( data ) {
			str += data.toString() ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( str ).to.be( '[{"a":1,"b":2,"c":"C"},{"toto":"titi"}]' ) ;
			done() ;
		} ) ;
		
		stream.write( { a: 1 , b: 2 , c: 'C' } ) ;
		stream.write( { toto: "titi" } ) ;
		stream.end() ;
	} ) ;
} ) ;



describe( "parseStream()" , function() {
	
	it( 'empty stream (i.e.: "[]")' , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ { "a": 1 , "b": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single string in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [ "nasty string, with comma, inside" ] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ "nasty string, with comma, inside" ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in two write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
			] ) ;
			//console.log( '\n\n>>>>> DONE!\n\n' ) ;
			done() ;
		} ) ;
		
		stream.write( '[ { "a": 1 , "b' ) ;
		stream.write( '": 2 , "c": "C" } ]' ) ;
		stream.end() ;
	} ) ;
	
	it( "single object in multiple write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' }
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
	
	it( "multiple objects in one write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' } ,
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
	
	it( "multiple objects in many write" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: 1, b: 2, c: 'C' } ,
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
	
	it( "multiple objects in many write with nasty strings" , function( done ) {
		var stream = json.parseStream() ;
		var array = [] ;
		
		stream.on( 'data' , function( data ) {
			//console( "Received " + ( typeof data ) + ':' , data ) ;
			array.push( data ) ;
		} ) ;
		
		stream.on( 'end' , function( data ) {
			expect( array ).to.eql( [
				{ a: '  "  }  ', b: 2, c: '  C{[' } ,
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


