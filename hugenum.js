// if e >= 0: sign * 10^X
// else: sign * 10^-X
// where X = 10^10^...^10^frac(|e|)
//           \floor(|e|)/
export default class HugeNumber
{
	e = -Infinity;
	s = false;
	constructor(x)
	{
		if (x instanceof HugeNumber)
		{
			this.e = x.e;
			this.s = x.s;
		}
		else if (typeof(x) == "number") this._number(x);
		else if (typeof(x) == "string") this._string(x);
		else if (x != undefined) throw new Error("what");
	}
	_number(x)
	{
		if (!x) return;
		if (x < 0)
		{
			x *= -1;
			this.s = true;
		}
		if (x == Infinity)
		{
			this.e = Infinity;
			return;
		}
		let e = Math.log10(x);
		let s = 1;
		let l = 0;
		if (e < 0)
		{
			s = -1;
			e *= -1;
		}
		while (e >= 1)
		{
			l++;
			e = Math.log10(e);
		}
		l += e;
		this.e = l * s;
	}
	_string(x)
	{
		if (!x) return;
		let a = x.split('e').map(e => e == '' ? new HugeNumber(1) : new HugeNumber(+e));
		let r = a.pop();
		while (a.length)
			r = HugeNumber.mul(a.pop(), HugeNumber.pow10(r));
		this.e = r.e;
		this.s = r.s;
	}
	static fromNumber(x)
	{
		let r = new HugeNumber;
		r._number(x);
		return r;
	}
	toNumber()
	{
		let e = this.e;
		if (e == -Infinity) return 0;
		if (e == Infinity) return this.s ? -Infinity : Infinity;
		let r = 0;
		let s = 1;
		if (e < 0)
		{
			e *= -1;
			s = -1;
		}
		let f = Math.floor(e);
		e -= f;
		r = e;
		while (f > 0)
		{
			f--;
			r = 10 ** r;
			if (Math.abs(r) == Infinity) return r;
		}
		r = 10 ** (s * r);
		if (this.s) r *= -1;
		return r;
	}
	get layer() { return Math.sign(this.e) * Math.floor(Math.abs(this.e)); }
	get mag() { return Math.abs(this.e - this.layer); }
	static max(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		if (x.s == y.s) return [x, y][x.s ^ (x.e < y.e)];
		else return [x, y][+x.s];
	}
	static min(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		if (x.s == y.s) return [y, x][x.s ^ (x.e < y.e)];
		else return [y, x][+x.s];
	}
	static maxminabs(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		return [[x, y], [y, x]][+(x.e < y.e)];
	}
	static add(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		if (x.e == Infinity) return x;
		if (y.e == Infinity) return y;
		// if one of the numbers is 0, return the other
		if (x.e == -Infinity) return y;
		if (y.e == -Infinity) return x;
		// if x is -y, return 0
		if (x.s != y.s && x.e == y.e) return new HugeNumber;
		let [a, b] = HugeNumber.maxminabs(x, y);
		// if the mag of one of the numbers is larger than ~10^10^15, return the number bigger in mag
		if (a.e >= 3.07) return a;
		// if the big number's mag is between 10^-15 and 10^15, ooga it
		if (a.e <= 2.07 && a.e >= -2.07) return new HugeNumber(a.toNumber() + b.toNumber());
		// if the small number is too small compared to the big number, return the big one
		if (a.e > 2.07 && b.e < -2.07) return a;
		// time for actual brain
		// b.e is also > 2.07
		if (a.e > 2.07)
		{
			let r = new HugeNumber;
			r.e = a.e - 1;
			let ma = r.toNumber();
			r.e = b.e - 1;
			let mb = r.toNumber();
			let dm = ma - mb;
			let e;
			if (dm > 15) e = ma;
			else if (a.s != b.s) e = mb + Math.log10(10 ** dm - 1);
			else e = mb + Math.log10(10 ** dm + 1);
			r.s = a.s;
			if (e > 1e10) r.e = Math.log10(Math.log10(Math.log10(e))) + 3;
			else r.e = Math.log10(Math.log10(e)) + 2;
			return r;
		}
		// the remaining case is a.e < -2.07 and b.e < -2.07
		let r = new HugeNumber;
		r.e = -a.e - 1;
		let ma = r.toNumber();
		r.e = -b.e - 1;
		let mb = r.toNumber();
		let dm = ma - mb;
		let e;
		if (dm > 15) e = ma;
		else if (a.s != b.s) e = Math.log10(1 - 10 ** dm) - ma;
		else e = Math.log10(1 + 10 ** dm) - ma;
		r.s = a.s;
		if (e < -1e10) r.e = -Math.log10(Math.log10(Math.log10(-e))) - 3;
		else r.e = -Math.log10(Math.log10(-e)) - 2;
		return r;
	}
	static sub(x, y)
	{
		return HugeNumber.add(x, HugeNumber.neg(y));
	}
	static mul(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		// 2 lazy lel
		let a = HugeNumber.log10(HugeNumber.abs(x));
		let b = HugeNumber.log10(HugeNumber.abs(y));
		let r = HugeNumber.pow10(HugeNumber.add(a, b));
		r.s = x.s != y.s;
		return r;
	}
	static div(x, y)
	{
		x = new HugeNumber(x);
		y = new HugeNumber(y);
		let a = HugeNumber.log10(HugeNumber.abs(x));
		let b = HugeNumber.log10(HugeNumber.abs(y));
		let r = HugeNumber.pow10(HugeNumber.sub(a, b));
		r.s = x.s != y.s;
		return r;
	}
	static log10(x)
	{
		x = new HugeNumber(x);
		let r = new HugeNumber(-Infinity);
		if (x.e == -Infinity) return r;
		if (x.s) throw new Error("log(neg)");
		if (x.e >= 1)
		{
			r.e = x.e - 1;
			r.s = false;
		}
		else if (x.e <= -1) r.e = -x.e - 1;
		else r = new HugeNumber(x.e);
		return r;
	}
	static pow10(x)
	{
		x = new HugeNumber(x);
		let r = new HugeNumber;
		if (x.e >= 0) r.e = x.e + 1;
		else r.e = HugeNumber.abs(x).toNumber();
		if (x.s) r.e *= -1;
		return r;
	}
	static pow(x, y)
	{
		return HugeNumber.pow10(HugeNumber.mul(HugeNumber.log10(x), y));
	}
	static abs(x)
	{
		x = new HugeNumber(x);
		let r = new HugeNumber;
		r.e = x.e;
		r.s = false;
		return r;
	}
	static neg(x)
	{
		let r = new HugeNumber(x);
		r.s = !r.s;
		return r;
	}
	static floor(x)
	{
		x = new HugeNumber(x);
		if (x.e < 2.07) return new HugeNumber(Math.floor(x.toNumber()));
		return x;
	}
	static ceil(x)
	{
		x = new HugeNumber(x);
		if (x.e < 2.07) return new HugeNumber(Math.ceil(x.toNumber()));
		return x;
	}
	static cmp(x, y)
	{
		if (x.e == -Infinity && y.e == -Infinity) return 0;
		if (x.e == y.e || x.s != y.s) return +y.s - +x.s;
		if (x.e > y.e) return 1 - x.s * 2;
		return x.s * 2 - 1;
	}
	static lt(x, y) { return HugeNumber.cmp(x, y) < 0; }
	static gt(x, y) { return HugeNumber.cmp(x, y) > 0; }
	static lte(x, y) { return HugeNumber.cmp(x, y) <= 0; }
	static gte(x, y) { return HugeNumber.cmp(x, y) >= 0; }
	static eq(x, y) { return HugeNumber.cmp(x, y) == 0; }
	static neq(x, y) { return HugeNumber.cmp(x, y) != 0; }

	max(b) { return HugeNumber.max(this, b); }
	min(b) { return HugeNumber.min(this, b); }
	add(b) { return HugeNumber.add(this, b); }
	sub(b) { return HugeNumber.sub(this, b); }
	mul(b) { return HugeNumber.mul(this, b); }
	div(b) { return HugeNumber.div(this, b); }
	pow(b) { return HugeNumber.pow(this, b); }
	cmp(b) { return HugeNumber.cmp(this, b); }
	lt(b) { return HugeNumber.lt(this, b); }
	lte(b) { return HugeNumber.lte(this, b); }
	gt(b) { return HugeNumber.gt(this, b); }
	gte(b) { return HugeNumber.gte(this, b); }
	eq(b) { return HugeNumber.eq(this, b); }
	neq(b) { return HugeNumber.neq(this, b); }
	log10() { return HugeNumber.log10(this); }
	pow10() { return HugeNumber.pow10(this); }
	floor() { return HugeNumber.floor(this); }
	ceil() { return HugeNumber.ceil(this); }
	log(b)
	{
		return HugeNumber.div(HugeNumber.log10(this), HugeNumber.log10(b));
	}
};

