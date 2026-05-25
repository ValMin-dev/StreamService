const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const y = d * 365.25

type Unit =
	| 'Years'
	| 'Year'
	| 'Yrs'
	| 'Yr'
	| 'Y'
	| 'Weeks'
	| 'Week'
	| 'Wks'
	| 'Wk'
	| 'W'
	| 'Days'
	| 'Day'
	| 'Dys'
	| 'Dy'
	| 'D'
	| 'Hours'
	| 'Hour'
	| 'Hrs'
	| 'Hr'
	| 'H'
	| 'Minutes'
	| 'Minute'
	| 'Mins'
	| 'Min'
	| 'M'
	| 'Seconds'
	| 'Second'
	| 'Secs'
	| 'Sec'
	| 'S'
	| 'Milliseconds'
	| 'Millisecond'
	| 'Msecs'
	| 'Msec'
	| 'Ms'
	| 'ms'

type UnitAnyCase = Unit | Lowercase<Unit> | Uppercase<Unit>

export type StringValue =
	| `${number}${UnitAnyCase}`
	| `${number} ${UnitAnyCase}`
	| `${number}.${number}${UnitAnyCase}`
	| `${number}.${number} ${UnitAnyCase}`

export function ms(str: StringValue): number {
	if (typeof str !== 'string' || str.length > 100 || str.length === 0) {
		throw new Error('Invalid input')
	}

	const normalized = str.trim().replace(/^['"]|['"]$/g, '')

	const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/)
	if (!match) {
		throw new Error('Invalid input')
	}

	const n = parseFloat(match[1])
	const type = (match[2] || 'ms').toLowerCase() as Lowercase<Unit>

	switch (type) {
		case 'years':
		case 'year':
		case 'yrs':
		case 'yr':
		case 'y':
			return n * y
		case 'weeks':
		case 'week':
		case 'wks':
		case 'wk':
		case 'w':
			return n * w
		case 'days':
		case 'day':
		case 'dys':
		case 'dy':
		case 'd':
			return n * d
		case 'hours':
		case 'hour':
		case 'hrs':
		case 'hr':
		case 'h':
			return n * h
		case 'minutes':
		case 'minute':
		case 'mins':
		case 'min':
		case 'm':
			return n * m
		case 'seconds':
		case 'second':
		case 'secs':
		case 'sec':
		case 's':
			return n * s
		case 'milliseconds':
		case 'millisecond':
		case 'msecs':
		case 'msec':
		case 'ms':
			return n
		default:
			throw new Error('Invalid unit')
	}
}
