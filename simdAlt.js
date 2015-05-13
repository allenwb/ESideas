//module SIMD  -- with static methods for operations

export class Float32x4 {
   constructor (v1, v2, v3, v4) { ...}
   
   //factory methods
   static splat(v) {return new this(v, v, v, v);
   static fromFloat64x2(t) {...}
   static fromInt32x4(t) {...}
   static fromFloat64x2Bits(t) {...}
   static fromInt32x4Bits(t) {...}
   static fromInt16x8Bits(t) {...}
   static fromInt8x16Bits(t) {...}
  
   //static predicates
   static check(v) {[[hasTag]](v, this) ? v : throw new TypeError}
   
   //static accessor function
   static extractLane(t, i) {...}
   static store(array, index, value) {...}
   static store1(array, index, value) {...}
   static store2(array, index, value) {...}
   static store3(array, index, value) {...}
   
   //computational factories
   static abs(t) {...}
   static neg(t) {...}
   static add(a, b) {...}
   static sub(a, b) {...}
   static mul(a, b) {...}
   static div(a, b) {...}
   static clamp(t, lowerLimit, upperLimit) {...}
   static min(a, b) {...}   
   static max(a, b) {...}   
   static minNum(a, b) {...}   
   static maxNum(a, b) {...}
   static reciprocalApproximation(t) {...}
   static reciprocalSqrtApproximation(t) {...}
   static sqrt(t) {...}
   static swizzle(t, x, y, z, w) {...}
   static shuffle(a, b, x, y, z, w) {...}
   static and(a, b) {...}
   static or(a, b) {...}
   static xor(a, b) {...}
   static not(a) {...}
   
   //Boolean vector computational Factories (all return Int32x4)
   static lessThan(a, b) {...}
   static lessThanOrEqual(a, b) {...}
   static equal(a, b) {...}
   static notEqual(a, b) {...}
   static greaterThan(a, b) {...}
   static greaterThanOrEqual(a, b) {...}
   
   //selection Factories
   static select(laneSelector, trueValues, falseValues) {...}
   static bitSelect(bitSelectionMask, trueValues, falseValues) {...}
   
   //from TypedArray factories
   static load(array, index) {...}
   static load1(array, index) {...}   
   static load2(array, index) {...}   
   static load3(array, index) {...}
   
   //prototype methods
   get [Symbol.toStringTag]() {return "Float32x4"}
}

//--------------------------------------------------------------
//module SIMD  -- with prototype methods for operations

export class Float32x4 {
   constructor (v1, v2, v3, v4) { ...}
   
   //factory methods
   static splat(v) {return new this(v, v, v, v);
   static fromFloat64x2(t) {...}
   static fromInt32x4(t) {...}
   static fromFloat64x2Bits(t) {...}
   static fromInt32x4Bits(t) {...}
   static fromInt16x8Bits(t) {...}
   static fromInt8x16Bits(t) {...}
  
   //from TypedArray factories
   static load(array, index) {...}
   static load1(array, index) {...}   
   static load2(array, index) {...}   
   static load3(array, index) {...}

   //selection Factories
   static select(laneSelector, trueValues, falseValues) {...}
   static bitSelect(bitSelectionMask, trueValues, falseValues) {...}

   // predicates
   static isFloat32x4() {[[hasTag]](this, "Float32x4Tag") ? v : throw new TypeError}
   
   // accessor methods
   extractLane(i) {...}
   store(array, index) {...}
   store1(array, index) {...}
   store2(array, index) {...}
   store3(array, index) {...}
   
   //computational operations
   abs() {...}
   neg() {...}
   add(b) {...}
   sub(b) {...}
   mul(b) {...}
   div(b) {...}
   clamp(lowerLimit, upperLimit) {...}
   min(b) {...}   
   max(b) {...}   
   minNum(b) {...}   
   maxNum(b) {...}
   reciprocalApproximation() {...}
   reciprocalSqrtApproximation() {...}
   sqrt() {...}
   swizzle(x, y, z, w) {...}
   shuffle(b, x, y, z, w) {...}
   and(b) {...}
   or(b) {...}
   xor(b) {...}
   not() {...}
   
   //Boolean comparisions (all return Int32x4)
   lessThan(b) {...}
   lessThanOrEqualb) {...}
   equal(b) {...}
   notEqual(b) {...}
   greaterThan(b) {...}
   greaterThanOrEqual(b) {...}
         
   //other methods
   get [Symbol.toStringTag]() {return "Float32x4"}
}