#!/usr/bin/env node

'use strict'
const moment = require("moment")

const COLORS = {
	Reset: "\x1b[0m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m"
}

const TODAY = moment(moment().format("YYYY-MM-DD"))
const NOW = moment()
const TODAY_ALIASES = ["today", "td"]
const NOW_ALIASES = ["now"]

const SUM_OPERATORS = ["+", "-"]
const COMPARE_OPERATORS = ["=", "==", ">", "<", ">=", "<="]
const DIFF_OPERATORS = ["--", "diff"]

const OPERATORS = SUM_OPERATORS
	.concat(COMPARE_OPERATORS)
	.concat(DIFF_OPERATORS)

// value at index 0 is the one usef for moment operations
const YEARS = ["year", "years", "y"]
const MONTHS = ["month", "months", "M"]
const WEEKS = ["week", "weeks", "W", "w"]
const DAYS = ["day", "days", "D", "d"]
const HOURS = ["hour", "hours", "h", "H"]
const MINUTES = ["minute", "minutes", "m", "min"]
const SECONDS = ["second", "seconds", "s", "S"]
const MILLISECONDS = ["millisecond", "milliseconds", "ms", "MS", "milli", "millis"]

const ALL_UNITS = YEARS
	.concat(MONTHS)
	.concat(WEEKS)
	.concat(DAYS)
	.concat(HOURS)
	.concat(MINUTES)
	.concat(SECONDS)
	.concat(MILLISECONDS)

const VALUE_REGEX = new RegExp(`^[0-9]*(${ALL_UNITS.join("|")})$`)

let args = process.argv
args.shift()
args.shift()

args = parseArgs(args)
if (OPERATORS.includes(args[args.length - 1])) throwError("last parameter can't be an operator")
if (!args[1]) throwError("provide a valid operation")

function parseArgs(args) {
	return args.map((arg, i) => {
		if (i % 2 == 1) {
			if (!OPERATORS.includes(arg)) throwError("invalid operation - allowed values: " + OPERATORS.join(", "))
			else return arg
		} else {
			try { //check if valid date
				date = stringToDate(arg)
				if (!date.isValid()) throw Error
				return date
			} catch (err) {
				if (TODAY_ALIASES.includes(arg)) return TODAY
				else if (NOW_ALIASES.includes(arg)) return NOW
				else if (!VALUE_REGEX.test(arg)) throwError("unrecognized value: " + arg)
				else return parseValue(arg)
			}
		}
	})
}


(function iterateThroughArgs(args) {
	if (args.length <= 1) printResult(args[0])

	const item1 = args.shift()
	const operator = args.shift()
	const item2 = args.shift()

	const result = calculate(item1, item2, operator)
	args.unshift(result)

	return iterateThroughArgs(args)
})(args)


function throwError(msg) {
	console.log(COLORS.FgRed + "Error: " + msg + COLORS.Reset)
	process.exit(1)
}

function stringToDate(str) {
	//prevent moment warning
	const warn = console.warn;
	console.warn = () => {};
	const date = moment(str)
	console.warn = warn
	return date
}

function parseValue(str) {
	const lastNumber = str.split("").findLast(char => !isNaN(parseInt(char)))
	const lastNumIndex = str.lastIndexOf(lastNumber)
	const value = str.slice(0, lastNumIndex + 1)
	const unit = str.slice(lastNumIndex + 1)
	return [value, unit] 
}

function operations(item1, item2) {
	return {
		"+": () => item1.add(item2[0], item2[1]),
		"-": () => item1.subtract(item2[0], item2[1]),
		"=": () => item1.isSame(item2),
		"==": () => item1.isSame(item2),
		">": () => item1.isAfter(item2),
		">=": () => item1.isSameOrAfter(item2),
		"<": () => item1.isBefore(item2),
		"<=": () => item1.isSameOrBefore(item2),
		"--": () => item1.diff(item2, "ms"),
		"diff": () => item1.diff(item2, "ms")
	}
}

function calculate(item1, item2, operator) {
	if (SUM_OPERATORS.includes(operator)) item2[1] = validateSum(item1, item2)
	else if (COMPARE_OPERATORS.includes(operator)) validateCompare(item1, item2)
	else if (DIFF_OPERATORS.includes(operator)) validateDiff(item1, item2)
	else throwError("unrecognized operator: " + operator)

	return operations(item1, item2)[operator]()
}

function validateSum(item1, item2) {
	const unit = item2[1]
	if (unit) { //is value
		if (!isUnitValid(unit)) {
			throwError("invalid unit", unit)	
		} else {
			if (YEARS.includes(unit)) return YEARS[0]
			if (MONTHS.includes(unit)) return MONTHS[0]
			if (WEEKS.includes(unit)) return WEEKS[0]
			if (DAYS.includes(unit)) return DAYS[0]
			if (HOURS.includes(unit)) return HOURS[0]
			if (MINUTES.includes(unit)) return MINUTES[0]
			if (SECONDS.includes(unit)) return SECONDS[0]
			if (MILLISECONDS.includes(unit)) return MILLISECONDS[0]
		}
	} else throwError("value on the right cannot be a date")
}

function validateCompare(item1, item2) {
	
}

function validateDiff(item1, item2) {
	
}

function isUnitValid(unit) {
	return new RegExp(`${ALL_UNITS.join("|")}`).test(unit)
}

function printResult(value) {
	try { value = value.format()} catch (err) {}
	console.log(COLORS.FgGreen + value + COLORS.Reset)
	process.exit(0)
}