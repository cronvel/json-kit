/*
	The Cedric's Swiss Knife (CSK) - CSK JSON

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



var parse = require( './parse.js' ) ;
var StreamTransform = require( 'stream' ).Transform ;



function ParseStream() { throw new Error( 'Use ParseStream.create() instead' ) ; }
ParseStream.prototype = Object.create( StreamTransform.prototype ) ;
ParseStream.prototype.constructor = ParseStream ;



var defaultOptions = {
	//highWaterMark: 100
} ;



ParseStream.create = function create( options )
{
	if ( ! options || typeof options !== 'object' ) { options = defaultOptions ; }
	
	var stream = Object.create( ParseStream.prototype , {
		_objectCount: { value: 0 , writable: true , enumerable: true } ,
		_parseStart: { value: -1 , writable: true , enumerable: true } ,
		_parseEnd: { value: -1 , writable: true , enumerable: true } ,
		_parseDepth: { value: 0 , writable: true , enumerable: true } ,
		_parseLeftOver: { value: '' , writable: true , enumerable: true } ,
		_parseEOF: { value: false , writable: true , enumerable: true } ,
		_parseInValue: { value: false , writable: true , enumerable: true } ,
		_parseAfterValue: { value: false , writable: true , enumerable: true } ,
		_parseBackSlash: { value: false , writable: true , enumerable: true } ,
		_parseInDoubleQuote: { value: false , writable: true , enumerable: true } ,
	} ) ;
	
	StreamTransform.call( stream , {
		readableObjectMode : true ,
		//highWaterMark: options.highWaterMark || 100	// is it supposed to be the same value for the readable and writable part?
	} ) ;
	
	
	return stream ;
} ;



ParseStream.prototype._parseOpening = function parseOpening( buffer )
{
	var c , i = this._parseStart ;
	
	// Skip blank
	for ( ; i < buffer.length ; i ++ )
	{
		c = buffer[ i ] ;
		
		if ( c === 0x5b )	// opening bracket
		{
			this._parseDepth = 1 ;
			this._parseStart = i + 1 ;
			return ;
		}
		
		if ( c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09 )	// space, tab, new line, carriage return
		{
			continue ;
		}
		
		throw new SyntaxError( "Unexpected " + String.fromCharCode( c ) ) ;
	}
	
	this._parseStart = -1 ;
	return ;
} ;



ParseStream.prototype._parseBoundary = function parseBoundary( buffer )
{
	var c , i = this._parseStart ;
	
	// Find the next top-level value boundary
	for ( ; i < buffer.length ; i ++ )
	{
		c = buffer[ i ] ;
		
		if ( this._parseInDoubleQuote )
		{
			if ( this._parseBackSlash )
			{
				this._parseBackSlash = false ;
			}
			else if ( c === 0x22 )	// double-quote
			{
				//this._parseEnd = i ;
				//console.log( "out of double-quote" ) ;
				this._parseBackSlash = false ;
				this._parseInDoubleQuote = false ;
				
				if ( this._parseDepth === 1 )
				{
					this._parseAfterValue = true ;
					this._parseInValue = false ;
					this._parseEnd = i + 1 ;
					return ;
				}
			}
			else if ( c === 0x5c )	// backslash
			{
				//this._parseEnd = i ;
				//console.log( "backslash" ) ;
				this._parseBackSlash = true ;
			}
		}
		else
		{
			this._parseBackSlash = false ;
			
			if ( c === 0x5b || c === 0x7b )		// opening bracket or brace
			{
				this._parseDepth ++ ;
				this._parseInValue = true ;
				//console.log( "depth++" , this._parseDepth ) ;
			}
			else if ( c === 0x5d || c === 0x7d )	// closing bracket or brace
			{
				this._parseDepth -- ;
				//console.log( "depth--" , this._parseDepth ) ;
				
				if ( this._parseDepth === 1 )
				{
					this._parseInValue = false ;
					this._parseAfterValue = true ;
					this._parseEnd = i + 1 ;
					return ;
				}
				else if ( this._parseDepth === 0 )
				{
					if ( c === 0x7d ) { throw new SyntaxError( "Unexpected }" ) ; }
					
					//this._parseEnd = i ;
					//console.log( "EOF" ) ;
					this._parseEOF = true ;
					
					if ( this._parseInValue && ! this._parseAfterValue )
					{
						this._parseInValue = false ;
						this._parseAfterValue = false ;
						this._parseEnd = i ;
						return ;
					}
					else
					{
						this._parseInValue = false ;
						this._parseAfterValue = false ;
						this._parseEnd = -1 ;
						return ;
					}
				}
			}
			else if ( c === 0x22 )	// double-quote
			{
				//this._parseEnd = i ;
				//console.log( "in double-quote" ) ;
				this._parseInDoubleQuote = true ;
				
				if ( this._parseDepth === 1 )
				{
					if ( this._parseAfterValue ) { throw new SyntaxError( 'Unexpected "' ) ; }
					this._parseInValue = true ;
				}
			}
			else if ( this._parseDepth === 1 )
			{
				if ( c === 0x2c )	// comma
				{
					//this._parseEnd = i ;
					//console.log( "comma" ) ;
					
					if ( this._parseInValue && ! this._parseAfterValue )
					{
						this._parseInValue = false ;
						this._parseAfterValue = false ;
						this._parseEnd = i ;
						return ;
					}
					else if ( ! this._parseInValue && ! this._parseAfterValue )
					{
						throw new SyntaxError( "Unexpected ," ) ;
					}
					else
					{
						this._parseInValue = false ;
						this._parseAfterValue = false ;
						this._parseStart = i + 1 ;
						//return -1 ;
					}
				}
				else if ( c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09 )
				{
					if ( this._parseInValue )
					{
						//console.log( "After value" ) ;
						this._parseInValue = false ;
						this._parseAfterValue = true ;
						this._parseEnd = i ;
						return ;
					}
					else
					{
						this._parseStart = i + 1 ;
					}
				}
				else
				{
					//if ( ! this._parseInValue ) { console.log( "starting value:" , String.fromCharCode( c ) ) ; }
					if ( this._parseAfterValue ) { throw new SyntaxError( "Unexpected " + String.fromCharCode( c ) ) ; }
					this._parseInValue = true ;
				}
			}
		}
	}
	
	//console.log( "End of chunk" ) ;
	this._parseEnd = -1 ;
	return ;
} ;



ParseStream.prototype._transform = function( buffer , encoding , callback )
{
	var count = 0 , object , str ;
	
	if ( this._parseEOF )
	{
		callback() ;
		return ;
	}
	
	this._parseStart = this._parseEnd = 0 ;
	
	if ( ! this._parseDepth )
	{
		try {
			this._parseOpening( buffer ) ;
		}
		catch ( error ) {
			this.emit( 'error' , error ) ;
			//this.end() ;
			this._parseEOF = true ;
			callback() ;
			return ;
		}
		
		// No opening bracket, return now
		if ( this._parseStart < 0 ) { callback() ; return ; }
	}
	
	
	for ( ;; count ++ )
	{
		if ( this._parseStart >= buffer.length ) { callback() ; return ; }
		
		this._parseBoundary( buffer ) ;
		//console.log( "Segment start:" , this._parseStart , ", end:" , this._parseEnd ) ;
		
		if ( this._parseEnd < 0 )
		{
			if ( ! this._parseEOF ) { this._parseLeftOver += buffer.slice( this._parseStart ).toString() ; }
			callback() ;
			return ;
		}
		
		if ( ! count )
		{
			str = this._parseLeftOver + buffer.slice( this._parseStart , this._parseEnd ).toString() ;
			this._parseLeftOver = '' ;
		}
		else
		{
			str = buffer.slice( this._parseStart , this._parseEnd ).toString() ;
		}
		
		try {
			//console.log( "About to parse: '" + str + "'" ) ;
			object = parse( str ) ;
		}
		catch ( error ) {
			this.emit( 'error' , error ) ;
			//this.end() ;
			this._parseEOF = true ;
			callback() ;
			return ;
		}
		
		this.push( object || ( object === null ? undefined : object ) ) ;
		this._objectCount ++ ;
		
		if ( this._parseEOF )
		{
			//this.end() ;
			callback() ;
			return ;
		}
		
		this._parseStart = this._parseEnd + 1 ;
	}
} ;



ParseStream.prototype._flush = function( callback )
{
	callback() ;
} ;



module.exports = ParseStream.create ;


