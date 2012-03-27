from .base import *


class CRC32Element(Element):
	id = 0xBF
	name = 'CRC-32'
	type = BINARY


class VoidElement(Element):
	id = 0xEC
	name = 'Void'
	type = BINARY


class SignatureAlgoElement(Element):
	id = 0x7E8A
	name = 'SignatureAlgo'
	type = UINT
	multiple = True


class SignatureHashElement(Element):
	id = 0x7E9A
	name = 'SignatureHash'
	type = UINT


class SignaturePublicKeyElement(Element):
	id = 0x7EA5
	name = 'SignaturePublicKey'
	type = BINARY


class SignatureElement(Element):
	id = 0x7EB5
	name = 'Signature'
	type = BINARY


class SignedElementElement(Element):
	id = 0x6532
	name = 'SignedElement'
	type = BINARY


class SignatureElementListElement(Element):
	id = 0x7E7B
	name = 'SignatureElementList'
	children = (SignedElementElement,)
	type = CONTAINER
	multiple = True


class SignatureElementsElement(Element):
	id = 0x7E5B
	name = 'SignatureElements'
	children = (SignatureElementListElement)
	type = CONTAINER


class SignatureSlotElement(Element):
	id = 0x1B538667
	name = 'SignatureSlot'
	children = (SignatureAlgoElement, SignatureHashElement, SignaturePublicKeyElement, SignatureElement, SignatureElementsElement)
	type = CONTAINER


class EBMLVersionElement(Element):
	id = 0x4286
	name = 'EBMLVersion'
	type = UINT
	mandatory = True
	default = 1


class EBMLReadVersionElement(Element):
	id = 0x42F7
	name = 'EBMLReadVersion'
	type = UINT
	mandatory = True
	default = 1


class EBMLMaxIDLengthElement(Element):
	id = 0x42F2
	name = 'EBMLMaxIDLength'
	type = UINT
	mandatory = True
	default = 4


class EBMLMaxSizeLengthElement(Element):
	id = 0x42F3
	name = 'EBMLMaxSizeLength'
	type = UINT
	mandatory = True
	default = 8


class DocTypeElement(Element):
	id = 0x4282
	name = 'DocType'
	type = STRING
	mandatory = True


class DocTypeVersionElement(Element):
	id = 0x4287
	name = 'DocTypeVersion'
	type = UINT
	mandatory = True


class DocTypeReadVersionElement(Element):
	id = 0x4285
	name = 'DocTypeReadVersion'
	type = UINT
	mandatory = True


class EBMLElement(Element):
	id = 0x1A45DFA3
	name = 'EBML'
	type = CONTAINER
	children = (EBMLVersionElement, EBMLReadVersionElement, EBMLMaxIDLengthElement, EBMLMaxSizeLengthElement, DocTypeElement, DocTypeVersionElement, DocTypeReadVersionElement)
	mandatory = True
	multiple = True


class EBMLDocument(Document):
	children = (EBMLElement,)
	globals = (CRC32Element, VoidElement, SignatureSlotElement)