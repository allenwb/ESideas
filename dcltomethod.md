## A Declarative Alternative to toMethod ##
Allen Wirfs-Brock  
February 23, 2015

### The Problem
**TL;DR The Semantics of ES6 `super` clashes with ad hoc method mixins** 

ECMAScript 2015 provides the `super` keyword for delegating property accesses to a property definition provided further up the prototype (or superclass) inheritance chain.  For example: 
```es
class MyArray extends Array {
   push(...args) {
      console.log(`pushing ${args)`);
      super.push(...args);
   }
}
```
In order for the function `MyArray.prototype.push` to be able to find the `Array.prototype.push` method, the function needs to  keeps a reference to the object that holds it as an own property.  That reference is called the function's [[HomeObject]]. In this example function's [[HomeObject]] value is `MyArray.prototype`.

JavaScript programmers are used to installing methods on objects by simply assigning a function as the value of a property.  So, a programmer might reasonably expect that the `MyArray.prototype.push` method could be associated with another objects via an assignment like:
```js
someObject.push = MyArray.prototype.push;
```
But, because of the [[HomeObject]] method association this usually will not have the intended result. For example, consider:
```js
//Example 1
class Pusher {
   push(...args) {
      console.log(`Pusher.prototype.push`);
      Array.prototype.push.apply(this, args);
   }
 }
 let aPusher = new Pusher;
 aPusher.push(0); //console: Pusher.protoype.push
 aPusher.push = MyArray.prototype.push //ad hoc mixin
 
 aPusher.push(1); //console:  pushing 1
                  //expected: pushing 1
                  //          Pusher.prototype.push 
```
A programmer who wrote the assignment `aPusher.push = MyArray.prototype.push` was probably thinking that they could just reuse the `push` method from `MyArray.prototype` and that the `super.push` call within it would start searching for a `push` method at the [[Prototype]] of `aPusher`. But it doesn't. Instead that method will always begin its `super.push` search starting with the [[prototype]] of `MyArray.prototype` because that is what the [[HomeObject]] of the function is permanently set to.

Using Object.assign with an object literal has similar counter-intuitive results:
```js
//Exammple 2
Object.assign(aPusher, {
   push(...args) {
      console.log("aPusher mixin");
      super.push(...args);
   }
 }
```
In this case, the [[HomeObject]] of the mixed-in `push` function is set to the literally created object that is passed as the second argument to `Object.assign` rather than the object that is the value of `aPusher`.  `super.push` will look for a `push` method in `Object.prototype` rather than in `Pusher.prototype` as was intended. Such a method probably won't be found. The same problem exists if a programmer tries to use `Object.assign` to mix methods into the prototype object created by a constructor function or class declaration

In summary, in ES6 using property assignment or `Object.assign` to mix functions into objects (including prototype objects and constructors) results in unexpected problematic behavior if the functions contain any `super` property references.  

### The toMethod Solution ###
**TL;DR The draft ES6 `toMethod` solution was to set the [[HomeObjedt]] of a clone of the original method.  That was solution was abandoned because it was unintuitive, complex, and error-prone.** 

The original approach tried in ES6 drafts was to use a built-in method named `toMethod` to solve this problem. ``toMethod` was defined as a method on `function.prototype` and could be used to change the [[HomeObject]] association of a function.

For example, in example 1  the method mix-in assignment:
```js
aPusher.push = MyArray.prototype.push //ad hoc mix-in
```
would have been replaced by:
```js
aPusher.push = MyArray.prototype.push.toMethod(aPusher); 
```
Conceptually, what `toMethod` does is set the [[HomeObject]] of its `this` object to the object passed as its argument and then return its updated `this`  value.  But it can't actually do that.  The any preexisting references  (from `MyArray.prototype` in this example) to the `this` value  still exists. And those reference typically need to use the old [[HomeObject]] value rather than its new value.  Changing [[HomeObject]] to `aPusher` would correctly set it for `aPusher` usage but would break it for `MyArray.prototype` usage.

Instead, `toMethod` makes an almost clone of the function that is its `this` value and then returns the clone function as its value. One of the ways that  the clone function is different from the original function is that its [[HomeObject]] is set  to the `toMethod` argument. So, `MyArray.prototype.push.toMethod(aPusher)` creates a clone of the function that is the value of `MyArray.prototype.push`,  then sets the clone's [[HomeObject]] to the value of `aPusher`,  and finally it returns the clone.  It is that clone value that is then assigned to `aPusher.push`. The original `MyArray.prototype.push` function is unmodified.

However, cloning a function creates other complications. Is the clone a deep or shallow clone? In either case are all of the functions properties cloned or only some of them.  If the function itself has function valued properties should `toMethod` be recursively applied to them with the clone as the argument?  What happens if `toMethod` is applied to a built-in function, a bound function, or a callable Proxy object. Is it expected to also know how to clone those?

The answer used in the ES6 draft version of `toMethod` was to perform a shallow clone of the function excluding  all own properties except for `length`. If any other properties needed to be included in the clone (either shallowly or deeply) it was up to caller to `toMethod` to take care of that copying after `toMethod` returned the clone to it. For this reason, the ES6 draft `toMethod` was best thought of as a primitive that was intended to be primarily used by mix-in libraries or other abstractions over objects.  Such libraries  would have needed to establish their own policies for dealing with the cloning issue and for dealing with various kinds of exotic function objects.

Ultimately, TC39 decided that `toMethod` was too complex and error-prone.
### Declarative Is Better 
As shown in the examples above, defining methods that reference `super` properties in class declarations  is simple and straightforward. This is also true for object literals such as:
```js
let dog = {
    __proto__: animal,
    walk() {
      this.wagTail();
      super.walk()
    }
 }
```
The reason this works well is that a class definition or object literal declaratively associates a new `super` referencing function object with the the appropriate  "home object".  There is no need to  manipulate the method  outside the declaration, no need to imperatively modify a preexisting [[HomeObject]] reference, and no need to clone a method. 

Ideally, ECMAScrpt's support for ad hoc mix-ins should have these same characteristics.

Remember Example 2:
```js
//Exammple 2
Object.assign(aPusher, {
   push(...args) {
      console.log("aPusher mixin");
      super.push(...args);
   }
 }
```
It looked reasonable, but did the wrong thing. Here is what a declarative version that doesn't use `toMethod` but still does the correct thing might look like:
```js
//Exammple 2 - declarative
aPusher mixin {
   push(...args) {
      console.log("aPusher mixin");
      super.push(...args);
   }
 };
```
###A Declarative Solution
In this solution, `mixin` is a contextual keyword that is the first token of a high precedence left-associative postfix operator. The second part of a `mixin`operator has the syntax of an object literal and all of the normal property definition forms are allowed within it except for `__proto__:`.  Note that the object literal is a integral part of the `mixin` postfix operator operator, not a separate sub expression. We call the value that the `mixin` operator is applied to the "augmented object".

A simplified syntactic description of  the `mixin` operator is:    
        _MixinExpression_ : _MixinExpression_ `mixin` _ObjectLiteral_  
 where the value of the _MixinExpression_ to the left of the `mixin` contextual keyword is the augmented object.
 
The semantics are almost exactly the same as a regular object literal except that the property definitions within the _ObjectLiteral_ define properties on the augmented object.  Just like a normal `ObjectLiteral` the  properties are defined using [[DefineOwnProperty]] and they set property attributes just like an `ObjectLiteral`.  The value of the `mixin` object is the augmented object, after its properties have been updated.

Any methods within the `ObjectLiteral` that need a [[HomeObject]] binding are created with the augment object as their [[HomeObject]] value.  No method cloning is perform and a method with the "wrong" or `undefined` [[HomeObject]] never exists.

**Note that it is a very important characteristic that this proposal that `mixin` is an operator**, rather than a function such as  `Object.mixin` which was considered for ES6. Use of an operator allows the new methods to be initially instantiated using the correct [[HomeObject]] values.  All function based approaches require initially instantiating functions with the wrong [[HomeObject]] values and this leads to the need to clone the functions.
####But What If You Need Imperative Mixins?
The `mixin` operator solves the [[HomeObject]] binding problem by always defining the mixed-in methods at one place in a program so that the augmented object is available when the method function objects are instantiated. But what if you need to apply a mixin at many different places in a program? Just use procedural abstraction:
```es6
//someMixin.js
export const someMixin = obj=>obj mixin {
   method1() {return super.method1()},
   Method2() {...},
   data: 42
};
----------------------------------------
//consumer.js
import {someMixin} from "someMixin.js";
let myObj = someMixin(new MyClass());
//...
someFunct(someMixin(anotherObj));
//...
``` 
####Augmenting Classes 
The mixin operator can be applied to any object, including class objects and constructor functions:
```es6
class C extends B{
  static sm1() {}
  m1() {}
}

C mixin {
  m2() {super.m2()}
}
```
In the above example the augmented object is the class constructor `C` so `m2` will be added as a `static` method `C` and not as a method of `C.prototype`. The `super` property reference in `m2` follows the constructor prototype chaining starting at `B` rather than than the prototype chain of `C.prototype`. 

While this could be what somebody who wrote `C mixin {...}` intended, it probably isn't.  More likely, when extending a class object, a developer really wants to default to adding properties to the class' prototype object and if they want to add `static` methods they would prefer to label them as such.

There are other annoyances with using `mixin {...}` to augment class constructor objects.  One is that the value of the [[Enumerable]] attribute that is set by an _ObjectLiteral_ is the opposite value from what is set for method definitions in a _ClassBody_.  More generally when extending a class constructor you would like to be able to use _ClassBody_ syntax and semantics rather than _ObjectLiteral_ syntax and semantics.  This is already an issue for `static` methods. In the future it is  likely that other kinds of `ClassBody` elements will be added to ECMAScript and  probably  at least some of those should be available when augmenting a class constructor using the `mixin` operator.

We can address these issues by providing a second form of the `mixin` operator that is specifically defined for augmenting constructor objects. The simplified syntactic description of  this alternative `mixin` form is:  
        _MixinExpression_ : _MixinExpression_ `mixin class { ` _ClassBody_ `}`   

The `class` keyword following `mixin` indicates that this is a class mixin operation rather than an object mixin operation. the `mixin class` operator first performs an IsConstructor test of the augmented object and throws a TypeError exception if the result is `false`.  Otherwise, the non-static property definitions from _ClassBody_ are defined in the manner of a class definition on the value of the augmented object's `prototype` property and `static` property definitions are defined upon  the argumented object itself.  In both cases, each method's [[HomeObject]] is set appropriately. The only restriction on  _ClassBody_  (assuming only ES6 level elements) is that it may not define a `constructor` method.

Using a `mixin class` operator, the above example would be written like:

```es6
C mixin class {
  m2() {super.m2()}
}
```
and `m2` would be defined as a method property of `C.prototype`. If you wanted to augment both the prototype and the constructor you could write:

```es6
C mixin class {
  m2() {super.m2()}; //[[HomeObject]] is C.prototype
  static sm2() {super.sm2()};//[[HomeObject]] is C
}
```
###None Goals
This proposal is not intended to be a replacement for higher level class composition abstractions such as Traits.  Instead it provides the essential primitive language capabilities which combined with procedural or object abstraction capabilities can be used to define such higher level compositional abstractions.
###BNF

Here is the proposed BNF for this extension.

```bnf
MixinExpression :
    LeftHandSideExpression
    MixinExpression 'mixin' [no LineTerminator here] ObjectLiteral
    MixinExpression 'mixin' [no LineTerminator here] 'class {' ClassBody '}'

PostfixExpression :
    MixinExpression
    MixinExpression [no LineTerminator here] ++
    MixinExpression [no LineTerminator here] --
```
