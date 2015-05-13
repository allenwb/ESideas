## Additional Meta Properties for ES7 ##
Allen Wirfs-Brock  
February 26, 2015

### The Problem and Opportunity
The ES community occasionally  identifies contextually variable run-time values that would be useful if they could be accessed from ES code. The problem is that we have had no common way to approach making such values available. The space of available keywords and operator symbols that might be associated with such values is severely limited.  Associating them with lexical bindings is also unattractive. The result, is that TC39 has steered away from adding support for  accessing such values.

However, recently ES6 added the syntatic concept of a *MetaProperty*.  Syntactically a *MetaProperty* is a pre-existing reserved word followed by a period and then an *IdentifierName*.  For example: `for.sake`. The reserved word must be one that the ES grammar does not  permit to be otherwise immediately followed by a period.

ES6 defined only one *MetaProperty*, `new.target`. However, this establishes a syntactic pattern that could be applied for accessing other contextually variable run-time values. For ES7 we should review the set of such values that we know about and considering adding additional meta properties for accessing them.
### Candidate Meta Properties

####`function.callee` -- The currently running function
#####Value and Context
The value of `function.callee` is the function object that is currently being evaluated by the running execution context. It is *not* lexically scoped like `this`, `super` or `new.target`.  Its value may be an Arrow Function.

Referencing `function.callee` outside of function code is a Syntax Error.

#####Use Cases
Anonymous functions, arrow functions, and concise methods with non-identifier property names sometimes need to recursively refer to themselves. Prior to ES5 the currently executing function object was available via `arguments.callee` but that is now unavailable in strict mode functions. In addition, within arrow functions, `argument` is lexically scoped to the closest containing non-arrow function.

####`function.count` -- The actual argument count
#####Value and Context
The value of `function.count` is the actual number of arguments pass to the function that is currently being evaluated by the running execution context. It is *not* lexically scoped like `arguments` so it can report  the number of arguments passed to an  Arrow Function.

Referencing `function.count` outside of function code is a Syntax Error.

#####Use Cases
Even with the availability of parameter default values and rest parameters it is sometimes useful to know the actual number of arguments passed to a function invocation.  For example, to help resolve argument overloads. The only currently available way to get the actual argument count that will work for any function is to declare the function with a single rest parameter, for example: 
```es6
     (...args)=>console.log(args.length)
```
The use of this technique precludes use of a more meaningful parameter signature and forces instantiation of  an array containing the argument values even if the only information needed is the argument count. 

####`function.arguments` -- The actual argument list
#####Value and Context
The value of `function.arguments` is an array containing the actual arguments passed to the function that is currently being evaluated by the running execution context. It is *not* lexically scoped like `arguments` so it can provide the actual arguments passed to an  Arrow Function. It is essentially the same as the value that is assigned to `args` for a parameter list of the form `(...args)`.

Each time `function.arguments` is evaluated it returns a fresh array.

Referencing `function.arguments` outside of function code is a Syntax Error.

#####Use Cases
`function.arguments` is essentially a replacement for the legacy `arguments` object that doesn't carry any of the baggage of `arguments` and which can be used with all function forms including Arrow Functions and in all modes.  Uses include declaring a function with a  meaningful parameter signature while still having the original arguments available if an overload conditions requires delegation of the arguments to another function.. 


#### Module Meta Data
Meta Properties may be useful for providing access to various meta data associated with a module.  If desired, proposals for such properties need to be added here by the module champions. 
