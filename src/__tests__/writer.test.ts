import { describe, expect, it } from "bun:test"
import { NanoBufWriter } from "../writer.js"

describe("NanoBuf writer", () => {
	it("should write the given type id in little endian format at the beginning of the buffer", () => {
		const writer = new NanoBufWriter(4)
		writer.writeTypeId(4)
		expect([...writer.bytes]).toEqual([4, 0, 0, 0])
	})

	it("should write the given type id in little endian format at the given offset", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(3)
		writer.writeTypeId(4, 4)
		expect([...writer.bytes]).toEqual([3, 0, 0, 0, 4, 0, 0, 0])
	})

	it("should write the given size of a field at the correct position in the buffer in little endian format", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(1)
		writer.writeFieldSize(0, 8)
		expect([...writer.bytes]).toEqual([1, 0, 0, 0, 8, 0, 0, 0])
	})

	it("should write the given size of a field at the given offset in the buffer in little endian format", () => {
		const writer = new NanoBufWriter(12)
		writer.writeTypeId(4)
		writer.writeFieldSize(0, 12)
		writer.writeFieldSize(0, 10, 4)
		expect([...writer.bytes]).toEqual([4, 0, 0, 0, 12, 0, 0, 0, 10, 0, 0, 0])
	})

	it("should append the given boolean to the end of the buffer", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(4)
		writer.writeFieldSize(0, 1)

		writer.appendBoolean(true)
		expect([...writer.bytes]).toEqual([4, 0, 0, 0, 1, 0, 0, 0, 1])

		writer.appendBoolean(false)
		expect([...writer.bytes]).toEqual([4, 0, 0, 0, 1, 0, 0, 0, 1, 0])
	})

	it("should append the given int8 to the end of the buffer", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(10)
		writer.writeFieldSize(0, 1)

		writer.appendInt8(78)
		expect([...writer.bytes]).toEqual([10, 0, 0, 0, 1, 0, 0, 0, 78])

		writer.appendInt8(-45)
		expect([...writer.bytes]).toEqual([10, 0, 0, 0, 1, 0, 0, 0, 78, 0xd3])
	})

	it("should append the given uint8 to the end of the buffer", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(10)
		writer.writeFieldSize(0, 1)

		writer.appendUint8(78)
		expect([...writer.bytes]).toEqual([10, 0, 0, 0, 1, 0, 0, 0, 78])

		writer.appendUint8(211)
		expect([...writer.bytes]).toEqual([10, 0, 0, 0, 1, 0, 0, 0, 78, 211])
	})

	it("should append the given int32 to the end of the buffer in little endian format", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, -1)

		writer.appendInt32(2345)
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 41, 9, 0, 0,
		])

		writer.appendInt32(-128)
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 41, 9, 0, 0, 128, 255, 255, 255,
		])
	})

	it("should append the given uint32 to the end of the buffer in little endian format", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, -1)

		writer.appendUint32(2345)
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 41, 9, 0, 0,
		])

		writer.appendInt32(4294967295)
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 41, 9, 0, 0, 255, 255, 255, 255,
		])
	})

	it("should append the given int64 to the end of the buffer in little endian format", () => {
		const writer = new NanoBufWriter(0)
		writer.appendInt64(12345678901234567890n)
		expect([...writer.bytes]).toEqual([
			0xd2, 0x0a, 0x1f, 0xeb, 0x8c, 0xa9, 0x54, 0xab,
		])
		writer.appendInt64(-92132131589n)
		expect([...writer.bytes]).toEqual([
			0xd2, 0x0a, 0x1f, 0xeb, 0x8c, 0xa9, 0x54, 0xab, 0xfb, 0x3c, 0x7f, 0x8c,
			0xea, 0xff, 0xff, 0xff,
		])
	})

	it("should append the given uint64 to the end of the buffer in little endian format", () => {
		const writer = new NanoBufWriter(0)
		writer.appendInt64(18446744073709551615n)
		expect([...writer.bytes]).toEqual([
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		])
	})

	it("should append the given double to the end of the buffer in little endian format", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, -1)

		writer.appendDouble(9.8)
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 0x9a, 0x99, 0x99, 0x99, 0x99, 0x99, 0x23,
			0x40,
		])
	})

	it("should append the given string to the end of the buffer in UTF-8", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, -1)

		const bytesWritten = writer.appendString("hello world")
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77,
			0x6f, 0x72, 0x6c, 0x64,
		])
		expect(bytesWritten).toEqual(11)
	})

	it("should append the given string and its byte length to the end of the buffer in UTF-8", () => {
		const writer = new NanoBufWriter(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, -1)

		const bytesWritten = writer.appendStringAndSize("hello world")
		expect([...writer.bytes]).toEqual([
			8, 0, 0, 0, 255, 255, 255, 255, 11, 0, 0, 0, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
			0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64,
		])
		expect(bytesWritten).toEqual(11)
	})

	it("should append the given bytes to the end of the buffer", () => {
		const writer = new NanoBufWriter(0)
		writer.appendInt8(1)
		const bytes = new Uint8Array([8, 0, 0, 0, 255, 255, 255, 255, 0x9a, 0x99])
		writer.appendBytes(bytes)
		expect([...writer.bytes]).toEqual([
			1, 8, 0, 0, 0, 255, 255, 255, 255, 0x9a, 0x99,
		])
	})

	it("should expose the current number of bytes in the writer buffer", () => {
		const writer = new NanoBufWriter(8)
		expect(writer.currentSize).toEqual(8)
		writer.writeTypeId(8)
		writer.writeFieldSize(0, 4)
		writer.appendInt32(123)
		expect(writer.currentSize).toEqual(12)
	})

	it("should allocate more bytes when asked", () => {
		const writer = new NanoBufWriter(8)
		expect(writer.bytes.length).toEqual(8)
		writer.allocMore(10)
		expect(writer.bytes.length).toEqual(18)
	})
})
