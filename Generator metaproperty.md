## Generator function.next Meta Property ##
Allen Wirfs-Brock  
February 26, 2015

### The Problem
When the `next` method is invoked on a generator objects,  the value passed as the first argument to `next` becomes available to within the body of the generator function as the value of the `yield` expression that most recently suspended the generator function. This supports two-way communications between the a generator object and its consumer.

However, the first `next` that a generator's consumer invokes to start a generator object does not correspond to any `yield` within the body of the generator function. Instead, the first `next` simply causes execution of the generator function body to  begin at the top of the body.

Because there the first `next` call does not correspond to a `yield` within the generator function body there is currently no way for the code with the body to access the initial `next` argument.  For example:

```js
function *adder(total=0) {
   let increment=1;
   while (true) {
       switch (request = yield total += increment) {
          case undefined: break;
          case "done": return total;
          default: increment = Number(request);
       }
   }
}

let tally = adder();
let first=tally.next(0.1); // argument will be ignored
tally.next(0.1);
tally.next(0.1);
let last=tally.next("done");
console.log(last);  //1.2 instead of 0.3
```
In the above example, the argument to the `next` method  normally supplies the value to added to a running tally. Except that the increment value supplied to the first next is ignored.

This proposal provides an alternative way to access the `next` parameter that works on the first and all subsequent invocations of a generator's `next` method.
### The Proposal

###A new meta-property: `function.next`
#####Value and Context
The value of `function.next` within the body of a Generator Function is the value passed to the generator by the `next` method that most recently resumed execution of the generator.  In particular,  referencing `function.next` prior to the first evaluation of a `yield` operator returns the argument value passed by the `next` call that started evaluation of the *GeneratorBody*. 

`function.next` is  lexically scoped like `this` so it can be referenced from within an  Arrow Functions contained within a *GeneratorBody*.

Referencing `function.next` outside of a *GeneratorBody*  or an Arrow Function contained in a *GeneratorBody* is a Syntax Error
#####Usage Example
Here is how the above example might be rewritten using `function.next`
```js
function *adder(total=0) {
   let increment=1;
   do {
       switch (request = function.next){
          case undefined: break;
          case "done": return total;
          default: increment = Number(request);
       }
       yield total += increment;
   } while (true)
}

let tally = adder();
let first=tally.next(0.1); // argument no longer ignored
tally.next(0.1);
tally.next(0.1);
let last=tally.next("done");
console.log(last);  //0.3
```

###Specification Updates
The following are deltas to the ECMAScript 2015 Language Specification
#### 8.3 Execution Contests
The following row is added to **Table 24**:<br>

|-------------------|---------------------------------------------------------------|<br>
|   LastYieldValue  |  The value of the most recently evaluated *YieldExpression*  | <br>

#### 12.3 Left-Hand-Side Expression
##### Syntax

*MemberExpression*<sub>[Yield]</sub> &nbsp;:  <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;... <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*MetaProperty*<sub>[?Yield]</sub> <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...

*MetaProperty*<sub>[Yield]</sub> &nbsp;:  <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*NewTarget* <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [+Yield] *FunctionNext*

#### 14.4 Generator Function Definitions
##### Syntax
*FunctionNext* &nbsp;: <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**new . target**
#### 14.4.14 Evaluation
*FunctionNext*&nbsp;:&nbsp;**new . target **<br>
&nbsp;&nbsp;&nbsp;&nbsp;1.&nbsp;&nbsp;Assert:  the running execution context is a Generator Context.<br>
&nbsp;&nbsp;&nbsp;&nbsp;2.&nbsp;&nbsp;Let *genContext* be the running execution context.<br>
&nbsp;&nbsp;&nbsp;&nbsp;3.&nbsp;&nbsp;Return the value of the LastYieldValue component of *genContext* .<br>
#### 25.3.3.1 GeneratorStart(generator, generatorBody)

Between lines 3 and 4 of the ES6 algorithm add the following step:

&nbsp;&nbsp;&nbsp;&nbsp;3.5.&nbsp;&nbsp;Set the LastYieldValue component of *genContext* to **undefined**.

#### 25.3.3.3 GeneratorResume(generator, value)
Between lines 8 and 9 of the ES6 algorithm add the following step:

&nbsp;&nbsp;&nbsp;&nbsp;8.5.&nbsp;&nbsp;Set the LastYieldValue component of *genContext* to *value*.

#### 25.3.3.5 GeneratorYield(iterNextObj)
Between lines 5 and 6 of the ES6 algorithm add the following step:

&nbsp;&nbsp;&nbsp;&nbsp;5.5.&nbsp;&nbsp;Set the LastYieldValue component of *genContext* to **undefined**.
