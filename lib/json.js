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



const spp = require( 'smart-preprocessor' ) ;
const path = require( 'path' ) ;

const json = {} ;
module.exports = json ;



json.stringifyStream = require( './stringifyStream.js' ) ;
json.parseStream = require( './parseStream.js' ) ;



json.stringifierConfig = ( options = {} ) => {
	var config = {} ;

	config.noDepthTracking = true ;

	// Depth limit
	if ( typeof options.depth === 'number' && options.depth > 0 ) {
		config.depthLimitValue = options.depth ;
		delete config.noDepthTracking ;
	}
	else {
		config.noDepthLimit = true ;
	}

	// Document depth limit
	if ( typeof options.documentDepth === 'number' && options.documentDepth > 0 ) {
		config.documentDepthLimitValue = options.documentDepth ;
	}
	else {
		config.noDocumentDepthLimit = true ;
	}

	// Indentation
	if ( typeof options.indent === 'string' ) {
		config.indentString = options.indent ;
		delete config.noDepthTracking ;
	}
	else {
		config.noIndent = true ;
	}

	// Use custom .toJSON() function?
	if ( options.useToJSON === false ) {
		config.noToJSON = true ;
	}

	// Ref Notations
	if ( options.circularRefNotation ) {
		config.noUniqueRefNotation = true ;
	}
	else if ( options.uniqueRefNotation ) {
		config.noCircularRefNotation = true ;
	}
	else {
		config.noCircularRefNotation = true ;
		config.noUniqueRefNotation = true ;
	}

	// Mask
	if ( ! options.propertyMask ) {
		config.noPropertyMask = true ;
	}

	// Ordered keys
	if ( options.orderedKeys ) {
		config.orderedKeys = true ;
	}

	// Use local _enumerate_
	if ( options.localEnumerate ) {
		config.localEnumerate = true ;

		// Force documentDepthLimit, even if Infinity, because localEnumerate track the documentDepth
		delete config.noDocumentDepthLimit ;
	}

	// LXON
	if ( options.lxon || options.lxonUnquotedKeys ) {
		config.lxonUnquotedKeys = true ;
	}

	if ( options.lxon || options.lxonConstants ) {
		config.lxonConstants = true ;
	}

	return config ;
} ;



json.stringifier = options => {
	var config = json.stringifierConfig( options ) ;
	return module.preprocessorRequire( './stringify.template.js' , config , { multi: true } ) ;
} ;



json.parserConfig = ( options = {} ) => {
	var config = {} ;

	config.noDepthTracking = true ;

	// Depth limit
	if ( typeof options.depth === 'number' && options.depth > 0 ) {
		config.depthLimitValue = options.depth ;
		delete config.noDepthTracking ;
	}
	else {
		config.noDepthLimit = true ;
	}

	// Ref Notations
	if ( ! ( options.refNotation || options.circularRefNotation || options.uniqueRefNotation ) ) {
		config.noRefNotation = true ;
	}

	// LXON
	if ( options.lxon || options.lxonUnquotedKeys ) {
		config.lxonUnquotedKeys = true ;
	}

	if ( options.lxon || options.lxonConstants ) {
		config.lxonConstants = true ;
	}

	return config ;
} ;



json.parser = options => {
	var config = json.parserConfig( options ) ;
	return module.preprocessorRequire( './parse.template.js' , config , { multi: true } ) ;
} ;



json.cli = () => {
	var type , source , dest , params , config ;

	if ( process.argv.length < 3 ) {
		console.error( 'Usage is: ' + path.basename( process.argv[ 1 ] ) + ' <stringifier|parser> [dest-file] [--parameter1 value1] [--parameter2 value2] [...]' ) ;
		process.exit( 1 ) ;
	}

	params = require( 'minimist' )( process.argv.slice( 2 ) ) ;
	//console.log( params ) ;

	type = params._[ 0 ] ;
	dest = params._[ 1 ] ;

	// Cleanup parameters...
	delete params._ ;

	switch ( type ) {
		case 'stringifier' :
		case 'stringify' :
			config = json.stringifierConfig( params ) ;
			source = path.join( __dirname , 'stringify.template.js' ) ;
			break ;
		case 'parser' :
		case 'parse' :
			config = json.parserConfig( params ) ;
			source = path.join( __dirname , 'parse.template.js' ) ;
			break ;
		default :
			console.error( 'Unknown type: ' , type ) ;
			process.exit( 1 ) ;
	}

	try {
		if ( dest ) { spp.buildSync( source , dest , config ) ; }
		else { spp.buildStdout( source , config ) ; }
	}
	catch ( error ) {
		console.error( 'Error: ' , error ) ;
		process.exit( 1 ) ;
	}

	process.exit( 0 ) ;
} ;

