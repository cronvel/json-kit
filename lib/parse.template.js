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

"use strict" ;



var depthLimit = Infinity ;
//#depthLimitValue -> depthLimit



function parse( str , limit ) {
	var v , runtime = {
		i: 0
		, depth: 0	//# noDepthTracking!
		, depthLimit: limit || depthLimit   //# noDepthLimit!
		, ancestors: []	//# noRefNotation!
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseIdle( str , runtime ) ;

	if ( runtime.i >= str.length ) { throw new SyntaxError( "Empty" ) ; }

	v = parseValue( str , runtime ) ;
	parseIdle( str , runtime ) ;

	if ( runtime.i < str.length ) { throw new SyntaxError( "Unexpected " + str[ runtime.i ] ) ; }

	return v ;
}



module.exports = parse ;



function parseIdle( str , runtime ) {
	var c ;

	// Skip blank
	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;
		if ( c > 0x20 ) { return c ; }

		if ( c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09 ) { continue ; }
		throw new SyntaxError( "Unexpected " + str[ runtime.i ] ) ;
	}

	return -1 ;
}



function parseValue( str , runtime ) {
	var c ;

	c = str.charCodeAt( runtime.i ) ;

	/*# lxonConstants:
	if ( c === 0x2d ) {	// minus
		runtime.i ++ ;
		parseIdle( str , runtime ) ;
		c = str.charCodeAt( runtime.i ) ;
		if ( ( c >= 0x41 && c <= 0x5a ) || ( c >= 0x61 && c <= 0x7a ) ) {
			runtime.i ++ ;
			return parseLxonConstant( str , runtime , LXON_NEGATIVE_CONSTANTS ) ;
		}

		if ( c >= 0x30 && c <= 0x39 ) {	// digit
			return parseNegativeNumber( str , runtime ) ;
		}

		throw new SyntaxError( "Unexpected " + str[ runtime.i ] ) ;
	}

	if ( c >= 0x30 && c <= 0x39 ) {	// digit
		return parseNumber( str , runtime ) ;
	}
	//*/
	//*# lxonConstants!
	if ( ( c >= 0x30 && c <= 0x39 ) || c === 0x2d ) {	// digit or minus
		return parseNumber( str , runtime ) ;
	}
	//*/

	runtime.i ++ ;

	switch ( c ) {
		case 0x7b :	// {
			return parseObject( str , runtime ) ;
		case 0x5b :	// [
			return parseArray( str , runtime ) ;
		//*# lxonConstants!
		case 0x6e :	// n   null?
			return parseNull( str , runtime ) ;
		case 0x74 :	// t   true?
			return parseTrue( str , runtime ) ;
		case 0x66 :	// f   false?
			return parseFalse( str , runtime ) ;
		//*/
		case 0x22 :	// "   double-quote: this is a string
			return parseString( str , runtime ) ;
		default :
			/*# lxonConstants:
			if ( ( c >= 0x41 && c <= 0x5a ) || ( c >= 0x61 && c <= 0x7a ) ) {
				return parseLxonConstant( str , runtime ) ;
			}
			//*/
			throw new SyntaxError( "Unexpected " + str[ runtime.i - 1 ] ) ;
	}
}




//*# lxonConstants!
function parseNull( str , runtime ) {
	if ( runtime.i + 2 >= str.length || str[ runtime.i ] !== 'u' || str[ runtime.i + 1 ] !== 'l' || str[ runtime.i + 2 ] !== 'l' ) {
		throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 3 ) ) ;
	}

	runtime.i += 3 ;
	return null ;
}



function parseTrue( str , runtime ) {
	if ( runtime.i + 2 >= str.length || str[ runtime.i ] !== 'r' || str[ runtime.i + 1 ] !== 'u' || str[ runtime.i + 2 ] !== 'e' ) {
		throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 3 ) ) ;
	}

	runtime.i += 3 ;
	return true ;
}



function parseFalse( str , runtime ) {
	if ( runtime.i + 3 >= str.length || str[ runtime.i ] !== 'a' || str[ runtime.i + 1 ] !== 'l' || str[ runtime.i + 2 ] !== 's' || str[ runtime.i + 3 ] !== 'e' ) {
		throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) ) ;
	}

	runtime.i += 4 ;
	return false ;
}
//*/



/*# lxonConstants:
// Map.has() is way faster than (key in Object) (at least on Node.js v16)
const LXON_CONSTANTS = new Map( [
	[ 'null', null ] ,
	[ 'false', false ] ,
	[ 'true', true ] ,
	[ 'NaN', NaN ] ,
	[ 'nan', NaN ] ,
	[ 'Infinity', Infinity ] ,
	[ 'infinity', Infinity ] ,

	[ 'off', false ] ,
	[ 'on', true ] ,
	[ 'no', false ] ,
	[ 'yes', true ]
] ) ;

const LXON_NEGATIVE_CONSTANTS = new Map( [
	[ 'Infinity', -Infinity ] ,
	[ 'infinity', -Infinity ]
] ) ;

function parseLxonConstant( str , runtime , constants = LXON_CONSTANTS ) {
	var c , id , j = runtime.i , l = str.length ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// Lxon constants are: [a-zA-Z]+
		// The first char is already parsed
		if ( ! ( ( c >= 0x41 && c <= 0x5a ) || ( c >= 0x61 && c <= 0x7a ) ) ) {
			break ;
		}
	}

	id = str.slice( runtime.i - 1 , j ) ;
	if ( ! constants.has( id ) ) {
		throw new SyntaxError( "Unexpected " + id ) ;
	}

	runtime.i = j ;
	return constants.get( id ) ;
}
//*/



function parseNumber( str , runtime ) {
	// We are here because a digit or a minus triggered parseNumber(), so we assume that the regexp always match
	var match = str.slice( runtime.i ).match( /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/ )[ 0 ] ;
	runtime.i += match.length ;
	return parseFloat( match ) ;
}



/*# lxonConstants:
function parseNegativeNumber( str , runtime ) {
	// We are here because a digit triggered parseNumber(), so we assume that the regexp always match
	var match = str.slice( runtime.i ).match( /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/ )[ 0 ] ;
	runtime.i += match.length ;
	return -parseFloat( match ) ;
}
//*/



function parseString( str , runtime ) {
	var c , j = runtime.i , l = str.length , v = '' ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f ) {
			if ( c === 0x22	) {	// double quote = end of the string
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5c ) {	// backslash
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				v += parseBackSlash( str , runtime ) ;
				j = runtime.i - 1 ;
			}
			else if ( c <= 0x1f ) {	// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) ) ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end, expecting a double-quote." ) ;
}



var parseBackSlashLookup_ =
( function createParseBackSlashLookup() {
	var c = 0 , lookup = new Array( 0x80 ) ;

	for ( ; c < 0x80 ; c ++ ) {
		if ( c === 0x62 ) {	// b
			lookup[ c ] = '\b' ;
		}
		else if ( c === 0x66 ) {	// f
			lookup[ c ] = '\f' ;
		}
		else if ( c === 0x6e ) {	// n
			lookup[ c ] = '\n' ;
		}
		else if ( c === 0x72 ) {	// r
			lookup[ c ] = '\r' ;
		}
		else if ( c === 0x74 ) {	// t
			lookup[ c ] = '\t' ;
		}
		else if ( c === 0x5c ) {	// backslash
			lookup[ c ] = '\\' ;
		}
		else if ( c === 0x2f ) {	// slash
			lookup[ c ] = '/' ;
		}
		else if ( c === 0x22 ) {	// double-quote
			lookup[ c ] = '"' ;
		}
		else {
			lookup[ c ] = '' ;
		}
	}

	return lookup ;
} )() ;



function parseBackSlash( str , runtime ) {
	var v , c = str.charCodeAt( runtime.i ) ;

	if ( runtime.i >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	if ( c === 0x75 ) {	// u
		runtime.i ++ ;
		v = parseUnicode( str , runtime ) ;
		return v ;
	}
	else if ( ( v = parseBackSlashLookup_[ c ] ).length ) {
		runtime.i ++ ;
		return v ;
	}

	throw new SyntaxError( 'Unexpected token: "' + str[ runtime.i ] + '"' ) ;

}



function parseUnicode( str , runtime ) {
	if ( runtime.i + 3 >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	var match = str.slice( runtime.i , runtime.i + 4 ).match( /[0-9a-f]{4}/ ) ;

	if ( ! match ) { throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) ) ; }

	runtime.i += 4 ;

	// Or String.fromCodePoint() ?
	return String.fromCharCode( Number.parseInt( match[ 0 ] , 16 ) ) ;
}



/*# lxonUnquotedKeys:
function parseLxonUnquotedKey( str , runtime ) {
	var c , v , j = runtime.i + 1 , l = str.length ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// Lxon keys are: [@a-zA-Z0-9_$-]+
		// The first char is already parsed
		if ( ! ( ( c >= 0x40 && c <= 0x5a ) || ( c >= 0x61 && c <= 0x7a ) || ( c >= 0x30 && c <= 0x39 ) || c === 0x5f || c === 0x24 || c === 0x2d ) ) {
			v = str.slice( runtime.i , j ) ;
			runtime.i = j ;
			return v ;
		}
	}

	throw new SyntaxError( "Unexpected end, expecting a colon." ) ;
}
//*/



function parseArray( str , runtime ) {
	var j = 0 , c , v = [] ;

	//*# noDepthLimit!
	if ( runtime.depth >= runtime.depthLimit ) {
		parseSkipNested( str , runtime ) ;
		return undefined ;
	}
	//*/

	// Empty array? Try to parse a ]
	c = parseIdle( str , runtime ) ;
	if ( c === 0x5d ) {
		runtime.i ++ ;
		return v ;
	}

	runtime.depth ++ ;	//# noDepthTracking!

	//*# noRefNotation!
	// Attach the object to its parent NOW! So it can be used as a reference for its descendants
	if ( runtime.ancestors.length ) {
		runtime.ancestors[ runtime.ancestors.length - 1 ][ runtime.k ] = v ;
	}

	runtime.ancestors.push( v ) ;
	//*/

	for ( ;; j ++ ) {
		// parse the value :
		runtime.k = j ;	//# noRefNotation!
		v[ j ] = parseValue( str , runtime ) ;


		// parse comma , or end of array
		c = parseIdle( str , runtime ) ;
		switch ( c ) {
			case 0x2c :	// ,   comma: next value
				runtime.i ++ ;
				break ;

			case 0x5d :	// ]
				runtime.i ++ ;
				runtime.ancestors.pop() ;	//# noRefNotation!
				runtime.depth -- ;	//# noDepthTracking!
				return v ;

			default :
				throw new Error( "Unexpected " + str[ runtime.i ] ) ;
		}

		parseIdle( str , runtime ) ;
	}

	//throw new Error( "Unexpected end" ) ;
}



function parseObject( str , runtime ) {
	var c , v , k ;

	//*# noDepthTracking!
	if ( runtime.depth >= runtime.depthLimit ) {
		parseSkipNested( str , runtime ) ;
		return undefined ;
	}
	//*/

	// Empty object? Try to parse a }
	c = parseIdle( str , runtime ) ;
	if ( c === 0x7d ) {
		runtime.i ++ ;
		//return v ;	// v is not defined ATM
		return {} ;
	}

	runtime.depth ++ ;	//# noDepthTracking!


	//*# noRefNotation!

	// /!\ move that into another function? /!\

	// Unroll the first iteration of the loop to gain some perf:
	// the circular ref notation expect an object with a single key-value.
	// Avoid doing string comparison for all other key of the object

	// parse the key
	k = parseKey( str , runtime , c ) ;

	// So this is a reference
	if ( k === '@@ref@@' ) {
		// parse the colon :
		c = parseIdle( str , runtime ) ;
		if ( c !== 0x3a ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }
		runtime.i ++ ;

		// parse the value
		parseIdle( str , runtime ) ;
		v = parseValue( str , runtime ) ;

		if ( typeof v === 'number' && v < 0 && -v <= runtime.ancestors.length ) {
			v = runtime.ancestors[ runtime.ancestors.length + v ] ;
		}
		else if ( Array.isArray( v ) ) {
			v = getPath( runtime.ancestors[ 0 ] , v ) ;
		}
		else if ( typeof v === 'number' ) { throw new Error( "Bad ref: " + v ) ; }
		else { throw new Error( "Bad ref: " + typeof v ) ; }

		// parse end of object: the closing brace }
		c = parseIdle( str , runtime ) ;
		if ( c !== 0x7d ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }

		runtime.i ++ ;
		runtime.depth -- ;	//# noDepthTracking!
		return v ;
	}

	v = {} ;

	// Attach the object to its parent NOW! So it can be used as a reference for its descendants
	if ( runtime.ancestors.length ) {
		runtime.ancestors[ runtime.ancestors.length - 1 ][ runtime.k ] = v ;
	}

	runtime.ancestors.push( v ) ;


	// parse the colon :
	c = parseIdle( str , runtime ) ;
	if ( c !== 0x3a ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }
	runtime.i ++ ;

	// parse the value
	parseIdle( str , runtime ) ;
	runtime.k = k ;
	v[ k ] = parseValue( str , runtime ) ;

	// parse comma , or end of object
	c = parseIdle( str , runtime ) ;
	switch ( c ) {
		case 0x2c :	// ,   comma: next key-value
			runtime.i ++ ;
			break ;

		case 0x7d :	// }
			runtime.i ++ ;
			runtime.ancestors.pop() ;
			runtime.depth -- ;	//# noDepthTracking!
			return v ;

		default :
			throw new Error( "Unexpected " + str[ runtime.i ] ) ;
	}

	c = parseIdle( str , runtime ) ;

	//*/

	// Now the regular loop...

	//# noRefNotation: v = {} ;

	for ( ;; ) {
		// parse the key
		k = parseKey( str , runtime , c ) ;
		runtime.k = k ;	//# noRefNotation!

		// parse the colon :
		c = parseIdle( str , runtime ) ;
		if ( c !== 0x3a ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }
		runtime.i ++ ;

		// parse the value
		parseIdle( str , runtime ) ;
		v[ k ] = parseValue( str , runtime ) ;

		// parse comma , or end of object
		c = parseIdle( str , runtime ) ;
		switch ( c ) {
			case 0x2c :	// ,   comma: next key-value
				runtime.i ++ ;
				break ;

			case 0x7d :	// }
				runtime.i ++ ;
				runtime.ancestors.pop() ;	//# noRefNotation!
				runtime.depth -- ;	//# noDepthTracking!
				return v ;

			default :
				throw new Error( "Unexpected " + str[ runtime.i ] ) ;
		}

		c = parseIdle( str , runtime ) ;
	}

	//throw new Error( "Unexpected end" ) ;
}



function parseKey( str , runtime , c ) {
	/*# lxonUnquotedKeys:
	// Lxon keys are: [@a-zA-Z0-9_$-]+
	if ( ( c >= 0x40 && c <= 0x5a ) || ( c >= 0x61 && c <= 0x7a ) || ( c >= 0x30 && c <= 0x39 ) || c === 0x5f || c === 0x24 || c === 0x2d ) {
		return parseLxonUnquotedKey( str , runtime ) ;
	}

	if ( c !== 0x22 ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }
	runtime.i ++ ;
	return parseString( str , runtime ) ;
	//*/

	//*# lxonUnquotedKeys!
	if ( c !== 0x22 ) { throw new Error( "Unexpected " + str[ runtime.i ] ) ; }
	runtime.i ++ ;
	return parseString( str , runtime ) ;
	//*/
}



// path is an array of key/index
function getPath( object , path ) {
	var i = 0 , iMax = path.length , p = object ;

	//console.log( "getPath():" , object , path ) ;

	try {
		for ( ; i < iMax ; i ++ ) {
			//console.log( "Next path:" , path[ i ] ) ;
			p = p[ path[ i ] ] ;
		}
	}
	catch ( error ) {
		throw new Error( "Bad ref: path not found" ) ;
	}

	return p ;
}



// Skip the current string, as fast as possible (partial syntax checking)
function parseSkipString( str , runtime ) {
	var c ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		// Fastest this way
		if ( c === 0x22 || c === 0x5c ) {	// double quote or backslash
			runtime.i ++ ;

			// double-quote
			if ( c === 0x22 ) { return ; }
		}
	}

	throw new SyntaxError( "Unexpected end" ) ;
}



// Skip the current object or array, as fast as possible (partial syntax checking)
function parseSkipNested( str , runtime ) {
	var c , depth = 1 ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		// Fastest this way
		if ( c === 0x5b || c === 0x7b || c === 0x5d || c === 0x7d || c === 0x22 ) {
			//backSlash = false ;

			if ( c === 0x5b || c === 0x7b ) {	// opening bracket or brace
				depth ++ ;
				//console.log( "depth++" , depth ) ;
			}
			else if ( c === 0x5d || c === 0x7d ) {	// closing bracket or brace
				depth -- ;
				//console.log( "depth--" , depth ) ;

				if ( depth === 0 ) {
					runtime.i ++ ;
					return ;
				}
			}
			else if ( c === 0x22 ) {	// double-quote
				// String are special case, since they can contain bracket and brace that should not be counted by object/array parser
				//console.log( "in double-quote" ) ;
				runtime.i ++ ;
				parseSkipString( str , runtime ) ;
				runtime.i -- ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end" ) ;
}

