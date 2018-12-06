/*
	JSON Kit

	Copyright (c) 2016 Cédric Ronvel

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

"use strict" ;



var json = require( './json.js' ) ;
var StreamTransform = require( 'stream' ).Transform ;



function StringifyStream() { throw new Error( 'Use StringifyStream.create() instead' ) ; }
StringifyStream.prototype = Object.create( StreamTransform.prototype ) ;
StringifyStream.prototype.constructor = StringifyStream ;



var defaultOptions = {
	//highWaterMark: 100
} ;



StringifyStream.create = function create( options ) {
	if ( ! options || typeof options !== 'object' ) { options = defaultOptions ; }

	var stream = Object.create( StringifyStream.prototype , {
		_stringify: { value: options.stringifier || json.stringifier( options ) , enumerable: true } ,
		_objectCount: { value: 0 , writable: true , enumerable: true }
	} ) ;

	StreamTransform.call( stream , {
		writableObjectMode: true
		//highWaterMark: options.highWaterMark || 100	// is it supposed to be the same value for the readable and writable part?
	} ) ;


	return stream ;
} ;



StringifyStream.prototype._transform = function( data , encoding , callback ) {
	this.push( ( this._objectCount ? ',' : '[' ) + this._stringify( data ) ) ;
	this._objectCount ++ ;
	callback() ;
} ;



StringifyStream.prototype._flush = function( callback ) {
	this.push( this._objectCount ? ']' : '[]' ) ;
	callback() ;
} ;



module.exports = StringifyStream.create ;


