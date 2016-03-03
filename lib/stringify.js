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



function stringify( v , options )
{
	if ( v === undefined ) { return undefined ; }
	
	var runtime ;
	
	runtime = {
		str: '' ,
		depth: 0 ,
		depthLimit: 100 ,
		
		stringifyAnyType: stringify.stringifyAnyType ,
		stringifyBoolean: stringify.stringifyBoolean ,
		stringifyNumber: stringify.stringifyNumber ,
		stringifyString: stringify.stringifyString ,
		stringifyAnyObject: stringify.stringifyAnyObject ,
		stringifyArray: stringify.stringifyArray ,
		stringifyStrictObject: stringify.stringifyStrictObject
	} ;
	
	if ( options && typeof options === 'object' )
	{
		if ( options.depth !== undefined ) { runtime.depthLimit = options.depth ; }
		
		switch ( options.mode )
		{
			case undefined :
				break ;
			case 'circularRefNotation' :
				runtime.stringifyAnyObject = stringify.stringifyAnyObjectCircularRefNotation ;
				runtime.ancestors = [] ;
				break ;
			case 'uniqueRefNotation' :
				runtime.stringifyAnyObject = stringify.stringifyAnyObjectUniqueRefNotation ;
				runtime.stringifyStrictObject = stringify.stringifyStrictObjectUniqueRefNotation ;
				runtime.stringifyArray = stringify.stringifyArrayUniqueRefNotation ;
				runtime.path = [] ;
				runtime.refs = new WeakMap() ;
				break ;
		}
	}
	
	runtime.stringifyAnyType( v , runtime ) ;
	
	return runtime.str ;
}



module.exports = stringify ;



stringify.stringifyAnyType = function stringifyAnyType( v , runtime )
{
	if ( v === undefined || v === null )
	{
		runtime.str += "null" ;
		return ;
	}
	
	switch ( typeof v )
	{
		case 'boolean' :
			return runtime.stringifyBoolean( v , runtime ) ;
		case 'number' :
			return runtime.stringifyNumber( v , runtime ) ;
		case 'string' :
			return runtime.stringifyString( v , runtime ) ;
		case 'object' :
			return runtime.stringifyAnyObject( v , runtime ) ;
	}
} ;



stringify.stringifyBoolean = function stringifyBoolean( v , runtime )
{
	runtime.str += ( v ? "true" : "false" ) ;
} ;



stringify.stringifyNumber = function stringifyNumber( v , runtime )
{
	if ( Number.isNaN( v ) || v === Infinity || v === -Infinity ) { runtime.str += "null" ; }
	else { runtime.str += v ; }
} ;



stringify.stringifyString = function stringifyString( v , runtime )
{
	var i = 0 , l = v.length , c ;
	
	// Faster on big string than stringifyStringLookup(), also big string are more likely to have at least one bad char
	if ( l >= 200 ) { return stringify.stringifyStringRegex( v , runtime ) ; }
	
	// Most string are left untouched, so it's worth checking first if something must be changed.
	// Gain 33% of perf on the whole stringify().
	//*
	for ( ; i < l ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if (
			c <= 0x1f ||	// control chars
			c === 0x5c ||	// backslash
			c === 0x22		// double quote
		)
		{
			if ( l > 100 )
			{
				stringify.stringifyStringLookup( v , runtime ) ;
			}
			else
			{
				stringify.stringifyStringRegex( v , runtime ) ;
			}
			
			return ;
		}
	}
	//*/
	
	runtime.str += '"' + v + '"' ;
} ;



var stringifyStringLookup_ = 
( function createStringifyStringLookup()
{
	var c = 0 , lookup = [] ;
	
	for ( ; c < 0x80 ; c ++ )
	{
		if ( c === 0x09 )	// tab
		{
			lookup[ c ] = '\\t' ;
		}
		else if ( c === 0x0a )	// new line
		{
			lookup[ c ] = '\\n' ;
		}
		else if ( c === 0x0c )	// form feed
		{
			lookup[ c ] = '\\f' ;
		}
		else if ( c === 0x0d )	// carriage return
		{
			lookup[ c ] = '\\r' ;
		}
		else if ( c <= 0x0f )	// control chars
		{
			lookup[ c ] = '\\u000' + c.toString( 16 ) ;
		}
		else if ( c <= 0x1f )	// control chars
		{
			lookup[ c ] = '\\u00' + c.toString( 16 ) ;
		}
		else if ( c === 0x5c )	// backslash
		{
			lookup[ c ] = '\\\\' ;
		}
		else if ( c === 0x22 )	// double-quote
		{
			lookup[ c ] = '\\"' ;
		}
		else
		{
			lookup[ c ] = String.fromCharCode( c ) ;
		}
	}
	
	return lookup ;
} )() ;



stringify.stringifyStringLookup = function stringifyStringLookup( v , runtime )
//function stringifyString( v , runtime )
{
	var i = 0 , iMax = v.length , c ;
	
	runtime.str += '"' ;
	
	for ( ; i < iMax ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if ( c < 0x80 )
		{
			runtime.str += stringifyStringLookup_[ c ] ;
		}
		else
		{
			runtime.str += v[ i ] ;
		}
	}
	
	runtime.str += '"' ;
} ;



var stringifyStringRegex_ = /[\x00-\x1f"\\]/g ;

stringify.stringifyStringRegex = function stringifyStringRegex( v , runtime )
//function stringifyString( v , runtime )
{
	runtime.str += '"' + v.replace( stringifyStringRegex_ , stringifyStringRegexCallback ) + '"' ;
} ;

function stringifyStringRegexCallback( match )
{
	return stringifyStringLookup_[ match.charCodeAt( 0 ) ] ;
}



stringify.stringifyAnyObject = function stringifyAnyObject( v , runtime )
{
	if ( runtime.depth >= runtime.depthLimit )
	{
		runtime.str += 'null' ;
	}
	else if ( typeof v.toJSON === 'function' )
	{
		runtime.str += v.toJSON() ;
	}
	else if ( Array.isArray( v ) )
	{
		runtime.stringifyArray( v , runtime ) ;
	}
	else
	{
		runtime.stringifyStrictObject( v , runtime ) ;
	}
} ;



stringify.stringifyArray = function stringifyArray( v , runtime )
{
	var i = 1 , iMax = v.length ;
	
	if ( ! iMax )
	{
		runtime.str += '[]' ;
		return ;
	}
	
	runtime.str += '[' ;
	runtime.depth ++ ;
	
	// Unroll the first iteration to gain perf (avoid to test if a comma is needed for each loop)
	runtime.stringifyAnyType( v[ 0 ] , runtime ) ;
	
	for ( ; i < iMax ; i ++ )
	{
		runtime.str += ',' ;
		runtime.stringifyAnyType( v[ i ] , runtime ) ;
	}
	
	runtime.str += ']' ;
	runtime.depth -- ;
} ;



// Faster than stringifyStrictObjectMemory(), but cost a bit more memory
stringify.stringifyStrictObject = function stringifyStrictObject( v , runtime )
{
	var i = 0 , iMax , keys , comma = false ;
	
	keys = Object.keys( v ) ;
	iMax = keys.length ;
	
	runtime.str += '{' ;
	runtime.depth ++ ;
	
	for ( ; i < iMax ; i ++ )
	{
		if ( v[ keys[ i ] ] !== undefined )
		{
			runtime.stringifyString( keys[ i ] , runtime ) ;
			runtime.str += ':' ;
			runtime.stringifyAnyType( v[ keys[ i ] ] , runtime ) ;
			
			// This way we avoid an if statement for the comma (gain 5% of perf)
			i ++ ;
			for ( ; i < iMax ; i ++ )
			{
				if ( v[ keys[ i ] ] !== undefined )
				{
					runtime.str += ',' ;
					runtime.stringifyString( keys[ i ] , runtime ) ;
					runtime.str += ':' ;
					runtime.stringifyAnyType( v[ keys[ i ] ] , runtime ) ;
				}
			}
			
			runtime.str += '}' ;
			runtime.depth -- ;
			return ;
		}
	}
	
	runtime.str += '}' ;
	runtime.depth -- ;
} ;



// A bit slower than stringifyStrictObject(), but use slightly less memory
stringify.stringifyStrictObjectMemory = function stringifyStrictObjectMemory( v , runtime )
{
	var k , comma = false ;
	
	runtime.str += '{' ;
	runtime.depth -- ;
	
	for ( k in v )
	{
		if ( v[ k ] !== undefined && v.hasOwnProperty( k ) )
		//if ( v[ k ] !== undefined )	// Faster, but include properties of the prototype
		{
			if ( comma ) { runtime.str += ',' ; }
			runtime.stringifyString( k , runtime ) ;
			runtime.str += ':' ;
			runtime.stringifyAnyType( v[ k ] , runtime ) ;
			comma = true ;
		}
	}
	
	runtime.str += '}' ;
	runtime.depth -- ;
} ;





			/* Special modes */



stringify.stringifyAnyObjectCircularRefNotation = function stringifyAnyObjectCircularRefNotation( v , runtime )
{
	var indexOf = runtime.ancestors.indexOf( v ) ;
	
	if ( indexOf !== -1 )
	{
		runtime.str += '{"@@ref@@":' + ( indexOf - runtime.ancestors.length ) + '}' ;
		return ;
	}
	
	runtime.ancestors.push( v ) ;
	
	if ( runtime.depth >= runtime.depthLimit )
	{
		runtime.str += 'null' ;
	}
	else if ( typeof v.toJSON === 'function' )
	{
		runtime.str += v.toJSON() ;
	}
	else if ( Array.isArray( v ) )
	{
		runtime.stringifyArray( v , runtime ) ;
	}
	else
	{
		runtime.stringifyStrictObject( v , runtime ) ;
	}
	
	runtime.ancestors.pop() ;
} ;



stringify.stringifyAnyObjectUniqueRefNotation = function stringifyAnyObjectUniqueRefNotation( v , runtime )
{
	var path = runtime.refs.get( v ) ;
	
	if ( path )
	{
		//console.log( "Already exist in path:" , path ) ;
		runtime.str += '{"@@ref@@":' + JSON.stringify( path ) + '}' ;
		return ;
	}
	
	//console.log( "Set it for path:" , runtime.path ) ;
	runtime.refs.set( v , runtime.path.slice() ) ;
	
	if ( runtime.depth >= runtime.depthLimit )
	{
		runtime.str += 'null' ;
	}
	else if ( typeof v.toJSON === 'function' )
	{
		runtime.str += v.toJSON() ;
	}
	else if ( Array.isArray( v ) )
	{
		runtime.stringifyArray( v , runtime ) ;
	}
	else
	{
		runtime.stringifyStrictObject( v , runtime ) ;
	}
} ;



stringify.stringifyArrayUniqueRefNotation = function stringifyArrayUniqueRefNotation( v , runtime )
{
	var i = 1 , iMax = v.length ;
	
	if ( ! iMax )
	{
		runtime.str += '[]' ;
		return ;
	}
	
	runtime.str += '[' ;
	runtime.depth ++ ;
	
	// Unroll the first iteration to avoid to test if a comma is needed for each loop (gain 5% of perf)
	runtime.path.push( 0 ) ;
	runtime.stringifyAnyType( v[ 0 ] , runtime ) ;
	
	for ( ; i < iMax ; i ++ )
	{
		runtime.str += ',' ;
		runtime.path[ runtime.path.length - 1 ] = i ;
		runtime.stringifyAnyType( v[ i ] , runtime ) ;
	}
	
	runtime.str += ']' ;
	runtime.depth -- ;
	runtime.path.pop() ;
} ;



// Faster than stringifyStrictObjectMemory(), but cost a bit more memory
stringify.stringifyStrictObjectUniqueRefNotation = function stringifyStrictObjectUniqueRefNotation( v , runtime )
{
	var i = 0 , iMax , keys , comma = false ;
	
	keys = Object.keys( v ) ;
	iMax = keys.length ;
	
	runtime.str += '{' ;
	runtime.depth ++ ;
	
	for ( ; i < iMax ; i ++ )
	{
		if ( v[ keys[ i ] ] !== undefined )
		{
			runtime.path.push( keys[ i ] ) ;
			runtime.stringifyString( keys[ i ] , runtime ) ;
			runtime.str += ':' ;
			runtime.stringifyAnyType( v[ keys[ i ] ] , runtime ) ;
			
			// This way we avoid an if statement for the comma (gain 5% of perf)
			i ++ ;
			for ( ; i < iMax ; i ++ )
			{
				if ( v[ keys[ i ] ] !== undefined )
				{
					runtime.path[ runtime.path.length - 1 ] = keys[ i ] ;
					runtime.str += ',' ;
					runtime.stringifyString( keys[ i ] , runtime ) ;
					runtime.str += ':' ;
					runtime.stringifyAnyType( v[ keys[ i ] ] , runtime ) ;
				}
			}
			
			runtime.path.pop() ;
			runtime.str += '}' ;
			runtime.depth -- ;
			return ;
		}
	}
	
	runtime.path.pop() ;
	runtime.str += '}' ;
	runtime.depth -- ;
} ;





