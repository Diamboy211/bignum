class fp
{
  static _sh = 64n;
  static _div = 1n << fp._sh;
  static _floor_mask = ~(fp._div - 1n);
  static _lut = [];
  static _log_coef = [1.43719242718, -0.671114947533, 0.312397863847, -0.0784753434979].map(a => BigInt(a * Number(fp._div)));
  static _pow_coef = [0.692979520939, 0.241605094556, 0.0517450677264, 0.0136703167784].map(a => BigInt(a * Number(fp._div)));
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
  // _log2()
  // {
  //   let n = this.n;
  //   let r = 0n;
  //   let a = fp._div >> 1n;
  //   while (a > 0)
  //   {
  //     n = n * n / fp._div;
  //     if (n >= fp._div << 1n)
  //     {
  //       r += a;
  //       n >>= 1n;
  //     }
  //     a >>= 1n;
  //   }
  //   return r;
  // }
  // faster polynomial approximation
  _log2()
  {
    let n = this.n - fp._div;
    let x = n;
    let s = x * fp._log_coef[0] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._log_coef[1] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._log_coef[2] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._log_coef[3] / fp._div;
    return s;
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
  static log2p1(a)
  {
    let s = fp.copy(a);
    s.n += fp._div;
    return fp.log2(s);
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
  // static get _LUT()
  // {
  //   if (fp._lut.length == 0)
  //   {
  //     let s = new fp(2);
  //     let i = fp._div;
  //     while (i > 0n)
  //     {
  //       s = fp.sqrt(s);
  //       let t = new fp(0);
  //       t.n = s.n;
  //       i >>= 1n;
  //       fp._lut.push(t);
  //     }
  //   }
  //   return fp._lut;
  // }
  // works for numbers between 0 to nextafter(1, -inf)
  // _pow2()
  // {
  //   let n = this.n;
  //   let i = 0;
  //   let j = 1n;
  //   let r = new fp(1);
  //   while (j < fp._div)
  //   {
  //     if (n & (fp._div >> 1n))
  //     {
  //       r = fp.mul(r, fp._LUT[i]);
  //     }
  //     n <<= 1n;
  //     i++;
  //     j <<= 1n;
  //   }
  //   return r;
  // }
  // faster polynomial approximation
  _pow2()
  {
    let n = this.n;
    let x = n;
    let s = fp._div + x * fp._pow_coef[0] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._pow_coef[1] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._pow_coef[2] / fp._div;
    x = x * n / fp._div;
    s = s + x * fp._pow_coef[3] / fp._div;
    return s;
  }
  static pow2(a)
  {
    let n = a.n;
    let i = fp.floor(a).n / fp._div;
    let f = n - i * fp._div;
    let s = new fp(0);
    s.n = f;
    s.n = s._pow2() << i;
    return s;
  }
  static floor(a)
  {
    let s = new fp(0);
    s.n = a.n & fp._floor_mask;
    return s;
  }
  static ceil(a)
  {
    let s = new fp(0);
    s.n = (a.n + fp._div - 1n) & fp._floor_mask;
    return s;
  }
  static max(a, b)
  {
    let s = new fp(0);
    s.n = a.n;
    if (a.n < b.n) s.n = b.n;
    return s;
  }
  static min(a, b)
  {
    let s = new fp(0);
    s.n = a.n;
    if (a.n > b.n) s.n = b.n;
    return s;
  }
  static copy(a)
  {
    let s = new fp(0);
    s.n = a.n;
    return s;
  }
  static abs(a)
  {
    let s = a.copy();
    if (a.n < 0n) s.n = -s.n;
    return s;
  }
  static lt(a, b) { return a.n < b.n; }
  static gt(a, b) { return a.n > b.n; }
  static eq(a, b) { return a.n == b.n; }
  static lte(a, b) { return a.n <= b.n; }
  static gte(a, b) { return a.n >= b.n; }
  static neq(a, b) { return a.n != b.n; }
  add(b) { return fp.add(this, b); }
  sub(b) { return fp.sub(this, b); }
  mul(b) { return fp.mul(this, b); }
  div(b) { return fp.div(this, b); }
  log2() { return fp.log2(this); }
  log2p1() { return fp.log2p1(this); }
  sqrt() { return fp.sqrt(this); }
  pow2() { return fp.pow2(this); }
  floor() { return fp.floor(this); }
  ceil() { return fp.ceil(this); }
  max(b) { return fp.max(this, b); }
  min(b) { return fp.min(this, b); }
  copy() { return fp.copy(this); }
  abs() { return fp.abs(this); }
  lt(b) { return this.n < b.n; }
  gt(b) { return this.n > b.n; }
  eq(b) { return this.n == b.n; }
  lte(b) { return this.n <= b.n; }
  gte(b) { return this.n >= b.n; }
  neq(b) { return this.n != b.n; }
}

export default class BigNumber
{
  static l10_l2 = new fp(10).log2().div(new fp(2).log2());
  static l2_l10 = new fp(2).log2().div(new fp(10).log2());
  static exp_zero = new fp(-696969).pow2();
  constructor(n)
  {
    if (n == undefined) this.e = 0;
    if (typeof(n) == "number")
    {
      if (n == 0) this.e = BigNumber.exp_zero.copy();
      this.e = new fp(Math.log2(n));
    }
    if (typeof(n) == "bigint")
    {
      let s = new fp(0);
      s.n = n * fp._div;
      this.e = s.log2();
    }
    if (typeof(n) == "string")
    {
      let a = n.split('e');
      if (a.length == 1)
      {
        this.e = new fp(Math.log2(Number(a[0])));
      }
      if (a.length == 2)
      {
        if (a[0].length == 0)
        {
          // assume logarithm notation
          this.e = new fp(Number(a[1])).mul(BigNumber.l10_l2);
        }
        else
        {
          // assume scientific notation
          this.e = new fp(Number(a[1])).mul(BigNumber.l10_l2).add(new fp(Math.log2(Number(a[0]))));
        }
      }
    }
  }
  toString()
  {
    if (this.e.eq(BigNumber.exp_zero))
      return '0';
    let _e = this.e.mul(BigNumber.l2_l10);
    let e = _e.floor();
    let m = _e.sub(e).mul(BigNumber.l10_l2).pow2();
    if (m.gte(new fp(9.99995)))
    {
      m = new fp(1);
      e = e.add(new fp(1));
    }
    if (e.abs().lt(new fp(5)))
    {
      return (Number(this.e.pow2().n) / Number(fp._div)).toFixed(4);
    }
    else if (e.abs().lt(new fp(10000)))
    {
      return (Number(m.n) / Number(fp._div)).toFixed(4) + 'e' + Number(e.n / fp._div);
    }
    else
    {
      return (Number(m.n) / Number(fp._div)).toFixed(4) + 'e' + new BigNumber(e.n / fp._div).toString();
    }
  }
  static copy(a)
  {
    let s = new BigNumber;
    s.e = fp.copy(a.e);
    return s;
  }
  static max(a, b)
  {
    let s = new BigNumber;
    s.e = fp.max(a.e, b.e);
    return s;
  }
  static min(a, b)
  {
    let s = new BigNumber;
    s.e = fp.min(a.e, b.e);
    return s;
  }
  static add(a, b)
  {
    let s = new BigNumber;
    let m = fp.min(a.e, b.e);
    let n = fp.max(a.e, b.e);
    if (n.sub(m).lt(new fp(32)))
      s.e = m.sub(n).pow2().log2p1().add(n);
    else s.e = m.e;
    return s;
  }
  static sub(a, b)
  {
    let s = new BigNumber;
    let m = fp.min(a.e, b.e);
    let n = fp.max(a.e, b.e);
    if (n.sub(m).lt(new fp(32)))
      s.e = new fp(1).sub(m.sub(n).pow2()).log2().add(n);
    else s.e = BigNumber.exp_zero.copy();
    return s;
  }
  static mul(a, b)
  {
    let s = new BigNumber;
    s.e = a.e.add(b.e);
    return s;
  }
  static div(a, b)
  {
    let s = new BigNumber;
    s.e = a.e.sub(b.e);
    return s;
  }
  static pow2(a)
  {
    let s = new BigNumber;
    s.e = a.e.pow2();
    return s;
  }
  static log2(a)
  {
    let s = new BigNumber;
    s.e = a.e.log2();
    return s;
  }
  static sqrt(a)
  {
    let s = new BigNumber;
    s.e = a.e.div(2);
    return s;
  }
  add(b) { return BigNumber.add(this, b); }
  sub(b) { return BigNumber.sub(this, b); }
  mul(b) { return BigNumber.mul(this, b); }
  div(b) { return BigNumber.div(this, b); }
  log2() { return BigNumber.log2(this); }
  pow2() { return BigNumber.pow2(this); }
  sqrt() { return BigNumber.sqrt(this); }
  max(b) { return BigNumber.max(this, b); }
  min(b) { return BigNumber.min(this, b); }
  copy() { return BigNumber.copy(this); }
}
