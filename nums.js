export default class fp
{
  static _div = 2n ** 64n;
  static _lut = [];
  constructor(n)
  {
    this.n = BigInt(Math.round(n * Number(fp._div)));
  }
  static add(a, b)
  {
    let r = new fp(0);
    r.n = a.n + b.n;
    return r;
  }
  static sub(a, b)
  {
    let r = new fp(0);
    r.n = a.n - b.n;
    return r;
  }
  static mul(a, b)
  {
    let r = new fp(0);
    r.n = a.n * b.n;
    r.n /= fp._div;
    return r;
  }
  static div(a, b)
  {
    let r = new fp(0);
    r.n = a.n * fp._div;
    r.n /= b.n;
    return r;
  }
  // works for numbers between 1 to nextafter(2, -inf)
  _log2()
  {
    let n = this.n;
    let r = 0n;
    let a = fp._div >> 1n;
    while (a > 0)
    {
      n = n * n / fp._div;
      if (n >= fp._div << 1n)
      {
        r += a;
        n >>= 1n;
      }
      a >>= 1n;
    }
    return r;
  }
  static log2(a)
  {
    let i = 0n;
    let n = a.n;
    while (n >= fp._div * 2n) i++, n >>= 1n;
    while (n < fp._div) i--, n <<= 1n;
    let s = new fp(0);
    s.n = n;
    let f = s._log2();
    let r = i * fp._div + f;
    s.n = r;
    return s;
  }
  static sqrt(a)
  {
	  let pn = a.n, n = a.n / 2n, d;
	  do
	  {
  		n = (n + (a.n * fp._div) / n) >> 1n;
	  	d = n - pn;
		  pn = n;
		  if (d < 0n) d = -d;
	  }
  	while (d > 1n);
    let s = new fp(0);
    s.n = n;
	  return s;
  }
  static get _LUT()
  {
    if (fp._lut.length == 0)
    {
      let s = new fp(2);
      let i = fp._div;
      while (i > 0n)
      {
        s = fp.sqrt(s);
        let t = new fp(0);
        t.n = s.n;
        i >>= 1n;
        fp._lut.push(t);
      }
    }
    return fp._lut;
  }
  // works for numbers between 0 to nextafter(1, -inf)
  _pow2()
  {
    let n = this.n;
    let i = 0;
    let j = 1n;
    let r = new fp(1);
    while (j < fp._div)
    {
      if (n & (fp._div >> 1n))
      {
        r = fp.mul(r, fp._LUT[i]);
      }
      n <<= 1n;
      i++;
      j <<= 1n;
    }
    return r;
  }
  static pow2(a)
  {
    let n = a.n;
    let i = n / fp._div;
    let f = n - i * fp._div;
    let s = new fp(0);
    s.n = f;
    s.n = s._pow2().n << i;
    return s;
  }
}

class BigNumber
{
  constructor(n)
  {
    if (typeof(n) == "number")
    {
      this.e = Math.log2(n);
    }
    if (typeof(n) == "string")
    {
      
    }
  }
}
