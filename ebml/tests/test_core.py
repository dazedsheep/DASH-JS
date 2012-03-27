import unittest
try:
	from cStringIO import StringIO
except ImportError:
	from StringIO import StringIO
import random
import sys
from ..core import *


class ElementSizeTests(unittest.TestCase):
	def assert_roundtrip(self, value, length=None):
		encoded = encode_element_size(value, length=length)
		if length is not None:
			self.assertEqual(length, len(encoded))
		encoded_stream = StringIO(encoded)
		self.assertEqual(value, read_element_size(encoded_stream)[0])
	
	def test_unknown(self):
		for length in xrange(1, 9):
			self.assert_roundtrip(None, length=length)
	
	def test_base_10(self):
		for value in (10**exp for exp in xrange(1, 16)):
			self.assert_roundtrip(value)
	
	def test_base_2(self):
		for value in (2**exp for exp in xrange(1, 56)):
			self.assert_roundtrip(value)
	
	def test_max_base_2(self):
		for value in ((2**exp) - 2 for exp in xrange(1, 57)):
			self.assert_roundtrip(value)
	
	def test_random(self):
		maximum = 2**56 - 2
		for value in (random.randint(0, maximum) for i in xrange(0, 10000)):
			self.assert_roundtrip(value)


class ElementIDTests(unittest.TestCase):
	ebml_ids = (
		0x1a45dfa3,
		0x4286,
		0x42f7,
		0x42f2,
		0x42f3,
		0x4282,
		0x4287,
		0x4285,
		0xbf,
		0xec
	)
	
	def assert_roundtrip(self, value):
		encoded = encode_element_id(value)
		encoded_stream = StringIO(encoded)
		self.assertEqual(value, read_element_id(encoded_stream)[0])
	
	def test_ebml_ids(self):
		for id_ in self.ebml_ids:
			self.assert_roundtrip(id_)


class ValueTestCase(unittest.TestCase):
	encoder = None
	reader = None
	
	def assert_roundtrip(self, value, length=None):
		if self.encoder is not None and self.reader is not None:
			encoded = self.encoder(value, length)
			if length is not None:
				self.assertEqual(length, len(encoded))
			encoded_stream = StringIO(encoded)
			self.assertEqual(value, self.reader(encoded_stream, len(encoded)))
		else:
			raise NotImplementedError


class UnsignedIntegerTests(ValueTestCase):
	encoder = staticmethod(encode_unsigned_integer)
	reader = staticmethod(read_unsigned_integer)
	maximum = 2**64 - 1
	
	def test_random(self):
		for value in (random.randint(0, self.maximum) for i in xrange(0, 10000)):
			self.assert_roundtrip(value)
	
	def test_random_longer(self):
		for value in (random.randint(0, (self.maximum / (2**32))) for i in xrange(0, 10000)):
			self.assert_roundtrip(value, length=8)
	
	def test_maximum(self):
		self.assert_roundtrip(self.maximum)


class SignedIntegerTests(ValueTestCase):
	encoder = staticmethod(encode_signed_integer)
	reader = staticmethod(read_signed_integer)
	minimum = -(2**63)
	maximum = (2**63) - 1
	
	def test_random(self):
		for value in (random.randint(self.minimum, self.maximum) for i in xrange(0, 10000)):
			self.assert_roundtrip(value)
	
	def test_random_longer(self):
		for value in (random.randint((self.minimum / (2**32)), (self.maximum / (2**32))) for i in xrange(0, 10000)):
			self.assert_roundtrip(value, length=8)
	
	def test_minimum(self):
		self.assert_roundtrip(self.minimum)
	
	def test_maximum(self):
		self.assert_roundtrip(self.maximum)


class FloatTests(ValueTestCase):
	# Note:
	# I'm not sure if this is a good idea, due to the potential for loss of precision.
	# It seems that, at least with my installation of Python, floats are 64-bit IEEE, and so, for now, this works.
	
	encoder = staticmethod(encode_float)
	reader = staticmethod(read_float)
	
	def test_random(self):
		for value in (random.uniform(1.0, float(random.randint(2, 2**10))) for i in xrange(0, 1000)):
			self.assert_roundtrip(value)


class StringTests(ValueTestCase):
	encoder = staticmethod(encode_string)
	reader = staticmethod(read_string)
	letters = ''.join(chr(i) for i in xrange(1, 127))
	
	def test_random(self):
		for length in (random.randint(0, 2**10) for i in xrange(0, 1000)):
			astring = ''.join(random.sample(self.letters * ((length // len(self.letters)) + 1), length))
			self.assert_roundtrip(astring)
			self.assert_roundtrip(astring, length=length*2)


class UnicodeStringTests(ValueTestCase):
	encoder = staticmethod(encode_unicode_string)
	reader = staticmethod(read_unicode_string)
	letters = u''.join(unichr(i) for i in xrange(1, sys.maxunicode + 1))
	
	def test_random(self):
		for length in (random.randint(0, 2**10) for i in xrange(0, 1000)):
			ustring = u''.join(random.sample(self.letters * ((length // len(self.letters)) + 1), length))
			ustring = ustring.encode('utf_8').decode('utf_8')
			self.assert_roundtrip(ustring)
			self.assert_roundtrip(ustring, length=length*5)


class DateTests(ValueTestCase):
	encoder = staticmethod(encode_date)
	reader = staticmethod(read_date)
	
	def test_random(self):
		pass


if __name__ == '__main__':
	unittest.main()