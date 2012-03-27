from ..schema import EBMLDocument, UnknownElement, CONTAINER, BINARY


def dump_element(element, indent=0):
	if isinstance(element, UnknownElement):
		print(('\t' * indent) + ('<Unknown id=\'%s\' bytes=\'%i\' />' % (hex(element.id), element.body_size)))
	else:
		sargs = {
			'name': element.name,
			'bytes': element.body_size,
			'value': element.value
		}
		def print_indented(foo):
			print(('\t' * indent) + foo)
		if element.type == CONTAINER:
			print_indented('<%(name)s>' % sargs)
			for sub_el in element.value:
				dump_element(sub_el, indent + 1)
			print_indented('</%(name)s>' % sargs)
		elif element.type == BINARY:
			print_indented('<%(name)s bytes=\'%(bytes)i\' />' % sargs)
		else:
			print_indented('<%(name)s>%(value)s</%(name)s>' % sargs)


def dump_document(document):
	for el in document.roots:
		dump_element(el)


if __name__ == '__main__':
	import sys
	from optparse import OptionParser
	
	parser = OptionParser(usage='Usage: %prog [OPTION] FILE')
	parser.add_option('--document-class', dest='document_class', help='the document class to use', metavar='CLASS')
	options, args = parser.parse_args()
	
	if options.document_class is None:
		class doc_cls(EBMLDocument):
			type = None
			version = None
	else:
		mod_name, _, cls_name = options.document_class.rpartition('.')
		try:
			doc_mod = __import__(mod_name, fromlist=[cls_name])
			doc_cls = getattr(doc_mod, cls_name)
		except ImportError:
			parser.error('unable to import module %s' % mod_name)
		except AttributeError:
			parser.error('unable to import class %s from %s' % (cls_name, mod_name))
	
	if not args:
		parser.error('no file provided')
	elif len(args) > 1:
		parser.error('more than one file provided')
	
	with open(args[0], 'rb') as stream:
		doc = doc_cls(stream)
		dump_document(doc)