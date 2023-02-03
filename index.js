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
const COMPARE_OPERATORS = ["=", "aft", "bef", "afteq", "befeq"]
const DIFF_OPERATORS = ["diff"]

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
const SECONDS = ["second", "seconds", "s", "S", "sec"]
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

if (args.includes("help") || args.includes("--help") || args.includes("-help") || args.includes("-h")) {
	printHelp()
	process.exit(0)
}

let resultFormat = undefined

args = parseArgs(args)
if (OPERATORS.includes(args[args.length - 1])) throwError("last parameter can't be an operator")
if (!args[1]) throwError("provide a valid operation")

function parseArgs(args) {
	args = parseResultFormat(args)
	
	return args.map((arg, i) => {
		if (i % 2 == 1) {
			if (!OPERATORS.includes(arg)) throwError("invalid operation - allowed values: " + OPERATORS.join(", "))
			else return arg
		} else {
			try { //check if valid date
				const date = stringToDate(arg)
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
		"+": () => item1.clone().add(item2[0], item2[1]),
		"-": () => item1.clone().subtract(item2[0], item2[1]),
		"=": () => item1.isSame(item2),
		"==": () => item1.isSame(item2),
		"aft": () => item1.isAfter(item2),
		"afteq": () => item1.isSameOrAfter(item2),
		"bef": () => item1.isBefore(item2),
		"befeq": () => item1.isSameOrBefore(item2),
		"diff": () => item1.diff(item2, resultFormat)
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
	} else throwError("value on the right of a sum/diff operation cannot be a date")
}

function validateCompare(item1, item2) {
	
}

function validateDiff(item1, item2) {
	
}

function isUnitValid(unit) {
	return new RegExp(`${ALL_UNITS.join("|")}`).test(unit)
}

function printResult(value) {
	try { value = value.format(resultFormat) } catch (err) {
		if (!err.message.includes("not a function")) throw err
	}
	console.log(COLORS.FgGreen + value + COLORS.Reset)
	process.exit(0)
}

function printHelp() {
	console.log("\nDateX v" + require("./package.json").version)
	console.log("\nUsage:")
	console.log("\tdatex <value1> <operator> <value2> <operator> <value3>....\n")
	console.log("\tExample 1: \n\t\tdatex now - 400hours to YYYY-MM-DD")
	console.log("\n\t\t> calculates the datetime of 400 hours before\n\t\tcurrent time and parses it to the given format\n")
	console.log("\tExample 2: \n\t\tdatex now - 400hours diff 2012-07-08 to h")
	console.log("\n\t\t> calculates the datetime of 400 hours before current time \n\t\tand then calculates the difference between the result and\n\t\t2012-07-08 converting it to hours")
	console.log("\n\tNOTE: every operation is applied to the result of the previous one\n")
	console.log("Operations:")
	console.log("\tSUM/DIFF: \t\"" + SUM_OPERATORS.join("\", \"") + "\"")
	console.log("\tCOMPARISON: \t\"" + COMPARE_OPERATORS.join("\", \"") + "\"")
	console.log("\tDIFF: \t\t\"" + DIFF_OPERATORS.join("\", \"") + "\"\n")
	console.log("Date aliases:")
	console.log("\tToday at 00:00:00:  \"" + TODAY_ALIASES.join("\", \"") + "\"")
	console.log("\tCurrent time:       \"" + NOW_ALIASES.join(", ") + "\"\n")
	console.log("Date values formats:")
	console.log("\t<YYYY-MM-DDThh:mm:ss>,")
	console.log("\t<DD/MM/YYYY hh:mm:ss>,")
	console.log("\t...anything generally accepted will fit\n")
	console.log("Absolute values format:")
	console.log("\t<value><unit>")
	console.log("\te.g.: 500d\n")
	console.log("Time units aliases:")
	console.log("\tYears:        \"" + YEARS.join("\", \"") + "\"")
	console.log("\tMonths:       \"" + MONTHS.join("\", \"") + "\"")
	console.log("\tWeeks:        \"" + WEEKS.join("\", \"") + "\"")
	console.log("\tDays:         \"" + DAYS.join("\", \"") + "\"")
	console.log("\tHours:        \"" + HOURS.join("\", \"") + "\"")
	console.log("\tMinutes:      \"" + MINUTES.join("\", \"") + "\"")
	console.log("\tSeconds:      \"" + SECONDS.join("\", \"") + "\"")
	console.log("\tMilliseconds: \"" + MILLISECONDS.join("\", \"") + "\"")
	console.log()
}

function parseResultFormat(args) {
	if (args[args.length - 1] == "to") throwError("provide a valid format for the result")

	if (args[args.length - 2] == "to") {
		let givenFormat = args[args.length - 1]
		const lastOperation = args[args.length - 4]

		if (COMPARE_OPERATORS.includes(lastOperation)) throwError("a comparison operator return a boolean value that cannot be converted to " + givenFormat)

		if (DIFF_OPERATORS.includes(lastOperation)) {
			if (!ALL_UNITS.includes(givenFormat)) throwError("an absolute value cannot be formatted as " + `"${givenFormat}"`)
			if (YEARS.includes(givenFormat)) givenFormat = YEARS[0]
			if (MONTHS.includes(givenFormat)) givenFormat = MONTHS[0]
			if (WEEKS.includes(givenFormat)) givenFormat = WEEKS[0]
			if (DAYS.includes(givenFormat)) givenFormat = DAYS[0]
			if (HOURS.includes(givenFormat)) givenFormat = HOURS[0]
			if (MINUTES.includes(givenFormat)) givenFormat = MINUTES[0]
			if (SECONDS.includes(givenFormat)) givenFormat = SECONDS[0]
			if (MILLISECONDS.includes(givenFormat)) givenFormat = MILLISECONDS[0]
		}

		resultFormat = givenFormat

		args.pop()
		args.pop()
		return args
	} else return args
}