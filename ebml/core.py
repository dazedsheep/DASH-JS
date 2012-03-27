import datetime
import struct


__all__ = (
	'read_element_id',
	'read_element_size',
	'read_unsigned_integer',
	'read_signed_integer',
	'read_float',
	'read_string',
	'read_unicode_string',
	'read_date',
	'encode_element_id',
	'encode_element_size',
	'encode_unsigned_integer',
	'encode_signed_integer',
	'encode_float',
	'encode_string',
	'encode_unicode_string',
	'encode_date',
)


MAXIMUM_ELEMENT_ID_LENGTH = 4
MAXIMUM_ELEMENT_SIZE_LENGTH = 8
MAXIMUM_UNSIGNED_INTEGER_LENGTH = 8
MAXIMUM_SIGNED_INTEGER_LENGTH = 8


def maximum_element_size_for_length(length):
	"""
	
	Returns the maximum element size representable in a given number of bytes.
	
	:arg length: the limit on the length of the encoded representation in bytes
	:type length: int
	:returns: the maximum element size representable
	:rtype: int
	
	"""
	
	return (2**(7*length)) - 2


def decode_vint_length(byte, mask=True):
	length = None
	value_mask = None
	for n in xrange(1, 9):
		if byte & (2**8 - (2**(8 - n))) == 2**(8 - n):
			length = n
			value_mask = (2**(8 - n)) - 1
			break
	if length is None:
		raise IOError('Cannot decode invalid varible-length integer.')
	if mask:
		byte = byte & value_mask
	return length, byte


def read_element_id(stream):
	"""
	
	Reads an element ID from a file-like object.
	
	:arg stream: the file-like object
	:returns: the decoded element ID and its length in bytes
	:rtype: tuple
	
	"""
	
	byte = ord(stream.read(1))
	length, id_ = decode_vint_length(byte, False)
	if length > 4:
		raise IOError('Cannot decode element ID with length > 8.')
	for i in xrange(0, length - 1):
		byte = ord(stream.read(1))
		id_ = (id_ * 2**8) + byte
	return id_, length


def read_element_size(stream):
	"""
	
	Reads an element size from a file-like object.
	
	:arg stream: the file-like object
	:returns: the decoded size (or None if unknown) and the length of the descriptor in bytes
	:rtype: tuple
	
	"""
	
	byte = ord(stream.read(1))
	length, size = decode_vint_length(byte)
	
	for i in xrange(0, length - 1):
		byte = ord(stream.read(1))
		size = (size * 2**8) + byte
	
	if size == maximum_element_size_for_length(length) + 1:
		size = None
	
	return size, length


def read_unsigned_integer(stream, size):
	"""
	
	Reads an encoded unsigned integer value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode
	:type size: int
	:returns: the decoded unsigned integer value
	:rtype: int
	
	"""
	
	value = 0
	for i in xrange(0, size):
		byte = ord(stream.read(1))
		value = (value << 8) | byte
	return value


def read_signed_integer(stream, size):
	"""
	
	Reads an encoded signed integer value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode
	:type size: int
	:returns: the decoded signed integer value
	:rtype: int
	
	"""
	
	value = 0
	if size > 0:
		first_byte = ord(stream.read(1))
		value = first_byte
		for i in xrange(1, size):
			byte = ord(stream.read(1))
			value = (value << 8) | byte
		if (first_byte & 0b10000000) == 0b10000000:
			value = -(2**(size*8) - value)
	return value


def read_float(stream, size):
	"""
	
	Reads an encoded floating point value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode (must be 0, 4, or 8)
	:type size: int
	:returns: the decoded floating point value
	:rtype: float
	
	"""
	
	if size not in (0, 4, 8):
		raise IOError('Cannot read floating point values with lengths other than 0, 4, or 8 bytes.')
	value = 0.0
	if size in (4, 8):
		data = stream.read(size)
		value = struct.unpack({
			4: '>f',
			8: '>d'
		}[size], data)[0]
	return value


def read_string(stream, size):
	"""
	
	Reads an encoded ASCII string value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode
	:type size: int
	:returns: the decoded ASCII string value
	:rtype: str
	
	"""
	
	value = ''
	if size > 0:
		value = stream.read(size)
		value = value.partition(chr(0))[0]
	return value


def read_unicode_string(stream, size):
	"""
	
	Reads an encoded unicode string value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode
	:type size: int
	:returns: the decoded unicode string value
	:rtype: unicode
	
	"""
	
	value = u''
	if size > 0:
		data = stream.read(size)
		data = data.partition(chr(0))[0]
		value = unicode(data, 'utf_8')
	return value


def read_date(stream, size):
	"""
	
	Reads an encoded date (and time) value from a file-like object.
	
	:arg stream: the file-like object
	:arg size: the number of bytes to read and decode (must be 8)
	:type size: int
	:returns: the decoded date (and time) value
	:rtype: datetime
	
	"""
	
	if size != 8:
		raise IOError('Cannot read date values with lengths other than 8 bytes.')
	data = stream.read(size)
	nanoseconds = struct.unpack('>q', data)[0]
	delta = datetime.timedelta(microseconds=(nanoseconds // 1000))
	return datetime.datetime(2001, 1, 1, tzinfo=None) + delta


def octet(n):
	"""
	
	Limits an integer or byte to 8 bits.
	
	"""
	
	return n & 0b11111111


def vint_mask_for_length(length):
	"""
	
	Returns the bitmask for the first byte of a variable-length integer (used for element ID and size descriptors).
	
	:arg length: the length of the variable-length integer
	:type length: int
	:returns: the bitmask for the first byte of the variable-length integer
	:rtype: int
	
	"""
	
	return 0b10000000 >> (length - 1)


def encode_element_id(element_id):
	"""
	
	Encodes an element ID.
	
	:arg element_id: an element ID
	:type element_id: int
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	length = MAXIMUM_ELEMENT_ID_LENGTH
	while length and not (element_id & (vint_mask_for_length(length) << ((length - 1) * 8))):
		length -= 1
	if not length:
		raise ValueError('Cannot encode invalid element ID %s.' % hex(element_id))
	
	data = bytearray(length)
	for index in reversed(xrange(length)):
		data[index] = octet(element_id)
		element_id >>= 8
	
	return data


def encode_element_size(element_size, length=None):
	"""
	
	Encodes an element size. If element_size is None, the size will be encoded as unknown. If length is not None, the size will be encoded in that many bytes; otherwise, the size will be encoded in the minimum number of bytes required, or in 8 bytes if the size is unknown (element_size is None).
	
	:arg element_size: the element size, or None if unknown
	:type element_size: int or None
	:arg length: the length of the encoded representation, or None for the minimum length required (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if length is not None and (length < 1 or length > MAXIMUM_ELEMENT_SIZE_LENGTH):
		raise ValueError('Cannot encode element sizes into representations shorter than one byte long or longer than %i bytes long.' % MAXIMUM_ELEMENT_SIZE_LENGTH)
	if element_size is not None:
		if element_size > maximum_element_size_for_length(MAXIMUM_ELEMENT_SIZE_LENGTH if length is None else length):
			raise ValueError('Cannot encode element size %i as it would have an encoded representation longer than %i bytes.' % (element_size, (MAXIMUM_ELEMENT_SIZE_LENGTH if length is None else length)))
		req_length = 1
		while (element_size >> ((req_length - 1) * 8)) >= (vint_mask_for_length(req_length) - 1) and req_length < MAXIMUM_ELEMENT_SIZE_LENGTH:
			req_length += 1
		if length is None:
			length = req_length
	else:
		if length is None:
			length = 8 # other libraries do this, so unless another length is specified for the unknown size descriptor, do as they do to avoid compatibility issues.
		element_size = maximum_element_size_for_length(length) + 1
	
	data = bytearray(length)
	for index in reversed(xrange(length)):
		data[index] = octet(element_size)
		element_size >>= 8
		if not index:
			data[index] = data[index] | vint_mask_for_length(length)
	
	return data


def encode_unsigned_integer(uint, length=None):
	"""
	
	Encodes an unsigned integer value. If length is not None, uint will be encoded in that many bytes; otherwise, uint will be encoded in the minimum number of bytes required. If uint is None or 0, the minimum number of bytes required is 0.
	
	:arg uint: the unsigned integer value
	:type uint: int
	:arg length: the length of the encoded representation, or None for the minimum length required (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if uint is None:
		uint = 0
	if uint > ((2**((MAXIMUM_UNSIGNED_INTEGER_LENGTH if length is None else length) * 8)) - 1):
		raise ValueError('Cannot encode unsigned integer value %i as it would have an encoded representation longer than %i bytes.' % (uint, (MAXIMUM_UNSIGNED_INTEGER_LENGTH if length is None else length)))
	elif uint == 0:
		req_length = 0
	else:
		req_length = 1
		while uint >= (1 << (req_length * 8)) and req_length < MAXIMUM_UNSIGNED_INTEGER_LENGTH:
			req_length += 1
	if length is None:
		length = req_length
	
	data = bytearray(length)
	for index in reversed(xrange(length)):
		data[index] = octet(uint)
		uint >>= 8
	
	return data


def encode_signed_integer(sint, length=None):
	"""
	
	Encodes a signed integer value. If length is not None, sint will be encoded in that many bytes; otherwise, sint will be encoded in the minimum number of bytes required. If sint is None or 0, the minimum number of bytes required is 0.
	
	:arg sint: the signed integer value
	:type sint: int
	:arg length: the length of the encoded representation, or None for the minimum length required (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if sint is None:
		sint = 0
	if not (-(2**(7+(8*((MAXIMUM_SIGNED_INTEGER_LENGTH if length is None else length)-1)))) <= sint <= (2**(7+(8*((MAXIMUM_SIGNED_INTEGER_LENGTH if length is None else length)-1))))-1):
		raise ValueError('Cannot encode signed integer value %i as it would have an encoded representation longer than %i bytes.' % (sint, (MAXIMUM_SIGNED_INTEGER_LENGTH if length is None else length)))
	elif sint == 0:
		req_length = 0
		uint = 0
		if length is None:
			length = req_length
	else:
		uint = ((-sint - 1) << 1) if sint < 0 else (sint << 1)
		req_length = 1
		while uint >= (1 << (req_length * 8)) and req_length < MAXIMUM_UNSIGNED_INTEGER_LENGTH:
			req_length += 1
		if length is None:
			length = req_length
		if sint >= 0:
			uint = sint
		else:
			uint = 2**(length*8) - abs(sint)
	
	data = bytearray(length)
	for index in reversed(xrange(length)):
		data[index] = octet(uint)
		uint >>= 8
	
	return data


def encode_float(float_, length=None):
	"""
	
	Encodes a floating point value. If length is not None, float_ will be encoded in that many bytes; otherwise, float_ will be encoded in 0 bytes if float_ is None or 0, and 8 bytes in all other cases. If float_ is not None or 0 and length is 0, ValueError will be raised.
	
	:arg float_: the floating point value
	:type float_: float
	:arg length: the length of the encoded representation, or None (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if length not in (None, 0, 4, 8):
		raise ValueError('Cannot encode floating point values with lengths other than 0, 4, or 8 bytes.')
	if float_ is None:
		float_ = 0.0
	if float_ == 0.0:
		if length is None:
			length = 0
	else:
		if length is None:
			length = 8
		elif length == 0:
			raise ValueError('Cannot encode floating point value %f as it would have an encoded representation longer than 0 bytes.' % float_)
	
	if length in (4, 8):
		data = bytearray(struct.pack({
			4: '>f',
			8: '>d'
		}[length], float_))
	else:
		data = bytearray()
	
	return data


def encode_string(string, length=None):
	"""
	
	Encodes an ASCII string value. If length is not None, string will be encoded in that many bytes by padding with zero bytes at the end if necessary; otherwise, string will be encoded in the minimum number of bytes required. If string is None or empty, the minimum number of bytes required is 0.
	
	:arg string: the ASCII string value
	:type string: str
	:arg length: the length of the encoded representation, or None for the minimum length required (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if string is None:
		string = ''
	if length is None:
		length = len(string)
	else:
		if length < len(string):
			raise ValueError('Cannot encode ASCII string value \'%s\' as it would have an encoded representation longer than %i bytes.' % (string, length))
		elif length > len(string):
			for i in xrange(0, (length - len(string))):
				string += chr(0)
	
	return bytearray(string)


def encode_unicode_string(string, length=None):
	"""
	
	Encodes a unicode string value. If length is not None, string will be encoded in that many bytes by padding with zero bytes at the end if necessary; otherwise, string will be encoded in the minimum number of bytes required. If string is None or empty, the minimum number of bytes required is 0.
	
	:arg string: the unicode string value
	:type string: unicode
	:arg length: the length of the encoded representation, or None for the minimum length required (defaults to None)
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if string is None:
		string = u''
	return encode_string(string.encode('utf_8'), length)


def encode_date(date, length=None):
	"""
	
	Encodes a date (and time) value. If length is not None, it must be 8. If date is None, the current date (and time) will be encoded.
	
	:arg date: the date (and time) value
	:type date: datetime.datettime
	:arg length: the length of the encoded representation (must be 8), or None
	:type length: int or None
	:returns: the encoded representation bytes
	:rtype: bytearray
	
	"""
	
	if date is None:
		date = datetime.datetime.utcnow()
	else:
		date = (date - date.utcoffset()).replace(tzinfo=None)
	if length is None:
		length = 8
	elif length != 8:
		raise ValueError('Cannot encode date value %s with any length other than 8 bytes.')
	
	delta = date - datetime.datetime(2001, 1, 1, tzinfo=None)
	nanoseconds = (delta.microseconds + ((delta.seconds + (delta.days * 24 * 60 * 60)) * 10**6)) * 10**3
	return encode_signed_integer(nanoseconds, length)
