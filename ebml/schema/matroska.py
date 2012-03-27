import os.path
from .specs import parse_specdata


_Elements, MatroskaDocument = parse_specdata(os.path.join(os.path.dirname(__file__), 'matroska.xml'), 'MatroskaDocument', 'matroska', 1)


for name, element in _Elements.iteritems():
	globals()[name] = element