# big number libraries

`nums.js`: stores a number in the form 2^exponent where exponent is stored as a fixed-point number. practical limit: e1e10000

`hugenum.js`: stores a number in the form sign*10^(sign(e)*X) where X is 10^10^...^10^10^frac(|e|) with floor(|e|) 10's. practical limit: 10^^9e15 (will become 10^^2^1024 when i implement tetration)
