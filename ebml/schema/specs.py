from xml.etree.ElementTree import parse as parse_xml
from .base import INT, UINT, FLOAT, STRING, UNICODE, DATE, BINARY, CONTAINER, Element, Document


SPECDATA_TYPES = {
	'integer': INT,
	'uinteger': UINT,
	'float': FLOAT,
	'string': STRING,
	'utf-8': UNICODE,
	'date': DATE,
	'binary': BINARY,
	'master': CONTAINER
}


def parse_specdata(source, doc_name, doc_type, doc_version):
	"""
	
	Reads a schema specification from a file (e.g., specdata.xml) or file-like object, and returns a tuple containing:
	
		* a mapping of class names to Element subclasses
		* a Document subclass
	
	:arg source: the file or file-like object
	:type source: str or file-like object
	:arg schema_name: the name of the schema
	:type schema_name: str
	:returns: tuple
	
	"""
	
	tree = parse_xml(source)
	elements = {}
	globals = []
	
	def child_elements(parent_level, element_list, upper_recursive=None):
		children = []
		while element_list:
			raw_element = element_list[0]
			raw_attrs = raw_element.attrib
			
			element_level = int(raw_attrs['level'])
			
			is_global = False
			if element_level == -1:
				is_global = True
			elif parent_level is not None and not element_level > parent_level:
				break
			element_list = element_list[1:]

			element_name = '%sElement' % raw_attrs.get('cppname', raw_attrs.get('name')).translate(None, '-')
			element_attrs = {
				'__module__': None,
				'id': int(raw_attrs['id'], 0),
				'name': raw_attrs['name'],
				'type': SPECDATA_TYPES[raw_attrs['type']],
				'mandatory': True if raw_attrs.get('mandatory', False) == '1' else False,
				'multiple': True if raw_attrs.get('multiple', False) == '1' else False
			}
			try:
				element_attrs['default'] = {
					INT: lambda default: int(default),
					UINT: lambda default: int(default),
					FLOAT: lambda default: float(default),
					STRING: lambda default: str(default),
					UNICODE: lambda default: unicode(default)
				}.get(element_attrs['type'], lambda default: default)(raw_attrs['default'])
			except (KeyError, ValueError):
				element_attrs['default'] = None
			
			element = type(element_name, (Element,), element_attrs)
			elements[element_name] = element
			
			recursive = []
			if upper_recursive:
				recursive.extend(upper_recursive)
			if raw_attrs.get('recursive', False) == '1':
				recursive.append(element)
			
			element_children, element_list = child_elements(element_level if not is_global else 0, element_list, recursive)
			element_children += tuple(recursive)
			element.children = element_children
			
			if is_global:
				globals.append(element)
			else:
				children.append(element)
		return tuple(children), element_list
	
	children = child_elements(None, tree.getroot().getchildren())[0]
	
	document_attrs = {
		'__module__': None,
		'type': doc_type,
		'version': doc_version,
		'children': children,
		'globals': tuple(globals)
	}
	document = type(doc_name, (Document,), document_attrs)
	
	return elements, document